const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando estructura del projectJson...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar el projectJson y su estructura
    const projectJsonMatch = content.match(/projectJson\s*=\s*Object\([^)]+\)[^;]{0,200}/g);
    if (projectJsonMatch) {
        console.log(`✓ projectJson encontrado:`);
        projectJsonMatch.slice(0, 1).forEach((match, i) => {
            console.log(`  ${i + 1}. ${match.substring(0, 200)}...`);
        });
    }
    
    // Buscar _project_data__WEBPACK_IMPORTED_MODULE_0
    const projectDataMatch = content.match(/_project_data__WEBPACK_IMPORTED_MODULE_0_\["default"\]/g);
    if (projectDataMatch) {
        console.log(`✓ Referencias a _project_data: ${projectDataMatch.length}`);
    }
    
    // Buscar el archivo project-data.js
    const projectDataFile = path.join(jsDir, 'project-data.js');
    if (fs.existsSync(projectDataFile)) {
        console.log(`✓ Archivo project-data.js existe`);
        const projectDataContent = fs.readFileSync(projectDataFile, 'utf8');
        console.log(`  Tamaño: ${projectDataContent.length} bytes`);
        
        // Buscar el sprite inicial en project-data.js
        if (projectDataContent.includes('927d672925e7b99f7813735c484c6922')) {
            console.log(`  ✓ Contiene el assetId del gato`);
            const assetIdIndex = projectDataContent.indexOf('927d672925e7b99f7813735c484c6922');
            const contextStart = Math.max(0, assetIdIndex - 300);
            const contextEnd = Math.min(projectDataContent.length, assetIdIndex + 300);
            const context = projectDataContent.substring(contextStart, contextEnd);
            console.log(`  Contexto: ${context.substring(0, 400)}...`);
        }
    } else {
        console.log(`✗ Archivo project-data.js NO existe`);
    }
});
