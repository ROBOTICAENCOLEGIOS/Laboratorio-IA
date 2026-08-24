/**
 * TurboWarp Custom Extension - ROBOT TACHO INTELIGENTE v4.1
 * Incluye control explícito para Motor 3 (TB6612FNG en pines A0, A1 y 4)
 */
(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Esta extensión debe ejecutarse sin sandbox para acceder al puerto serial.');
  }

  if (window.robotTachinLoaded) {
    const msg = (window.I18N_BLOCKS && window.I18N_BLOCKS[window.currentRecLocale || 'es'] && window.I18N_BLOCKS[window.currentRecLocale || 'es'].already_loaded) || 'Robot Tachín ya está cargado';
    if (window.Swal) { Swal.fire({ icon: 'warning', title: msg, timer: 2000, showConfirmButton: false }); } else { alert(msg); }
  } else {
    window.robotTachinLoaded = true;
    showTachinLoadedToast();
  }

  function showTachinLoadedToast() {
    const rawLocale = window.currentRecLocale || 'es';
    const lang = rawLocale.split(/[-_]/)[0].toLowerCase();
    const msg = (window.I18N_BLOCKS && window.I18N_BLOCKS[lang] && window.I18N_BLOCKS[lang].toast_loaded) || 'Bloques de Robot Tachín cargados correctamente';
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#9E2A4B;color:#fff;padding:10px 20px;border-radius:8px;box-shadow:0 4px 10px rgba(0,0,0,0.3);z-index:99999;font-family:sans-serif;font-weight:bold;transition:opacity 0.5s;';
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 2500);
  }

  const I18N_BLOCKS = {
    es: {
      ext_title: 'Robot Tacho Inteligente',
      btn_connect: '🔌 Conectar Robot Tacho',
      btn_reset_port: '🔄 Reiniciar Puerto',
      check_connection: 'Estado Conexión',
      block_motor3: 'Mover Motor 3 (Tapa) [ACCION]',
      block_stop_motor3: 'Detener Motor 3 (Tapa)',
      block_move_motor: 'Mover motor [SIDE] hacia [DIR] al [PCT]%',
      block_stop_motor: 'Detener motores tracción (A y B)',
      block_mostrar_matriz: 'Mostrar en Matriz [ICONO]',
      block_light_on: 'Encender Luz LED en color [COLOR]',
      block_light_off: 'Apagar Luz LED',
      block_play_note: 'Tocar nota [NOTE] por [MS] ms',
      motor3_up: 'Subir / Abrir (Adelante)',
      motor3_down: 'Bajar / Cerrar (Atrás)',
      motor3_stop: 'Detener',
      motor_izq: 'Motor B (Izquierdo)',
      motor_der: 'Motor A (Derecho)',
      motor_ambos: 'Ambos (A y B)',
      motor_m3: 'Motor 3 (Tapa)',
      motor_dir_fwd: 'Adelante',
      motor_dir_bwd: 'Atrás',
      matriz_feliz: 'FELIZ',
      matriz_triste: 'TRISTE',
      matriz_abierto: 'ABIERTO',
      matriz_corazon: 'CORAZÓN',
      matriz_vacio: 'VACÍO',
      note_do: 'DO (C4)',
      note_re: 'RE (D4)',
      note_mi: 'MI (E4)',
      note_fa: 'FA (F4)',
      note_sol: 'SOL (G4)',
      note_la: 'LA (A4)',
      note_si: 'SI (B4)',
      note_do5: 'DO (C5)',
      status_connected: 'Conectado',
      status_disconnected: 'Desconectado',
      msg_reset_success: 'Puerto reseteado correctamente.'
    },
    en: {
      ext_title: 'Smart Trash Robot',
      btn_connect: '🔌 Connect Trash Robot',
      btn_reset_port: '🔄 Reset Port',
      check_connection: 'Connection Status',
      block_motor3: 'Move Motor 3 (Lid) [ACCION]',
      block_stop_motor3: 'Stop Motor 3 (Lid)',
      block_move_motor: 'Move [SIDE] motor [DIR] at [PCT]%',
      block_stop_motor: 'Stop traction motors (A and B)',
      block_mostrar_matriz: 'Show on Matrix [ICONO]',
      block_light_on: 'Turn on LED light in color [COLOR]',
      block_light_off: 'Turn off LED light',
      block_play_note: 'Play note [NOTE] for [MS] ms',
      motor3_up: 'Raise / Open (Forward)',
      motor3_down: 'Lower / Close (Backward)',
      motor3_stop: 'Stop',
      motor_izq: 'Motor B (Left)',
      motor_der: 'Motor A (Right)',
      motor_ambos: 'Both (A and B)',
      motor_m3: 'Motor 3 (Lid)',
      motor_dir_fwd: 'Forward',
      motor_dir_bwd: 'Backward',
      matriz_feliz: 'HAPPY',
      matriz_triste: 'SAD',
      matriz_abierto: 'OPEN',
      matriz_corazon: 'HEART',
      matriz_vacio: 'EMPTY',
      note_do: 'C (C4)',
      note_re: 'D (D4)',
      note_mi: 'E (E4)',
      note_fa: 'F (F4)',
      note_sol: 'G (G4)',
      note_la: 'A (A4)',
      note_si: 'B (B4)',
      note_do5: 'C (C5)',
      status_connected: 'Connected',
      status_disconnected: 'Disconnected',
      msg_reset_success: 'Port successfully reset.'
    },
    pt: {
      ext_title: 'Robô Lixeira Inteligente',
      btn_connect: '🔌 Conectar Robô Lixeira',
      btn_reset_port: '🔄 Reiniciar Porta',
      check_connection: 'Status da Conexão',
      block_motor3: 'Mover Motor 3 (Tampa) [ACCION]',
      block_stop_motor3: 'Parar Motor 3 (Tampa)',
      block_move_motor: 'Mover motor [SIDE] para [DIR] a [PCT]%',
      block_stop_motor: 'Parar motores de tração (A e B)',
      block_mostrar_matriz: 'Mostrar na Matriz [ICONO]',
      block_light_on: 'Ligar Luz LED na cor [COLOR]',
      block_light_off: 'Desligar Luz LED',
      block_play_note: 'Tocar nota [NOTE] por [MS] ms',
      motor3_up: 'Subir / Abrir (Frente)',
      motor3_down: 'Descer / Fechar (Trás)',
      motor3_stop: 'Parar',
      motor_izq: 'Motor B (Esquerdo)',
      motor_der: 'Motor A (Direito)',
      motor_ambos: 'Ambos (A e B)',
      motor_m3: 'Motor 3 (Tampa)',
      motor_dir_fwd: 'Frente',
      motor_dir_bwd: 'Trás',
      matriz_feliz: 'FELIZ',
      matriz_triste: 'TRISTE',
      matriz_abierto: 'ABERTO',
      matriz_corazon: 'CORAÇÃO',
      matriz_vacio: 'VAZIO',
      note_do: 'DÓ (C4)',
      note_re: 'RÉ (D4)',
      note_mi: 'MI (E4)',
      note_fa: 'FÁ (F4)',
      note_sol: 'SOL (G4)',
      note_la: 'LÁ (A4)',
      note_si: 'SI (B4)',
      note_do5: 'DÓ (C5)',
      status_connected: 'Conectado',
      status_disconnected: 'Desconectado',
      msg_reset_success: 'Porta reiniciada com sucesso.'
    },
    fr: {
      ext_title: 'Robot Poubelle Intelligent',
      btn_connect: '🔌 Connecter le Robot Poubelle',
      btn_reset_port: '🔄 Réinitialiser le Port',
      check_connection: 'État de la Connexion',
      block_motor3: 'Déplacer le Moteur 3 (Couvercle) [ACCION]',
      block_stop_motor3: 'Arrêter le Moteur 3 (Couvercle)',
      block_move_motor: 'Déplacer le moteur [SIDE] vers [DIR] à [PCT]%',
      block_stop_motor: 'Arrêter les moteurs de traction (A et B)',
      block_mostrar_matriz: 'Afficher sur la Matrice [ICONO]',
      block_light_on: 'Allumer la LED en couleur [COLOR]',
      block_light_off: 'Éteindre la LED',
      block_play_note: 'Jouer la note [NOTE] pendant [MS] ms',
      motor3_up: 'Monter / Ouvrir (Avant)',
      motor3_down: 'Descendre / Fermer (Arrière)',
      motor3_stop: 'Arrêter',
      motor_izq: 'Moteur B (Gauche)',
      motor_der: 'Moteur A (Droit)',
      motor_ambos: 'Les deux (A et B)',
      motor_m3: 'Moteur 3 (Couvercle)',
      motor_dir_fwd: 'Avant',
      motor_dir_bwd: 'Arrière',
      matriz_feliz: 'JOYEUX',
      matriz_triste: 'TRISTE',
      matriz_abierto: 'OUVERT',
      matriz_corazon: 'CŒUR',
      matriz_vacio: 'VIDE',
      note_do: 'DO (C4)',
      note_re: 'RÉ (D4)',
      note_mi: 'MI (E4)',
      note_fa: 'FA (F4)',
      note_sol: 'SOL (G4)',
      note_la: 'LA (A4)',
      note_si: 'SI (B4)',
      note_do5: 'DO (C5)',
      status_connected: 'Connecté',
      status_disconnected: 'Déconnecté',
      msg_reset_success: 'Port réinitialisé avec succès.'
    },
    de: {
      ext_title: 'Intelligenter Mülleimer-Roboter',
      btn_connect: '🔌 Mülleimer-Roboter Verbinden',
      btn_reset_port: '🔄 Port Zurücksetzen',
      check_connection: 'Verbindungsstatus',
      block_motor3: 'Motor 3 (Deckel) bewegen [ACCION]',
      block_stop_motor3: 'Motor 3 (Deckel) stoppen',
      block_move_motor: 'Motor [SIDE] [DIR] mit [PCT]% bewegen',
      block_stop_motor: 'Antriebsmotoren stoppen (A und B)',
      block_mostrar_matriz: 'Auf Matrix anzeigen [ICONO]',
      block_light_on: 'LED-Licht in Farbe [COLOR] einschalten',
      block_light_off: 'LED-Licht ausschalten',
      block_play_note: 'Note [NOTE] für [MS] ms spielen',
      motor3_up: 'Heben / Öffnen (Vorwärts)',
      motor3_down: 'Senken / Schließen (Rückwärts)',
      motor3_stop: 'Stoppen',
      motor_izq: 'Motor B (Links)',
      motor_der: 'Motor A (Rechts)',
      motor_ambos: 'Beide (A und B)',
      motor_m3: 'Motor 3 (Deckel)',
      motor_dir_fwd: 'Vorwärts',
      motor_dir_bwd: 'Rückwärts',
      matriz_feliz: 'FRÖHLICH',
      matriz_triste: 'TRAURIG',
      matriz_abierto: 'OFFEN',
      matriz_corazon: 'HERZ',
      matriz_vacio: 'LEER',
      note_do: 'C (C4)',
      note_re: 'D (D4)',
      note_mi: 'E (E4)',
      note_fa: 'F (F4)',
      note_sol: 'G (G4)',
      note_la: 'A (A4)',
      note_si: 'H (B4)',
      note_do5: 'C (C5)',
      status_connected: 'Verbunden',
      status_disconnected: 'Getrennt',
      msg_reset_success: 'Port erfolgreich zurückgesetzt.'
    },
    it: {
      ext_title: 'Robot Cestino Intelligente',
      btn_connect: '🔌 Connetti Robot Cestino',
      btn_reset_port: '🔄 Reimposta Porta',
      check_connection: 'Stato Connessione',
      block_motor3: 'Muovi Motore 3 (Coperchio) [ACCION]',
      block_stop_motor3: 'Ferma Motore 3 (Coperchio)',
      block_move_motor: 'Muovi motore [SIDE] verso [DIR] al [PCT]%',
      block_stop_motor: 'Ferma motori di trazione (A e B)',
      block_mostrar_matriz: 'Mostra su Matrice [ICONO]',
      block_light_on: 'Accendi luce LED colore [COLOR]',
      block_light_off: 'Spegni luce LED',
      block_play_note: 'Suona nota [NOTE] per [MS] ms',
      motor3_up: 'Alzare / Aprire (Avanti)',
      motor3_down: 'Abbassare / Chiudere (Indietro)',
      motor3_stop: 'Fermare',
      motor_izq: 'Motore B (Sinistro)',
      motor_der: 'Motore A (Destro)',
      motor_ambos: 'Entrambi (A e B)',
      motor_m3: 'Motore 3 (Coperchio)',
      motor_dir_fwd: 'Avanti',
      motor_dir_bwd: 'Indietro',
      matriz_feliz: 'FELICE',
      matriz_triste: 'TRISTE',
      matriz_abierto: 'APERTO',
      matriz_corazon: 'CUORE',
      matriz_vacio: 'VUOTO',
      note_do: 'DO (C4)',
      note_re: 'RE (D4)',
      note_mi: 'MI (E4)',
      note_fa: 'FA (F4)',
      note_sol: 'SOL (G4)',
      note_la: 'LA (A4)',
      note_si: 'SI (B4)',
      note_do5: 'DO (C5)',
      status_connected: 'Connesso',
      status_disconnected: 'Disconnesso',
      msg_reset_success: 'Porta reimpostata con successo.'
    },
    zh: {
      ext_title: '智能垃圾桶机器人',
      btn_connect: '🔌 连接垃圾桶机器人',
      btn_reset_port: '🔄 重置端口',
      check_connection: '连接状态',
      block_motor3: '移动电机3（盖子）[ACCION]',
      block_stop_motor3: '停止电机3（盖子）',
      block_move_motor: '以 [PCT]% 将 [SIDE] 电机向 [DIR] 移动',
      block_stop_motor: '停止牵引电机（A和B）',
      block_mostrar_matriz: '在矩阵上显示 [ICONO]',
      block_light_on: '打开LED灯，颜色为 [COLOR]',
      block_light_off: '关闭LED灯',
      block_play_note: '以 [NOTE] 音符播放 [MS] 毫秒',
      motor3_up: '升起 / 打开（前进）',
      motor3_down: '降下 / 关闭（后退）',
      motor3_stop: '停止',
      motor_izq: '电机B（左）',
      motor_der: '电机A（右）',
      motor_ambos: '两者（A和B）',
      motor_m3: '电机3（盖子）',
      motor_dir_fwd: '前进',
      motor_dir_bwd: '后退',
      matriz_feliz: '开心',
      matriz_triste: '伤心',
      matriz_abierto: '打开',
      matriz_corazon: '爱心',
      matriz_vacio: '空',
      note_do: 'C (C4)',
      note_re: 'D (D4)',
      note_mi: 'E (E4)',
      note_fa: 'F (F4)',
      note_sol: 'G (G4)',
      note_la: 'A (A4)',
      note_si: 'B (B4)',
      note_do5: 'C (C5)',
      status_connected: '已连接',
      status_disconnected: '已断开',
      msg_reset_success: '端口已成功重置。'
    },
    ja: {
      ext_title: 'スマートゴミ箱ロボット',
      btn_connect: '🔌 ゴミ箱ロボットを接続',
      btn_reset_port: '🔄 ポートをリセット',
      check_connection: '接続状態',
      block_motor3: 'モーター3（蓋）を動かす [ACCION]',
      block_stop_motor3: 'モーター3（蓋）を停止する',
      block_move_motor: '[SIDE] モーターを [PCT]% で [DIR]',
      block_stop_motor: '駆動モーターを停止する（AとB）',
      block_mostrar_matriz: 'マトリックスに表示 [ICONO]',
      block_light_on: '色 [COLOR] のLEDライトをつける',
      block_light_off: 'LEDライトを消す',
      block_play_note: '音符 [NOTE] を [MS] ミリ秒鳴らす',
      motor3_up: '上げる / 開く（前進）',
      motor3_down: '下げる / 閉じる（後退）',
      motor3_stop: '停止',
      motor_izq: 'モーターB（左）',
      motor_der: 'モーターA（右）',
      motor_ambos: '両方（AとB）',
      motor_m3: 'モーター3（蓋）',
      motor_dir_fwd: '前進',
      motor_dir_bwd: '後退',
      matriz_feliz: 'うれしい',
      matriz_triste: 'かなしい',
      matriz_abierto: 'オープン',
      matriz_corazon: 'ハート',
      matriz_vacio: '空',
      note_do: 'ド (C4)',
      note_re: 'レ (D4)',
      note_mi: 'ミ (E4)',
      note_fa: 'ファ (F4)',
      note_sol: 'ソ (G4)',
      note_la: 'ラ (A4)',
      note_si: 'シ (B4)',
      note_do5: 'ド (C5)',
      status_connected: '接続済み',
      status_disconnected: '切断済み',
      msg_reset_success: 'ポートが正常にリセットされました。'
    },
    ko: {
      ext_title: '스마트 쓰레기통 로봇',
      btn_connect: '🔌 쓰레기통 로봇 연결',
      btn_reset_port: '🔄 포트 재설정',
      check_connection: '연결 상태',
      block_motor3: '모터 3(뚜껑) 이동 [ACCION]',
      block_stop_motor3: '모터 3(뚜껑) 정지',
      block_move_motor: '[SIDE] 모터를 [PCT]%로 [DIR]',
      block_stop_motor: '구동 모터 정지 (A와 B)',
      block_mostrar_matriz: '매트릭스에 표시 [ICONO]',
      block_light_on: '[COLOR] 색상으로 LED 조명 켜기',
      block_light_off: 'LED 조명 끄기',
      block_play_note: '음 [NOTE] 를 [MS] ms 동안 연주',
      motor3_up: '올리기 / 열기 (전진)',
      motor3_down: '내리기 / 닫기 (후진)',
      motor3_stop: '정지',
      motor_izq: '모터 B (왼쪽)',
      motor_der: '모터 A (오른쪽)',
      motor_ambos: '둘 다 (A와 B)',
      motor_m3: '모터 3 (뚜껑)',
      motor_dir_fwd: '전진',
      motor_dir_bwd: '후진',
      matriz_feliz: '행복',
      matriz_triste: '슬픔',
      matriz_abierto: '열림',
      matriz_corazon: '하트',
      matriz_vacio: '비어있음',
      note_do: '도 (C4)',
      note_re: '레 (D4)',
      note_mi: '미 (E4)',
      note_fa: '파 (F4)',
      note_sol: '솔 (G4)',
      note_la: '라 (A4)',
      note_si: '시 (B4)',
      note_do5: '도 (C5)',
      status_connected: '연결됨',
      status_disconnected: '연결 끊김',
      msg_reset_success: '포트가 성공적으로 재설정되었습니다.'
    },
    ru: {
      ext_title: 'Умный робот-мусорка',
      btn_connect: '🔌 Подключить робота-мусорку',
      btn_reset_port: '🔄 Сбросить порт',
      check_connection: 'Статус подключения',
      block_motor3: 'Двигать мотор 3 (крышка) [ACCION]',
      block_stop_motor3: 'Остановить мотор 3 (крышка)',
      block_move_motor: 'Двигать мотор [SIDE] [DIR] на [PCT]%',
      block_stop_motor: 'Остановить тяговые моторы (A и B)',
      block_mostrar_matriz: 'Показать на матрице [ICONO]',
      block_light_on: 'Включить свет LED цвета [COLOR]',
      block_light_off: 'Выключить свет LED',
      block_play_note: 'играть ноту [NOTE] [MS] мс',
      motor3_up: 'Поднять / Открыть (Вперёд)',
      motor3_down: 'Опустить / Закрыть (Назад)',
      motor3_stop: 'Остановить',
      motor_izq: 'Мотор B (Левый)',
      motor_der: 'Мотор A (Правый)',
      motor_ambos: 'Оба (A и B)',
      motor_m3: 'Мотор 3 (Крышка)',
      motor_dir_fwd: 'Вперёд',
      motor_dir_bwd: 'Назад',
      matriz_feliz: 'СЧАСТЛИВЫЙ',
      matriz_triste: 'ГРУСТНЫЙ',
      matriz_abierto: 'ОТКРЫТО',
      matriz_corazon: 'СЕРДЦЕ',
      matriz_vacio: 'ПУСТО',
      note_do: 'ДО (C4)',
      note_re: 'РЕ (D4)',
      note_mi: 'МИ (E4)',
      note_fa: 'ФА (F4)',
      note_sol: 'СОЛЬ (G4)',
      note_la: 'ЛЯ (A4)',
      note_si: 'СИ (B4)',
      note_do5: 'ДО (C5)',
      status_connected: 'Подключено',
      status_disconnected: 'Отключено',
      msg_reset_success: 'Порт успешно сброшен.'
    },
    ar: {
      ext_title: 'روبوت سلة المهملات الذكي',
      btn_connect: '🔌 توصيل روبوت سلة المهملات',
      btn_reset_port: '🔄 إعادة ضبط المنفذ',
      check_connection: 'حالة الاتصال',
      block_motor3: 'تحريك المحرك 3 (الغطاء) [ACCION]',
      block_stop_motor3: 'إيقاف المحرك 3 (الغطاء)',
      block_move_motor: 'تحريك المحرك [SIDE] نحو [DIR] بنسبة [PCT]%',
      block_stop_motor: 'إيقاف محركات الجر (A و B)',
      block_mostrar_matriz: 'عرض على المصفوفة [ICONO]',
      block_light_on: 'تشغيل ضوء LED باللون [COLOR]',
      block_light_off: 'إطفاء ضوء LED',
      block_play_note: 'عزف نوتة [NOTE] لمدة [MS] مللي ثانية',
      motor3_up: 'رفع / فتح (للأمام)',
      motor3_down: 'خفض / إغلاق (للخلف)',
      motor3_stop: 'إيقاف',
      motor_izq: 'المحرك B (يسار)',
      motor_der: 'المحرك A (يمين)',
      motor_ambos: 'كلاهما (A و B)',
      motor_m3: 'المحرك 3 (الغطاء)',
      motor_dir_fwd: 'للأمام',
      motor_dir_bwd: 'للخلف',
      matriz_feliz: 'سعيد',
      matriz_triste: 'حزين',
      matriz_abierto: 'مفتوح',
      matriz_corazon: 'قلب',
      matriz_vacio: 'فارغ',
      note_do: 'دو (C4)',
      note_re: 'ري (D4)',
      note_mi: 'مي (E4)',
      note_fa: 'فا (F4)',
      note_sol: 'صول (G4)',
      note_la: 'لا (A4)',
      note_si: 'سي (B4)',
      note_do5: 'دو (C5)',
      status_connected: 'متصل',
      status_disconnected: 'غير متصل',
      msg_reset_success: 'تمت إعادة ضبط المنفذ بنجاح.'
    },
    hi: {
      ext_title: 'स्मार्ट कचरा रोबोट',
      btn_connect: '🔌 कचरा रोबोट कनेक्ट करें',
      btn_reset_port: '🔄 पोर्ट रीसेट करें',
      check_connection: 'कनेक्शन स्थिति',
      block_motor3: 'मोटर 3 (ढक्कन) को हिलाएं [ACCION]',
      block_stop_motor3: 'मोटर 3 (ढक्कन) रोकें',
      block_move_motor: '[SIDE] मोटर को [PCT]% पर [DIR]',
      block_stop_motor: 'ट्रैक्शन मोटर्स रोकें (A और B)',
      block_mostrar_matriz: 'मैट्रिक्स पर दिखाएं [ICONO]',
      block_light_on: '[COLOR] रंग में LED लाइट चालू करें',
      block_light_off: 'LED लाइट बंद करें',
      block_play_note: '[NOTE] नोट को [MS] मिलीसेकंड तक बजाएं',
      motor3_up: 'उठाएं / खोलें (आगे)',
      motor3_down: 'नीचे करें / बंद करें (पीछे)',
      motor3_stop: 'रोकें',
      motor_izq: 'मोटर B (बायां)',
      motor_der: 'मोटर A (दायां)',
      motor_ambos: 'दोनों (A और B)',
      motor_m3: 'मोटर 3 (ढक्कन)',
      motor_dir_fwd: 'आगे',
      motor_dir_bwd: 'पीछे',
      matriz_feliz: 'खुश',
      matriz_triste: 'दुखी',
      matriz_abierto: 'खुला',
      matriz_corazon: 'दिल',
      matriz_vacio: 'खाली',
      note_do: 'डो (C4)',
      note_re: 'रे (D4)',
      note_mi: 'मी (E4)',
      note_fa: 'फा (F4)',
      note_sol: 'सोल (G4)',
      note_la: 'ला (A4)',
      note_si: 'सी (B4)',
      note_do5: 'डो (C5)',
      status_connected: 'जुड़़ा हुआ',
      status_disconnected: 'डिस्कनेक्ट किया गया',
      msg_reset_success: 'पोर्ट सफलतापूर्वक रीसेट किया गया।'
    },
    tr: {
      ext_title: 'Akıllı Çöp Kutusu Robotu',
      btn_connect: '🔌 Çöp Kutusu Robotunu Bağla',
      btn_reset_port: '🔄 Portu Sıfırla',
      check_connection: 'Bağlantı Durumu',
      block_motor3: 'Motor 3\'ü (Kapak) Hareket Ettir [ACCION]',
      block_stop_motor3: 'Motor 3\'ü (Kapak) Durdur',
      block_move_motor: '[SIDE] motorunu [PCT]% ile [DIR] hareket ettir',
      block_stop_motor: 'Çekiş motorlarını durdur (A ve B)',
      block_mostrar_matriz: 'Matriste Göster [ICONO]',
      block_light_on: '[COLOR] renginde LED ışığını aç',
      block_light_off: 'LED ışığını kapat',
      block_play_note: '[NOTE] notasını [MS] ms çal',
      motor3_up: 'Kaldır / Aç (İleri)',
      motor3_down: 'İndir / Kapat (Geri)',
      motor3_stop: 'Durdur',
      motor_izq: 'Motor B (Sol)',
      motor_der: 'Motor A (Sağ)',
      motor_ambos: 'İkisi de (A ve B)',
      motor_m3: 'Motor 3 (Kapak)',
      motor_dir_fwd: 'İleri',
      motor_dir_bwd: 'Geri',
      matriz_feliz: 'MUTLU',
      matriz_triste: 'ÜZGÜN',
      matriz_abierto: 'AÇIK',
      matriz_corazon: 'KALP',
      matriz_vacio: 'BOŞ',
      note_do: 'DO (C4)',
      note_re: 'RE (D4)',
      note_mi: 'Mİ (E4)',
      note_fa: 'FA (F4)',
      note_sol: 'SOL (G4)',
      note_la: 'LA (A4)',
      note_si: 'Sİ (B4)',
      note_do5: 'DO (C5)',
      status_connected: 'Bağlı',
      status_disconnected: 'Bağlantı Kesildi',
      msg_reset_success: 'Port başarıyla sıfırlandı.'
    },
    pl: {
      ext_title: 'Inteligentny Robot Kosz na Śmieci',
      btn_connect: '🔌 Połącz Robota Kosz',
      btn_reset_port: '🔄 Zresetuj Port',
      check_connection: 'Status Połączenia',
      block_motor3: 'Poruszaj Silnikiem 3 (Pokrywa) [ACCION]',
      block_stop_motor3: 'Zatrzymaj Silnik 3 (Pokrywa)',
      block_move_motor: 'Poruszaj silnikiem [SIDE] w kierunku [DIR] przy [PCT]%',
      block_stop_motor: 'Zatrzymaj silniki napędowe (A i B)',
      block_mostrar_matriz: 'Pokaż na Matrycy [ICONO]',
      block_light_on: 'Włącz światło LED w kolorze [COLOR]',
      block_light_off: 'Wyłącz światło LED',
      block_play_note: 'Zagraj nutę [NOTE] przez [MS] ms',
      motor3_up: 'Podnieś / Otwórz (Do przodu)',
      motor3_down: 'Opuść / Zamknij (Do tyłu)',
      motor3_stop: 'Zatrzymaj',
      motor_izq: 'Silnik B (Lewy)',
      motor_der: 'Silnik A (Prawy)',
      motor_ambos: 'Oba (A i B)',
      motor_m3: 'Silnik 3 (Pokrywa)',
      motor_dir_fwd: 'Do przodu',
      motor_dir_bwd: 'Do tyłu',
      matriz_feliz: 'SZCZĘŚLIWY',
      matriz_triste: 'SMUTNY',
      matriz_abierto: 'OTWARTY',
      matriz_corazon: 'SERCE',
      matriz_vacio: 'PUSTY',
      note_do: 'DO (C4)',
      note_re: 'RE (D4)',
      note_mi: 'MI (E4)',
      note_fa: 'FA (F4)',
      note_sol: 'SOL (G4)',
      note_la: 'LA (A4)',
      note_si: 'SI (B4)',
      note_do5: 'DO (C5)',
      status_connected: 'Połączono',
      status_disconnected: 'Rozłączono',
      msg_reset_success: 'Port pomyślnie zresetowany.'
    },
    nl: {
      ext_title: 'Slimme Prullenbak Robot',
      btn_connect: '🔌 Prullenbak Robot Verbinden',
      btn_reset_port: '🔄 Poort Resetten',
      check_connection: 'Verbindingsstatus',
      block_motor3: 'Motor 3 (Deksel) Bewegen [ACCION]',
      block_stop_motor3: 'Motor 3 (Deksel) Stoppen',
      block_move_motor: 'Motor [SIDE] [DIR] bewegen met [PCT]%',
      block_stop_motor: 'Aandrijfmotoren stoppen (A en B)',
      block_mostrar_matriz: 'Weergeven op Matrix [ICONO]',
      block_light_on: 'LED-licht inschakelen in kleur [COLOR]',
      block_light_off: 'LED-licht uitschakelen',
      block_play_note: 'Noot [NOTE] spelen voor [MS] ms',
      motor3_up: 'Optillen / Openen (Vooruit)',
      motor3_down: 'Neerlaten / Sluiten (Achteruit)',
      motor3_stop: 'Stoppen',
      motor_izq: 'Motor B (Links)',
      motor_der: 'Motor A (Rechts)',
      motor_ambos: 'Beide (A en B)',
      motor_m3: 'Motor 3 (Deksel)',
      motor_dir_fwd: 'Vooruit',
      motor_dir_bwd: 'Achteruit',
      matriz_feliz: 'BLIJ',
      matriz_triste: 'VERDRIETIG',
      matriz_abierto: 'OPEN',
      matriz_corazon: 'HART',
      matriz_vacio: 'LEEG',
      note_do: 'C (C4)',
      note_re: 'D (D4)',
      note_mi: 'E (E4)',
      note_fa: 'F (F4)',
      note_sol: 'G (G4)',
      note_la: 'A (A4)',
      note_si: 'B (B4)',
      note_do5: 'DO (C5)',
      status_connected: 'Verbonden',
      status_disconnected: 'Niet Verbonden',
      msg_reset_success: 'Poort succesvol gereset.'
    },
    bn: {
      ext_title: 'স্মার্ট আবর্জনা রোবট',
      btn_connect: '🔌 আবর্জনা রোবট সংযুক্ত করুন',
      btn_reset_port: '🔄 পোর্ট রিসেট করুন',
      check_connection: 'সংযোগ অবস্থা',
      block_motor3: 'মোটর ৩ (ঢাকনা) সরান [ACCION]',
      block_stop_motor3: 'মোটর ৩ (ঢাকনা) থামান',
      block_move_motor: '[SIDE] মোটরকে [PCT]% এ [DIR] সরান',
      block_stop_motor: 'ট্র্যাকশন মোটর থামান (A এবং B)',
      block_mostrar_matriz: 'ম্যাট্রিক্সে দেখান [ICONO]',
      block_light_on: '[COLOR] রঙে LED লাইট চালু করুন',
      block_light_off: 'LED লাইট বন্ধ করুন',
      block_play_note: '[NOTE] নোট [MS] মিলিসেকেন্ড বাজান',
      motor3_up: 'তুলুন / খুলুন (সামনে)',
      motor3_down: 'নামান / বন্ধ করুন (পিছনে)',
      motor3_stop: 'থামান',
      motor_izq: 'মোটর B (বাম)',
      motor_der: 'মোটর A (ডান)',
      motor_ambos: 'উভয়ই (A এবং B)',
      motor_m3: 'মোটর ৩ (ঢাকনা)',
      motor_dir_fwd: 'সামনে',
      motor_dir_bwd: 'পিছনে',
      matriz_feliz: 'খুশি',
      matriz_triste: 'দুঃখী',
      matriz_abierto: 'খোলা',
      matriz_corazon: 'হৃদয়',
      matriz_vacio: 'খালি',
      note_do: 'ডো (C4)',
      note_re: 'রে (D4)',
      note_mi: 'মি (E4)',
      note_fa: 'ফা (F4)',
      note_sol: 'সল (G4)',
      note_la: 'লা (A4)',
      note_si: 'সি (B4)',
      note_do5: 'ডো (C5)',
      status_connected: 'সংযুক্ত',
      status_disconnected: 'সংযোগ বিচ্ছিন্ন',
      msg_reset_success: 'পোর্ট সফলভাবে রিসেট করা হয়েছে।'
    },
    id: {
      ext_title: 'Robot Tempat Sampah Pintar',
      btn_connect: '🔌 Hubungkan Robot Tempat Sampah',
      btn_reset_port: '🔄 Reset Port',
      check_connection: 'Status Koneksi',
      block_motor3: 'Gerakkan Motor 3 (Tutup) [ACCION]',
      block_stop_motor3: 'Hentikan Motor 3 (Tutup)',
      block_move_motor: 'Gerakkan motor [SIDE] ke [DIR] pada [PCT]%',
      block_stop_motor: 'Hentikan motor penggerak (A dan B)',
      block_mostrar_matriz: 'Tampilkan di Matriks [ICONO]',
      block_light_on: 'Nyalakan Lampu LED warna [COLOR]',
      block_light_off: 'Matikan Lampu LED',
      block_play_note: 'Mainkan nada [NOTE] selama [MS] ms',
      motor3_up: 'Naikkan / Buka (Maju)',
      motor3_down: 'Turunkan / Tutup (Mundur)',
      motor3_stop: 'Berhenti',
      motor_izq: 'Motor B (Kiri)',
      motor_der: 'Motor A (Kanan)',
      motor_ambos: 'Keduanya (A dan B)',
      motor_m3: 'Motor 3 (Tutup)',
      motor_dir_fwd: 'Maju',
      motor_dir_bwd: 'Mundur',
      matriz_feliz: 'BAHAGIA',
      matriz_triste: 'SEDIH',
      matriz_abierto: 'TERBUKA',
      matriz_corazon: 'HATI',
      matriz_vacio: 'KOSONG',
      note_do: 'DO (C4)',
      note_re: 'RE (D4)',
      note_mi: 'MI (E4)',
      note_fa: 'FA (F4)',
      note_sol: 'SOL (G4)',
      note_la: 'LA (A4)',
      note_si: 'SI (B4)',
      note_do5: 'DO (C5)',
      status_connected: 'Terhubung',
      status_disconnected: 'Terputus',
      msg_reset_success: 'Port berhasil direset.'
    }
  };

  class RobotTachoExtension {
    constructor(runtime) {
      this.runtime = runtime;
      this.port = null;
      this._activePort = null;
      this.encoder = new TextEncoder();
      this.decoder = new TextDecoder();
      this._serialQueue = Promise.resolve();
      this._lastMotorValue = { IZQ: null, DER: null };
    }

    _t(key) {
      const rawLocale = window.currentRecLocale || (this.runtime && this.runtime.currentLocale) || 'es';
      const lang = rawLocale.split(/[-_]/)[0].toLowerCase();
      return (I18N_BLOCKS[lang] && I18N_BLOCKS[lang][key]) || (I18N_BLOCKS['es'] && I18N_BLOCKS['es'][key]) || key;
    }

    getInfo() {
      const t = (key) => this._t(key);
      return {
        id: 'robottachov4',
        name: t('ext_title'),
        color1: '#9E2A4B',
        color2: '#7E1E38',
        color3: '#5E1328',
        blocks: [
          { func: 'connectRobot', blockType: Scratch.BlockType.BUTTON, text: t('btn_connect') },
          { func: 'resetPort', blockType: Scratch.BlockType.BUTTON, text: t('btn_reset_port') },
          { opcode: 'checkConnection', blockType: Scratch.BlockType.REPORTER, text: t('check_connection') },
          '---',
          // BLOQUES EXPLÍCITOS PARA MOTOR 3 (TAPA)
          {
            opcode: 'controlMotor3',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_motor3'),
            arguments: {
              ACCION: { type: Scratch.ArgumentType.STRING, menu: 'menuMotor3', defaultValue: '1' }
            }
          },
          {
            opcode: 'stopMotor3',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_stop_motor3')
          },
          '---',
          // MOTORES DE TRACCIÓN Y MENÚ CON MOTOR 3
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
            opcode: 'stopMotor',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_stop_motor'),
          },
          '---',
          {
            opcode: 'mostrarMatriz',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_mostrar_matriz'),
            arguments: {
              ICONO: { type: Scratch.ArgumentType.STRING, menu: 'menuMatriz', defaultValue: 'FELIZ' }
            }
          },
          {
            opcode: 'lightOn',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_light_on'),
            arguments: {
              COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#00ff00' }
            }
          },
          {
            opcode: 'lightOff',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_light_off')
          },
          {
            opcode: 'playNote',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_play_note'),
            arguments: {
              NOTE: { type: Scratch.ArgumentType.NUMBER, menu: 'musicalNotes', defaultValue: 262 },
              MS:   { type: Scratch.ArgumentType.NUMBER, defaultValue: 500 }
            }
          }
        ],
        menus: {
          menuMotor3: {
            items: [
              { text: t('motor3_up'), value: '1' },
              { text: t('motor3_down'), value: '0' },
              { text: t('motor3_stop'), value: '2' }
            ]
          },
          motorSide: {
            items: [
              { text: t('motor_izq'), value: 'IZQ' },
              { text: t('motor_der'), value: 'DER' },
              { text: t('motor_ambos'), value: 'AMBOS' },
              { text: t('motor_m3'), value: 'M3' }
            ]
          },
          motorDir: {
            items: [
              { text: t('motor_dir_fwd'), value: 'FWD' },
              { text: t('motor_dir_bwd'), value: 'BWD' }
            ]
          },
          menuMatriz: {
            items: [
              { text: t('matriz_feliz'), value: 'FELIZ' },
              { text: t('matriz_triste'), value: 'TRISTE' },
              { text: t('matriz_abierto'), value: 'ABIERTO' },
              { text: t('matriz_corazon'), value: 'CORAZON' },
              { text: t('matriz_vacio'), value: 'VACIO' }
            ]
          },
          musicalNotes: {
            items: [
              { text: t('note_do'), value: '262' },
              { text: t('note_re'), value: '294' },
              { text: t('note_mi'), value: '330' },
              { text: t('note_fa'), value: '349' },
              { text: t('note_sol'), value: '392' },
              { text: t('note_la'), value: '440' },
              { text: t('note_si'), value: '494' },
              { text: t('note_do5'), value: '523' }
            ]
          }
        }
      };
    }

    _connected() {
      return !!(this._activePort && this._activePort.readable && this._activePort.writable);
    }

    checkConnection() {
      return this._connected() ? this._t('status_connected') : this._t('status_disconnected');
    }

    async connectRobot() {
      if (this._connected()) return;
      try {
        this.port = await navigator.serial.requestPort();
        await this._disconnect();
        this._activePort = this.port;
        await this._activePort.open({ baudRate: 115200 });
      } catch (e) {
        console.error("Error al conectar:", e);
        this._activePort = null;
      }
    }

    async resetPort() {
      await this._disconnect();
      this.port = null;
      alert(this._t('msg_reset_success'));
    }

    async _disconnect() {
      if (this._activePort) {
        try { await this._activePort.close(); } catch (_) {}
        this._activePort = null;
      }
      this._lastMotorValue = { IZQ: null, DER: null };
    }

    _enqueueSerial(task) {
      const next = this._serialQueue.then(() => task());
      this._serialQueue = next.catch(() => {});
      return next;
    }

    async _sendLineRaw(msg) {
      if (!this._activePort || !this._activePort.writable) return;
      const writer = this._activePort.writable.getWriter();
      try {
        await writer.write(this.encoder.encode(msg + '\n'));
      } finally {
        writer.releaseLock();
      }
    }

    _sendLine(msg) {
      return this._enqueueSerial(() => this._sendLineRaw(msg));
    }

    _hexToRgb(hex) {
      let s = String(hex).trim();
      if (s.startsWith('#')) s = s.slice(1);
      if (s.length === 3) s = s.split('').map((ch) => ch + ch).join('');
      return {
        r: parseInt(s.slice(0, 2), 16),
        g: parseInt(s.slice(2, 4), 16),
        b: parseInt(s.slice(4, 6), 16)
      };
    }

    async controlMotor3(args) {
      await this._sendLine(`AT+TAPA=${args.ACCION}`);
    }

    async stopMotor3() {
      await this._sendLine(`AT+TAPA=2`);
    }

    async _setMotor(side, value) {
      if (this._lastMotorValue[side] === value) return;
      this._lastMotorValue[side] = value;
      await this._sendLine(`AT+M_${side}=${value}`);
    }

    async moveMotor(args) {
      if (args.SIDE === 'M3') {
        if (args.PCT === 0) {
          await this.stopMotor3();
        } else {
          const accion = args.DIR === 'BWD' ? '0' : '1';
          await this.controlMotor3({ ACCION: accion });
        }
        return;
      }

      const val = Math.round((Math.abs(args.PCT) / 100) * 255);
      const signed = args.DIR === 'BWD' ? -val : val;
      if (args.SIDE === 'AMBOS') {
        await this._setMotor('IZQ', signed);
        await this._setMotor('DER', signed);
      } else {
        await this._setMotor(args.SIDE, signed);
      }
    }

    async stopMotor() {
      await this._setMotor('IZQ', 0);
      await this._setMotor('DER', 0);
    }

    async mostrarMatriz(args) {
      await this._sendLine(`AT+MATRIZ=${args.ICONO}`);
    }

    async lightOn(args) {
      const rgb = this._hexToRgb(args.COLOR);
      await this._sendLine(`AT+LED1=${rgb.r},${rgb.g},${rgb.b}`);
    }

    async lightOff() {
      await this._sendLine(`AT+LED1=0,0,0`);
    }

    async playNote(args) {
      await this._sendLine(`AT+NOTE=${Math.round(args.NOTE)},${Math.max(0, Math.round(args.MS))}`);
    }
  }

  Scratch.extensions.register(new RobotTachoExtension());
})(Scratch);