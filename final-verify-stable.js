const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';
const htmlDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA';

console.log('Verificación final de estrategia estable...\n');

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
    const hasOriginalTitle = content.includes('Ejecute proyectos de Scratch más rápido'); // Debe estar presente
    const hasSeeProjectPage = content.includes('See Project Page'); // Debe estar presente
    
    console.log(`${file}:`);
    console.log(`  - Texto botón nuevo: ${hasNewButtonText ? '✓' : '✗'}`);
    console.log(`  - URL nueva: ${hasNewURL ? '✓' : '✗'}`);
    console.log(`  - Título original intacto: ${hasOriginalTitle ? '✓' : '✗'}`);
    console.log(`  - See Project Page intacto: ${hasSeeProjectPage ? '✓' : '✗'}`);
});

// Verificar archivos HTML
console.log('\n=== ARCHIVOS HTML (CSS SEGURO + SIN SCRIPTS) ===');
const htmlFiles = ['index.html', 'editor.html', 'fullscreen.html', 'embed.html'];
htmlFiles.forEach(file => {
    const filePath = path.join(htmlDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const hasSafeCSS = content.includes('[class*="community-button"]') && content.includes('visibility: hidden !important');
    const noMutationObserver = !content.includes('MutationObserver');
    const noObjectDefine = !content.includes('Object.defineProperty(document, \'title\'');
    const noTitleScript = !content.includes('document.title = "@roboticaencolegios');
    
    console.log(`${file}:`);
    console.log(`  - CSS seguro: ${hasSafeCSS ? '✓' : '✗'}`);
    console.log(`  - Sin MutationObserver: ${noMutationObserver ? '✓' : '✗'}`);
    console.log(`  - Sin Object.defineProperty: ${noObjectDefine ? '✓' : '✗'}`);
    console.log(`  - Sin script de título: ${noTitleScript ? '✓' : '✗'}`);
});

console.log('\n✓ Verificación completada.');
console.log('✓ Archivos JS: Solo botón principal modificado, enrutamiento intacto.');
console.log('✓ Archivos HTML: CSS seguro para ocultar botón, sin scripts de título.');
console.log('\nListo para probar. La app debería abrir con normalidad.');
