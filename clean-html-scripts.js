const fs = require('fs');
const path = require('path');

const htmlDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA';

console.log('Limpiando scripts de título del HTML...\n');

const files = ['index.html', 'editor.html', 'fullscreen.html', 'embed.html'];

files.forEach(file => {
    const filePath = path.join(htmlDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Eliminar scripts de título (MutationObserver, Object.defineProperty, etc.)
    let newContent = content.replace(/\s*<script>\s*\/\/ Cambiar el título al cargar[^<]*<\/script>/g, '');
    newContent = newContent.replace(/\s*<script>\s*\/\/ Forzar el título correcto[^<]*<\/script>/g, '');
    newContent = newContent.replace(/\s*<script>\s*\/\/ Corregir el título si React lo cambia[^<]*<\/script>/g, '');
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✓ Limpiado: ${file}`);
    } else {
        console.log(`- Sin scripts para limpiar: ${file}`);
    }
});

console.log('\n✓ Scripts de título eliminados de los archivos HTML.');
