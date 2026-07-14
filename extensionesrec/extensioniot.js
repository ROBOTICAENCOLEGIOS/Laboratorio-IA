class ModuloIoTREC {
    constructor() {
        this.databaseURL = "";
        this.claveGrupo = "";
    }

    getInfo() {
        const base = new URL('extensionesrec/', document.baseURI).href;
        return {
            id: 'moduloIoTREC',
            name: 'Modulo IoT REC', // Sin acento
            color1: '#00a8ff',
            color2: '#0097e6',
            color3: '#0086cc',
            description: 'Conecta tus proyectos a la nube y envía telemetría en tiempo real.',
            iconURL: new URL('extensionIoT.png', document.baseURI).href,
            tags: ['@roboticaencolegios'],
            blocks: [
                {
                    opcode: 'conectarFirebase',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'Conectar a Firebase URL: [URL] Clave: [CLAVE]',
                    arguments: {
                        URL: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'https://laboratoriorec-com-ar-default-rtdb.firebaseio.com'
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
                    text: 'Enviar a IoT Etiqueta: [ETIQUETA] Valor: [VALOR]',
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
                    text: 'Leer de IoT Etiqueta: [ETIQUETA]',
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
        // Limpiamos la URL por si el alumno le pone una barra al final o el .json
        let url = args.URL.trim();
        if (url.endsWith('/')) {
            url = url.slice(0, -1);
        }
        if (url.endsWith('.json')) {
            url = url.replace('.json', '');
        }
        this.databaseURL = url;
        
        // Limpiamos la clave para que no tenga caracteres raros ni espacios
        this.claveGrupo = args.CLAVE.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    }

    enviarDato(args) {
        if (!this.databaseURL) return;
        
        // Limpiamos la etiqueta para evitar errores en la base de datos
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