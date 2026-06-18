const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando project-data específico en vendors~editor~embed~fullscreen~player.js...\n');

const vendorPath = path.join(jsDir, 'vendors~editor~embed~fullscreen~player.js');
const content = fs.readFileSync(vendorPath, 'utf8');

// Buscar el código de project-data
const projectDataMatch = content.match(/project-data[^}]{0,3000}/g);
if (projectDataMatch) {
    console.log(`✓ Encontrados ${projectDataMatch.length} referencias a project-data:`);
    projectDataMatch.slice(0, 3).forEach((match, i) => {
        console.log(`  ${i + 1}. ${match.substring(0, 600)}...`);
    });
}

// Buscar el código que define el project-data default
const defaultProjectMatch = content.match(/default[^}]{0,3000}isStage[^}]{0,2000}/g);
if (defaultProjectMatch) {
    console.log(`\n✓ Encontrados ${defaultProjectMatch.length} referencias a default con isStage:`);
    defaultProjectMatch.slice(0, 3).forEach((match, i) => {
        console.log(`  ${i + 1}. ${match.substring(0, 800)}...`);
    });
}

// Buscar el código que define el sprite inicial con name
const spriteNameMatch = content.match(/\{[^}]{0,100}name[^}]{0,1000}isStage[^}]{0,500}/g);
if (spriteNameMatch) {
    console.log(`\n✓ Encontrados ${spriteNameMatch.length} objetos con name e isStage:`);
    spriteNameMatch.slice(0, 5).forEach((match, i) => {
        console.log(`  ${i + 1}. ${match.substring(0, 600)}...`);
    });
}
