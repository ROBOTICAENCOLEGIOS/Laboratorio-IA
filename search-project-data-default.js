const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando código de project-data default...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar el código que define el project-data default
    const projectDataDefaultMatch = content.match(/_project_data__WEBPACK_IMPORTED_MODULE_0_\["default"\]\(translator\)[^;]{0,5000}/g);
    if (projectDataDefaultMatch) {
        console.log(`✓ Encontrados ${projectDataDefaultMatch.length} referencias a project-data default:`);
        projectDataDefaultMatch.slice(0, 1).forEach((match, i) => {
            console.log(`  ${i + 1}. ${match.substring(0, 2000)}...`);
        });
    }
    
    // Buscar el código que define el project-data con más contexto
    const projectDataMatch = content.match(/project-data[^}]{0,5000}/g);
    if (projectDataMatch) {
        console.log(`\n✓ Encontrados ${projectDataMatch.length} referencias a project-data:`);
        projectDataMatch.slice(0, 2).forEach((match, i) => {
            console.log(`  ${i + 1}. ${match.substring(0, 1000)}...`);
        });
    }
});
