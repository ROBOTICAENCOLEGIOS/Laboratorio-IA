/**
 * Jeep Autónomo - RoboticaEnColegios R.E.C.
 * Programación 100% autónoma: genera código C++ compatible con
 * la librería RoboticaEnColegios.h a partir de bloques Scratch/TurboWarp.
 *
 * ── Arquitectura de compilación local (Opción B — WASM) ──────────────────────
 * Pipeline 100% offline, sin servidor:
 *   1. _WASMCompiler  → avr-gcc 12 (Emscripten) compila C++ → Intel HEX
 *   2. _parseIntelHex → convierte HEX → Uint8Array binario
 *   3. _STK500Flasher → protocolo STK500v1 nativo sobre Web Serial API
 *      (compatible con bootloader Optiboot, Arduino Uno/Nano, ATmega328P)
 *
 * Mapeo de pines internos (encapsulados en firmware_rec_blindado.hex):
 *   Motor IZQ: IN1=6, IN2=7, PWM=5
 *   Motor DER: IN1=8, IN2=9, PWM=10  (+12 compensación de torque)
 *   Ultrasonido: TRIG=2, ECHO=12
 *   IR línea: PIN=3
 *   DHT11: A5
 *   Buzzer: PIN=11
 *   LED1 NeoPixel: PIN=13
 *   LED2 NeoPixel: PIN=4
 */

// ══════════════════════════════════════════════════════════════════════════════
// CAPA 1: Utilidad — Parseo de Intel HEX → binario Uint8Array
// ══════════════════════════════════════════════════════════════════════════════
function _parseIntelHex(hexStr) {
  const records = hexStr.split(/\r?\n/).filter(l => l.startsWith(':'));
  const segments = [];
  let maxEnd = 0;
  for (const rec of records) {
    const b    = rec.slice(1).match(/.{2}/g).map(h => parseInt(h, 16));
    const len  = b[0];
    const addr = (b[1] << 8) | b[2];
    const type = b[3];
    if (type === 0x00) {
      segments.push({ addr, data: b.slice(4, 4 + len) });
      maxEnd = Math.max(maxEnd, addr + len);
    } else if (type === 0x01) break;
  }
  const bin = new Uint8Array(maxEnd).fill(0xff);
  for (const { addr, data } of segments) data.forEach((v, i) => (bin[addr + i] = v));
  return bin;
}

// ══════════════════════════════════════════════════════════════════════════════
// CAPA 2: Compilador WASM local (avr-gcc via Emscripten)
// ══════════════════════════════════════════════════════════════════════════════
//
// Pipeline planificado (todo en browser, sin servidor):
//   avr-gcc 12 (WASM) → avr-ld → avr-objcopy → Intel HEX
//
// Dependencias a publicar en CDN:
//   • avr-gcc + binutils compilado con Emscripten (~12 MB, cached tras primer uso)
//   • avr-libc headers en filesystem virtual de Emscripten
//   • libRoboticaEnColegios.a: estática precompilada para ATmega328P @ 16MHz
//     (pines de hardware encapsulados — protección de propiedad intelectual REC)
//
// Referencias técnicas:
//   https://emscripten.org/docs/api_reference/preamble.js.html
//   https://github.com/nicowillis/avr-gcc-wasm
//   Flags de compilación: -mmcu=atmega328p -DF_CPU=16000000UL -Os -L/lib -lRoboticaEnColegios
//
class _WASMCompiler {
  static BUNDLE_URL = ''; // CDN URL — se completa cuando el bundle WASM esté publicado

  constructor() {
    this._mod   = null;
    this.loaded = false;
    this.status = 'PENDIENTE';
  }

  async load(onProgress) {
    if (this.loaded) return;
    if (!_WASMCompiler.BUNDLE_URL) {
      this.status = 'WASM_NO_DISPONIBLE';
      throw new Error('WASM_NO_DISPONIBLE');
    }
    onProgress && onProgress('Cargando compilador WASM...');
    // TODO — cuando el bundle esté listo:
    // const resp      = await fetch(_WASMCompiler.BUNDLE_URL);
    // const bytes     = await resp.arrayBuffer();
    // this._mod       = await WebAssembly.instantiate(bytes, { /* imports */ });
    // this.loaded     = true;
    // this.status     = 'LISTO';
    throw new Error('WASM_NO_DISPONIBLE');
  }

  // Compila cppSource y retorna string Intel HEX
  async compile(cppSource, onProgress) {
    if (!this.loaded) throw new Error('WASM_NO_DISPONIBLE');
    onProgress && onProgress('Compilando para ATmega328P...');
    // TODO — invocar avr-gcc en módulo WASM:
    // return this._mod.exports.compile(cppSource, '-mmcu=atmega328p -DF_CPU=16000000UL -Os');
    throw new Error('WASM_NO_DISPONIBLE');
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// CAPA 3: Flasheador STK500v1 — Web Serial API nativa del browser
// ══════════════════════════════════════════════════════════════════════════════
//
// Protocolo STK500v1 compatible con bootloader Optiboot (Arduino Uno R3, Nano)
// Flujo: DTR reset → sync → set device → enter prog mode → flash por páginas → leave
//
class _STK500Flasher {
  // Constantes STK500v1
  static STK_OK             = 0x10;
  static STK_INSYNC         = 0x14;
  static STK_GET_SYNC       = 0x30;
  static STK_SET_DEVICE     = 0x42;
  static STK_ENTER_PROGMODE = 0x50;
  static STK_LEAVE_PROGMODE = 0x51;
  static STK_LOAD_ADDRESS   = 0x55;
  static STK_PROG_PAGE      = 0x64;
  static CRC_EOP            = 0x20;

  // ATmega328P / Optiboot: 128 bytes/página, 115200 baud
  static PAGE_SIZE = 128;
  static BAUD_RATE = 115200;

  constructor() {
    this._port    = null;
    this._writer  = null;
    this._rxBuf   = [];
    this._rxWait  = [];
    this._looping = false;
  }

  // Solicita el puerto USB al usuario (Chrome muestra diálogo de selección)
  // y resetea el Arduino mediante toggle de la señal DTR para activar Optiboot
  async connect(onProgress) {
    onProgress && onProgress('⏳ Esperando selección de puerto COM...');
    this._port = await navigator.serial.requestPort();
    await this._port.open({ baudRate: _STK500Flasher.BAUD_RATE });
    this._writer = this._port.writable.getWriter();
    this._startReadLoop();
    onProgress && onProgress('🔄 Reiniciando Arduino (DTR)...');
    await this._port.setSignals({ dataTerminalReady: false });
    await this._sleep(250);
    await this._port.setSignals({ dataTerminalReady: true });
    await this._sleep(50);
  }

  _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  _startReadLoop() {
    this._looping = true;
    const run = async () => {
      while (this._looping && this._port && this._port.readable) {
        const reader = this._port.readable.getReader();
        try {
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            if (!value) continue;
            for (const byte of value) {
              if (this._rxWait.length > 0) { this._rxWait.shift()(byte); }
              else { this._rxBuf.push(byte); }
            }
          }
        } catch (_) { break; }
        finally { try { reader.releaseLock(); } catch (_) {} }
      }
    };
    run();
  }

  _readByte(timeout = 2000) {
    if (this._rxBuf.length > 0) return Promise.resolve(this._rxBuf.shift());
    return new Promise((resolve, reject) => {
      let resolver;
      const t = setTimeout(() => {
        const i = this._rxWait.indexOf(resolver);
        if (i >= 0) this._rxWait.splice(i, 1);
        reject(new Error('Timeout: el bootloader no responde. ¿Cable USB conectado?'));
      }, timeout);
      resolver = (b) => { clearTimeout(t); resolve(b); };
      this._rxWait.push(resolver);
    });
  }

  async _expectOK(timeout = 2000) {
    const s = await this._readByte(timeout);
    const o = await this._readByte(timeout);
    if (s !== _STK500Flasher.STK_INSYNC || o !== _STK500Flasher.STK_OK) {
      throw new Error(
        `Error de protocolo STK500: ` +
        `0x${s.toString(16).padStart(2,'0')} 0x${o.toString(16).padStart(2,'0')} ` +
        `(esperado 0x14 0x10). ¿Es el puerto correcto?`
      );
    }
  }

  async _write(bytes) { await this._writer.write(new Uint8Array(bytes)); }

  async sync(onProgress) {
    this._rxBuf = [];
    onProgress && onProgress('🔗 Sincronizando con bootloader Optiboot...');
    for (let i = 0; i < 10; i++) {
      await this._write([_STK500Flasher.STK_GET_SYNC, _STK500Flasher.CRC_EOP]);
      try { await this._expectOK(500); return; }
      catch (_) { await this._sleep(50); }
    }
    throw new Error(
      'No se pudo sincronizar con el bootloader.\n' +
      '→ ¿El cable USB está bien conectado?\n' +
      '→ ¿Seleccionaste el puerto correcto?\n' +
      '→ ¿El Arduino está encendido?'
    );
  }

  async enterProgramMode(onProgress) {
    onProgress && onProgress('🔧 Activando modo programación ATmega328P...');
    // Parámetros de dispositivo para ATmega328P
    // Optiboot los ignora en su mayoría, pero son obligatorios en STK500v1
    await this._write([
      _STK500Flasher.STK_SET_DEVICE,
      0x86, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x06,
      0xff, 0xff, 0xff, 0xff, 0x00, 0x80, 0x04, 0x00,
      0x00, 0x00, 0x80, 0x00,
      _STK500Flasher.CRC_EOP
    ]);
    await this._expectOK();
    await this._write([_STK500Flasher.STK_ENTER_PROGMODE, _STK500Flasher.CRC_EOP]);
    await this._expectOK();
  }

  async flashBinary(binary, onProgress) {
    const pageSize   = _STK500Flasher.PAGE_SIZE;
    const totalPages = Math.ceil(binary.length / pageSize);
    let   wordAddr   = 0; // STK500 usa direcciones de WORD (2 bytes)

    for (let page = 0; page < totalPages; page++) {
      const offset = page * pageSize;
      const chunk  = new Uint8Array(pageSize).fill(0xff); // 0xFF = flash borrada
      chunk.set(binary.slice(offset, offset + pageSize));

      const pct = Math.round(((page + 1) / totalPages) * 100);
      onProgress && onProgress(`✍️ Escribiendo página ${page + 1}/${totalPages} (${pct}%)...`);

      // LOAD_ADDRESS: dirección en words, little-endian
      await this._write([
        _STK500Flasher.STK_LOAD_ADDRESS,
        wordAddr & 0xff, (wordAddr >> 8) & 0xff,
        _STK500Flasher.CRC_EOP
      ]);
      await this._expectOK();

      // PROG_PAGE: [CMD] [sizeH=0x00] [sizeL=0x80] ['F'=0x46] [128 bytes] [EOP]
      await this._write([
        _STK500Flasher.STK_PROG_PAGE,
        0x00, pageSize, 0x46,
        ...chunk,
        _STK500Flasher.CRC_EOP
      ]);
      await this._expectOK(5000);

      wordAddr += pageSize / 2; // avanzar puntero de palabra
    }
  }

  async leaveProgramMode(onProgress) {
    onProgress && onProgress('🏁 Finalizando y reiniciando el robot...');
    await this._write([_STK500Flasher.STK_LEAVE_PROGMODE, _STK500Flasher.CRC_EOP]);
    await this._expectOK();
  }

  async close() {
    this._looping = false;
    try { this._writer.releaseLock(); } catch (_) {}
    try { await this._port.close();   } catch (_) {}
    this._port = null;
  }
}

(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Debe ejecutarse en modo unsandboxed.');
  }

  const I18N_BLOCKS = {
    "es": {
      "ext_title": "ROBOT 1 Arduino AUTONOMO",
      "arduino_autonomo_loaded_msg": "¡ROBOT 1 Arduino AUTONOMO cargado! Busca los bloques al final de la paleta izquierda 👇",
      "hat_inicio": "INICIO 🚀",
      "block_move_motor": "mover motor [MOTOR] hacia [DIRECCION] a velocidad [VELOCIDAD] %",
      "motor_a": "Motor A",
      "motor_b": "Motor B",
      "motor_both": "AMBOS / TODOS",
      "dir_forward": "ADELANTE",
      "dir_backward": "ATRÁS",
      "block_stop_motor": "Detener motor [WHICH]",
      "block_light_on": "Luz [LED] → color [COLOR]",
      "block_light_off": "Apagar luz [LED]",
      "block_play_note": "Tocar nota [NOTE] por [MS] ms",
      "block_distance_cm": "distancia (cm)",
      "block_line_detected": "¿detecta línea?",
      "block_get_dht": "leer [TIPO]",
      "block_compile": "⚙️ Compilar programa C++",
      "block_upload": "⬆️ Subir al Robot 🚀",
      "block_download_agent": "⬇️ Descargar Compilador (Windows)",
      "block_upload_status": "📡 estado de carga",
      "block_log": "🪲 registro de errores",
      "led_all": "TODAS",
      "dht_temp": "Temperatura (°C)",
      "dht_hum": "Humedad (%)",
      "note_do": "DO (C4)",
      "note_re": "RE (D4)",
      "note_mi": "MI (E4)",
      "note_fa": "FA (F4)",
      "note_sol": "SOL (G4)",
      "note_la": "LA (A4)",
      "note_si": "SI (B4)",
      "note_do5": "DO (C5)"
    },
    "en": {
      "ext_title": "ROBOT 1 Arduino AUTONOMO",
      "arduino_autonomo_loaded_msg": "ROBOT 1 Arduino AUTONOMO loaded! Look for the blocks at the bottom of the left palette 👇",
      "hat_inicio": "START 🚀",
      "block_move_motor": "move motor [MOTOR] [DIRECCION] at [VELOCIDAD] % speed",
      "motor_a": "Motor A",
      "motor_b": "Motor B",
      "motor_both": "BOTH / ALL",
      "dir_forward": "FORWARD",
      "dir_backward": "BACKWARD",
      "block_stop_motor": "Stop [WHICH] motor",
      "block_light_on": "Light [LED] → color [COLOR]",
      "block_light_off": "Turn off light [LED]",
      "block_play_note": "Play note [NOTE] for [MS] ms",
      "block_distance_cm": "distance (cm)",
      "block_line_detected": "detects line?",
      "block_get_dht": "read [TIPO]",
      "block_compile": "⚙️ Compile C++ program",
      "block_upload": "⬆️ Upload to Robot 🚀",
      "block_download_agent": "⬇️ Download Compiler (Windows)",
      "block_upload_status": "📡 upload status",
      "block_log": "🪲 error log",
      "led_all": "ALL",
      "dht_temp": "Temperature (°C)",
      "dht_hum": "Humidity (%)",
      "note_do": "C (C4)",
      "note_re": "D (D4)",
      "note_mi": "E (E4)",
      "note_fa": "F (F4)",
      "note_sol": "G (G4)",
      "note_la": "A (A4)",
      "note_si": "B (B4)",
      "note_do5": "C (C5)"
    },
    "pt": {
      "ext_title": "ROBOT 1 Arduino AUTONOMO",
      "arduino_autonomo_loaded_msg": "ROBOT 1 Arduino AUTONOMO carregado! Procure os blocos no final da paleta à esquerda 👇",
      "hat_inicio": "INÍCIO 🚀",
      "block_move_motor": "mover motor [MOTOR] para [DIRECCION] a [VELOCIDAD] %",
      "motor_a": "Motor A",
      "motor_b": "Motor B",
      "motor_both": "AMBOS / TODOS",
      "dir_forward": "FRENTE",
      "dir_backward": "TRÁS",
      "block_stop_motor": "Parar motor [WHICH]",
      "block_light_on": "Luz [LED] → cor [COLOR]",
      "block_light_off": "Apagar luz [LED]",
      "block_play_note": "Tocar nota [NOTE] por [MS] ms",
      "block_distance_cm": "distância (cm)",
      "block_line_detected": "detecta linha?",
      "block_get_dht": "ler [TIPO]",
      "block_compile": "⚙️ Compilar programa C++",
      "block_upload": "⬆️ Enviar para o Robô 🚀",
      "block_download_agent": "⬇️ Baixar Compilador (Windows)",
      "block_upload_status": "📡 estado de carregamento",
      "block_log": "🪲 registro de erros",
      "led_all": "TODAS",
      "dht_temp": "Temperatura (°C)",
      "dht_hum": "Umidade (%)",
      "note_do": "DÓ (C4)",
      "note_re": "RÉ (D4)",
      "note_mi": "MI (E4)",
      "note_fa": "FÁ (F4)",
      "note_sol": "SOL (G4)",
      "note_la": "LÁ (A4)",
      "note_si": "SI (B4)",
      "note_do5": "DÓ (C5)"
    },
    "fr": {
      "ext_title": "ROBOT 1 Arduino AUTONOMO",
      "arduino_autonomo_loaded_msg": "ROBOT 1 Arduino AUTONOMO chargé ! Retrouve les blocs en bas de la palette à gauche 👇",
      "hat_inicio": "DÉMARRAGE 🚀",
      "block_move_motor": "moteur [MOTOR] [DIRECCION] à [VELOCIDAD] %",
      "motor_a": "Moteur A",
      "motor_b": "Moteur B",
      "motor_both": "LES DEUX / TOUS",
      "dir_forward": "EN AVANT",
      "dir_backward": "EN ARRIÈRE",
      "block_stop_motor": "Arrêter le moteur [WHICH]",
      "block_light_on": "Lumière [LED] → couleur [COLOR]",
      "block_light_off": "Éteindre la lumière [LED]",
      "block_play_note": "Jouer la note [NOTE] pendant [MS] ms",
      "block_distance_cm": "distance (cm)",
      "block_line_detected": "détecte la ligne ?",
      "block_get_dht": "lire [TIPO]",
      "block_compile": "⚙️ Compiler programme C++",
      "block_upload": "⬆️ Téléverser vers le Robot 🚀",
      "block_download_agent": "⬇️ Télécharger le Compilateur (Windows)",
      "block_upload_status": "📡 état de chargement",
      "block_log": "🪲 journal d'erreurs",
      "led_all": "TOUTES",
      "dht_temp": "Température (°C)",
      "dht_hum": "Humidité (%)",
      "note_do": "DO (C4)",
      "note_re": "RÉ (D4)",
      "note_mi": "MI (E4)",
      "note_fa": "FA (F4)",
      "note_sol": "SOL (G4)",
      "note_la": "LA (A4)",
      "note_si": "SI (B4)",
      "note_do5": "DO (C5)"
    },
    "de": {
      "ext_title": "ROBOT 1 Arduino AUTONOMO",
      "arduino_autonomo_loaded_msg": "ROBOT 1 Arduino AUTONOMO geladen! Die Blöcke findest du unten in der linken Palette 👇",
      "hat_inicio": "START 🚀",
      "block_move_motor": "Motor [MOTOR] [DIRECCION] mit [VELOCIDAD] %",
      "motor_a": "Motor A",
      "motor_b": "Motor B",
      "motor_both": "BEIDE / ALLE",
      "dir_forward": "VORWÄRTS",
      "dir_backward": "RÜCKWÄRTS",
      "block_stop_motor": "Motor [WHICH] stoppen",
      "block_light_on": "Licht [LED] → Farbe [COLOR]",
      "block_light_off": "Licht [LED] ausschalten",
      "block_play_note": "Note [NOTE] für [MS] ms spielen",
      "block_distance_cm": "Entfernung (cm)",
      "block_line_detected": "erkennt Linie?",
      "block_get_dht": "[TIPO] lesen",
      "block_compile": "⚙️ C++-Programm kompilieren",
      "block_upload": "⬆️ Auf Roboter hochladen 🚀",
      "block_download_agent": "⬇️ Compiler herunterladen (Windows)",
      "block_upload_status": "📡 Upload-Status",
      "block_log": "🪲 Fehlerprotokoll",
      "led_all": "ALLE",
      "dht_temp": "Temperatur (°C)",
      "dht_hum": "Luftfeuchtigkeit (%)",
      "note_do": "C (C4)",
      "note_re": "D (D4)",
      "note_mi": "E (E4)",
      "note_fa": "F (F4)",
      "note_sol": "G (G4)",
      "note_la": "A (A4)",
      "note_si": "H (B4)",
      "note_do5": "C (C5)"
    },
    "it": {
      "ext_title": "ROBOT 1 Arduino AUTONOMO",
      "arduino_autonomo_loaded_msg": "ROBOT 1 Arduino AUTONOMO caricato! Cerca i blocchi in fondo alla palette a sinistra 👇",
      "hat_inicio": "INIZIO 🚀",
      "block_move_motor": "muovere motore [MOTOR] [DIRECCION] a [VELOCIDAD] %",
      "motor_a": "Motore A",
      "motor_b": "Motore B",
      "motor_both": "ENTRAMBI / TUTTI",
      "dir_forward": "AVANTI",
      "dir_backward": "INDIETRO",
      "block_stop_motor": "Fermare il motore [WHICH]",
      "block_light_on": "Luce [LED] → colore [COLOR]",
      "block_light_off": "Spegnere luce [LED]",
      "block_play_note": "Suonare nota [NOTE] per [MS] ms",
      "block_distance_cm": "distanza (cm)",
      "block_line_detected": "rileva linea?",
      "block_get_dht": "leggi [TIPO]",
      "block_compile": "⚙️ Compila programma C++",
      "block_upload": "⬆️ Carica sul Robot 🚀",
      "block_download_agent": "⬇️ Scarica Compilatore (Windows)",
      "block_upload_status": "📡 stato caricamento",
      "block_log": "🪲 registro errori",
      "led_all": "TUTTE",
      "dht_temp": "Temperatura (°C)",
      "dht_hum": "Umidità (%)",
      "note_do": "DO (C4)",
      "note_re": "RE (D4)",
      "note_mi": "MI (E4)",
      "note_fa": "FA (F4)",
      "note_sol": "SOL (G4)",
      "note_la": "LA (A4)",
      "note_si": "SI (B4)",
      "note_do5": "DO (C5)"
    },
    "zh": {
      "ext_title": "ROBOT 1 Arduino 自动驾驶",
      "arduino_autonomo_loaded_msg": "ROBOT 1 Arduino 自动驾驶已加载！在左侧积木栏底部查找积木 👇",
      "hat_inicio": "开始 🚀",
      "block_move_motor": "以 [VELOCIDAD]% [DIRECCION] 移动 [MOTOR] 电机",
      "motor_a": "电机 A",
      "motor_b": "电机 B",
      "motor_both": "全部",
      "dir_forward": "前进",
      "dir_backward": "后退",
      "block_stop_motor": "停止 [WHICH] 电机",
      "block_light_on": "灯 [LED] → 颜色 [COLOR]",
      "block_light_off": "关闭灯 [LED]",
      "block_play_note": "以 [NOTE] 音符播放 [MS] 毫秒",
      "block_distance_cm": "距离（厘米）",
      "block_line_detected": "检测到线？",
      "block_get_dht": "读取 [TIPO]",
      "block_compile": "⚙️ 编译 C++ 程序",
      "block_upload": "⬆️ 上传到机器人 🚀",
      "block_download_agent": "⬇️ 下载编译器 (Windows)",
      "block_upload_status": "📡 上传状态",
      "block_log": "🪲 错误日志",
      "led_all": "全部",
      "dht_temp": "温度（°C）",
      "dht_hum": "湿度（%）",
      "note_do": "C (C4)",
      "note_re": "D (D4)",
      "note_mi": "E (E4)",
      "note_fa": "F (F4)",
      "note_sol": "G (G4)",
      "note_la": "A (A4)",
      "note_si": "B (B4)",
      "note_do5": "C (C5)"
    },
    "ja": {
      "ext_title": "ROBOT 1 Arduino 自動走行",
      "arduino_autonomo_loaded_msg": "ROBOT 1 Arduino 自動走行版が読み込まれました！左のパレットの一番下にブロックがあります 👇",
      "hat_inicio": "開始 🚀",
      "block_move_motor": "[MOTOR] モーターを [DIRECCION] に [VELOCIDAD]% で移動",
      "motor_a": "モーター A",
      "motor_b": "モーター B",
      "motor_both": "両方 / すべて",
      "dir_forward": "前進",
      "dir_backward": "後退",
      "block_stop_motor": "[WHICH] モーターを停止する",
      "block_light_on": "ライト [LED] → 色 [COLOR]",
      "block_light_off": "ライト [LED] を消す",
      "block_play_note": "音符 [NOTE] を [MS] ミリ秒鳴らす",
      "block_distance_cm": "距離（cm）",
      "block_line_detected": "ラインを検出？",
      "block_get_dht": "読む [TIPO]",
      "block_compile": "⚙️ C++ プログラムをコンパイル",
      "block_upload": "⬆️ ロボットにアップロード 🚀",
      "block_download_agent": "⬇️ コンパイラをダウンロード (Windows)",
      "block_upload_status": "📡 アップロード状態",
      "block_log": "🪲 エラーログ",
      "led_all": "すべて",
      "dht_temp": "温度（°C）",
      "dht_hum": "湿度（%）",
      "note_do": "ド (C4)",
      "note_re": "レ (D4)",
      "note_mi": "ミ (E4)",
      "note_fa": "ファ (F4)",
      "note_sol": "ソ (G4)",
      "note_la": "ラ (A4)",
      "note_si": "シ (B4)",
      "note_do5": "ド (C5)"
    },
    "ko": {
      "ext_title": "ROBOT 1 Arduino 자율주행",
      "arduino_autonomo_loaded_msg": "ROBOT 1 Arduino 자율주행 로딩됨! 왼쪽 팔레트 하단에서 블록을 찾으세요 👇",
      "hat_inicio": "시작 🚀",
      "block_move_motor": "[MOTOR] 모터를 [DIRECCION]로 [VELOCIDAD]% 이동",
      "motor_a": "모터 A",
      "motor_b": "모터 B",
      "motor_both": "양쪽 / 전체",
      "dir_forward": "전진",
      "dir_backward": "후진",
      "block_stop_motor": "[WHICH] 모터 정지",
      "block_light_on": "조명 [LED] → 색상 [COLOR]",
      "block_light_off": "조명 [LED] 끄기",
      "block_play_note": "음 [NOTE] 를 [MS] ms 동안 연주",
      "block_distance_cm": "거리(cm)",
      "block_line_detected": "라인 감지?",
      "block_get_dht": "읽기 [TIPO]",
      "block_compile": "⚙️ C++ 프로그램 컴파일",
      "block_upload": "⬆️ 로봇에 업로드 🚀",
      "block_download_agent": "⬇️ 컴파일러 다운로드 (Windows)",
      "block_upload_status": "📡 업로드 상태",
      "block_log": "🪲 오류 로그",
      "led_all": "전체",
      "dht_temp": "온도(°C)",
      "dht_hum": "습도(%)",
      "note_do": "도 (C4)",
      "note_re": "레 (D4)",
      "note_mi": "미 (E4)",
      "note_fa": "파 (F4)",
      "note_sol": "솔 (G4)",
      "note_la": "라 (A4)",
      "note_si": "시 (B4)",
      "note_do5": "도 (C5)"
    },
    "ru": {
      "ext_title": "ROBOT 1 Arduino АВТОНОМНЫЙ",
      "arduino_autonomo_loaded_msg": "ROBOT 1 Arduino АВТОНОМНЫЙ загружен! Ищи блоки внизу левой палитры 👇",
      "hat_inicio": "СТАРТ 🚀",
      "block_move_motor": "Двигать мотор [MOTOR] [DIRECCION] на [VELOCIDAD]%",
      "motor_a": "Мотор A",
      "motor_b": "Мотор B",
      "motor_both": "ОБА / ВСЕ",
      "dir_forward": "ВПЕРЁД",
      "dir_backward": "НАЗАД",
      "block_stop_motor": "Остановить мотор [WHICH]",
      "block_light_on": "Свет [LED] → цвет [COLOR]",
      "block_light_off": "Выключить свет [LED]",
      "block_play_note": "играть ноту [NOTE] [MS] мс",
      "block_distance_cm": "расстояние (см)",
      "block_line_detected": "обнаружена линия?",
      "block_get_dht": "прочитать [TIPO]",
      "block_compile": "⚙️ Скомпилировать программу C++",
      "block_upload": "⬆️ Загрузить на Робота 🚀",
      "block_download_agent": "⬇️ Скачать компилятор (Windows)",
      "block_upload_status": "📡 статус загрузки",
      "block_log": "🪲 журнал ошибок",
      "led_all": "ВСЕ",
      "dht_temp": "Температура (°C)",
      "dht_hum": "Влажность (%)",
      "note_do": "ДО (C4)",
      "note_re": "РЕ (D4)",
      "note_mi": "МИ (E4)",
      "note_fa": "ФА (F4)",
      "note_sol": "СОЛЬ (G4)",
      "note_la": "ЛЯ (A4)",
      "note_si": "СИ (B4)",
      "note_do5": "ДО (C5)"
    },
    "ar": {
      "ext_title": "ROBOT 1 Arduino AUTONOMOUS",
      "arduino_autonomo_loaded_msg": "تم تحميل ROBOT 1 Arduino AUTONOMOUS! ابحث عن الكتل في أسفل اللوحة اليسرى 👇",
      "hat_inicio": "ابدأ 🚀",
      "block_move_motor": "تحريك المحرك [MOTOR] [DIRECCION] بسرعة [VELOCIDAD]%",
      "motor_a": "محرك A",
      "motor_b": "محرك B",
      "motor_both": "كلاهما / الكل",
      "dir_forward": "للأمام",
      "dir_backward": "للخلف",
      "block_stop_motor": "إيقاف المحرك [WHICH]",
      "block_light_on": "ضوء [LED] → لون [COLOR]",
      "block_light_off": "إطفاء ضوء [LED]",
      "block_play_note": "عزف نوتة [NOTE] لمدة [MS] مللي ثانية",
      "block_distance_cm": "المسافة (سم)",
      "block_line_detected": "اكتشاف الخط؟",
      "block_get_dht": "قراءة [TIPO]",
      "block_compile": "⚙️ تجميع برنامج C++",
      "block_upload": "⬆️ رفع إلى الروبوت 🚀",
      "block_download_agent": "⬇️ تنزيل المترجم (Windows)",
      "block_upload_status": "📡 حالة الرفع",
      "block_log": "🪲 سجل الأخطاء",
      "led_all": "الكل",
      "dht_temp": "درجة الحرارة (°C)",
      "dht_hum": "الرطوبة (%)",
      "note_do": "دو (C4)",
      "note_re": "ري (D4)",
      "note_mi": "مي (E4)",
      "note_fa": "فا (F4)",
      "note_sol": "صول (G4)",
      "note_la": "لا (A4)",
      "note_si": "سي (B4)",
      "note_do5": "دو (C5)"
    },
    "hi": {
      "ext_title": "ROBOT 1 Arduino AUTONOMOUS",
      "arduino_autonomo_loaded_msg": "ROBOT 1 Arduino AUTONOMOUS लोड हो गया है! बाएँ पैलेट के नीचे ब्लॉक खोजें 👇",
      "hat_inicio": "शुरू 🚀",
      "block_move_motor": "[MOTOR] मोटर को [DIRECCION] [VELOCIDAD]% पर चलाएं",
      "motor_a": "मोटर A",
      "motor_b": "मोटर B",
      "motor_both": "दोनों / सभी",
      "dir_forward": "आगे",
      "dir_backward": "पीछे",
      "block_stop_motor": "[WHICH] मोटर रोकें",
      "block_light_on": "रोशनी [LED] → रंग [COLOR]",
      "block_light_off": "रोशनी [LED] बंद करें",
      "block_play_note": "[NOTE] नोट को [MS] मिलीसेकंड तक बजाएं",
      "block_distance_cm": "दूरी (सेमी)",
      "block_line_detected": "रेखा का पता चला?",
      "block_get_dht": "पढ़ें [TIPO]",
      "block_compile": "⚙️ C++ प्रोग्राम संकलित करें",
      "block_upload": "⬆️ रोबोट पर अपलोड करें 🚀",
      "block_download_agent": "⬇️ कंपाइलर डाउनलोड करें (Windows)",
      "block_upload_status": "📡 अपलोड स्थिति",
      "block_log": "🪲 त्रुटि लॉग",
      "led_all": "सभी",
      "dht_temp": "तापमान (°C)",
      "dht_hum": "नमी (%)",
      "note_do": "डो (C4)",
      "note_re": "रे (D4)",
      "note_mi": "मी (E4)",
      "note_fa": "फा (F4)",
      "note_sol": "सोल (G4)",
      "note_la": "ला (A4)",
      "note_si": "सी (B4)",
      "note_do5": "डो (C5)"
    },
    "bn": {
      "ext_title": "ROBOT 1 Arduino AUTONOMOUS",
      "arduino_autonomo_loaded_msg": "ROBOT 1 Arduino AUTONOMOUS লোড হয়ে গেছে! বাম প্যালেটের নিচে ব্লকগুলো খুঁজুন 👇",
      "hat_inicio": "শুরু 🚀",
      "block_move_motor": "[MOTOR] মোটর [DIRECCION] [VELOCIDAD]% চালান",
      "motor_a": "মোটর A",
      "motor_b": "মোটর B",
      "motor_both": "উভয় / সব",
      "dir_forward": "সামনে",
      "dir_backward": "পিছনে",
      "block_stop_motor": "[WHICH] মোটর থামান",
      "block_light_on": "আলো [LED] → রঙ [COLOR]",
      "block_light_off": "আলো [LED] বন্ধ করুন",
      "block_play_note": "[MS] মিলিসেকেন্ডের জন্য [NOTE] নোট বাজান",
      "block_distance_cm": "দূরত্ব (সেমি)",
      "block_line_detected": "লাইন শনাক্ত হয়েছে?",
      "block_get_dht": "পড়ুন [TIPO]",
      "block_compile": "⚙️ C++ প্রোগ্রাম কম্পাইল করুন",
      "block_upload": "⬆️ রোবোটে আপলোড করুন 🚀",
      "block_download_agent": "⬇️ কম্পাইলার ডাউনলোড করুন (Windows)",
      "block_upload_status": "📡 আপলোডের অবস্থা",
      "block_log": "🪲 ত্রুটি লগ",
      "led_all": "সব",
      "dht_temp": "তাপমাত্রা (°C)",
      "dht_hum": "আর্দ্রতা (%)",
      "note_do": "ডো (C4)",
      "note_re": "রে (D4)",
      "note_mi": "মি (E4)",
      "note_fa": "ফা (F4)",
      "note_sol": "সোল (G4)",
      "note_la": "লা (A4)",
      "note_si": "সি (B4)",
      "note_do5": "ডো (C5)"
    },
    "id": {
      "ext_title": "ROBOT 1 Arduino AUTONOMO",
      "arduino_autonomo_loaded_msg": "ROBOT 1 Arduino AUTONOMO dimuat! Cari bloknya di bagian bawah palet kiri 👇",
      "hat_inicio": "MULAI 🚀",
      "block_move_motor": "Gerakkan motor [MOTOR] [DIRECCION] dengan [VELOCIDAD]%",
      "motor_a": "Motor A",
      "motor_b": "Motor B",
      "motor_both": "KEDUANYA / SEMUA",
      "dir_forward": "MAJU",
      "dir_backward": "MUNDUR",
      "block_stop_motor": "Hentikan motor [WHICH]",
      "block_light_on": "Lampu [LED] → warna [COLOR]",
      "block_light_off": "Matikan lampu [LED]",
      "block_play_note": "Mainkan nada [NOTE] selama [MS] md",
      "block_distance_cm": "jarak (cm)",
      "block_line_detected": "deteksi garis?",
      "block_get_dht": "baca [TIPO]",
      "block_compile": "⚙️ Kompilasi program C++",
      "block_upload": "⬆️ Unggah ke Robot 🚀",
      "block_download_agent": "⬇️ Unduh Compiler (Windows)",
      "block_upload_status": "📡 status unggahan",
      "block_log": "🪲 log kesalahan",
      "led_all": "SEMUA",
      "dht_temp": "Suhu (°C)",
      "dht_hum": "Kelembaban (%)",
      "note_do": "DO (C4)",
      "note_re": "RE (D4)",
      "note_mi": "MI (E4)",
      "note_fa": "FA (F4)",
      "note_sol": "SOL (G4)",
      "note_la": "LA (A4)",
      "note_si": "SI (B4)",
      "note_do5": "DO (C5)"
    },
    "tr": {
      "ext_title": "ROBOT 1 Arduino OTOMON",
      "arduino_autonomo_loaded_msg": "ROBOT 1 Arduino OTOMON yüklendi! Blokları sol paletin en altında bulun 👇",
      "hat_inicio": "BAŞLA 🚀",
      "block_move_motor": "[MOTOR] motorunu [DIRECCION] [VELOCIDAD]% ile hareket ettir",
      "motor_a": "Motor A",
      "motor_b": "Motor B",
      "motor_both": "İKİSİ / TÜMÜ",
      "dir_forward": "İLERİ",
      "dir_backward": "GERİ",
      "block_stop_motor": "[WHICH] motorunu durdur",
      "block_light_on": "Işık [LED] → renk [COLOR]",
      "block_light_off": "Işık [LED] kapat",
      "block_play_note": "[NOTE] notasını [MS] ms çal",
      "block_distance_cm": "mesafe (cm)",
      "block_line_detected": "çizgi algılandı mı?",
      "block_get_dht": "oku [TIPO]",
      "block_compile": "⚙️ C++ programını derle",
      "block_upload": "⬆️ Robota Yükle 🚀",
      "block_download_agent": "⬇️ Derleyiciyi İndir (Windows)",
      "block_upload_status": "📡 yükleme durumu",
      "block_log": "🪲 hata günlüğü",
      "led_all": "TÜMÜ",
      "dht_temp": "Sıcaklık (°C)",
      "dht_hum": "Nem (%)",
      "note_do": "DO (C4)",
      "note_re": "RE (D4)",
      "note_mi": "Mİ (E4)",
      "note_fa": "FA (F4)",
      "note_sol": "SOL (G4)",
      "note_la": "LA (A4)",
      "note_si": "Sİ (B4)",
      "note_do5": "DO (C5)"
    }
  };


  class JeepAutonomo {
    constructor() {
      this._codeLines    = [];       // Instrucciones C++ acumuladas durante la ejecución
      this._codigoFinal  = '';       // Último programa compilado, disponible como reporter
      this._log          = [];       // Registro de eventos y errores (máx 20 entradas)
      this._uploadStatus = 'LISTO'; // Estado visible en el bloque reporter
      this._wasm         = new _WASMCompiler(); // Instancia del compilador WASM local
    }

    getInfo() {
      const locale = window.currentRecLocale || 'es';
      const t = key => (I18N_BLOCKS[locale] && I18N_BLOCKS[locale][key]) || I18N_BLOCKS['es'][key] || key;


      return {
        id: 'jeepAutonomo',
        name: t('ext_title'),
        color1: '#00cca3',
        color2: '#00a888',
        color3: '#008a70',
        blocks: [

          // ── HAT: punto de entrada del programa autónomo ──────────────────
          {
            opcode: 'inicio',
            blockType: Scratch.BlockType.HAT,
            text: t('hat_inicio'),
            isEdgeActivated: false
          },

          // ── MOTORES (homologados con REC PCB1 Arduino) ─────────────────
          '---',
          {
            opcode: 'moveMotor',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_move_motor'),
            arguments: {
              MOTOR:     { type: Scratch.ArgumentType.STRING, menu: 'motorMenu',     defaultValue: 'AMBOS' },
              DIRECCION: { type: Scratch.ArgumentType.STRING, menu: 'directionMenu', defaultValue: 'FWD' },
              VELOCIDAD: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 }
            }
          },
          {
            opcode: 'stopMotor',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_stop_motor'),
            arguments: {
              WHICH: { type: Scratch.ArgumentType.STRING, menu: 'motorMenu', defaultValue: 'AMBOS' }
            }
          },

          // ── LUCES ────────────────────────────────────────────────────────
          '---',
          {
            opcode: 'encenderLuz',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_light_on'),
            arguments: {
              LED:   { type: Scratch.ArgumentType.STRING, menu: 'ledMenu', defaultValue: 'TODAS' },
              COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#ff0000' }
            }
          },
          {
            opcode: 'apagarLuz',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_light_off'),
            arguments: {
              LED: { type: Scratch.ArgumentType.STRING, menu: 'ledMenu', defaultValue: 'TODAS' }
            }
          },
          {
            opcode: 'tocarNota',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_play_note'),
            arguments: {
              NOTE: { type: Scratch.ArgumentType.NUMBER, menu: 'notasMenu', defaultValue: 262 },
              MS:   { type: Scratch.ArgumentType.NUMBER, defaultValue: 500 }
            }
          },

          // ── SENSORES ─────────────────────────────────────────────────────
          '---',
          { opcode: 'distancia',      blockType: Scratch.BlockType.REPORTER, text: t('block_distance_cm') },
          { opcode: 'lineaDetectada', blockType: Scratch.BlockType.BOOLEAN,  text: t('block_line_detected') },
          {
            opcode: 'getDHT',
            blockType: Scratch.BlockType.REPORTER,
            text: t('block_get_dht'),
            arguments: { TIPO: { type: Scratch.ArgumentType.STRING, menu: 'dhtMenu', defaultValue: 'TEMP' } }
          },

          // ── GENERADOR C++ ─────────────────────────────────────────────────
          '---',
          { opcode: 'compilar',        blockType: Scratch.BlockType.COMMAND,  text: t('block_compile') },
          { opcode: 'subirAlRobot',    blockType: Scratch.BlockType.COMMAND,  text: t('block_upload') },
          { opcode: 'descargarAgente', blockType: Scratch.BlockType.COMMAND,  text: t('block_download_agent') },
          '---',
          { opcode: 'getUploadStatus', blockType: Scratch.BlockType.REPORTER, text: t('block_upload_status') },
          { opcode: 'getLog',          blockType: Scratch.BlockType.REPORTER, text: t('block_log') }
        ],

        menus: {
          motorMenu: { acceptReporters: false, items: [{ text: t('motor_a'), value: 'DER' }, { text: t('motor_b'), value: 'IZQ' }, { text: t('motor_both'), value: 'AMBOS' }] },
          directionMenu: { acceptReporters: false, items: [{ text: t('dir_forward'), value: 'FWD' }, { text: t('dir_backward'), value: 'BWD' }] },
          ledMenu: { acceptReporters: false, items: ['1', '2', { text: t('led_all'), value: 'TODAS' }] },
          dhtMenu: {
            acceptReporters: false,
            items: [
              { text: t('dht_temp'), value: 'TEMP' },
              { text: t('dht_hum'),       value: 'HUM'  }
            ]
          },
          notasMenu: {
            acceptReporters: false,
            items: [
              { text: t('note_do'), value: '262' }, { text: t('note_re'), value: '294' },
              { text: t('note_mi'), value: '330' }, { text: t('note_fa'), value: '349' },
              { text: t('note_sol'), value: '392' }, { text: t('note_la'), value: '440' },
              { text: t('note_si'), value: '494' }, { text: t('note_do5'), value: '523' }
            ]
          }
        }
      };
    }

    // ── HAT ─────────────────────────────────────────────────────────────────
    // Reinicia el buffer de código y activa el script.
    // Los bloques de control nativos de Scratch (por siempre, si/entonces,
    // esperar N seg, repetir X veces) cuelgan de este HAT y son ejecutados
    // por el runtime de Scratch; cada bloque de actuador que corra inyecta
    // su línea C++ en _codeLines automáticamente.
    inicio() {
      this._codeLines = [];
      return true;
    }

    // ── MOTORES (TB6612FNG — homologados con REC PCB1 Arduino) ─────────────────
    // _pct2pwm convierte porcentaje (0-100) al rango PWM (0-255) del ATmega328P
    _pct2pwm(pct) { return Math.round(Math.min(Math.abs(Number(pct)), 100) / 100 * 255); }

    // Unificado: motor + dirección + velocidad en un solo bloque
    moveMotor(args) {
      const v = this._pct2pwm(args.VELOCIDAD);
      const sign = args.DIRECCION === 'BWD' ? '-' : '';
      if (args.MOTOR === 'IZQ' || args.MOTOR === 'AMBOS') this._codeLines.push(`REC_MotorIzquierdo(${sign}${v});`);
      if (args.MOTOR === 'DER' || args.MOTOR === 'AMBOS') this._codeLines.push(`REC_MotorDerecho(${sign}${v});`);
    }

    // 0 = freno activo (IN1=L, IN2=L, PWM=255 en driver TB6612FNG)
    stopMotor(args) {
      if (args.WHICH === 'IZQ'  || args.WHICH === 'AMBOS') this._codeLines.push(`REC_MotorIzquierdo(0);`);
      if (args.WHICH === 'DER'  || args.WHICH === 'AMBOS') this._codeLines.push(`REC_MotorDerecho(0);`);
    }

    // ── LUCES ──────────────────────────────────────────────────────────────
    _hexToRgb(hex) {
      let s = String(hex).replace('#', '');
      if (s.length === 3) s = s.split('').map(c => c + c).join('');
      return {
        r: parseInt(s.slice(0, 2), 16),
        g: parseInt(s.slice(2, 4), 16),
        b: parseInt(s.slice(4, 6), 16)
      };
    }

    encenderLuz(args) {
      const { r, g, b } = this._hexToRgb(args.COLOR);
      if (args.LED === 'TODAS') {
        this._codeLines.push(`REC_LED(1, ${r}, ${g}, ${b});`);
        this._codeLines.push(`REC_LED(2, ${r}, ${g}, ${b});`);
      } else {
        this._codeLines.push(`REC_LED(${args.LED}, ${r}, ${g}, ${b});`);
      }
    }

    apagarLuz(args) {
      if (args.LED === 'TODAS') {
        this._codeLines.push(`REC_LED(1, 0, 0, 0);`);
        this._codeLines.push(`REC_LED(2, 0, 0, 0);`);
      } else {
        this._codeLines.push(`REC_LED(${args.LED}, 0, 0, 0);`);
      }
    }

    tocarNota(args) {
      this._codeLines.push(`REC_Buzzer(${Math.round(Number(args.NOTE))}, ${Math.max(0, Math.round(Number(args.MS)))});`);
    }

    // ── SENSORES ──────────────────────────────────────────────────────────
    // En modo autónomo los sensores no tienen robot conectado:
    // registran la llamada C++ en el buffer y retornan 0/false como placeholder.
    distancia() {
      this._codeLines.push(`REC_Distancia()`);
      return 0;
    }

    lineaDetectada() {
      this._codeLines.push(`REC_LineaDetectada()`);
      return false;
    }

    getDHT(args) {
      this._codeLines.push(`REC_DHT("${args.TIPO}")`);
      return 0;
    }

    // ── GENERADOR C++ ────────────────────────────────────────────────────────
    // Recorre el árbol de bloques del lienzo (análisis estático, sin ejecutarlos)
    // para producir C++ con estructuras de control reales (while/if/for/delay).
    // El #include <RoboticaEnColegios.h> y los REC_* son la máscara de seguridad
    // del hardware — no modificar ni exponer pines.
    compilar() {
      this._codigoFinal = this._generarCodigoCPP();

      // ── Modal DOM (no puede ser bloqueado, funciona en iframes) ───────────
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.8);z-index:999999;display:flex;align-items:center;justify-content:center';

      const box = document.createElement('div');
      box.style.cssText = 'background:#1a1a2e;border:2px solid #a8ff78;border-radius:8px;padding:20px;width:min(720px,92vw);max-height:82vh;display:flex;flex-direction:column;gap:12px;box-sizing:border-box';

      const title = document.createElement('div');
      title.style.cssText = 'color:#a8ff78;font-family:monospace;font-size:14px;font-weight:bold;flex-shrink:0';
      title.textContent = '⚙️ Código C++ generado — Jeep Autónomo';

      const pre = document.createElement('pre');
      pre.style.cssText = 'background:#0d0d1a;color:#e0e0e0;padding:15px;border-radius:4px;overflow:auto;flex:1;font-family:monospace;font-size:13px;margin:0;white-space:pre;min-height:0';
      pre.textContent = this._codigoFinal;

      const btns = document.createElement('div');
      btns.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;flex-shrink:0';

      const btnCopy = document.createElement('button');
      btnCopy.style.cssText = 'background:#4b5320;color:#fff;border:none;padding:8px 18px;border-radius:4px;cursor:pointer;font-family:monospace;font-size:13px';
      btnCopy.textContent = '📋 Copiar';
      btnCopy.onclick = () => {
        navigator.clipboard.writeText(this._codigoFinal).catch(() => {});
        btnCopy.textContent = '✅ ¡Copiado!';
        setTimeout(() => { btnCopy.textContent = '📋 Copiar'; }, 1800);
      };

      const btnClose = document.createElement('button');
      btnClose.style.cssText = 'background:#6b0000;color:#fff;border:none;padding:8px 18px;border-radius:4px;cursor:pointer;font-family:monospace;font-size:13px';
      btnClose.textContent = '✖ Cerrar';
      const cerrar = () => { try { document.body.removeChild(overlay); } catch (_) {} };
      btnClose.onclick = cerrar;
      overlay.onclick = (e) => { if (e.target === overlay) cerrar(); };

      btns.append(btnCopy, btnClose);
      box.append(title, pre, btns);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
    }

    // ── ANALIZADOR ESTÁTICO DE BLOQUES ────────────────────────────────────────
    // _generarCodigoCPP: localiza el HAT jeepAutonomo_inicio en todos los targets
    // y camina el árbol de hermanos/hijos produciendo líneas C++ correctas.
    // Usa Scratch.vm.runtime (disponible en extensiones unsandboxed de TurboWarp).
    _generarCodigoCPP() {
      const lines = [];
      const vm = (typeof Scratch !== 'undefined' && Scratch.vm) ? Scratch.vm : null;

      if (vm) {
        let found = false;
        for (const target of vm.runtime.targets) {
          const allBlocks = target.blocks._blocks;
          for (const id in allBlocks) {
            if (allBlocks[id].opcode === 'jeepAutonomo_inicio') {
              found = true;
              if (allBlocks[id].next) this._walkChain(target, allBlocks[id].next, lines, '    ');
            }
          }
        }
        if (!found) lines.push('    // (no se encontró el bloque INICIO 🚀 en el lienzo)');
      } else {
        // Fallback: código acumulado en runtime (sin estructuras de control)
        for (const l of this._codeLines) lines.push('    ' + l);
      }

      if (lines.length === 0) lines.push('    // (sin instrucciones — agregá bloques bajo INICIO 🚀)');

      return [
        '#include <RoboticaEnColegios.h>',
        '',
        'void setup() {',
        '    REC_InicializarPlaca();',
        '}',
        '',
        'void loop() {',
        ...lines,
        '}'
      ].join('\n');
    }

    // Camina una cadena lineal de bloques hermanos (siguiendo .next)
    _walkChain(target, blockId, lines, indent) {
      let id = blockId;
      while (id) {
        const block = target.blocks._blocks[id];
        if (!block) break;
        this._genBlock(target, block, lines, indent);
        id = block.next;
      }
    }

    // Traduce un bloque individual a una o varias líneas C++
    _genBlock(target, block, lines, indent) {
      const blks = target.blocks._blocks;

      // Valor de un campo dropdown (almacenado directamente en el bloque)
      const F = (name) => (block.fields[name] || {}).value || '';

      // Valor numérico de un input (shadow literal o reporter conectado)
      const NUM = (name) => {
        const inp = block.inputs[name];
        if (!inp) return 0;
        const id = inp.block != null ? inp.block : inp.shadow;
        if (id == null) return 0;
        const b = blks[id];
        if (!b) return 0;
        for (const key of Object.keys(b.fields || {})) {
          const v = b.fields[key].value;
          if (v !== undefined && v !== null) return Number(v);
        }
        return 0;
      };

      // Valor hex de un input COLOR
      const COLOR = (name) => {
        const inp = block.inputs[name];
        if (!inp) return '#ff0000';
        const id = inp.block != null ? inp.block : inp.shadow;
        if (id == null) return '#ff0000';
        const b = blks[id];
        return (b && b.fields.COLOUR) ? b.fields.COLOUR.value : '#ff0000';
      };

      const p2v = (p) => Math.round(Math.min(Math.abs(p), 100) / 100 * 255);

      switch (block.opcode) {

        // ── Bloques de control nativos de Scratch ──────────────────────────
        case 'control_forever':
          lines.push(`${indent}while (true) {`);
          if (block.inputs.SUBSTACK && block.inputs.SUBSTACK.block)
            this._walkChain(target, block.inputs.SUBSTACK.block, lines, indent + '    ');
          lines.push(`${indent}}`);
          break;

        case 'control_repeat': {
          const n = NUM('TIMES');
          lines.push(`${indent}for (int _i = 0; _i < ${n}; _i++) {`);
          if (block.inputs.SUBSTACK && block.inputs.SUBSTACK.block)
            this._walkChain(target, block.inputs.SUBSTACK.block, lines, indent + '    ');
          lines.push(`${indent}}`);
          break;
        }

        case 'control_if': {
          const c = this._genCond(target, block.inputs.CONDITION, blks);
          lines.push(`${indent}if (${c}) {`);
          if (block.inputs.SUBSTACK && block.inputs.SUBSTACK.block)
            this._walkChain(target, block.inputs.SUBSTACK.block, lines, indent + '    ');
          lines.push(`${indent}}`);
          break;
        }

        case 'control_if_else': {
          const c = this._genCond(target, block.inputs.CONDITION, blks);
          lines.push(`${indent}if (${c}) {`);
          if (block.inputs.SUBSTACK && block.inputs.SUBSTACK.block)
            this._walkChain(target, block.inputs.SUBSTACK.block, lines, indent + '    ');
          lines.push(`${indent}} else {`);
          if (block.inputs.SUBSTACK2 && block.inputs.SUBSTACK2.block)
            this._walkChain(target, block.inputs.SUBSTACK2.block, lines, indent + '    ');
          lines.push(`${indent}}`);
          break;
        }

        case 'control_wait': {
          const secs = NUM('DURATION');
          lines.push(`${indent}delay(${Math.round(secs * 1000)});`);
          break;
        }

        // ── Motores ─────────────────────────────────────────────────────────
        case 'jeepAutonomo_moveMotor': {
          const v = p2v(NUM('VELOCIDAD'));
          const sign = F('DIRECCION') === 'BWD' ? '-' : '';
          const motor = F('MOTOR');
          if (motor === 'IZQ' || motor === 'AMBOS') lines.push(`${indent}REC_MotorIzquierdo(${sign}${v});`);
          if (motor === 'DER' || motor === 'AMBOS') lines.push(`${indent}REC_MotorDerecho(${sign}${v});`);
          break;
        }

        // Retrocompatibilidad con proyectos guardados con bloques antiguos
        case 'jeepAutonomo_moveForward': {
          const v = p2v(NUM('PCT'));
          lines.push(F('SIDE') === 'IZQ'
            ? `${indent}REC_MotorIzquierdo(${v});`
            : `${indent}REC_MotorDerecho(${v});`);
          break;
        }

        case 'jeepAutonomo_moveBackward': {
          const v = p2v(NUM('PCT'));
          lines.push(F('SIDE') === 'IZQ'
            ? `${indent}REC_MotorIzquierdo(-${v});`
            : `${indent}REC_MotorDerecho(-${v});`);
          break;
        }

        case 'jeepAutonomo_stopMotor': {
          const w = F('WHICH');
          if (w === 'IZQ' || w === 'AMBOS') lines.push(`${indent}REC_MotorIzquierdo(0);`);
          if (w === 'DER' || w === 'AMBOS') lines.push(`${indent}REC_MotorDerecho(0);`);
          break;
        }

        // ── Luces ────────────────────────────────────────────────────────────
        case 'jeepAutonomo_encenderLuz': {
          const hex = COLOR('COLOR');
          const { r, g, b } = this._hexToRgb(hex);
          const led = F('LED');
          if (led === 'TODAS') {
            lines.push(`${indent}REC_LED(1, ${r}, ${g}, ${b});`);
            lines.push(`${indent}REC_LED(2, ${r}, ${g}, ${b});`);
          } else {
            lines.push(`${indent}REC_LED(${led}, ${r}, ${g}, ${b});`);
          }
          break;
        }

        case 'jeepAutonomo_apagarLuz': {
          const led = F('LED');
          if (led === 'TODAS') {
            lines.push(`${indent}REC_LED(1, 0, 0, 0);`);
            lines.push(`${indent}REC_LED(2, 0, 0, 0);`);
          } else {
            lines.push(`${indent}REC_LED(${led}, 0, 0, 0);`);
          }
          break;
        }

        case 'jeepAutonomo_tocarNota': {
          const note = NUM('NOTE');
          const ms   = NUM('MS');
          lines.push(`${indent}REC_Buzzer(${Math.round(note)}, ${Math.max(0, Math.round(ms))});`);
          break;
        }

        default:
          break;
      }
    }

    // Traduce un input boolean a expresión C++ (para condiciones if/while)
    _genCond(target, input, blks) {
      if (!input || input.block == null) return 'false';
      const block = blks[input.block];
      if (!block) return 'false';

      // Valor de un operando: literal numérico o reporter conocido
      const VAL = (name) => {
        const inp = block.inputs[name];
        if (!inp) return '0';
        const id = inp.block != null ? inp.block : inp.shadow;
        if (id == null) return '0';
        const b = blks[id];
        if (!b) return '0';
        if (b.opcode === 'jeepAutonomo_distancia') return 'REC_Distancia()';
        if (b.opcode === 'jeepAutonomo_getDHT') {
          const tipo = (b.fields.TIPO || { value: 'TEMP' }).value;
          return `REC_DHT("${tipo}")`;
        }
        for (const key of Object.keys(b.fields || {})) return String(b.fields[key].value);
        return '0';
      };

      switch (block.opcode) {
        case 'jeepAutonomo_lineaDetectada': return 'REC_LineaDetectada()';
        case 'operator_gt':     return `${VAL('OPERAND1')} > ${VAL('OPERAND2')}`;
        case 'operator_lt':     return `${VAL('OPERAND1')} < ${VAL('OPERAND2')}`;
        case 'operator_equals': return `${VAL('OPERAND1')} == ${VAL('OPERAND2')}`;
        case 'operator_and': {
          const l = this._genCond(target, block.inputs.OPERAND1, blks);
          const r = this._genCond(target, block.inputs.OPERAND2, blks);
          return `(${l}) && (${r})`;
        }
        case 'operator_or': {
          const l = this._genCond(target, block.inputs.OPERAND1, blks);
          const r = this._genCond(target, block.inputs.OPERAND2, blks);
          return `(${l}) || (${r})`;
        }
        case 'operator_not': {
          const v = this._genCond(target, block.inputs.OPERAND, blks);
          return `!(${v})`;
        }
        default: return 'false';
      }
    }

    // ── LOG INTERNO ────────────────────────────────────────────────────────
    _addLog(msg) {
      const ts = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this._log.unshift(`[${ts}] ${msg}`);
      if (this._log.length > 20) this._log.pop();
    }

    // ── SUBIR AL ROBOT: Agente Windows (localhost:3000) → STK500v1 ──────────
    async subirAlRobot() {
      // Generar siempre código fresco del árbol de bloques del lienzo
      this._codigoFinal = this._generarCodigoCPP();

      this._uploadStatus = 'INICIANDO...';
      this._addLog('Iniciando secuencia de carga al robot...');
      this._log = this._log.slice(0, 1); // limpiar log anterior

      const onProgress = (msg) => {
        this._uploadStatus = msg;
        this._addLog(msg);
        console.info('[JeepAutonomo]', msg);
      };

      const flasher = new _STK500Flasher();

      try {
        // ── PASO 1: Solicitar puerto serial ANTES de compilación (user gesture intacto) ────
        await flasher.connect(onProgress);

        // ── PASO 2: Compilar vía Agente Windows local (localhost:3000) ────
        onProgress('⏳ Enviando código al Agente local...');
        let binary;
        try {
          const resp = await fetch('http://localhost:3000/compilar', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ codigo: this._codigoFinal })
          });
          if (!resp.ok) {
            const detail = await resp.text().catch(() => resp.statusText);
            throw new Error(`Agente respondió ${resp.status}: ${detail}`);
          }
          const buf = await resp.arrayBuffer();
          const ct  = resp.headers.get('Content-Type') || '';
          // El agente devuelve Intel HEX (text/plain) → parsear a Uint8Array
          if (ct.includes('text') || ct.includes('hex')) {
            binary = _parseIntelHex(new TextDecoder().decode(buf));
          } else {
            const hexStr = new TextDecoder().decode(buf);
            binary = hexStr.trimStart().startsWith(':')
              ? _parseIntelHex(hexStr)
              : new Uint8Array(buf);
          }
          onProgress('✅ Compilación exitosa');
        } catch (e) {
          if (e.name === 'TypeError' || e.message.includes('Failed to fetch') ||
              e.message.includes('NetworkError') || e.message.includes('REFUSED')) {
            this._uploadStatus = '❌ Agente no disponible';
            this._addLog('⚠️ Agente Windows no encontrado en localhost:3000');
            alert(
              '⚠️ No se encontró el Agente de compilación.\n\n' +
              'Para subir programas al robot necesitás el Agente Windows instalado y corriendo.\n\n' +
              '→ Usá el bloque "⬇️ Descargar Compilador (Windows)" para obtenerlo.'
            );
            return;
          }
          throw e;
        }

        // ── PASO 3: Flasheo STK500v1 vía Web Serial ──────────────────────
        await flasher.sync(onProgress);
        await flasher.enterProgramMode(onProgress);
        await flasher.flashBinary(binary, onProgress);
        await flasher.leaveProgramMode(onProgress);

        this._uploadStatus = '✅ Carga exitosa';
        this._addLog('✅ ¡Programa cargado! El robot ya funciona en modo autónomo.');
        this._mostrarExito();

      } catch (err) {
        // ── MANEJO DE ERRORES PEDAGÓGICO ─────────────────────────────────
        this._uploadStatus = '❌ Error — ver registro';
        this._addLog(`❌ ${err.message}`);
        console.error('[JeepAutonomo] Error de carga:', err);
        alert(
          `❌ No se pudo cargar el programa al robot:\n\n` +
          `${err.message}\n\n` +
          `Revisá el bloque "🪲 registro de errores" para más detalles.`
        );
      } finally {
        try { await flasher.close(); } catch (_) {}
      }
    }

    // ── DESCARGA DEL AGENTE WINDOWS ──────────────────────────────────────────
    // URL configurable: apuntar al .exe generado con `npm run build-exe`
    // en la carpeta agente-windows/ y publicado en el repo.
    descargarAgente() {
      const AGENTE_URL = 'https://github.com/ROBOTICAENCOLEGIOS/Laboratorio-IA/releases/download/2.0/Instalador-Compilador-REC.exe';
      const a = document.createElement('a');
      a.href     = AGENTE_URL;
      a.download = 'Instalador-Compilador-REC.exe';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    // ── MODAL DE ÉXITO ────────────────────────────────────────────────────────
    _mostrarExito() {
      const overlay = document.createElement('div');
      overlay.style.cssText = [
        'position:fixed;top:0;left:0;width:100%;height:100%;z-index:999999',
        'background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center'
      ].join(';');

      const box = document.createElement('div');
      box.style.cssText = [
        'background:#0d1b2a;border:3px solid #00f1e4;border-radius:16px',
        'padding:48px 56px;display:flex;flex-direction:column;align-items:center',
        'gap:20px;box-shadow:0 0 48px rgba(0,241,228,.4);max-width:480px;text-align:center'
      ].join(';');

      const icon = document.createElement('div');
      icon.style.cssText = 'font-size:72px;line-height:1';
      icon.textContent = '🚀';

      const titulo = document.createElement('div');
      titulo.style.cssText = [
        'color:#00f1e4;font-family:Arial,sans-serif;font-size:28px',
        'font-weight:900;letter-spacing:-0.5px;line-height:1.2'
      ].join(';');
      titulo.textContent = '¡Compilación y subida exitosa!';

      const sub = document.createElement('div');
      sub.style.cssText = 'color:#b0f5f1;font-family:Arial,sans-serif;font-size:15px;line-height:1.5';
      sub.textContent = 'Tu programa ya está corriendo en el robot. ¡A probarlo!';

      const btnCerrar = document.createElement('button');
      btnCerrar.style.cssText = [
        'margin-top:8px;background:#00f1e4;color:#0d1b2a;border:none',
        'padding:12px 40px;border-radius:8px;cursor:pointer',
        'font-family:Arial,sans-serif;font-size:16px;font-weight:700'
      ].join(';');
      btnCerrar.textContent = '¡Genial!';
      const cerrar = () => { try { document.body.removeChild(overlay); } catch (_) {} };
      btnCerrar.onclick = cerrar;
      overlay.onclick = (e) => { if (e.target === overlay) cerrar(); };
      setTimeout(cerrar, 8000); // auto-cierre a los 8 s

      box.append(icon, titulo, sub, btnCerrar);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
    }

    getUploadStatus() { return this._uploadStatus; }
    getLog()          { return this._log.length ? this._log[0] : '(sin registros)'; }
  }

  Scratch.extensions.register(new JeepAutonomo());
})(Scratch);