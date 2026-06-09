const fs = require('fs');
const path = require('path');

const htmlDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA';

const newCSS = `      /* Ocultar por completo el botón de comunidad/proyecto en la barra superior */
      [class*="menu-bar_community-button"], 
      [class*="menu-bar_see-project-page"],
      .menu-bar_community-button_3_WUG {
        display: none !important;
        width: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }`;

console.log('Actualizando CSS agresivo en archivos HTML...\n');

const files = ['index.html', 'editor.html', 'fullscreen.html', 'embed.html'];

files.forEach(file => {
    const filePath = path.join(htmlDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Eliminar CSS anterior si existe
    let newContent = content.replace(/\s*\[class\*="menu-bar_see-project-page"\]\s*\{[^}]*\}/g, '');
    
    // Agregar nuevo CSS antes de cerrar </style>
    if (newContent.includes('</style>')) {
        newContent = newContent.replace('</style>', newCSS + '\n    </style>');
        console.log(`✓ Modificado: ${file}`);
        fs.writeFileSync(filePath, newContent, 'utf8');
    } else {
        console.log(`✗ Error: ${file} no tiene etiqueta </style>`);
    }
});

console.log('\n✓ Todos los archivos HTML han sido actualizados con CSS agresivo.');
