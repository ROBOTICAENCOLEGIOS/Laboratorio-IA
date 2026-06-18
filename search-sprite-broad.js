const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando contexto completo del sprite inicial (búsqueda amplia)...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar el contexto más amplio alrededor del assetId del gato
    const assetIdIndex = content.indexOf('927d672925e7b99f7813735c484c6922');
    if (assetIdIndex !== -1) {
        const contextStart = Math.max(0, assetIdIndex - 500);
        const contextEnd = Math.min(content.length, assetIdIndex + 500);
        const context = content.substring(contextStart, contextEnd);
        console.log(`✓ Contexto alrededor del assetId del gato:`);
        console.log(`  ${context.substring(0, 400)}...`);
    }
    
    // Buscar isStage: false seguido de assetId
    const isStageMatch = content.match(/isStage\s*:\s*false[^}]{0,1000}assetId[^}]{0,500}/g);
    if (isStageMatch) {
        console.log(`✓ Contexto isStage: false con assetId:`);
        isStageMatch.slice(0, 1).forEach((match, i) => {
            console.log(`  ${i + 1}. ${match.substring(0, 400)}...`);
        });
    }
});
