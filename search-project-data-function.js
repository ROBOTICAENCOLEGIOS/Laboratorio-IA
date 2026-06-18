const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando función de project-data...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar la función que define el project-data
    const projectDataFunctionMatch = content.match(/function\s*\([^)]*\)\s*\{[^}]{0,100}return[^}]{0,200}targets[^}]{0,5000}\}/g);
    if (projectDataFunctionMatch) {
        console.log(`✓ Encontradas ${projectDataFunctionMatch.length} funciones con targets:`);
        projectDataFunctionMatch.slice(0, 2).forEach((match, i) => {
            console.log(`  ${i + 1}. ${match.substring(0, 1000)}...`);
        });
    }
    
    // Buscar el código que define el proyecto por defecto con return
    const returnMatch = content.match(/return\s*\{[^}]{0,100}targets[^}]{0,5000}\}/g);
    if (returnMatch) {
        console.log(`\n✓ Encontrados ${returnMatch.length} return con targets:`);
        returnMatch.slice(0, 2).forEach((match, i) => {
            console.log(`  ${i + 1}. ${match.substring(0, 1000)}...`);
        });
    }
});
