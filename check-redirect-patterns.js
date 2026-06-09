const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Buscando patrones de redirección específicos...\n');

const files = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Buscar redirecciones específicas
    const redirectPatterns = content.match(/location\.(href|replace|assign)\([^)]+\)/g);
    if (redirectPatterns) {
        console.log(`⚠ Patrones de redirección encontrados: ${redirectPatterns.length}`);
        redirectPatterns.slice(0, 5).forEach((pattern, i) => {
            console.log(`  ${i + 1}. ${pattern.substring(0, 100)}...`);
        });
    }
    
    // Buscar si hay redirecciones a index.html
    if (content.includes('index.html') && content.includes('location')) {
        console.log('⚠ Posible redirección a index.html');
        const indexRedirects = content.match(/location[^;]*index\.html/g);
        if (indexRedirects) {
            indexRedirects.slice(0, 3).forEach((redirect, i) => {
                console.log(`  ${i + 1}. ${redirect.substring(0, 80)}...`);
            });
        }
    }
    
    // Buscar configuraciones de home o default path
    if (content.includes('defaultPath') || content.includes('homePath') || content.includes('basePath')) {
        console.log('✓ Contiene configuraciones de ruta');
    }
});
