const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando contexto completo del sprite inicial...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar el contexto completo del sprite con el assetId del gato
    const spriteContext = content.match(/isStage["']?\s*:\s*false[^}]{0,500}assetId["']?\s*:\s*["']927d672925e7b99f7813735c484c6922["'][^}]{0,500}/g);
    if (spriteContext) {
        console.log(`✓ Contexto completo del sprite (isStage: false):`);
        spriteContext.slice(0, 1).forEach((context, i) => {
            console.log(`  ${i + 1}. ${context.substring(0, 500)}...`);
        });
    }
    
    // Buscar el nombre del sprite inicial
    const spriteNameContext = content.match(/name["']?\s*:\s*["'][^"']*[^}]{0,100}isStage["']?\s*:\s*false/g);
    if (spriteNameContext) {
        console.log(`✓ Nombres de sprite con isStage: false:`);
        spriteNameContext.slice(0, 3).forEach((context, i) => {
            console.log(`  ${i + 1}. ${context.substring(0, 150)}...`);
        });
    }
});
