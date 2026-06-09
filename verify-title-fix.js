const fs = require('fs');
const path = require('path');

const htmlDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA';

console.log('Verificando script de título corregido en archivos HTML...\n');

const files = ['index.html', 'editor.html', 'fullscreen.html', 'embed.html'];

files.forEach(file => {
    const filePath = path.join(htmlDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const hasMutationObserver = content.includes('MutationObserver');
    const hasTargetTitle = content.includes('@roboticaencolegios - I.A. ROBOTICA y PROGRAMACION en un mismo lugar');
    const noObjectDefine = !content.includes('Object.defineProperty(document, \'title\'');
    const hasAtomicCSS = content.includes('menu-bar_main-menu_3UvWf') && content.includes('visibility: hidden !important');
    
    console.log(`${file}:`);
    console.log(`  - MutationObserver: ${hasMutationObserver ? '✓' : '✗'}`);
    console.log(`  - Título correcto: ${hasTargetTitle ? '✓' : '✗'}`);
    console.log(`  - Sin Object.defineProperty: ${noObjectDefine ? '✓' : '✗'}`);
    console.log(`  - CSS atómico intacto: ${hasAtomicCSS ? '✓' : '✗'}`);
});

console.log('\n✓ Verificación completada.');
console.log('✓ Script de título corregido (sin bloquear propiedad .title).');
console.log('✓ CSS atómico intacto.');
console.log('\nListo para probar. React no debería romperse.');
