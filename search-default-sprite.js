const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando configuración de sprite inicial en archivos JS...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar referencias a sprite inicial o gato por defecto
    if (content.includes('default project') || content.includes('defaultProject')) {
        console.log('✓ Contiene: default project / defaultProject');
        const matches = content.match(/defaultProject[^}]+}/g);
        if (matches) {
            matches.slice(0, 2).forEach((match, i) => {
                console.log(`  ${i + 1}. ${match.substring(0, 150)}...`);
            });
        }
    }
    
    if (content.includes('assetId') && content.includes('md5ext')) {
        console.log('✓ Contiene: assetId y md5ext (configuración de sprite)');
        const matches = content.match(/assetId[^,]+,[^}]+md5ext[^}]+}/g);
        if (matches) {
            matches.slice(0, 2).forEach((match, i) => {
                console.log(`  ${i + 1}. ${match.substring(0, 150)}...`);
            });
        }
    }
    
    if (content.includes('scratch-cat') || content.includes('cat') || content.includes('gato')) {
        console.log('✓ Contiene: referencias a cat/gato');
    }
});
