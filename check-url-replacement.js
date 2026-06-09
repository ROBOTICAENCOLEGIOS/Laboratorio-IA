const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Verificando reemplazos de URL en archivos JS...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Verificar si hay URL vieja
    if (content.includes('roboticaencolegios.my.canva.site')) {
        console.log('✗ Aún contiene URL vieja');
    } else {
        console.log('✓ URL vieja removida');
    }
    
    // Verificar si hay URL nueva
    if (content.includes('www.roboticaencolegios.com.ar')) {
        console.log('✓ URL nueva presente');
        const matches = content.match(/www\.roboticaencolegios\.com\.ar[^"]*/g);
        if (matches) {
            console.log(`  Coincidencias: ${matches.length}`);
            matches.slice(0, 3).forEach((match, i) => {
                console.log(`  ${i + 1}. ${match.substring(0, 80)}...`);
            });
        }
    } else {
        console.log('✗ URL nueva ausente');
    }
    
    // Buscar patrones que podrían estar rotos
    const brokenPatterns = content.match(/canva\.site[^"]*/g);
    if (brokenPatterns) {
        console.log(`⚠ Posibles patrones rotos con canva.site: ${brokenPatterns.length}`);
        brokenPatterns.forEach((pattern, i) => {
            if (i < 3) {
                console.log(`  ${i + 1}. ${pattern.substring(0, 80)}...`);
            }
        });
    }
});
