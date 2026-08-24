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

  const I18N_BLOCKS = {
    es: {
      ext_title: '🧠 Aprendizaje Autónomo (Q-Learning)',
      label_bridge: '🔗 Puente (Bridge)',
      block_seleccionar_objetivo: 'seleccionar objetivo activo: [OBJETIVO]',
      block_objetivo_activo: 'objetivo activo',
      label_sensores: '📡 Sensores unificados',
      block_distancia_cm: 'distancia (cm)',
      block_linea_detectada: 'línea detectada',
      label_acciones: '🚗 Acciones unificadas',
      block_ejecutar_accion: 'ejecutar acción [ACCION] a velocidad PWM [VELOCIDAD_PWM]',
      block_detener_motores: 'detener motores',
      label_estado_accion: '🧩 Estado y Acción (Q-Learning)',
      block_obtener_estado: 'obtener estado actual (S)',
      block_elegir_accion: 'elegir acción en modo [MODO]',
      block_registrar_recompensa: 'registrar recompensa (R) = [RECOMPENSA]',
      block_iniciar_episodio: 'iniciar nuevo episodio',
      label_persistencia: '💾 Persistencia de la Q-Table',
      block_exportar_qtable: 'exportar Q-Table (JSON)',
      block_importar_qtable: 'importar Q-Table desde JSON [JSON_TEXTO]',
      block_reiniciar_qtable: 'reiniciar Q-Table',
      menu_target_virtual: 'Virtual',
      menu_target_fisico: 'Físico',
      menu_mode_entrenamiento: 'Entrenamiento (exploración)',
      menu_mode_autonomo: 'Autónomo (explotación)',
      menu_action_avanzar: 'Avanzar',
      menu_action_retroceder: 'Retroceder',
      menu_action_girar_izq: 'Girar Izquierda',
      menu_action_girar_der: 'Girar Derecha',
      menu_action_detener: 'Detener'
    },
    en: {
      ext_title: '🧠 Autonomous Learning (Q-Learning)',
      label_bridge: '🔗 Bridge',
      block_seleccionar_objetivo: 'select active target: [OBJETIVO]',
      block_objetivo_activo: 'active target',
      label_sensores: '📡 Unified Sensors',
      block_distancia_cm: 'distance (cm)',
      block_linea_detectada: 'line detected',
      label_acciones: '🚗 Unified Actions',
      block_ejecutar_accion: 'execute action [ACCION] at PWM speed [VELOCIDAD_PWM]',
      block_detener_motores: 'stop motors',
      label_estado_accion: '🧩 State and Action (Q-Learning)',
      block_obtener_estado: 'get current state (S)',
      block_elegir_accion: 'choose action in mode [MODO]',
      block_registrar_recompensa: 'record reward (R) = [RECOMPENSA]',
      block_iniciar_episodio: 'start new episode',
      label_persistencia: '💾 Q-Table Persistence',
      block_exportar_qtable: 'export Q-Table (JSON)',
      block_importar_qtable: 'import Q-Table from JSON [JSON_TEXTO]',
      block_reiniciar_qtable: 'reset Q-Table',
      menu_target_virtual: 'Virtual',
      menu_target_fisico: 'Physical',
      menu_mode_entrenamiento: 'Training (exploration)',
      menu_mode_autonomo: 'Autonomous (exploitation)',
      menu_action_avanzar: 'Forward',
      menu_action_retroceder: 'Backward',
      menu_action_girar_izq: 'Turn Left',
      menu_action_girar_der: 'Turn Right',
      menu_action_detener: 'Stop'
    },
    pt: {
      ext_title: '🧠 Aprendizado Autônomo (Q-Learning)',
      label_bridge: '🔗 Ponte (Bridge)',
      block_seleccionar_objetivo: 'selecionar alvo ativo: [OBJETIVO]',
      block_objetivo_activo: 'alvo ativo',
      label_sensores: '📡 Sensores unificados',
      block_distancia_cm: 'distância (cm)',
      block_linea_detectada: 'linha detectada',
      label_acciones: '🚗 Ações unificadas',
      block_ejecutar_accion: 'executar ação [ACCION] em velocidade PWM [VELOCIDAD_PWM]',
      block_detener_motores: 'parar motores',
      label_estado_accion: '🧩 Estado e Ação (Q-Learning)',
      block_obtener_estado: 'obter estado atual (S)',
      block_elegir_accion: 'escolher ação no modo [MODO]',
      block_registrar_recompensa: 'registrar recompensa (R) = [RECOMPENSA]',
      block_iniciar_episodio: 'iniciar novo episódio',
      label_persistencia: '💾 Persistência da Q-Table',
      block_exportar_qtable: 'exportar Q-Table (JSON)',
      block_importar_qtable: 'importar Q-Table de JSON [JSON_TEXTO]',
      block_reiniciar_qtable: 'reiniciar Q-Table',
      menu_target_virtual: 'Virtual',
      menu_target_fisico: 'Físico',
      menu_mode_entrenamiento: 'Treinamento (exploração)',
      menu_mode_autonomo: 'Autônomo (explotação)',
      menu_action_avanzar: 'Avançar',
      menu_action_retroceder: 'Recuar',
      menu_action_girar_izq: 'Virar à Esquerda',
      menu_action_girar_der: 'Virar à Direita',
      menu_action_detener: 'Parar'
    },
    fr: {
      ext_title: '🧠 Apprentissage Autonome (Q-Learning)',
      label_bridge: '🔗 Pont (Bridge)',
      block_seleccionar_objetivo: 'sélectionner la cible active : [OBJETIVO]',
      block_objetivo_activo: 'cible active',
      label_sensores: '📡 Capteurs unifiés',
      block_distancia_cm: 'distance (cm)',
      block_linea_detectada: 'ligne détectée',
      label_acciones: '🚗 Actions unifiées',
      block_ejecutar_accion: 'exécuter action [ACCION] à vitesse PWM [VELOCIDAD_PWM]',
      block_detener_motores: 'arrêter les moteurs',
      label_estado_accion: '🧩 État et Action (Q-Learning)',
      block_obtener_estado: 'obtenir l\'état actuel (S)',
      block_elegir_accion: 'choisir action en mode [MODO]',
      block_registrar_recompensa: 'enregistrer récompense (R) = [RECOMPENSA]',
      block_iniciar_episodio: 'démarrer un nouvel épisode',
      label_persistencia: '💾 Persistance de la Q-Table',
      block_exportar_qtable: 'exporter Q-Table (JSON)',
      block_importar_qtable: 'importer Q-Table depuis JSON [JSON_TEXTO]',
      block_reiniciar_qtable: 'réinitialiser Q-Table',
      menu_target_virtual: 'Virtuel',
      menu_target_fisico: 'Physique',
      menu_mode_entrenamiento: 'Entraînement (exploration)',
      menu_mode_autonomo: 'Autonome (exploitation)',
      menu_action_avanzar: 'Avancer',
      menu_action_retroceder: 'Reculer',
      menu_action_girar_izq: 'Tourner à Gauche',
      menu_action_girar_der: 'Tourner à Droite',
      menu_action_detener: 'Arrêter'
    },
    de: {
      ext_title: '🧠 Autonomes Lernen (Q-Learning)',
      label_bridge: '🔗 Brücke (Bridge)',
      block_seleccionar_objetivo: 'aktives Ziel auswählen: [OBJETIVO]',
      block_objetivo_activo: 'aktives Ziel',
      label_sensores: '📡 Vereinheitlichte Sensoren',
      block_distancia_cm: 'Entfernung (cm)',
      block_linea_detectada: 'Linie erkannt',
      label_acciones: '🚗 Vereinheitlichte Aktionen',
      block_ejecutar_accion: 'Aktion [ACCION] mit PWM-Geschwindigkeit [VELOCIDAD_PWM] ausführen',
      block_detener_motores: 'Motoren stoppen',
      label_estado_accion: '🧩 Zustand und Aktion (Q-Learning)',
      block_obtener_estado: 'aktuellen Zustand abrufen (S)',
      block_elegir_accion: 'Aktion im Modus [MODO] wählen',
      block_registrar_recompensa: 'Belohnung (R) = [RECOMPENSA] aufzeichnen',
      block_iniciar_episodio: 'neue Episode starten',
      label_persistencia: '💾 Q-Table-Persistenz',
      block_exportar_qtable: 'Q-Table exportieren (JSON)',
      block_importar_qtable: 'Q-Table aus JSON importieren [JSON_TEXTO]',
      block_reiniciar_qtable: 'Q-Table zurücksetzen',
      menu_target_virtual: 'Virtuell',
      menu_target_fisico: 'Physisch',
      menu_mode_entrenamiento: 'Training (Exploration)',
      menu_mode_autonomo: 'Autonom (Ausnutzung)',
      menu_action_avanzar: 'Vorwärts',
      menu_action_retroceder: 'Rückwärts',
      menu_action_girar_izq: 'Links Drehen',
      menu_action_girar_der: 'Rechts Drehen',
      menu_action_detener: 'Stoppen'
    },
    it: {
      ext_title: '🧠 Apprendimento Autonomo (Q-Learning)',
      label_bridge: '🔗 Ponte (Bridge)',
      block_seleccionar_objetivo: 'selezionare obiettivo attivo: [OBJETIVO]',
      block_objetivo_activo: 'obiettivo attivo',
      label_sensores: '📡 Sensori unificati',
      block_distancia_cm: 'distanza (cm)',
      block_linea_detectada: 'linea rilevata',
      label_acciones: '🚗 Azioni unificate',
      block_ejecutar_accion: 'eseguire azione [ACCION] a velocità PWM [VELOCIDAD_PWM]',
      block_detener_motores: 'fermare i motori',
      label_estado_accion: '🧩 Stato e Azione (Q-Learning)',
      block_obtener_estado: 'ottenere stato attuale (S)',
      block_elegir_accion: 'scegliere azione in modalità [MODO]',
      block_registrar_recompensa: 'registrare ricompensa (R) = [RECOMPENSA]',
      block_iniciar_episodio: 'avviare nuovo episodio',
      label_persistencia: '💾 Persistenza della Q-Table',
      block_exportar_qtable: 'esportare Q-Table (JSON)',
      block_importar_qtable: 'importare Q-Table da JSON [JSON_TEXTO]',
      block_reiniciar_qtable: 'reimpostare Q-Table',
      menu_target_virtual: 'Virtuale',
      menu_target_fisico: 'Fisico',
      menu_mode_entrenamiento: 'Allenamento (esplorazione)',
      menu_mode_autonomo: 'Autonomo (sfruttamento)',
      menu_action_avanzar: 'Avanti',
      menu_action_retroceder: 'Indietro',
      menu_action_girar_izq: 'Girare a Sinistra',
      menu_action_girar_der: 'Girare a Destra',
      menu_action_detener: 'Fermare'
    },
    zh: {
      ext_title: '🧠 自主学习 (Q-Learning)',
      label_bridge: '🔗 桥接 (Bridge)',
      block_seleccionar_objetivo: '选择活动目标：[OBJETIVO]',
      block_objetivo_activo: '活动目标',
      label_sensores: '📡 统一传感器',
      block_distancia_cm: '距离（厘米）',
      block_linea_detectada: '检测到线',
      label_acciones: '🚗 统一动作',
      block_ejecutar_accion: '以PWM速度 [VELOCIDAD_PWM] 执行动作 [ACCION]',
      block_detener_motores: '停止电机',
      label_estado_accion: '🧩 状态与动作 (Q-Learning)',
      block_obtener_estado: '获取当前状态 (S)',
      block_elegir_accion: '在模式 [MODO] 下选择动作',
      block_registrar_recompensa: '记录奖励 (R) = [RECOMPENSA]',
      block_iniciar_episodio: '开始新回合',
      label_persistencia: '💾 Q表持久化',
      block_exportar_qtable: '导出 Q表 (JSON)',
      block_importar_qtable: '从JSON导入Q表 [JSON_TEXTO]',
      block_reiniciar_qtable: '重置Q表',
      menu_target_virtual: '虚拟',
      menu_target_fisico: '实体',
      menu_mode_entrenamiento: '训练（探索）',
      menu_mode_autonomo: '自主（利用）',
      menu_action_avanzar: '前进',
      menu_action_retroceder: '后退',
      menu_action_girar_izq: '左转',
      menu_action_girar_der: '右转',
      menu_action_detener: '停止'
    },
    ja: {
      ext_title: '🧠 自律学習 (Q-Learning)',
      label_bridge: '🔗 ブリッジ',
      block_seleccionar_objetivo: 'アクティブなターゲットを選択：[OBJETIVO]',
      block_objetivo_activo: 'アクティブなターゲット',
      label_sensores: '📡 統合センサー',
      block_distancia_cm: '距離（cm）',
      block_linea_detectada: 'ラインを検出',
      label_acciones: '🚗 統合アクション',
      block_ejecutar_accion: 'PWM速度 [VELOCIDAD_PWM] でアクション [ACCION] を実行',
      block_detener_motores: 'モーターを停止',
      label_estado_accion: '🧩 状態とアクション (Q-Learning)',
      block_obtener_estado: '現在の状態を取得 (S)',
      block_elegir_accion: 'モード [MODO] でアクションを選ぶ',
      block_registrar_recompensa: '報酬 (R) = [RECOMPENSA] を記録',
      block_iniciar_episodio: '新しいエピソードを開始',
      label_persistencia: '💾 Qテーブルの永続化',
      block_exportar_qtable: 'Qテーブルをエクスポート (JSON)',
      block_importar_qtable: 'JSONからQテーブルをインポート [JSON_TEXTO]',
      block_reiniciar_qtable: 'Qテーブルをリセット',
      menu_target_virtual: '仮想',
      menu_target_fisico: '実機',
      menu_mode_entrenamiento: '訓練（探索）',
      menu_mode_autonomo: '自律（活用）',
      menu_action_avanzar: '前進',
      menu_action_retroceder: '後退',
      menu_action_girar_izq: '左に回転',
      menu_action_girar_der: '右に回転',
      menu_action_detener: '停止'
    },
    ko: {
      ext_title: '🧠 자율 학습 (Q-Learning)',
      label_bridge: '🔗 브리지',
      block_seleccionar_objetivo: '활성 대상 선택: [OBJETIVO]',
      block_objetivo_activo: '활성 대상',
      label_sensores: '📡 통합 센서',
      block_distancia_cm: '거리 (cm)',
      block_linea_detectada: '라인 감지됨',
      label_acciones: '🚗 통합 동작',
      block_ejecutar_accion: 'PWM 속도 [VELOCIDAD_PWM] 로 동작 [ACCION] 실행',
      block_detener_motores: '모터 정지',
      label_estado_accion: '🧩 상태 및 동작 (Q-Learning)',
      block_obtener_estado: '현재 상태 가져오기 (S)',
      block_elegir_accion: '모드 [MODO] 에서 동작 선택',
      block_registrar_recompensa: '보상 (R) = [RECOMPENSA] 기록',
      block_iniciar_episodio: '새 에피소드 시작',
      label_persistencia: '💾 Q-테이블 지속성',
      block_exportar_qtable: 'Q-테이블 내보내기 (JSON)',
      block_importar_qtable: 'JSON에서 Q-테이블 가져오기 [JSON_TEXTO]',
      block_reiniciar_qtable: 'Q-테이블 재설정',
      menu_target_virtual: '가상',
      menu_target_fisico: '물리적',
      menu_mode_entrenamiento: '훈련 (탐색)',
      menu_mode_autonomo: '자율 (활용)',
      menu_action_avanzar: '전진',
      menu_action_retroceder: '후진',
      menu_action_girar_izq: '왼쪽으로 회전',
      menu_action_girar_der: '오른쪽으로 회전',
      menu_action_detener: '정지'
    },
    ru: {
      ext_title: '🧠 Автономное обучение (Q-Learning)',
      label_bridge: '🔗 Мост (Bridge)',
      block_seleccionar_objetivo: 'выбрать активную цель: [OBJETIVO]',
      block_objetivo_activo: 'активная цель',
      label_sensores: '📡 Унифицированные датчики',
      block_distancia_cm: 'расстояние (см)',
      block_linea_detectada: 'линия обнаружена',
      label_acciones: '🚗 Унифицированные действия',
      block_ejecutar_accion: 'выполнить действие [ACCION] со скоростью PWM [VELOCIDAD_PWM]',
      block_detener_motores: 'остановить моторы',
      label_estado_accion: '🧩 Состояние и Действие (Q-Learning)',
      block_obtener_estado: 'получить текущее состояние (S)',
      block_elegir_accion: 'выбрать действие в режиме [MODO]',
      block_registrar_recompensa: 'записать вознаграждение (R) = [RECOMPENSA]',
      block_iniciar_episodio: 'начать новый эпизод',
      label_persistencia: '💾 Сохранение Q-таблицы',
      block_exportar_qtable: 'экспортировать Q-таблицу (JSON)',
      block_importar_qtable: 'импортировать Q-таблицу из JSON [JSON_TEXTO]',
      block_reiniciar_qtable: 'сбросить Q-таблицу',
      menu_target_virtual: 'Виртуальный',
      menu_target_fisico: 'Физический',
      menu_mode_entrenamiento: 'Обучение (исследование)',
      menu_mode_autonomo: 'Автономный (эксплуатация)',
      menu_action_avanzar: 'Вперёд',
      menu_action_retroceder: 'Назад',
      menu_action_girar_izq: 'Повернуть налево',
      menu_action_girar_der: 'Повернуть направо',
      menu_action_detener: 'Остановить'
    },
    ar: {
      ext_title: '🧠 التعلم الذاتي (Q-Learning)',
      label_bridge: '🔗 الجسر (Bridge)',
      block_seleccionar_objetivo: 'تحديد الهدف النشط: [OBJETIVO]',
      block_objetivo_activo: 'الهدف النشط',
      label_sensores: '📡 مستشعرات موحدة',
      block_distancia_cm: 'المسافة (سم)',
      block_linea_detectada: 'تم اكتشاف الخط',
      label_acciones: '🚗 إجراءات موحدة',
      block_ejecutar_accion: 'تنفيذ الإجراء [ACCION] بسرعة PWM [VELOCIDAD_PWM]',
      block_detener_motores: 'إيقاف المحركات',
      label_estado_accion: '🧩 الحالة والإجراء (Q-Learning)',
      block_obtener_estado: 'الحصول على الحالة الحالية (S)',
      block_elegir_accion: 'اختيار الإجراء في الوضع [MODO]',
      block_registrar_recompensa: 'تسجيل المكافأة (R) = [RECOMPENSA]',
      block_iniciar_episodio: 'بدء حلقة جديدة',
      label_persistencia: '💾 حفظ جدول Q',
      block_exportar_qtable: 'تصدير جدول Q (JSON)',
      block_importar_qtable: 'استيراد جدول Q من JSON [JSON_TEXTO]',
      block_reiniciar_qtable: 'إعادة ضبط جدول Q',
      menu_target_virtual: 'افتراضي',
      menu_target_fisico: 'فعلي',
      menu_mode_entrenamiento: 'تدريب (استكشاف)',
      menu_mode_autonomo: 'مستقل (استغلال)',
      menu_action_avanzar: 'تقدم',
      menu_action_retroceder: 'تراجع',
      menu_action_girar_izq: 'انعطف يسارًا',
      menu_action_girar_der: 'انعطف يمينًا',
      menu_action_detener: 'توقف'
    },
    hi: {
      ext_title: '🧠 स्वायत्त सीखना (Q-Learning)',
      label_bridge: '🔗 ब्रिज',
      block_seleccionar_objetivo: 'सक्रिय लक्ष्य चुनें: [OBJETIVO]',
      block_objetivo_activo: 'सक्रिय लक्ष्य',
      label_sensores: '📡 एकीकृत सेंसर',
      block_distancia_cm: 'दूरी (सेमी)',
      block_linea_detectada: 'लाइन का पता चला',
      label_acciones: '🚗 एकीकृत क्रियाएं',
      block_ejecutar_accion: 'PWM गति [VELOCIDAD_PWM] पर क्रिया [ACCION] निष्पादित करें',
      block_detener_motores: 'मोटर बंद करें',
      label_estado_accion: '🧩 स्थिति और क्रिया (Q-Learning)',
      block_obtener_estado: 'वर्तमान स्थिति प्राप्त करें (S)',
      block_elegir_accion: 'मोड [MODO] में क्रिया चुनें',
      block_registrar_recompensa: 'पुरस्कार (R) = [RECOMPENSA] दर्ज करें',
      block_iniciar_episodio: 'नया एपिसोड शुरू करें',
      label_persistencia: '💾 Q-टेबल स्थायित्व',
      block_exportar_qtable: 'Q-टेबल निर्यात करें (JSON)',
      block_importar_qtable: 'JSON से Q-टेबल आयात करें [JSON_TEXTO]',
      block_reiniciar_qtable: 'Q-टेबल रीसेट करें',
      menu_target_virtual: 'वर्चुअल',
      menu_target_fisico: 'भौतिक',
      menu_mode_entrenamiento: 'प्रशिक्षण (अन्वेषण)',
      menu_mode_autonomo: 'स्वायत्त (उपयोग)',
      menu_action_avanzar: 'आगे बढ़ें',
      menu_action_retroceder: 'पीछे हटें',
      menu_action_girar_izq: 'बाएं मुड़ें',
      menu_action_girar_der: 'दाएं मुड़ें',
      menu_action_detener: 'रोकें'
    },
    tr: {
      ext_title: '🧠 Otonom Öğrenme (Q-Learning)',
      label_bridge: '🔗 Köprü (Bridge)',
      block_seleccionar_objetivo: 'aktif hedefi seç: [OBJETIVO]',
      block_objetivo_activo: 'aktif hedef',
      label_sensores: '📡 Birleşik Sensörler',
      block_distancia_cm: 'mesafe (cm)',
      block_linea_detectada: 'çizgi algılandı',
      label_acciones: '🚗 Birleşik Eylemler',
      block_ejecutar_accion: 'PWM hızında [VELOCIDAD_PWM] [ACCION] eylemini gerçekleştir',
      block_detener_motores: 'motorları durdur',
      label_estado_accion: '🧩 Durum ve Eylem (Q-Learning)',
      block_obtener_estado: 'mevcut durumu al (S)',
      block_elegir_accion: '[MODO] modunda eylem seç',
      block_registrar_recompensa: 'ödül (R) = [RECOMPENSA] kaydet',
      block_iniciar_episodio: 'yeni bölüm başlat',
      label_persistencia: '💾 Q-Tablosu Kalıcılığı',
      block_exportar_qtable: 'Q-Tablosunu dışa aktar (JSON)',
      block_importar_qtable: 'JSON\'dan Q-Tablosu içe aktar [JSON_TEXTO]',
      block_reiniciar_qtable: 'Q-Tablosunu sıfırla',
      menu_target_virtual: 'Sanal',
      menu_target_fisico: 'Fiziksel',
      menu_mode_entrenamiento: 'Eğitim (keşif)',
      menu_mode_autonomo: 'Otonom (sömürü)',
      menu_action_avanzar: 'İleri',
      menu_action_retroceder: 'Geri',
      menu_action_girar_izq: 'Sola Dön',
      menu_action_girar_der: 'Sağa Dön',
      menu_action_detener: 'Dur'
    },
    pl: {
      ext_title: '🧠 Uczenie Autonomiczne (Q-Learning)',
      label_bridge: '🔗 Most (Bridge)',
      block_seleccionar_objetivo: 'wybierz aktywny cel: [OBJETIVO]',
      block_objetivo_activo: 'aktywny cel',
      label_sensores: '📡 Zunifikowane czujniki',
      block_distancia_cm: 'odległość (cm)',
      block_linea_detectada: 'wykryto linię',
      label_acciones: '🚗 Zunifikowane akcje',
      block_ejecutar_accion: 'wykonaj akcję [ACCION] z prędkością PWM [VELOCIDAD_PWM]',
      block_detener_motores: 'zatrzymaj silniki',
      label_estado_accion: '🧩 Stan i Akcja (Q-Learning)',
      block_obtener_estado: 'pobierz aktualny stan (S)',
      block_elegir_accion: 'wybierz akcję w trybie [MODO]',
      block_registrar_recompensa: 'zarejestruj nagrodę (R) = [RECOMPENSA]',
      block_iniciar_episodio: 'rozpocznij nowy epizod',
      label_persistencia: '💾 Trwałość Q-Table',
      block_exportar_qtable: 'eksportuj Q-Table (JSON)',
      block_importar_qtable: 'importuj Q-Table z JSON [JSON_TEXTO]',
      block_reiniciar_qtable: 'zresetuj Q-Table',
      menu_target_virtual: 'Wirtualny',
      menu_target_fisico: 'Fizyczny',
      menu_mode_entrenamiento: 'Trening (eksploracja)',
      menu_mode_autonomo: 'Autonomiczny (eksploatacja)',
      menu_action_avanzar: 'Do przodu',
      menu_action_retroceder: 'Do tyłu',
      menu_action_girar_izq: 'Skręć w Lewo',
      menu_action_girar_der: 'Skręć w Prawo',
      menu_action_detener: 'Zatrzymaj'
    },
    nl: {
      ext_title: '🧠 Autonoom Leren (Q-Learning)',
      label_bridge: '🔗 Brug (Bridge)',
      block_seleccionar_objetivo: 'actief doel selecteren: [OBJETIVO]',
      block_objetivo_activo: 'actief doel',
      label_sensores: '📡 Uniforme Sensoren',
      block_distancia_cm: 'afstand (cm)',
      block_linea_detectada: 'lijn gedetecteerd',
      label_acciones: '🚗 Uniforme Acties',
      block_ejecutar_accion: 'actie [ACCION] uitvoeren op PWM-snelheid [VELOCIDAD_PWM]',
      block_detener_motores: 'motoren stoppen',
      label_estado_accion: '🧩 Status en Actie (Q-Learning)',
      block_obtener_estado: 'huidige status ophalen (S)',
      block_elegir_accion: 'actie kiezen in modus [MODO]',
      block_registrar_recompensa: 'beloning (R) = [RECOMPENSA] registreren',
      block_iniciar_episodio: 'nieuwe episode starten',
      label_persistencia: '💾 Q-Table Persistentie',
      block_exportar_qtable: 'Q-Table exporteren (JSON)',
      block_importar_qtable: 'Q-Table importeren vanuit JSON [JSON_TEXTO]',
      block_reiniciar_qtable: 'Q-Table resetten',
      menu_target_virtual: 'Virtueel',
      menu_target_fisico: 'Fysiek',
      menu_mode_entrenamiento: 'Training (verkenning)',
      menu_mode_autonomo: 'Autonoom (exploitatie)',
      menu_action_avanzar: 'Vooruit',
      menu_action_retroceder: 'Achteruit',
      menu_action_girar_izq: 'Linksaf',
      menu_action_girar_der: 'Rechtsaf',
      menu_action_detener: 'Stoppen'
    },
    bn: {
      ext_title: '🧠 স্বায়ত্তশাসিত শিক্ষণ (Q-Learning)',
      label_bridge: '🔗 ব্রিজ',
      block_seleccionar_objetivo: 'সক্রিয় লক্ষ্য নির্বাচন করুন: [OBJETIVO]',
      block_objetivo_activo: 'সক্রিয় লক্ষ্য',
      label_sensores: '📡 একীভূত সেন্সর',
      block_distancia_cm: 'দূরত্ব (সেমি)',
      block_linea_detectada: 'লাইন সনাক্ত হয়েছে',
      label_acciones: '🚗 একীভূত ক্রিয়া',
      block_ejecutar_accion: 'PWM গতি [VELOCIDAD_PWM] এ ক্রিয়া [ACCION] সম্পাদন করুন',
      block_detener_motores: 'মোটর বন্ধ করুন',
      label_estado_accion: '🧩 অবস্থা এবং ক্রিয়া (Q-Learning)',
      block_obtener_estado: 'বর্তমান অবস্থা পান (S)',
      block_elegir_accion: 'মোড [MODO] এ ক্রিয়া নির্বাচন করুন',
      block_registrar_recompensa: 'পুরস্কার (R) = [RECOMPENSA] রেকর্ড করুন',
      block_iniciar_episodio: 'নতুন পর্ব শুরু করুন',
      label_persistencia: '💾 Q-টেবিল স্থায়িত্ব',
      block_exportar_qtable: 'Q-টেবিল রপ্তানি করুন (JSON)',
      block_importar_qtable: 'JSON থেকে Q-টেবিল আমদানি করুন [JSON_TEXTO]',
      block_reiniciar_qtable: 'Q-টেবিল রিসেট করুন',
      menu_target_virtual: 'ভার্চুয়াল',
      menu_target_fisico: 'ভৌত',
      menu_mode_entrenamiento: 'প্রশিক্ষণ (অনুসন্ধান)',
      menu_mode_autonomo: 'স্বায়ত্তশাসিত (ব্যবহার)',
      menu_action_avanzar: 'এগিয়ে যান',
      menu_action_retroceder: 'পিছিয়ে যান',
      menu_action_girar_izq: 'বামে ঘুরুন',
      menu_action_girar_der: 'ডানে ঘুরুন',
      menu_action_detener: 'থামুন'
    },
    id: {
      ext_title: '🧠 Pembelajaran Otonom (Q-Learning)',
      label_bridge: '🔗 Jembatan (Bridge)',
      block_seleccionar_objetivo: 'pilih target aktif: [OBJETIVO]',
      block_objetivo_activo: 'target aktif',
      label_sensores: '📡 Sensor Terpadu',
      block_distancia_cm: 'jarak (cm)',
      block_linea_detectada: 'garis terdeteksi',
      label_acciones: '🚗 Aksi Terpadu',
      block_ejecutar_accion: 'jalankan aksi [ACCION] pada kecepatan PWM [VELOCIDAD_PWM]',
      block_detener_motores: 'hentikan motor',
      label_estado_accion: '🧩 Status dan Aksi (Q-Learning)',
      block_obtener_estado: 'dapatkan status saat ini (S)',
      block_elegir_accion: 'pilih aksi dalam mode [MODO]',
      block_registrar_recompensa: 'catat hadiah (R) = [RECOMPENSA]',
      block_iniciar_episodio: 'mulai episode baru',
      label_persistencia: '💾 Persistensi Q-Table',
      block_exportar_qtable: 'ekspor Q-Table (JSON)',
      block_importar_qtable: 'impor Q-Table dari JSON [JSON_TEXTO]',
      block_reiniciar_qtable: 'reset Q-Table',
      menu_target_virtual: 'Virtual',
      menu_target_fisico: 'Fisik',
      menu_mode_entrenamiento: 'Pelatihan (eksplorasi)',
      menu_mode_autonomo: 'Otonom (eksploitasi)',
      menu_action_avanzar: 'Maju',
      menu_action_retroceder: 'Mundur',
      menu_action_girar_izq: 'Belok Kiri',
      menu_action_girar_der: 'Belok Kanan',
      menu_action_detener: 'Berhenti'
    }
  };

  class AprendizajeAutonomoREC {
    constructor(runtime) {
      this.runtime = runtime;
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

    _t(key) {
      const rawLocale = window.currentRecLocale || (this.runtime && this.runtime.currentLocale) || 'es';
      const lang = rawLocale.split(/[-_]/)[0].toLowerCase();
      return (I18N_BLOCKS[lang] && I18N_BLOCKS[lang][key]) || (I18N_BLOCKS['es'] && I18N_BLOCKS['es'][key]) || key;
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
      const t = (key) => this._t(key);
      return {
        id: 'aprendizajeAutonomoREC',
        name: t('ext_title'),
        color1: '#8A2BE2',
        color2: '#6A0DAD',
        color3: '#4B0082',
        blocks: [
          { blockType: Scratch.BlockType.LABEL, text: t('label_bridge') },
          {
            opcode: 'seleccionarObjetivo',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_seleccionar_objetivo'),
            arguments: {
              OBJETIVO: { type: Scratch.ArgumentType.STRING, menu: 'targetMenu', defaultValue: 'VIRTUAL' }
            }
          },
          { opcode: 'objetivoActivo', blockType: Scratch.BlockType.REPORTER, text: t('block_objetivo_activo') },
          '---',

          { blockType: Scratch.BlockType.LABEL, text: t('label_sensores') },
          { opcode: 'obtenerDistanciaCm', blockType: Scratch.BlockType.REPORTER, text: t('block_distancia_cm') },
          { opcode: 'sensorLineaDetectada', blockType: Scratch.BlockType.BOOLEAN, text: t('block_linea_detectada') },
          '---',

          { blockType: Scratch.BlockType.LABEL, text: t('label_acciones') },
          {
            opcode: 'ejecutarAccion',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_ejecutar_accion'),
            arguments: {
              ACCION: { type: Scratch.ArgumentType.STRING, menu: 'actionMenu', defaultValue: 'AVANZAR' },
              VELOCIDAD_PWM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 150 }
            }
          },
          { opcode: 'detenerMotores', blockType: Scratch.BlockType.COMMAND, text: t('block_detener_motores') },
          '---',

          { blockType: Scratch.BlockType.LABEL, text: t('label_estado_accion') },
          { opcode: 'obtenerEstado', blockType: Scratch.BlockType.REPORTER, text: t('block_obtener_estado') },
          {
            opcode: 'elegirAccion',
            blockType: Scratch.BlockType.REPORTER,
            text: t('block_elegir_accion'),
            arguments: {
              MODO: { type: Scratch.ArgumentType.STRING, menu: 'modeMenu', defaultValue: 'ENTRENAMIENTO' }
            }
          },
          {
            opcode: 'registrarRecompensa',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_registrar_recompensa'),
            arguments: { RECOMPENSA: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 } }
          },
          { opcode: 'iniciarEpisodio', blockType: Scratch.BlockType.COMMAND, text: t('block_iniciar_episodio') },
          '---',

          { blockType: Scratch.BlockType.LABEL, text: t('label_persistencia') },
          { opcode: 'exportarQTable', blockType: Scratch.BlockType.REPORTER, text: t('block_exportar_qtable') },
          {
            opcode: 'importarQTable',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_importar_qtable'),
            arguments: { JSON_TEXTO: { type: Scratch.ArgumentType.STRING, defaultValue: '{}' } }
          },
          { opcode: 'reiniciarQTable', blockType: Scratch.BlockType.COMMAND, text: t('block_reiniciar_qtable') }
        ],
        menus: {
          targetMenu: {
            acceptReporters: false,
            items: [
              { text: t('menu_target_virtual'), value: 'VIRTUAL' },
              { text: t('menu_target_fisico'),  value: 'FISICO' }
            ]
          },
          modeMenu: {
            acceptReporters: false,
            items: [
              { text: t('menu_mode_entrenamiento'), value: 'ENTRENAMIENTO' },
              { text: t('menu_mode_autonomo'),       value: 'AUTONOMO' }
            ]
          },
          actionMenu: {
            acceptReporters: true,
            items: [
              { text: t('menu_action_avanzar'),    value: 'AVANZAR' },
              { text: t('menu_action_retroceder'), value: 'RETROCEDER' },
              { text: t('menu_action_girar_izq'),  value: 'GIRAR_IZQUIERDA' },
              { text: t('menu_action_girar_der'),  value: 'GIRAR_DERECHA' },
              { text: t('menu_action_detener'),    value: 'DETENER' }
            ]
          }
        }
      };
    }
  }

  Scratch.extensions.register(new AprendizajeAutonomoREC());
})(Scratch);
