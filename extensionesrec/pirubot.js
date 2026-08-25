/**
 * TurboWarp / Scratch 3 Custom Extension — PIRUBOT v2.0
 * Extensión unsandboxed con overlay DOM (D-Pad arrastrable + Visor de secuencia + Grilla fija).
 * Sprite objetivo: 'Piru' (Piru.sprite3 en carpeta extensionesrec/ o extensiones/).
 * Tablero: 6 columnas x 4 filas, celdas 80x80 px. Cinemática tipo Bee-Bot.
 */
(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Pirubot debe ejecutarse sin sandbox (unsandboxed) para acceder al DOM y al VM.');
  }

  // ── Constantes de grilla ────────────────────────────────────────────────
  const GRID_COLS = 6;
  const GRID_ROWS = 4;
  const CELL_SIZE = 80;
  const ORIGIN_X  = -200;
  const ORIGIN_Y  = 120;
  const STEP_MS   = 400;
  const CANVAS_W  = 480;
  const CANVAS_H  = 360;

  // Líneas fijas de la grilla (coordenadas de canvas, no de Scratch)
  const GRID_LINES_X = [0, 80, 160, 240, 320, 400, 480];
  const GRID_LINES_Y = [20, 100, 180, 260, 340];

  // HOME: col=2, fila=3, dir=0 → X=-40, Y=-120 (fila inferior, centro del tablero)
  const HOME_COL  = 2;
  const HOME_FILA = 3;
  const HOME_X    = -40;
  const HOME_Y    = -120;
  const HOME_DIR  = 0;

  // Conversión matricial → píxeles Scratch
  function colToX(col)   { return ORIGIN_X + (col * CELL_SIZE); }
  function filaToY(fila) { return ORIGIN_Y - (fila * CELL_SIZE); }

  // ── Estado interno ──────────────────────────────────────────────────────
  let commandQueue = [];
  let isRunning    = false;
  let currentCol   = HOME_COL;
  let currentFila  = HOME_FILA;
  let currentDir   = HOME_DIR;
  let currentLevel = 1; // 1 = Traslación pura (5-6 años) · 2 = Orientación/giros (7+ años)

  // ── Audio (alerta de borde) ─────────────────────────────────────────────
  let audioCtx = null;
  function getAudio() {
    return audioCtx || (audioCtx = new (window.AudioContext || window.webkitAudioContext)());
  }
  function playAlertTone() {
    try {
      const ac   = getAudio();
      const osc  = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'square';
      osc.frequency.value = 200;
      gain.gain.value = 0.15;
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
      osc.stop(ac.currentTime + 0.3);
    } catch (e) { /* noop */ }
  }

  // ── VM Target: buscar sprite 'Piru' ─────────────────────────────────────
  function getTarget() {
    const vm = Scratch.vm;
    if (!vm || !vm.runtime || !vm.runtime.targets) return null;

    // Buscar sprite por nombre exacto 'Piru'
    for (const t of vm.runtime.targets) {
      if (t && typeof t.getName === 'function' && t.getName() === 'Piru') return t;
    }

    // Fallback: primer sprite activo que no sea escenario
    for (const t of vm.runtime.targets) {
      if (t && !t.isStage && t.visible) return t;
    }

    return null;
  }

  // ── Limpieza del escenario: elimina todos los sprites excepto el Stage ──
  async function cleanStage() {
    const vm = Scratch.vm;
    if (!vm || !vm.runtime || !vm.runtime.targets) return;

    const toRemove = vm.runtime.targets.filter(function (t) {
      return t && !t.isStage && t.isOriginal;
    });

    for (const t of toRemove) {
      try {
        await vm.deleteSprite(t.id);
      } catch (e) { /* noop */ }
    }
  }

  // ── Selección del sprite activo (Piru o fallback) ───────────────────────
  function selectPiruAsActive() {
    const vm = Scratch.vm;
    if (!vm) return;
    const target = getTarget();
    if (target && typeof vm.setEditingTarget === 'function') {
      try { vm.setEditingTarget(target.id); } catch (e) { /* noop */ }
    }
  }

  // ── Precarga del sprite 'Piru' desde Piru.sprite3 ────────────────────────
  async function fetchSpriteBuffer(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('No se pudo cargar ' + url);
    return await res.arrayBuffer();
  }

  async function loadPiruSprite() {
    const vm = Scratch.vm;
    if (!vm) return;

    const candidatePaths = [
      'extensionesrec/Piru.sprite3',
      'extensiones/Piru.sprite3'
    ];

    for (const path of candidatePaths) {
      try {
        const buffer = await fetchSpriteBuffer(path);
        await vm.addSprite(buffer);
        selectPiruAsActive();
        return;
      } catch (e) { /* intenta la siguiente ruta */ }
    }

    // Fallback: no se pudo cargar Piru.sprite3, seleccionar sprite disponible
    selectPiruAsActive();
  }

  // ── Íconos de comandos (SVG ortogonales, sin curvas) ───────────────
  const ICON_TURN_RIGHT =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M 6 20 V 8 H 14 V 4 L 22 10 L 14 16 V 12 H 10 V 20 Z"/></svg>';
  const ICON_TURN_LEFT =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M 18 20 V 8 H 10 V 4 L 2 10 L 10 16 V 12 H 14 V 20 Z"/></svg>';

  const CMD_ICONS = {
    // Nivel 2 — modelo de orientación (rota sobre su eje)
    FWD:   '⬆️',
    BWD:   '⬇️',
    LEFT:  ICON_TURN_LEFT,
    RIGHT: ICON_TURN_RIGHT,
    // Nivel 1 — modelo de traslación pura (dir siempre 0°)
    L1_UP:    '▲',
    L1_DOWN:  '▼',
    L1_LEFT:  '◄',
    L1_RIGHT: '►'
  };

  // ── Canvas overlay de grilla (fija, permanente, sin toggle) ─────────────
  let gridCanvas = null;
  let gridCtx    = null;

  function findStageContainer() {
    const vm = Scratch.vm;
    if (vm && vm.runtime && vm.runtime.renderer && vm.runtime.renderer.canvas) {
      return vm.runtime.renderer.canvas.parentNode;
    }
    const sel = document.querySelector('[class*="stage-wrapper"], [class*="stageWrapper"]');
    if (sel) return sel;
    const canvas = document.querySelector('canvas');
    return canvas ? canvas.parentNode : null;
  }

  function injectGridCanvas() {
    if (gridCanvas) return;
    const container = findStageContainer();
    if (!container) {
      setTimeout(injectGridCanvas, 500);
      return;
    }

    const computed = window.getComputedStyle(container);
    if (computed.position === 'static') {
      container.style.position = 'relative';
    }

    gridCanvas = document.createElement('canvas');
    gridCanvas.id = 'pirubot-grid-canvas';
    gridCanvas.width = CANVAS_W;
    gridCanvas.height = CANVAS_H;
    gridCtx = gridCanvas.getContext('2d');

    container.appendChild(gridCanvas);
    drawGrid();
  }

  function drawGrid() {
    if (!gridCtx) return;
    gridCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    gridCtx.lineWidth = 2;
    gridCtx.strokeStyle = 'rgba(150, 150, 150, 0.5)';

    // Líneas verticales fijas
    GRID_LINES_X.forEach(function (x) {
      gridCtx.beginPath();
      gridCtx.moveTo(x, 0);
      gridCtx.lineTo(x, CANVAS_H);
      gridCtx.stroke();
    });

    // Líneas horizontales fijas
    GRID_LINES_Y.forEach(function (y) {
      gridCtx.beginPath();
      gridCtx.moveTo(0, y);
      gridCtx.lineTo(CANVAS_W, y);
      gridCtx.stroke();
    });
  }

  // ── Resize: redibujar al cambiar tamaño de ventana o Fullscreen ──────────
  window.addEventListener('resize', drawGrid);

  // ── Overlay DOM (CSS + HTML) ─────────────────────────────────────────────
  let overlayInjected = false;

  function injectOverlay() {
    if (overlayInjected) return;
    overlayInjected = true;

    // ── CSS aislado con prefijo pirubot- ──────────────────────────────
    const style = document.createElement('style');
    style.id = 'pirubot-css';
    style.textContent = [
      '#pirubot-sequence-viewer {',
      '  position: fixed; top: 12px; left: 50%; transform: translateX(-50%);',
      '  z-index: 99999; display: flex; align-items: center; gap: 6px;',
      '  background: rgba(30,30,40,0.92); border: 2px solid rgba(99,179,237,0.6);',
      '  border-radius: 12px; padding: 8px 14px; min-height: 48px;',
      '  max-width: 80vw; overflow-x: auto; box-shadow: 0 4px 16px rgba(0,0,0,0.4);',
      '  font-family: "Segoe UI", system-ui, sans-serif;',
      '}',
      '.pirubot-step-icon {',
      '  font-size: 22px; line-height: 1; padding: 4px 6px; border-radius: 6px;',
      '  background: rgba(255,255,255,0.08); transition: all 0.2s ease;',
      '  user-select: none;',
      '}',
      '.pirubot-step-icon.active-step {',
      '  background: rgba(99,179,237,0.5); transform: scale(1.3);',
      '  box-shadow: 0 0 12px rgba(99,179,237,0.8);',
      '}',
      '.pirubot-viewer-label {',
      '  color: #aaa; font-size: 12px; margin-right: 4px; white-space: nowrap;',
      '}',
      '.pirubot-viewer-empty {',
      '  color: #666; font-size: 13px; font-style: italic;',
      '}',
      '#pirubot-grid-canvas {',
      '  position: absolute; top: 0; left: 0; width: 100%; height: 100%;',
      '  pointer-events: none; z-index: 5;',
      '}',
      '#pirubot-dpad {',
      '  position: fixed; top: 120px; left: 100px; z-index: 99999;',
      '  display: grid; grid-template-columns: 52px 52px 52px;',
      '  grid-template-rows: 52px 52px 52px; gap: 6px;',
      '  background: rgba(30,30,40,0.92); border: 2px solid rgba(99,179,237,0.4);',
      '  border-radius: 16px; padding: 10px; box-shadow: 0 6px 24px rgba(0,0,0,0.5);',
      '  font-family: "Segoe UI", system-ui, sans-serif; cursor: grab; touch-action: none;',
      '}',
      '#pirubot-dpad.pirubot-dragging { cursor: grabbing; opacity: 0.85; }',
      '.pirubot-btn {',
      '  display: flex; align-items: center; justify-content: center;',
      '  border: none; border-radius: 10px; font-size: 22px; cursor: pointer;',
      '  user-select: none; transition: all 0.15s ease; color: #fff;',
      '  background: rgba(70,70,90,0.9);',
      '}',
      '.pirubot-btn:hover  { background: rgba(90,90,120,1); }',
      '.pirubot-btn:active { transform: scale(0.92); }',
      '.pirubot-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }',
      '.pirubot-btn-up    { grid-column: 2; grid-row: 1; }',
      '.pirubot-btn-left  { grid-column: 1; grid-row: 2; }',
      '.pirubot-btn-go    { grid-column: 2; grid-row: 2; background: rgba(34,197,94,0.85); font-size: 15px; font-weight: bold; }',
      '.pirubot-btn-go:hover { background: rgba(34,197,94,1); }',
      '.pirubot-btn-right { grid-column: 3; grid-row: 2; }',
      '.pirubot-btn-down  { grid-column: 2; grid-row: 3; }',
      '.pirubot-btn-clear { grid-column: 1; grid-row: 3; font-size: 18px; background: rgba(239,68,68,0.8); }',
      '.pirubot-btn-clear:hover { background: rgba(239,68,68,1); }',
      '.pirubot-btn-home  { grid-column: 3; grid-row: 3; font-size: 18px; background: rgba(168,85,247,0.8); }',
      '.pirubot-btn-home:hover  { background: rgba(168,85,247,1); }',
      '#pirubot-level-selector {',
      '  position: fixed; top: 12px; left: 16px; z-index: 99999;',
      '  display: flex; align-items: center; gap: 6px;',
      '  background: rgba(30,30,40,0.92); border: 2px solid rgba(99,179,237,0.4);',
      '  border-radius: 12px; padding: 6px 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.4);',
      '  font-family: "Segoe UI", system-ui, sans-serif;',
      '}',
      '.pirubot-level-label {',
      '  color: #aaa; font-size: 12px; white-space: nowrap; margin-right: 2px;',
      '}',
      '.pirubot-level-btn {',
      '  border: none; border-radius: 8px; padding: 6px 12px; font-size: 13px; font-weight: 600;',
      '  cursor: pointer; color: #fff; background: rgba(70,70,90,0.9); transition: all 0.15s ease;',
      '  user-select: none;',
      '}',
      '.pirubot-level-btn:hover { background: rgba(90,90,120,1); }',
      '.pirubot-level-btn.pirubot-level-active {',
      '  background: #FF6B35; color: #fff;',
      '  box-shadow: inset 0 2px 6px rgba(0,0,0,0.45), 0 0 8px rgba(255,107,53,0.6);',
      '}',
      '#pirubot-level-selector { top: 140px; left: 20px; cursor: grab; touch-action: none; }',
      '#pirubot-level-selector.pirubot-dragging { cursor: grabbing; opacity: 0.85; }'
    ].join('\n');
    document.head.appendChild(style);

    // ── Canvas overlay de grilla ────────────────────────────────────────
    injectGridCanvas();

    // ── Selector de nivel (Nivel 1 / Nivel 2) ──────────────────────────
    injectLevelSelector();

    // ── Visor de secuencia ────────────────────────────────────────────
    const viewer = document.createElement('div');
    viewer.id = 'pirubot-sequence-viewer';
    viewer.innerHTML =
      '<span class="pirubot-viewer-label">📋 Secuencia:</span>' +
      '<span class="pirubot-viewer-empty">Vacía</span>';
    document.body.appendChild(viewer);

    // ── D-Pad (arrastrable, sin botón de grilla) ───────────────────────
    // Los data-cmd/íconos de las 4 flechas se completan dinámicamente en
    // updateDPadForLevel() según el nivel activo (por defecto, Nivel 1).
    const dpad = document.createElement('div');
    dpad.id = 'pirubot-dpad';
    dpad.innerHTML =
      '<button class="pirubot-btn pirubot-btn-up"    id="btn-up"    data-cmd="L1_UP"></button>' +
      '<button class="pirubot-btn pirubot-btn-left"  id="btn-left"  data-cmd="L1_LEFT"></button>' +
      '<button class="pirubot-btn pirubot-btn-go"    data-cmd="GO"    title="Ejecutar">GO</button>' +
      '<button class="pirubot-btn pirubot-btn-right" id="btn-right" data-cmd="L1_RIGHT"></button>' +
      '<button class="pirubot-btn pirubot-btn-down"  id="btn-down"  data-cmd="L1_DOWN"></button>' +
      '<button class="pirubot-btn pirubot-btn-clear" data-cmd="CLEAR" title="Vaciar">🗑️</button>' +
      '<button class="pirubot-btn pirubot-btn-home"  data-cmd="HOME"  title="Inicio">🏠</button>';
    document.body.appendChild(dpad);

    updateDPadForLevel();
    positionDpadCentered(dpad);

    // ── Event listeners del D-Pad: respuesta inmediata en 'pointerdown' ──
    // 'preventDefault' + 'stopPropagation' evitan doble disparo, pérdida de
    // foco del escenario e interferencia con el arrastre del panel.
    // Se lee btn.dataset.cmd en el momento del click (no al registrar el
    // listener) para respetar cambios de nivel en caliente.
    dpad.querySelectorAll('.pirubot-btn').forEach(function (btn) {
      btn.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        e.stopPropagation();
        handleCommand(btn.dataset.cmd);
      });
    });

    makeDraggable(dpad);
  }

  // ── Selector de Nivel (Nivel 1 / Nivel 2) ────────────────────────────────
  function injectLevelSelector() {
    const panel = document.createElement('div');
    panel.id = 'pirubot-level-selector';
    panel.innerHTML =
      '<span class="pirubot-level-label">🎚️ Nivel:</span>' +
      '<button class="pirubot-level-btn" id="pirubot-level-1" data-level="1">Nivel 1</button>' +
      '<button class="pirubot-level-btn" id="pirubot-level-2" data-level="2">Nivel 2</button>';
    document.body.appendChild(panel);

    panel.querySelectorAll('.pirubot-level-btn').forEach(function (btn) {
      btn.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setLevel(parseInt(btn.dataset.level, 10));
      });
    });

    updateLevelSelectorUI();
    makeDraggable(panel);
  }

  // ── Posiciona el D-Pad en el centro exacto de la pantalla (viewport) ────
  // Se usan coordenadas absolutas en px (left/top) en vez de
  // 'transform: translate(-50%, -50%)' para que no haya desfases al
  // combinarlas con las coordenadas que calcula makeDraggable() durante
  // el arrastre (que también trabaja en left/top, no en transform).
  function positionDpadCentered(dpad) {
    const dpadWidth  = dpad.offsetWidth  || 220;
    const dpadHeight = dpad.offsetHeight || 220;
    const initialLeft = Math.max(0, (window.innerWidth  - dpadWidth)  / 2);
    const initialTop  = Math.max(0, (window.innerHeight - dpadHeight) / 2);
    dpad.style.left = initialLeft + 'px';
    dpad.style.top  = initialTop + 'px';
  }

  function setLevel(level) {
    if (level !== 1 && level !== 2) return;
    if (level === currentLevel) return;
    currentLevel = level;
    updateLevelSelectorUI();
    updateDPadForLevel();
    // Nota: cambiar de nivel NO vacía commandQueue ni el visor (regla
    // estricta: solo el botón Tacho puede vaciar la secuencia). Cada
    // comando de la cola lleva su propio código (L1_* vs FWD/BWD/LEFT/
    // RIGHT), por lo que la ejecución sigue siendo correcta aunque la
    // secuencia mezcle comandos cargados en distintos niveles.
  }

  function updateLevelSelectorUI() {
    const btn1 = document.getElementById('pirubot-level-1');
    const btn2 = document.getElementById('pirubot-level-2');
    if (btn1) btn1.classList.toggle('pirubot-level-active', currentLevel === 1);
    if (btn2) btn2.classList.toggle('pirubot-level-active', currentLevel === 2);
  }

  // ── Actualiza íconos/textos/comandos de las 4 flechas según el nivel ────
  function updateDPadForLevel() {
    const up    = document.getElementById('btn-up');
    const down  = document.getElementById('btn-down');
    const left  = document.getElementById('btn-left');
    const right = document.getElementById('btn-right');
    if (!up || !down || !left || !right) return;

    if (currentLevel === 1) {
      up.dataset.cmd    = 'L1_UP';    up.innerHTML    = CMD_ICONS.L1_UP;    up.title    = 'Arriba';
      down.dataset.cmd  = 'L1_DOWN';  down.innerHTML  = CMD_ICONS.L1_DOWN;  down.title  = 'Abajo';
      left.dataset.cmd  = 'L1_LEFT';  left.innerHTML  = CMD_ICONS.L1_LEFT;  left.title  = 'Izquierda';
      right.dataset.cmd = 'L1_RIGHT'; right.innerHTML = CMD_ICONS.L1_RIGHT; right.title = 'Derecha';
    } else {
      up.dataset.cmd    = 'FWD';   up.innerHTML    = CMD_ICONS.FWD;   up.title    = 'Avanzar';
      down.dataset.cmd  = 'BWD';   down.innerHTML  = CMD_ICONS.BWD;   down.title  = 'Retroceder';
      left.dataset.cmd  = 'LEFT';  left.innerHTML  = CMD_ICONS.LEFT;  left.title  = 'Girar Izquierda';
      right.dataset.cmd = 'RIGHT'; right.innerHTML = CMD_ICONS.RIGHT; right.title = 'Girar Derecha';
    }
  }

  // ── Despacho de comandos del D-Pad ───────────────────────────────────────
  function handleCommand(cmd) {
    if (cmd === 'GO') {
      runQueue();
    } else if (cmd === 'CLEAR') {
      clearQueue();
    } else if (cmd === 'HOME') {
      goHome();
    } else {
      pushCommand(cmd);
    }
  }

  // ── Drag & Drop del D-Pad (Pointer Events unificados) ────────────────────
  function makeDraggable(el) {
    let dragging = false;
    let offsetX  = 0;
    let offsetY  = 0;

    el.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.pirubot-btn, .pirubot-level-btn')) return; // los botones manejan su propio evento
      dragging = true;
      const rect = el.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      el.style.left = rect.left + 'px';
      el.style.top  = rect.top + 'px';
      el.classList.add('pirubot-dragging');
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
      e.preventDefault();
    });

    el.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      let newLeft = e.clientX - offsetX;
      let newTop  = e.clientY - offsetY;
      newLeft = Math.max(0, Math.min(window.innerWidth  - el.offsetWidth,  newLeft));
      newTop  = Math.max(0, Math.min(window.innerHeight - el.offsetHeight, newTop));
      el.style.left = newLeft + 'px';
      el.style.top  = newTop + 'px';
    });

    el.addEventListener('pointerup', function (e) {
      dragging = false;
      el.classList.remove('pirubot-dragging');
      try { el.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ }
    });

    el.addEventListener('pointercancel', function () {
      dragging = false;
      el.classList.remove('pirubot-dragging');
    });
  }

  // ── Visor: renderizar íconos ────────────────────────────────────────────
  function renderViewer() {
    const viewer = document.getElementById('pirubot-sequence-viewer');
    if (!viewer) return;

    if (commandQueue.length === 0) {
      viewer.innerHTML =
        '<span class="pirubot-viewer-label">📋 Secuencia:</span>' +
        '<span class="pirubot-viewer-empty">Vacía</span>';
      return;
    }

    let html = '<span class="pirubot-viewer-label">📋 Secuencia:</span>';
    for (let i = 0; i < commandQueue.length; i++) {
      html += '<span class="pirubot-step-icon" data-idx="' + i + '">' +
              (CMD_ICONS[commandQueue[i]] || '?') + '</span>';
    }
    viewer.innerHTML = html;
  }

  function highlightStep(index) {
    const icons = document.querySelectorAll('#pirubot-sequence-viewer .pirubot-step-icon');
    icons.forEach(function (el) { el.classList.remove('active-step'); });
    if (icons[index]) icons[index].classList.add('active-step');
  }

  function clearHighlight() {
    document.querySelectorAll('#pirubot-sequence-viewer .pirubot-step-icon')
      .forEach(function (el) { el.classList.remove('active-step'); });
  }

  function setDPadDisabled(disabled) {
    document.querySelectorAll('#pirubot-dpad .pirubot-btn')
      .forEach(function (btn) { btn.disabled = disabled; });
  }

  // ── Operaciones del buffer ──────────────────────────────────────────────
  function pushCommand(cmd) {
    if (isRunning) return;
    const valid = ['FWD', 'BWD', 'LEFT', 'RIGHT', 'L1_UP', 'L1_DOWN', 'L1_LEFT', 'L1_RIGHT'];
    if (valid.indexOf(cmd) === -1) return;
    commandQueue.push(cmd);
    renderViewer();
  }

  function clearQueue() {
    if (isRunning) return;
    commandQueue = [];
    renderViewer();
  }

  // ── Posición del sprite ─────────────────────────────────────────────────
  function updateSpritePosition() {
    const target = getTarget();
    if (!target) return;
    target.setXY(colToX(currentCol), filaToY(currentFila));
  }

  function updateSpriteDirection() {
    const target = getTarget();
    if (!target) return;
    target.setDirection(currentDir);
  }

  // Regla estricta: HOME solo reposiciona al robot. NUNCA vacía
  // commandQueue ni el visor de secuencias (eso es responsabilidad
  // exclusiva del botón Tacho / clearQueue()).
  function goHome() {
    if (isRunning) return;
    currentCol  = HOME_COL;
    currentFila = HOME_FILA;
    currentDir  = HOME_DIR;
    const target = getTarget();
    if (target) {
      target.setXY(HOME_X, HOME_Y);
      target.setDirection(HOME_DIR);
    }
  }

  // ── Motor de ejecución (runQueue) — Cinemática tipo Bee-Bot ──────────────
  async function runQueue() {
    if (isRunning) return;
    if (commandQueue.length === 0) return;

    isRunning = true;
    setDPadDisabled(true);

    for (let i = 0; i < commandQueue.length; i++) {
      const cmd = commandQueue[i];
      highlightStep(i);

      let outOfBounds = false;

      if (cmd === 'L1_UP' || cmd === 'L1_DOWN' || cmd === 'L1_LEFT' || cmd === 'L1_RIGHT') {
        // Nivel 1: traslación pura, el robot nunca rota sobre su eje.
        let dCol = 0, dFila = 0;
        if (cmd === 'L1_UP') dFila = -1;
        else if (cmd === 'L1_DOWN') dFila = 1;
        else if (cmd === 'L1_LEFT') dCol = -1;
        else if (cmd === 'L1_RIGHT') dCol = 1;

        const newColL1  = currentCol + dCol;
        const newFilaL1 = currentFila + dFila;

        if (newColL1 < 0 || newColL1 > GRID_COLS - 1 ||
            newFilaL1 < 0 || newFilaL1 > GRID_ROWS - 1) {
          outOfBounds = true;
        } else {
          currentCol  = newColL1;
          currentFila = newFilaL1;
          currentDir  = 0;
          updateSpritePosition();
          updateSpriteDirection();
        }
      } else if (cmd === 'FWD' || cmd === 'BWD') {
        // Calcular delta según dirección actual del sprite
        let dCol = 0, dFila = 0;
        const dir = ((currentDir % 360) + 360) % 360;

        if (dir === 90)       dCol = 1;    // → derecha
        else if (dir === 0)   dFila = -1;  // → arriba
        else if (dir === 270) dCol = -1;   // → izquierda
        else if (dir === 180) dFila = 1;   // → abajo

        if (cmd === 'BWD') { dCol = -dCol; dFila = -dFila; }

        const newCol  = currentCol + dCol;
        const newFila = currentFila + dFila;

        // Control de bordes
        if (newCol < 0 || newCol > GRID_COLS - 1 ||
            newFila < 0 || newFila > GRID_ROWS - 1) {
          outOfBounds = true;
        } else {
          currentCol  = newCol;
          currentFila = newFila;
          updateSpritePosition();
        }
      } else if (cmd === 'LEFT') {
        currentDir = currentDir - 90;
        updateSpriteDirection();
      } else if (cmd === 'RIGHT') {
        currentDir = currentDir + 90;
        updateSpriteDirection();
      }

      if (outOfBounds) {
        playAlertTone();
        break;
      }

      await new Promise(function (resolve) { setTimeout(resolve, STEP_MS); });
    }

    clearHighlight();
    isRunning = false;
    setDPadDisabled(false);
  }

  // ── Toast de carga ──────────────────────────────────────────────────────
  function showToast(message) {
    const toast = document.createElement('div');
    toast.id = 'pirubot-toast';
    toast.style.cssText =
      'position:fixed;bottom:1rem;left:1rem;z-index:99999;max-width:320px;' +
      'background:rgba(40,40,40,0.95);color:#fff;padding:12px 16px;' +
      'border-radius:10px;font-family:system-ui,sans-serif;font-size:14px;' +
      'box-shadow:0 4px 20px rgba(0,0,0,0.5);transition:opacity 0.5s;';
    toast.textContent = message || '🤖 ¡Pirubot cargado! Usa el D-Pad para programar a Piru.';
    document.body.appendChild(toast);
    setTimeout(function () { toast.style.opacity = '0'; }, 4000);
    setTimeout(function () { if (toast.parentNode) toast.remove(); }, 5000);
  }

  // ── Inicialización ──────────────────────────────────────────────────────
  let initialized = false;

  async function init() {
    if (initialized) return;
    initialized = true;

    await cleanStage();
    await loadPiruSprite();

    injectOverlay();
    updateSpritePosition();
    updateSpriteDirection();
    if (window.__pirubotSuppressOwnToast) {
      window.__pirubotSuppressOwnToast = false;
    } else {
      showToast();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Clase de extensión Scratch ──────────────────────────────────────────
  class PirubotExtension {
    constructor() {
      this.runtime = Scratch.vm ? Scratch.vm.runtime : null;
    }

    getInfo() {
      return {
        id: 'pirubotREC',
        name: 'Pirubot',
        color1: '#63b3ed',
        color2: '#4299e1',
        blockIconURI: null,
        menuIconURI: null,
        blocks: [
          {
            opcode: 'addCommand',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Agregar comando [CMD]',
            arguments: {
              CMD: {
                type: Scratch.ArgumentType.STRING,
                menu: 'cmdMenu',
                defaultValue: 'FWD'
              }
            }
          },
          {
            opcode: 'executeQueue',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Ejecutar secuencia'
          },
          {
            opcode: 'clearCommands',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Vaciar secuencia'
          },
          {
            opcode: 'goHomeBlock',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Ir al inicio (HOME)'
          },
          '---',
          {
            opcode: 'getCol',
            blockType: Scratch.BlockType.REPORTER,
            text: 'Columna actual'
          },
          {
            opcode: 'getFila',
            blockType: Scratch.BlockType.REPORTER,
            text: 'Fila actual'
          },
          {
            opcode: 'getDir',
            blockType: Scratch.BlockType.REPORTER,
            text: 'Dirección actual'
          },
          {
            opcode: 'getQueueLength',
            blockType: Scratch.BlockType.REPORTER,
            text: 'Cantidad de comandos'
          }
        ],
        menus: {
          cmdMenu: {
            items: [
              { text: '⬆️ Adelante',  value: 'FWD' },
              { text: '⬇️ Atrás',     value: 'BWD' },
              { text: '⬅️ Izquierda', value: 'LEFT' },
              { text: '➡️ Derecha',   value: 'RIGHT' }
            ]
          }
        }
      };
    }

    // ── Bloques Scratch ───────────────────────────────────────────────
    addCommand(args) {
      pushCommand(args.CMD);
    }

    async executeQueue() {
      await runQueue();
    }

    clearCommands() {
      clearQueue();
    }

    goHomeBlock() {
      goHome();
    }

    getCol()         { return currentCol; }
    getFila()        { return currentFila; }
    getDir()         { return currentDir; }
    getQueueLength() { return commandQueue.length; }
  }

  Scratch.extensions.register(new PirubotExtension());
})(Scratch);
