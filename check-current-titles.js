const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Verificando títulos actuales en archivos JS después de git checkout...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar patrones de título
    if (content.includes('@roboticaencolegios')) {
        console.log('✓ Contiene: @roboticaencolegios');
    }
    
    if (content.includes('I.A. ROBÓTICA y ANIMACIONES')) {
        console.log('✓ Contiene: I.A. ROBÓTICA y ANIMACIONES');
    }
    
    if (content.includes('I.A. ROBOTICA y PROGRAMACION')) {
        console.log('✓ Contiene: I.A. ROBOTICA y PROGRAMACION');
    }
    
    if (content.includes('Laboratorio REC - ')) {
        console.log('✓ Contiene: Laboratorio REC - ');
    }
    
    if (content.includes('Ejecute proyectos de Scratch más rápido')) {
        console.log('✓ Contiene: Ejecute proyectos de Scratch más rápido');
    }
    
    if (content.includes('gui.menuBar.seeProjectPage')) {
        console.log('✓ Contiene: gui.menuBar.seeProjectPage (NO TOCAR)');
    }
});
