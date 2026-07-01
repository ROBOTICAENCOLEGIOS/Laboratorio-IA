// ── Robot Jeep Virtual REC v2.2 ─────────────────────────────────────────────
// Enlaza al sprite preexistente "RECRobotJeepAuto". Sin vm.addSprite().
// Sensor de línea: renderer.sampleColor4b en el punto sensor delantero.
// Sensores de distancia calibrados. Motores sin fricción (persistentes).
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

  // Nombre exacto del sprite que ya viene precargado en la plataforma
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

  // ── Estado de LEDs ─────────────────────────────────────────────────────────
  // LED 1 = faro DERECHO  (cy=16 en el SVG, parte superior de la imagen)
  // LED 2 = faro IZQUIERDO (cy=47 en el SVG, parte inferior de la imagen)
  let led1On    = false;
  let led2On    = false;
  let led1Color = '#ffff00';   // color independiente por faro
  let led2Color = '#ffff00';
  let baseSvgText = null;
  let ledSkinId   = null;

  // ── Audio Web API (offline) ─────────────────────────────────────────────
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

  // ── Helpers VM ──────────────────────────────────────────────────────────
  function getVM() {
    return (Scratch && Scratch.vm) ? Scratch.vm : window.vm;
  }

  // Busca el sprite por nombre exacto; si no lo encuentra usa el primer sprite.
  function getTarget() {
    const vm = getVM();
    if (!vm) return null;
    const byName = vm.runtime.targets.find(
      t => !t.isStage && t.sprite && t.sprite.name === SPRITE_NAME
    );
    if (byName) return byName;
    // Fallback: primer sprite no-escenario disponible
    return vm.runtime.targets.find(t => !t.isStage) || null;
  }

  // ── LED: obtener SVG original del disfraz ──────────────────────────────
  // Intenta 2 métodos en orden:
  //  1. costume.asset.data (Uint8Array en memoria del runtime)
  //  2. fetch() del archivo en el servidor
  async function fetchBaseSvg(target) {
    if (baseSvgText) return true;

    // Método 1: desde el asset en memoria del runtime
    try {
      const costume = target.sprite && target.sprite.costumes[0];
      if (costume && costume.asset && costume.asset.data) {
        baseSvgText = new TextDecoder().decode(costume.asset.data);
        if (baseSvgText && baseSvgText.includes('<svg')) {
          console.info('[Jeep LED] SVG obtenido desde costume.asset.data');
          return true;
        }
        baseSvgText = null;
      }
    } catch (e) { /* continuar con método 2 */ }

    // Método 2: fetch desde el servidor
    try {
      const base    = new URL('extensionesrec/', document.baseURI).href;
      const assetId = (target.sprite && target.sprite.costumes[0] &&
                       target.sprite.costumes[0].assetId) ||
                      '4ef9ac16f7933b898664438a0767a697';
      const resp    = await fetch(base + assetId + '.svg');
      if (resp.ok) {
        baseSvgText = await resp.text();
        console.info('[Jeep LED] SVG obtenido desde servidor:', base + assetId + '.svg');
        return true;
      }
    } catch (e) {
      console.warn('[Jeep LED] fetchBaseSvg falló:', e.message);
    }

    return false;
  }

  // ── LED: generar SVG compuesto (imagen original + círculos de faro) ──────
  // cx=74  → frente del Jeep (borde derecho del viewBox)
  // cy=40  → LED 1 (faro DERECHO),  posición visual derecha en el escenario
  // cy=21  → LED 2 (faro IZQUIERDO), posición visual izquierda en el escenario
  function makeLedSvg(baseSvg) {
    const defs =
      '<defs><filter id="jglow" x="-60%" y="-60%" width="220%" height="220%">' +
      '<feGaussianBlur stdDeviation="3" result="blur"/>' +
      '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter></defs>';
    let circles = '';
    if (led1On) {
      circles += `<circle cx="74" cy="40" r="5" fill="${led1Color}" opacity="0.95" filter="url(#jglow)"/>`;
    }
    if (led2On) {
      circles += `<circle cx="74" cy="21" r="5" fill="${led2Color}" opacity="0.95" filter="url(#jglow)"/>`;
    }
    return baseSvg.replace('</svg>', defs + circles + '</svg>');
  }

  // ── LED: aplicar / retirar el skin compuesto ──────────────────────────────
  function applyLedVisual() {
    const t = getTarget();
    if (!t) return;
    const vm       = getVM();
    const renderer = vm && vm.runtime && vm.runtime.renderer;
    if (!renderer || !baseSvgText) return;

    const anyOn = led1On || led2On;
    if (anyOn) {
      const ledSvg = makeLedSvg(baseSvgText);
      if (ledSkinId === null) {
        ledSkinId = renderer.createSVGSkin(ledSvg, [40, 31.5]);
      } else {
        renderer.updateSVGSkin(ledSkinId, ledSvg, [40, 31.5]);
      }
      renderer.updateDrawableSkinId(t.drawableID, ledSkinId);
    } else {
      // Restaurar skin original del costume 0
      const origSkinId = t.sprite && t.sprite.costumes[0] && t.sprite.costumes[0].skinId;
      if (origSkinId !== undefined) {
        renderer.updateDrawableSkinId(t.drawableID, origSkinId);
      }
    }
    vm.runtime.requestRedraw();
  }

  // ── Arranque: sincroniza estado con el sprite preexistente ───────────────
  function syncAndStart() {
    const t = getTarget();
    if (!t) return false;
    jeep.x   = t.x;
    jeep.y   = t.y;
    jeep.dir = t.direction;
    homePos  = { x: t.x, y: t.y, dir: t.direction };
    lastSetX = t.x;
    lastSetY = t.y;
    t.draggable = true;
    if (!rafId) startPhysics();
    // Pre-fetch del SVG para tener listos los LEDs sin demora
    fetchBaseSvg(t).catch(() => {});
    console.info('[Jeep] Enlazado a sprite "' + (t.sprite && t.sprite.name) + '" en (' + t.x + ',' + t.y + ')');
    return true;
  }

  // ── Bucle de física (RAF) ────────────────────────────────────────────────
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

  // ── Cinemática diferencial — motores persistentes, sin fricción ──────────
  function physicsStep(dt) {
    const v    = (jeep.vL + jeep.vR) / 2;
    const wDeg = (jeep.vR - jeep.vL) * TURN_SCALE;
    const rad  = (jeep.dir * Math.PI) / 180;

    jeep.x  += v * Math.sin(rad) * dt;
    jeep.y  += v * Math.cos(rad) * dt;
    jeep.dir = (((jeep.dir + wDeg * dt) % 360) + 360) % 360;

    jeep.x = Math.max(-230, Math.min(230, jeep.x));
    jeep.y = Math.max(-170, Math.min(170, jeep.y));

    const t = getTarget();
    if (!t) return;

    // Detección de arrastre: compara posición del sprite vs lo que escribimos el frame anterior
    const DRAG_THRESHOLD = 4;
    const driftX = t.x - lastSetX;
    const driftY = t.y - lastSetY;
    if (Math.abs(driftX) > DRAG_THRESHOLD || Math.abs(driftY) > DRAG_THRESHOLD) {
      jeep.x  = t.x;
      jeep.y  = t.y;
      jeep.vL = 0;
      jeep.vR = 0;
      homePos = { x: t.x, y: t.y, dir: jeep.dir };
    }

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

    // Raycasting hasta bordes del escenario
    if (Math.abs(dx) > EPS) {
      const t1 = dx > 0 ? (230 - jeep.x) / dx : (-230 - jeep.x) / dx;
      if (t1 > 0) tBorder = Math.min(tBorder, t1);
    }
    if (Math.abs(dy) > EPS) {
      const t2 = dy > 0 ? (170 - jeep.y) / dy : (-170 - jeep.y) / dy;
      if (t2 > 0) tBorder = Math.min(tBorder, t2);
    }

    // Raycasting hacia otros sprites
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

    // Distancia calibrada
    let distCm;
    if (tSprite < tBorder) {
      distCm = Math.round(tSprite * SCALE_CM) - SPRITE_OFFSET;
    } else {
      distCm = Math.round(tBorder * SCALE_CM) - BORDER_OFFSET;
    }
    ultraDist = Math.max(0, distCm);

    // ── Sensor de línea: muestreo de píxel en el punto delantero ─────────
    // Calcula el punto del sensor (SENSOR_DIST unidades adelante del centro).
    // Usa renderer.sampleColor4b sobre todos los drawables EXCEPTO el Jeep.
    // Si el pixel muestreado es negro (R,G,B < LINE_THRESH) → onLine = true.
    try {
      const renderer = vm && vm.runtime && vm.runtime.renderer;
      if (renderer && renderer._visibleDrawList && renderer._allDrawables) {
        const sensorX = jeep.x + SENSOR_DIST * dx;
        const sensorY = jeep.y + SENSOR_DIST * dy;

        // Lista de drawables visibles, excluyendo el sprite del Jeep
        const drawables = renderer._visibleDrawList
          .filter(id => id !== target.drawableID)
          .map(id => ({ id, drawable: renderer._allDrawables[id] }))
          .filter(d => d.drawable);

        const pixel = new Uint8ClampedArray(4);
        renderer.sampleColor4b([sensorX, sensorY], drawables, pixel);

        // Negro: R, G, B todos por debajo del umbral y alpha sólido
        onLine = pixel[0] < LINE_THRESH &&
                 pixel[1] < LINE_THRESH &&
                 pixel[2] < LINE_THRESH &&
                 pixel[3] > 128;
      }
    } catch (e) { /* ignorar errores del renderer */ }
  }

  // ── Ícono de categoría: círculo naranja limpio ───────────────────────────
  const MENU_ICON_URI =
    'data:image/svg+xml;base64,' +
    btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">' +
         '<circle cx="20" cy="20" r="20" fill="#FF6B35"/>' +
         '</svg>');

  // ── Clase de extensión ───────────────────────────────────────────────────
  class RobotJeepVirtualREC {
    constructor() {
      // Intentar enlazar al sprite preexistente (con reintentos)
      const tryLink = () => {
        if (!syncAndStart()) setTimeout(tryLink, 500);
      };
      const vm = getVM();
      if (vm && vm.runtime) {
        setTimeout(tryLink, 600);
      } else {
        // Esperar al VM antes de intentar
        const waitVM = setInterval(() => {
          if (getVM() && getVM().runtime) {
            clearInterval(waitVM);
            setTimeout(tryLink, 600);
          }
        }, 300);
      }
    }

    getInfo() {
      const base = new URL('extensionesrec/', document.baseURI).href;
      return {
        id:          'robotJeepVirtualREC',
        name:        'Robot Jeep Virtual',
        color1:      '#FF6B35',
        color2:      '#E84315',
        color3:      '#BF360C',
        menuIconURI: MENU_ICON_URI,
        iconURL:     base + 'RobotJeepvirtual.png',
        blocks: [
          { blockType: Scratch.BlockType.LABEL, text: '🚙 Movimiento del Jeep' },
          {
            opcode: 'moveForward',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Mover motor [SIDE] hacia ADELANTE a [PCT]%',
            arguments: {
              SIDE: { type: Scratch.ArgumentType.STRING, menu: 'motorSide', defaultValue: 'IZQ' },
              PCT:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
            }
          },
          {
            opcode: 'moveBackward',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Mover motor [SIDE] hacia ATRAS a [PCT]%',
            arguments: {
              SIDE: { type: Scratch.ArgumentType.STRING, menu: 'motorSide', defaultValue: 'IZQ' },
              PCT:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
            }
          },
          {
            opcode: 'stopMotor',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Detener motor [WHICH]',
            arguments: {
              WHICH: { type: Scratch.ArgumentType.STRING, menu: 'stopWhich', defaultValue: 'AMBOS' }
            }
          },
          { opcode: 'resetPos', blockType: Scratch.BlockType.COMMAND, text: 'reiniciar posición del Jeep' },
          { blockType: Scratch.BlockType.LABEL, text: '📡 Sensores' },
          { opcode: 'distanceCm',   blockType: Scratch.BlockType.REPORTER, text: 'Distancia en cm' },
          { opcode: 'lineDetected', blockType: Scratch.BlockType.BOOLEAN,  text: 'Detecta linea' },
          { blockType: Scratch.BlockType.LABEL, text: '💡 LEDs frontales' },
          {
            opcode: 'lightOn',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Encender Luz [LED] en color [COLOR]',
            arguments: {
              LED:   { type: Scratch.ArgumentType.STRING, menu: 'ledWhich', defaultValue: 'TODAS' },
              COLOR: { type: Scratch.ArgumentType.COLOR,  defaultValue: '#ffff00' }
            }
          },
          {
            opcode: 'lightOff',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Apagar Luz [LED]',
            arguments: {
              LED: { type: Scratch.ArgumentType.STRING, menu: 'ledWhich', defaultValue: 'TODAS' }
            }
          },
          { blockType: Scratch.BlockType.LABEL, text: '🔊 Audio' },
          { opcode: 'bocina', blockType: Scratch.BlockType.COMMAND, text: 'sonar bocina' },
          {
            opcode: 'tocarNota',
            blockType: Scratch.BlockType.COMMAND,
            text: 'tocar nota [NOTA] por [DUR] seg',
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
              { text: 'IZQUIERDO / B', value: 'IZQ' },
              { text: 'DERECHO / A',   value: 'DER' }
            ]
          },
          stopWhich: {
            acceptReporters: false,
            items: [
              { text: 'IZQUIERDO / B', value: 'IZQ' },
              { text: 'DERECHO / A',   value: 'DER' },
              { text: 'AMBOS',         value: 'AMBOS' }
            ]
          },
          ledWhich:  { acceptReporters: false, items: ['1', '2', 'TODAS'] },
          menuNotas: { acceptReporters: true,  items: ['DO','RE','MI','FA','SOL','LA','SI','DO5'] }
        }
      };
    }

    // ── Movimiento ────────────────────────────────────────────────────────
    moveForward ({ SIDE, PCT }) {
      const v = (Math.max(0, Math.min(100, +PCT)) / 100) * MAX_V;
      if (SIDE === 'IZQ') jeep.vR = v; else jeep.vL = v;
    }
    moveBackward ({ SIDE, PCT }) {
      const v = -((Math.max(0, Math.min(100, +PCT)) / 100) * MAX_V);
      if (SIDE === 'IZQ') jeep.vR = v; else jeep.vL = v;
    }
    stopMotor ({ WHICH }) {
      if (WHICH === 'AMBOS') { jeep.vL = 0; jeep.vR = 0; }
      else if (WHICH === 'IZQ') jeep.vR = 0;
      else jeep.vL = 0;
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
      jeep.x   = homePos.x;
      jeep.y   = homePos.y;
      jeep.dir = homePos.dir;
      jeep.vL  = 0;
      jeep.vR  = 0;
      const t = getTarget();
      if (t) {
        t.setXY(homePos.x, homePos.y);
        t.setDirection(homePos.dir);
        lastSetX = homePos.x;
        lastSetY = homePos.y;
      }
    }
  }

  Scratch.extensions.register(new RobotJeepVirtualREC());
})(Scratch);
