const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando return con targets completo...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar el código que define el proyecto por defecto con return
    const returnMatch = content.match(/return\s*\{[^}]{0,100}targets[^}]{0,20000}\}/g);
    if (returnMatch) {
        console.log(`✓ Encontrados ${returnMatch.length} return con targets:`);
        returnMatch.slice(0, 1).forEach((match, i) => {
            console.log(`  ${i + 1}. ${match.substring(0, 5000)}...`);
        });
    }
});
