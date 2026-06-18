const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando en archivos vendors...\n');

// Buscar archivos vendors
const vendorFiles = fs.readdirSync(jsDir).filter(file => 
    file.includes('vendors')
);

console.log(`Archivos vendors encontrados: ${vendorFiles.length}`);
vendorFiles.forEach(file => {
    console.log(`  - ${file}`);
});

vendorFiles.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    console.log(`  Tamaño: ${content.length} bytes`);
    
    // Buscar el assetId del gato
    if (content.includes('927d672925e7b99f7813735c484c6922')) {
        console.log(`✓ Contiene el assetId del gato`);
        const assetIdIndex = content.indexOf('927d672925e7b99f7813735c484c6922');
        const contextStart = Math.max(0, assetIdIndex - 500);
        const contextEnd = Math.min(content.length, assetIdIndex + 500);
        const context = content.substring(contextStart, contextEnd);
        console.log(`  Contexto: ${context.substring(0, 600)}...`);
    } else {
        console.log(`- No contiene el assetId del gato`);
    }
    
    // Buscar isStage: false
    if (content.includes('isStage') && content.includes('false')) {
        console.log(`✓ Contiene isStage: false`);
        const isStageMatch = content.match(/isStage\s*:\s*false[^}]{0,1000}/g);
        if (isStageMatch) {
            console.log(`  Contextos: ${isStageMatch.length}`);
            isStageMatch.slice(0, 2).forEach((match, i) => {
                console.log(`    ${i + 1}. ${match.substring(0, 300)}...`);
            });
        }
    }
});
