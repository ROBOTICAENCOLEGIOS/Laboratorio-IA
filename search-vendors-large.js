const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando en vendors~editor~embed~fullscreen~player.js (archivo grande)...\n');

const vendorPath = path.join(jsDir, 'vendors~editor~embed~fullscreen~player.js');
const content = fs.readFileSync(vendorPath, 'utf8');

console.log(`Tamaño: ${content.length} bytes`);

// Buscar el assetId del gato
if (content.includes('927d672925e7b99f7813735c484c6922')) {
    console.log(`✓ Contiene el assetId del gato`);
    const assetIdIndex = content.indexOf('927d672925e7b99f7813735c484c6922');
    const contextStart = Math.max(0, assetIdIndex - 800);
    const contextEnd = Math.min(content.length, assetIdIndex + 800);
    const context = content.substring(contextStart, contextEnd);
    console.log(`  Contexto: ${context.substring(0, 1000)}...`);
} else {
    console.log(`- No contiene el assetId del gato`);
}

// Buscar isStage: false con más contexto
if (content.includes('isStage') && content.includes('false')) {
    console.log(`\n✓ Contiene isStage: false`);
    const isStageMatch = content.match(/isStage\s*:\s*false[^}]{0,2000}/g);
    if (isStageMatch) {
        console.log(`  Contextos: ${isStageMatch.length}`);
        isStageMatch.slice(0, 5).forEach((match, i) => {
            console.log(`    ${i + 1}. ${match.substring(0, 500)}...`);
        });
    }
}

// Buscar el nombre del sprite inicial
const spriteNameMatch = content.match(/name\s*:\s*["'][^"']*[^}]{0,500}isStage\s*:\s*false/g);
if (spriteNameMatch) {
    console.log(`\n✓ Nombres de sprite con isStage: false:`);
    spriteNameMatch.slice(0, 5).forEach((match, i) => {
        console.log(`  ${i + 1}. ${match.substring(0, 500)}...`);
    });
}

// Buscar project-data
if (content.includes('project-data') || content.includes('projectData')) {
    console.log(`\n✓ Contiene project-data`);
    const projectDataMatch = content.match(/project-data[^}]{0,500}/g);
    if (projectDataMatch) {
        console.log(`  Contextos: ${projectDataMatch.length}`);
        projectDataMatch.slice(0, 3).forEach((match, i) => {
            console.log(`    ${i + 1}. ${match.substring(0, 400)}...`);
        });
    }
}
