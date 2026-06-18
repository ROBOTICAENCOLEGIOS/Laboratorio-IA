const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

// Reemplazos para cambiar el sprite inicial por el Jeep
const spriteReplacements = [
    {
        files: ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'],
        search: '927d672925e7b99f7813735c484c6922',
        replace: '550774b7579a54151bfb23983342946c'
    },
    {
        files: ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'],
        search: '927d672925e7b99f7813735c484c6922.svg',
        replace: '550774b7579a54151bfb23983342946c.svg'
    }
];

function replaceInFile(filePath, search, replace) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const newContent = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
        
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`✓ Modificado: ${path.basename(filePath)} (${search.substring(0, 30)}... → ${replace.substring(0, 30)}...)`);
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

console.log('Reemplazando sprite inicial por Jeep...\n');

let totalModified = 0;

spriteReplacements.forEach(replacement => {
    replacement.files.forEach(file => {
        const filePath = path.join(jsDir, file);
        if (replaceInFile(filePath, replacement.search, replacement.replace)) {
            totalModified++;
        }
    });
});

console.log(`\nTotal de archivos modificados: ${totalModified}`);
