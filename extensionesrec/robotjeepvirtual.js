// ── Robot Jeep Virtual REC v2.3 (Con Trazo/Lápiz Nativo de Render) ───────────
// Enlaza al sprite preexistente "RECRobotJeepAuto". Sin vm.addSprite().
// Sensor de línea: renderer.sampleColor4b en el punto sensor delantero.
// Trazado de lápiz: Integra renderer.createPenSkin(), penLine y penClear.
(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Robot Jeep Virtual requiere modo unsandboxed.');
  }

  // ── Constantes ──────────────────────────────────────────────────────────
  const MAX_V        = 160;   // Scratch units/s al 100 %
  const TURN_SCALE   = 1.8;   // grados/s por unidad de diferencia (vR - vL)
  const SENSOR_DIST  = 36;    // Scratch units al frente del centro (sensor de piso)
  const LINE_THRESH  = 60;    // umbral RGB para considerar color negro/línea
  const BORDER_OFFSET = 10;   // cm a restar cuando el rayo impacta el borde del escenario
  const SPRITE_OFFSET = 27;   // cm a restar cuando el rayo impacta otro sprite
  const SCALE_CM     = 0.42;  // factor de conversión Scratch units → cm

  const NOTES = {
    DO: 261.63, RE: 293.66, MI: 329.63, FA: 349.23,
    SOL: 392.00, LA: 440.00, SI: 493.88, DO5: 523.25
  };

  const SPRITE_NAME = 'RECRobotJeepAuto';

  // ── Estado del Jeep ─────────────────────────────────────────────────────
  const jeep = { x: 0, y: 0, dir: 90, vL: 0, vR: 0 };
  let homePos   = { x: 0, y: 0, dir: 90 };
  let ultraDist = 100;
  let onLine    = false;
  let rafId     = null;
  let lastSetX  = 0;
  let lastSetY  = 0;
  let lastTs    = null;
  let resetting = false;

  // ── Estado del Lápiz (Pen Layer) ─────────────────────────────────────────
  let isPenDown   = false;
  let penColorHex = '#0000ff';
  let penSize     = 3;
  let lastPenPos  = { x: 0, y: 0 };
  let penSkinId   = null;
  let penDrawableId = null;

  // ── Estado de LEDs ─────────────────────────────────────────────────────────
  let led1On    = false;
  let led2On    = false;
  let led1Color = '#ffff00';
  let led2Color = '#ffff00';
  let baseSvgText = null;
  let ledSkinId   = null;

  // ── Audio Web API ────────────────────────────────────────────────────────
  let audioCtx = null;
  function getAudio() {
    return audioCtx || (audioCtx = new (window.AudioContext || window.webkitAudioContext)());
  }
  function playTone(freq, type, dur) {
    try {
      const ac  = getAudio();
      const osc = ac.createOscillator();
      const g   = ac.createGain();
      osc.type  = type || 'sine';
      osc.frequency.setValueAtTime(freq, ac.currentTime);
      g.gain.setValueAtTime(0.28, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + dur);
    } catch (e) { /* ignorar */ }
  }

  // ── Helpers VM & Pen Renderer ────────────────────────────────────────────
  function getVM() {
    return (Scratch && Scratch.vm) ? Scratch.vm : window.vm;
  }

  function getTarget() {
    const vm = getVM();
    if (!vm) return null;
    const byName = vm.runtime.targets.find(
      t => !t.isStage && t.sprite && t.sprite.name === SPRITE_NAME
    );
    if (byName) return byName;
    return vm.runtime.targets.find(t => !t.isStage) || null;
  }

  function getPenSkin() {
    const vm = getVM();
    const renderer = vm && vm.runtime && vm.runtime.renderer;
    if (!renderer) return null;
    if (penSkinId === null) {
      penSkinId = renderer.createPenSkin();
      penDrawableId = renderer.createDrawable('pen');
      renderer.updateDrawableSkinId(penDrawableId, penSkinId);
    }
    return { renderer, penSkinId };
  }

  function hexToRgbaFloat(hex) {
    let c = hex || '#0000ff';
    if (typeof c === 'number') c = '#' + ('000000' + c.toString(16)).slice(-6);
    if (typeof c === 'string' && c.startsWith('#')) {
      const r = parseInt(c.slice(1, 3), 16) / 255;
      const g = parseInt(c.slice(3, 5), 16) / 255;
      const b = parseInt(c.slice(5, 7), 16) / 255;
      return [r, g, b, 1.0];
    }
    return [0, 0, 1, 1.0];
  }

  // ── LED SVG Helpers ──────────────────────────────────────────────────────
  async function fetchBaseSvg(target) {
    if (baseSvgText) return true;
    try {
      const costume = target.sprite && target.sprite.costumes[0];
      if (costume && costume.asset && costume.asset.data) {
        baseSvgText = new TextDecoder().decode(costume.asset.data);
        if (baseSvgText && baseSvgText.includes('<svg')) return true;
        baseSvgText = null;
      }
    } catch (e) { /* continuar */ }

    try {
      const base    = new URL('extensionesrec/', document.baseURI).href;
      const assetId = (target.sprite && target.sprite.costumes[0] &&
                       target.sprite.costumes[0].assetId) ||
                      '4ef9ac16f7933b898664438a0767a697';
      const resp    = await fetch(base + assetId + '.svg');
      if (resp.ok) {
        baseSvgText = await resp.text();
        return true;
      }
    } catch (e) { /* ignorar */ }
    return false;
  }

  function makeLedSvg(baseSvg) {
    const defs =
      '<defs><filter id="jglow" x="-60%" y="-60%" width="220%" height="220%">' +
      '<feGaussianBlur stdDeviation="3" result="blur"/>' +
      '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter></defs>';
    let circles = '';
    if (led1On) circles += `<circle cx="74" cy="40" r="5" fill="${led1Color}" opacity="0.95" filter="url(#jglow)"/>`;
    if (led2On) circles += `<circle cx="74" cy="21" r="5" fill="${led2Color}" opacity="0.95" filter="url(#jglow)"/>`;
    return baseSvg.replace('</svg>', defs + circles + '</svg>');
  }

  function applyLedVisual() {
    const t = getTarget();
    if (!t) return;
    const vm       = getVM();
    const renderer = vm && vm.runtime && vm.runtime.renderer;
    if (!renderer || !baseSvgText) return;

    if (led1On || led2On) {
      const ledSvg = makeLedSvg(baseSvgText);
      if (ledSkinId === null) {
        ledSkinId = renderer.createSVGSkin(ledSvg, [40, 31.5]);
      } else {
        renderer.updateSVGSkin(ledSkinId, ledSvg, [40, 31.5]);
      }
      renderer.updateDrawableSkinId(t.drawableID, ledSkinId);
    } else {
      const origSkinId = t.sprite && t.sprite.costumes[0] && t.sprite.costumes[0].skinId;
      if (origSkinId !== undefined) {
        renderer.updateDrawableSkinId(t.drawableID, origSkinId);
      }
    }
    vm.runtime.requestRedraw();
  }

  // ── Sincronización ───────────────────────────────────────────────────────
  function syncAndStart() {
    const t = getTarget();
    if (!t) return false;
    jeep.x   = t.x;
    jeep.y   = t.y;
    jeep.dir = (((t.direction % 360) + 360) % 360);
    homePos  = { x: t.x, y: t.y, dir: jeep.dir };
    lastSetX = t.x;
    lastSetY = t.y;
    lastPenPos = { x: t.x, y: t.y };
    t.draggable = true;
    t.rotationStyle = 'all around';
    if (!rafId) startPhysics();
    fetchBaseSvg(t).catch(() => {});
    return true;
  }

  function startPhysics() {
    if (rafId) return;
    lastTs = null;
    (function loop(ts) {
      rafId = requestAnimationFrame(loop);
      const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0.016;
      lastTs = ts;
      physicsStep(dt);
    })(performance.now());
  }

  // ── Cinemática + Trazado de Lápiz ────────────────────────────────────────
  function physicsStep(dt) {
    const t = getTarget();
    if (!t) return;

    if (resetting) {
      resetting = false;
      return;
    }

    t.rotationStyle = 'all around';
    jeep.dir = (((t.direction % 360) + 360) % 360);

    const v    = (jeep.vL + jeep.vR) / 2;
    const wDeg = (jeep.vR - jeep.vL) * TURN_SCALE;
    const rad  = (jeep.dir * Math.PI) / 180;

    const prevX = jeep.x;
    const prevY = jeep.y;

    jeep.x  += v * Math.sin(rad) * dt;
    jeep.y  += v * Math.cos(rad) * dt;
    jeep.dir = (((jeep.dir + wDeg * dt) % 360) + 360) % 360;

    jeep.x = Math.max(-230, Math.min(230, jeep.x));
    jeep.y = Math.max(-170, Math.min(170, jeep.y));

    // Detección de arrastre
    const DRAG_THRESHOLD = 4;
    if (Math.abs(t.x - lastSetX) > DRAG_THRESHOLD || Math.abs(t.y - lastSetY) > DRAG_THRESHOLD) {
      jeep.x  = t.x;
      jeep.y  = t.y;
      jeep.vL = 0;
      jeep.vR = 0;
      homePos = { x: t.x, y: t.y, dir: t.direction };
      lastPenPos = { x: t.x, y: t.y };
    }

    // Dibujar trazo si el lápiz está abajo
    if (isPenDown) {
      const distMoved = Math.hypot(jeep.x - lastPenPos.x, jeep.y - lastPenPos.y);
      if (distMoved > 0.1) {
        const pen = getPenSkin();
        if (pen) {
          pen.renderer.penLine(pen.penSkinId, {
            color4f: hexToRgbaFloat(penColorHex),
            diameter: penSize
          }, lastPenPos.x, lastPenPos.y, jeep.x, jeep.y);
          const vm = getVM();
          if (vm && vm.runtime) vm.runtime.requestRedraw();
        }
      }
    }
    lastPenPos = { x: jeep.x, y: jeep.y };

    t.setXY(jeep.x, jeep.y);
    t.setDirection(jeep.dir);
    lastSetX = jeep.x;
    lastSetY = jeep.y;

    updateSensors(t);
  }

  // ── Sensores ─────────────────────────────────────────────────────────────
  function updateSensors(target) {
    const rad = (jeep.dir * Math.PI) / 180;
    const dx  = Math.sin(rad);
    const dy  = Math.cos(rad);
    const EPS = 1e-6;
    let tBorder = 9999;
    let tSprite = 9999;

    if (Math.abs(dx) > EPS) {
      const t1 = dx > 0 ? (230 - jeep.x) / dx : (-230 - jeep.x) / dx;
      if (t1 > 0) tBorder = Math.min(tBorder, t1);
    }
    if (Math.abs(dy) > EPS) {
      const t2 = dy > 0 ? (170 - jeep.y) / dy : (-170 - jeep.y) / dy;
      if (t2 > 0) tBorder = Math.min(tBorder, t2);
    }

    const vm = getVM();
    if (vm) {
      vm.runtime.targets.forEach(spr => {
        if (spr.isStage || spr === target) return;
        const sx   = spr.x - jeep.x;
        const sy   = spr.y - jeep.y;
        const proj = sx * dx + sy * dy;
        if (proj > 4) {
          const perp = Math.abs(sx * dy - sy * dx);
          if (perp < 22) tSprite = Math.min(tSprite, proj);
        }
      });
    }

    let distCm;
    if (tSprite < tBorder) distCm = Math.round(tSprite * SCALE_CM) - SPRITE_OFFSET;
    else distCm = Math.round(tBorder * SCALE_CM) - BORDER_OFFSET;
    ultraDist = Math.max(0, distCm);

    try {
      const renderer = vm && vm.runtime && vm.runtime.renderer;
      if (renderer && renderer._visibleDrawList && renderer._allDrawables) {
        const sensorX = jeep.x + SENSOR_DIST * dx;
        const sensorY = jeep.y + SENSOR_DIST * dy;

        const drawables = renderer._visibleDrawList
          .filter(id => id !== target.drawableID && id !== penDrawableId)
          .map(id => ({ id, drawable: renderer._allDrawables[id] }))
          .filter(d => d.drawable);

        const pixel = new Uint8ClampedArray(4);
        renderer.sampleColor4b([sensorX, sensorY], drawables, pixel);

        onLine = pixel[0] < LINE_THRESH && pixel[1] < LINE_THRESH && pixel[2] < LINE_THRESH && pixel[3] > 128;
      }
    } catch (e) { /* ignorar */ }
  }

  const MENU_ICON_URI =
    'data:image/svg+xml;base64,' +
    btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#FF6B35"/></svg>');

  // ── Traducciones de bloques (15 idiomas) ─────────────────────────────────
  const I18N_BLOCKS = {
    es: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: '¡Robot Jeep Virtual cargado! Busca los bloques al final de la paleta izquierda 👇',
      block_move_label: '🚙 Movimiento del Jeep',
      block_move_motor: 'Mover motor [SIDE] hacia [DIR] a [PCT]%',
      motor_dir_fwd: 'ADELANTE',
      motor_dir_bwd: 'ATRAS',
      block_stop_motor: 'Detener motor [WHICH]',
      block_reset_pos: 'reiniciar posición del Jeep',
      block_pen_label: '✏️ Lápiz de dibujo',
      block_pen_down: 'bajar lápiz',
      block_pen_up: 'subir lápiz',
      block_set_pen_color: 'fijar color de lápiz a [COLOR]',
      block_set_pen_size: 'fijar tamaño de lápiz a [SIZE]',
      block_clear_pen: 'borrar todo el dibujo',
      block_sensors_label: '📡 Sensores',
      block_distance_cm: 'Distancia en cm',
      block_line_detected: 'Detecta linea',
      block_leds_label: '💡 LEDs frontales',
      block_light_on: 'Encender Luz [LED] en color [COLOR]',
      block_light_off: 'Apagar Luz [LED]',
      block_audio_label: '🔊 Audio',
      block_bocina: 'sonar bocina',
      block_play_note: 'tocar nota [NOTA] por [DUR] seg',
      motor_left: 'IZQUIERDO / B',
      motor_right: 'DERECHO / A',
      stop_both: 'AMBOS',
      led_all: 'TODAS'
    },
    en: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual loaded! Look for the blocks at the bottom of the left palette 👇',
      block_move_label: '🚙 Jeep Movement',
      block_move_motor: 'Move [SIDE] motor [DIR] at [PCT]%',
      motor_dir_fwd: 'FORWARD',
      motor_dir_bwd: 'BACKWARD',
      block_stop_motor: 'Stop [WHICH] motor',
      block_reset_pos: 'reset Jeep position',
      block_pen_label: '✏️ Drawing Pen',
      block_pen_down: 'pen down',
      block_pen_up: 'pen up',
      block_set_pen_color: 'set pen color to [COLOR]',
      block_set_pen_size: 'set pen size to [SIZE]',
      block_clear_pen: 'erase all drawing',
      block_sensors_label: '📡 Sensors',
      block_distance_cm: 'distance in cm',
      block_line_detected: 'line detected',
      block_leds_label: '💡 Front LEDs',
      block_light_on: 'Turn on [LED] light with color [COLOR]',
      block_light_off: 'Turn off [LED] light',
      block_audio_label: '🔊 Audio',
      block_bocina: 'sound horn',
      block_play_note: 'play note [NOTA] for [DUR] s',
      motor_left: 'LEFT / B',
      motor_right: 'RIGHT / A',
      stop_both: 'BOTH',
      led_all: 'ALL'
    },
    pt: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual carregado! Procure os blocos no final da paleta à esquerda 👇',
      block_move_label: '🚙 Movimento do Jeep',
      block_move_motor: 'Mover motor [SIDE] para [DIR] a [PCT]%',
      motor_dir_fwd: 'FRENTE',
      motor_dir_bwd: 'TRÁS',
      block_stop_motor: 'Parar motor [WHICH]',
      block_reset_pos: 'reiniciar posição do Jeep',
      block_pen_label: '✏️ Caneta de desenho',
      block_pen_down: 'baixar caneta',
      block_pen_up: 'levantar caneta',
      block_set_pen_color: 'mudar a cor da caneta para [COLOR]',
      block_set_pen_size: 'mudar o tamanho da caneta para [SIZE]',
      block_clear_pen: 'apagar todos os desenhos',
      block_sensors_label: '📡 Sensores',
      block_distance_cm: 'distância em cm',
      block_line_detected: 'detecta linha',
      block_leds_label: '💡 LEDs frontais',
      block_light_on: 'Acender luz [LED] na cor [COLOR]',
      block_light_off: 'Apagar luz [LED]',
      block_audio_label: '🔊 Áudio',
      block_bocina: 'tocar buzina',
      block_play_note: 'tocar nota [NOTA] por [DUR] seg',
      motor_left: 'ESQUERDO / B', motor_right: 'DIREITO / A', stop_both: 'AMBOS', led_all: 'TODAS'
    },
    fr: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual chargé ! Retrouve les blocs en bas de la palette à gauche 👇',
      block_move_label: '🚙 Mouvement du Jeep',
      block_move_motor: 'Moteur [SIDE] [DIR] à [PCT]%',
      motor_dir_fwd: 'AVANT',
      motor_dir_bwd: 'ARRIÈRE',
      block_stop_motor: 'Arrêter le moteur [WHICH]',
      block_reset_pos: 'réinitialiser la position du Jeep',
      block_pen_label: '✏️ Stylo de dessin',
      block_pen_down: 'stylo en position d\'écriture',
      block_pen_up: 'relever le stylo',
      block_set_pen_color: 'mettre la couleur du stylo à [COLOR]',
      block_set_pen_size: 'mettre la taille du stylo à [SIZE]',
      block_clear_pen: 'effacer tout le dessin',
      block_sensors_label: '📡 Capteurs',
      block_distance_cm: 'distance en cm',
      block_line_detected: 'détecte la ligne',
      block_leds_label: '💡 LEDs frontales',
      block_light_on: 'Allumer la LED [LED] de couleur [COLOR]',
      block_light_off: 'Éteindre la LED [LED]',
      block_audio_label: '🔊 Audio',
      block_bocina: 'klaxonner',
      block_play_note: 'jouer la note [NOTA] pendant [DUR] s',
      motor_left: 'GAUCHE / B', motor_right: 'DROITE / A', stop_both: 'LES DEUX', led_all: 'TOUTES'
    },
    de: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual geladen! Die Blöcke findest du unten in der linken Palette 👇',
      block_move_label: '🚙 Jeep-Bewegung',
      block_move_motor: 'Motor [SIDE] [DIR] mit [PCT]%',
      motor_dir_fwd: 'VORWÄRTS',
      motor_dir_bwd: 'RÜCKWÄRTS',
      block_stop_motor: 'Motor [WHICH] stoppen',
      block_reset_pos: 'Jeep-Position zurücksetzen',
      block_pen_label: '✏️ Zeichenstift',
      block_pen_down: 'Stift unten',
      block_pen_up: 'Stift oben',
      block_set_pen_color: 'Stiftfarbe auf [COLOR] setzen',
      block_set_pen_size: 'Stiftdicke auf [SIZE] setzen',
      block_clear_pen: 'Alles löschen',
      block_sensors_label: '📡 Sensoren',
      block_distance_cm: 'Entfernung in cm',
      block_line_detected: 'Linie erkannt',
      block_leds_label: '💡 Front-LEDs',
      block_light_on: 'LED [LED] in Farbe [COLOR] einschalten',
      block_light_off: 'LED [LED] ausschalten',
      block_audio_label: '🔊 Audio',
      block_bocina: 'Hupe ertönen',
      block_play_note: 'Note [NOTA] für [DUR] s spielen',
      motor_left: 'LINKS / B', motor_right: 'RECHTS / A', stop_both: 'BEIDE', led_all: 'ALLE'
    },
    it: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual caricato! Cerca i blocchi in fondo alla palette a sinistra 👇',
      block_move_label: '🚙 Movimento del Jeep',
      block_move_motor: 'Motore [SIDE] [DIR] al [PCT]%',
      motor_dir_fwd: 'AVANTI',
      motor_dir_bwd: 'INDIETRO',
      block_stop_motor: 'Fermare il motore [WHICH]',
      block_reset_pos: 'reimposta posizione del Jeep',
      block_pen_label: '✏️ Penna da disegno',
      block_pen_down: 'penna giù',
      block_pen_up: 'penna su',
      block_set_pen_color: 'porta colore penna a [COLOR]',
      block_set_pen_size: 'porta dimensione penna a [SIZE]',
      block_clear_pen: 'pulisci tutto',
      block_sensors_label: '📡 Sensori',
      block_distance_cm: 'distanza in cm',
      block_line_detected: 'rileva linea',
      block_leds_label: '💡 LED anteriori',
      block_light_on: 'Accendere luce [LED] di colore [COLOR]',
      block_light_off: 'Spegnere luce [LED]',
      block_audio_label: '🔊 Audio',
      block_bocina: 'suonare clacson',
      block_play_note: 'suonare nota [NOTA] per [DUR] s',
      motor_left: 'SINISTRO / B', motor_right: 'DESTRO / A', stop_both: 'ENTRAMBI', led_all: 'TUTTE'
    },
    zh: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual 已加载！在左侧积木栏底部查找积木 👇',
      block_move_label: '🚙 Jeep 移动',
      block_move_motor: '以 [PCT]% [DIR] 移动 [SIDE] 电机',
      motor_dir_fwd: '前进',
      motor_dir_bwd: '后退',
      block_stop_motor: '停止 [WHICH] 电机',
      block_reset_pos: '重置 Jeep 位置',
      block_pen_label: '✏️ 画笔',
      block_pen_down: '落笔',
      block_pen_up: '抬笔',
      block_set_pen_color: '将画笔颜色设置为 [COLOR]',
      block_set_pen_size: '将画笔粗细设置为 [SIZE]',
      block_clear_pen: '清除所有笔迹',
      block_sensors_label: '📡 传感器',
      block_distance_cm: '距离（厘米）',
      block_line_detected: '检测到线',
      block_leds_label: '💡 前灯',
      block_light_on: '打开 [LED] 灯，颜色为 [COLOR]',
      block_light_off: '关闭 [LED] 灯',
      block_audio_label: '🔊 音频',
      block_bocina: '鸣笛',
      block_play_note: '以 [NOTA] 音符播放 [DUR] 秒',
      motor_left: '左 / B', motor_right: '右 / A', stop_both: '全部', led_all: '全部'
    },
    ja: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual が読み込まれました！左のパレットの一番下にブロックがあります 👇',
      block_move_label: '🚙 Jeep の動き',
      block_move_motor: '[SIDE] モーターを [PCT]% で [DIR]',
      motor_dir_fwd: '前進',
      motor_dir_bwd: '後退',
      block_stop_motor: '[WHICH] モーターを停止する',
      block_reset_pos: 'Jeep の位置をリセットする',
      block_pen_label: '✏️ ペン',
      block_pen_down: 'ペンを下ろす',
      block_pen_up: 'ペンを上げる',
      block_set_pen_color: 'ペンの色を [COLOR] にする',
      block_set_pen_size: 'ペンの太さを [SIZE] にする',
      block_clear_pen: '全部消す',
      block_sensors_label: '📡 センサー',
      block_distance_cm: '距離（cm）',
      block_line_detected: 'ラインを検出',
      block_leds_label: '💡 前面 LED',
      block_light_on: '色 [COLOR] の [LED] ライトをつける',
      block_light_off: '[LED] ライトを消す',
      block_audio_label: '🔊 オーディオ',
      block_bocina: 'クラクションを鳴らす',
      block_play_note: '音符 [NOTA] を [DUR] 秒鳴らす',
      motor_left: '左 / B', motor_right: '右 / A', stop_both: '両方', led_all: 'すべて'
    },
    ko: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual이(가) 로드되었습니다! 왼쪽 팔레트 하단에서 블록을 찾으세요 👇',
      block_move_label: '🚙 Jeep 움직임',
      block_move_motor: '[SIDE] 모터를 [PCT]%로 [DIR]',
      motor_dir_fwd: '전진',
      motor_dir_bwd: '후진',
      block_stop_motor: '[WHICH] 모터 정지',
      block_reset_pos: 'Jeep 위치 초기화',
      block_pen_label: '✏️ 펜',
      block_pen_down: '펜 내리기',
      block_pen_up: '펜 올리기',
      block_set_pen_color: '펜 색상을 [COLOR] (으)로 정하기',
      block_set_pen_size: '펜 굵기를 [SIZE] (으)로 정하기',
      block_clear_pen: '모두 지우기',
      block_sensors_label: '📡 센서',
      block_distance_cm: '거리(cm)',
      block_line_detected: '라인 감지',
      block_leds_label: '💡 전방 LED',
      block_light_on: '[COLOR] 색상으로 [LED] 조명 켜기',
      block_light_off: '[LED] 조명 끄기',
      block_audio_label: '🔊 오디오',
      block_bocina: '경적 소리',
      block_play_note: '음 [NOTA] 를 [DUR] 초 동안 연주',
      motor_left: '왼쪽 / B', motor_right: '오른쪽 / A', stop_both: '양쪽', led_all: '전체'
    },
    ru: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual загружен! Ищи блоки внизу левой палитры 👇',
      block_move_label: '🚙 Движение Jeep',
      block_move_motor: 'Двигать мотор [SIDE] [DIR] на [PCT]%',
      motor_dir_fwd: 'ВПЕРЁД',
      motor_dir_bwd: 'НАЗАД',
      block_stop_motor: 'Остановить мотор [WHICH]',
      block_reset_pos: 'сбросить позицию Jeep',
      block_pen_label: '✏️ Перо',
      block_pen_down: 'опустить перо',
      block_pen_up: 'поднять перо',
      block_set_pen_color: 'установить цвет пера [COLOR]',
      block_set_pen_size: 'установить размер пера [SIZE]',
      block_clear_pen: 'стереть всё',
      block_sensors_label: '📡 Датчики',
      block_distance_cm: 'расстояние в см',
      block_line_detected: 'обнаружена линия',
      block_leds_label: '💡 Передние светодиоды',
      block_light_on: 'Включить свет [LED] цвета [COLOR]',
      block_light_off: 'Выключить свет [LED]',
      block_audio_label: '🔊 Аудио',
      block_bocina: 'подать сигнал',
      block_play_note: 'играть ноту [NOTA] [DUR] с',
      motor_left: 'ЛЕВЫЙ / B', motor_right: 'ПРАВЫЙ / A', stop_both: 'ОБА', led_all: 'ВСЕ'
    },
    ar: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'تم تحميل Robot Jeep Virtual! ابحث عن الكتل في أسفل اللوحة اليسرى 👇',
      block_move_label: '🚙 حركة Jeep',
      block_move_motor: 'تحريك المحرك [SIDE] [DIR] بنسبة [PCT]%',
      motor_dir_fwd: 'للأمام',
      motor_dir_bwd: 'للخلف',
      block_stop_motor: 'إيقاف المحرك [WHICH]',
      block_reset_pos: 'إعادة تعيين موضع Jeep',
      block_pen_label: '✏️ القلم',
      block_pen_down: 'انزل القلم',
      block_pen_up: 'ارفع القلم',
      block_set_pen_color: 'اجعل لون القلم مساوياً [COLOR]',
      block_set_pen_size: 'اجعل حجم القلم مساوياً [SIZE]',
      block_clear_pen: 'امسح الكل',
      block_sensors_label: '📡 المستشعرات',
      block_distance_cm: 'المسافة بالسم',
      block_line_detected: 'اكتشاف الخط',
      block_leds_label: '💡 المصابيح الأمامية',
      block_light_on: 'تشغيل ضوء [LED] باللون [COLOR]',
      block_light_off: 'إطفاء ضوء [LED]',
      block_audio_label: '🔊 الصوت',
      block_bocina: 'تشغيل البوق',
      block_play_note: 'عزف نوتة [NOTA] لمدة [DUR] ث',
      motor_left: 'يسار / B', motor_right: 'يمين / A', stop_both: 'كلاهما', led_all: 'الكل'
    },
    hi: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual लोड हो गया है! बाएँ पैलेट के नीचे ब्लॉक खोजें 👇',
      block_move_label: '🚙 Jeep की गति',
      block_move_motor: '[SIDE] मोटर को [PCT]% पर [DIR]',
      motor_dir_fwd: 'आगे',
      motor_dir_bwd: 'पीछे',
      block_stop_motor: '[WHICH] मोटर रोकें',
      block_reset_pos: 'Jeep की स्थिति रीसेट करें',
      block_pen_label: '✏️ कलम (Pen)',
      block_pen_down: 'कलम नीचे करें',
      block_pen_up: 'कलम ऊपर उठाएं',
      block_set_pen_color: 'कलम का रंग [COLOR] सेट करें',
      block_set_pen_size: 'कलम का आकार [SIZE] सेट करें',
      block_clear_pen: 'सब मिटाएं',
      block_sensors_label: '📡 सेंसर',
      block_distance_cm: 'दूरी सेमी में',
      block_line_detected: 'रेखा का पता चला',
      block_leds_label: '💡 सामने के LED',
      block_light_on: '[LED] लाइट को [COLOR] रंग में चालू करें',
      block_light_off: '[LED] लाइट बंद करें',
      block_audio_label: '🔊 ऑडियो',
      block_bocina: 'हॉर्न बजाएं',
      block_play_note: '[NOTA] नोट को [DUR] सेकंड तक बजाएं',
      motor_left: 'बायाँ / B', motor_right: 'दायाँ / A', stop_both: 'दोनों', led_all: 'सभी'
    },
    bn: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual লোড হয়েছে! বাম প্যালেটের নিচে ব্লকগুলো খুঁজুন 👇',
      block_move_label: '🚙 Jeep এর চলাচল',
      block_move_motor: '[SIDE] মোটর [PCT]% [DIR]',
      motor_dir_fwd: 'এগিয়ে',
      motor_dir_bwd: 'পিছিয়ে',
      block_stop_motor: '[WHICH] মোটর থামান',
      block_reset_pos: 'Jeep এর অবস্থান পুনরায় সেট করুন',
      block_pen_label: '✏️ কলম',
      block_pen_down: 'কলম নিচে নামাও',
      block_pen_up: 'কলম উপরে তোলো',
      block_set_pen_color: 'কলমের রঙ [COLOR] সেট করো',
      block_set_pen_size: 'কলমের আকার [SIZE] সেট করো',
      block_clear_pen: 'সব মুছুন',
      block_sensors_label: '📡 সেন্সর',
      block_distance_cm: 'সেন্টিমিটারে দূরত্ব',
      block_line_detected: 'লাইন শনাক্ত হয়েছে',
      block_leds_label: '💡 সামনের LED',
      block_light_on: '[LED] আলো [COLOR] রঙে জ্বালান',
      block_light_off: '[LED] আলো বন্ধ করুন',
      block_audio_label: '🔊 অডিও',
      block_bocina: 'হর্ন বাজান',
      block_play_note: '[DUR] সেকেন্ডের জন্য [NOTA] নোট বাজান',
      motor_left: 'বাম / B', motor_right: 'ডান / A', stop_both: 'উভয়', led_all: 'সব'
    },
    id: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual dimuat! Cari bloknya di bagian bawah palet kiri 👇',
      block_move_label: '🚙 Gerakan Jeep',
      block_move_motor: 'Gerakkan motor [SIDE] [DIR] dengan [PCT]%',
      motor_dir_fwd: 'MAJU',
      motor_dir_bwd: 'MUNDUR',
      block_stop_motor: 'Hentikan motor [WHICH]',
      block_reset_pos: 'atur ulang posisi Jeep',
      block_pen_label: '✏️ Pena',
      block_pen_down: 'tekan pena',
      block_pen_up: 'angkat pena',
      block_set_pen_color: 'atur warna pena ke [COLOR]',
      block_set_pen_size: 'atur ukuran pena ke [SIZE]',
      block_clear_pen: 'hapus semua',
      block_sensors_label: '📡 Sensor',
      block_distance_cm: 'jarak dalam cm',
      block_line_detected: 'garis terdeteksi',
      block_leds_label: '💡 LED depan',
      block_light_on: 'Nyalakan lampu [LED] dengan warna [COLOR]',
      block_light_off: 'Matikan lampu [LED]',
      block_audio_label: '🔊 Audio',
      block_bocina: 'bunyikan klakson',
      block_play_note: 'mainkan nada [NOTA] selama [DUR] dtk',
      motor_left: 'KIRI / B', motor_right: 'KANAN / A', stop_both: 'KEDUANYA', led_all: 'SEMUA'
    },
    tr: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual yüklendi! Blokları sol paletin en altında bulun 👇',
      block_move_label: '🚙 Jeep Hareketi',
      block_move_motor: '[SIDE] motorunu [PCT]% ile [DIR]',
      motor_dir_fwd: 'İLERİ',
      motor_dir_bwd: 'GERİ',
      block_stop_motor: '[WHICH] motorunu durdur',
      block_reset_pos: 'Jeep konumunu sıfırla',
      block_pen_label: '✏️ Çizim Kalemi',
      block_pen_down: 'kalemi bastır',
      block_pen_up: 'kalemi kaldır',
      block_set_pen_color: 'kalem rengini [COLOR] yap',
      block_set_pen_size: 'kalem kalınlığını [SIZE] yap',
      block_clear_pen: 'tümünü temizle',
      block_sensors_label: '📡 Sensörler',
      block_distance_cm: 'mesafe cm cinsinden',
      block_line_detected: 'çizgi algılandı',
      block_leds_label: '💡 Ön LEDler',
      block_light_on: '[LED] ışığını [COLOR] renginde aç',
      block_light_off: '[LED] ışığını kapat',
      block_audio_label: '🔊 Ses',
      block_bocina: 'korna çal',
      block_play_note: '[NOTA] notasını [DUR] sn çal',
      motor_left: 'SOL / B', motor_right: 'SAĞ / A', stop_both: 'İKİSİ', led_all: 'TÜMÜ'
    },
    pl: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual załadowany! Szukaj bloków na dole lewej palety 👇',
      block_move_label: '🚙 Ruch Jeepa',
      block_move_motor: 'Porusz silnikiem [SIDE] [DIR] z [PCT]%',
      motor_dir_fwd: 'DO PRZODU',
      motor_dir_bwd: 'DO TYŁU',
      block_stop_motor: 'Zatrzymaj silnik [WHICH]',
      block_reset_pos: 'Zresetuj pozycję Jeepa',
      block_pen_label: '✏️ Pisak',
      block_pen_down: 'opuść pisak',
      block_pen_up: 'podnieś pisak',
      block_set_pen_color: 'ustaw kolor pisaka na [COLOR]',
      block_set_pen_size: 'ustaw rozmiar pisaka na [SIZE]',
      block_clear_pen: 'wyczyść wszystko',
      block_sensors_label: '📡 Czujniki',
      block_distance_cm: 'odległość w cm',
      block_line_detected: 'wykryto linię',
      block_leds_label: '💡 Przednie LEDy',
      block_light_on: 'zapal światło [LED] w kolorze [COLOR]',
      block_light_off: 'zgaś światło [LED]',
      block_audio_label: '🔊 Dźwięk',
      block_bocina: 'zagraj klakson',
      block_play_note: 'zagraj nutę [NOTA] przez [DUR] s',
      motor_left: 'LEWY / B', motor_right: 'PRAWY / A', stop_both: 'OBA', led_all: 'WSZYSTKIE'
    },
    nl: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual geladen! Zoek de blokken onderaan het linkerpalet 👇',
      block_move_label: '🚙 Jeep Beweging',
      block_move_motor: 'Beweeg motor [SIDE] [DIR] met [PCT]%',
      motor_dir_fwd: 'VOORUIT',
      motor_dir_bwd: 'ACHTERUIT',
      block_stop_motor: 'Stop motor [WHICH]',
      block_reset_pos: 'Reset Jeep positie',
      block_pen_label: '✏️ Pen',
      block_pen_down: 'pen neer',
      block_pen_up: 'pen omhoog',
      block_set_pen_color: 'zet penkleur op [COLOR]',
      block_set_pen_size: 'zet pendikte op [SIZE]',
      block_clear_pen: 'alles wissen',
      block_sensors_label: '📡 Sensoren',
      block_distance_cm: 'afstand in cm',
      block_line_detected: 'lijn gedetecteerd',
      block_leds_label: '💡 Voor-LEDs',
      block_light_on: 'licht [LED] aan in kleur [COLOR]',
      block_light_off: 'licht [LED] uit',
      block_audio_label: '🔊 Geluid',
      block_bocina: 'claxon',
      block_play_note: 'speel noot [NOTA] gedurende [DUR] s',
      motor_left: 'LINKS / B', motor_right: 'RECHTS / A', stop_both: 'BEIDE', led_all: 'ALLE'
    }
  };

  // ── Toast de extensión cargada ──────────────────────────────────────────
  let jeepToastCssInjected = false;
  function injectJeepToastCSS() {
    if (jeepToastCssInjected) return;
    jeepToastCssInjected = true;
    const style = document.createElement('style');
    style.id = 'rec-jeep-toast-css';
    style.textContent =
      '#rec-jeep-toast { position: fixed; bottom: 1rem; left: 1rem; z-index: 9999; max-width: 320px; background: rgba(40,40,40,0.95); color: #fff; border-left: 4px solid #FF6B35; border-radius: 0.75rem; padding: 0.75rem 1rem; font-family: sans-serif; font-size: 0.95rem; line-height: 1.4; box-shadow: 0 6px 20px rgba(0,0,0,0.25); opacity: 0; transform: translateY(20px); transition: opacity 0.4s ease, transform 0.4s ease; pointer-events: none; }' +
      '#rec-jeep-toast.rec-jeep-toast-visible { opacity: 1; transform: translateY(0); }' +
      '#rec-jeep-toast.rec-jeep-toast-hiding { opacity: 0; transform: translateY(10px); }' +
      '#rec-jeep-toast .rec-jeep-toast-icon { display: inline-block; margin-right: 0.5rem; font-size: 1.1rem; vertical-align: middle; }' +
      '#rec-jeep-toast .rec-jeep-toast-text { vertical-align: middle; display: inline; }';
    document.head.appendChild(style);
  }

  function showJeepLoadedToast() {
    if (!document.body) return;
    injectJeepToastCSS();
    const existing = document.getElementById('rec-jeep-toast');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    const locale = window.currentRecLocale || 'es';
    const dict = I18N_BLOCKS[locale] || I18N_BLOCKS['es'];
    const msg = dict.jeep_loaded_msg || I18N_BLOCKS['es'].jeep_loaded_msg;

    const toast = document.createElement('div');
    toast.id = 'rec-jeep-toast';
    toast.setAttribute('role', 'status');

    const icon = document.createElement('span');
    icon.className = 'rec-jeep-toast-icon';
    icon.textContent = '🚙';

    const text = document.createElement('span');
    text.className = 'rec-jeep-toast-text';
    text.textContent = msg;

    toast.appendChild(icon);
    toast.appendChild(text);
    document.body.appendChild(toast);

    if (toast.offsetWidth) {}

    toast.classList.add('rec-jeep-toast-visible');

    setTimeout(() => {
      toast.classList.remove('rec-jeep-toast-visible');
      toast.classList.add('rec-jeep-toast-hiding');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 400);
    }, 4500);
  }

  // ── Clase de extensión ───────────────────────────────────────────────────
  class RobotJeepVirtualREC {
    constructor() {
      this.jeepToastMostrado = false;
      const tryLink = () => {
        if (!syncAndStart()) setTimeout(tryLink, 500);
      };
      const vm = getVM();
      if (vm && vm.runtime) {
        setTimeout(tryLink, 600);
      } else {
        const waitVM = setInterval(() => {
          if (getVM() && getVM().runtime) {
            clearInterval(waitVM);
            setTimeout(tryLink, 600);
          }
        }, 300);
      }
    }

    getInfo() {
      if (!this.jeepToastMostrado) {
        showJeepLoadedToast();
        this.jeepToastMostrado = true;
      }

      const locale = window.currentRecLocale || 'es';
      const t = key => (I18N_BLOCKS[locale] && I18N_BLOCKS[locale][key]) || I18N_BLOCKS['es'][key] || key;
      const base = new URL('extensionesrec/', document.baseURI).href;

      return {
        id: 'robotJeepVirtualREC',
        name: t('ext_title'),
        color1: '#FF6B35',
        color2: '#E84315',
        color3: '#BF360C',
        menuIconURI: MENU_ICON_URI,
        iconURL: base + 'RobotJeepvirtual.png',
        blocks: [
          { blockType: Scratch.BlockType.LABEL, text: t('block_move_label') },
          {
            opcode: 'moveMotor',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_move_motor'),
            arguments: {
              SIDE: { type: Scratch.ArgumentType.STRING, menu: 'motorSide', defaultValue: 'IZQ' },
              DIR:  { type: Scratch.ArgumentType.STRING, menu: 'motorDir', defaultValue: 'FWD' },
              PCT:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
            }
          },
          {
            opcode: 'moveForward',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_move_motor'),
            arguments: {
              SIDE: { type: Scratch.ArgumentType.STRING, menu: 'motorSide', defaultValue: 'IZQ' },
              DIR:  { type: Scratch.ArgumentType.STRING, menu: 'motorDir', defaultValue: 'FWD' },
              PCT:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
            },
            hideFromPalette: true
          },
          {
            opcode: 'moveBackward',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_move_motor'),
            arguments: {
              SIDE: { type: Scratch.ArgumentType.STRING, menu: 'motorSide', defaultValue: 'IZQ' },
              DIR:  { type: Scratch.ArgumentType.STRING, menu: 'motorDir', defaultValue: 'BWD' },
              PCT:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
            },
            hideFromPalette: true
          },
          {
            opcode: 'stopMotor',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_stop_motor'),
            arguments: {
              WHICH: { type: Scratch.ArgumentType.STRING, menu: 'stopWhich', defaultValue: 'AMBOS' }
            }
          },
          { opcode: 'resetPos', blockType: Scratch.BlockType.COMMAND, text: t('block_reset_pos') },
          
          // ── Bloques de Lápiz ──
          { blockType: Scratch.BlockType.LABEL, text: t('block_pen_label') },
          { opcode: 'penDown', blockType: Scratch.BlockType.COMMAND, text: t('block_pen_down') },
          { opcode: 'penUp', blockType: Scratch.BlockType.COMMAND, text: t('block_pen_up') },
          {
            opcode: 'setPenColor',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_set_pen_color'),
            arguments: {
              COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#0000ff' }
            }
          },
          {
            opcode: 'setPenSize',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_set_pen_size'),
            arguments: {
              SIZE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 3 }
            }
          },
          { opcode: 'clearPen', blockType: Scratch.BlockType.COMMAND, text: t('block_clear_pen') },

          { blockType: Scratch.BlockType.LABEL, text: t('block_sensors_label') },
          { opcode: 'distanceCm', blockType: Scratch.BlockType.REPORTER, text: t('block_distance_cm') },
          { opcode: 'lineDetected', blockType: Scratch.BlockType.BOOLEAN, text: t('block_line_detected') },
          
          { blockType: Scratch.BlockType.LABEL, text: t('block_leds_label') },
          {
            opcode: 'lightOn',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_light_on'),
            arguments: {
              LED: { type: Scratch.ArgumentType.STRING, menu: 'ledWhich', defaultValue: 'TODAS' },
              COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#ffff00' }
            }
          },
          {
            opcode: 'lightOff',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_light_off'),
            arguments: {
              LED: { type: Scratch.ArgumentType.STRING, menu: 'ledWhich', defaultValue: 'TODAS' }
            }
          },

          { blockType: Scratch.BlockType.LABEL, text: t('block_audio_label') },
          { opcode: 'bocina', blockType: Scratch.BlockType.COMMAND, text: t('block_bocina') },
          {
            opcode: 'tocarNota',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_play_note'),
            arguments: {
              NOTA: { type: Scratch.ArgumentType.STRING, menu: 'menuNotas', defaultValue: 'DO' },
              DUR:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.5 }
            }
          },
        ],
        menus: {
          motorSide: {
            acceptReporters: false,
            items: [
              { text: t('motor_left'), value: 'IZQ' },
              { text: t('motor_right'), value: 'DER' },
              { text: t('stop_both'), value: 'AMBOS' }
            ]
          },
          motorDir: {
            acceptReporters: false,
            items: [
              { text: t('motor_dir_fwd'), value: 'FWD' },
              { text: t('motor_dir_bwd'), value: 'BWD' }
            ]
          },
          stopWhich: {
            acceptReporters: false,
            items: [
              { text: t('motor_left'), value: 'IZQ' },
              { text: t('motor_right'), value: 'DER' },
              { text: t('stop_both'), value: 'AMBOS' }
            ]
          },
          ledWhich: {
            acceptReporters: false,
            items: ['1', '2', { text: t('led_all'), value: 'TODAS' }]
          },
          menuNotas: { acceptReporters: true, items: ['DO','RE','MI','FA','SOL','LA','SI','DO5'] }
        }
      };
    }

    // ── Opcodes de Movimiento ─────────────────────────────────────────────
    moveMotor ({ SIDE, DIR, PCT }) {
      const v = (Math.max(0, Math.min(100, +PCT)) / 100) * MAX_V;
      const signedV = DIR === 'BWD' ? -v : v;
      if (SIDE === 'AMBOS') { jeep.vL = signedV; jeep.vR = signedV; }
      else if (SIDE === 'IZQ') jeep.vR = signedV;
      else jeep.vL = signedV;
    }
    moveForward ({ SIDE, PCT }) { this.moveMotor({ SIDE, DIR: 'FWD', PCT }); }
    moveBackward ({ SIDE, PCT }) { this.moveMotor({ SIDE, DIR: 'BWD', PCT }); }
    stopMotor ({ WHICH }) {
      if (WHICH === 'AMBOS') { jeep.vL = 0; jeep.vR = 0; }
      else if (WHICH === 'IZQ') jeep.vR = 0;
      else jeep.vL = 0;
    }

    // ── Opcodes de Lápiz ──────────────────────────────────────────────────
    penDown () {
      isPenDown = true;
      lastPenPos = { x: jeep.x, y: jeep.y };
    }
    penUp () {
      isPenDown = false;
    }
    setPenColor ({ COLOR }) {
      penColorHex = COLOR || '#0000ff';
    }
    setPenSize ({ SIZE }) {
      penSize = Math.max(1, Math.min(50, Number(SIZE) || 3));
    }
    clearPen () {
      const pen = getPenSkin();
      if (pen) {
        pen.renderer.penClear(pen.penSkinId);
        const vm = getVM();
        if (vm && vm.runtime) vm.runtime.requestRedraw();
      }
    }

    // ── Sensores ──────────────────────────────────────────────────────────
    distanceCm ()   { return ultraDist; }
    lineDetected () { return onLine; }

    // ── LEDs ──────────────────────────────────────────────────────────────
    async lightOn ({ LED, COLOR }) {
      const t = getTarget();
      if (t && !baseSvgText) await fetchBaseSvg(t);
      const c = COLOR || '#ffff00';
      if (LED === '1' || LED === 'TODAS') { led1On = true; led1Color = c; }
      if (LED === '2' || LED === 'TODAS') { led2On = true; led2Color = c; }
      applyLedVisual();
    }
    lightOff ({ LED }) {
      if (LED === '1' || LED === 'TODAS') led1On = false;
      if (LED === '2' || LED === 'TODAS') led2On = false;
      applyLedVisual();
    }

    // ── Audio ─────────────────────────────────────────────────────────────
    bocina () {
      playTone(880, 'square', 0.15);
      setTimeout(() => playTone(660, 'square', 0.1), 190);
    }
    tocarNota ({ NOTA, DUR }) {
      const freq = NOTES[String(NOTA).toUpperCase()] || 440;
      playTone(freq, 'sine', Math.max(0.05, Number(DUR) || 0.5));
    }

    // ── Control ───────────────────────────────────────────────────────────
    resetPos () {
      resetting = true;
      jeep.vL  = 0;
      jeep.vR  = 0;
      jeep.x   = homePos.x;
      jeep.y   = homePos.y;
      jeep.dir = homePos.dir;
      lastPenPos = { x: homePos.x, y: homePos.y };
      
      const t = getTarget();
      if (t) {
        t.rotationStyle = 'all around';
        t.setXY(homePos.x, homePos.y);
        t.setDirection(homePos.dir);
        jeep.dir = (((t.direction % 360) + 360) % 360);
        lastSetX = homePos.x;
        lastSetY = homePos.y;
        
        const vm = getVM();
        if (vm && vm.runtime) vm.runtime.requestRedraw();
      }
    }
  }

  Scratch.extensions.register(new RobotJeepVirtualREC());
})(Scratch);