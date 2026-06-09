const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando strings rotos o incompletos en archivos JS...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar strings que podrían estar rotos
    const brokenStrings = content.match(/"[^"]*Laboratorio[^"]*"/g);
    if (brokenStrings) {
        console.log(`⚠ Strings con "Laboratorio": ${brokenStrings.length}`);
        brokenStrings.forEach((str, i) => {
            if (i < 5) {
                console.log(`  ${i + 1}. ${str.substring(0, 80)}...`);
            }
        });
    } else {
        console.log('- No contiene strings con "Laboratorio"');
    }
    
    // Buscar strings vacíos que podrían causar problemas
    const emptyStrings = content.match(/""/g);
    if (emptyStrings) {
        console.log(`⚠ Strings vacíos: ${emptyStrings.length}`);
    }
    
    // Verificar si hay patrones de ruta específicos
    if (content.includes('/index.html')) {
        console.log('✓ Contiene: /index.html');
    }
    
    if (content.includes('/editor.html')) {
        console.log('✓ Contiene: /editor.html');
    }
    
    if (content.includes('pathname')) {
        console.log('✓ Contiene: pathname (enrutamiento)');
    }
});
