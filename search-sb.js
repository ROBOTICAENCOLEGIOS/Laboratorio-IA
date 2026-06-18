const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando en sb.js...\n');

const sbPath = path.join(jsDir, 'sb.js');
const content = fs.readFileSync(sbPath, 'utf8');

console.log(`Tamaño de sb.js: ${content.length} bytes`);

// Buscar el assetId del gato
if (content.includes('927d672925e7b99f7813735c484c6922')) {
    console.log(`✓ Contiene el assetId del gato`);
    const assetIdIndex = content.indexOf('927d672925e7b99f7813735c484c6922');
    const contextStart = Math.max(0, assetIdIndex - 500);
    const contextEnd = Math.min(content.length, assetIdIndex + 500);
    const context = content.substring(contextStart, contextEnd);
    console.log(`  Contexto: ${context.substring(0, 600)}...`);
}

// Buscar isStage: false
if (content.includes('isStage') && content.includes('false')) {
    console.log(`\n✓ Contiene isStage: false`);
    const isStageMatch = content.match(/isStage\s*:\s*false[^}]{0,1000}/g);
    if (isStageMatch) {
        console.log(`  Contextos: ${isStageMatch.length}`);
        isStageMatch.slice(0, 3).forEach((match, i) => {
            console.log(`    ${i + 1}. ${match.substring(0, 300)}...`);
        });
    }
}

// Buscar el nombre del sprite inicial
const spriteNameMatch = content.match(/name\s*:\s*["'][^"']*[^}]{0,300}isStage\s*:\s*false/g);
if (spriteNameMatch) {
    console.log(`\n✓ Nombres de sprite con isStage: false:`);
    spriteNameMatch.slice(0, 3).forEach((match, i) => {
        console.log(`  ${i + 1}. ${match.substring(0, 300)}...`);
    });
}
