/**
TurboWarp / Scratch 3 Custom Extension � REC PCB1 ARDUINO v2.0 (GOLDEN BACKUP)
Web Serial API @ 115200 baud. Verde Militar & Bloques Musicales. */ (function (Scratch) { 'use strict';

if (!Scratch.extensions.unsandboxed) {
  throw new Error('Esta extension debe ejecutarse sin sandbox (unsandboxed) para acceder al puerto serial.');
}

const I18N_BLOCKS = {
  es: {
    ext_title: 'ROBOT 1 Arduino (Bluetooth-USB)',
    arduino_bt_loaded_msg: '¡ROBOT 1 Arduino (Bluetooth-USB) cargado! Busca los bloques al final de la paleta izquierda 👇',
    btn_connect: 'Conectar Robot',
    check_connection: 'Check Connection',
    block_move_motor: 'Mover motor [SIDE] hacia [DIR] a [PCT]%',
    motor_dir_fwd: 'ADELANTE',
    motor_dir_bwd: 'ATRAS',
    block_stop_motor: 'Detener motor [WHICH]',
    block_light_on: 'Encender Luz [LED] en color [COLOR]',
    block_light_off: 'Apagar Luz [LED]',
    block_play_note: 'Tocar nota [NOTE] por [MS] ms',
    block_get_dht: 'Obtener [TIPO]',
    block_distance_cm: 'Distancia en cm',
    block_line_detected: 'Detecta linea',
    block_restore_firmware: 'Restaurar firmware original 🔄',
    motor_left: 'IZQUIERDO / B',
    motor_right: 'DERECHO / A',
    stop_both: 'AMBOS',
    led_all: 'TODAS',
    dht_temp: 'Temperatura (C)',
    dht_hum: 'Humedad (%)',
    note_do: 'DO (C4)',
    note_re: 'RE (D4)',
    note_mi: 'MI (E4)',
    note_fa: 'FA (F4)',
    note_sol: 'SOL (G4)',
    note_la: 'LA (A4)',
    note_si: 'SI (B4)',
    note_do5: 'DO (C5)'
  },
  en: {
    ext_title: 'ROBOT 1 Arduino (Bluetooth-USB)',
    arduino_bt_loaded_msg: 'ROBOT 1 Arduino (Bluetooth-USB) loaded! Look for the blocks at the bottom of the left palette 👇',
    btn_connect: 'Connect Robot',
    check_connection: 'Check Connection',
    block_move_motor: 'Move [SIDE] motor [DIR] at [PCT]%',
    motor_dir_fwd: 'FORWARD',
    motor_dir_bwd: 'BACKWARD',
    block_stop_motor: 'Stop [WHICH] motor',
    block_light_on: 'Turn on [LED] light with color [COLOR]',
    block_light_off: 'Turn off [LED] light',
    block_play_note: 'Play note [NOTE] for [MS] ms',
    block_get_dht: 'Get [TIPO]',
    block_distance_cm: 'distance in cm',
    block_line_detected: 'line detected',
    block_restore_firmware: 'Restore original firmware 🔄',
    motor_left: 'LEFT / B',
    motor_right: 'RIGHT / A',
    stop_both: 'BOTH',
    led_all: 'ALL',
    dht_temp: 'Temperature (C)',
    dht_hum: 'Humidity (%)',
    note_do: 'C (C4)',
    note_re: 'D (D4)',
    note_mi: 'E (E4)',
    note_fa: 'F (F4)',
    note_sol: 'G (G4)',
    note_la: 'A (A4)',
    note_si: 'B (B4)',
    note_do5: 'C (C5)'
  },
  pt: {
    ext_title: 'ROBOT 1 Arduino (Bluetooth-USB)',
    arduino_bt_loaded_msg: 'ROBOT 1 Arduino (Bluetooth-USB) carregado! Procure os blocos no final da paleta à esquerda 👇',
    btn_connect: 'Conectar Robot',
    check_connection: 'Verificar Conexão',
    block_move_motor: 'Mover motor [SIDE] para [DIR] a [PCT]%',
    motor_dir_fwd: 'FRENTE',
    motor_dir_bwd: 'TRÁS',
    block_stop_motor: 'Parar motor [WHICH]',
    block_light_on: 'Acender luz [LED] na cor [COLOR]',
    block_light_off: 'Apagar luz [LED]',
    block_play_note: 'Tocar nota [NOTE] por [MS] ms',
    block_get_dht: 'Obter [TIPO]',
    block_distance_cm: 'distância em cm',
    block_line_detected: 'detecta linha',
    block_restore_firmware: 'Restaurar firmware original 🔄',
    motor_left: 'ESQUERDO / B',
    motor_right: 'DIREITO / A',
    stop_both: 'AMBOS',
    led_all: 'TODAS',
    dht_temp: 'Temperatura (C)',
    dht_hum: 'Umidade (%)',
    note_do: 'DÓ (C4)',
    note_re: 'RÉ (D4)',
    note_mi: 'MI (E4)',
    note_fa: 'FÁ (F4)',
    note_sol: 'SOL (G4)',
    note_la: 'LÁ (A4)',
    note_si: 'SI (B4)',
    note_do5: 'DÓ (C5)'
  },
  fr: {
    ext_title: 'ROBOT 1 Arduino (Bluetooth-USB)',
    arduino_bt_loaded_msg: 'ROBOT 1 Arduino (Bluetooth-USB) chargé ! Retrouve les blocs en bas de la palette à gauche 👇',
    btn_connect: 'Connecter le Robot',
    check_connection: 'Vérifier la connexion',
    block_move_motor: 'Moteur [SIDE] [DIR] à [PCT]%',
    motor_dir_fwd: 'AVANT',
    motor_dir_bwd: 'ARRIÈRE',
    block_stop_motor: 'Arrêter le moteur [WHICH]',
    block_light_on: 'Allumer la LED [LED] de couleur [COLOR]',
    block_light_off: 'Éteindre la LED [LED]',
    block_play_note: 'Jouer la note [NOTE] pendant [MS] ms',
    block_get_dht: 'Obtenir [TIPO]',
    block_distance_cm: 'distance en cm',
    block_line_detected: 'détecte la ligne',
    block_restore_firmware: 'Restaurer le firmware original 🔄',
    motor_left: 'GAUCHE / B',
    motor_right: 'DROITE / A',
    stop_both: 'LES DEUX',
    led_all: 'TOUTES',
    dht_temp: 'Température (C)',
    dht_hum: 'Humidité (%)',
    note_do: 'DO (C4)',
    note_re: 'RÉ (D4)',
    note_mi: 'MI (E4)',
    note_fa: 'FA (F4)',
    note_sol: 'SOL (G4)',
    note_la: 'LA (A4)',
    note_si: 'SI (B4)',
    note_do5: 'DO (C5)'
  },
  de: {
    ext_title: 'ROBOT 1 Arduino (Bluetooth-USB)',
    arduino_bt_loaded_msg: 'ROBOT 1 Arduino (Bluetooth-USB) geladen! Die Blöcke findest du unten in der linken Palette 👇',
    btn_connect: 'Roboter verbinden',
    check_connection: 'Verbindung prüfen',
    block_move_motor: 'Motor [SIDE] [DIR] mit [PCT]%',
    motor_dir_fwd: 'VORWÄRTS',
    motor_dir_bwd: 'RÜCKWÄRTS',
    block_stop_motor: 'Motor [WHICH] stoppen',
    block_light_on: 'LED [LED] in Farbe [COLOR] einschalten',
    block_light_off: 'LED [LED] ausschalten',
    block_play_note: 'Note [NOTE] für [MS] ms spielen',
    block_get_dht: '[TIPO] abrufen',
    block_distance_cm: 'Entfernung in cm',
    block_line_detected: 'Linie erkannt',
    block_restore_firmware: 'Original-Firmware wiederherstellen 🔄',
    motor_left: 'LINKS / B',
    motor_right: 'RECHTS / A',
    stop_both: 'BEIDE',
    led_all: 'ALLE',
    dht_temp: 'Temperatur (C)',
    dht_hum: 'Luftfeuchtigkeit (%)',
    note_do: 'C (C4)',
    note_re: 'D (D4)',
    note_mi: 'E (E4)',
    note_fa: 'F (F4)',
    note_sol: 'G (G4)',
    note_la: 'A (A4)',
    note_si: 'H (B4)',
    note_do5: 'C (C5)'
  },
  it: {
    ext_title: 'ROBOT 1 Arduino (Bluetooth-USB)',
    arduino_bt_loaded_msg: 'ROBOT 1 Arduino (Bluetooth-USB) caricato! Cerca i blocchi in fondo alla palette a sinistra 👇',
    btn_connect: 'Connetti Robot',
    check_connection: 'Controlla connessione',
    block_move_motor: 'Motore [SIDE] [DIR] al [PCT]%',
    motor_dir_fwd: 'AVANTI',
    motor_dir_bwd: 'INDIETRO',
    block_stop_motor: 'Fermare il motore [WHICH]',
    block_light_on: 'Accendere luce [LED] di colore [COLOR]',
    block_light_off: 'Spegnere luce [LED]',
    block_play_note: 'Suonare nota [NOTE] per [MS] ms',
    block_get_dht: 'Ottieni [TIPO]',
    block_distance_cm: 'distanza in cm',
    block_line_detected: 'rileva linea',
    block_restore_firmware: 'Ripristina firmware originale 🔄',
    motor_left: 'SINISTRO / B',
    motor_right: 'DESTRO / A',
    stop_both: 'ENTRAMBI',
    led_all: 'TUTTE',
    dht_temp: 'Temperatura (C)',
    dht_hum: 'Umidità (%)',
    note_do: 'DO (C4)',
    note_re: 'RE (D4)',
    note_mi: 'MI (E4)',
    note_fa: 'FA (F4)',
    note_sol: 'SOL (G4)',
    note_la: 'LA (A4)',
    note_si: 'SI (B4)',
    note_do5: 'DO (C5)'
  },
  zh: {
    ext_title: 'ROBOT 1 Arduino（Bluetooth-USB）',
    arduino_bt_loaded_msg: 'ROBOT 1 Arduino（Bluetooth-USB）已加载！在左侧积木栏底部查找积木 👇',
    btn_connect: '连接机器人',
    check_connection: '检查连接',
    block_move_motor: '以 [PCT]% [DIR] 移动 [SIDE] 电机',
    motor_dir_fwd: '前进',
    motor_dir_bwd: '后退',
    block_stop_motor: '停止 [WHICH] 电机',
    block_light_on: '打开 [LED] 灯，颜色为 [COLOR]',
    block_light_off: '关闭 [LED] 灯',
    block_play_note: '以 [NOTE] 音符播放 [MS] 毫秒',
    block_get_dht: '获取 [TIPO]',
    block_distance_cm: '距离（厘米）',
    block_line_detected: '检测到线',
    block_restore_firmware: '恢复原始固件 🔄',
    motor_left: '左 / B',
    motor_right: '右 / A',
    stop_both: '全部',
    led_all: '全部',
    dht_temp: '温度（C）',
    dht_hum: '湿度（%）',
    note_do: 'C (C4)',
    note_re: 'D (D4)',
    note_mi: 'E (E4)',
    note_fa: 'F (F4)',
    note_sol: 'G (G4)',
    note_la: 'A (A4)',
    note_si: 'B (B4)',
    note_do5: 'C (C5)'
  },
  ja: {
    ext_title: 'ROBOT 1 Arduino（Bluetooth-USB）',
    arduino_bt_loaded_msg: 'ROBOT 1 Arduino（Bluetooth-USB）が読み込まれました！左のパレットの一番下にブロックがあります 👇',
    btn_connect: 'ロボットを接続',
    check_connection: '接続を確認',
    block_move_motor: '[SIDE] モーターを [PCT]% で [DIR]',
    motor_dir_fwd: '前進',
    motor_dir_bwd: '後退',
    block_stop_motor: '[WHICH] モーターを停止する',
    block_light_on: '色 [COLOR] の [LED] ライトをつける',
    block_light_off: '[LED] ライトを消す',
    block_play_note: '音符 [NOTE] を [MS] ミリ秒鳴らす',
    block_get_dht: '[TIPO] を取得',
    block_distance_cm: '距離（cm）',
    block_line_detected: 'ラインを検出',
    block_restore_firmware: '元のファームウェアを復元 🔄',
    motor_left: '左 / B',
    motor_right: '右 / A',
    stop_both: '両方',
    led_all: 'すべて',
    dht_temp: '温度（C）',
    dht_hum: '湿度（%）',
    note_do: 'ド (C4)',
    note_re: 'レ (D4)',
    note_mi: 'ミ (E4)',
    note_fa: 'ファ (F4)',
    note_sol: 'ソ (G4)',
    note_la: 'ラ (A4)',
    note_si: 'シ (B4)',
    note_do5: 'ド (C5)'
  },
  ko: {
    ext_title: 'ROBOT 1 Arduino(Bluetooth-USB)',
    arduino_bt_loaded_msg: 'ROBOT 1 Arduino(Bluetooth-USB)이(가) 로드되었습니다! 왼쪽 팔레트 하단에서 블록을 찾으세요 👇',
    btn_connect: '로봇 연결',
    check_connection: '연결 확인',
    block_move_motor: '[SIDE] 모터를 [PCT]%로 [DIR]',
    motor_dir_fwd: '전진',
    motor_dir_bwd: '후진',
    block_stop_motor: '[WHICH] 모터 정지',
    block_light_on: '[COLOR] 색상으로 [LED] 조명 켜기',
    block_light_off: '[LED] 조명 끄기',
    block_play_note: '음 [NOTE] 를 [MS] ms 동안 연주',
    block_get_dht: '[TIPO] 가져오기',
    block_distance_cm: '거리(cm)',
    block_line_detected: '라인 감지',
    block_restore_firmware: '원래 펌웨어 복원 🔄',
    motor_left: '왼쪽 / B',
    motor_right: '오른쪽 / A',
    stop_both: '양쪽',
    led_all: '전체',
    dht_temp: '온도(C)',
    dht_hum: '습도(%)',
    note_do: '도 (C4)',
    note_re: '레 (D4)',
    note_mi: '미 (E4)',
    note_fa: '파 (F4)',
    note_sol: '솔 (G4)',
    note_la: '라 (A4)',
    note_si: '시 (B4)',
    note_do5: '도 (C5)'
  },
  ru: {
    ext_title: 'ROBOT 1 Arduino (Bluetooth-USB)',
    arduino_bt_loaded_msg: 'ROBOT 1 Arduino (Bluetooth-USB) загружен! Ищи блоки внизу левой палитры 👇',
    btn_connect: 'Подключить робота',
    check_connection: 'Проверить подключение',
    block_move_motor: 'Двигать мотор [SIDE] [DIR] на [PCT]%',
    motor_dir_fwd: 'ВПЕРЁД',
    motor_dir_bwd: 'НАЗАД',
    block_stop_motor: 'Остановить мотор [WHICH]',
    block_light_on: 'Включить свет [LED] цвета [COLOR]',
    block_light_off: 'Выключить свет [LED]',
    block_play_note: 'играть ноту [NOTE] [MS] мс',
    block_get_dht: 'Получить [TIPO]',
    block_distance_cm: 'расстояние в см',
    block_line_detected: 'обнаружена линия',
    block_restore_firmware: 'Восстановить исходную прошивку 🔄',
    motor_left: 'ЛЕВЫЙ / B',
    motor_right: 'ПРАВЫЙ / A',
    stop_both: 'ОБА',
    led_all: 'ВСЕ',
    dht_temp: 'Температура (C)',
    dht_hum: 'Влажность (%)',
    note_do: 'ДО (C4)',
    note_re: 'РЕ (D4)',
    note_mi: 'МИ (E4)',
    note_fa: 'ФА (F4)',
    note_sol: 'СОЛЬ (G4)',
    note_la: 'ЛЯ (A4)',
    note_si: 'СИ (B4)',
    note_do5: 'ДО (C5)'
  },
  ar: {
    ext_title: 'ROBOT 1 Arduino (Bluetooth-USB)',
    arduino_bt_loaded_msg: 'تم تحميل ROBOT 1 Arduino (Bluetooth-USB)! ابحث عن الكتل في أسفل اللوحة اليسرى 👇',
    btn_connect: 'توصيل الروبوت',
    check_connection: 'التحقق من الاتصال',
    block_move_motor: 'تحريك المحرك [SIDE] [DIR] بنسبة [PCT]%',
    motor_dir_fwd: 'للأمام',
    motor_dir_bwd: 'للخلف',
    block_stop_motor: 'إيقاف المحرك [WHICH]',
    block_light_on: 'تشغيل ضوء [LED] باللون [COLOR]',
    block_light_off: 'إطفاء ضوء [LED]',
    block_play_note: 'عزف نوتة [NOTE] لمدة [MS] مللي ثانية',
    block_get_dht: 'الحصول على [TIPO]',
    block_distance_cm: 'المسافة بالسم',
    block_line_detected: 'اكتشاف الخط',
    block_restore_firmware: 'استعادة البرامج الثابتة الأصلية 🔄',
    motor_left: 'يسار / B',
    motor_right: 'يمين / A',
    stop_both: 'كلاهما',
    led_all: 'الكل',
    dht_temp: 'درجة الحرارة (C)',
    dht_hum: 'الرطوبة (%)',
    note_do: 'دو (C4)',
    note_re: 'ري (D4)',
    note_mi: 'مي (E4)',
    note_fa: 'فا (F4)',
    note_sol: 'صول (G4)',
    note_la: 'لا (A4)',
    note_si: 'سي (B4)',
    note_do5: 'دو (C5)'
  },
  hi: {
    ext_title: 'ROBOT 1 Arduino (Bluetooth-USB)',
    arduino_bt_loaded_msg: 'ROBOT 1 Arduino (Bluetooth-USB) लोड हो गया है! बाएँ पैलेट के नीचे ब्लॉक खोजें 👇',
    btn_connect: 'रोबोट कनेक्ट करें',
    check_connection: 'कनेक्शन जांचें',
    block_move_motor: '[SIDE] मोटर को [PCT]% पर [DIR]',
    motor_dir_fwd: 'आगे',
    motor_dir_bwd: 'पीछे',
    block_stop_motor: '[WHICH] मोटर रोकें',
    block_light_on: '[LED] लाइट को [COLOR] रंग में चालू करें',
    block_light_off: '[LED] लाइट बंद करें',
    block_play_note: '[NOTE] नोट को [MS] मिलीसेकंड तक बजाएं',
    block_get_dht: '[TIPO] प्राप्त करें',
    block_distance_cm: 'दूरी सेमी में',
    block_line_detected: 'रेखा का पता चला',
    block_restore_firmware: 'मूल फर्मवेयर पुनर्स्थापित करें 🔄',
    motor_left: 'बायाँ / B',
    motor_right: 'दायाँ / A',
    stop_both: 'दोनों',
    led_all: 'सभी',
    dht_temp: 'तापमान (C)',
    dht_hum: 'नमी (%)',
    note_do: 'डो (C4)',
    note_re: 'रे (D4)',
    note_mi: 'मी (E4)',
    note_fa: 'फा (F4)',
    note_sol: 'सोल (G4)',
    note_la: 'ला (A4)',
    note_si: 'सी (B4)',
    note_do5: 'डो (C5)'
  },
  bn: {
    ext_title: 'ROBOT 1 Arduino (Bluetooth-USB)',
    arduino_bt_loaded_msg: 'ROBOT 1 Arduino (Bluetooth-USB) लोड हो গया है! বাম প্যালেটের নিচে ব্লকগুলো খুঁজুন 👇',
    btn_connect: 'রোবট সংযোগ করুন',
    check_connection: 'সংযোগ পরীক্ষা করুন',
    block_move_motor: '[SIDE] মোটর [PCT]% [DIR]',
    motor_dir_fwd: 'এগিয়ে',
    motor_dir_bwd: 'পিছিয়ে',
    block_stop_motor: '[WHICH] মোটর থামান',
    block_light_on: '[LED] আলো [COLOR] রঙে জ্বালান',
    block_light_off: '[LED] আলো বন্ধ করুন',
    block_play_note: '[MS] মিলিসেকেন্ডের জন্য [NOTE] নোট বাজান',
    block_get_dht: '[TIPO] পান',
    block_distance_cm: 'সেন্টিমিটারে দূরত্ব',
    block_line_detected: 'লাইন শনাক্ত হয়েছে',
    block_restore_firmware: 'মূল ফার্মওয়্যার পুনরুদ্ধার করুন 🔄',
    motor_left: 'বাম / B',
    motor_right: 'ডান / A',
    stop_both: 'উভয়',
    led_all: 'সব',
    dht_temp: 'তাপমাত্রা (C)',
    dht_hum: 'আর্দ্রতা (%)',
    note_do: 'ডো (C4)',
    note_re: 'রে (D4)',
    note_mi: 'মি (E4)',
    note_fa: 'ফা (F4)',
    note_sol: 'সোল (G4)',
    note_la: 'লা (A4)',
    note_si: 'সি (B4)',
    note_do5: 'ডো (C5)'
  },
  id: {
    ext_title: 'ROBOT 1 Arduino (Bluetooth-USB)',
    arduino_bt_loaded_msg: 'ROBOT 1 Arduino (Bluetooth-USB) dimuat! Cari bloknya di bagian bawah palet kiri 👇',
    btn_connect: 'Hubungkan Robot',
    check_connection: 'Periksa Koneksi',
    block_move_motor: 'Gerakkan motor [SIDE] [DIR] dengan [PCT]%',
    motor_dir_fwd: 'MAJU',
    motor_dir_bwd: 'MUNDUR',
    block_stop_motor: 'Hentikan motor [WHICH]',
    block_light_on: 'Nyalakan lampu [LED] dengan warna [COLOR]',
    block_light_off: 'Matikan lampu [LED]',
    block_play_note: 'Mainkan nada [NOTE] selama [MS] md',
    block_get_dht: 'Dapatkan [TIPO]',
    block_distance_cm: 'jarak dalam cm',
    block_line_detected: 'garis terdeteksi',
    block_restore_firmware: 'Pulihkan firmware asli 🔄',
    motor_left: 'KIRI / B',
    motor_right: 'KANAN / A',
    stop_both: 'KEDUANYA',
    led_all: 'SEMUA',
    dht_temp: 'Suhu (C)',
    dht_hum: 'Kelembaban (%)',
    note_do: 'DO (C4)',
    note_re: 'RE (D4)',
    note_mi: 'MI (E4)',
    note_fa: 'FA (F4)',
    note_sol: 'SOL (G4)',
    note_la: 'LA (A4)',
    note_si: 'SI (B4)',
    note_do5: 'DO (C5)'
  },
  tr: {
    ext_title: 'ROBOT 1 Arduino (Bluetooth-USB)',
    arduino_bt_loaded_msg: 'ROBOT 1 Arduino (Bluetooth-USB) yüklendi! Blokları sol paletin en altında bulun 👇',
    btn_connect: 'Robotu Bağla',
    check_connection: 'Bağlantıyı Kontrol Et',
    block_move_motor: '[SIDE] motorunu [PCT]% ile [DIR]',
    motor_dir_fwd: 'İLERİ',
    motor_dir_bwd: 'GERİ',
    block_stop_motor: '[WHICH] motorunu durdur',
    block_light_on: '[LED] ışığını [COLOR] renginde aç',
    block_light_off: '[LED] ışığını kapat',
    block_play_note: '[NOTE] notasını [MS] ms çal',
    block_get_dht: '[TIPO] Al',
    block_distance_cm: 'mesafe cm cinsinden',
    block_line_detected: 'çizgi algılandı',
    block_restore_firmware: "Orijinal firmware'i geri yükle 🔄",
    motor_left: 'SOL / B',
    motor_right: 'SAĞ / A',
    stop_both: 'İKİSİ',
    led_all: 'TÜMÜ',
    dht_temp: 'Sıcaklık (C)',
    dht_hum: 'Nem (%)',
    note_do: 'DO (C4)',
    note_re: 'RE (D4)',
    note_mi: 'Mİ (E4)',
    note_fa: 'FA (F4)',
    note_sol: 'SOL (G4)',
    note_la: 'LA (A4)',
    note_si: 'Sİ (B4)',
    note_do5: 'DO (C5)'
  }
};

// ── Toast de extensión cargada ──────────────────────────────────────────
let arduinoToastCssInjected = false;
function injectArduinoToastCSS() {
  if (arduinoToastCssInjected) return;
  arduinoToastCssInjected = true;
  const style = document.createElement('style');
  style.id = 'rec-arduino-toast-css';
  style.textContent =
    '#rec-arduino-toast {' +
    '  position: fixed;' +
    '  bottom: 1rem;' +
    '  left: 1rem;' +
    '  z-index: 9999;' +
    '  max-width: 320px;' +
    '  background: rgba(40,40,40,0.95);' +
    '  color: #fff;' +
    '  border-left: 4px solid #4b5320;' +
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
    '#rec-arduino-toast.rec-arduino-toast-visible {' +
    '  opacity: 1;' +
    '  transform: translateY(0);' +
    '}' +
    '#rec-arduino-toast.rec-arduino-toast-hiding {' +
    '  opacity: 0;' +
    '  transform: translateY(10px);' +
    '}' +
    '#rec-arduino-toast .rec-arduino-toast-icon {' +
    '  display: inline-block;' +
    '  margin-right: 0.5rem;' +
    '  font-size: 1.1rem;' +
    '  vertical-align: middle;' +
    '}' +
    '#rec-arduino-toast .rec-arduino-toast-text {' +
    '  vertical-align: middle;' +
    '  display: inline;' +
    '}';
  document.head.appendChild(style);
}

function showArduinoLoadedToast() {
  if (!document.body) return;
  injectArduinoToastCSS();

  const existing = document.getElementById('rec-arduino-toast');
  if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

  const locale = window.currentRecLocale || 'es';
  const dict = I18N_BLOCKS[locale] || I18N_BLOCKS['es'];
  const msg = dict.arduino_bt_loaded_msg || I18N_BLOCKS['es'].arduino_bt_loaded_msg;

  const toast = document.createElement('div');
  toast.id = 'rec-arduino-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  const icon = document.createElement('span');
  icon.className = 'rec-arduino-toast-icon';
  icon.textContent = '🤖';

  const text = document.createElement('span');
  text.className = 'rec-arduino-toast-text';
  text.textContent = msg;

  toast.appendChild(icon);
  toast.appendChild(text);

  document.body.appendChild(toast);

  if (toast.offsetWidth) {
    // no-op
  }

  toast.classList.add('rec-arduino-toast-visible');

  setTimeout(() => {
    toast.classList.remove('rec-arduino-toast-visible');
    toast.classList.add('rec-arduino-toast-hiding');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 400);
  }, 4500);
}

class RecPcb1Arduino { constructor(runtime) { this.runtime = runtime; this.port = null; this._activePort = null; this.encoder = new TextEncoder(); this.decoder = new TextDecoder(); this._rxRemainder = ''; this._lineWaiters = []; this._readLoopRunning = false; this._serialQueue = Promise.resolve();
  this._distanceEma = null;
  this._distanceLastMs = 0;
  this._distanceLastDisplay = null;
  this._distanceMinIntervalMs = 65;
  this._distanceLastGood = null;
  this._lastMotorValue = { IZQ: null, DER: null };
}

getInfo() {
  const t = I18N_BLOCKS[window.currentRecLocale || 'es'] || I18N_BLOCKS['es'];
  return {
    id: 'recpcb1arduino',
    name: t.ext_title,
    color1: '#4b5320',
    color2: '#3d441a',
    color3: '#2f3514',
    blocks: [
      { func: 'connectRobot', blockType: Scratch.BlockType.BUTTON, text: t.btn_connect, callFunc: this.connectRobot.bind(this) },
      { opcode: 'checkConnection', blockType: Scratch.BlockType.REPORTER, text: t.check_connection },
      '---',
      {
        opcode: 'moveMotor',
        blockType: Scratch.BlockType.COMMAND,
        text: t.block_move_motor,
        arguments: {
          SIDE: { type: Scratch.ArgumentType.STRING, menu: 'motorSide', defaultValue: 'IZQ' },
          DIR:  { type: Scratch.ArgumentType.STRING, menu: 'motorDir', defaultValue: 'FWD' },
          PCT:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
        }
      },
      {
        opcode: 'moveForward',
        blockType: Scratch.BlockType.COMMAND,
        text: t.block_move_motor,
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
        text: t.block_move_motor,
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
        text: t.block_stop_motor,
        arguments: { 
          WHICH: { type: Scratch.ArgumentType.STRING, menu: 'stopWhich', defaultValue: 'AMBOS' } 
        }
      },
      '---',
      {
        opcode: 'lightOn',
        blockType: Scratch.BlockType.COMMAND,
        text: t.block_light_on,
        arguments: { 
          LED: { type: Scratch.ArgumentType.STRING, menu: 'ledWhich', defaultValue: 'TODAS' }, 
          COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#ff0000' } 
        }
      },
      { 
        opcode: 'lightOff', 
        blockType: Scratch.BlockType.COMMAND, 
        text: t.block_light_off, 
        arguments: { 
          LED: { type: Scratch.ArgumentType.STRING, menu: 'ledWhich', defaultValue: 'TODAS' } 
        } 
      },
      {
        opcode: 'playNote',
        blockType: Scratch.BlockType.COMMAND,
        text: t.block_play_note,
        arguments: { 
          NOTE: { type: Scratch.ArgumentType.NUMBER, menu: 'musicalNotes', defaultValue: 262 }, 
          MS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 500 } 
        }
      },
      '---',
      {
        opcode: 'getDHT',
        blockType: Scratch.BlockType.REPORTER,
        text: t.block_get_dht,
        arguments: { 
          TIPO: { type: Scratch.ArgumentType.STRING, menu: 'dhtMenu', defaultValue: 'TEMP' } 
        }
      },
      { opcode: 'distanceCm', blockType: Scratch.BlockType.REPORTER, text: t.block_distance_cm },
      { opcode: 'lineDetected', blockType: Scratch.BlockType.BOOLEAN, text: t.block_line_detected },
      '---',
      { opcode: 'restaurarFirmware', blockType: Scratch.BlockType.COMMAND, text: t.block_restore_firmware }
    ],
    menus: {
      motorSide: { items: [{ text: t.motor_left, value: 'IZQ' }, { text: t.motor_right, value: 'DER' }, { text: t.stop_both, value: 'AMBOS' }] },
      motorDir: { items: [{ text: t.motor_dir_fwd, value: 'FWD' }, { text: t.motor_dir_bwd, value: 'BWD' }] },
      stopWhich: { items: [{ text: t.motor_left, value: 'IZQ' }, { text: t.motor_right, value: 'DER' }, { text: t.stop_both, value: 'AMBOS' }] },
      ledWhich: { items: ['1', '2', t.led_all] },
      dhtMenu: { items: [{ text: t.dht_temp, value: 'TEMP' }, { text: t.dht_hum, value: 'HUM' }] },
      musicalNotes: {
        items: [
          { text: t.note_do, value: '262' }, { text: t.note_re, value: '294' }, { text: t.note_mi, value: '330' },
          { text: t.note_fa, value: '349' }, { text: t.note_sol, value: '392' }, { text: t.note_la, value: '440' },
          { text: t.note_si, value: '494' }, { text: t.note_do5, value: '523' }
        ]
      }
    }
  };
}

_connected() { return !!(this._activePort && this._activePort.readable && this._activePort.writable); }
checkConnection() { return this._connected() ? 'Connected' : 'Disconnected'; }

async connectRobot() {
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

async _disconnect() {
  this._readLoopRunning = false;
  if (this._activePort) { try { await this._activePort.close(); } catch (_) {} this._activePort = null; }
  this._lastMotorValue = { IZQ: null, DER: null };
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
    if (timeoutMs > 0) { w.timer = setTimeout(() => {
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

_hexToRgb(hex) {
  let s = String(hex).trim(); if (s.startsWith('#')) s = s.slice(1);
  if (s.length === 3) s = s.split('').map((ch) => ch + ch).join('');
  return { r: parseInt(s.slice(0, 2), 16), g: parseInt(s.slice(2, 4), 16), b: parseInt(s.slice(4, 6), 16) };
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
    await this._setMotor('IZQ', signed);
    await this._setMotor('DER', signed);
  } else {
    await this._setMotor(args.SIDE, signed);
  }
}
async moveForward(args) { await this.moveMotor({ SIDE: args.SIDE, DIR: 'FWD', PCT: args.PCT }); }
async moveBackward(args) { await this.moveMotor({ SIDE: args.SIDE, DIR: 'BWD', PCT: args.PCT }); }

async stopMotor(args) {
  if (args.WHICH === 'AMBOS') {
    await this._setMotor('IZQ', 0);
    await this._setMotor('DER', 0);
  } else { 
    await this._setMotor(args.WHICH, 0); 
  }
}

async lightOn(args) { 
  const rgb = this._hexToRgb(args.COLOR); 
  if (args.LED === 'TODAS') {
    await this._sendLine(`AT+LED1=${rgb.r},${rgb.g},${rgb.b}`);
    await this._sendLine(`AT+LED2=${rgb.r},${rgb.g},${rgb.b}`);
  } else {
    await this._sendLine(`AT+LED${args.LED}=${rgb.r},${rgb.g},${rgb.b}`); 
  }
}

async lightOff(args) { 
  if (args.LED === 'TODAS') {
    await this._sendLine(`AT+LED1=0,0,0`);
    await this._sendLine(`AT+LED2=0,0,0`);
  } else {
    await this._sendLine(`AT+LED${args.LED}=0,0,0`); 
  }
}

async playNote(args) { await this._sendLine(`AT+NOTE=${Math.round(args.NOTE)},${Math.max(0, Math.round(args.MS))}`); }

async getDHT(args) {
  if (!this._connected()) return "Error";
  return this._enqueueSerial(async () => {
    const pred = (ln) => ln.includes(',');
    const linePromise = this._waitForLine(pred, 2000)
      .then((ln) => {
        const parts = ln.split(',');
        if (parts[0] === "0" && parts[1] === "0") return "Error Sensor"; 
        return args.TIPO === 'TEMP' ? parseFloat(parts[1]) : parseFloat(parts[0]);
      })
      .catch(() => "Timeout");
    await this._sendLineRaw('AT+DHT');
    return await linePromise;
  });
}

distanceCm() {
  if (!this._connected()) return -1;
  const now = Date.now();
  if (this._distanceLastDisplay != null && now - this._distanceLastMs < this._distanceMinIntervalMs) return Promise.resolve(this._distanceLastDisplay);
  return this._enqueueSerial(async () => {
    const pred = (ln) => /^-?\d+$/.test(ln);
    const linePromise = this._waitForLine(pred, 1500)
      .then((ln) => {
        const raw = parseInt(ln, 10);
        if (raw > 0 && raw < 450) { this._distanceLastGood = raw; return raw; }
        throw new Error();
      }).catch(() => this._distanceLastGood || 999);
    await this._sendLineRaw('AT+DISTANCIA');
    const out = await linePromise;
    this._distanceLastMs = Date.now(); this._distanceLastDisplay = out;
    return out;
  });
}

lineDetected() {
  if (!this._connected()) return false;
  return this._enqueueSerial(async () => {
    const pred = (ln) => ln === '0' || ln === '1';
    const linePromise = this._waitForLine(pred, 1500).then((ln) => ln === '1').catch(() => false);
    await this._sendLineRaw('AT+IR');
    return await linePromise;
  });
}

// Convierte un string Intel HEX en Uint8Array binario (ATmega328P)
_parseIntelHex(hexStr) {
  const segs = []; let maxEnd = 0;
  for (const rec of hexStr.split(/\r?\n/).filter(l => l.startsWith(':'))) {
    const b = rec.slice(1).match(/.{2}/g).map(h => parseInt(h, 16));
    const len = b[0], addr = (b[1] << 8) | b[2], type = b[3];
    if (type === 0x00) { segs.push({ addr, data: b.slice(4, 4 + len) }); maxEnd = Math.max(maxEnd, addr + len); }
    else if (type === 0x01) break;
  }
  const bin = new Uint8Array(maxEnd).fill(0xff);
  for (const { addr, data } of segs) data.forEach((v, i) => (bin[addr + i] = v));
  return bin;
}

// Flashea el binario firmware_rec_blindado.hex directamente al robot vía STK500v1.
// El alumno recupera el modo En Vivo / IA con un solo clic, sin necesidad de Arduino IDE.
async restaurarFirmware() {
  const HEX_URL = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
    ? window.location.origin + '/Laboratorio-IA/extensionesrec/firmdata/firmware_rec_blindado.hex'
    : 'https://cdn.jsdelivr.net/gh/ROBOTICAENCOLEGIOS/Laboratorio-IA@main/extensionesrec/firmdata/firmware_rec_blindado.hex';

  const log = (m) => console.info('[RestaurarFirmware]', m);
  let port = null, writer = null, looping = false;
  const rxBuf = [], rxWait = [];

  const readByte = (to = 2000) => {
    if (rxBuf.length > 0) return Promise.resolve(rxBuf.shift());
    return new Promise((res, rej) => {
      let fn;
      const t = setTimeout(() => { const i = rxWait.indexOf(fn); if (i >= 0) rxWait.splice(i, 1); rej(new Error('Timeout: bootloader no responde')); }, to);
      fn = (b) => { clearTimeout(t); res(b); };
      rxWait.push(fn);
    });
  };
  const expectOK = async (to = 2000) => {
    const s = await readByte(to), o = await readByte(to);
    if (s !== 0x14 || o !== 0x10) throw new Error('STK500: respuesta inválida 0x' + s.toString(16) + ' 0x' + o.toString(16));
  };
  const send  = async (b) => writer.write(new Uint8Array(b));
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const close = async () => {
    looping = false;
    try { writer.releaseLock(); } catch (_) {}
    try { await port.close(); }   catch (_) {}
  };

  try {
    // ── 1. Descargar el binario blindado ─────────────────────────────────
    log('Descargando firmware_rec_blindado.hex...');
    const resp = await fetch(HEX_URL, { cache: 'no-store' });
    if (!resp.ok) throw new Error('No se pudo obtener el firmware: HTTP ' + resp.status);
    const binary = this._parseIntelHex(await resp.text());
    log('Firmware: ' + binary.length + ' bytes listos para flashear.');

    // ── 2. Abrir puerto y arrancar Optiboot vía DTR ───────────────────────
    log('Esperando selección de puerto COM...');
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    writer = port.writable.getWriter();

    // Loop de lectura asíncrono
    looping = true;
    (async () => {
      while (looping && port.readable) {
        const reader = port.readable.getReader();
        try {
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) for (const b of value) { if (rxWait.length > 0) rxWait.shift()(b); else rxBuf.push(b); }
          }
        } catch (_) { break; } finally { try { reader.releaseLock(); } catch (_) {} }
      }
    })();

    log('Reiniciando Arduino (DTR)...');
    await port.setSignals({ dataTerminalReady: false });
    await sleep(250);
    await port.setSignals({ dataTerminalReady: true });
    await sleep(50);

    // ── 3. Sincronizar con bootloader ─────────────────────────────────────
    log('Sincronizando con Optiboot...');
    rxBuf.length = 0;
    let synced = false;
    for (let i = 0; i < 10 && !synced; i++) {
      await send([0x30, 0x20]);
      try { await expectOK(500); synced = true; } catch (_) { await sleep(50); }
    }
    if (!synced) throw new Error('No se pudo sincronizar con el bootloader.\n→ ¿El cable USB está bien conectado?\n→ ¿Seleccionaste el puerto correcto?');

    // ── 4. Configurar dispositivo ATmega328P ──────────────────────────────
    await send([0x42, 0x86,0x00,0x00,0x01,0x01,0x01,0x01,0x06, 0xff,0xff,0xff,0xff,0x00,0x80,0x04,0x00, 0x00,0x00,0x80,0x00, 0x20]);
    await expectOK();
    await send([0x50, 0x20]); await expectOK();

    // ── 5. Escribir páginas de 128 bytes ─────────────────────────────────
    const PAGE = 128, total = Math.ceil(binary.length / PAGE);
    for (let p = 0; p < total; p++) {
      const off = p * PAGE;
      const chunk = new Uint8Array(PAGE).fill(0xff);
      chunk.set(binary.slice(off, off + PAGE));
      const wa = off / 2;
      log('Página ' + (p + 1) + '/' + total + ' (' + Math.round((p + 1) / total * 100) + '%)...');
      await send([0x55, wa & 0xff, (wa >> 8) & 0xff, 0x20]); await expectOK();
      await send([0x64, 0x00, PAGE, 0x46, ...chunk, 0x20]);   await expectOK(5000);
    }

    // ── 6. Salir del modo programación ────────────────────────────────────
    await send([0x51, 0x20]); await expectOK();
    await close();

    log('✅ Firmware restaurado.');
    alert('✅ Firmware restaurado correctamente.\n\n¡El robot volvió al modo En Vivo / IA!');

  } catch (err) {
    console.error('[RestaurarFirmware]', err);
    try { await close(); } catch (_) {}
    alert('❌ Error al restaurar el firmware:\n\n' + err.message + '\n\nRevisá la consola del navegador para más detalles.');
  }
}
}
Scratch.extensions.register(new RecPcb1Arduino()); })(Scratch);