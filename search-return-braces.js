const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando return con balance de llaves...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar el código que define el proyecto por defecto con return
    const returnIndex = content.indexOf('return {');
    if (returnIndex !== -1) {
        let braceCount = 0;
        let inReturn = false;
        let returnEnd = returnIndex;
        
        for (let i = returnIndex + 7; i < content.length; i++) {
            if (content[i] === '{') {
                braceCount++;
                inReturn = true;
            } else if (content[i] === '}') {
                braceCount--;
                if (braceCount === 0 && inReturn) {
                    returnEnd = i + 1;
                    break;
                }
            }
        }
        
        const returnContent = content.substring(returnIndex, returnEnd);
        
        // Verificar si contiene targets
        if (returnContent.includes('targets')) {
            console.log(`✓ Encontrado return con targets (${returnContent.length} caracteres):`);
            console.log(`  ${returnContent.substring(0, 5000)}...`);
        }
    }
});
