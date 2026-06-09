const fs = require('fs');
const path = require('path');

const htmlDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA';

console.log('Verificando scripts y redirecciones en archivos HTML...\n');

const files = ['index.html', 'editor.html', 'fullscreen.html', 'embed.html'];

files.forEach(file => {
    const filePath = path.join(htmlDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n=== ${file} ===`);
    
    // Verificar si hay scripts de redirección
    if (content.includes('location.replace') || content.includes('location.href')) {
        console.log('⚠ Contiene scripts de redirección');
        const redirects = content.match(/location\.(replace|href)[^;]+/g);
        if (redirects) {
            redirects.forEach((redirect, i) => {
                console.log(`  ${i + 1}. ${redirect.substring(0, 80)}...`);
            });
        }
    } else {
        console.log('✓ No contiene scripts de redirección');
    }
    
    // Verificar si hay referencias a otros archivos HTML
    if (content.includes('index.html') && file !== 'index.html') {
        console.log('⚠ Contiene referencia a index.html');
    }
    
    // Verificar si hay meta refresh
    if (content.includes('http-equiv="refresh"')) {
        console.log('⚠ Contiene meta refresh');
    }
});
