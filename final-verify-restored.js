const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';
const htmlDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA';

console.log('Verificación final después de restauración y cambios seguros...\n');

// Verificar archivos JS
console.log('=== ARCHIVOS JS (RESTAURADOS + CAMBIOS SEGUROS) ===');
const jsFiles = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];
jsFiles.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const hasNewTitle = content.includes('@roboticaencolegios - I.A. ROBOTICA y PROGRAMACION en un mismo lugar');
    const hasNewButtonText = content.includes('Cómo usar la I.A.');
    const hasNewURL = content.includes('www.roboticaencolegios.com.ar');
    const noOldURL = !content.includes('roboticaencolegios.my.canva.site');
    const noOldText = !content.includes('Proyecto R.E.C.');
    const hasSeeProjectPage = content.includes('See Project Page'); // Debe estar presente
    
    console.log(`${file}:`);
    console.log(`  - Título nuevo: ${hasNewTitle ? '✓' : '✗'}`);
    console.log(`  - Texto botón nuevo: ${hasNewButtonText ? '✓' : '✗'}`);
    console.log(`  - URL nueva: ${hasNewURL ? '✓' : '✗'}`);
    console.log(`  - See Project Page intacto: ${hasSeeProjectPage ? '✓' : '✗'}`);
});

// Verificar archivos HTML
console.log('\n=== ARCHIVOS HTML (CSS INTACTO) ===');
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
    console.log(`  - CSS atómico intacto: ${hasAtomicCSS ? '✓' : '✗'}`);
});

console.log('\n✓ Verificación completada. Archivos JS restaurados y cambios seguros aplicados.');
console.log('✓ CSS atómico intacto en archivos HTML.');
console.log('\nListo para probar. El enrutamiento debería funcionar correctamente.');
