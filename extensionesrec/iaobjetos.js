/**
 * IA: Detección de Objetos - RoboticaEnColegios R.E.C.
 * Detecta objetos cotidianos con COCO-SSD (TensorFlow.js).
 * Cámara centralizada vía window.RECCamera (recCamera.js).
 */

(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Debe ejecutarse en modo unsandboxed.');
  }

  const _REC_CAMERA_URL = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
    ? window.location.origin + '/Laboratorio-IA/extensionesrec/recCamera.js'
    : 'https://cdn.jsdelivr.net/gh/ROBOTICAENCOLEGIOS/Laboratorio-IA@main/extensionesrec/recCamera.js';

  // Diccionario de internacionalización para la extensión
  const I18N_BLOCKS = {
    es: {
      ext_name: 'IA: Detección de Objetos',
      block_load_model: '⏳ CARGAR MODELO DE OBJETOS',
      block_cam_on: '📷 encender cámara en modo: [MODO]',
      block_cam_off: '❌ APAGAR CÁMARA OBJETOS',
      block_object: 'objeto detectado',
      block_confidence: 'exactitud %',
      block_category: '¿ve categoría [CATEGORIA]?',
      block_pos_x: 'posición X del objeto',
      block_pos_y: 'posición Y del objeto',
      mode_draggable: 'FLOTANTE ARRASTRABLE',
      mode_ar: 'FONDO DE ESCENARIO (REALIDAD AUMENTADA)',
      cat_person: 'PERSONA',
      cat_animal: 'ANIMAL',
      cat_vehicle: 'VEHÍCULO',
      cat_food: 'COMIDA',
      cat_electronics: 'ELECTRÓNICA',
      cat_furniture: 'MUEBLE',
      cat_sport: 'DEPORTE',
      status_nothing: 'NADA'
    },
    en: {
      ext_name: 'AI: Object Detection',
      block_load_model: '⏳ LOAD OBJECT MODEL',
      block_cam_on: '📷 turn camera on in mode: [MODO]',
      block_cam_off: '❌ TURN OFF CAMERA',
      block_object: 'detected object',
      block_confidence: 'accuracy %',
      block_category: 'sees category [CATEGORIA]?',
      block_pos_x: 'object X position',
      block_pos_y: 'object Y position',
      mode_draggable: 'DRAGGABLE FLOATING',
      mode_ar: 'STAGE BACKGROUND (AUGMENTED REALITY)',
      cat_person: 'PERSON',
      cat_animal: 'ANIMAL',
      cat_vehicle: 'VEHICLE',
      cat_food: 'FOOD',
      cat_electronics: 'ELECTRONICS',
      cat_furniture: 'FURNITURE',
      cat_sport: 'SPORT',
      status_nothing: 'NOTHING'
    },
    pt: {
      ext_name: 'IA: Detecção de Objetos',
      block_load_model: '⏳ CARREGAR MODELO DE OBJETOS',
      block_cam_on: '📷 ligar câmera no modo: [MODO]',
      block_cam_off: '❌ DESLIGAR CÂMERA',
      block_object: 'objeto detectado',
      block_confidence: 'precisão %',
      block_category: 'vê categoria [CATEGORIA]?',
      block_pos_x: 'posição X do objeto',
      block_pos_y: 'posição Y do objeto',
      mode_draggable: 'FLUTUANTE ARRASTÁVEL',
      mode_ar: 'FUNDO DO PALCO (REALIDADE AUMENTADA)',
      cat_person: 'PESSOA',
      cat_animal: 'ANIMAL',
      cat_vehicle: 'VEÍCULO',
      cat_food: 'COMIDA',
      cat_electronics: 'ELETRÔNICA',
      cat_furniture: 'MÓVEL',
      cat_sport: 'ESPORTE',
      status_nothing: 'NADA'
    },
    fr: {
      ext_name: 'IA: Détection d\'Objets',
      block_load_model: '⏳ CHARGER LE MODÈLE D\'OBJETS',
      block_cam_on: '📷 allumer la caméra en mode: [MODO]',
      block_cam_off: '❌ ÉTEINDRE LA CAMÉRA',
      block_object: 'objet détecté',
      block_confidence: 'précision %',
      block_category: 'voit la catégorie [CATEGORIA]?',
      block_pos_x: 'position X de l\'objet',
      block_pos_y: 'position Y de l\'objet',
      mode_draggable: 'FLOTTANT DÉPLAÇABLE',
      mode_ar: 'ARRIÈRE-PLAN (RÉALITÉ AUGMENTÉE)',
      cat_person: 'PERSONNE',
      cat_animal: 'ANIMAL',
      cat_vehicle: 'VÉHICULE',
      cat_food: 'NOURRITURE',
      cat_electronics: 'ÉLECTRONIQUE',
      cat_furniture: 'MEUBLE',
      cat_sport: 'SPORT',
      status_nothing: 'RIEN'
    },
    de: {
      ext_name: 'KI: Objekterkennung',
      block_load_model: '⏳ OBJEKTMODEL LADEN',
      block_cam_on: '📷 Kamera einschalten im Modus: [MODO]',
      block_cam_off: '❌ KAMERA AUSSCHALTEN',
      block_object: 'erkanntes Objekt',
      block_confidence: 'Genauigkeit %',
      block_category: 'sieht Kategorie [CATEGORIA]?',
      block_pos_x: 'Objekt X-Position',
      block_pos_y: 'Objekt Y-Position',
      mode_draggable: 'VERSCHIEBBAR SCHWEBEND',
      mode_ar: 'BÜHNENHINTERGRUND (ERWEITERTE REALITÄT)',
      cat_person: 'PERSON',
      cat_animal: 'TIER',
      cat_vehicle: 'FAHRZEUG',
      cat_food: 'ESSEN',
      cat_electronics: 'ELEKTRONIK',
      cat_furniture: 'MÖBEL',
      cat_sport: 'SPORT',
      status_nothing: 'NICHTS'
    },
    it: {
      ext_name: 'IA: Rilevamento Oggetti',
      block_load_model: '⏳ CARICA MODELLO OGGETTI',
      block_cam_on: '📷 accendi fotocamera in modalità: [MODO]',
      block_cam_off: '❌ SPEGNI FOTOCAMERA',
      block_object: 'oggetto rilevato',
      block_confidence: 'accuratezza %',
      block_category: 'vede categoria [CATEGORIA]?',
      block_pos_x: 'posizione X oggetto',
      block_pos_y: 'posizione Y oggetto',
      mode_draggable: 'FLUTTUANTE TRASCINABILE',
      mode_ar: 'SFONDO PALCO (REALTÀ AUMENTATA)',
      cat_person: 'PERSONA',
      cat_animal: 'ANIMALE',
      cat_vehicle: 'VEICOLO',
      cat_food: 'CIBO',
      cat_electronics: 'ELETTRONICA',
      cat_furniture: 'MOBILE',
      cat_sport: 'SPORT',
      status_nothing: 'NULLA'
    },
    zh: {
      ext_name: 'AI: 物体检测',
      block_load_model: '⏳ 加载物体模型',
      block_cam_on: '📷 以模式开启摄像头: [MODO]',
      block_cam_off: '❌ 关闭摄像头',
      block_object: '检测到的物体',
      block_confidence: '准确度 %',
      block_category: '看到类别 [CATEGORIA]?',
      block_pos_x: '物体 X 位置',
      block_pos_y: '物体 Y 位置',
      mode_draggable: '可拖动浮动',
      mode_ar: '舞台背景 (增强现实)',
      cat_person: '人物',
      cat_animal: '动物',
      cat_vehicle: '车辆',
      cat_food: '食物',
      cat_electronics: '电子产品',
      cat_furniture: '家具',
      cat_sport: '运动',
      status_nothing: '无'
    },
    ja: {
      ext_name: 'AI: 物体検出',
      block_load_model: '⏳ 物体モデルをロード',
      block_cam_on: '📷 カメラをオンにする (モード: [MODO])',
      block_cam_off: '❌ カメラをオフにする',
      block_object: '検出された物体',
      block_confidence: '精度 %',
      block_category: 'カテゴリ [CATEGORIA] を見ている?',
      block_pos_x: '物体 X 位置',
      block_pos_y: '物体 Y 位置',
      mode_draggable: 'ドラッグ可能フローティング',
      mode_ar: 'ステージ背景 (拡張現実)',
      cat_person: '人物',
      cat_animal: '動物',
      cat_vehicle: '乗り物',
      cat_food: '食べ物',
      cat_electronics: '電子機器',
      cat_furniture: '家具',
      cat_sport: 'スポーツ',
      status_nothing: 'なし'
    },
    ko: {
      ext_name: 'AI: 물체 감지',
      block_load_model: '⏳ 물체 모델 로드',
      block_cam_on: '📷 카메라 켜기 (모드: [MODO])',
      block_cam_off: '❌ 카메라 끄기',
      block_object: '감지된 물체',
      block_confidence: '정확도 %',
      block_category: '카테고리 [CATEGORIA] 보는 중?',
      block_pos_x: '물체 X 위치',
      block_pos_y: '물체 Y 위치',
      mode_draggable: '드래그 가능 플로팅',
      mode_ar: '스테이지 배경 (증강 현실)',
      cat_person: '사람',
      cat_animal: '동물',
      cat_vehicle: '차량',
      cat_food: '음식',
      cat_electronics: '전자제품',
      cat_furniture: '가구',
      cat_sport: '스포츠',
      status_nothing: '없음'
    },
    ru: {
      ext_name: 'ИИ: Обнаружение Объектов',
      block_load_model: '⏳ ЗАГРУЗИТЬ МОДЕЛЬ ОБЪЕКТОВ',
      block_cam_on: '📷 включить камеру в режиме: [MODO]',
      block_cam_off: '❌ ВЫКЛЮЧИТЬ КАМЕРУ',
      block_object: 'обнаруженный объект',
      block_confidence: 'точность %',
      block_category: 'видит категорию [CATEGORIA]?',
      block_pos_x: 'позиция X объекта',
      block_pos_y: 'позиция Y объекта',
      mode_draggable: 'ПЕРЕТАСКИВАЕМОЕ ПЛАВАЮЩЕЕ',
      mode_ar: 'ФОН СЦЕНЫ (ДОПОЛНЕННАЯ РЕАЛЬНОСТЬ)',
      cat_person: 'ЧЕЛОВЕК',
      cat_animal: 'ЖИВОТНОЕ',
      cat_vehicle: 'ТРАНСПОРТ',
      cat_food: 'ЕДА',
      cat_electronics: 'ЭЛЕКТРОНИКА',
      cat_furniture: 'МЕБЕЛЬ',
      cat_sport: 'СПОРТ',
      status_nothing: 'НИЧЕГО'
    },
    ar: {
      ext_name: 'الذكاء الاصطناعي: كشف الأشياء',
      block_load_model: '⏳ تحميل نموذج الأشياء',
      block_cam_on: '📷 تشغيل الكاميرا في الوضع: [MODO]',
      block_cam_off: '❌ إيقاف الكاميرا',
      block_object: 'الكائن المكتشف',
      block_confidence: 'دقة %',
      block_category: 'يرى الفئة [CATEGORIA]؟',
      block_pos_x: 'موقع X للكائن',
      block_pos_y: 'موقع Y للكائن',
      mode_draggable: 'عائمة قابلة للسحب',
      mode_ar: 'خلفية المسرح (الواقع المعزز)',
      cat_person: 'شخص',
      cat_animal: 'حيوان',
      cat_vehicle: 'مركبة',
      cat_food: 'طعام',
      cat_electronics: 'إلكترونيات',
      cat_furniture: 'أثاث',
      cat_sport: 'رياضة',
      status_nothing: 'لا شيء'
    },
    hi: {
      ext_name: 'AI: वस्तु पहचान',
      block_load_model: '⏳ वस्तु मॉडल लोड करें',
      block_cam_on: '📷 कैमरा मोड में चालू करें: [MODO]',
      block_cam_off: '❌ कैमरा बंद करें',
      block_object: 'पता लगाई गई वस्तु',
      block_confidence: 'सटीकता %',
      block_category: 'श्रेणी [CATEGORIA] देखता है?',
      block_pos_x: 'वस्तु X स्थिति',
      block_pos_y: 'वस्तु Y स्थिति',
      mode_draggable: 'खींचने योग्य तैरता हुआ',
      mode_ar: 'स्टेज पृष्ठभूमि (विस्तारित वास्तविकता)',
      cat_person: 'व्यक्ति',
      cat_animal: 'जानवर',
      cat_vehicle: 'वाहन',
      cat_food: 'भोजन',
      cat_electronics: 'इलेक्ट्रॉनिक्स',
      cat_furniture: 'फर्नीचर',
      cat_sport: 'खेल',
      status_nothing: 'कुछ नहीं'
    },
    tr: {
      ext_name: 'Yapay Zeka: Nesne Algılama',
      block_load_model: '⏳ NESNE MODELİNİ YÜKLE',
      block_cam_on: '📷 kamera modunda aç: [MODO]',
      block_cam_off: '❌ KAMERAYI KAPAT',
      block_object: 'algılanan nesne',
      block_confidence: 'doğruluk %',
      block_category: 'kategori [CATEGORIA] görüyor mu?',
      block_pos_x: 'nesne X konumu',
      block_pos_y: 'nesne Y konumu',
      mode_draggable: 'SÜRÜKLENEBİLİR YÜZEN',
      mode_ar: 'SAHNE ARKA PLANI (ARTIRILMIŞ GERÇEKLİK)',
      cat_person: 'KİŞİ',
      cat_animal: 'HAYVAN',
      cat_vehicle: 'ARAÇ',
      cat_food: 'YİYECEK',
      cat_electronics: 'ELEKTRONİK',
      cat_furniture: 'MOBİLYA',
      cat_sport: 'SPOR',
      status_nothing: 'HİÇBİR ŞEY'
    },
    pl: {
      ext_name: 'AI: Wykrywanie Obiektów',
      block_load_model: '⏳ ZAŁADUJ MODEL OBIEKTÓW',
      block_cam_on: '📷 włącz kamerę w trybie: [MODO]',
      block_cam_off: '❌ WYŁĄCZ KAMERĘ',
      block_object: 'wykryty obiekt',
      block_confidence: 'dokładność %',
      block_category: 'widzi kategorię [CATEGORIA]?',
      block_pos_x: 'pozycja X obiektu',
      block_pos_y: 'pozycja Y obiektu',
      mode_draggable: 'PRZENOSZONY PŁAWĄCY',
      mode_ar: 'TŁO SCENY (ROZSZERZONA RZECZYWISTOŚĆ)',
      cat_person: 'OSOBA',
      cat_animal: 'ZWIERZĘ',
      cat_vehicle: 'POJAZD',
      cat_food: 'JEDZENIE',
      cat_electronics: 'ELEKTRONIKA',
      cat_furniture: 'MEBLE',
      cat_sport: 'SPORT',
      status_nothing: 'NIC'
    },
    nl: {
      ext_name: 'AI: Objectdetectie',
      block_load_model: '⏳ OBJECTMODEL LADEN',
      block_cam_on: '📷 camera aanzetten in modus: [MODO]',
      block_cam_off: '❌ CAMERA UITZETTEN',
      block_object: 'gedetecteerd object',
      block_confidence: 'nauwkeurigheid %',
      block_category: 'ziet categorie [CATEGORIA]?',
      block_pos_x: 'object X-positie',
      block_pos_y: 'object Y-positie',
      mode_draggable: 'SLEEPBARE DREVENDE',
      mode_ar: 'PODIUMACHTERGROND (AUGMENTED REALITY)',
      cat_person: 'PERSOON',
      cat_animal: 'DIER',
      cat_vehicle: 'VOERTUIG',
      cat_food: 'VOEDSEL',
      cat_electronics: 'ELEKTRONICA',
      cat_furniture: 'MEUBELS',
      cat_sport: 'SPORT',
      status_nothing: 'NIETS'
    }
  };

  // Función de traducción dinámica
  const t = key => {
    const locale = window.currentRecLocale || 'es';
    return (I18N_BLOCKS[locale] && I18N_BLOCKS[locale][key]) || I18N_BLOCKS['es'][key] || key;
  };

  // Diccionario de traducción COCO → español (80 clases COCO-SSD cubiertas)
  const _OBJ_ES = {
    'person':         'PERSONA',
    'bicycle':        'BICICLETA',
    'car':            'AUTO',
    'motorcycle':     'MOTO',
    'bus':            'COLECTIVO',
    'truck':          'CAMIÓN',
    'cat':            'GATO',
    'dog':            'PERRO',
    'horse':          'CABALLO',
    'sheep':          'OVEJA',
    'cow':            'VACA',
    'bird':           'PÁJARO',
    'bottle':         'BOTELLA',
    'chair':          'SILLA',
    'cup':            'TAZA',
    'book':           'LIBRO',
    'cell phone':     'CELULAR',
    'laptop':         'COMPUTADORA',
    'keyboard':       'TECLADO',
    'mouse':          'MOUSE',
    'tv':             'TELEVISOR',
    'backpack':       'MOCHILA',
    'handbag':        'CARTERA',
    'scissors':       'TIJERA',
    'clock':          'RELOJ',
    'remote':         'CONTROL REMOTO',
    'umbrella':       'PARAGUAS',
    'apple':          'MANZANA',
    'banana':         'BANANA',
    'orange':         'NARANJA',
    'pizza':          'PIZZA',
    'fork':           'TENEDOR',
    'knife':          'CUCHILLO',
    'spoon':          'CUCHARA',
    'bowl':           'TAZÓN',
    'sports ball':    'PELOTA',
    'baseball bat':   'BATE',
    'teddy bear':     'OSO DE PELUCHE',
    'traffic light':  'SEMÁFORO',
    'stop sign':      'SEÑAL STOP',
    'bench':          'BANCO',
    'potted plant':   'PLANTA',
    'vase':           'JARRÓN',
    'toothbrush':     'CEPILLO',
    'suitcase':       'VALIJA',
    'tie':            'CORBATA',
    'skis':           'ESQUÍS',
    'surfboard':      'TABLA DE SURF',
    'tennis racket':  'RAQUETA',
    'wine glass':     'COPA',
    'couch':          'SILLÓN',
    'dining table':   'MESA',
    'toilet':         'BAÑO',
    'bed':            'CAMA',
    'refrigerator':   'HELADERA',
    'oven':           'HORNO',
    'sink':           'PILETA',
    'microwave':      'MICROONDAS',
    'toaster':        'TOSTADORA',
    'airplane':       'AVIÓN',
    'train':          'TREN',
    'boat':           'BARCO',
    'fire hydrant':   'HIDRANTE',
    'parking meter':  'PARQUÍMETRO',
    'elephant':       'ELEFANTE',
    'bear':           'OSO',
    'zebra':          'CEBRA',
    'giraffe':        'JIRAFA',
    'frisbee':        'FRISBEE',
    'snowboard':      'SNOWBOARD',
    'kite':           'BARRILETE',
    'baseball glove': 'GUANTE BÉISBOL',
    'skateboard':     'SKATE',
    'hot dog':        'PANCHO',
    'sandwich':       'SÁNDWICH',
    'carrot':         'ZANAHORIA',
    'broccoli':       'BRÓCOLI',
    'donut':          'ROSQUILLA',
    'cake':           'TORTA',
    'hair drier':     'SECADORA'
  };

  // Supercategorías COCO → taxonomía para el bloque booleano
  const _CAT_MAP = {
    'person':         'PERSONA',
    // ANIMAL
    'bird':           'ANIMAL', 'cat':            'ANIMAL', 'dog':            'ANIMAL',
    'horse':          'ANIMAL', 'sheep':          'ANIMAL', 'cow':            'ANIMAL',
    'elephant':       'ANIMAL', 'bear':           'ANIMAL', 'zebra':          'ANIMAL',
    'giraffe':        'ANIMAL',
    // VEHÍCULO
    'bicycle':        'VEHÍCULO', 'car':           'VEHÍCULO', 'motorcycle':    'VEHÍCULO',
    'airplane':       'VEHÍCULO', 'bus':           'VEHÍCULO', 'train':         'VEHÍCULO',
    'truck':          'VEHÍCULO', 'boat':          'VEHÍCULO',
    // COMIDA (alimentos + bebidas + utensilios)
    'bottle':         'COMIDA', 'wine glass':     'COMIDA', 'cup':            'COMIDA',
    'fork':           'COMIDA', 'knife':          'COMIDA', 'spoon':          'COMIDA',
    'bowl':           'COMIDA', 'banana':         'COMIDA', 'apple':          'COMIDA',
    'sandwich':       'COMIDA', 'orange':         'COMIDA', 'broccoli':       'COMIDA',
    'carrot':         'COMIDA', 'hot dog':        'COMIDA', 'pizza':          'COMIDA',
    'donut':          'COMIDA', 'cake':           'COMIDA',
    // ELECTRÓNICA
    'tv':             'ELECTRÓNICA', 'laptop':        'ELECTRÓNICA', 'mouse':         'ELECTRÓNICA',
    'remote':         'ELECTRÓNICA', 'keyboard':      'ELECTRÓNICA', 'cell phone':    'ELECTRÓNICA',
    'microwave':      'ELECTRÓNICA', 'oven':          'ELECTRÓNICA', 'toaster':       'ELECTRÓNICA',
    'refrigerator':   'ELECTRÓNICA',
    // MUEBLE
    'chair':          'MUEBLE', 'couch':          'MUEBLE', 'potted plant':   'MUEBLE',
    'bed':            'MUEBLE', 'dining table':   'MUEBLE', 'toilet':         'MUEBLE',
    'sink':           'MUEBLE', 'bench':          'MUEBLE',
    // DEPORTE
    'frisbee':        'DEPORTE', 'skis':          'DEPORTE', 'snowboard':      'DEPORTE',
    'sports ball':    'DEPORTE', 'kite':          'DEPORTE', 'baseball bat':   'DEPORTE',
    'baseball glove': 'DEPORTE', 'skateboard':    'DEPORTE', 'surfboard':      'DEPORTE',
    'tennis racket':  'DEPORTE'
  };

  class IAObjetosREC {
    constructor() {
      this.model       = null;
      this.modelReady  = false;
      this._detecting  = false;
      this.object      = t('status_nothing');
      this.confidence  = 0;
      this.posX        = 0;
      this.posY        = 0;
      this._rawClass   = '';
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

    async cargarModelo() {
      if (this.modelReady) return;
      try {
        await this._loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");
        await this._loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd");
        this.model = await window.cocoSsd.load({ base: 'lite_mobilenet_v2' });
        this.modelReady = true;
      } catch (e) {
        console.error("IA Objetos: error cargando COCO-SSD →", e);
      }
    }

    getInfo() {
      return {
        id: 'iaObjetosREC',
        name: t('ext_name'),
        color1: '#F43F5E',
        blocks: [
          { opcode: 'cargarModelo', blockType: Scratch.BlockType.COMMAND, text: t('block_load_model') },
          {
            opcode: 'encenderCamara',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_cam_on'),
            arguments: { MODO: { type: Scratch.ArgumentType.STRING, menu: 'MODO_CAMARA' } }
          },
          { opcode: 'detenerCamara', blockType: Scratch.BlockType.COMMAND, text: t('block_cam_off') },
          "---",
          { opcode: 'getObject',     blockType: Scratch.BlockType.REPORTER, text: t('block_object') },
          { opcode: 'getConfidence', blockType: Scratch.BlockType.REPORTER, text: t('block_confidence') },
          {
            opcode: 'isCategory',
            blockType: Scratch.BlockType.BOOLEAN,
            text: t('block_category'),
            arguments: { CATEGORIA: { type: Scratch.ArgumentType.STRING, menu: 'CATEGORY_MENU' } }
          },
          { opcode: 'getPosX', blockType: Scratch.BlockType.REPORTER, text: t('block_pos_x') },
          { opcode: 'getPosY', blockType: Scratch.BlockType.REPORTER, text: t('block_pos_y') }
        ],
        menus: {
          MODO_CAMARA: {
            items: [
              { text: t('mode_draggable'), value: 'FLOTANTE ARRASTRABLE' },
              { text: t('mode_ar'), value: 'FONDO DE ESCENARIO (REALIDAD AUMENTADA)' }
            ]
          },
          CATEGORY_MENU: {
            items: [
              { text: t('cat_person'), value: 'PERSONA' },
              { text: t('cat_animal'), value: 'ANIMAL' },
              { text: t('cat_vehicle'), value: 'VEHÍCULO' },
              { text: t('cat_food'), value: 'COMIDA' },
              { text: t('cat_electronics'), value: 'ELECTRÓNICA' },
              { text: t('cat_furniture'), value: 'MUEBLE' },
              { text: t('cat_sport'), value: 'DEPORTE' }
            ]
          }
        }
      };
    }

    async encenderCamara(args) {
      if (window.RECCamera && window.RECCamera.video) return;
      await this._ensureCamera();
      const video = await window.RECCamera.start(args.MODO, '#F43F5E');
      if (video) this._loop();
    }

    detenerCamara() {
      this._detecting = false;
      if (window.RECCamera) window.RECCamera.stop();
      this.object     = t('status_nothing');
      this.confidence = 0;
      this.posX       = 0;
      this.posY       = 0;
      this._rawClass  = '';
      // Anti-crash: liberar modelo y tensores residuales de TensorFlow.js
      if (this.model && typeof this.model.dispose === 'function') {
        try { this.model.dispose(); } catch (e) {}
        this.model = null;
        this.modelReady = false;
      }
      try { if (window.tf) window.tf.disposeVariables(); } catch (e) {}
    }

    async _loop() {
      const cam = window.RECCamera;
      if (!cam || !cam.video) return;

      if (this.modelReady && cam.video.readyState >= 2 && !this._detecting) {
        this._detecting = true;
        try {
          const predictions = await this.model.detect(cam.video);

          if (predictions && predictions.length > 0) {
            const top = predictions.sort((a, b) => b.score - a.score)[0];
            if (top.score >= 0.4) {
              this.object     = _OBJ_ES[top.class] || top.class.toUpperCase();
              this.confidence = Math.round(top.score * 100);
              this._rawClass  = top.class;
              const [bx, by, bw, bh] = top.bbox;
              const cx = bx + bw / 2;
              const cy = by + bh / 2;
              this.posX = Math.round((0.5 - cx / 480) * 480);
              this.posY = Math.round((0.5 - cy / 360) * 360);
            } else {
              this.object = t('status_nothing'); this.confidence = 0;
              this.posX = 0; this.posY = 0; this._rawClass = '';
            }
          } else {
            this.object = t('status_nothing'); this.confidence = 0;
            this.posX = 0; this.posY = 0; this._rawClass = '';
          }
        } catch (e) {}
        this._detecting = false;
      }

      requestAnimationFrame(() => this._loop());
    }

    getObject()     { return this.object; }
    getConfidence() { return this.confidence; }
    isCategory(args) { return !!this._rawClass && _CAT_MAP[this._rawClass] === args.CATEGORIA; }
    getPosX()       { return this.posX; }
    getPosY()       { return this.posY; }
  }

  Scratch.extensions.register(new IAObjetosREC());
})(Scratch);
