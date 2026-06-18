const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando targets con balance de corchetes...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar el código que define los targets con balance de corchetes
    const targetsIndex = content.indexOf('targets:');
    if (targetsIndex !== -1) {
        let bracketCount = 0;
        let inTargets = false;
        let targetsEnd = targetsIndex;
        
        for (let i = targetsIndex; i < content.length; i++) {
            if (content[i] === '[') {
                bracketCount++;
                inTargets = true;
            } else if (content[i] === ']') {
                bracketCount--;
                if (bracketCount === 0 && inTargets) {
                    targetsEnd = i + 1;
                    break;
                }
            }
        }
        
        const targetsContent = content.substring(targetsIndex, targetsEnd);
        console.log(`✓ Encontrado targets (${targetsContent.length} caracteres):`);
        console.log(`  ${targetsContent.substring(0, 3000)}...`);
    }
});
