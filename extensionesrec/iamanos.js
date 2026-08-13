/**
 * IA: Visión REC Pro - RoboticaEnColegios R.E.C.
 * Detección de manos y rostros con MediaPipe.
 * Cámara centralizada vía window.RECCamera (recCamera.js).
 */

(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Debe ejecutarse en modo unsandboxed.');
  }

  const I18N_BLOCKS = {
    es: {
      ext_title: 'IA: Visión REC Pro',
      block_camera_on: '📷 encender cámara en modo: [MODO]',
      block_camera_off: '❌ APAGAR cámara e IA',
      block_status: 'estado de la IA',
      block_faces: 'cantidad de rostros',
      block_hands: 'cantidad de manos',
      block_pinch: '¿dedos pellizcando?',
      block_index_x: 'posición X dedo índice',
      block_index_y: 'posición Y dedo índice',
      menu_mode_draggable: 'FLOTANTE ARRASTRABLE',
      menu_mode_background: 'FONDO DE ESCENARIO (REALIDAD AUMENTADA)',
      status_off: 'Apagado',
      status_loading: 'Cargando IA...',
      status_ready: 'Listo para detectar',
      status_error: 'Error: Sin cámara'
    },
    en: {
      ext_title: 'AI: REC Vision Pro',
      block_camera_on: '📷 turn camera on in mode: [MODO]',
      block_camera_off: '❌ TURN OFF camera and AI',
      block_status: 'AI status',
      block_faces: 'number of faces',
      block_hands: 'number of hands',
      block_pinch: 'fingers pinching?',
      block_index_x: 'index finger X position',
      block_index_y: 'index finger Y position',
      menu_mode_draggable: 'FLOATING DRAGGABLE',
      menu_mode_background: 'STAGE BACKGROUND (AUGMENTED REALITY)',
      status_off: 'Off',
      status_loading: 'Loading AI...',
      status_ready: 'Ready to detect',
      status_error: 'Error: No camera'
    },
    pt: {
      ext_title: 'IA: Visão REC Pro',
      block_camera_on: '📷 ligar câmera no modo: [MODO]',
      block_camera_off: '❌ DESLIGAR câmera e IA',
      block_status: 'estado da IA',
      block_faces: 'quantidade de rostos',
      block_hands: 'quantidade de mãos',
      block_pinch: 'dedos pinçando?',
      block_index_x: 'posição X dedo indicador',
      block_index_y: 'posição Y dedo indicador',
      menu_mode_draggable: 'FLUTUANTE ARRASTÁVEL',
      menu_mode_background: 'FUNDO DO PALCO (REALIDADE AUMENTADA)',
      status_off: 'Desligado',
      status_loading: 'Carregando IA...',
      status_ready: 'Pronto para detectar',
      status_error: 'Erro: Sem câmera'
    },
    fr: {
      ext_title: 'IA: Vision REC Pro',
      block_camera_on: '📷 allumer caméra en mode: [MODO]',
      block_camera_off: '❌ ÉTEINDRE caméra et IA',
      block_status: 'état de l\'IA',
      block_faces: 'nombre de visages',
      block_hands: 'nombre de mains',
      block_pinch: 'doigts pincés?',
      block_index_x: 'position X doigt index',
      block_index_y: 'position Y doigt index',
      menu_mode_draggable: 'FLOTTANT DÉPLAÇABLE',
      menu_mode_background: 'FOND DE SCÈNE (RÉALITÉ AUGMENTÉE)',
      status_off: 'Éteint',
      status_loading: 'Chargement IA...',
      status_ready: 'Prêt à détecter',
      status_error: 'Erreur: Pas de caméra'
    },
    de: {
      ext_title: 'KI: REC Vision Pro',
      block_camera_on: '📷 Kamera einschalten im Modus: [MODO]',
      block_camera_off: '❌ KAMERA und KI AUSSCHALTEN',
      block_status: 'KI-Status',
      block_faces: 'Anzahl der Gesichter',
      block_hands: 'Anzahl der Hände',
      block_pinch: 'Finger kneifen?',
      block_index_x: 'Zeigefinger X-Position',
      block_index_y: 'Zeigefinger Y-Position',
      menu_mode_draggable: 'SCHWEBEND VERSCHIEBBAR',
      menu_mode_background: 'BÜHNENHINTERGRUND (ERWEITERTE REALITÄT)',
      status_off: 'Aus',
      status_loading: 'KI wird geladen...',
      status_ready: 'Bereit zum Erkennen',
      status_error: 'Fehler: Keine Kamera'
    },
    it: {
      ext_title: 'IA: Visione REC Pro',
      block_camera_on: '📷 accendi telecamera in modalità: [MODO]',
      block_camera_off: '❌ SPEGNI telecamera e IA',
      block_status: 'stato IA',
      block_faces: 'numero di volti',
      block_hands: 'numero di mani',
      block_pinch: 'dita che pizzicano?',
      block_index_x: 'posizione X dito indice',
      block_index_y: 'posizione Y dito indice',
      menu_mode_draggable: 'FLUTTUANTE TRASCINABILE',
      menu_mode_background: 'SFONDO PALCOSCENICO (REALTÀ AUMENTATA)',
      status_off: 'Spento',
      status_loading: 'Caricamento IA...',
      status_ready: 'Pronto a rilevare',
      status_error: 'Errore: Nessuna telecamera'
    },
    zh: {
      ext_title: 'AI: REC Vision Pro',
      block_camera_on: '📷 以模式开启摄像头: [MODO]',
      block_camera_off: '❌ 关闭摄像头和AI',
      block_status: 'AI状态',
      block_faces: '人脸数量',
      block_hands: '手数量',
      block_pinch: '手指捏合?',
      block_index_x: '食指X位置',
      block_index_y: '食指Y位置',
      menu_mode_draggable: '浮动可拖动',
      menu_mode_background: '舞台背景 (增强现实)',
      status_off: '关闭',
      status_loading: '加载AI中...',
      status_ready: '准备检测',
      status_error: '错误: 无摄像头'
    },
    ja: {
      ext_title: 'AI: REC Vision Pro',
      block_camera_on: '📷 カメラをモードでオン: [MODO]',
      block_camera_off: '❌ カメラとAIをオフにする',
      block_status: 'AIの状態',
      block_faces: '顔の数',
      block_hands: '手の数',
      block_pinch: '指がつまんでいる?',
      block_index_x: '人差し指X位置',
      block_index_y: '人差し指Y位置',
      menu_mode_draggable: 'フローティングドラッグ可能',
      menu_mode_background: 'ステージ背景 (拡張現実)',
      status_off: 'オフ',
      status_loading: 'AIを読み込み中...',
      status_ready: '検準備完了',
      status_error: 'エラー: カメラなし'
    },
    ko: {
      ext_title: 'AI: REC Vision Pro',
      block_camera_on: '📷 모드로 카메라 켜기: [MODO]',
      block_camera_off: '❌ 카메라 및 AI 끄기',
      block_status: 'AI 상태',
      block_faces: '얼굴 수',
      block_hands: '손 수',
      block_pinch: '손가락 꼬집기?',
      block_index_x: '검지 X 위치',
      block_index_y: '검지 Y 위치',
      menu_mode_draggable: '플로팅 드래그 가능',
      menu_mode_background: '스테이지 배경 (증강 현실)',
      status_off: '꺼짐',
      status_loading: 'AI 로딩 중...',
      status_ready: '감지 준비 완료',
      status_error: '오류: 카메라 없음'
    },
    ru: {
      ext_title: 'ИИ: REC Vision Pro',
      block_camera_on: '📷 включить камеру в режиме: [MODO]',
      block_camera_off: '❌ ВЫКЛЮЧИТЬ камеру и ИИ',
      block_status: 'статус ИИ',
      block_faces: 'количество лиц',
      block_hands: 'количество рук',
      block_pinch: 'пальцы щипают?',
      block_index_x: 'позиция X указательного пальца',
      block_index_y: 'позиция Y указательного пальца',
      menu_mode_draggable: 'ПЛАВАЮЩАЯ ПЕРЕТАСКИВАЕМАЯ',
      menu_mode_background: 'ФОН СЦЕНЫ (ДОПОЛНЕННАЯ РЕАЛЬНОСТЬ)',
      status_off: 'Выключено',
      status_loading: 'Загрузка ИИ...',
      status_ready: 'Готов к обнаружению',
      status_error: 'Ошибка: Нет камеры'
    },
    ar: {
      ext_title: 'الذكاء الاصطناعي: رؤية REC Pro',
      block_camera_on: '📷 تشغيل الكاميرا في الوضع: [MODO]',
      block_camera_off: '❌ إيقاف تشغيل الكاميرا والذكاء الاصطناعي',
      block_status: 'حالة الذكاء الاصطناعي',
      block_faces: 'عدد الوجوه',
      block_hands: 'عدد الأيدي',
      block_pinch: 'الأصابع تقرص؟',
      block_index_x: 'موضع X إصبع السبابة',
      block_index_y: 'موضع Y إصبع السبابة',
      menu_mode_draggable: 'عائمة قابلة للسحب',
      menu_mode_background: 'خلفية المسرح (الواقع المعزز)',
      status_off: 'إيقاف',
      status_loading: 'جاري تحميل الذكاء الاصطناعي...',
      status_ready: 'جاهز للكشف',
      status_error: 'خطأ: لا توجد كاميرا'
    },
    hi: {
      ext_title: 'AI: REC Vision Pro',
      block_camera_on: '📷 मोड में कैमरा चालू करें: [MODO]',
      block_camera_off: '❌ कैमरा और AI बंद करें',
      block_status: 'AI स्थिति',
      block_faces: 'चेहरों की संख्या',
      block_hands: 'हाथों की संख्या',
      block_pinch: 'उंगलियाँ चिमट रही हैं?',
      block_index_x: 'तर्जनी X स्थिति',
      block_index_y: 'तर्जनी Y स्थिति',
      menu_mode_draggable: 'तैरती हुई खींचने योग्य',
      menu_mode_background: 'स्टेज पृष्ठभूमि (विस्तारित वास्तविकता)',
      status_off: 'बंद',
      status_loading: 'AI लोड हो रहा है...',
      status_ready: 'पता लगाने के लिए तैयार',
      status_error: 'त्रुटि: कोई कैमरा नहीं'
    },
    bn: {
      ext_title: 'AI: REC Vision Pro',
      block_camera_on: '📷 মোডে ক্যামেরা চালু করুন: [MODO]',
      block_camera_off: '❌ ক্যামেরা এবং AI বন্ধ করুন',
      block_status: 'AI স্থিতি',
      block_faces: 'মুখের সংখ্যা',
      block_hands: 'হাতের সংখ্যা',
      block_pinch: 'আঙুল চিমটে ধরছে?',
      block_index_x: 'তর্জনী X অবস্থান',
      block_index_y: 'তর্জনী Y অবস্থান',
      menu_mode_draggable: 'ভাসমান টানযোগ্য',
      menu_mode_background: 'স্টেজ ব্যাকগ্রাউন্ড (অগমেন্টেড রিয়েলিটি)',
      status_off: 'বন্ধ',
      status_loading: 'AI লোড হচ্ছে...',
      status_ready: 'সনাক্ত করার জন্য প্রস্তুত',
      status_error: 'ত্রুটি: কোন ক্যামেরা নেই'
    },
    id: {
      ext_title: 'AI: REC Vision Pro',
      block_camera_on: '📷 nyalakan kamera dalam mode: [MODO]',
      block_camera_off: '❌ MATIKAN kamera dan AI',
      block_status: 'status AI',
      block_faces: 'jumlah wajah',
      block_hands: 'jumlah tangan',
      block_pinch: 'jari mencubit?',
      block_index_x: 'posisi X jari telunjuk',
      block_index_y: 'posisi Y jari telunjuk',
      menu_mode_draggable: 'MENGAMBANG DAPAT DITARIK',
      menu_mode_background: 'LATAR BELAKANG PANGGUNG (REALITAS TERTAMBAH)',
      status_off: 'Mati',
      status_loading: 'Memuat AI...',
      status_ready: 'Siap mendeteksi',
      status_error: 'Error: Tidak ada kamera'
    },
    tr: {
      ext_title: 'Yapay Zeka: REC Vision Pro',
      block_camera_on: '📷 modda kamerayı aç: [MODO]',
      block_camera_off: '❌ KAMERA ve YZ KAPAT',
      block_status: 'YZ durumu',
      block_faces: 'yüz sayısı',
      block_hands: 'el sayısı',
      block_pinch: 'parmaklar sıkıyor mu?',
      block_index_x: 'işaret parmağı X konumu',
      block_index_y: 'işaret parmağı Y konumu',
      menu_mode_draggable: 'SÜRÜKLENEBİLİR YÜZEN',
      menu_mode_background: 'SAHNE ARKA PLANI (ARTIRILMIŞ GERÇEKLİK)',
      status_off: 'Kapalı',
      status_loading: 'YZ yükleniyor...',
      status_ready: 'Algılamaya hazır',
      status_error: 'Hata: Kamera yok'
    },
    pl: {
      ext_title: 'AI: Wizja REC Pro',
      block_camera_on: '📷 włącz kamerę w trybie: [MODO]',
      block_camera_off: '❌ WYŁĄCZ kamerę i AI',
      block_status: 'status AI',
      block_faces: 'liczba twarzy',
      block_hands: 'liczba rąk',
      block_pinch: 'palce ściśnięte?',
      block_index_x: 'pozycja X palca wskazującego',
      block_index_y: 'pozycja Y palca wskazującego',
      menu_mode_draggable: 'PRZESUWALNE UNOSZĄCE',
      menu_mode_background: 'TŁO SCENY (RZECZYWISTOŚĆ ROZSZERZONA)',
      status_off: 'Wyłączone',
      status_loading: 'Ładowanie AI...',
      status_ready: 'Gotowy do wykrywania',
      status_error: 'Błąd: Brak kamery'
    },
    nl: {
      ext_title: 'AI: Vision REC Pro',
      block_camera_on: '📷 camera aanzetten in modus: [MODO]',
      block_camera_off: '❌ camera en AI UITZETTEN',
      block_status: 'AI status',
      block_faces: 'aantal gezichten',
      block_hands: 'aantal handen',
      block_pinch: 'vingers knijpen?',
      block_index_x: 'wijsvinger X-positie',
      block_index_y: 'wijsvinger Y-positie',
      menu_mode_draggable: 'SLEEPBARE DRIJVENDE',
      menu_mode_background: 'PODIUMACHTERGROND (AUGMENTED REALITY)',
      status_off: 'Uit',
      status_loading: 'AI wordt geladen...',
      status_ready: 'Gereed om te detecteren',
      status_error: 'Fout: Geen camera'
    }
  };

  const _REC_CAMERA_URL = new URL('extensionesrec/recCamera.js', document.baseURI).href;

  const t = key => {
    const locale = window.currentRecLocale || 'es';
    return (I18N_BLOCKS[locale] && I18N_BLOCKS[locale][key]) || I18N_BLOCKS['es'][key] || key;
  };

  class IAVisionRECPro {
    constructor() {
      this.status        = t('status_off');
      this.facesDetected = 0;
      this.handsDetected = 0;
      this.isPinching    = false;
      this.indexX        = 0;
      this.indexY        = 0;
      this._running      = false;
      this._hands        = null;
      this._faceMesh     = null;
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

    getInfo() {
      return {
        id: 'iaVisionRECPro',
        name: t('ext_title'),
        color1: '#FF5733',
        blocks: [
          {
            opcode: 'encenderCamara',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_camera_on'),
            arguments: { MODO: { type: Scratch.ArgumentType.STRING, menu: 'MODO_CAMARA' } }
          },
          { opcode: 'detenerIA',  blockType: Scratch.BlockType.COMMAND,  text: t('block_camera_off') },
          { opcode: 'getStatus',  blockType: Scratch.BlockType.REPORTER, text: t('block_status') },
          "---",
          { opcode: 'getFaces',   blockType: Scratch.BlockType.REPORTER, text: t('block_faces') },
          { opcode: 'getHands',   blockType: Scratch.BlockType.REPORTER, text: t('block_hands') },
          { opcode: 'getPinch',   blockType: Scratch.BlockType.BOOLEAN,  text: t('block_pinch') },
          { opcode: 'getIndexX',  blockType: Scratch.BlockType.REPORTER, text: t('block_index_x') },
          { opcode: 'getIndexY',  blockType: Scratch.BlockType.REPORTER, text: t('block_index_y') }
        ],
        menus: {
          MODO_CAMARA: {
            items: [t('menu_mode_draggable'), t('menu_mode_background')]
          }
        }
      };
    }

    async encenderCamara(args) {
      if (window.RECCamera && window.RECCamera.video) return;
      this.status = t('status_loading');

      await this._ensureCamera();

      // Cargar MediaPipe Hands y FaceMesh (sin camera_utils: ya no lo necesitamos)
      if (!window.Hands)    await this._loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");
      if (!window.FaceMesh) await this._loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js");

      // Inicializar modelos
      this._hands = new window.Hands({
        locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
      });
      this._faceMesh = new window.FaceMesh({
        locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`
      });

      this._hands.setOptions({ maxNumHands: 6, modelComplexity: 1, minDetectionConfidence: 0.5 });
      this._faceMesh.setOptions({ maxNumFaces: 6, refineLandmarks: true, minDetectionConfidence: 0.5 });

      this._hands.onResults((results) => {
        this.handsDetected = results.multiHandLandmarks ? results.multiHandLandmarks.length : 0;
        if (this.handsDetected > 0) {
          const h    = results.multiHandLandmarks[0];
          const dist = Math.hypot(h[4].x - h[8].x, h[4].y - h[8].y);
          this.isPinching = dist < 0.08;
          this.indexX = (0.5 - h[8].x) * 480;
          this.indexY = (0.5 - h[8].y) * 360;
        } else {
          this.isPinching = false;
        }
      });

      this._faceMesh.onResults((results) => {
        this.facesDetected = results.multiFaceLandmarks ? results.multiFaceLandmarks.length : 0;
      });

      const video = await window.RECCamera.start(args.MODO, '#FF5733');
      if (video) {
        this._running = true;
        this._startLoop();
        this.status = t('status_ready');
      } else {
        this.status = t('status_error');
      }
    }

    _startLoop() {
      const loop = async () => {
        if (!this._running || !window.RECCamera || !window.RECCamera.video) return;
        const v = window.RECCamera.video;
        if (v.readyState >= 2 && this._hands && this._faceMesh) {
          try {
            await this._hands.send({ image: v });
            await this._faceMesh.send({ image: v });
          } catch (e) {}
        }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }

    detenerIA() {
      this._running = false;
      // Liberar solucionadores MediaPipe (WASM + memoria GPU/CPU)
      try { if (this._hands)    this._hands.close();    } catch (e) {}
      try { if (this._faceMesh) this._faceMesh.close(); } catch (e) {}
      this._hands    = null;
      this._faceMesh = null;
      if (window.RECCamera) window.RECCamera.stop();
      this.status        = t('status_off');
      this.facesDetected = 0;
      this.handsDetected = 0;
      this.isPinching    = false;
      this.indexX        = 0;
      this.indexY        = 0;
    }

    getStatus()   { return this.status; }
    getFaces()    { return this.facesDetected; }
    getHands()    { return this.handsDetected; }
    getPinch()    { return this.isPinching; }
    getIndexX()   { return Math.round(this.indexX); }
    getIndexY()   { return Math.round(this.indexY); }
  }

  Scratch.extensions.register(new IAVisionRECPro());
})(Scratch);