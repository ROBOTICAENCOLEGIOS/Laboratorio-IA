const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

// Reemplazos seguros SOLO para botón principal
const replacements = [
    {
        files: ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'],
        search: 'Proyecto R.E.C.',
        replace: 'Cómo usar la I.A.'
    },
    {
        files: ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'],
        search: 'roboticaencolegios.my.canva.site',
        replace: 'www.roboticaencolegios.com.ar'
    }
];

function replaceInFile(filePath, search, replace) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const newContent = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
        
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`✓ Modificado: ${path.basename(filePath)} (${search} → ${replace})`);
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

console.log('Aplicando reemplazos seguros de botón principal...\n');
console.log('NOTA: NO se modificará "See Project Page" ni "Ver página del proyecto"\n');

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
