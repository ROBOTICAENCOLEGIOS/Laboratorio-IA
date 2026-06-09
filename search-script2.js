const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando textos actuales...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js', 'vendors~editor~embed~fullscreen~player.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    if (content.includes('@roboticaencolegios - I.A. ROBÓTICA y ANIMACIONES en un mismo lugar')) {
        console.log('✓ Contiene: @roboticaencolegios - I.A. ROBÓTICA y ANIMACIONES en un mismo lugar');
    }
    
    if (content.includes('@roboticaencolegios - I.A. ROBOTICA y PROGRAMACION en un mismo lugar')) {
        console.log('✓ Contiene: @roboticaencolegios - I.A. ROBOTICA y PROGRAMACION en un mismo lugar');
    }
    
    if (content.includes('Laboratorio REC - ')) {
        console.log('✓ Contiene: Laboratorio REC - ');
    }
    
    if (content.includes('See Project Page')) {
        console.log('✓ Contiene: See Project Page');
    }
    
    if (content.includes('gui.menuBar.seeProjectPage')) {
        console.log('✓ Contiene: gui.menuBar.seeProjectPage');
    }
});
