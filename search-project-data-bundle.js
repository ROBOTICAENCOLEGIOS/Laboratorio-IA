const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando código de project-data en los bundles...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar el código que define el project-data
    const projectDataMatch = content.match(/function\s*\([^)]*\)\s*\{[^}]{0,100}isStage[^}]{0,500}assetId[^}]{0,500}927d672925e7b99f7813735c484c6922/g);
    if (projectDataMatch) {
        console.log(`✓ Código de project-data con assetId del gato:`);
        projectDataMatch.slice(0, 1).forEach((match, i) => {
            console.log(`  ${i + 1}. ${match.substring(0, 400)}...`);
        });
    }
    
    // Buscar el código que define el project-data con isStage: false
    const isStageMatch = content.match(/\{[^}]{0,100}isStage\s*:\s*false[^}]{0,1000}927d672925e7b99f7813735c484c6922[^}]{0,500}/g);
    if (isStageMatch) {
        console.log(`✓ Código con isStage: false y assetId del gato:`);
        isStageMatch.slice(0, 1).forEach((match, i) => {
            console.log(`  ${i + 1}. ${match.substring(0, 400)}...`);
        });
    }
    
    // Buscar el nombre del sprite inicial
    const spriteNameMatch = content.match(/name\s*:\s*["'][^"']*[^}]{0,200}isStage\s*:\s*false/g);
    if (spriteNameMatch) {
        console.log(`✓ Nombres de sprite con isStage: false:`);
        spriteNameMatch.slice(0, 2).forEach((match, i) => {
            console.log(`  ${i + 1}. ${match.substring(0, 200)}...`);
        });
    }
});
