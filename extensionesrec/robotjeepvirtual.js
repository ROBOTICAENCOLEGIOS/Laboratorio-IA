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
  let resetting = false;  // Bandera para evitar interferencia del bucle de física durante reset

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
    jeep.dir = (((t.direction % 360) + 360) % 360);
    homePos  = { x: t.x, y: t.y, dir: jeep.dir };
    lastSetX = t.x;
    lastSetY = t.y;
    t.draggable = true;
    t.rotationStyle = 'all around';
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
    const t = getTarget();
    if (!t) return;

    // Si estamos en proceso de reset, no actualizar física para evitar interferencia
    if (resetting) {
      resetting = false;
      return;
    }

    // Leer la dirección nativa del sprite para que los bloques nativos
    // "apuntar en dirección" / "apuntar hacia" tengan efecto.
    t.rotationStyle = 'all around';
    jeep.dir = (((t.direction % 360) + 360) % 360);

    const v    = (jeep.vL + jeep.vR) / 2;
    const wDeg = (jeep.vR - jeep.vL) * TURN_SCALE;
    const rad  = (jeep.dir * Math.PI) / 180;

    jeep.x  += v * Math.sin(rad) * dt;
    jeep.y  += v * Math.cos(rad) * dt;
    jeep.dir = (((jeep.dir + wDeg * dt) % 360) + 360) % 360;

    jeep.x = Math.max(-230, Math.min(230, jeep.x));
    jeep.y = Math.max(-170, Math.min(170, jeep.y));

    // Detección de arrastre: compara posición del sprite vs lo que escribimos el frame anterior
    const DRAG_THRESHOLD = 4;
    const driftX = t.x - lastSetX;
    const driftY = t.y - lastSetY;
    if (Math.abs(driftX) > DRAG_THRESHOLD || Math.abs(driftY) > DRAG_THRESHOLD) {
      jeep.x  = t.x;
      jeep.y  = t.y;
      jeep.vL = 0;
      jeep.vR = 0;
      homePos = { x: t.x, y: t.y, dir: t.direction };
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

  // ── Traducciones de bloques (15 idiomas) ─────────────────────────────────
  const I18N_BLOCKS = {
    es: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: '¡Robot Jeep Virtual cargado! Busca los bloques al final de la paleta izquierda 👇',
      block_move_label: '🚙 Movimiento del Jeep',
      block_move_fwd: 'Mover motor [SIDE] hacia ADELANTE a [PCT]%',
      block_move_bwd: 'Mover motor [SIDE] hacia ATRAS a [PCT]%',
      block_stop_motor: 'Detener motor [WHICH]',
      block_reset_pos: 'reiniciar posición del Jeep',
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
      block_move_fwd: 'Move [SIDE] motor FORWARD at [PCT]%',
      block_move_bwd: 'Move [SIDE] motor BACKWARD at [PCT]%',
      block_stop_motor: 'Stop [WHICH] motor',
      block_reset_pos: 'reset Jeep position',
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
      block_move_fwd: 'Mover motor [SIDE] para FRENTE a [PCT]%',
      block_move_bwd: 'Mover motor [SIDE] para TRÁS a [PCT]%',
      block_stop_motor: 'Parar motor [WHICH]',
      block_reset_pos: 'reiniciar posição do Jeep',
      block_sensors_label: '📡 Sensores',
      block_distance_cm: 'distância em cm',
      block_line_detected: 'detecta linha',
      block_leds_label: '💡 LEDs frontais',
      block_light_on: 'Acender luz [LED] na cor [COLOR]',
      block_light_off: 'Apagar luz [LED]',
      block_audio_label: '🔊 Áudio',
      block_bocina: 'tocar buzina',
      block_play_note: 'tocar nota [NOTA] por [DUR] seg',
      motor_left: 'ESQUERDO / B',
      motor_right: 'DIREITO / A',
      stop_both: 'AMBOS',
      led_all: 'TODAS'
    },
    fr: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual chargé ! Retrouve les blocs en bas de la palette à gauche 👇',
      block_move_label: '🚙 Mouvement du Jeep',
      block_move_fwd: 'Avancer le moteur [SIDE] à [PCT]%',
      block_move_bwd: 'Reculer le moteur [SIDE] à [PCT]%',
      block_stop_motor: 'Arrêter le moteur [WHICH]',
      block_reset_pos: 'réinitialiser la position du Jeep',
      block_sensors_label: '📡 Capteurs',
      block_distance_cm: 'distance en cm',
      block_line_detected: 'détecte la ligne',
      block_leds_label: '💡 LEDs frontales',
      block_light_on: 'Allumer la LED [LED] de couleur [COLOR]',
      block_light_off: 'Éteindre la LED [LED]',
      block_audio_label: '🔊 Audio',
      block_bocina: 'klaxonner',
      block_play_note: 'jouer la note [NOTA] pendant [DUR] s',
      motor_left: 'GAUCHE / B',
      motor_right: 'DROITE / A',
      stop_both: 'LES DEUX',
      led_all: 'TOUTES'
    },
    de: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual geladen! Die Blöcke findest du unten in der linken Palette 👇',
      block_move_label: '🚙 Jeep-Bewegung',
      block_move_fwd: 'Motor [SIDE] um [PCT]% VORWÄRTS bewegen',
      block_move_bwd: 'Motor [SIDE] um [PCT]% RÜCKWÄRTS bewegen',
      block_stop_motor: 'Motor [WHICH] stoppen',
      block_reset_pos: 'Jeep-Position zurücksetzen',
      block_sensors_label: '📡 Sensoren',
      block_distance_cm: 'Entfernung in cm',
      block_line_detected: 'Linie erkannt',
      block_leds_label: '💡 Front-LEDs',
      block_light_on: 'LED [LED] in Farbe [COLOR] einschalten',
      block_light_off: 'LED [LED] ausschalten',
      block_audio_label: '🔊 Audio',
      block_bocina: 'Hupe ertönen',
      block_play_note: 'Note [NOTA] für [DUR] s spielen',
      motor_left: 'LINKS / B',
      motor_right: 'RECHTS / A',
      stop_both: 'BEIDE',
      led_all: 'ALLE'
    },
    it: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual caricato! Cerca i blocchi in fondo alla palette a sinistra 👇',
      block_move_label: '🚙 Movimento del Jeep',
      block_move_fwd: 'Muovere il motore [SIDE] in AVANTI al [PCT]%',
      block_move_bwd: 'Muovere il motore [SIDE] INDIETRO al [PCT]%',
      block_stop_motor: 'Fermare il motore [WHICH]',
      block_reset_pos: 'reimposta posizione del Jeep',
      block_sensors_label: '📡 Sensori',
      block_distance_cm: 'distanza in cm',
      block_line_detected: 'rileva linea',
      block_leds_label: '💡 LED anteriori',
      block_light_on: 'Accendere luce [LED] di colore [COLOR]',
      block_light_off: 'Spegnere luce [LED]',
      block_audio_label: '🔊 Audio',
      block_bocina: 'suonare clacson',
      block_play_note: 'suonare nota [NOTA] per [DUR] s',
      motor_left: 'SINISTRO / B',
      motor_right: 'DESTRO / A',
      stop_both: 'ENTRAMBI',
      led_all: 'TUTTE'
    },
    zh: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual 已加载！在左侧积木栏底部查找积木 👇',
      block_move_label: '🚙 Jeep 移动',
      block_move_fwd: '以 [PCT]% 向前移动 [SIDE] 电机',
      block_move_bwd: '以 [PCT]% 向后移动 [SIDE] 电机',
      block_stop_motor: '停止 [WHICH] 电机',
      block_reset_pos: '重置 Jeep 位置',
      block_sensors_label: '📡 传感器',
      block_distance_cm: '距离（厘米）',
      block_line_detected: '检测到线',
      block_leds_label: '💡 前灯',
      block_light_on: '打开 [LED] 灯，颜色为 [COLOR]',
      block_light_off: '关闭 [LED] 灯',
      block_audio_label: '🔊 音频',
      block_bocina: '鸣笛',
      block_play_note: '以 [NOTA] 音符播放 [DUR] 秒',
      motor_left: '左 / B',
      motor_right: '右 / A',
      stop_both: '全部',
      led_all: '全部'
    },
    ja: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual が読み込まれました！左のパレットの一番下にブロックがあります 👇',
      block_move_label: '🚙 Jeep の動き',
      block_move_fwd: '[SIDE] モーターを [PCT]% で前進させる',
      block_move_bwd: '[SIDE] モーターを [PCT]% で後退させる',
      block_stop_motor: '[WHICH] モーターを停止する',
      block_reset_pos: 'Jeep の位置をリセットする',
      block_sensors_label: '📡 センサー',
      block_distance_cm: '距離（cm）',
      block_line_detected: 'ラインを検出',
      block_leds_label: '💡 前面 LED',
      block_light_on: '色 [COLOR] の [LED] ライトをつける',
      block_light_off: '[LED] ライトを消す',
      block_audio_label: '🔊 オーディオ',
      block_bocina: 'クラクションを鳴らす',
      block_play_note: '音符 [NOTA] を [DUR] 秒鳴らす',
      motor_left: '左 / B',
      motor_right: '右 / A',
      stop_both: '両方',
      led_all: 'すべて'
    },
    ko: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual이(가) 로드되었습니다! 왼쪽 팔레트 하단에서 블록을 찾으세요 👇',
      block_move_label: '🚙 Jeep 움직임',
      block_move_fwd: '[SIDE] 모터를 [PCT]%로 전진',
      block_move_bwd: '[SIDE] 모터를 [PCT]%로 후진',
      block_stop_motor: '[WHICH] 모터 정지',
      block_reset_pos: 'Jeep 위치 초기화',
      block_sensors_label: '📡 센서',
      block_distance_cm: '거리(cm)',
      block_line_detected: '라인 감지',
      block_leds_label: '💡 전방 LED',
      block_light_on: '[COLOR] 색상으로 [LED] 조명 켜기',
      block_light_off: '[LED] 조명 끄기',
      block_audio_label: '🔊 오디오',
      block_bocina: '경적 소리',
      block_play_note: '음 [NOTA] 를 [DUR] 초 동안 연주',
      motor_left: '왼쪽 / B',
      motor_right: '오른쪽 / A',
      stop_both: '양쪽',
      led_all: '전체'
    },
    ru: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual загружен! Ищи блоки внизу левой палитры 👇',
      block_move_label: '🚙 Движение Jeep',
      block_move_fwd: 'Двигать мотор [SIDE] вперёд на [PCT]%',
      block_move_bwd: 'Двигать мотор [SIDE] назад на [PCT]%',
      block_stop_motor: 'Остановить мотор [WHICH]',
      block_reset_pos: 'сбросить позицию Jeep',
      block_sensors_label: '📡 Датчики',
      block_distance_cm: 'расстояние в см',
      block_line_detected: 'обнаружена линия',
      block_leds_label: '💡 Передние светодиоды',
      block_light_on: 'Включить свет [LED] цвета [COLOR]',
      block_light_off: 'Выключить свет [LED]',
      block_audio_label: '🔊 Аудио',
      block_bocina: 'подать сигнал',
      block_play_note: 'играть ноту [NOTA] [DUR] с',
      motor_left: 'ЛЕВЫЙ / B',
      motor_right: 'ПРАВЫЙ / A',
      stop_both: 'ОБА',
      led_all: 'ВСЕ'
    },
    ar: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'تم تحميل Robot Jeep Virtual! ابحث عن الكتل في أسفل اللوحة اليسرى 👇',
      block_move_label: '🚙 حركة Jeep',
      block_move_fwd: 'تحريك المحرك [SIDE] للأمام بنسبة [PCT]%',
      block_move_bwd: 'تحريك المحرك [SIDE] للخلف بنسبة [PCT]%',
      block_stop_motor: 'إيقاف المحرك [WHICH]',
      block_reset_pos: 'إعادة تعيين موضع Jeep',
      block_sensors_label: '📡 المستشعرات',
      block_distance_cm: 'المسافة بالسم',
      block_line_detected: 'اكتشاف الخط',
      block_leds_label: '💡 المصابيح الأمامية',
      block_light_on: 'تشغيل ضوء [LED] باللون [COLOR]',
      block_light_off: 'إطفاء ضوء [LED]',
      block_audio_label: '🔊 الصوت',
      block_bocina: 'تشغيل البوق',
      block_play_note: 'عزف نوتة [NOTA] لمدة [DUR] ث',
      motor_left: 'يسار / B',
      motor_right: 'يمين / A',
      stop_both: 'كلاهما',
      led_all: 'الكل'
    },
    hi: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual लोड हो गया है! बाएँ पैलेट के नीचे ब्लॉक खोजें 👇',
      block_move_label: '🚙 Jeep की गति',
      block_move_fwd: '[SIDE] मोटर को [PCT]% पर आगे बढ़ाएं',
      block_move_bwd: '[SIDE] मोटर को [PCT]% पर पीछे करें',
      block_stop_motor: '[WHICH] मोटर रोकें',
      block_reset_pos: 'Jeep की स्थिति रीसेट करें',
      block_sensors_label: '📡 सेंसर',
      block_distance_cm: 'दूरी सेमी में',
      block_line_detected: 'रेखा का पता चला',
      block_leds_label: '💡 सामने के LED',
      block_light_on: '[LED] लाइट को [COLOR] रंग में चालू करें',
      block_light_off: '[LED] लाइट बंद करें',
      block_audio_label: '🔊 ऑडियो',
      block_bocina: 'हॉर्न बजाएं',
      block_play_note: '[NOTA] नोट को [DUR] सेकंड तक बजाएं',
      motor_left: 'बायाँ / B',
      motor_right: 'दायाँ / A',
      stop_both: 'दोनों',
      led_all: 'सभी'
    },
    bn: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual লোড হয়েছে! বাম প্যালেটের নিচে ব্লকগুলো খুঁজুন 👇',
      block_move_label: '🚙 Jeep এর চলাচল',
      block_move_fwd: '[SIDE] মোটর [PCT]% এগিয়ে চালান',
      block_move_bwd: '[SIDE] মোটর [PCT]% পিছিয়ে চালান',
      block_stop_motor: '[WHICH] মোটর থামান',
      block_reset_pos: 'Jeep এর অবস্থান পুনরায় সেট করুন',
      block_sensors_label: '📡 সেন্সর',
      block_distance_cm: 'সেন্টিমিটারে দূরত্ব',
      block_line_detected: 'লাইন শনাক্ত হয়েছে',
      block_leds_label: '💡 সামনের LED',
      block_light_on: '[LED] আলো [COLOR] রঙে জ্বালান',
      block_light_off: '[LED] আলো বন্ধ করুন',
      block_audio_label: '🔊 অডিও',
      block_bocina: 'হর্ন বাজান',
      block_play_note: '[DUR] সেকেন্ডের জন্য [NOTA] নোট বাজান',
      motor_left: 'বাম / B',
      motor_right: 'ডান / A',
      stop_both: 'উভয়',
      led_all: 'সব'
    },
    id: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual dimuat! Cari bloknya di bagian bawah palet kiri 👇',
      block_move_label: '🚙 Gerakan Jeep',
      block_move_fwd: 'Gerakkan motor [SIDE] MAJU dengan [PCT]%',
      block_move_bwd: 'Gerakkan motor [SIDE] MUNDUR dengan [PCT]%',
      block_stop_motor: 'Hentikan motor [WHICH]',
      block_reset_pos: 'atur ulang posisi Jeep',
      block_sensors_label: '📡 Sensor',
      block_distance_cm: 'jarak dalam cm',
      block_line_detected: 'garis terdeteksi',
      block_leds_label: '💡 LED depan',
      block_light_on: 'Nyalakan lampu [LED] dengan warna [COLOR]',
      block_light_off: 'Matikan lampu [LED]',
      block_audio_label: '🔊 Audio',
      block_bocina: 'bunyikan klakson',
      block_play_note: 'mainkan nada [NOTA] selama [DUR] dtk',
      motor_left: 'KIRI / B',
      motor_right: 'KANAN / A',
      stop_both: 'KEDUANYA',
      led_all: 'SEMUA'
    },
    tr: {
      ext_title: 'Robot Jeep Virtual',
      jeep_loaded_msg: 'Robot Jeep Virtual yüklendi! Blokları sol paletin en altında bulun 👇',
      block_move_label: '🚙 Jeep Hareketi',
      block_move_fwd: '[SIDE] motorunu [PCT]% ile İLERİ hareket ettir',
      block_move_bwd: '[SIDE] motorunu [PCT]% ile GERİ hareket ettir',
      block_stop_motor: '[WHICH] motorunu durdur',
      block_reset_pos: 'Jeep konumunu sıfırla',
      block_sensors_label: '📡 Sensörler',
      block_distance_cm: 'mesafe cm cinsinden',
      block_line_detected: 'çizgi algılandı',
      block_leds_label: '💡 Ön LEDler',
      block_light_on: '[LED] ışığını [COLOR] renginde aç',
      block_light_off: '[LED] ışığını kapat',
      block_audio_label: '🔊 Ses',
      block_bocina: 'korna çal',
      block_play_note: '[NOTA] notasını [DUR] sn çal',
      motor_left: 'SOL / B',
      motor_right: 'SAĞ / A',
      stop_both: 'İKİSİ',
      led_all: 'TÜMÜ'
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
      '#rec-jeep-toast {' +
      '  position: fixed;' +
      '  bottom: 1rem;' +
      '  left: 1rem;' +
      '  z-index: 9999;' +
      '  max-width: 320px;' +
      '  background: rgba(40,40,40,0.95);' +
      '  color: #fff;' +
      '  border-left: 4px solid #FF6B35;' +
      '  border-radius: 0.75rem;' +
      '  padding: 0.75rem 1rem;' +
      '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
      '  font-size: 0.95rem;' +
      '  line-height: 1.4;' +
      '  box-shadow: 0 6px 20px rgba(0,0,0,0.25);' +
      '  opacity: 0;' +
      '  transform: translateY(20px);' +
      '  transition: opacity 0.4s ease, transform 0.4s ease;' +
      '  pointer-events: none;' +
      '}' +
      '#rec-jeep-toast.rec-jeep-toast-visible {' +
      '  opacity: 1;' +
      '  transform: translateY(0);' +
      '}' +
      '#rec-jeep-toast.rec-jeep-toast-hiding {' +
      '  opacity: 0;' +
      '  transform: translateY(10px);' +
      '}' +
      '#rec-jeep-toast .rec-jeep-toast-icon {' +
      '  display: inline-block;' +
      '  margin-right: 0.5rem;' +
      '  font-size: 1.1rem;' +
      '  vertical-align: middle;' +
      '}' +
      '#rec-jeep-toast .rec-jeep-toast-text {' +
      '  vertical-align: middle;' +
      '  display: inline;' +
      '}';
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
    toast.setAttribute('aria-live', 'polite');

    const icon = document.createElement('span');
    icon.className = 'rec-jeep-toast-icon';
    icon.textContent = '🚙';

    const text = document.createElement('span');
    text.className = 'rec-jeep-toast-text';
    text.textContent = msg;

    toast.appendChild(icon);
    toast.appendChild(text);

    document.body.appendChild(toast);

    // Forzar reflow para la transición
    if (toast.offsetWidth) {
      // no-op
    }

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
      // Bandera para evitar duplicados del toast de carga
      this.jeepToastMostrado = false;

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
      // Mostrar toast de carga solo cuando el usuario activa la extensión (no al inicio)
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
            opcode: 'moveForward',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_move_fwd'),
            arguments: {
              SIDE: { type: Scratch.ArgumentType.STRING, menu: 'motorSide', defaultValue: 'IZQ' },
              PCT:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
            }
          },
          {
            opcode: 'moveBackward',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_move_bwd'),
            arguments: {
              SIDE: { type: Scratch.ArgumentType.STRING, menu: 'motorSide', defaultValue: 'IZQ' },
              PCT:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
            }
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
              { text: t('motor_right'), value: 'DER' }
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
            items: [
              '1',
              '2',
              { text: t('led_all'), value: 'TODAS' }
            ]
          },
          menuNotas: { acceptReporters: true, items: ['DO','RE','MI','FA','SOL','LA','SI','DO5'] }
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
      // Activar bandera para evitar interferencia del bucle de física
      resetting = true;
      
      // Detener motores
      jeep.vL  = 0;
      jeep.vR  = 0;
      
      // Restaurar posición y rotación del estado interno
      jeep.x   = homePos.x;
      jeep.y   = homePos.y;
      jeep.dir = homePos.dir;
      
      const t = getTarget();
      if (t) {
        // Forzar estilo de rotación
        t.rotationStyle = 'all around';
        
        // Sincronizar posición con el motor de Scratch
        t.setXY(homePos.x, homePos.y);
        
        // Sincronizar dirección con el motor de Scratch
        t.setDirection(homePos.dir);
        
        // Sincronizar estado interno con la dirección normalizada de Scratch
        jeep.dir = (((t.direction % 360) + 360) % 360);
        
        // Actualizar lastSetX/Y para evitar detección falsa de arrastre
        lastSetX = homePos.x;
        lastSetY = homePos.y;
        
        // Forzar redibujado para que los cambios sean visibles inmediatamente
        const vm = getVM();
        if (vm && vm.runtime) {
          vm.runtime.requestRedraw();
        }
      }
    }
  }

  Scratch.extensions.register(new RobotJeepVirtualREC());
})(Scratch);
