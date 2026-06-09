const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

// Reemplazos a realizar
const replacements = [
    {
        files: ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'],
        search: 'Ejecute proyectos de Scratch más rápido',
        replace: '@roboticaencolegios - I.A. ROBÓTICA y ANIMACIONES en un mismo lugar'
    },
    {
        files: ['vendors~editor~embed~fullscreen~player.js'],
        search: '"gui.menuBar.seeProjectPage": "Contacto"',
        replace: '"gui.menuBar.seeProjectPage": ""'
    }
];

// Función para reemplazar en un archivo
function replaceInFile(filePath, search, replace) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const newContent = content.replace(search, replace);
        
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`✓ Modificado: ${path.basename(filePath)}`);
            return true;
        } else {
            console.log(`- Sin cambios: ${path.basename(filePath)}`);
            return false;
        }
    } catch (error) {
        console.error(`✗ Error en ${path.basename(filePath)}:`, error.message);
        return false;
    }
}

// Ejecutar reemplazos
console.log('Iniciando reemplazos...\n');
let totalModified = 0;

replacements.forEach(replacement => {
    replacement.files.forEach(file => {
        const filePath = path.join(jsDir, file);
        if (replaceInFile(filePath, replacement.search, replacement.replace)) {
            totalModified++;
        }
    });
});

console.log(`\nTotal de archivos modificados: ${totalModified}`);
