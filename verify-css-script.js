const fs = require('fs');
const path = require('path');

const htmlDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA';

console.log('Verificando CSS en archivos HTML...\n');

const files = ['index.html', 'editor.html', 'fullscreen.html', 'embed.html'];

files.forEach(file => {
    const filePath = path.join(htmlDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const hasCSS = content.includes('[class*="menu-bar_see-project-page"]');
    const hasNewTitle = content.includes('I.A. ROBOTICA y PROGRAMACION');
    
    console.log(`${file}:`);
    console.log(`  - CSS para ocultar botón: ${hasCSS ? '✓' : '✗'}`);
    console.log(`  - Título actualizado: ${hasNewTitle ? '✓' : '✗'}`);
});

console.log('\n✓ Verificación completada.');
