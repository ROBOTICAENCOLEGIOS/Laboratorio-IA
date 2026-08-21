/**
TurboWarp / Scratch 3 Custom Extension — REC R2D2 ARDUINO v1.0
Web Serial API @ 115200 baud. Paleta Rojo Bordeaux / Furioso. */ (function (Scratch) { 'use strict';

if (!Scratch.extensions.unsandboxed) {
  throw new Error('Esta extension debe ejecutarse sin sandbox (unsandboxed) para acceder al puerto serial.');
}

const I18N_BLOCKS = {
  es: {
    ext_title: 'R2D2 Robot (Bluetooth-USB)',
    r2d2_loaded_msg: '¡R2D2 Robot (Bluetooth-USB) cargado! Busca los bloques al final de la paleta izquierda 👇',
    btn_connect: 'Conectar Robot',
    btn_reset_port: '🔄 Reiniciar Puerto',
    msg_reset_success: '¡Puerto liberado y reseteado exitosamente!',
    check_connection: 'Check Connection',
    block_move_motor: 'Mover motor [SIDE] hacia [DIR] a [PCT]%',
    motor_dir_fwd: 'ADELANTE',
    motor_dir_bwd: 'ATRAS',
    block_stop_motor: 'Detener motor [WHICH]',
    motor_der: 'Motor A / Derecho',
    motor_izq: 'Motor B / Izquierdo',
    motor_cab: 'Motor C / Cabeza',
    stop_all: 'TODOS',
    block_girar_cabeza: 'Girar Cabeza [DIR] a [PCT]%',
    block_set_neon: 'Encender Neón [STATE]',
    block_set_burbujas: 'Activar Burbujero [STATE]',
    block_play_note: 'Tocar nota [NOTE] por [MS] ms',
    state_on: 'ENCENDIDO',
    state_off: 'APAGADO'
  },
  en: {
    ext_title: 'R2D2 Robot (Bluetooth-USB)',
    r2d2_loaded_msg: 'R2D2 Robot (Bluetooth-USB) loaded! Look for the blocks at the bottom of the left palette 👇',
    btn_connect: 'Connect Robot',
    btn_reset_port: '🔄 Reset Port',
    msg_reset_success: 'Port successfully reset and released!',
    check_connection: 'Check Connection',
    block_move_motor: 'Move [SIDE] motor [DIR] at [PCT]%',
    motor_dir_fwd: 'FORWARD',
    motor_dir_bwd: 'BACKWARD',
    block_stop_motor: 'Stop [WHICH] motor',
    motor_der: 'Motor A / Right',
    motor_izq: 'Motor B / Left',
    motor_cab: 'Motor C / Head',
    stop_all: 'ALL',
    block_girar_cabeza: 'Turn Head [DIR] at [PCT]%',
    block_set_neon: 'Turn Neon [STATE]',
    block_set_burbujas: 'Turn Bubbles [STATE]',
    block_play_note: 'Play note [NOTE] for [MS] ms',
    state_on: 'ON',
    state_off: 'OFF'
  }
};

// ── Toast de extensión cargada ──────────────────────────────────────────
let r2d2ToastCssInjected = false;
function injectR2d2ToastCSS() {
  if (r2d2ToastCssInjected) return;
  r2d2ToastCssInjected = true;
  const style = document.createElement('style');
  style.id = 'rec-r2d2-toast-css';
  style.textContent =
    '#rec-r2d2-toast {' +
    '  position: fixed;' +
    '  bottom: 1rem;' +
    '  left: 1rem;' +
    '  z-index: 9999;' +
    '  max-width: 320px;' +
    '  background: rgba(40,40,40,0.95);' +
    '  color: #fff;' +
    '  border-left: 4px solid #800020;' +
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
    '#rec-r2d2-toast.rec-r2d2-toast-visible {' +
    '  opacity: 1;' +
    '  transform: translateY(0);' +
    '}' +
    '#rec-r2d2-toast.rec-r2d2-toast-hiding {' +
    '  opacity: 0;' +
    '  transform: translateY(10px);' +
    '}' +
    '#rec-r2d2-toast .rec-r2d2-toast-icon {' +
    '  display: inline-block;' +
    '  margin-right: 0.5rem;' +
    '  font-size: 1.1rem;' +
    '  vertical-align: middle;' +
    '}' +
    '#rec-r2d2-toast .rec-r2d2-toast-text {' +
    '  vertical-align: middle;' +
    '  display: inline;' +
    '}';
  document.head.appendChild(style);
}

function showR2d2LoadedToast() {
  if (!document.body) return;
  injectR2d2ToastCSS();

  const existing = document.getElementById('rec-r2d2-toast');
  if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

  const locale = window.currentRecLocale || 'es';
  const dict = I18N_BLOCKS[locale] || I18N_BLOCKS['es'];
  const msg = dict.r2d2_loaded_msg || I18N_BLOCKS['es'].r2d2_loaded_msg;

  const toast = document.createElement('div');
  toast.id = 'rec-r2d2-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  const icon = document.createElement('span');
  icon.className = 'rec-r2d2-toast-icon';
  icon.textContent = '🤖';

  const text = document.createElement('span');
  text.className = 'rec-r2d2-toast-text';
  text.textContent = msg;

  toast.appendChild(icon);
  toast.appendChild(text);

  document.body.appendChild(toast);

  if (toast.offsetWidth) {
    // no-op
  }

  toast.classList.add('rec-r2d2-toast-visible');

  setTimeout(() => {
    toast.classList.remove('rec-r2d2-toast-visible');
    toast.classList.add('rec-r2d2-toast-hiding');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 400);
  }, 4500);
}

class RecR2D2Arduino {
  constructor(runtime) {
    this.runtime = runtime;
    this.port = null;
    this._activePort = null;
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
    this._rxRemainder = '';
    this._lineWaiters = [];
    this._readLoopRunning = false;
    this._serialQueue = Promise.resolve();
    this._lastMotorValue = { IZQ: null, DER: null, CAB: null };
    this._toastMostrado = false;
  }

  getInfo() {
    if (!this._toastMostrado) {
      showR2d2LoadedToast();
      this._toastMostrado = true;
    }

    const t = I18N_BLOCKS[window.currentRecLocale || 'es'] || I18N_BLOCKS['es'];
    return {
      id: 'recr2d2arduino',
      name: t.ext_title,
      color1: '#800020',
      color2: '#660019',
      color3: '#4d0013',
      blocks: [
        { func: 'connectRobot', blockType: Scratch.BlockType.BUTTON, text: t.btn_connect, callFunc: this.connectRobot.bind(this) },
        { func: 'resetPort', blockType: Scratch.BlockType.BUTTON, text: t.btn_reset_port, callFunc: this.resetPort.bind(this) },
        { opcode: 'checkConnection', blockType: Scratch.BlockType.REPORTER, text: t.check_connection },
        '---',
        {
          opcode: 'moveMotor',
          blockType: Scratch.BlockType.COMMAND,
          text: t.block_move_motor,
          arguments: {
            SIDE: { type: Scratch.ArgumentType.STRING, menu: 'motorSide', defaultValue: 'DER' },
            DIR:  { type: Scratch.ArgumentType.STRING, menu: 'motorDir', defaultValue: 'FWD' },
            PCT:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
          }
        },
        {
          opcode: 'stopMotor',
          blockType: Scratch.BlockType.COMMAND,
          text: t.block_stop_motor,
          arguments: {
            WHICH: { type: Scratch.ArgumentType.STRING, menu: 'stopWhich', defaultValue: 'AMBOS' }
          }
        },
        {
          opcode: 'girarCabeza',
          blockType: Scratch.BlockType.COMMAND,
          text: t.block_girar_cabeza,
          arguments: {
            DIR: { type: Scratch.ArgumentType.STRING, menu: 'motorDir', defaultValue: 'FWD' },
            PCT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
          }
        },
        '---',
        {
          opcode: 'setNeon',
          blockType: Scratch.BlockType.COMMAND,
          text: t.block_set_neon,
          arguments: {
            STATE: { type: Scratch.ArgumentType.STRING, menu: 'stateOnOff', defaultValue: '1' }
          }
        },
        {
          opcode: 'setBurbujas',
          blockType: Scratch.BlockType.COMMAND,
          text: t.block_set_burbujas,
          arguments: {
            STATE: { type: Scratch.ArgumentType.STRING, menu: 'stateOnOff', defaultValue: '1' }
          }
        },
        '---',
        {
          opcode: 'playNote',
          blockType: Scratch.BlockType.COMMAND,
          text: t.block_play_note,
          arguments: {
            NOTE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 60 },
            MS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 500 }
          }
        }
      ],
      menus: {
        motorSide: {
          items: [
            { text: t.motor_der, value: 'DER' },
            { text: t.motor_izq, value: 'IZQ' },
            { text: t.motor_cab, value: 'CAB' },
            { text: t.stop_all, value: 'AMBOS' }
          ]
        },
        motorDir: { items: [{ text: t.motor_dir_fwd, value: 'FWD' }, { text: t.motor_dir_bwd, value: 'BWD' }] },
        stopWhich: {
          items: [
            { text: t.motor_der, value: 'DER' },
            { text: t.motor_izq, value: 'IZQ' },
            { text: t.motor_cab, value: 'CAB' },
            { text: t.stop_all, value: 'AMBOS' }
          ]
        },
        stateOnOff: {
          items: [
            { text: t.state_on, value: '1' },
            { text: t.state_off, value: '0' }
          ]
        }
      }
    };
  }

  _connected() { return !!(this._activePort && this._activePort.readable && this._activePort.writable); }
  checkConnection() { return this._connected() ? 'Connected' : 'Disconnected'; }

  async connectRobot() {
    if (this._connected()) {
      console.log('[connectRobot] Ya conectado, ignorando clic');
      return;
    }
    try {
      this.port = await navigator.serial.requestPort();
      await this._disconnect();
      this._activePort = this.port;
      await this._activePort.open({ baudRate: 115200 });
      this._startReadLoop();
    } catch (e) {
      console.error("Error al conectar:", e);
      this._activePort = null;
    }
  }

  async resetPort() {
    try {
      await this._disconnect();
      this.port = null;
      this._rxRemainder = '';
      if (Array.isArray(this._lineWaiters)) {
        this._lineWaiters.forEach(w => {
          if (w && w.timer) clearTimeout(w.timer);
          if (w && typeof w.reject === 'function') w.reject(new Error('Port reset'));
        });
        this._lineWaiters = [];
      }
      this._serialQueue = Promise.resolve();
      console.log('[resetPort] Puerto e hilos de lectura liberados exitosamente');
      const t = I18N_BLOCKS[window.currentRecLocale || 'es'] || I18N_BLOCKS['es'];
      alert(t.msg_reset_success);
    } catch (e) {
      console.error('[resetPort] Error al reiniciar puerto:', e);
    }
  }

  async _disconnect() {
    this._readLoopRunning = false;
    if (this._activePort) { try { await this._activePort.close(); } catch (_) {} this._activePort = null; }
    this._lastMotorValue = { IZQ: null, DER: null, CAB: null };
  }

  _enqueueSerial(task) { const next = this._serialQueue.then(() => task()); this._serialQueue = next.catch(() => {}); return next; }

  async _sendLineRaw(msg) {
    if (!this._activePort || !this._activePort.writable) return;
    const writer = this._activePort.writable.getWriter();
    try { await writer.write(this.encoder.encode(msg + '\n')); } finally { writer.releaseLock(); }
  }

  async _sendLine(msg) { return this._enqueueSerial(() => this._sendLineRaw(msg)); }

  _waitForLine(predicate, timeoutMs) {
    return new Promise((resolve, reject) => {
      const w = { predicate, resolve, reject };
      this._lineWaiters.push(w);
      if (timeoutMs > 0) {
        w.timer = setTimeout(() => {
          const j = this._lineWaiters.indexOf(w);
          if (j >= 0) this._lineWaiters.splice(j, 1);
          reject(new Error('Timeout'));
        }, timeoutMs);
      }
      const origResolve = w.resolve;
      w.resolve = (val) => { if (w.timer) clearTimeout(w.timer); origResolve(val); };
    });
  }

  _startReadLoop() {
    if (this._readLoopRunning || !this._activePort || !this._activePort.readable) return;
    this._readLoopRunning = true;
    const run = async () => {
      try {
        while (this._activePort && this._readLoopRunning) {
          const reader = this._activePort.readable.getReader();
          try { for (;;) { const { value, done } = await reader.read(); if (done) break; if (value && value.byteLength) this._feedBytes(value); }
          } finally { reader.releaseLock(); }
        }
      } catch (_) {} finally { this._readLoopRunning = false; }
    };
    run();
  }

  _feedBytes(u8) {
    this._rxRemainder += this.decoder.decode(u8, { stream: true });
    let idx;
    while ((idx = this._rxRemainder.indexOf('\n')) >= 0) {
      const line = this._rxRemainder.slice(0, idx).replace(/\r$/, '').trim();
      this._rxRemainder = this._rxRemainder.slice(idx + 1);
      if (line) this._dispatchLine(line);
    }
  }

  _dispatchLine(line) {
    for (let i = 0; i < this._lineWaiters.length; i++) {
      const w = this._lineWaiters[i];
      if (w.predicate(line)) { this._lineWaiters.splice(i, 1); w.resolve(line); return; }
    }
  }

  async _setMotor(side, value) {
    if (this._lastMotorValue[side] === value) return;
    this._lastMotorValue[side] = value;
    await this._sendLine(`AT+M_${side}=${value}`);
  }

  async moveMotor(args) {
    const val = Math.round((Math.abs(args.PCT) / 100) * 255);
    const signed = args.DIR === 'BWD' ? -val : val;
    if (args.SIDE === 'AMBOS') {
      await this._setMotor('DER', signed);
      await this._setMotor('IZQ', signed);
      await this._setMotor('CAB', signed);
    } else {
      await this._setMotor(args.SIDE, signed);
    }
  }

  async stopMotor(args) {
    if (args.WHICH === 'AMBOS') {
      await this._setMotor('DER', 0);
      await this._setMotor('IZQ', 0);
      await this._setMotor('CAB', 0);
    } else {
      await this._setMotor(args.WHICH, 0);
    }
  }

  async girarCabeza(args) {
    return this.moveMotor({ SIDE: 'CAB', DIR: args.DIR, PCT: args.PCT });
  }

  async setNeon(args) {
    return this._sendLine('AT+NEON=' + args.STATE);
  }

  async setBurbujas(args) {
    return this._sendLine('AT+BURBUJAS=' + args.STATE);
  }

  async playNote(args) {
    return this._sendLine('AT+NOTE=' + Math.round(args.NOTE) + ',' + Math.max(0, Math.round(args.MS)));
  }
}

Scratch.extensions.register(new RecR2D2Arduino()); })(Scratch);
