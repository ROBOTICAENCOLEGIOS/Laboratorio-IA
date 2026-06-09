const fs = require('fs');
const path = require('path');

const htmlDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA';

console.log('Verificando CSS en HTML para ocultar botón comunidad...\n');

const files = ['index.html', 'editor.html', 'fullscreen.html', 'embed.html'];

files.forEach(file => {
    const filePath = path.join(htmlDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const hasCSS = content.includes('[class*="community-button"]') && content.includes('visibility: hidden !important');
    
    console.log(`${file}:`);
    console.log(`  - CSS para ocultar botón: ${hasCSS ? '✓' : '✗'}`);
});

console.log('\n✓ Verificación completada.');
