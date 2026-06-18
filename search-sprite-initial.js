const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando sprite inicial (segundo target después del Stage)...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar el código que define los targets
    const targetsMatch = content.match(/targets:\s*\[[^]]{0,5000}\]/g);
    if (targetsMatch) {
        console.log(`✓ Encontrados ${targetsMatch.length} referencias a targets:`);
        targetsMatch.slice(0, 1).forEach((match, i) => {
            console.log(`  ${i + 1}. ${match.substring(0, 1000)}...`);
        });
    }
    
    // Buscar el código que define el sprite inicial (isStage: false después del Stage)
    const spriteMatch = content.match(/isStage:\s*true[^}]{0,1000}isStage:\s*false[^}]{0,2000}/g);
    if (spriteMatch) {
        console.log(`\n✓ Encontrados ${spriteMatch.length} referencias a sprite inicial (isStage: false después de isStage: true):`);
        spriteMatch.slice(0, 1).forEach((match, i) => {
            console.log(`  ${i + 1}. ${match.substring(0, 1200)}...`);
        });
    }
});
