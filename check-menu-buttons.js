const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Verificando estado actual de botones en archivos JS...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    if (content.includes('Proyecto R.E.C.')) {
        console.log('✓ Contiene: Proyecto R.E.C.');
    }
    
    if (content.includes('Cómo usar la I.A.')) {
        console.log('✓ Contiene: Cómo usar la I.A.');
    }
    
    if (content.includes('roboticaencolegios.my.canva.site')) {
        console.log('✓ Contiene: roboticaencolegios.my.canva.site');
    }
    
    if (content.includes('www.roboticaencolegios.com.ar')) {
        console.log('✓ Contiene: www.roboticaencolegios.com.ar');
    }
    
    if (content.includes('See Project Page')) {
        console.log('✓ Contiene: See Project Page (NO TOCAR)');
    }
    
    if (content.includes('Ver página del proyecto')) {
        console.log('✓ Contiene: Ver página del proyecto (NO TOCAR)');
    }
});
