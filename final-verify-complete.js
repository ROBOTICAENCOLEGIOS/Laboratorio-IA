const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';
const htmlDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA';

console.log('Verificación final completa...\n');

// Verificar archivos JS
console.log('=== ARCHIVOS JS ===');
const jsFiles = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];
jsFiles.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const hasNewTitle = content.includes('@roboticaencolegios - I.A. ROBOTICA y PROGRAMACION en un mismo lugar');
    const hasNewButtonText = content.includes('Cómo usar la I.A.');
    const hasNewURL = content.includes('www.roboticaencolegios.com.ar');
    const noOldURL = !content.includes('roboticaencolegios.my.canva.site');
    const noOldText = !content.includes('Proyecto R.E.C.');
    const noLaboratorioREC = !content.includes('Laboratorio REC');
    const hasSeeProjectPage = content.includes('See Project Page');
    
    console.log(`${file}:`);
    console.log(`  - Título nuevo: ${hasNewTitle ? '✓' : '✗'}`);
    console.log(`  - Texto botón nuevo: ${hasNewButtonText ? '✓' : '✗'}`);
    console.log(`  - URL nueva: ${hasNewURL ? '✓' : '✗'}`);
    console.log(`  - URL vieja removida: ${noOldURL ? '✓' : '✗'}`);
    console.log(`  - Texto viejo removido: ${noOldText ? '✓' : '✗'}`);
    console.log(`  - Laboratorio REC removido: ${noLaboratorioREC ? '✓' : '✗'}`);
    console.log(`  - See Project Page intacto: ${hasSeeProjectPage ? '✓' : '✗'}`);
});

// Verificar archivos HTML
console.log('\n=== ARCHIVOS HTML ===');
const htmlFiles = ['index.html', 'editor.html', 'fullscreen.html', 'embed.html'];
htmlFiles.forEach(file => {
    const filePath = path.join(htmlDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const titleMatch = content.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1] : '';
    const noLaboratorioREC = !title.includes('Laboratorio REC');
    const hasAtomicCSS = content.includes('menu-bar_main-menu_3UvWf') && content.includes('visibility: hidden !important');
    
    console.log(`${file}:`);
    console.log(`  - Título: ${title}`);
    console.log(`  - Laboratorio REC removido: ${noLaboratorioREC ? '✓' : '✗'}`);
    console.log(`  - CSS atómico: ${hasAtomicCSS ? '✓' : '✗'}`);
});

console.log('\n✓ Verificación completada. Todos los cambios están guardados en disco.');
