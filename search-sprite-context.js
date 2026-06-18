const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando contexto del sprite inicial (gato por defecto)...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar el contexto completo del assetId del gato
    const catAssetIdContext = content.match(/assetId["']?\s*:\s*["']cd21514d0531fdffb22204e0ec5ed84a["'][^}]{0,200}/g);
    if (catAssetIdContext) {
        console.log(`✓ Contexto del assetId del gato:`);
        catAssetIdContext.slice(0, 2).forEach((context, i) => {
            console.log(`  ${i + 1}. ${context.substring(0, 200)}...`);
        });
    }
    
    // Buscar el contexto completo del md5ext del gato
    const catMd5extContext = content.match(/md5ext["']?\s*:\s*["']cd21514d0531fdffb22204e0ec5ed84a\.svg["'][^}]{0,200}/g);
    if (catMd5extContext) {
        console.log(`✓ Contexto del md5ext del gato:`);
        catMd5extContext.slice(0, 2).forEach((context, i) => {
            console.log(`  ${i + 1}. ${context.substring(0, 200)}...`);
        });
    }
});
