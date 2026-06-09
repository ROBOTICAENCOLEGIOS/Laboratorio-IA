const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando "Laboratorio REC" en archivos JS...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    if (content.includes('Laboratorio REC')) {
        const matches = content.match(/Laboratorio REC[^"]*/g);
        if (matches) {
            console.log(`✓ Coincidencias encontradas (${matches.length}):`);
            matches.forEach((match, i) => {
                console.log(`  ${i + 1}. ${match.substring(0, 100)}...`);
            });
        }
    } else {
        console.log('- No contiene "Laboratorio REC"');
    }
});
