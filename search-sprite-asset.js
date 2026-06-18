const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando assetId del sprite inicial (gato por defecto)...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar assetId específicos del gato por defecto
    const assetIdMatches = content.match(/assetId["']?\s*:\s*["']([^"']+)["']/g);
    if (assetIdMatches) {
        console.log(`✓ Encontrados ${assetIdMatches.length} assetId:`);
        assetIdMatches.slice(0, 5).forEach((match, i) => {
            console.log(`  ${i + 1}. ${match.substring(0, 80)}...`);
        });
    }
    
    // Buscar md5ext específicos
    const md5extMatches = content.match(/md5ext["']?\s*:\s*["']([^"']+)["']/g);
    if (md5extMatches) {
        console.log(`✓ Encontrados ${md5extMatches.length} md5ext:`);
        md5extMatches.slice(0, 5).forEach((match, i) => {
            console.log(`  ${i + 1}. ${match.substring(0, 80)}...`);
        });
    }
});
