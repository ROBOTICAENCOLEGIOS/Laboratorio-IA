/**
 * IA: Teachable Machine - RoboticaEnColegios R.E.C.
 * Clasifica imágenes con modelos de Google Teachable Machine.
 * Carga diferida + menús dinámicos con las clases del modelo entrenado.
 * Cámara centralizada vía window.RECCamera (recCamera.js).
 */

(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Debe ejecutarse en modo unsandboxed.');
  }

  const I18N_BLOCKS = {
    'es': {
      'ext_name': 'IA: Teachable Machine',
      'block_load_local': '📁 CARGAR ARCHIVOS LOCALES (.json y .bin)',
      'block_load_url': '🌐 CARGAR MODELO DESDE URL [LINK]',
      'block_cam_on': '📷 encender cámara en modo: [MODO]',
      'block_cam_off': '❌ APAGAR CÁMARA',
      'reporter_cam_x': '📷 coordenada X de la cámara',
      'reporter_cam_y': '📷 coordenada Y de la cámara',
      'reporter_class': 'clase detectada',
      'reporter_confidence': 'exactitud %',
      'boolean_is_class': '¿ve la clase [CLASE]?',
      'reporter_labels': 'lista de clases entrenadas',
      'menu_mode_fixed': 'FLOTANTE FIJA',
      'menu_mode_draggable': 'FLOTANTE ARRASTRABLE',
      'menu_mode_ar': 'FONDO DE ESCENARIO (REALIDAD AUMENTADA)',
      'status_nothing': 'NADA',
      'status_waiting_model': 'ESPERANDO MODELO'
    },
    'en': {
      'ext_name': 'AI: Teachable Machine',
      'block_load_local': '📁 LOAD LOCAL FILES (.json and .bin)',
      'block_load_url': '🌐 LOAD MODEL FROM URL [LINK]',
      'block_cam_on': '📷 turn on camera in mode: [MODO]',
      'block_cam_off': '❌ TURN OFF CAMERA',
      'reporter_cam_x': '📷 camera X coordinate',
      'reporter_cam_y': '📷 camera Y coordinate',
      'reporter_class': 'detected class',
      'reporter_confidence': 'accuracy %',
      'boolean_is_class': 'sees the class [CLASE]?',
      'reporter_labels': 'list of trained classes',
      'menu_mode_fixed': 'FIXED FLOATING',
      'menu_mode_draggable': 'DRAGGABLE FLOATING',
      'menu_mode_ar': 'STAGE BACKGROUND (AUGMENTED REALITY)',
      'status_nothing': 'NOTHING',
      'status_waiting_model': 'WAITING FOR MODEL'
    },
    'pt': {
      'ext_name': 'IA: Teachable Machine',
      'block_load_local': '📁 CARREGAR ARQUIVOS LOCAIS (.json e .bin)',
      'block_load_url': '🌐 CARREGAR MODELO DA URL [LINK]',
      'block_cam_on': '📷 ligar câmera no modo: [MODO]',
      'block_cam_off': '❌ DESLIGAR CÂMERA',
      'reporter_cam_x': '📷 coordenada X da câmera',
      'reporter_cam_y': '📷 coordenada Y da câmera',
      'reporter_class': 'classe detectada',
      'reporter_confidence': 'exatidão %',
      'boolean_is_class': 'vê a classe [CLASE]?',
      'reporter_labels': 'lista de classes treinadas',
      'menu_mode_fixed': 'FLUTUANTE FIXA',
      'menu_mode_draggable': 'FLUTUANTE ARRASTÁVEL',
      'menu_mode_ar': 'FUNDO DE PALCO (REALIDADE AUMENTADA)',
      'status_nothing': 'NADA',
      'status_waiting_model': 'ESPERANDO MODELO'
    },
    'fr': {
      'ext_name': 'IA: Teachable Machine',
      'block_load_local': '📁 CHARGER FICHIERS LOCAUX (.json et .bin)',
      'block_load_url': '🌐 CHARGER MODÈLE DEPUIS URL [LINK]',
      'block_cam_on': '📷 allumer caméra en mode: [MODO]',
      'block_cam_off': '❌ ÉTEINDRE CAMÉRA',
      'reporter_cam_x': '📷 coordonnée X de la caméra',
      'reporter_cam_y': '📷 coordonnée Y de la caméra',
      'reporter_class': 'classe détectée',
      'reporter_confidence': 'exactitude %',
      'boolean_is_class': 'voit la classe [CLASE] ?',
      'reporter_labels': 'liste des classes entraînées',
      'menu_mode_fixed': 'FLOTTANTE FIXE',
      'menu_mode_draggable': 'FLOTTANTE DÉPLACABLE',
      'menu_mode_ar': 'FOND DE SCÈNE (RÉALITÉ AUGMENTÉE)',
      'status_nothing': 'RIEN',
      'status_waiting_model': 'EN ATTENTE DU MODÈLE'
    },
    'de': {
      'ext_name': 'KI: Teachable Machine',
      'block_load_local': '📁 LOKALE DATEIEN LADEN (.json und .bin)',
      'block_load_url': '🌐 MODELL VON URL LADEN [LINK]',
      'block_cam_on': '📷 Kamera einschalten im Modus: [MODO]',
      'block_cam_off': '❌ KAMERA AUSSCHALTEN',
      'reporter_cam_x': '📷 Kamera X-Koordinate',
      'reporter_cam_y': '📷 Kamera Y-Koordinate',
      'reporter_class': 'erkannte Klasse',
      'reporter_confidence': 'Genauigkeit %',
      'boolean_is_class': 'sieht die Klasse [CLASE]?',
      'reporter_labels': 'Liste der trainierten Klassen',
      'menu_mode_fixed': 'FESTE SCHWEBEND',
      'menu_mode_draggable': 'ZIEHBARE SCHWEBEND',
      'menu_mode_ar': 'BÜHNENHINTERGRUND (ERWEITERTE REALITÄT)',
      'status_nothing': 'NICHTS',
      'status_waiting_model': 'WARTE AUF MODELL'
    },
    'it': {
      'ext_name': 'IA: Teachable Machine',
      'block_load_local': '📁 CARICA FILE LOCALI (.json e .bin)',
      'block_load_url': '🌐 CARICA MODELLO DA URL [LINK]',
      'block_cam_on': '📷 accendi telecamera in modalità: [MODO]',
      'block_cam_off': '❌ SPEGNI TELECAMERA',
      'reporter_cam_x': '📷 coordinata X della telecamera',
      'reporter_cam_y': '📷 coordinata Y della telecamera',
      'reporter_class': 'classe rilevata',
      'reporter_confidence': 'precisione %',
      'boolean_is_class': 'vede la classe [CLASE]?',
      'reporter_labels': 'elenco delle classi addestrate',
      'menu_mode_fixed': 'FLOTTANTE FISSA',
      'menu_mode_draggable': 'FLOTTANTE TRASCINABILE',
      'menu_mode_ar': 'SFONDO DEL PALCO (REALTÀ AUMENTATA)',
      'status_nothing': 'NIENTE',
      'status_waiting_model': 'IN ATTESA DEL MODELLO'
    },
    'zh': {
      'ext_name': '人工智能: Teachable Machine',
      'block_load_local': '📁 加载本地文件 (.json 和 .bin)',
      'block_load_url': '🌐 从 URL 加载模型 [LINK]',
      'block_cam_on': '📷 以 [MODO] 模式打开相机',
      'block_cam_off': '❌ 关闭相机',
      'reporter_cam_x': '📷 相机 X 坐标',
      'reporter_cam_y': '📷 相机 Y 坐标',
      'reporter_class': '检测到的类别',
      'reporter_confidence': '准确率 %',
      'boolean_is_class': '看到类别 [CLASE]?',
      'reporter_labels': '训练类别列表',
      'menu_mode_fixed': '固定浮动',
      'menu_mode_draggable': '可拖动浮动',
      'menu_mode_ar': '舞台背景 (增强现实)',
      'status_nothing': '无',
      'status_waiting_model': '等待模型'
    },
    'ja': {
      'ext_name': 'AI: Teachable Machine',
      'block_load_local': '📁 ローカルファイルを読み込む (.json と .bin)',
      'block_load_url': '🌐 URLからモデルを読み込む [LINK]',
      'block_cam_on': '📷 カメラを [MODO] モードで起動',
      'block_cam_off': '❌ カメラをオフ',
      'reporter_cam_x': '📷 カメラのX座標',
      'reporter_cam_y': '📷 カメラのY座標',
      'reporter_class': '検出されたクラス',
      'reporter_confidence': '精度 %',
      'boolean_is_class': 'クラス [CLASE] を見る?',
      'reporter_labels': '訓練済みクラスの一覧',
      'menu_mode_fixed': '固定フローティング',
      'menu_mode_draggable': 'ドラッグ可能フローティング',
      'menu_mode_ar': 'ステージ背景 (拡張現実)',
      'status_nothing': 'なし',
      'status_waiting_model': 'モデルを待機中'
    },
    'ko': {
      'ext_name': 'AI: Teachable Machine',
      'block_load_local': '📁 로컬 파일 불러오기 (.json 및 .bin)',
      'block_load_url': '🌐 URL에서 모델 불러오기 [LINK]',
      'block_cam_on': '📷 [MODO] 모드로 카메라 켜기',
      'block_cam_off': '❌ 카메라 끄기',
      'reporter_cam_x': '📷 카메라 X 좌표',
      'reporter_cam_y': '📷 카메라 Y 좌표',
      'reporter_class': '감지된 클래스',
      'reporter_confidence': '정확도 %',
      'boolean_is_class': '클래스 [CLASE]를 보는가?',
      'reporter_labels': '훈련된 클래스 목록',
      'menu_mode_fixed': '고정 플로팅',
      'menu_mode_draggable': '드래그 가능한 플로팅',
      'menu_mode_ar': '무대 배경 (증강 현실)',
      'status_nothing': '없음',
      'status_waiting_model': '모델 대기 중'
    },
    'ru': {
      'ext_name': 'ИИ: Teachable Machine',
      'block_load_local': '📁 ЗАГРУЗИТЬ ЛОКАЛЬНЫЕ ФАЙЛЫ (.json и .bin)',
      'block_load_url': '🌐 ЗАГРУЗИТЬ МОДЕЛЬ ИЗ URL [LINK]',
      'block_cam_on': '📷 включить камеру в режиме: [MODO]',
      'block_cam_off': '❌ ВЫКЛЮЧИТЬ КАМЕРУ',
      'reporter_cam_x': '📷 координата X камеры',
      'reporter_cam_y': '📷 координата Y камеры',
      'reporter_class': 'обнаруженный класс',
      'reporter_confidence': 'точность %',
      'boolean_is_class': 'видит класс [CLASE]?',
      'reporter_labels': 'список обученных классов',
      'menu_mode_fixed': 'ФИКСИРОВАННАЯ ПЛАВАЮЩАЯ',
      'menu_mode_draggable': 'ПЕРЕТАСКИВАЕМАЯ ПЛАВАЮЩАЯ',
      'menu_mode_ar': 'ФОН СЦЕНЫ (ДОПОЛНЕННАЯ РЕАЛЬНОСТЬ)',
      'status_nothing': 'НИЧЕГО',
      'status_waiting_model': 'ОЖИДАНИЕ МОДЕЛИ'
    },
    'ar': {
      'ext_name': 'الذكاء الاصطناعي: Teachable Machine',
      'block_load_local': '📁 تحميل الملفات المحلية (.json و .bin)',
      'block_load_url': '🌐 تحميل النموذج من URL [LINK]',
      'block_cam_on': '📷 تشغيل الكاميرا في الوضع: [MODO]',
      'block_cam_off': '❌ إيقاف الكاميرا',
      'reporter_cam_x': '📷 إحداثي X للكاميرا',
      'reporter_cam_y': '📷 إحداثي Y للكاميرا',
      'reporter_class': 'الفئة المكتشفة',
      'reporter_confidence': 'الدقة %',
      'boolean_is_class': 'هل يرى الفئة [CLASE]؟',
      'reporter_labels': 'قائمة الفئات المدربة',
      'menu_mode_fixed': 'عائم ثابت',
      'menu_mode_draggable': 'عائم قابل للسحب',
      'menu_mode_ar': 'خلفية المسرح (واقع معزز)',
      'status_nothing': 'لا شيء',
      'status_waiting_model': 'في انتظار النموذج'
    },
    'hi': {
      'ext_name': 'AI: Teachable Machine',
      'block_load_local': '📁 स्थानीय फाइलें लोड करें (.json और .bin)',
      'block_load_url': '🌐 URL से मॉडल लोड करें [LINK]',
      'block_cam_on': '📷 [MODO] मोड में कैमरा चालू करें',
      'block_cam_off': '❌ कैमरा बंद करें',
      'reporter_cam_x': '📷 कैमरा X निर्देशांक',
      'reporter_cam_y': '📷 कैमरा Y निर्देशांक',
      'reporter_class': 'पहचानी गई कक्षा',
      'reporter_confidence': 'सटीकता %',
      'boolean_is_class': 'क्या [CLASE] वर्ग देखता है?',
      'reporter_labels': 'प्रशिक्षित कक्षाओं की सूची',
      'menu_mode_fixed': 'स्थिर फ्लोटिंग',
      'menu_mode_draggable': 'खींचने योग्य फ्लोटिंग',
      'menu_mode_ar': 'मंच पृष्ठभूमि (वर्धित वास्तविकता)',
      'status_nothing': 'कुछ नहीं',
      'status_waiting_model': 'मॉडल की प्रतीक्षा'
    },
    'tr': {
      'ext_name': 'YZ: Teachable Machine',
      'block_load_local': '📁 YEREL DOSYALARI YÜKLE (.json ve .bin)',
      'block_load_url': '🌐 URL\'DEN MODEL YÜKLE [LINK]',
      'block_cam_on': '📷 kamerayı modda aç: [MODO]',
      'block_cam_off': '❌ KAMERAYI KAPAT',
      'reporter_cam_x': '📷 kamera X koordinatı',
      'reporter_cam_y': '📷 kamera Y koordinatı',
      'reporter_class': 'tespit edilen sınıf',
      'reporter_confidence': 'doğruluk %',
      'boolean_is_class': '[CLASE] sınıfını görüyor mu?',
      'reporter_labels': 'eğitilmiş sınıflar listesi',
      'menu_mode_fixed': 'SABİT YÜZEN',
      'menu_mode_draggable': 'SÜRÜKLENEBİLİR YÜZEN',
      'menu_mode_ar': 'SAHNE ARKAPLANI (ARTIRILMIŞ GERÇEKLİK)',
      'status_nothing': 'HİÇBİR ŞEY',
      'status_waiting_model': 'MODEL BEKLENİYOR'
    },
    'pl': {
      'ext_name': 'SI: Teachable Machine',
      'block_load_local': '📁 WCZYTAJ PLIKI LOKALNE (.json i .bin)',
      'block_load_url': '🌐 WCZYTAJ MODEL Z URL [LINK]',
      'block_cam_on': '📷 włącz kamerę w trybie: [MODO]',
      'block_cam_off': '❌ WYŁĄCZ KAMERĘ',
      'reporter_cam_x': '📷 współrzędna X kamery',
      'reporter_cam_y': '📷 współrzędna Y kamery',
      'reporter_class': 'wykryta klasa',
      'reporter_confidence': 'dokładność %',
      'boolean_is_class': 'czy widzi klasę [CLASE]?',
      'reporter_labels': 'lista wytrenowanych klas',
      'menu_mode_fixed': 'STAŁY WISZĄCY',
      'menu_mode_draggable': 'PRZECIĄGALNY WISZĄCY',
      'menu_mode_ar': 'TŁO SCENY (RZECZYWISTOŚĆ ROZSZERZONA)',
      'status_nothing': 'NIC',
      'status_waiting_model': 'OCZEKIWANIE NA MODEL'
    },
    'nl': {
      'ext_name': 'AI: Teachable Machine',
      'block_load_local': '📁 LOKALE BESTANDEN LADEN (.json en .bin)',
      'block_load_url': '🌐 MODEL LADEN VAN URL [LINK]',
      'block_cam_on': '📷 camera inschakelen in modus: [MODO]',
      'block_cam_off': '❌ CAMERA UITSCHAKELEN',
      'reporter_cam_x': '📷 camera X-coördinaat',
      'reporter_cam_y': '📷 camera Y-coördinaat',
      'reporter_class': 'gedetecteerde klasse',
      'reporter_confidence': 'nauwkeurigheid %',
      'boolean_is_class': 'ziet de klas [CLASE]?',
      'reporter_labels': 'lijst van getrainde klassen',
      'menu_mode_fixed': 'VAST ZWEVEND',
      'menu_mode_draggable': 'SLEEPBAAR ZWEVEND',
      'menu_mode_ar': 'PODIUMACHTERGROND (AUGMENTED REALITY)',
      'status_nothing': 'NIETS',
      'status_waiting_model': 'WACHTEN OP MODEL'
    }
  };

  const t = key => {
    const locale = window.currentRecLocale || 'es';
    return (I18N_BLOCKS[locale] && I18N_BLOCKS[locale][key]) || I18N_BLOCKS['es'][key] || key;
  };

  const _REC_CAMERA_URL = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
    ? window.location.origin + '/Laboratorio-IA/extensionesrec/recCamera.js'
    : 'https://cdn.jsdelivr.net/gh/ROBOTICAENCOLEGIOS/Laboratorio-IA@main/extensionesrec/recCamera.js';

  class IATeachableREC {
    constructor() {
      this.model         = null;
      this._predicting   = false;
      this.modelLabels   = [t('status_waiting_model')];
      this.detectedClass = t('status_nothing');
      this.confidence    = 0;
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

    async _ensureLibs() {
      if (!window.tf) {
        await this._loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.11.0/dist/tf.min.js");
      }
      if (!window.tmImage) {
        await this._loadScript("https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.5/dist/teachablemachine-image.min.js");
      }
    }

    _getDynamicLabels() {
      return this.modelLabels.length > 0 ? this.modelLabels : [t('status_waiting_model')];
    }

    getInfo() {
      return {
        id: 'iaTeachableREC',
        name: t('ext_name'),
        color1: '#8B5CF6',
        blocks: [
          { opcode: 'cargarArchivosLocales', blockType: Scratch.BlockType.COMMAND, text: t('block_load_local') },
          {
            opcode: 'cargarDesdeURL',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_load_url'),
            arguments: {
              LINK: { type: Scratch.ArgumentType.STRING, defaultValue: 'https://teachablemachine.withgoogle.com/models/XXXXX/' }
            }
          },
          {
            opcode: 'encenderCamara',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_cam_on'),
            arguments: { MODO: { type: Scratch.ArgumentType.STRING, menu: 'MODO_CAMARA' } }
          },
          { opcode: 'detenerCamara', blockType: Scratch.BlockType.COMMAND, text: t('block_cam_off') },
          "---",
          { opcode: 'getCamaraX', blockType: Scratch.BlockType.REPORTER, text: t('reporter_cam_x') },
          { opcode: 'getCamaraY', blockType: Scratch.BlockType.REPORTER, text: t('reporter_cam_y') },
          "---",
          { opcode: 'getClass',      blockType: Scratch.BlockType.REPORTER, text: t('reporter_class') },
          { opcode: 'getConfidence', blockType: Scratch.BlockType.REPORTER, text: t('reporter_confidence') },
          {
            opcode: 'isClass',
            blockType: Scratch.BlockType.BOOLEAN,
            text: t('boolean_is_class'),
            arguments: { CLASE: { type: Scratch.ArgumentType.STRING, menu: 'DYNAMIC_CLASSES' } }
          },
          { opcode: 'getLabels', blockType: Scratch.BlockType.REPORTER, text: t('reporter_labels') }
        ],
        menus: {
          MODO_CAMARA: {
            items: [
              { text: t('menu_mode_fixed'), value: 'FLOTANTE FIJA' },
              { text: t('menu_mode_draggable'), value: 'FLOTANTE ARRASTRABLE' },
              { text: t('menu_mode_ar'), value: 'FONDO DE ESCENARIO (REALIDAD AUMENTADA)' }
            ]
          },
          DYNAMIC_CLASSES: {
            items: '_getDynamicLabels'
          }
        }
      };
    }

    async cargarArchivosLocales() {
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.json,.bin';
        input.onchange = async (e) => {
          const files = Array.from(e.target.files);
          const modelFile    = files.find(f => f.name === 'model.json');
          const metadataFile = files.find(f => f.name === 'metadata.json');
          const weightsFile  = files.find(f => f.name.endsWith('.bin'));
          if (!modelFile || !metadataFile || !weightsFile) {
            console.error('IA Teachable: seleccioná model.json, metadata.json y el archivo .bin');
            resolve();
            return;
          }
          try {
            await this._ensureLibs();
            this.model = await window.tmImage.loadFromFiles(modelFile, weightsFile, metadataFile);
            this.modelLabels = this.model.getClassLabels().map(l => l.toUpperCase());
          } catch (err) {
            console.error('IA Teachable: error cargando archivos →', err);
          }
          resolve();
        };
        input.click();
      });
    }

    async cargarDesdeURL(args) {
      let url = args.LINK.trim();
      if (!url.endsWith('/')) url += '/';
      try {
        await this._ensureLibs();
        this.model = await window.tmImage.load(url + 'model.json', url + 'metadata.json');
        this.modelLabels = this.model.getClassLabels().map(l => l.toUpperCase());
      } catch (err) {
        console.error('IA Teachable: error cargando URL →', err);
      }
    }

    async encenderCamara(args) {
      if (window.RECCamera && window.RECCamera.video) return;
      await this._ensureCamera();
      const video = await window.RECCamera.start(args.MODO, '#8B5CF6');
      if (video) this._loop();
    }

    detenerCamara() {
      this._predicting = false;
      if (window.RECCamera) window.RECCamera.stop();
      this.detectedClass = t('status_nothing');
      this.confidence    = 0;
    }

    async _loop() {
      const cam = window.RECCamera;
      if (!cam || !cam.video) return;

      if (this.model && cam.video.readyState >= 2 && !this._predicting) {
        this._predicting = true;
        try {
          const predictions = await this.model.predict(cam.video);
          if (predictions && predictions.length > 0) {
            const top = predictions.sort((a, b) => b.probability - a.probability)[0];
            if (top.probability >= 0.4) {
              this.detectedClass = top.className.toUpperCase();
              this.confidence    = Math.round(top.probability * 100);
            } else {
              this.detectedClass = t('status_nothing');
              this.confidence    = 0;
            }
          }
        } catch (e) {}
        this._predicting = false;
      }

      requestAnimationFrame(() => this._loop());
    }

    getCamaraX()    { return window.RECCamera ? Math.round(window.RECCamera.camaraX) : 0; }
    getCamaraY()    { return window.RECCamera ? Math.round(window.RECCamera.camaraY) : 0; }
    getClass()      { return this.detectedClass; }
    getConfidence() { return this.confidence; }
    isClass(args)   { return this.detectedClass === args.CLASE; }
    getLabels()     { return this.modelLabels.join(', '); }
  }

  Scratch.extensions.register(new IATeachableREC());
})(Scratch);
