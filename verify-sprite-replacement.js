const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Verificando reemplazo de sprite...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Verificar que el assetId del Jeep está presente
    if (content.includes('550774b7579a54151bfb23983342946c')) {
        console.log(`✓ Contiene el assetId del Jeep`);
        const assetIdIndex = content.indexOf('550774b7579a54151bfb23983342946c');
        const contextStart = Math.max(0, assetIdIndex - 300);
        const contextEnd = Math.min(content.length, assetIdIndex + 300);
        const context = content.substring(contextStart, contextEnd);
        console.log(`  Contexto: ${context.substring(0, 400)}...`);
    } else {
        console.log(`✗ NO contiene el assetId del Jeep`);
    }
    
    // Verificar que el assetId del gato ya no está presente
    if (content.includes('927d672925e7b99f7813735c484c6922')) {
        console.log(`✗ Aún contiene el assetId del gato`);
    } else {
        console.log(`✓ NO contiene el assetId del gato`);
    }
    
    // Verificar que el md5ext del Jeep está presente
    if (content.includes('550774b7579a54151bfb23983342946c.svg')) {
        console.log(`✓ Contiene el md5ext del Jeep`);
    } else {
        console.log(`✗ NO contiene el md5ext del Jeep`);
    }
    
    // Verificar que el md5ext del gato ya no está presente
    if (content.includes('927d672925e7b99f7813735c484c6922.svg')) {
        console.log(`✗ Aún contiene el md5ext del gato`);
    } else {
        console.log(`✓ NO contiene el md5ext del gato`);
    }
});
