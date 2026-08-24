(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Voz a Texto debe ejecutarse en modo unsandboxed.');
  }

  const I18N_BLOCKS = {
    'es': {
      'ext_name': 'Voz a Texto',
      'block_start': 'empezar a escuchar voz',
      'block_stop': 'detener micrófono',
      'block_clear': 'limpiar texto reconocido',
      'block_last': 'último texto reconocido',
      'block_is_listening': '¿escuchando?'
    },
    'en': {
      'ext_name': 'Speech to Text',
      'block_start': 'start listening to voice',
      'block_stop': 'stop microphone',
      'block_clear': 'clear recognized text',
      'block_last': 'last recognized text',
      'block_is_listening': 'listening?'
    },
    'pt': {
      'ext_name': 'Voz para Texto',
      'block_start': 'começar a ouvir voz',
      'block_stop': 'parar microfone',
      'block_clear': 'limpar texto reconhecido',
      'block_last': 'último texto reconhecido',
      'block_is_listening': 'ouvindo?'
    },
    'fr': {
      'ext_name': 'Voix en Texte',
      'block_start': 'commencer à écouter la voix',
      'block_stop': 'arrêter le microphone',
      'block_clear': 'effacer le texte reconnu',
      'block_last': 'dernier texte reconnu',
      'block_is_listening': 'écoute ?'
    },
    'de': {
      'ext_name': 'Sprache zu Text',
      'block_start': 'Stimme zu hören beginnen',
      'block_stop': 'Mikrofon stoppen',
      'block_clear': 'erkannten Text löschen',
      'block_last': 'zuletzt erkannter Text',
      'block_is_listening': 'hört?'
    },
    'it': {
      'ext_name': 'Voce a Testo',
      'block_start': 'inizia ad ascoltare la voce',
      'block_stop': 'ferma microfono',
      'block_clear': 'cancella testo riconosciuto',
      'block_last': 'ultimo testo riconosciuto',
      'block_is_listening': 'in ascolto?'
    },
    'zh': {
      'ext_name': '语音转文字',
      'block_start': '开始听语音',
      'block_stop': '停止麦克风',
      'block_clear': '清除识别文字',
      'block_last': '最后识别文字',
      'block_is_listening': '正在听？'
    },
    'ja': {
      'ext_name': '音声をテキストに',
      'block_start': '音声を聞き始める',
      'block_stop': 'マイクを停止する',
      'block_clear': '認識したテキストを消去する',
      'block_last': '最後に認識したテキスト',
      'block_is_listening': '聞いている？'
    },
    'ko': {
      'ext_name': '음성을 텍스트로',
      'block_start': '음성 듣기 시작',
      'block_stop': '마이크 중지',
      'block_clear': '인식된 텍스트 지우기',
      'block_last': '마지막 인식된 텍스트',
      'block_is_listening': '듣는 중?'
    },
    'ru': {
      'ext_name': 'Голос в Текст',
      'block_start': 'начать слушать голос',
      'block_stop': 'остановить микрофон',
      'block_clear': 'очистить распознанный текст',
      'block_last': 'последний распознанный текст',
      'block_is_listening': 'слушает?'
    },
    'ar': {
      'ext_name': 'الصوت إلى نص',
      'block_start': 'ابدأ الاستماع إلى الصوت',
      'block_stop': 'أوقف الميكروفون',
      'block_clear': 'مسح النص المعترف به',
      'block_last': 'آخر نص معترف به',
      'block_is_listening': 'هل يستمع؟'
    },
    'hi': {
      'ext_name': 'आवाज़ को टेक्स्ट',
      'block_start': 'आवाज़ सुनना शुरू करें',
      'block_stop': 'माइक्रोफ़ोन बंद करें',
      'block_clear': 'पहचाना गया टेक्स्ट साफ़ करें',
      'block_last': 'अंतिम पहचाना गया टेक्स्ट',
      'block_is_listening': 'सुन रहा है?'
    },
    'tr': {
      'ext_name': 'Sesi Metne',
      'block_start': 'sesi dinlemeye başla',
      'block_stop': 'mikrofonu durdur',
      'block_clear': 'tanınan metni temizle',
      'block_last': 'son tanınan metin',
      'block_is_listening': 'dinliyor mu?'
    },
    'pl': {
      'ext_name': 'Mowa na Tekst',
      'block_start': 'zacznij słuchać głosu',
      'block_stop': 'zatrzymaj mikrofon',
      'block_clear': 'wyczyść rozpoznany tekst',
      'block_last': 'ostatni rozpoznany tekst',
      'block_is_listening': 'słucha?'
    },
    'nl': {
      'ext_name': 'Spraak naar Tekst',
      'block_start': 'begin met stem luisteren',
      'block_stop': 'stop microfoon',
      'block_clear': 'wis herkende tekst',
      'block_last': 'laatst herkende tekst',
      'block_is_listening': 'aan het luisteren?'
    },
    'bn': {
      'ext_name': 'ভয়েস থেকে টেক্সট',
      'block_start': 'ভয়েস শোনা শুরু করুন',
      'block_stop': 'মাইক্রোফোন বন্ধ করুন',
      'block_clear': 'শনাক্ত করা টেক্সট মুছুন',
      'block_last': 'শেষ শনাক্ত করা টেক্সট',
      'block_is_listening': 'শুনছে?'
    },
    'id': {
      'ext_name': 'Suara ke Teks',
      'block_start': 'mulai mendengarkan suara',
      'block_stop': 'hentikan mikrofon',
      'block_clear': 'hapus teks yang dikenali',
      'block_last': 'teks terakhir yang dikenali',
      'block_is_listening': 'mendengarkan?'
    }
  };

  const t = key => {
    const rawLocale = window.currentRecLocale || 'es';
    const lang = rawLocale.split(/[-_]/)[0].toLowerCase();
    return (I18N_BLOCKS[lang] && I18N_BLOCKS[lang][key]) || (I18N_BLOCKS['es'] && I18N_BLOCKS['es'][key]) || key;
  };

  class VozATexto {
    constructor() {
      this.speechResult = ""; 
      this.isListening = false;
      this.recognition = null;
      this._setupSpeech();
    }

    getInfo() {
      return {
        id: 'vozTextoREC',
        name: t('ext_name'),
        color1: '#2563EB',
        blocks: [
          {
            opcode: 'startListening',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_start')
          },
          {
            opcode: 'stopListening',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_stop')
          },
          {
            opcode: 'clearSpeech',
            blockType: Scratch.BlockType.COMMAND,
            text: t('block_clear')
          },
          "---",
          {
            opcode: 'getLastSpeech',
            blockType: Scratch.BlockType.REPORTER,
            text: t('block_last')
          },
          {
            opcode: 'isMicrophoneActive',
            blockType: Scratch.BlockType.BOOLEAN,
            text: t('block_is_listening')
        }]
      };
    }

    _setupSpeech() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'es-ES';
        this.recognition.continuous = false; 
        this.recognition.interimResults = false;

        this.recognition.onstart = () => {
          this.isListening = true;
        };

        this.recognition.onresult = (event) => {
          const last = event.results.length - 1;
          const text = event.results[last][0].transcript;
          this.speechResult = text.toLowerCase().trim();
        };

        this.recognition.onerror = () => { this.isListening = false; };
        this.recognition.onend = () => { this.isListening = false; };
      }
    }

    startListening() {
      if (this.recognition && !this.isListening) {
        try {
          this.recognition.start();
        } catch (e) {
          console.error(e);
        }
      }
    }

    stopListening() {
      if (this.recognition && this.isListening) {
        this.recognition.stop();
      }
    }

    clearSpeech() {
      this.speechResult = "";
    }

    isMicrophoneActive() {
      return this.isListening;
    }

    getLastSpeech() {
      return this.speechResult;
    }
  }

  Scratch.extensions.register(new VozATexto());
})(Scratch);
