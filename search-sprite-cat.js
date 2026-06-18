const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando sprite del gato (no backdrop)...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar el segundo assetId (probablemente el sprite del gato)
    const catAssetIdContext = content.match(/assetId["']?\s*:\s*["']927d672925e7b99f7813735c484c6922["'][^}]{0,300}/g);
    if (catAssetIdContext) {
        console.log(`✓ Contexto del assetId del sprite (927d672925e7b99f7813735c484c6922):`);
        catAssetIdContext.slice(0, 2).forEach((context, i) => {
            console.log(`  ${i + 1}. ${context.substring(0, 300)}...`);
        });
    }
    
    // Buscar el contexto completo del md5ext del sprite
    const catMd5extContext = content.match(/md5ext["']?\s*:\s*["']927d672925e7b99f7813735c484c6922\.svg["'][^}]{0,300}/g);
    if (catMd5extContext) {
        console.log(`✓ Contexto del md5ext del sprite (927d672925e7b99f7813735c484c6922.svg):`);
        catMd5extContext.slice(0, 2).forEach((context, i) => {
            console.log(`  ${i + 1}. ${context.substring(0, 300)}...`);
        });
    }
    
    // Buscar name del sprite
    const spriteNameContext = content.match(/name["']?\s*:\s*["'][^"']*cat[^"']*["']/gi);
    if (spriteNameContext) {
        console.log(`✓ Nombres de sprite con 'cat':`);
        spriteNameContext.slice(0, 3).forEach((context, i) => {
            console.log(`  ${i + 1}. ${context}`);
        });
    }
});
