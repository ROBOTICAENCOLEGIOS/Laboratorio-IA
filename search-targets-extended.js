const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando targets con contexto extendido...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar el código que define los targets con más contexto
    const targetsMatch = content.match(/targets:\s*\[[^\]]{0,20000}\]/g);
    if (targetsMatch) {
        console.log(`✓ Encontrados ${targetsMatch.length} referencias a targets:`);
        targetsMatch.slice(0, 1).forEach((match, i) => {
            console.log(`  ${i + 1}. ${match.substring(0, 5000)}...`);
        });
    }
});
