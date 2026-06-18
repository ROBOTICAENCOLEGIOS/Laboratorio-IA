const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando código de project-data en los archivos JS...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar el código que define el project-data
    const projectDataCodeMatch = content.match(/function\s*\([^)]*\)\s*\{[^}]{0,100}return[^}]{0,200}targets[^}]{0,3000}/g);
    if (projectDataCodeMatch) {
        console.log(`✓ Encontrados ${projectDataCodeMatch.length} funciones con targets:`);
        projectDataCodeMatch.slice(0, 2).forEach((match, i) => {
            console.log(`  ${i + 1}. ${match.substring(0, 600)}...`);
        });
    }
    
    // Buscar el código que define el proyecto por defecto con targets
    const targetsMatch = content.match(/targets[^}]{0,3000}isStage[^}]{0,1000}/g);
    if (targetsMatch) {
        console.log(`\n✓ Encontrados ${targetsMatch.length} referencias a targets con isStage:`);
        targetsMatch.slice(0, 2).forEach((match, i) => {
            console.log(`  ${i + 1}. ${match.substring(0, 800)}...`);
        });
    }
});
