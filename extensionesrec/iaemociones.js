/**
 * IA: Emociones Rostro - RoboticaEnColegios R.E.C.
 * Detecta emociones faciales con face-api.js (@vladmandic).
 * Cámara centralizada vía window.RECCamera (recCamera.js).
 */

(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Debe ejecutarse en modo unsandboxed.');
  }

  const I18N_BLOCKS = {
    es: {
      ext_title: 'IA: Emociones Rostro',
      block_camera_on: '📷 encender cámara en modo: [MODO]',
      block_camera_off: '❌ APAGAR CÁMARA',
      block_camera_x: '📷 coordenada X de la cámara',
      block_camera_y: '📷 coordenada Y de la cámara',
      block_emotion: 'emoción detectada',
      block_confidence: 'exactitud %',
      block_is_emotion: '¿rostro está [EMOCION]?',
      block_mouth_open: '¿boca abierta / grito?',
      menu_mode_fixed: 'FLOTANTE FIJA',
      menu_mode_draggable: 'FLOTANTE ARRASTRABLE',
      menu_mode_background: 'FONDO DE ESCENARIO (REALIDAD AUMENTADA)',
      emotion_happy: 'FELIZ',
      emotion_sad: 'TRISTE',
      emotion_angry: 'ENOJADO',
      emotion_surprised: 'SORPRENDIDO',
      emotion_neutral: 'NEUTRAL',
      emotion_none: 'NADA'
    },
    en: {
      ext_title: 'AI: Face Emotions',
      block_camera_on: '📷 turn camera on in mode: [MODO]',
      block_camera_off: '❌ TURN OFF CAMERA',
      block_camera_x: '📷 camera X coordinate',
      block_camera_y: '📷 camera Y coordinate',
      block_emotion: 'detected emotion',
      block_confidence: 'accuracy %',
      block_is_emotion: 'is face [EMOCION]?',
      block_mouth_open: 'mouth open / screaming?',
      menu_mode_fixed: 'FLOATING FIXED',
      menu_mode_draggable: 'FLOATING DRAGGABLE',
      menu_mode_background: 'STAGE BACKGROUND (AUGMENTED REALITY)',
      emotion_happy: 'HAPPY',
      emotion_sad: 'SAD',
      emotion_angry: 'ANGRY',
      emotion_surprised: 'SURPRISED',
      emotion_neutral: 'NEUTRAL',
      emotion_none: 'NONE'
    },
    pt: {
      ext_title: 'IA: Emoções Rosto',
      block_camera_on: '📷 ligar câmera no modo: [MODO]',
      block_camera_off: '❌ DESLIGAR CÂMERA',
      block_camera_x: '📷 coordenada X da câmera',
      block_camera_y: '📷 coordenada Y da câmera',
      block_emotion: 'emoção detectada',
      block_confidence: 'precisão %',
      block_is_emotion: 'rosto está [EMOCION]?',
      block_mouth_open: 'boca aberta / gritando?',
      menu_mode_fixed: 'FLUTUANTE FIXA',
      menu_mode_draggable: 'FLUTUANTE ARRASTÁVEL',
      menu_mode_background: 'FUNDO DO PALCO (REALIDADE AUMENTADA)',
      emotion_happy: 'FELIZ',
      emotion_sad: 'TRISTE',
      emotion_angry: 'COM RAIVA',
      emotion_surprised: 'SURPRESO',
      emotion_neutral: 'NEUTRO',
      emotion_none: 'NADA'
    },
    fr: {
      ext_title: 'IA: Émotions Visage',
      block_camera_on: '📷 allumer caméra en mode: [MODO]',
      block_camera_off: '❌ ÉTEINDRE CAMÉRA',
      block_camera_x: '📷 coordonnée X de la caméra',
      block_camera_y: '📷 coordonnée Y de la caméra',
      block_emotion: 'émotion détectée',
      block_confidence: 'précision %',
      block_is_emotion: 'visage est [EMOCION]?',
      block_mouth_open: 'bouche ouverte / cri?',
      menu_mode_fixed: 'FLOTTANT FIXE',
      menu_mode_draggable: 'FLOTTANT DÉPLAÇABLE',
      menu_mode_background: 'FOND DE SCÈNE (RÉALITÉ AUGMENTÉE)',
      emotion_happy: 'HEUREUX',
      emotion_sad: 'TRISTE',
      emotion_angry: 'COLÈRE',
      emotion_surprised: 'SURPRIS',
      emotion_neutral: 'NEUTRE',
      emotion_none: 'RIEN'
    },
    de: {
      ext_title: 'KI: Gesichtsemotionen',
      block_camera_on: '📷 Kamera einschalten im Modus: [MODO]',
      block_camera_off: '❌ KAMERA AUSSCHALTEN',
      block_camera_x: '📷 Kamera X-Koordinate',
      block_camera_y: '📷 Kamera Y-Koordinate',
      block_emotion: 'erkannte Emotion',
      block_confidence: 'Genauigkeit %',
      block_is_emotion: 'Gesicht ist [EMOCION]?',
      block_mouth_open: 'Mund offen / schreien?',
      menu_mode_fixed: 'SCHWEBEND FEST',
      menu_mode_draggable: 'SCHWEBEND VERSCHIEBBAR',
      menu_mode_background: 'BÜHNENHINTERGRUND (ERWEITERTE REALITÄT)',
      emotion_happy: 'GLÜCKLICH',
      emotion_sad: 'TRAURIG',
      emotion_angry: 'WÜTEND',
      emotion_surprised: 'ÜBERRASCHT',
      emotion_neutral: 'NEUTRAL',
      emotion_none: 'NICHTS'
    },
    it: {
      ext_title: 'IA: Emozioni Viso',
      block_camera_on: '📷 accendi telecamera in modalità: [MODO]',
      block_camera_off: '❌ SPEGNI TELECAMERA',
      block_camera_x: '📷 coordinata X telecamera',
      block_camera_y: '📷 coordinata Y telecamera',
      block_emotion: 'emozione rilevata',
      block_confidence: 'accuratezza %',
      block_is_emotion: 'viso è [EMOCION]?',
      block_mouth_open: 'bocca aperta / urla?',
      menu_mode_fixed: 'FLUTTUANTE FISSA',
      menu_mode_draggable: 'FLUTTUANTE TRASCINABILE',
      menu_mode_background: 'SFONDO PALCOSCENICO (REALTÀ AUMENTATA)',
      emotion_happy: 'FELICE',
      emotion_sad: 'TRISTE',
      emotion_angry: 'ARRABBIATO',
      emotion_surprised: 'SORPRESO',
      emotion_neutral: 'NEUTRALE',
      emotion_none: 'NULLA'
    },
    zh: {
      ext_title: 'AI: 面部情绪',
      block_camera_on: '📷 以模式开启摄像头: [MODO]',
      block_camera_off: '❌ 关闭摄像头',
      block_camera_x: '📷 摄像头X坐标',
      block_camera_y: '📷 摄像头Y坐标',
      block_emotion: '检测到的情绪',
      block_confidence: '准确度 %',
      block_is_emotion: '面部是[EMOCION]?',
      block_mouth_open: '嘴巴张开/尖叫?',
      menu_mode_fixed: '浮动固定',
      menu_mode_draggable: '浮动可拖动',
      menu_mode_background: '舞台背景 (增强现实)',
      emotion_happy: '快乐',
      emotion_sad: '悲伤',
      emotion_angry: '愤怒',
      emotion_surprised: '惊讶',
      emotion_neutral: '中性',
      emotion_none: '无'
    },
    ja: {
      ext_title: 'AI: 顔の感情',
      block_camera_on: '📷 カメラをモードでオン: [MODO]',
      block_camera_off: '❌ カメラをオフにする',
      block_camera_x: '📷 カメラX座標',
      block_camera_y: '📷 カメラY座標',
      block_emotion: '検出された感情',
      block_confidence: '精度 %',
      block_is_emotion: '顔は[EMOCION]?',
      block_mouth_open: '口が開いている/叫んでいる?',
      menu_mode_fixed: 'フローティング固定',
      menu_mode_draggable: 'フローティングドラッグ可能',
      menu_mode_background: 'ステージ背景 (拡張現実)',
      emotion_happy: '幸せ',
      emotion_sad: '悲しい',
      emotion_angry: '怒っている',
      emotion_surprised: '驚いている',
      emotion_neutral: '中立',
      emotion_none: 'なし'
    },
    ko: {
      ext_title: 'AI: 얼굴 감정',
      block_camera_on: '📷 모드로 카메라 켜기: [MODO]',
      block_camera_off: '❌ 카메라 끄기',
      block_camera_x: '📷 카메라 X 좌표',
      block_camera_y: '📷 카메라 Y 좌표',
      block_emotion: '감지된 감정',
      block_confidence: '정확도 %',
      block_is_emotion: '얼굴이[EMOCION]?',
      block_mouth_open: '입이 열림/비명?',
      menu_mode_fixed: '플로팅 고정',
      menu_mode_draggable: '플로팅 드래그 가능',
      menu_mode_background: '스테이지 배경 (증강 현실)',
      emotion_happy: '행복',
      emotion_sad: '슬픔',
      emotion_angry: '화남',
      emotion_surprised: '놀람',
      emotion_neutral: '중립',
      emotion_none: '없음'
    },
    ru: {
      ext_title: 'ИИ: Эмоции лица',
      block_camera_on: '📷 включить камеру в режиме: [MODO]',
      block_camera_off: '❌ ВЫКЛЮЧИТЬ КАМЕРУ',
      block_camera_x: '📷 координата X камеры',
      block_camera_y: '📷 координата Y камеры',
      block_emotion: 'обнаруженная эмоция',
      block_confidence: 'точность %',
      block_is_emotion: 'лицо [EMOCION]?',
      block_mouth_open: 'рот открыт / крик?',
      menu_mode_fixed: 'ПЛАВАЮЩАЯ ФИКСИРОВАННАЯ',
      menu_mode_draggable: 'ПЛАВАЮЩАЯ ПЕРЕТАСКИВАЕМАЯ',
      menu_mode_background: 'ФОН СЦЕНЫ (ДОПОЛНЕННАЯ РЕАЛЬНОСТЬ)',
      emotion_happy: 'СЧАСТЛИВЫЙ',
      emotion_sad: 'ГРУСТНЫЙ',
      emotion_angry: 'ЗЛОЙ',
      emotion_surprised: 'УДИВЛЕННЫЙ',
      emotion_neutral: 'НЕЙТРАЛЬНЫЙ',
      emotion_none: 'НИЧЕГО'
    },
    ar: {
      ext_title: 'الذكاء الاصطناعي: مشاعر الوجه',
      block_camera_on: '📷 تشغيل الكاميرا في الوضع: [MODO]',
      block_camera_off: '❌ إيقاف تشغيل الكاميرا',
      block_camera_x: '📷 إحداثي X للكاميرا',
      block_camera_y: '📷 إحداثي Y للكاميرا',
      block_emotion: 'المشاعر المكتشفة',
      block_confidence: 'دقة %',
      block_is_emotion: 'الوجه [EMOCION]?',
      block_mouth_open: 'الفم مفتوح / صراخ?',
      menu_mode_fixed: 'عائمة ثابتة',
      menu_mode_draggable: 'عائمة قابلة للسحب',
      menu_mode_background: 'خلفية المسرح (الواقع المعزز)',
      emotion_happy: 'سعيد',
      emotion_sad: 'حزين',
      emotion_angry: 'غاضب',
      emotion_surprised: 'متفاجئ',
      emotion_neutral: 'محايد',
      emotion_none: 'لا شيء'
    },
    hi: {
      ext_title: 'AI: चेहरे की भावनाएं',
      block_camera_on: '📷 मोड में कैमरा चालू करें: [MODO]',
      block_camera_off: '❌ कैमरा बंद करें',
      block_camera_x: '📷 कैमरा X निर्देशांक',
      block_camera_y: '📷 कैमरा Y निर्देशांक',
      block_emotion: 'पता लगाई गई भावना',
      block_confidence: 'सटीकता %',
      block_is_emotion: 'चेहरा [EMOCION] है?',
      block_mouth_open: 'मुँह खुला / चिल्लाहट?',
      menu_mode_fixed: 'तैरती हुई स्थिर',
      menu_mode_draggable: 'तैरती हुई खींचने योग्य',
      menu_mode_background: 'स्टेज पृष्ठभूमि (विस्तारित वास्तविकता)',
      emotion_happy: 'खुश',
      emotion_sad: 'उदास',
      emotion_angry: 'गुस्से में',
      emotion_surprised: 'आश्चर्यचकित',
      emotion_neutral: 'तटस्थ',
      emotion_none: 'कुछ नहीं'
    },
    bn: {
      ext_title: 'AI: মুখের আবেগ',
      block_camera_on: '📷 মোডে ক্যামেরা চালু করুন: [MODO]',
      block_camera_off: '❌ ক্যামেরা বন্ধ করুন',
      block_camera_x: '📷 ক্যামেরা X স্থানাঙ্ক',
      block_camera_y: '📷 ক্যামেরা Y স্থানাঙ্ক',
      block_emotion: 'সনাক্ত করা আবেগ',
      block_confidence: 'নির্ভুলতা %',
      block_is_emotion: 'মুখ [EMOCION]?',
      block_mouth_open: 'মুখ খোলা / চিৎকার?',
      menu_mode_fixed: 'ভাসমান স্থির',
      menu_mode_draggable: 'ভাসমান টানযোগ্য',
      menu_mode_background: 'স্টেজ ব্যাকগ্রাউন্ড (অগমেন্টেড রিয়েলিটি)',
      emotion_happy: 'সুখী',
      emotion_sad: 'দুঃখী',
      emotion_angry: 'রাগান্বিত',
      emotion_surprised: 'অবাক',
      emotion_neutral: 'নিরপেক্ষ',
      emotion_none: 'কিছুই না'
    },
    id: {
      ext_title: 'AI: Emosi Wajah',
      block_camera_on: '📷 nyalakan kamera dalam mode: [MODO]',
      block_camera_off: '❌ MATIKAN KAMERA',
      block_camera_x: '📷 koordinat X kamera',
      block_camera_y: '📷 koordinat Y kamera',
      block_emotion: 'emosi terdeteksi',
      block_confidence: 'akurasi %',
      block_is_emotion: 'wajah [EMOCION]?',
      block_mouth_open: 'mulut terbuka / berteriak?',
      menu_mode_fixed: 'MENGAMBANG TETAP',
      menu_mode_draggable: 'MENGAMBANG DAPAT DITARIK',
      menu_mode_background: 'LATAR BELAKANG PANGGUNG (REALITAS TERTAMBAH)',
      emotion_happy: 'SENANG',
      emotion_sad: 'SEDIH',
      emotion_angry: 'MARAH',
      emotion_surprised: 'TERKEJUT',
      emotion_neutral: 'NETRAL',
      emotion_none: 'TIDAK ADA'
    },
    tr: {
      ext_title: 'Yapay Zeka: Yüz Duyguları',
      block_camera_on: '📷 modda kamerayı aç: [MODO]',
      block_camera_off: '❌ KAMERA KAPAT',
      block_camera_x: '📷 kamera X koordinatı',
      block_camera_y: '📷 kamera Y koordinatı',
      block_emotion: 'tespit edilen duygu',
      block_confidence: 'doğruluk %',
      block_is_emotion: 'yüz [EMOCION]?',
      block_mouth_open: 'ağız açık / bağırma?',
      menu_mode_fixed: 'SABİT YÜZEN',
      menu_mode_draggable: 'SÜRÜKLENEBİLİR YÜZEN',
      menu_mode_background: 'SAHNE ARKA PLANI (ARTIRILMIŞ GERÇEKLİK)',
      emotion_happy: 'MUTLU',
      emotion_sad: 'ÜZGÜN',
      emotion_angry: 'KIZGIN',
      emotion_surprised: 'ŞAŞKIN',
      emotion_neutral: 'NÖTR',
      emotion_none: 'YOK'
    }
  };

  const _REC_CAMERA_URL = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
    ? window.location.origin + '/Laboratorio-IA/extensionesrec/recCamera.js'
    : 'https://cdn.jsdelivr.net/gh/ROBOTICAENCOLEGIOS/Laboratorio-IA@main/extensionesrec/recCamera.js';

  const _MODEL_URL = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights/";

  const t = key => {
    const locale = window.currentRecLocale || 'es';
    return (I18N_BLOCKS[locale] && I18N_BLOCKS[locale][key]) || I18N_BLOCKS['es'][key] || key;
  };

  // Mapeo inglés → traducido dinámicamente (fearful y disgusted se fusionan)
  const _EMOTION_MAP = {
    happy:     'emotion_happy',
    sad:       'emotion_sad',
    angry:     'emotion_angry',
    disgusted: 'emotion_angry',
    fearful:   'emotion_surprised',
    surprised: 'emotion_surprised',
    neutral:   'emotion_neutral'
  };

  class IAEmocionesREC {
    constructor() {
      this.emotion     = t('emotion_none');
      this.confidence  = 0;
      this.mouthOpen   = false;
      this.modelsReady = false;
      this._running    = false;
    }

    _loadScript(url) {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    async _ensureCamera() {
      if (!window.RECCamera) await this._loadScript(_REC_CAMERA_URL);
    }

    async _loadModels() {
      if (this.modelsReady) return;
      if (!window.faceapi) {
        await this._loadScript("https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js");
      }
      try {
        const faceapi = window.faceapi;
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(_MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(_MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(_MODEL_URL)
        ]);
        this.modelsReady = true;
      } catch (e) {
        console.error("IA Emociones: error cargando modelos →", e);
      }
    }

    getInfo() {
      return {
        id: 'iaEmocionesREC',
        name: t('ext_title'),
        color1: '#EC4899',
        blocks: [
          {
            opcode: 'encenderCamara',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_camera_on'),
            arguments: { MODO: { type: Scratch.ArgumentType.STRING, menu: 'MODO_CAMARA' } }
          },
          { opcode: 'detenerCamara', blockType: Scratch.BlockType.COMMAND, text: t('block_camera_off') },
          "---",
          { opcode: 'getCamaraX', blockType: Scratch.BlockType.REPORTER, text: t('block_camera_x') },
          { opcode: 'getCamaraY', blockType: Scratch.BlockType.REPORTER, text: t('block_camera_y') },
          "---",
          { opcode: 'getEmotion',    blockType: Scratch.BlockType.REPORTER, text: t('block_emotion') },
          { opcode: 'getConfidence', blockType: Scratch.BlockType.REPORTER, text: t('block_confidence') },
          {
            opcode: 'isEmotion',
            blockType: Scratch.BlockType.BOOLEAN,
            text: t('block_is_emotion'),
            arguments: { EMOCION: { type: Scratch.ArgumentType.STRING, menu: 'EMOTION_MENU' } }
          },
          { opcode: 'isMouthOpen', blockType: Scratch.BlockType.BOOLEAN, text: t('block_mouth_open') }
        ],
        menus: {
          MODO_CAMARA: {
            items: [t('menu_mode_fixed'), t('menu_mode_draggable'), t('menu_mode_background')]
          },
          EMOTION_MENU: {
            items: [t('emotion_happy'), t('emotion_sad'), t('emotion_angry'), t('emotion_surprised'), t('emotion_neutral')]
          }
        }
      };
    }

    async encenderCamara(args) {
      if (window.RECCamera && window.RECCamera.video) return;
      await this._ensureCamera();
      await this._loadModels();
      const video = await window.RECCamera.start(args.MODO, '#EC4899');
      if (video) {
        this._running = true;
        this._loop();
      }
    }

    detenerCamara() {
      this._running = false;
      if (window.RECCamera) window.RECCamera.stop();
      this.emotion    = t('emotion_none');
      this.confidence = 0;
      this.mouthOpen  = false;
      // Liberar pesos de face-api.js y tensores de TF residuales
      try {
        const fa = window.faceapi;
        if (fa) {
          if (fa.nets.tinyFaceDetector.isLoaded)    fa.nets.tinyFaceDetector.dispose();
          if (fa.nets.faceLandmark68TinyNet.isLoaded) fa.nets.faceLandmark68TinyNet.dispose();
          if (fa.nets.faceExpressionNet.isLoaded)   fa.nets.faceExpressionNet.dispose();
        }
      } catch (e) {}
      try { if (window.tf) window.tf.disposeVariables(); } catch (e) {}
      this.modelsReady = false;
    }

    async _loop() {
      const cam = window.RECCamera;
      if (!this._running || !cam || !cam.video) return;
      const v = cam.video;

      if (this.modelsReady && v.readyState >= 2) {
        try {
          const faceapi    = window.faceapi;
          const detections = await faceapi
            .detectAllFaces(v, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks(true)
            .withFaceExpressions();

          if (detections && detections.length > 0) {
            const det     = detections[0];
            const entries = Object.entries(det.expressions).sort((a, b) => b[1] - a[1]);
            const [topKey, topVal] = entries[0];
            if (topVal >= 0.35) {
              this.emotion    = t(_EMOTION_MAP[topKey]) || t('emotion_neutral');
              this.confidence = Math.round(topVal * 100);
            } else {
              this.emotion = t('emotion_none'); this.confidence = 0;
            }
            // Boca abierta: distancia pts 62→66 del modelo de 68 landmarks (umbral 12px)
            const pts = det.landmarks.positions;
            if (pts && pts.length >= 68) {
              const dist = Math.hypot(pts[62].x - pts[66].x, pts[62].y - pts[66].y);
              this.mouthOpen = dist > 12;
            }
          } else {
            this.emotion = t('emotion_none'); this.confidence = 0; this.mouthOpen = false;
          }
        } catch (e) {}
      }
      requestAnimationFrame(() => this._loop());
    }

    getCamaraX()    { return window.RECCamera ? Math.round(window.RECCamera.camaraX) : 0; }
    getCamaraY()    { return window.RECCamera ? Math.round(window.RECCamera.camaraY) : 0; }
    getEmotion()    { return this.emotion; }
    getConfidence() { return this.confidence; }
    isEmotion(args) { return this.emotion === args.EMOCION; }
    isMouthOpen()   { return this.mouthOpen; }
  }

  Scratch.extensions.register(new IAEmocionesREC());
})(Scratch);
