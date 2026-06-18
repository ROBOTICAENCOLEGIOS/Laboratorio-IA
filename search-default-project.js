const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando código del proyecto por defecto...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar el código que define el proyecto por defecto
    const defaultProjectMatch = content.match(/_project_data__WEBPACK_IMPORTED_MODULE_0_\["default"\]\(translator\)[^}]{0,2000}/g);
    if (defaultProjectMatch) {
        console.log(`✓ Encontrados ${defaultProjectMatch.length} referencias a project-data:`);
        defaultProjectMatch.slice(0, 1).forEach((match, i) => {
            console.log(`  ${i + 1}. ${match.substring(0, 800)}...`);
        });
    }
    
    // Buscar el código que define el proyecto por defecto con más contexto
    const projectJsonMatch = content.match(/projectJson\s*=\s*Object\([^)]+\)\(translator\)[^;]{0,3000}/g);
    if (projectJsonMatch) {
        console.log(`\n✓ Encontrados ${projectJsonMatch.length} referencias a projectJson:`);
        projectJsonMatch.slice(0, 1).forEach((match, i) => {
            console.log(`  ${i + 1}. ${match.substring(0, 1000)}...`);
        });
    }
});
