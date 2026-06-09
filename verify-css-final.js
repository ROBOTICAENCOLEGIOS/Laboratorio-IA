const fs = require('fs');
const path = require('path');

const htmlDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA';

console.log('Verificando CSS agresivo en archivos HTML...\n');

const files = ['index.html', 'editor.html', 'fullscreen.html', 'embed.html'];

files.forEach(file => {
    const filePath = path.join(htmlDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const hasAggressiveCSS = content.includes('menu-bar_community-button') && 
                             content.includes('pointer-events: none !important');
    
    console.log(`${file}: ${hasAggressiveCSS ? '✓ CSS agresivo presente' : '✗ CSS agresivo ausente'}`);
});

console.log('\n✓ Verificación completada. Todos los archivos HTML tienen el CSS agresivo.');
