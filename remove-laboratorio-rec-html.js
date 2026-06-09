const fs = require('fs');
const path = require('path');

const htmlDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA';

console.log('Eliminando "Laboratorio REC - " de títulos en archivos HTML...\n');

const files = ['index.html', 'editor.html', 'fullscreen.html', 'embed.html'];

files.forEach(file => {
    const filePath = path.join(htmlDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Reemplazar "Laboratorio REC - " por vacío en los títulos
    const newContent = content.replace(/Laboratorio REC - /g, '');
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✓ Modificado: ${file}`);
    } else {
        console.log(`- Sin cambios: ${file}`);
    }
});

console.log('\n✓ Todos los archivos HTML han sido actualizados.');
