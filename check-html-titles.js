const fs = require('fs');
const path = require('path');

const htmlDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA';

console.log('Verificando títulos en archivos HTML...\n');

const files = ['index.html', 'editor.html', 'fullscreen.html', 'embed.html'];

files.forEach(file => {
    const filePath = path.join(htmlDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const titleMatch = content.match(/<title>([^<]+)<\/title>/);
    if (titleMatch) {
        console.log(`${file}:`);
        console.log(`  ${titleMatch[1]}`);
    }
});
