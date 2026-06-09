const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Verificando impacto del cambio de título en archivos JS...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar si el título está en contextos de configuración
    const titleContexts = content.match(/"[^"]*@roboticaencolegios[^"]*"/g);
    if (titleContexts) {
        console.log(`⚠ Contextos con título: ${titleContexts.length}`);
        titleContexts.slice(0, 3).forEach((context, i) => {
            console.log(`  ${i + 1}. ${context.substring(0, 100)}...`);
        });
    }
    
    // Verificar si hay configuraciones de documento o título
    if (content.includes('document.title') || content.includes('setTitle')) {
        console.log('✓ Contiene configuraciones de título');
    }
});
