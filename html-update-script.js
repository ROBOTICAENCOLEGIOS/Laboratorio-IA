const fs = require('fs');
const path = require('path');

const htmlDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA';

const files = ['index.html', 'editor.html', 'fullscreen.html', 'embed.html'];

const cssRule = '\n      [class*="menu-bar_see-project-page"] {\n        display: none !important;\n      }';

console.log('Actualizando archivos HTML...\n');

files.forEach(file => {
    const filePath = path.join(htmlDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Reemplazar ANIMACIONES por PROGRAMACION en el título
    let newContent = content.replace(/I\.A\. ROBÓTICA y ANIMACIONES/g, 'I.A. ROBOTICA y PROGRAMACION');
    
    // Agregar regla CSS antes de cerrar </style>
    if (newContent.includes('</style>')) {
        newContent = newContent.replace('</style>', cssRule + '\n    </style>');
        console.log(`✓ Modificado: ${file} (CSS agregado y título actualizado)`);
    } else {
        console.log(`✗ Error: ${file} no tiene etiqueta </style>`);
    }
    
    fs.writeFileSync(filePath, newContent, 'utf8');
});

console.log('\n✓ Todos los archivos HTML han sido actualizados.');
