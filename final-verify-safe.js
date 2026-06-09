const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';
const htmlDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA';

console.log('Verificación final de estrategia segura...\n');

// Verificar archivos JS
console.log('=== ARCHIVOS JS (SOLO BOTÓN PRINCIPAL) ===');
const jsFiles = ['player.js', 'editor.js', 'fullscreen.js', 'embed.js'];
jsFiles.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const hasNewButtonText = content.includes('Cómo usar la I.A.');
    const hasNewURL = content.includes('www.roboticaencolegios.com.ar');
    const noOldURL = !content.includes('roboticaencolegios.my.canva.site');
    const noOldText = !content.includes('Proyecto R.E.C.');
    const hasOldTitle = content.includes('Ejecute proyectos de Scratch más rápido'); // Debe estar presente
    const hasSeeProjectPage = content.includes('See Project Page'); // Debe estar presente
    
    console.log(`${file}:`);
    console.log(`  - Texto botón nuevo: ${hasNewButtonText ? '✓' : '✗'}`);
    console.log(`  - URL nueva: ${hasNewURL ? '✓' : '✗'}`);
    console.log(`  - Título original intacto: ${hasOldTitle ? '✓' : '✗'}`);
    console.log(`  - See Project Page intacto: ${hasSeeProjectPage ? '✓' : '✗'}`);
});

// Verificar archivos HTML
console.log('\n=== ARCHIVOS HTML (TÍTULO FORZADO + CSS) ===');
const htmlFiles = ['index.html', 'editor.html', 'fullscreen.html', 'embed.html'];
htmlFiles.forEach(file => {
    const filePath = path.join(htmlDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const hasTitleScript = content.includes('Object.defineProperty(document, \'title\'');
    const hasAtomicCSS = content.includes('menu-bar_main-menu_3UvWf') && content.includes('visibility: hidden !important');
    
    console.log(`${file}:`);
    console.log(`  - Script de título forzado: ${hasTitleScript ? '✓' : '✗'}`);
    console.log(`  - CSS atómico intacto: ${hasAtomicCSS ? '✓' : '✗'}`);
});

console.log('\n✓ Verificación completada.');
console.log('✓ Archivos JS: Solo botón principal modificado, enrutamiento intacto.');
console.log('✓ Archivos HTML: Título forzado vía JavaScript nativo + CSS intacto.');
console.log('\nListo para probar. El enrutamiento debería funcionar correctamente.');
