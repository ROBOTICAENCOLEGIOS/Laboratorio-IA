(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('El Módulo IoT REC debe ejecutarse en modo unsandboxed.');
  }

  const I18N_BLOCKS = {
    'es': {
      'ext_name': 'Modulo IoT REC',
      'ext_description': 'Conecta tus proyectos a la nube y envía telemetría en tiempo real.',
      'block_connect': 'Conectar a Firebase URL: [URL] Clave: [CLAVE]',
      'block_send': 'Enviar a IoT Etiqueta: [ETIQUETA] Valor: [VALOR]',
      'block_read': 'Leer de IoT Etiqueta: [ETIQUETA]'
    },
    'en': {
      'ext_name': 'IoT REC Module',
      'ext_description': 'Connect your projects to the cloud and send telemetry in real time.',
      'block_connect': 'Connect to Firebase URL: [URL] Key: [CLAVE]',
      'block_send': 'Send to IoT Label: [ETIQUETA] Value: [VALOR]',
      'block_read': 'Read from IoT Label: [ETIQUETA]'
    },
    'pt': {
      'ext_name': 'Módulo IoT REC',
      'ext_description': 'Conecte seus projetos à nuvem e envie telemetria em tempo real.',
      'block_connect': 'Conectar ao Firebase URL: [URL] Chave: [CLAVE]',
      'block_send': 'Enviar para IoT Etiqueta: [ETIQUETA] Valor: [VALOR]',
      'block_read': 'Ler do IoT Etiqueta: [ETIQUETA]'
    },
    'fr': {
      'ext_name': 'Module IoT REC',
      'ext_description': 'Connectez vos projets au cloud et envoyez la télémétrie en temps réel.',
      'block_connect': 'Connecter à Firebase URL : [URL] Clé : [CLAVE]',
      'block_send': 'Envoyer vers IoT Étiquette : [ETIQUETA] Valeur : [VALOR]',
      'block_read': 'Lire de IoT Étiquette : [ETIQUETA]'
    },
    'de': {
      'ext_name': 'IoT REC Modul',
      'ext_description': 'Verbinde deine Projekte mit der Cloud und sende Telemetrie in Echtzeit.',
      'block_connect': 'Mit Firebase verbinden URL: [URL] Schlüssel: [CLAVE]',
      'block_send': 'An IoT senden Label: [ETIQUETA] Wert: [VALOR]',
      'block_read': 'Von IoT lesen Label: [ETIQUETA]'
    },
    'it': {
      'ext_name': 'Modulo IoT REC',
      'ext_description': 'Connetti i tuoi progetti al cloud e invia la telemetria in tempo reale.',
      'block_connect': 'Connetti a Firebase URL: [URL] Chiave: [CLAVE]',
      'block_send': 'Invia a IoT Etichetta: [ETIQUETA] Valore: [VALOR]',
      'block_read': 'Leggi da IoT Etichetta: [ETIQUETA]'
    },
    'zh': {
      'ext_name': 'IoT REC 模块',
      'ext_description': '将你的项目连接到云端并实时发送遥测数据。',
      'block_connect': '连接到 Firebase URL: [URL] 密钥: [CLAVE]',
      'block_send': '发送到 IoT 标签: [ETIQUETA] 值: [VALOR]',
      'block_read': '从 IoT 读取 标签: [ETIQUETA]'
    },
    'ja': {
      'ext_name': 'IoT REC モジュール',
      'ext_description': 'プロジェクトをクラウドに接続し、リアルタイムでテレメトリを送信します。',
      'block_connect': 'Firebaseに接続 URL: [URL] キー: [CLAVE]',
      'block_send': 'IoTに送信 ラベル: [ETIQUETA] 値: [VALOR]',
      'block_read': 'IoTから読み込む ラベル: [ETIQUETA]'
    },
    'ko': {
      'ext_name': 'IoT REC 모듈',
      'ext_description': '프로젝트를 클라우드에 연결하고 실시간으로 원격 측정을 보냅니다.',
      'block_connect': 'Firebase 연결 URL: [URL] 키: [CLAVE]',
      'block_send': 'IoT로 보내기 레이블: [ETIQUETA] 값: [VALOR]',
      'block_read': 'IoT에서 읽기 레이블: [ETIQUETA]'
    },
    'ru': {
      'ext_name': 'Модуль IoT REC',
      'ext_description': 'Подключайте свои проекты к облаку и отправляйте телеметрию в реальном времени.',
      'block_connect': 'Подключиться к Firebase URL: [URL] Ключ: [CLAVE]',
      'block_send': 'Отправить в IoT Метка: [ETIQUETA] Значение: [VALOR]',
      'block_read': 'Прочитать из IoT Метка: [ETIQUETA]'
    },
    'ar': {
      'ext_name': 'وحدة IoT REC',
      'ext_description': 'أوصل مشاريعك بالسحابة وأرسل بيانات الاستشعار في الوقت الفعلي.',
      'block_connect': 'الربط بـ Firebase URL: [URL] المفتاح: [CLAVE]',
      'block_send': 'إرسال إلى IoT التسمية: [ETIQUETA] القيمة: [VALOR]',
      'block_read': 'قراءة من IoT التسمية: [ETIQUETA]'
    },
    'hi': {
      'ext_name': 'IoT REC मॉड्यूल',
      'ext_description': 'अपनी परियोजनाओं को क्लाउड से जोड़ें और वास्तविक समय में टेलीमेट्री भेजें।',
      'block_connect': 'Firebase से कनेक्ट करें URL: [URL] कुंजी: [CLAVE]',
      'block_send': 'IoT पर भेजें लेबल: [ETIQUETA] मान: [VALOR]',
      'block_read': 'IoT से पढ़ें लेबल: [ETIQUETA]'
    },
    'tr': {
      'ext_name': 'IoT REC Modülü',
      'ext_description': 'Projelerinizi buluta bağlayın ve gerçek zamanlı telemetri gönderin.',
      'block_connect': "Firebase'a Bağlan URL: [URL] Anahtar: [CLAVE]",
      'block_send': 'IoT\'ye Gönder Etiket: [ETIQUETA] Değer: [VALOR]',
      'block_read': 'IoT\'den Oku Etiket: [ETIQUETA]'
    },
    'pl': {
      'ext_name': 'Moduł IoT REC',
      'ext_description': 'Podłącz swoje projekty do chmury i wysyłaj dane telemetryczne w czasie rzeczywistym.',
      'block_connect': 'Połącz z Firebase URL: [URL] Klucz: [CLAVE]',
      'block_send': 'Wyślij do IoT Etykieta: [ETIQUETA] Wartość: [VALOR]',
      'block_read': 'Odczytaj z IoT Etykieta: [ETIQUETA]'
    },
    'nl': {
      'ext_name': 'IoT REC Module',
      'ext_description': 'Sluit je projecten aan op de cloud en verstuur telemetrie in realtime.',
      'block_connect': 'Verbinden met Firebase URL: [URL] Sleutel: [CLAVE]',
      'block_send': 'Verstuur naar IoT Label: [ETIQUETA] Waarde: [VALOR]',
      'block_read': 'Lees van IoT Label: [ETIQUETA]'
    }
  };

  const t = key => {
    const locale = window.currentRecLocale || 'es';
    return (I18N_BLOCKS[locale] && I18N_BLOCKS[locale][key]) || I18N_BLOCKS['es'][key] || key;
  };

  class ModuloIoTREC {
      constructor() {
          this.databaseURL = "";
          this.claveGrupo = "";
      }

      getInfo() {
          const base = new URL('extensionesrec/', document.baseURI).href;
          return {
              id: 'moduloIoTREC',
              name: t('ext_name'), 
              color1: '#00a8ff',
              color2: '#0097e6',
              color3: '#0086cc',
              description: t('ext_description'),
              iconURL: new URL('extensionIoT.png', document.baseURI).href,
              tags: ['@roboticaencolegios'],
              blocks: [
                  {
                      opcode: 'conectarFirebase',
                      blockType: Scratch.BlockType.COMMAND,
                      text: t('block_connect'),
                      arguments: {
                          URL: {
                              type: Scratch.ArgumentType.STRING,
                              defaultValue: 'https://tunombreenfirebase-default-rtdb.firebaseio.com'
                          },
                          CLAVE: {
                              type: Scratch.ArgumentType.STRING,
                              defaultValue: 'Prueba1'
                          }
                      }
                  },
                  {
                      opcode: 'enviarDato',
                      blockType: Scratch.BlockType.COMMAND,
                      text: t('block_send'),
                      arguments: {
                          ETIQUETA: {
                              type: Scratch.ArgumentType.STRING,
                              defaultValue: 'jeep'
                          },
                          VALOR: {
                              type: Scratch.ArgumentType.STRING,
                              defaultValue: 'avanzar'
                          }
                      }
                  },
                  {
                      opcode: 'leerDato',
                      blockType: Scratch.BlockType.REPORTER,
                      text: t('block_read'),
                      arguments: {
                          ETIQUETA: {
                              type: Scratch.ArgumentType.STRING,
                              defaultValue: 'jeep'
                          }
                      }
                  }
              ]
          };
      }

      conectarFirebase(args) {
          let url = args.URL.trim();
          if (url.endsWith('/')) {
              url = url.slice(0, -1);
          }
          if (url.endsWith('.json')) {
              url = url.replace('.json', '');
          }
          this.databaseURL = url;
          this.claveGrupo = args.CLAVE.trim().replace(/[^a-zA-Z0-9_-]/g, '');
      }

      enviarDato(args) {
          if (!this.databaseURL) return;
          const etiqueta = args.ETIQUETA.trim().replace(/[^a-zA-Z0-9_-]/g, '');
          const valor = args.VALOR;
          const urlFinal = `${this.databaseURL}/iot/${this.claveGrupo}/${etiqueta}.json`;
          
          return fetch(urlFinal, {
              method: 'PUT',
              body: JSON.stringify(valor),
              headers: {
                  'Content-Type': 'application/json'
              }
          }).catch(error => console.error("Error enviando dato:", error));
      }

      leerDato(args) {
          if (!this.databaseURL) return '';
          const etiqueta = args.ETIQUETA.trim().replace(/[^a-zA-Z0-9_-]/g, '');
          const urlFinal = `${this.databaseURL}/iot/${this.claveGrupo}/${etiqueta}.json`;
          
          return fetch(urlFinal)
              .then(response => response.json())
              .then(data => {
                  return data !== null ? data : '';
              })
              .catch(error => {
                  console.error("Error leyendo dato:", error);
                  return '';
              });
      }
  }

  Scratch.extensions.register(new ModuloIoTREC());
})(Scratch);