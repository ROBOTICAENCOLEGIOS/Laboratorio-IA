/**

 * IA: Señales de Tránsito - RoboticaEnColegios R.E.C.

 * Clasifica señales viales con Teachable Machine (modelo online en GitHub CDN).

 * Cámara centralizada vía window.RECCamera (recCamera.js).

 * NOTA: mirror=false para que los textos de las señales (ej: STOP) no se inviertan.

 */

(function (Scratch) {

  'use strict';



  if (!Scratch.extensions.unsandboxed) {

    throw new Error('Debe ejecutarse en modo unsandboxed.');

  }



  const I18N_BLOCKS = {

    es: {

      ext_title: 'IA Señales de Tránsito',

      block_load_model: '☁️ CARGAR MODELO ONLINE',

      block_camera_on: '📷 encender cámara en modo: [MODO]',

      block_camera_off: '❌ APAGAR CÁMARA',

      block_signal: 'señal detectada',

      block_confidence: 'exactitud %',

      block_is_stable: '¿ve [SIG] al [CONF]% por [TIME] seg?',

      menu_mode_draggable: 'FLOTANTE ARRASTRABLE',

      menu_mode_background: 'FONDO DE ESCENARIO (REALIDAD AUMENTADA)',

      sign_avanzar: 'AVANZAR',

      sign_retroceder: 'RETROCEDER',

      sign_stop: 'STOP',

      sign_despacio: 'DESPACIO',

      sign_izquierda: 'IZQUIERDA',

      sign_derecha: 'DERECHA',

      status_ready: 'LISTO: CARGA EL MODELO',

      status_downloading: 'DESCARGANDO CEREBRO...',

      status_loaded: 'MODELO CARGADO OK',

      status_error: 'ERROR AL DESCARGAR',

      status_camera_off: 'CÁMARA APAGADA',

      status_nothing: 'NADA'

    },

    en: {

      ext_title: 'AI Traffic Signs',

      block_load_model: '☁️ LOAD ONLINE MODEL',

      block_camera_on: '📷 turn camera on in mode: [MODO]',

      block_camera_off: '❌ TURN OFF CAMERA',

      block_signal: 'detected signal',

      block_confidence: 'accuracy %',

      block_is_stable: 'sees [SIG] at [CONF]% for [TIME] sec?',

      menu_mode_draggable: 'FLOATING DRAGGABLE',

      menu_mode_background: 'STAGE BACKGROUND (AUGMENTED REALITY)',

      sign_avanzar: 'FORWARD',

      sign_retroceder: 'BACKWARD',

      sign_stop: 'STOP',

      sign_despacio: 'SLOW',

      sign_izquierda: 'LEFT',

      sign_derecha: 'RIGHT',

      status_ready: 'READY: LOAD MODEL',

      status_downloading: 'DOWNLOADING BRAIN...',

      status_loaded: 'MODEL LOADED OK',

      status_error: 'DOWNLOAD ERROR',

      status_camera_off: 'CAMERA OFF',

      status_nothing: 'NONE'

    },

    pt: {

      ext_title: 'IA Sinais de Trânsito',

      block_load_model: '☁️ CARREGAR MODELO ONLINE',

      block_camera_on: '📷 ligar câmera no modo: [MODO]',

      block_camera_off: '❌ DESLIGAR CÂMERA',

      block_signal: 'sinal detectado',

      block_confidence: 'precisão %',

      block_is_stable: 'vê [SIG] a [CONF]% por [TIME] seg?',

      menu_mode_draggable: 'FLUTUANTE ARRASTÁVEL',

      menu_mode_background: 'FUNDO DO PALCO (REALIDADE AUMENTADA)',

      sign_avanzar: 'AVANÇAR',

      sign_retroceder: 'RECUAR',

      sign_stop: 'PARAR',

      sign_despacio: 'DEVAGAR',

      sign_izquierda: 'ESQUERDA',

      sign_derecha: 'DIREITA',

      status_ready: 'PRONTO: CARREGUE O MODELO',

      status_downloading: 'BAIXANDO CÉREBRO...',

      status_loaded: 'MODELO CARREGADO OK',

      status_error: 'ERRO AO BAIXAR',

      status_camera_off: 'CÂMERA DESLIGADA',

      status_nothing: 'NADA'

    },

    fr: {

      ext_title: 'IA Panneaux de Signalisation',

      block_load_model: '☁️ CHARGER MODÈLE EN LIGNE',

      block_camera_on: '📷 allumer caméra en mode: [MODO]',

      block_camera_off: '❌ ÉTEINDRE CAMÉRA',

      block_signal: 'signal détecté',

      block_confidence: 'précision %',

      block_is_stable: 'voit [SIG] à [CONF]% pendant [TIME] sec?',

      menu_mode_draggable: 'FLOTTANT DÉPLAÇABLE',

      menu_mode_background: 'FOND DE SCÈNE (RÉALITÉ AUGMENTÉE)',

      sign_avanzar: 'AVANCER',

      sign_retroceder: 'RECULER',

      sign_stop: 'STOP',

      sign_despacio: 'LENT',

      sign_izquierda: 'GAUCHE',

      sign_derecha: 'DROITE',

      status_ready: 'PRÊT: CHARGER LE MODÈLE',

      status_downloading: 'TÉLÉCHARGEMENT CERVEAU...',

      status_loaded: 'MODÈLE CHARGÉ OK',

      status_error: 'ERREUR DE TÉLÉCHARGEMENT',

      status_camera_off: 'CAMÉRA ÉTEINTE',

      status_nothing: 'RIEN'

    },

    de: {

      ext_title: 'KI Verkehrsschilder',

      block_load_model: '☁️ ONLINE MODELL LADEN',

      block_camera_on: '📷 Kamera einschalten im Modus: [MODO]',

      block_camera_off: '❌ KAMERA AUSSCHALTEN',

      block_signal: 'erkanntes Schild',

      block_confidence: 'Genauigkeit %',

      block_is_stable: 'sieht [SIG] bei [CONF]% für [TIME] sek?',

      menu_mode_draggable: 'SCHWEBEND VERSCHIEBBAR',

      menu_mode_background: 'BÜHNENHINTERGRUND (ERWEITERTE REALITÄT)',

      sign_avanzar: 'VORWÄRTS',

      sign_retroceder: 'RÜCKWÄRTS',

      sign_stop: 'STOP',

      sign_despacio: 'LANGSAM',

      sign_izquierda: 'LINKS',

      sign_derecha: 'RECHTS',

      status_ready: 'BEREIT: MODELL LADEN',

      status_downloading: 'GEHIRN WIRD GELADEN...',

      status_loaded: 'MODELL GELADEN OK',

      status_error: 'LADFEHLER',

      status_camera_off: 'KAMERA AUS',

      status_nothing: 'NICHTS'

    },

    it: {

      ext_title: 'IA Segnali Stradali',

      block_load_model: '☁️ CARICA MODELLO ONLINE',

      block_camera_on: '📷 accendi telecamera in modalità: [MODO]',

      block_camera_off: '❌ SPEGNI TELECAMERA',

      block_signal: 'segnale rilevato',

      block_confidence: 'accuratezza %',

      block_is_stable: 'vede [SIG] al [CONF]% per [TIME] sec?',

      menu_mode_draggable: 'FLUTTUANTE TRASCINABILE',

      menu_mode_background: 'SFONDO PALCOSCENICO (REALTÀ AUMENTATA)',

      sign_avanzar: 'AVANTI',

      sign_retroceder: 'INDIETRO',

      sign_stop: 'STOP',

      sign_despacio: 'LENTO',

      sign_izquierda: 'SINISTRA',

      sign_derecha: 'DESTRA',

      status_ready: 'PRONTO: CARICA MODELLO',

      status_downloading: 'SCARICAMENTO CERVELLO...',

      status_loaded: 'MODELLO CARICATO OK',

      status_error: 'ERRORE SCARICAMENTO',

      status_camera_off: 'TELECAMERA SPENTA',

      status_nothing: 'NULLA'

    },

    zh: {

      ext_title: 'AI 交通标志',

      block_load_model: '☁️ 加载在线模型',

      block_camera_on: '📷 以模式开启摄像头: [MODO]',

      block_camera_off: '❌ 关闭摄像头',

      block_signal: '检测到的信号',

      block_confidence: '准确度 %',

      block_is_stable: '看到[SIG]在[CONF]%持续[TIME]秒?',

      menu_mode_draggable: '浮动可拖动',

      menu_mode_background: '舞台背景 (增强现实)',

      sign_avanzar: '前进',

      sign_retroceder: '后退',

      sign_stop: '停止',

      sign_despacio: '慢行',

      sign_izquierda: '左转',

      sign_derecha: '右转',

      status_ready: '就绪: 加载模型',

      status_downloading: '下载大脑中...',

      status_loaded: '模型加载完成',

      status_error: '下载错误',

      status_camera_off: '摄像头关闭',

      status_nothing: '无'

    },

    ja: {

      ext_title: 'AI 交通標識',

      block_load_model: '☁️ オンモデルをロード',

      block_camera_on: '📷 カメラをモードでオン: [MODO]',

      block_camera_off: '❌ カメラをオフにする',

      block_signal: '検出された信号',

      block_confidence: '精度 %',

      block_is_stable: '[SIG]を[CONF]%で[TIME]秒見ている?',

      menu_mode_draggable: 'フローティングドラッグ可能',

      menu_mode_background: 'ステージ背景 (拡張現実)',

      sign_avanzar: '前進',

      sign_retroceder: '後退',

      sign_stop: '停止',

      sign_despacio: '徐行',

      sign_izquierda: '左折',

      sign_derecha: '右折',

      status_ready: '準備完了: モデルをロード',

      status_downloading: '脳をダウンロード中...',

      status_loaded: 'モデルロード完了',

      status_error: 'ダウンロードエラー',

      status_camera_off: 'カメラオフ',

      status_nothing: 'なし'

    },

    ko: {

      ext_title: 'AI 교통 표지판',

      block_load_model: '☁️ 온라인 모델 로드',

      block_camera_on: '📷 모드로 카메라 켜기: [MODO]',

      block_camera_off: '❌ 카메라 끄기',

      block_signal: '감지된 신호',

      block_confidence: '정확도 %',

      block_is_stable: '[SIG]를[CONF]%로[TIME]초 보는가?',

      menu_mode_draggable: '플로팅 드래그 가능',

      menu_mode_background: '스테이지 배경 (증강 현실)',

      sign_avanzar: '전진',

      sign_retroceder: '후진',

      sign_stop: '정지',

      sign_despacio: '서행',

      sign_izquierda: '좌회전',

      sign_derecha: '우회전',

      status_ready: '준비: 모델 로드',

      status_downloading: '뇌 다운로드 중...',

      status_loaded: '모델 로드 완료',

      status_error: '다운로드 오류',

      status_camera_off: '카메라 꺼짐',

      status_nothing: '없음'

    },

    ru: {

      ext_title: 'ИИ Дорожные Знаки',

      block_load_model: '☁️ ЗАГРУЗИТЬ ОНЛАЙН МОДЕЛЬ',

      block_camera_on: '📷 включить камеру в режиме: [MODO]',

      block_camera_off: '❌ ВЫКЛЮЧИТЬ КАМЕРУ',

      block_signal: 'обнаруженный знак',

      block_confidence: 'точность %',

      block_is_stable: 'видит [SIG] при [CONF]% за [TIME] сек?',

      menu_mode_draggable: 'ПЛАВАЮЩАЯ ПЕРЕТАСКИВАЕМАЯ',

      menu_mode_background: 'ФОН СЦЕНЫ (ДОПОЛНЕННАЯ РЕАЛЬНОСТЬ)',

      sign_avanzar: 'ВПЕРЁД',

      sign_retroceder: 'НАЗАД',

      sign_stop: 'СТОП',

      sign_despacio: 'МЕДЛЕННО',

      sign_izquierda: 'ЛЕВО',

      sign_derecha: 'ПРАВО',

      status_ready: 'ГОТОВО: ЗАГРУЗИТЬ МОДЕЛЬ',

      status_downloading: 'ЗАГРУЗКА МОЗГА...',

      status_loaded: 'МОДЕЛЬ ЗАГРУЖЕНА',

      status_error: 'ОШИБКА ЗАГРУЗКИ',

      status_camera_off: 'КАМЕРА ВЫКЛЮЧЕНА',

      status_nothing: 'НИЧЕГО'

    },

    ar: {

      ext_title: 'الذكاء الاصطناعي: إشارات المرور',

      block_load_model: '☁️ تحميل النموذج عبر الإنترنت',

      block_camera_on: '📷 تشغيل الكاميرا في الوضع: [MODO]',

      block_camera_off: '❌ إيقاف تشغيل الكاميرا',

      block_signal: 'الإشارة المكتشفة',

      block_confidence: 'دقة %',

      block_is_stable: 'يرى [SIG] عند [CONF]% لمدة [TIME] ثانية?',

      menu_mode_draggable: 'عائمة قابلة للسحب',

      menu_mode_background: 'خلفية المسرح (الواقع المعزز)',

      sign_avanzar: 'تقدم',

      sign_retroceder: 'تراجع',

      sign_stop: 'توقف',

      sign_despacio: 'بطيء',

      sign_izquierda: 'يسار',

      sign_derecha: 'يمين',

      status_ready: 'جاهز: تحميل النموذج',

      status_downloading: 'جاري تحميل الدماغ...',

      status_loaded: 'تم تحميل النموذج',

      status_error: 'خطأ في التحميل',

      status_camera_off: 'الكاميرا مغلقة',

      status_nothing: 'لا شيء'

    },

    hi: {

      ext_title: 'AI यातायात संकेत',

      block_load_model: '☁️ ऑनलाइन मॉडल लोड करें',

      block_camera_on: '📷 मोड में कैमरा चालू करें: [MODO]',

      block_camera_off: '❌ कैमरा बंद करें',

      block_signal: 'पता लगाया गया संकेत',

      block_confidence: 'सटीकता %',

      block_is_stable: '[SIG] को [CONF]% पर [TIME] सेकंड तक देखता है?',

      menu_mode_draggable: 'तैरती हुई खींचने योग्य',

      menu_mode_background: 'स्टेज पृष्ठभूमि (विस्तारित वास्तविकता)',

      sign_avanzar: 'आगे',

      sign_retroceder: 'पीछे',

      sign_stop: 'रुकें',

      sign_despacio: 'धीरे',

      sign_izquierda: 'बाएं',

      sign_derecha: 'दाएं',

      status_ready: 'तैयार: मॉडल लोड करें',

      status_downloading: 'दिमाग डाउनलोड हो रहा है...',

      status_loaded: 'मॉडल लोड हो गया',

      status_error: 'डाउनलोड त्रुटि',

      status_camera_off: 'कैमरा बंद',

      status_nothing: 'कुछ नहीं'

    },

    bn: {

      ext_title: 'AI ট্রাফিক সিগন্যাল',

      block_load_model: '☁️ অনলাইন মডেল লোড করুন',

      block_camera_on: '📷 মোডে ক্যামেরা চালু করুন: [MODO]',

      block_camera_off: '❌ ক্যামেরা বন্ধ করুন',

      block_signal: 'সনাক্ত করা সংকেত',

      block_confidence: 'নির্ভুলতা %',

      block_is_stable: '[SIG] দেখে [CONF]% এ [TIME] সেকেন্ড?',

      menu_mode_draggable: 'ভাসমান টানযোগ্য',

      menu_mode_background: 'স্টেজ ব্যাকগ্রাউন্ড (অগমেন্টেড রিয়েলিটি)',

      sign_avanzar: 'এগিয়ে যান',

      sign_retroceder: 'পিছিয়ে যান',

      sign_stop: 'থামুন',

      sign_despacio: 'ধীরে',

      sign_izquierda: 'বাম',

      sign_derecha: 'ডান',

      status_ready: 'প্রস্তুত: মডেল লোড করুন',

      status_downloading: 'মস্তিষ্ক ডাউনলোড হচ্ছে...',

      status_loaded: 'মডেল লোড হয়েছে',

      status_error: 'ডাউনলোড ত্রুটি',

      status_camera_off: 'ক্যামেরা বন্ধ',

      status_nothing: 'কিছুই না'

    },

    id: {

      ext_title: 'AI Rambu Lalu Lintas',

      block_load_model: '☁️ MUAT MODEL ONLINE',

      block_camera_on: '📷 nyalakan kamera dalam mode: [MODO]',

      block_camera_off: '❌ MATIKAN KAMERA',

      block_signal: 'sinyal terdeteksi',

      block_confidence: 'akurasi %',

      block_is_stable: 'melihat [SIG] pada [CONF]% selama [TIME] detik?',

      menu_mode_draggable: 'MENGAMBANG DAPAT DITARIK',

      menu_mode_background: 'LATAR BELAKANG PANGGUNG (REALITAS TERTAMBAH)',

      sign_avanzar: 'MAJU',

      sign_retroceder: 'MUNDUR',

      sign_stop: 'BERHENTI',

      sign_despacio: 'LAMBAT',

      sign_izquierda: 'KIRI',

      sign_derecha: 'KANAN',

      status_ready: 'SIAP: MUAT MODEL',

      status_downloading: 'MENGUNDUH OTAK...',

      status_loaded: 'MODEL DIMUAT OK',

      status_error: 'KESALAHAN UNDUH',

      status_camera_off: 'KAMERA MATI',

      status_nothing: 'TIDAK ADA'

    },

    tr: {

      ext_title: 'Yapay Zeka Trafik İşaretleri',

      block_load_model: '☁️ ÇEVRİİÇİ MODEL YÜKLE',

      block_camera_on: '📷 modda kamerayı aç: [MODO]',

      block_camera_off: '❌ KAMERA KAPAT',

      block_signal: 'tespit edilen sinyal',

      block_confidence: 'doğruluk %',

      block_is_stable: '[SIG] görüyor [CONF]% [TIME] saniye boyunca?',

      menu_mode_draggable: 'SÜRÜKLENEBİLİR YÜZEN',

      menu_mode_background: 'SAHNE ARKA PLANI (ARTIRILMIŞ GERÇEKLİK)',

      sign_avanzar: 'İLERİ',

      sign_retroceder: 'GERİ',

      sign_stop: 'DUR',

      sign_despacio: 'YAVAŞ',

      sign_izquierda: 'SOL',

      sign_derecha: 'SAĞ',

      status_ready: 'HAZIR: MODEL YÜKLE',

      status_downloading: 'BEYİN İNDİRİLİYOR...',

      status_loaded: 'MODEL YÜKLENDİ',

      status_error: 'İNDİRME HATASI',

      status_camera_off: 'KAMERA KAPALI',

      status_nothing: 'YOK'

    },

    pl: {

      ext_title: 'AI Znaki Drogowe',

      block_load_model: '☁️ WCZYTAJ MODEL ONLINE',

      block_camera_on: '📷 włącz kamerę w trybie: [MODO]',

      block_camera_off: '❌ WYŁĄCZ KAMERĘ',

      block_signal: 'wykryty sygnał',

      block_confidence: 'dokładność %',

      block_is_stable: 'widzi [SIG] z [CONF]% przez [TIME] sekund?',

      menu_mode_draggable: 'PRZESUWALNE UNOSZĄCE',

      menu_mode_background: 'TŁO SCENY (RZECZYWISTOŚĆ ROZSZERZONA)',

      sign_avanzar: 'NAPRZÓD',

      sign_retroceder: 'WSTECZ',

      sign_stop: 'STOP',

      sign_despacio: 'WOLNO',

      sign_izquierda: 'LEWO',

      sign_derecha: 'PRAWO',

      status_ready: 'GOTOWY: WCZYTAJ MODEL',

      status_downloading: 'POBIERANIE MÓZGU...',

      status_loaded: 'MODEL WCZYTANY',

      status_error: 'BŁĄD POBIERANIA',

      status_camera_off: 'KAMERA WYŁĄCZONA',

      status_nothing: 'BRAK'

    },

    nl: {

      ext_title: 'AI Verkeersborden',

      block_load_model: '☁️ MODEL ONLINE LADEN',

      block_camera_on: '📷 camera aanzetten in modus: [MODO]',

      block_camera_off: '❌ CAMERA UITZETTEN',

      block_signal: 'gedetecteerd signaal',

      block_confidence: 'nauwkeurigheid %',

      block_is_stable: 'ziet [SIG] met [CONF]% gedurende [TIME] seconden?',

      menu_mode_draggable: 'SLEEPBARE DRIJVENDE',

      menu_mode_background: 'PODIUMACHTERGROND (AUGMENTED REALITY)',

      sign_avanzar: 'VOORUIT',

      sign_retroceder: 'ACHTERUIT',

      sign_stop: 'STOP',

      sign_despacio: 'LANGZAAM',

      sign_izquierda: 'LINKS',

      sign_derecha: 'RECHTS',

      status_ready: 'KLAAR: MODEL LADEN',

      status_downloading: 'BREIN DOWNLOADEN...',

      status_loaded: 'MODEL GELADEN',

      status_error: 'DOWNLOADFOUT',

      status_camera_off: 'CAMERA UIT',

      status_nothing: 'NIETS'

    }

  };



  const _REC_CAMERA_URL = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')

    ? window.location.origin + '/Laboratorio-IA/extensionesrec/recCamera.js'

    : 'https://cdn.jsdelivr.net/gh/ROBOTICAENCOLEGIOS/Laboratorio-IA@main/extensionesrec/recCamera.js';



  const t = key => {

    const rawLocale = window.currentRecLocale || 'es';

    const lang = rawLocale.split(/[-_]/)[0].toLowerCase();

    return (I18N_BLOCKS[lang] && I18N_BLOCKS[lang][key]) || (I18N_BLOCKS['es'] && I18N_BLOCKS['es'][key]) || key;

  };



  class IASenalesTransito {

    constructor() {

      this.model        = null;

      this.prediction   = t('status_ready');

      this.confidence   = 0;

      this.stabilityMs  = 0;

      this.currentLabel = t('status_nothing');

      this.lastTimestamp = Date.now();

      this._running     = false;

    }



    _addScript(src) {

      return new Promise((resolve) => {

        const s = document.createElement('script');

        s.src = src;

        s.onload = resolve;

        document.head.appendChild(s);

      });

    }



    async _ensureCamera() {

      if (!window.RECCamera) await this._addScript(_REC_CAMERA_URL);

    }



    async _ensureLibs() {

      if (!window.tf) {

        await this._addScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.11.0/dist/tf.min.js");

      }

      if (!window.tmImage) {

        await this._addScript("https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.5/dist/teachablemachine-image.min.js");

      }

    }



    getInfo() {

      return {

        id: 'iaSenalesTransitoV7',

        name: t('ext_title'),

        color1: '#EAB308',

        blocks: [

          { opcode: 'loadFiles', blockType: Scratch.BlockType.COMMAND, text: t('block_load_model') },

          {

            opcode: 'encenderCamara',

            blockType: Scratch.BlockType.COMMAND,

            text: t('block_camera_on'),

            arguments: { MODO: { type: Scratch.ArgumentType.STRING, menu: 'MODO_CAMARA' } }

          },

          { opcode: 'stop', blockType: Scratch.BlockType.COMMAND, text: t('block_camera_off') },

          "---",

          { opcode: 'getSignal', blockType: Scratch.BlockType.REPORTER, text: t('block_signal') },

          { opcode: 'getConf',   blockType: Scratch.BlockType.REPORTER, text: t('block_confidence') },

          {

            opcode: 'isStable',

            blockType: Scratch.BlockType.BOOLEAN,

            text: t('block_is_stable'),

            arguments: {

              SIG:  { type: Scratch.ArgumentType.STRING, menu: 'SIGN_MENU' },

              CONF: { type: Scratch.ArgumentType.NUMBER, defaultValue: 80 },

              TIME: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.8 }

            }

          }

        ],

        menus: {

          MODO_CAMARA: {

            items: [

              { text: t('menu_mode_draggable'), value: 'FLOTANTE ARRASTRABLE' },

              { text: t('menu_mode_background'), value: 'FONDO DE ESCENARIO (REALIDAD AUMENTADA)' }

            ]

          },

          SIGN_MENU: {

            items: [

              { text: t('sign_avanzar'), value: 'AVANZAR' },

              { text: t('sign_retroceder'), value: 'RETROCEDER' },

              { text: t('sign_stop'), value: 'STOP' },

              { text: t('sign_despacio'), value: 'DESPACIO' },

              { text: t('sign_izquierda'), value: 'IZQUIERDA' },

              { text: t('sign_derecha'), value: 'DERECHA' }

            ]

          }

        }

      };

    }



    async loadFiles() {

      await this._ensureLibs();

      const base = "https://cdn.jsdelivr.net/gh/ROBOTICAENCOLEGIOS/Laboratorio-IA@main/extensionesrec/modelo_transito/";

      try {

        this.prediction = t('status_downloading');

        this.model = await window.tmImage.load(base + "model.json", base + "metadata.json");

        this.prediction = t('status_loaded');

      } catch (err) {

        this.prediction = t('status_error');

        console.error("IA Señales: error cargando modelo →", err);

      }

    }



    async encenderCamara(args) {

      if (window.RECCamera && window.RECCamera.video) return;

      await this._ensureCamera();

      await this._ensureLibs();

      // mirror=false: los textos de señales (STOP, etc.) no deben invertirse

      const video = await window.RECCamera.start(args.MODO, '#EAB308', false);

      if (video) {

        this._running = true;

        this.lastTimestamp = Date.now();

        this._loop();

      }

    }



    stop() {

      this._running = false;

      if (window.RECCamera) window.RECCamera.stop();

      this.prediction   = t('status_camera_off');

      this.confidence   = 0;

      this.stabilityMs  = 0;

      this.currentLabel = t('status_nothing');

      // Liberar modelo Teachable Machine y tensores de TF residuales

      if (this.model && typeof this.model.dispose === 'function') {

        try { this.model.dispose(); } catch (e) {}

        this.model = null;

      }

      try { if (window.tf) window.tf.disposeVariables(); } catch (e) {}

    }



    async _loop() {

      const cam = window.RECCamera;

      if (!this._running || !cam || !cam.video) return;

      const v = cam.video;



      if (this.model && v.readyState >= 2) {

        try {

          const now = Date.now();

          const dt  = now - this.lastTimestamp;

          this.lastTimestamp = now;



          const preds = await this.model.predict(v);

          preds.sort((a, b) => b.probability - a.probability);

          const top = preds[0];

          this.confidence = Math.round(top.probability * 100);



          const label = (top.className.toUpperCase() === "FONDO" || this.confidence < 35)

            ? "NADA"

            : top.className.toUpperCase();



          if (label === this.currentLabel && label !== "NADA") {

            this.stabilityMs += dt;

          } else {

            this.currentLabel = label;

            this.stabilityMs  = 0;

          }

          

          // Traducir resultado visual manteniendo lógica intacta

          if (label === "NADA") {

            this.prediction = t('status_nothing');

          } else {

            // Mapear señales del modelo a claves de traducción

            const signalMap = {

              'AVANZAR': 'sign_avanzar',

              'RETROCEDER': 'sign_retroceder',

              'STOP': 'sign_stop',

              'DESPACIO': 'sign_despacio',

              'IZQUIERDA': 'sign_izquierda',

              'DERECHA': 'sign_derecha'

            };

            const translationKey = signalMap[label] || label;

            this.prediction = t(translationKey);

          }

        } catch (e) {}

      }

      requestAnimationFrame(() => this._loop());

    }



    getSignal()  { return this.prediction; }

    getConf()    { return this.confidence; }

    isStable(args) {

      return (this.currentLabel === args.SIG.toUpperCase() &&

              this.confidence >= args.CONF &&

              this.stabilityMs >= (args.TIME * 1000));

    }

  }



  Scratch.extensions.register(new IASenalesTransito());

})(Scratch);