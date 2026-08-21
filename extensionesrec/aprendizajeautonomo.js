/* Extensión TurboWarp/Scratch 3: Aprendizaje Autónomo (Q-Learning) — RobotEnColegios.
   Middleware unificado (Bridge) que entrena y controla de forma transparente tanto
   al Robot Físico Arduino (extensionpcb.js, id 'recpcb1arduino') como al Jeep
   Virtual (robotjeepvirtual.js, id 'robotJeepVirtualREC') mediante Q-Learning
   tabular con actualización de Bellman, discretización de estados y persistencia
   de la Q-Table en formato JSON. */
(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Aprendizaje Autónomo REC requiere modo unsandboxed.');
  }

  // ── Acciones disponibles del espacio de acciones A ───────────────────────
  const ACTIONS = ['AVANZAR', 'RETROCEDER', 'GIRAR_IZQUIERDA', 'GIRAR_DERECHA', 'DETENER'];

  class AprendizajeAutonomoREC {
    constructor() {
      // ── Estado del puente (bridge) ────────────────────────────────────
      this._activeTarget = 'VIRTUAL'; // 'VIRTUAL' | 'FISICO'

      // ── Hiperparámetros del Q-Learning (fijos, calibrados para laberintos) ──
      this._alpha           = 0.2;  // Tasa de aprendizaje
      this._gamma           = 0.9;  // Factor de descuento
      this._epsilonEntrenamiento = 0.2;  // Exploración en modo Entrenamiento
      this._epsilonAutonomo      = 0.0;  // Exploración en modo Autónomo

      // ── Q-Table tabular: { estado: { accion: valorQ, ... }, ... } ────────
      this._qTable = {};

      // ── Memoria del último estado/acción para la actualización Bellman ──
      this._lastState  = null;
      this._lastAction = null;
    }

    // ══════════════════════════════════════════════════════════════════════
    // ── Bridge: selección de objetivo activo ────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════
    _getBridgeInstance() {
      if (this._activeTarget === 'VIRTUAL') {
        return window.REC_ROBOT_VIRTUAL || null;
      }
      if (this._activeTarget === 'FISICO') {
        return window.REC_ROBOT_FISICO || null;
      }
      return null;
    }

    async _bridgeCall(method, args) {
      const inst = this._getBridgeInstance();
      if (!inst || typeof inst[method] !== 'function') {
        console.warn(`[AprendizajeAutonomoREC] Objetivo "${this._activeTarget}" no disponible o método "${method}" inexistente.`);
        return null;
      }
      try {
        return await inst[method](args || {});
      } catch (e) {
        console.error(`[AprendizajeAutonomoREC] Error al invocar ${method} sobre ${this._activeTarget}:`, e);
        return null;
      }
    }

    seleccionarObjetivo ({ OBJETIVO }) {
      this._activeTarget = (OBJETIVO === 'FISICO') ? 'FISICO' : 'VIRTUAL';
    }

    objetivoActivo () {
      return this._activeTarget;
    }

    // ══════════════════════════════════════════════════════════════════════
    // ── Entradas unificadas (sensores) ──────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════
    async obtenerDistanciaCm () {
      const d = await this._bridgeCall('distanceCm', {});
      if (d === null || d === undefined) return -1;
      const n = Number(d);
      return isNaN(n) ? -1 : n;
    }

    async sensorLineaDetectada () {
      const v = await this._bridgeCall('lineDetected', {});
      return !!v;
    }

    // ══════════════════════════════════════════════════════════════════════
    // ── Salidas unificadas (acciones motoras) ───────────────────────────────
    // ══════════════════════════════════════════════════════════════════════
    async ejecutarAccion ({ ACCION, VELOCIDAD_PWM }) {
      const pwm = Math.max(0, Math.min(255, Math.round(Number(VELOCIDAD_PWM) || 0)));
      const pct = Math.round((pwm / 255) * 100);

      switch (ACCION) {
        case 'AVANZAR':
          await this._bridgeCall('moveMotor', { SIDE: 'AMBOS', DIR: 'FWD', PCT: pct });
          break;
        case 'RETROCEDER':
          await this._bridgeCall('moveMotor', { SIDE: 'AMBOS', DIR: 'BWD', PCT: pct });
          break;
        case 'GIRAR_IZQUIERDA':
          await this._bridgeCall('moveMotor', { SIDE: 'IZQ', DIR: 'BWD', PCT: pct });
          await this._bridgeCall('moveMotor', { SIDE: 'DER', DIR: 'FWD', PCT: pct });
          break;
        case 'GIRAR_DERECHA':
          await this._bridgeCall('moveMotor', { SIDE: 'IZQ', DIR: 'FWD', PCT: pct });
          await this._bridgeCall('moveMotor', { SIDE: 'DER', DIR: 'BWD', PCT: pct });
          break;
        case 'DETENER':
        default:
          await this._bridgeCall('stopMotor', { WHICH: 'AMBOS' });
          break;
      }
    }

    async detenerMotores () {
      await this._bridgeCall('stopMotor', { WHICH: 'AMBOS' });
    }

    // ══════════════════════════════════════════════════════════════════════
    // ── Discretización de estados ────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════
    _discretizarDistancia (d) {
      if (d === null || d === undefined || isNaN(d) || d < 0) return 'LIBRE';
      if (d < 15)  return 'CERCA';
      if (d < 30)  return 'MEDIO';
      if (d < 100) return 'LEJOS';
      return 'LIBRE';
    }

    async obtenerEstado () {
      const dist  = await this.obtenerDistanciaCm();
      const linea = await this.sensorLineaDetectada();
      const distCat = this._discretizarDistancia(dist);
      const lineCat = linea ? 'LINEA_SI' : 'LINEA_NO';
      return `${distCat}_${lineCat}`;
    }

    // ══════════════════════════════════════════════════════════════════════
    // ── Q-Table: inicialización perezosa de estados ─────────────────────────
    // ══════════════════════════════════════════════════════════════════════
    _asegurarEstado (estado) {
      if (!this._qTable[estado]) {
        const fila = {};
        for (const a of ACTIONS) fila[a] = 0;
        this._qTable[estado] = fila;
      }
      return this._qTable[estado];
    }

    _mejorAccion (estado) {
      const fila = this._asegurarEstado(estado);
      let mejor = ACTIONS[0];
      let mejorValor = fila[mejor];
      for (const a of ACTIONS) {
        if (fila[a] > mejorValor) { mejorValor = fila[a]; mejor = a; }
      }
      return mejor;
    }

    // ══════════════════════════════════════════════════════════════════════
    // ── Selección de acción ε-greedy ─────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════
    async elegirAccion ({ MODO }) {
      const estado = await this.obtenerEstado();
      this._asegurarEstado(estado);

      const epsilon = (MODO === 'AUTONOMO') ? this._epsilonAutonomo : this._epsilonEntrenamiento;
      let accion;
      if (Math.random() < epsilon) {
        accion = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
      } else {
        accion = this._mejorAccion(estado);
      }

      this._lastState  = estado;
      this._lastAction = accion;
      return accion;
    }

    // ══════════════════════════════════════════════════════════════════════
    // ── Registro de recompensa + Actualización de Bellman ───────────────────
    // ══════════════════════════════════════════════════════════════════════
    async registrarRecompensa ({ RECOMPENSA }) {
      if (this._lastState === null || this._lastAction === null) return;

      const nuevoEstado = await this.obtenerEstado();
      const filaActual  = this._asegurarEstado(this._lastState);
      const filaNueva   = this._asegurarEstado(nuevoEstado);

      const r = Number(RECOMPENSA) || 0;
      const maxQSiguiente = Math.max(...ACTIONS.map(a => filaNueva[a]));
      const qActual = filaActual[this._lastAction];

      filaActual[this._lastAction] = qActual + this._alpha * (r + this._gamma * maxQSiguiente - qActual);

      this._lastState = nuevoEstado;
    }

    iniciarEpisodio () {
      this._lastState  = null;
      this._lastAction = null;
    }

    // ══════════════════════════════════════════════════════════════════════
    // ── Persistencia de la Q-Table ───────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════
    exportarQTable () {
      try {
        return JSON.stringify(this._qTable);
      } catch (e) {
        console.error('[AprendizajeAutonomoREC] Error al exportar Q-Table:', e);
        return '{}';
      }
    }

    importarQTable ({ JSON_TEXTO }) {
      try {
        const parsed = JSON.parse(JSON_TEXTO);
        if (parsed && typeof parsed === 'object') {
          this._qTable = parsed;
        }
      } catch (e) {
        console.error('[AprendizajeAutonomoREC] Error al importar Q-Table (JSON inválido):', e);
      }
    }

    reiniciarQTable () {
      this._qTable = {};
      this._lastState  = null;
      this._lastAction = null;
    }

    // ══════════════════════════════════════════════════════════════════════
    // ── Definición de bloques Scratch ─────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════
    getInfo () {
      return {
        id: 'aprendizajeAutonomoREC',
        name: '🧠 Aprendizaje Autónomo (Q-Learning)',
        color1: '#8A2BE2',
        color2: '#6A0DAD',
        color3: '#4B0082',
        blocks: [
          { blockType: Scratch.BlockType.LABEL, text: '🔗 Puente (Bridge)' },
          {
            opcode: 'seleccionarObjetivo',
            blockType: Scratch.BlockType.COMMAND,
            text: 'seleccionar objetivo activo: [OBJETIVO]',
            arguments: {
              OBJETIVO: { type: Scratch.ArgumentType.STRING, menu: 'targetMenu', defaultValue: 'VIRTUAL' }
            }
          },
          { opcode: 'objetivoActivo', blockType: Scratch.BlockType.REPORTER, text: 'objetivo activo' },
          '---',

          { blockType: Scratch.BlockType.LABEL, text: '📡 Sensores unificados' },
          { opcode: 'obtenerDistanciaCm', blockType: Scratch.BlockType.REPORTER, text: 'distancia (cm)' },
          { opcode: 'sensorLineaDetectada', blockType: Scratch.BlockType.BOOLEAN, text: 'línea detectada' },
          '---',

          { blockType: Scratch.BlockType.LABEL, text: '🚗 Acciones unificadas' },
          {
            opcode: 'ejecutarAccion',
            blockType: Scratch.BlockType.COMMAND,
            text: 'ejecutar acción [ACCION] a velocidad PWM [VELOCIDAD_PWM]',
            arguments: {
              ACCION: { type: Scratch.ArgumentType.STRING, menu: 'actionMenu', defaultValue: 'AVANZAR' },
              VELOCIDAD_PWM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 150 }
            }
          },
          { opcode: 'detenerMotores', blockType: Scratch.BlockType.COMMAND, text: 'detener motores' },
          '---',

          { blockType: Scratch.BlockType.LABEL, text: '🧩 Estado y Acción (Q-Learning)' },
          { opcode: 'obtenerEstado', blockType: Scratch.BlockType.REPORTER, text: 'obtener estado actual (S)' },
          {
            opcode: 'elegirAccion',
            blockType: Scratch.BlockType.REPORTER,
            text: 'elegir acción en modo [MODO]',
            arguments: {
              MODO: { type: Scratch.ArgumentType.STRING, menu: 'modeMenu', defaultValue: 'ENTRENAMIENTO' }
            }
          },
          {
            opcode: 'registrarRecompensa',
            blockType: Scratch.BlockType.COMMAND,
            text: 'registrar recompensa (R) = [RECOMPENSA]',
            arguments: { RECOMPENSA: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 } }
          },
          { opcode: 'iniciarEpisodio', blockType: Scratch.BlockType.COMMAND, text: 'iniciar nuevo episodio' },
          '---',

          { blockType: Scratch.BlockType.LABEL, text: '💾 Persistencia de la Q-Table' },
          { opcode: 'exportarQTable', blockType: Scratch.BlockType.REPORTER, text: 'exportar Q-Table (JSON)' },
          {
            opcode: 'importarQTable',
            blockType: Scratch.BlockType.COMMAND,
            text: 'importar Q-Table desde JSON [JSON_TEXTO]',
            arguments: { JSON_TEXTO: { type: Scratch.ArgumentType.STRING, defaultValue: '{}' } }
          },
          { opcode: 'reiniciarQTable', blockType: Scratch.BlockType.COMMAND, text: 'reiniciar Q-Table' }
        ],
        menus: {
          targetMenu: {
            acceptReporters: false,
            items: [
              { text: 'Virtual', value: 'VIRTUAL' },
              { text: 'Físico',  value: 'FISICO' }
            ]
          },
          modeMenu: {
            acceptReporters: false,
            items: [
              { text: 'Entrenamiento (exploración)', value: 'ENTRENAMIENTO' },
              { text: 'Autónomo (explotación)',       value: 'AUTONOMO' }
            ]
          },
          actionMenu: {
            acceptReporters: true,
            items: [
              { text: 'Avanzar',          value: 'AVANZAR' },
              { text: 'Retroceder',       value: 'RETROCEDER' },
              { text: 'Girar Izquierda',  value: 'GIRAR_IZQUIERDA' },
              { text: 'Girar Derecha',    value: 'GIRAR_DERECHA' },
              { text: 'Detener',          value: 'DETENER' }
            ]
          }
        }
      };
    }
  }

  Scratch.extensions.register(new AprendizajeAutonomoREC());
})(Scratch);
