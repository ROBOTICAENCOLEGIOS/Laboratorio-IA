const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando posibles problemas de enrutamiento en archivos JS...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar patrones relacionados con enrutamiento
    if (content.includes('window.location')) {
        console.log('✓ Contiene: window.location (posible redirección)');
        const matches = content.match(/window\.location[^;]+/g);
        if (matches) {
            matches.slice(0, 3).forEach((match, i) => {
                console.log(`  ${i + 1}. ${match.substring(0, 100)}...`);
            });
        }
    }
    
    if (content.includes('history.push')) {
        console.log('✓ Contiene: history.push (enrutamiento)');
    }
    
    if (content.includes('history.replace')) {
        console.log('✓ Contiene: history.replace (enrutamiento)');
    }
    
    if (content.includes('redirect')) {
        console.log('✓ Contiene: redirect');
    }
    
    if (content.includes('Laboratorio REC')) {
        console.log('✓ Contiene: Laboratorio REC');
    }
    
    // Verificar si hay strings rotos o incompletos
    const brokenStrings = content.match(/"[^"]*Laboratorio[^"]*"/g);
    if (brokenStrings) {
        console.log(`⚠ Posibles strings rotos con Laboratorio: ${brokenStrings.length}`);
    }
});
