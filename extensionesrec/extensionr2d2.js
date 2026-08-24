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
    note_do: 'DO (C4)',
    note_re: 'RE (D4)',
    note_mi: 'MI (E4)',
    note_fa: 'FA (F4)',
    note_sol: 'SOL (G4)',
    note_la: 'LA (A4)',
    note_si: 'SI (B4)',
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
    note_do: 'C (C4)',
    note_re: 'D (D4)',
    note_mi: 'E (E4)',
    note_fa: 'F (F4)',
    note_sol: 'G (G4)',
    note_la: 'A (A4)',
    note_si: 'B (B4)',
    state_on: 'ON',
    state_off: 'OFF'
  },
  pt: {
    ext_title: 'Robô R2D2 (Bluetooth-USB)',
    r2d2_loaded_msg: 'Robô R2D2 (Bluetooth-USB) carregado! Procure os blocos no final da paleta esquerda 👇',
    btn_connect: 'Conectar Robô',
    btn_reset_port: '🔄 Reiniciar Porta',
    msg_reset_success: 'Porta liberada e reiniciada com sucesso!',
    check_connection: 'Verificar Conexão',
    block_move_motor: 'Mover motor [SIDE] para [DIR] a [PCT]%',
    motor_dir_fwd: 'FRENTE',
    motor_dir_bwd: 'TRÁS',
    block_stop_motor: 'Parar motor [WHICH]',
    motor_der: 'Motor A / Direito',
    motor_izq: 'Motor B / Esquerdo',
    motor_cab: 'Motor C / Cabeça',
    stop_all: 'TODOS',
    block_girar_cabeza: 'Girar Cabeça [DIR] a [PCT]%',
    block_set_neon: 'Ligar Neon [STATE]',
    block_set_burbujas: 'Ativar Borbulhador [STATE]',
    block_play_note: 'Tocar nota [NOTE] por [MS] ms',
    note_do: 'DÓ (C4)',
    note_re: 'RÉ (D4)',
    note_mi: 'MI (E4)',
    note_fa: 'FÁ (F4)',
    note_sol: 'SOL (G4)',
    note_la: 'LÁ (A4)',
    note_si: 'SI (B4)',
    state_on: 'LIGADO',
    state_off: 'DESLIGADO'
  },
  fr: {
    ext_title: 'Robot R2D2 (Bluetooth-USB)',
    r2d2_loaded_msg: 'Robot R2D2 (Bluetooth-USB) chargé ! Cherchez les blocs en bas de la palette de gauche 👇',
    btn_connect: 'Connecter le Robot',
    btn_reset_port: '🔄 Réinitialiser le Port',
    msg_reset_success: 'Port réinitialisé et libéré avec succès !',
    check_connection: 'Vérifier la Connexion',
    block_move_motor: 'Déplacer le moteur [SIDE] vers [DIR] à [PCT]%',
    motor_dir_fwd: 'AVANT',
    motor_dir_bwd: 'ARRIÈRE',
    block_stop_motor: 'Arrêter le moteur [WHICH]',
    motor_der: 'Moteur A / Droit',
    motor_izq: 'Moteur B / Gauche',
    motor_cab: 'Moteur C / Tête',
    stop_all: 'TOUS',
    block_girar_cabeza: 'Tourner la Tête [DIR] à [PCT]%',
    block_set_neon: 'Allumer le Néon [STATE]',
    block_set_burbujas: 'Activer les Bulles [STATE]',
    block_play_note: 'Jouer la note [NOTE] pendant [MS] ms',
    note_do: 'DO (C4)',
    note_re: 'RÉ (D4)',
    note_mi: 'MI (E4)',
    note_fa: 'FA (F4)',
    note_sol: 'SOL (G4)',
    note_la: 'LA (A4)',
    note_si: 'SI (B4)',
    state_on: 'ALLUMÉ',
    state_off: 'ÉTEINT'
  },
  de: {
    ext_title: 'R2D2 Roboter (Bluetooth-USB)',
    r2d2_loaded_msg: 'R2D2 Roboter (Bluetooth-USB) geladen! Suche die Blöcke am Ende der linken Palette 👇',
    btn_connect: 'Roboter Verbinden',
    btn_reset_port: '🔄 Port Zurücksetzen',
    msg_reset_success: 'Port erfolgreich zurückgesetzt und freigegeben!',
    check_connection: 'Verbindung Prüfen',
    block_move_motor: 'Motor [SIDE] [DIR] mit [PCT]% bewegen',
    motor_dir_fwd: 'VORWÄRTS',
    motor_dir_bwd: 'RÜCKWÄRTS',
    block_stop_motor: 'Motor [WHICH] stoppen',
    motor_der: 'Motor A / Rechts',
    motor_izq: 'Motor B / Links',
    motor_cab: 'Motor C / Kopf',
    stop_all: 'ALLE',
    block_girar_cabeza: 'Kopf [DIR] mit [PCT]% drehen',
    block_set_neon: 'Neonlicht [STATE] einschalten',
    block_set_burbujas: 'Blasenmaschine [STATE] aktivieren',
    block_play_note: 'Note [NOTE] für [MS] ms spielen',
    note_do: 'C (C4)',
    note_re: 'D (D4)',
    note_mi: 'E (E4)',
    note_fa: 'F (F4)',
    note_sol: 'G (G4)',
    note_la: 'A (A4)',
    note_si: 'H (B4)',
    state_on: 'AN',
    state_off: 'AUS'
  },
  it: {
    ext_title: 'Robot R2D2 (Bluetooth-USB)',
    r2d2_loaded_msg: 'Robot R2D2 (Bluetooth-USB) caricato! Cerca i blocchi in fondo alla tavolozza sinistra 👇',
    btn_connect: 'Connetti Robot',
    btn_reset_port: '🔄 Reimposta Porta',
    msg_reset_success: 'Porta liberata e reimpostata con successo!',
    check_connection: 'Controlla Connessione',
    block_move_motor: 'Muovi motore [SIDE] verso [DIR] al [PCT]%',
    motor_dir_fwd: 'AVANTI',
    motor_dir_bwd: 'INDIETRO',
    block_stop_motor: 'Ferma motore [WHICH]',
    motor_der: 'Motore A / Destro',
    motor_izq: 'Motore B / Sinistro',
    motor_cab: 'Motore C / Testa',
    stop_all: 'TUTTI',
    block_girar_cabeza: 'Girare Testa [DIR] al [PCT]%',
    block_set_neon: 'Accendere Neon [STATE]',
    block_set_burbujas: 'Attivare Bolle [STATE]',
    block_play_note: 'Suonare nota [NOTE] per [MS] ms',
    note_do: 'DO (C4)',
    note_re: 'RE (D4)',
    note_mi: 'MI (E4)',
    note_fa: 'FA (F4)',
    note_sol: 'SOL (G4)',
    note_la: 'LA (A4)',
    note_si: 'SI (B4)',
    state_on: 'ACCESO',
    state_off: 'SPENTO'
  },
  zh: {
    ext_title: 'R2D2 机器人（Bluetooth-USB）',
    r2d2_loaded_msg: 'R2D2 机器人（Bluetooth-USB）已加载！在左侧积木栏底部查找积木 👇',
    btn_connect: '连接机器人',
    btn_reset_port: '🔄 重置端口',
    msg_reset_success: '端口已成功重置并释放！',
    check_connection: '检查连接',
    block_move_motor: '以 [PCT]% 将 [SIDE] 电机向 [DIR] 移动',
    motor_dir_fwd: '前进',
    motor_dir_bwd: '后退',
    block_stop_motor: '停止 [WHICH] 电机',
    motor_der: '电机 A / 右侧',
    motor_izq: '电机 B / 左侧',
    motor_cab: '电机 C / 头部',
    stop_all: '全部',
    block_girar_cabeza: '以 [PCT]% 转动头部 [DIR]',
    block_set_neon: '打开霓虹灯 [STATE]',
    block_set_burbujas: '启动泡泡机 [STATE]',
    block_play_note: '以 [NOTE] 音符播放 [MS] 毫秒',
    note_do: 'C (C4)',
    note_re: 'D (D4)',
    note_mi: 'E (E4)',
    note_fa: 'F (F4)',
    note_sol: 'G (G4)',
    note_la: 'A (A4)',
    note_si: 'B (B4)',
    state_on: '开',
    state_off: '关'
  },
  ja: {
    ext_title: 'R2D2ロボット（Bluetooth-USB）',
    r2d2_loaded_msg: 'R2D2ロボット（Bluetooth-USB）が読み込まれました！左のパレットの一番下にブロックがあります 👇',
    btn_connect: 'ロボットを接続',
    btn_reset_port: '🔄 ポートをリセット',
    msg_reset_success: 'ポートが正常にリセットされ解放されました！',
    check_connection: '接続を確認',
    block_move_motor: '[SIDE] モーターを [PCT]% で [DIR]',
    motor_dir_fwd: '前進',
    motor_dir_bwd: '後退',
    block_stop_motor: '[WHICH] モーターを停止する',
    motor_der: 'モーター A / 右',
    motor_izq: 'モーター B / 左',
    motor_cab: 'モーター C / 頭',
    stop_all: 'すべて',
    block_girar_cabeza: '頭を [PCT]% で [DIR] 回転させる',
    block_set_neon: 'ネオンライトを [STATE] にする',
    block_set_burbujas: 'バブルマシンを [STATE] にする',
    block_play_note: '音符 [NOTE] を [MS] ミリ秒鳴らす',
    note_do: 'ド (C4)',
    note_re: 'レ (D4)',
    note_mi: 'ミ (E4)',
    note_fa: 'ファ (F4)',
    note_sol: 'ソ (G4)',
    note_la: 'ラ (A4)',
    note_si: 'シ (B4)',
    state_on: 'オン',
    state_off: 'オフ'
  },
  ko: {
    ext_title: 'R2D2 로봇(Bluetooth-USB)',
    r2d2_loaded_msg: 'R2D2 로봇(Bluetooth-USB)이(가) 로드되었습니다! 왼쪽 팔레트 하단에서 블록을 찾으세요 👇',
    btn_connect: '로봇 연결',
    btn_reset_port: '🔄 포트 재설정',
    msg_reset_success: '포트가 성공적으로 재설정되고 해제되었습니다!',
    check_connection: '연결 확인',
    block_move_motor: '[SIDE] 모터를 [PCT]%로 [DIR]',
    motor_dir_fwd: '전진',
    motor_dir_bwd: '후진',
    block_stop_motor: '[WHICH] 모터 정지',
    motor_der: '모터 A / 오른쪽',
    motor_izq: '모터 B / 왼쪽',
    motor_cab: '모터 C / 머리',
    stop_all: '전체',
    block_girar_cabeza: '머리를 [PCT]%로 [DIR] 회전',
    block_set_neon: '네온 조명 [STATE]',
    block_set_burbujas: '버블 머신 [STATE]',
    block_play_note: '음 [NOTE] 를 [MS] ms 동안 연주',
    note_do: '도 (C4)',
    note_re: '레 (D4)',
    note_mi: '미 (E4)',
    note_fa: '파 (F4)',
    note_sol: '솔 (G4)',
    note_la: '라 (A4)',
    note_si: '시 (B4)',
    state_on: '켜짐',
    state_off: '꺼짐'
  },
  ru: {
    ext_title: 'Робот R2D2 (Bluetooth-USB)',
    r2d2_loaded_msg: 'Робот R2D2 (Bluetooth-USB) загружен! Ищи блоки внизу левой палитры 👇',
    btn_connect: 'Подключить робота',
    btn_reset_port: '🔄 Сбросить порт',
    msg_reset_success: 'Порт успешно сброшен и освобожден!',
    check_connection: 'Проверить подключение',
    block_move_motor: 'Двигать мотор [SIDE] [DIR] на [PCT]%',
    motor_dir_fwd: 'ВПЕРЁД',
    motor_dir_bwd: 'НАЗАД',
    block_stop_motor: 'Остановить мотор [WHICH]',
    motor_der: 'Мотор A / Правый',
    motor_izq: 'Мотор B / Левый',
    motor_cab: 'Мотор C / Голова',
    stop_all: 'ВСЕ',
    block_girar_cabeza: 'Повернуть голову [DIR] на [PCT]%',
    block_set_neon: 'Включить неон [STATE]',
    block_set_burbujas: 'Включить пузырьковую машину [STATE]',
    block_play_note: 'играть ноту [NOTE] [MS] мс',
    note_do: 'ДО (C4)',
    note_re: 'РЕ (D4)',
    note_mi: 'МИ (E4)',
    note_fa: 'ФА (F4)',
    note_sol: 'СОЛЬ (G4)',
    note_la: 'ЛЯ (A4)',
    note_si: 'СИ (B4)',
    state_on: 'ВКЛ',
    state_off: 'ВЫКЛ'
  },
  ar: {
    ext_title: 'روبوت R2D2 (Bluetooth-USB)',
    r2d2_loaded_msg: 'تم تحميل روبوت R2D2 (Bluetooth-USB)! ابحث عن الكتل في أسفل اللوحة اليسرى 👇',
    btn_connect: 'توصيل الروبوت',
    btn_reset_port: '🔄 إعادة ضبط المنفذ',
    msg_reset_success: 'تمت إعادة ضبط المنفذ وتحريره بنجاح!',
    check_connection: 'التحقق من الاتصال',
    block_move_motor: 'تحريك المحرك [SIDE] نحو [DIR] بنسبة [PCT]%',
    motor_dir_fwd: 'للأمام',
    motor_dir_bwd: 'للخلف',
    block_stop_motor: 'إيقاف المحرك [WHICH]',
    motor_der: 'المحرك A / يمين',
    motor_izq: 'المحرك B / يسار',
    motor_cab: 'المحرك C / الرأس',
    stop_all: 'الكل',
    block_girar_cabeza: 'تدوير الرأس [DIR] بنسبة [PCT]%',
    block_set_neon: 'تشغيل النيون [STATE]',
    block_set_burbujas: 'تفعيل آلة الفقاعات [STATE]',
    block_play_note: 'عزف نوتة [NOTE] لمدة [MS] مللي ثانية',
    note_do: 'دو (C4)',
    note_re: 'ري (D4)',
    note_mi: 'مي (E4)',
    note_fa: 'فا (F4)',
    note_sol: 'صول (G4)',
    note_la: 'لا (A4)',
    note_si: 'سي (B4)',
    state_on: 'يعمل',
    state_off: 'متوقف'
  },
  hi: {
    ext_title: 'R2D2 रोबोट (Bluetooth-USB)',
    r2d2_loaded_msg: 'R2D2 रोबोट (Bluetooth-USB) लोड हो गया है! बाएँ पैलेट के नीचे ब्लॉक खोजें 👇',
    btn_connect: 'रोबोट कनेक्ट करें',
    btn_reset_port: '🔄 पोर्ट रीसेट करें',
    msg_reset_success: 'पोर्ट सफलतापूर्वक रीसेट और मुक्त कर दिया गया!',
    check_connection: 'कनेक्शन जांचें',
    block_move_motor: '[SIDE] मोटर को [PCT]% पर [DIR]',
    motor_dir_fwd: 'आगे',
    motor_dir_bwd: 'पीछे',
    block_stop_motor: '[WHICH] मोटर रोकें',
    motor_der: 'मोटर A / दायाँ',
    motor_izq: 'मोटर B / बायाँ',
    motor_cab: 'मोटर C / सिर',
    stop_all: 'सभी',
    block_girar_cabeza: 'सिर को [PCT]% पर [DIR] घुमाएं',
    block_set_neon: 'नियॉन लाइट [STATE] करें',
    block_set_burbujas: 'बबल मशीन [STATE] करें',
    block_play_note: '[NOTE] नोट को [MS] मिलीसेकंड तक बजाएं',
    note_do: 'डो (C4)',
    note_re: 'रे (D4)',
    note_mi: 'मी (E4)',
    note_fa: 'फा (F4)',
    note_sol: 'सोल (G4)',
    note_la: 'ला (A4)',
    note_si: 'सी (B4)',
    state_on: 'चालू',
    state_off: 'बंद'
  },
  tr: {
    ext_title: 'R2D2 Robot (Bluetooth-USB)',
    r2d2_loaded_msg: 'R2D2 Robot (Bluetooth-USB) yüklendi! Blokları sol paletin altında arayın 👇',
    btn_connect: 'Robotu Bağla',
    btn_reset_port: '🔄 Portu Sıfırla',
    msg_reset_success: 'Port başarıyla sıfırlandı ve serbest bırakıldı!',
    check_connection: 'Bağlantıyı Kontrol Et',
    block_move_motor: '[SIDE] motorunu [PCT]% ile [DIR] hareket ettir',
    motor_dir_fwd: 'İLERİ',
    motor_dir_bwd: 'GERİ',
    block_stop_motor: '[WHICH] motorunu durdur',
    motor_der: 'Motor A / Sağ',
    motor_izq: 'Motor B / Sol',
    motor_cab: 'Motor C / Kafa',
    stop_all: 'TÜMÜ',
    block_girar_cabeza: 'Kafayı [PCT]% ile [DIR] döndür',
    block_set_neon: 'Neon Işığını [STATE] yap',
    block_set_burbujas: 'Kabarcık Makinesini [STATE] yap',
    block_play_note: '[NOTE] notasını [MS] ms çal',
    note_do: 'DO (C4)',
    note_re: 'RE (D4)',
    note_mi: 'Mİ (E4)',
    note_fa: 'FA (F4)',
    note_sol: 'SOL (G4)',
    note_la: 'LA (A4)',
    note_si: 'Sİ (B4)',
    state_on: 'AÇIK',
    state_off: 'KAPALI'
  },
  pl: {
    ext_title: 'Robot R2D2 (Bluetooth-USB)',
    r2d2_loaded_msg: 'Robot R2D2 (Bluetooth-USB) załadowany! Szukaj bloków na dole lewej palety 👇',
    btn_connect: 'Połącz Robota',
    btn_reset_port: '🔄 Zresetuj Port',
    msg_reset_success: 'Port pomyślnie zresetowany i zwolniony!',
    check_connection: 'Sprawdź Połączenie',
    block_move_motor: 'Poruszaj silnikiem [SIDE] w kierunku [DIR] przy [PCT]%',
    motor_dir_fwd: 'DO PRZODU',
    motor_dir_bwd: 'DO TYŁU',
    block_stop_motor: 'Zatrzymaj silnik [WHICH]',
    motor_der: 'Silnik A / Prawy',
    motor_izq: 'Silnik B / Lewy',
    motor_cab: 'Silnik C / Głowa',
    stop_all: 'WSZYSTKIE',
    block_girar_cabeza: 'Obróć Głowę [DIR] przy [PCT]%',
    block_set_neon: 'Włącz Neon [STATE]',
    block_set_burbujas: 'Włącz Bańki [STATE]',
    block_play_note: 'Zagraj nutę [NOTE] przez [MS] ms',
    note_do: 'DO (C4)',
    note_re: 'RE (D4)',
    note_mi: 'MI (E4)',
    note_fa: 'FA (F4)',
    note_sol: 'SOL (G4)',
    note_la: 'LA (A4)',
    note_si: 'SI (B4)',
    state_on: 'WŁĄCZONY',
    state_off: 'WYŁĄCZONY'
  },
  nl: {
    ext_title: 'R2D2 Robot (Bluetooth-USB)',
    r2d2_loaded_msg: 'R2D2 Robot (Bluetooth-USB) geladen! Zoek de blokken onderaan het linkerpalet 👇',
    btn_connect: 'Robot Verbinden',
    btn_reset_port: '🔄 Poort Resetten',
    msg_reset_success: 'Poort succesvol gereset en vrijgegeven!',
    check_connection: 'Verbinding Controleren',
    block_move_motor: 'Motor [SIDE] [DIR] bewegen met [PCT]%',
    motor_dir_fwd: 'VOORUIT',
    motor_dir_bwd: 'ACHTERUIT',
    block_stop_motor: 'Motor [WHICH] stoppen',
    motor_der: 'Motor A / Rechts',
    motor_izq: 'Motor B / Links',
    motor_cab: 'Motor C / Hoofd',
    stop_all: 'ALLES',
    block_girar_cabeza: 'Hoofd [DIR] draaien met [PCT]%',
    block_set_neon: 'Neonlicht [STATE] zetten',
    block_set_burbujas: 'Bellenmachine [STATE] zetten',
    block_play_note: 'Noot [NOTE] spelen voor [MS] ms',
    note_do: 'C (C4)',
    note_re: 'D (D4)',
    note_mi: 'E (E4)',
    note_fa: 'F (F4)',
    note_sol: 'G (G4)',
    note_la: 'A (A4)',
    note_si: 'B (B4)',
    state_on: 'AAN',
    state_off: 'UIT'
  },
  bn: {
    ext_title: 'R2D2 রোবট (Bluetooth-USB)',
    r2d2_loaded_msg: 'R2D2 রোবট (Bluetooth-USB) লোড হয়েছে! বাম প্যালেটের নিচে ব্লকগুলি খুঁজুন 👇',
    btn_connect: 'রোবট সংযুক্ত করুন',
    btn_reset_port: '🔄 পোর্ট রিসেট করুন',
    msg_reset_success: 'পোর্ট সফলভাবে রিসেট এবং মুক্ত করা হয়েছে!',
    check_connection: 'সংযোগ পরীক্ষা করুন',
    block_move_motor: '[SIDE] মোটরকে [PCT]% এ [DIR] সরান',
    motor_dir_fwd: 'সামনে',
    motor_dir_bwd: 'পিছনে',
    block_stop_motor: '[WHICH] মোটর থামান',
    motor_der: 'মোটর A / ডান',
    motor_izq: 'মোটর B / বাম',
    motor_cab: 'মোটর C / মাথা',
    stop_all: 'সব',
    block_girar_cabeza: 'মাথা [PCT]% এ [DIR] ঘোরান',
    block_set_neon: 'নিয়ন লাইট [STATE] করুন',
    block_set_burbujas: 'বুদবুদ মেশিন [STATE] করুন',
    block_play_note: '[NOTE] নোট [MS] মিলিসেকেন্ড বাজান',
    note_do: 'ডো (C4)',
    note_re: 'রে (D4)',
    note_mi: 'মি (E4)',
    note_fa: 'ফা (F4)',
    note_sol: 'সল (G4)',
    note_la: 'লা (A4)',
    note_si: 'সি (B4)',
    state_on: 'চালু',
    state_off: 'বন্ধ'
  },
  id: {
    ext_title: 'Robot R2D2 (Bluetooth-USB)',
    r2d2_loaded_msg: 'Robot R2D2 (Bluetooth-USB) dimuat! Cari blok di bagian bawah palet kiri 👇',
    btn_connect: 'Hubungkan Robot',
    btn_reset_port: '🔄 Reset Port',
    msg_reset_success: 'Port berhasil direset dan dilepaskan!',
    check_connection: 'Periksa Koneksi',
    block_move_motor: 'Gerakkan motor [SIDE] ke [DIR] pada [PCT]%',
    motor_dir_fwd: 'MAJU',
    motor_dir_bwd: 'MUNDUR',
    block_stop_motor: 'Hentikan motor [WHICH]',
    motor_der: 'Motor A / Kanan',
    motor_izq: 'Motor B / Kiri',
    motor_cab: 'Motor C / Kepala',
    stop_all: 'SEMUA',
    block_girar_cabeza: 'Putar Kepala [DIR] pada [PCT]%',
    block_set_neon: 'Nyalakan Neon [STATE]',
    block_set_burbujas: 'Aktifkan Mesin Gelembung [STATE]',
    block_play_note: 'Mainkan nada [NOTE] selama [MS] ms',
    note_do: 'DO (C4)',
    note_re: 'RE (D4)',
    note_mi: 'MI (E4)',
    note_fa: 'FA (F4)',
    note_sol: 'SOL (G4)',
    note_la: 'LA (A4)',
    note_si: 'SI (B4)',
    state_on: 'NYALA',
    state_off: 'MATI'
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

  const rawLocale = window.currentRecLocale || 'es';
  const lang = rawLocale.split(/[-_]/)[0].toLowerCase();
  const dict = I18N_BLOCKS[lang] || I18N_BLOCKS['es'];
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

    const rawLocale = window.currentRecLocale || (this.runtime && this.runtime.currentLocale) || 'es';
    const lang = rawLocale.split(/[-_]/)[0].toLowerCase();
    const t = key => (I18N_BLOCKS[lang] && I18N_BLOCKS[lang][key]) || (I18N_BLOCKS['es'] && I18N_BLOCKS['es'][key]) || key;
    return {
      id: 'recr2d2arduino',
      name: t('ext_title'),
      color1: '#800020',
      color2: '#660019',
      color3: '#4d0013',
      blocks: [
        { func: 'connectRobot', blockType: Scratch.BlockType.BUTTON, text: t('btn_connect'), callFunc: this.connectRobot.bind(this) },
        { func: 'resetPort', blockType: Scratch.BlockType.BUTTON, text: t('btn_reset_port'), callFunc: this.resetPort.bind(this) },
        { opcode: 'checkConnection', blockType: Scratch.BlockType.REPORTER, text: t('check_connection') },
        '---',
        {
          opcode: 'moveMotor',
          blockType: Scratch.BlockType.COMMAND,
          text: t('block_move_motor'),
          arguments: {
            SIDE: { type: Scratch.ArgumentType.STRING, menu: 'motorSide', defaultValue: 'DER' },
            DIR:  { type: Scratch.ArgumentType.STRING, menu: 'motorDir', defaultValue: 'FWD' },
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
        {
          opcode: 'girarCabeza',
          blockType: Scratch.BlockType.COMMAND,
          text: t('block_girar_cabeza'),
          arguments: {
            DIR: { type: Scratch.ArgumentType.STRING, menu: 'motorDir', defaultValue: 'FWD' },
            PCT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
          }
        },
        '---',
        {
          opcode: 'setNeon',
          blockType: Scratch.BlockType.COMMAND,
          text: t('block_set_neon'),
          arguments: {
            STATE: { type: Scratch.ArgumentType.STRING, menu: 'stateOnOff', defaultValue: '1' }
          }
        },
        {
          opcode: 'setBurbujas',
          blockType: Scratch.BlockType.COMMAND,
          text: t('block_set_burbujas'),
          arguments: {
            STATE: { type: Scratch.ArgumentType.STRING, menu: 'stateOnOff', defaultValue: '1' }
          }
        },
        '---',
        {
          opcode: 'playNote',
          blockType: Scratch.BlockType.COMMAND,
          text: t('block_play_note'),
          arguments: {
            NOTE: { type: Scratch.ArgumentType.NUMBER, menu: 'musicalNotes', defaultValue: 262 },
            MS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 500 }
          }
        }
      ],
      menus: {
        motorSide: {
          items: [
            { text: t('motor_der'), value: 'DER' },
            { text: t('motor_izq'), value: 'IZQ' },
            { text: t('motor_cab'), value: 'CAB' },
            { text: t('stop_all'), value: 'AMBOS' }
          ]
        },
        motorDir: { items: [{ text: t('motor_dir_fwd'), value: 'FWD' }, { text: t('motor_dir_bwd'), value: 'BWD' }] },
        stopWhich: {
          items: [
            { text: t('motor_der'), value: 'DER' },
            { text: t('motor_izq'), value: 'IZQ' },
            { text: t('motor_cab'), value: 'CAB' },
            { text: t('stop_all'), value: 'AMBOS' }
          ]
        },
        stateOnOff: {
          items: [
            { text: t('state_on'), value: '1' },
            { text: t('state_off'), value: '0' }
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
            { text: t('note_si'), value: '494' }
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
      const rawLocale = window.currentRecLocale || 'es';
      const lang = rawLocale.split(/[-_]/)[0].toLowerCase();
      const t = key => (I18N_BLOCKS[lang] && I18N_BLOCKS[lang][key]) || I18N_BLOCKS['es'][key] || key;
      alert(t('msg_reset_success'));
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
