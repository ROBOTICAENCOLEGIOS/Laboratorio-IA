const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando nombre del sprite inicial (cat/gato)...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar el nombre del sprite inicial
    const catNameMatch = content.match(/name\s*:\s*["'][^"']*cat[^"']*["']/gi);
    if (catNameMatch) {
        console.log(`✓ Nombres con 'cat': ${catNameMatch.length}`);
        catNameMatch.slice(0, 5).forEach((match, i) => {
            console.log(`  ${i + 1}. ${match}`);
        });
    }
    
    // Buscar el nombre del sprite inicial con contexto
    const catContextMatch = content.match(/name\s*:\s*["'][^"']*cat[^"']*["'][^}]{0,500}/gi);
    if (catContextMatch) {
        console.log(`\n✓ Contextos con 'cat': ${catContextMatch.length}`);
        catContextMatch.slice(0, 3).forEach((match, i) => {
            console.log(`  ${i + 1}. ${match.substring(0, 400)}...`);
        });
    }
});
