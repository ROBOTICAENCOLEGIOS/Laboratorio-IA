// ── REESCRITURA: Sprite nativo en el escenario de Scratch ──────────────────
(function(Scratch) {
  'use strict';
  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Robot Jeep Virtual requiere modo unsandboxed.');
  }

  // ─── Constantes de física ──────────────────────────────────────────────────
  const FRICTION = 0.88;
  const MAX_V    = 160;   // unidades Scratch/s (≈ px del escenario)
  const MAX_W    = 150;   // grados/s

  const NOTES = {
    DO:261.63, RE:293.66, MI:329.63, FA:349.23,
    SOL:392.00, LA:440.00, SI:493.88, DO5:523.25
  };

  // ─── Nombre del sprite ─────────────────────────────────────────────────────
  const SPRITE_NAME = 'RECrobotJeepAuto';

  // ─── Estado del Jeep (coordenadas Scratch: y+ arriba) ─────────────────────
  const jeep = { x: 0, y: 0, dir: 90, v: 0, w: 0, leftLed: false, rightLed: false };
  let ultraDist = 100, onLine = false, rafId = null, lastTs = null;

  // ─── Audio Web API (100% offline) ─────────────────────────────────────────
  let audioCtx = null;
  function getAudio() {
    return audioCtx || (audioCtx = new (window.AudioContext || window.webkitAudioContext)());
  }
  function playTone(freq, type, dur) {
    try {
      const ac = getAudio(), osc = ac.createOscillator(), g = ac.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, ac.currentTime);
      g.gain.setValueAtTime(0.28, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
      osc.connect(g); g.connect(ac.destination);
      osc.start(); osc.stop(ac.currentTime + dur);
    } catch(e) {}
  }

  // ─── SVG del Jeep (top-down, frente hacia la derecha = dir 90) ────────────
  // Disfraz 0: LEDs apagados  |  Disfraz 1: LEDs encendidos
  function makeJeepSVG(leftLed, rightLed) {
    const ll = (leftLed)  ? '#FFEE58' : '#1a1a1a';
    const rl = (rightLed) ? '#FFEE58' : '#1a1a1a';
    const ls = (leftLed)  ? '#FDD835' : '#555';
    const rs = (rightLed) ? '#FDD835' : '#555';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="52" viewBox="0 0 80 52">
  <rect x="4" y="6" width="68" height="40" rx="5" fill="#E64A19" stroke="#BF360C" stroke-width="2"/>
  <rect x="12" y="14" width="36" height="24" rx="3" fill="#BF360C"/>
  <rect x="52" y="14" width="14" height="24" rx="2" fill="rgba(130,205,255,0.52)" stroke="#90CAF9" stroke-width="1"/>
  <rect x="0"  y="3"  width="16" height="10" rx="2" fill="#212121" stroke="#424242" stroke-width="0.8"/>
  <rect x="62" y="3"  width="16" height="10" rx="2" fill="#212121" stroke="#424242" stroke-width="0.8"/>
  <rect x="0"  y="39" width="16" height="10" rx="2" fill="#212121" stroke="#424242" stroke-width="0.8"/>
  <rect x="62" y="39" width="16" height="10" rx="2" fill="#212121" stroke="#424242" stroke-width="0.8"/>
  <circle cx="77" cy="15" r="5" fill="${ll}" stroke="${ls}" stroke-width="1.2"/>
  <circle cx="77" cy="37" r="5" fill="${rl}" stroke="${rs}" stroke-width="1.2"/>
  <rect x="74" y="22" width="9" height="8" rx="1" fill="#F50057" stroke="#C51162" stroke-width="1"/>
</svg>`;
  }

  // ─── Helpers de VM ────────────────────────────────────────────────────────
  function getVM()     { return window.vm || Scratch.vm; }
  function getTarget() {
    const vm = getVM(); if (!vm) return null;
    return vm.runtime.targets.find(t => !t.isStage && t.sprite && t.sprite.name === SPRITE_NAME) || null;
  }

  // ─── Registrar SVG en storage (TurboWarp / scratch-storage) ──────────────
  function storeAsset(vm, svgString, assetId) {
    try {
      const st = vm.runtime.storage;
      if (!st || !st.AssetType) return;
      const data = new TextEncoder().encode(svgString);
      const asset = st.createAsset(st.AssetType.ImageVector, 'svg', data, assetId, false);
      if (st.store) st.store(asset);
    } catch(e) { console.warn('[Jeep] storeAsset:', e.message); }
  }

  // ─── Inyectar el Sprite en el escenario ───────────────────────────────────
  async function addJeepSprite() {
    const vm = getVM();
    if (!vm) { console.error('[Jeep] VM no disponible'); return; }

    if (getTarget()) { startPhysics(); return; } // ya existe, solo arrancar física

    const id0 = 'rec-jeep-leds-off-v2';
    const id1 = 'rec-jeep-leds-on-v2';

    storeAsset(vm, makeJeepSVG(false, false), id0);
    storeAsset(vm, makeJeepSVG(true,  true),  id1);

    const spriteJSON = JSON.stringify({
      isStage: false, name: SPRITE_NAME,
      variables: {}, lists: {}, broadcasts: {}, blocks: {}, comments: {},
      currentCostume: 0,
      costumes: [
        { name: 'jeep-leds-off', bitmapResolution: 1, dataFormat: 'svg',
          assetId: id0, md5ext: id0 + '.svg', rotationCenterX: 40, rotationCenterY: 26 },
        { name: 'jeep-leds-on',  bitmapResolution: 1, dataFormat: 'svg',
          assetId: id1, md5ext: id1 + '.svg', rotationCenterX: 40, rotationCenterY: 26 }
      ],
      sounds: [], volume: 100, visible: true,
      x: 0, y: 0, size: 80, direction: 90,
      draggable: true, rotationStyle: 'all around'
    });

    try {
      await vm.addSprite(spriteJSON);
      startPhysics();
    } catch(e) { console.error('[Jeep] addSprite error:', e); }
  }

  // ─── Bucle de física (RAF) ────────────────────────────────────────────────
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

  // ─── Cinemática diferencial ───────────────────────────────────────────────
  // Convenio Scratch: dir 0=arriba (+y), 90=derecha (+x), 180=abajo (-y)
  // dx = sin(dir_rad), dy = cos(dir_rad)  →  x += v·sin·Δt, y += v·cos·Δt
  function physicsStep(dt) {
    const rad = jeep.dir * Math.PI / 180;
    jeep.x += jeep.v * Math.sin(rad) * dt;
    jeep.y += jeep.v * Math.cos(rad) * dt;
    jeep.dir = ((jeep.dir + jeep.w * dt) % 360 + 360) % 360;

    jeep.v *= FRICTION;
    jeep.w *= FRICTION;
    if (Math.abs(jeep.v) < 0.4)  jeep.v = 0;
    if (Math.abs(jeep.w) < 0.15) jeep.w = 0;

    // Límites del escenario Scratch (±240 x, ±180 y)
    jeep.x = Math.max(-230, Math.min(230, jeep.x));
    jeep.y = Math.max(-170, Math.min(170, jeep.y));

    // Actualizar sensores y sprite
    updateUltrasound();
    const t = getTarget();
    if (t) {
      t.setXY(jeep.x, jeep.y);
      t.setDirection(jeep.dir);
      updateLineSensor(t);
      updateLedCostume(t);
    }
  }

  // ─── Ultrasonido: raycasting analítico hasta borde del escenario ──────────
  // Proyecta el vector frontal e intersecta con los límites del stage (rectángulo).
  function updateUltrasound() {
    const rad = jeep.dir * Math.PI / 180;
    const dx = Math.sin(rad);
    const dy = Math.cos(rad);
    const EPS = 1e-6;
    let tMin = 999;

    if (Math.abs(dx) > EPS) {
      const t1 = (dx > 0) ? (230 - jeep.x) / dx : (-230 - jeep.x) / dx;
      if (t1 > 0) tMin = Math.min(tMin, t1);
    }
    if (Math.abs(dy) > EPS) {
      const t2 = (dy > 0) ? (170 - jeep.y) / dy : (-170 - jeep.y) / dy;
      if (t2 > 0) tMin = Math.min(tMin, t2);
    }

    // También revisar distancia a otros sprites
    const vm = getVM();
    if (vm) {
      vm.runtime.targets.forEach(t => {
        if (t.isStage || (t.sprite && t.sprite.name === SPRITE_NAME)) return;
        const dsx = t.x - jeep.x, dsy = t.y - jeep.y;
        const proj = dsx * dx + dsy * dy;
        if (proj > 0) {
          const perp = Math.abs(dsx * dy - dsy * dx);
          if (perp < 20) tMin = Math.min(tMin, proj);
        }
      });
    }

    ultraDist = Math.max(0, Math.round(tMin * 0.42));
  }

  // ─── Sensor de línea: color rojo del disfraz tocando negro del escenario ──
  // El rectángulo rojo (#F50057) en la nariz del disfraz detecta líneas negras.
  function updateLineSensor(target) {
    try {
      const vm = getVM();
      const renderer = vm && vm.runtime && vm.runtime.renderer;
      if (!renderer || target.drawableID === undefined) { onLine = false; return; }
      onLine = !!(renderer.colorIsTouchingColor &&
                  renderer.colorIsTouchingColor(target.drawableID, [245, 0, 87], [0, 0, 0], 15));
    } catch(e) { onLine = false; }
  }

  // ─── LEDs: cambiar disfraz 0 (off) ↔ 1 (on) ──────────────────────────────
  function updateLedCostume(target) {
    const idx = (jeep.leftLed || jeep.rightLed) ? 1 : 0;
    if (target.currentCostume !== idx) {
      target.currentCostume = idx;
      if (target.runtime && target.runtime.requestRedraw) target.runtime.requestRedraw();
    }
  }

  // ─── Clase de extensión Scratch ───────────────────────────────────────────
  class RobotJeepVirtual {
    getInfo() {
      const base = new URL('extensionesrec/', document.baseURI).href;
      return {
        id: 'robotJeepVirtualREC',
        name: 'Robot Jeep Virtual',
        color1: '#FF6B35', color2: '#E84315', color3: '#BF360C',
        menuIconURI: base + 'RobotJeepvirtual.png',
        blocks: [
          { blockType: Scratch.BlockType.LABEL, text: '🚙 Movimiento del Jeep' },
          {
            opcode: 'moverAdelante', blockType: Scratch.BlockType.COMMAND,
            text: 'mover adelante [VEL] %',
            arguments: { VEL: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 } }
          },
          {
            opcode: 'moverAtras', blockType: Scratch.BlockType.COMMAND,
            text: 'mover atrás [VEL] %',
            arguments: { VEL: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 } }
          },
          {
            opcode: 'girarIzquierda', blockType: Scratch.BlockType.COMMAND,
            text: 'girar izquierda [VEL] %',
            arguments: { VEL: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 } }
          },
          {
            opcode: 'girarDerecha', blockType: Scratch.BlockType.COMMAND,
            text: 'girar derecha [VEL] %',
            arguments: { VEL: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 } }
          },
          { opcode: 'detener', blockType: Scratch.BlockType.COMMAND, text: 'detener Jeep' },
          { blockType: Scratch.BlockType.LABEL, text: '📡 Sensores' },
          {
            opcode: 'distanciaUltra', blockType: Scratch.BlockType.REPORTER,
            text: 'distancia al obstáculo (cm)'
          },
          {
            opcode: 'sensorLinea', blockType: Scratch.BlockType.BOOLEAN,
            text: '¿sensor de línea activo?'
          },
          { blockType: Scratch.BlockType.LABEL, text: '💡 LEDs frontales' },
          {
            opcode: 'setLed', blockType: Scratch.BlockType.COMMAND,
            text: 'LED [LADO] [EST]',
            arguments: {
              LADO: { type: Scratch.ArgumentType.STRING, menu: 'LADOS', defaultValue: 'izquierdo' },
              EST:  { type: Scratch.ArgumentType.STRING, menu: 'ONOFF', defaultValue: 'ON' }
            }
          },
          { blockType: Scratch.BlockType.LABEL, text: '🔊 Audio offline' },
          { opcode: 'bocina', blockType: Scratch.BlockType.COMMAND, text: 'sonar bocina' },
          {
            opcode: 'tocarNota', blockType: Scratch.BlockType.COMMAND,
            text: 'tocar nota [NOTA] por [DUR] seg',
            arguments: {
              NOTA: { type: Scratch.ArgumentType.STRING, menu: 'NOTAS', defaultValue: 'DO' },
              DUR:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.5 }
            }
          },
          { blockType: Scratch.BlockType.LABEL, text: '🎮 Control' },
          { opcode: 'iniciar',   blockType: Scratch.BlockType.COMMAND, text: 'iniciar Jeep en el escenario' },
          { opcode: 'resetPos',  blockType: Scratch.BlockType.COMMAND, text: 'reiniciar posición del Jeep' }
        ],
        menus: {
          LADOS: { acceptReporters: false, items: ['izquierdo', 'derecho'] },
          ONOFF: { acceptReporters: false, items: ['ON', 'OFF'] },
          NOTAS: { acceptReporters: true,  items: ['DO','RE','MI','FA','SOL','LA','SI','DO5'] }
        }
      };
    }

    iniciar()             { addJeepSprite(); }
    moverAdelante({VEL})  { jeep.v =  Math.max(0, Math.min(100, +VEL)) / 100 * MAX_V; }
    moverAtras({VEL})     { jeep.v = -Math.max(0, Math.min(100, +VEL)) / 100 * MAX_V; }
    girarIzquierda({VEL}) { jeep.v = Math.max(0, Math.min(100, +VEL)) / 100 * (MAX_V * 0.6); jeep.w = -MAX_W; }
    girarDerecha({VEL})   { jeep.v = Math.max(0, Math.min(100, +VEL)) / 100 * (MAX_V * 0.6); jeep.w =  MAX_W; }
    detener()             { jeep.v = 0; jeep.w = 0; }
    distanciaUltra()      { return ultraDist; }
    sensorLinea()         { return onLine; }
    setLed({LADO, EST}) {
      const on = String(EST).toUpperCase() === 'ON';
      if (String(LADO) === 'izquierdo') jeep.leftLed = on; else jeep.rightLed = on;
    }
    bocina() {
      playTone(880, 'square', 0.15);
      setTimeout(() => playTone(660, 'square', 0.1), 190);
    }
    tocarNota({NOTA, DUR}) {
      playTone(NOTES[String(NOTA).toUpperCase()] || 440, 'sine', Number(DUR) || 0.5);
    }
    resetPos() {
      jeep.x = 0; jeep.y = 0; jeep.dir = 90; jeep.v = 0; jeep.w = 0;
      jeep.leftLed = false; jeep.rightLed = false;
      const t = getTarget();
      if (t) { t.setXY(0, 0); t.setDirection(90); }
    }
  }

  Scratch.extensions.register(new RobotJeepVirtual());
})(Scratch);
