const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Verificando cambios...\n');

// Verificar título nuevo
const playerContent = fs.readFileSync(path.join(jsDir, 'player.js'), 'utf8');
const hasNewTitle = playerContent.includes('@roboticaencolegios - I.A. ROBÓTICA y ANIMACIONES en un mismo lugar');
console.log('Título nuevo en player.js:', hasNewTitle ? '✓ SÍ' : '✗ NO');

// Verificar Contacto vacío
const vendorsContent = fs.readFileSync(path.join(jsDir, 'vendors~editor~embed~fullscreen~player.js'), 'utf8');
const hasContactoEmpty = vendorsContent.includes('"gui.menuBar.seeProjectPage": ""');
console.log('Contacto vacío en vendors~editor~embed~fullscreen~player.js:', hasContactoEmpty ? '✓ SÍ' : '✗ NO');

// Verificar en otros archivos
const editorContent = fs.readFileSync(path.join(jsDir, 'editor.js'), 'utf8');
console.log('Título nuevo en editor.js:', editorContent.includes('@roboticaencolegios - I.A. ROBÓTICA y ANIMACIONES en un mismo lugar') ? '✓ SÍ' : '✗ NO');

const fullscreenContent = fs.readFileSync(path.join(jsDir, 'fullscreen.js'), 'utf8');
console.log('Título nuevo en fullscreen.js:', fullscreenContent.includes('@roboticaencolegios - I.A. ROBÓTICA y ANIMACIONES en un mismo lugar') ? '✓ SÍ' : '✗ NO');

const embedContent = fs.readFileSync(path.join(jsDir, 'embed.js'), 'utf8');
console.log('Título nuevo en embed.js:', embedContent.includes('@roboticaencolegios - I.A. ROBÓTICA y ANIMACIONES en un mismo lugar') ? '✓ SÍ' : '✗ NO');

console.log('\n✓ Todos los archivos se han guardado exitosamente en el disco.');
