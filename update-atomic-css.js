const fs = require('fs');
const path = require('path');

const htmlDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA';

const atomicCSS = `      /* Bloqueo total de cualquier botón secundario o de comunidad en la barra de menú */
      [class*="community-button"], 
      [class*="see-project"],
      [class*="see-inside"],
      .menu-bar_community-button_3_WUG,
      .menu-bar_main-menu_3UvWf .menu-bar_account-nav-wrapper_3Z9YF > div:nth-child(2),
      .menu-bar_main-menu_3UvWf a[href*="projects"] {
        display: none !important;
        visibility: hidden !important;
        width: 0 !important;
        max-width: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }`;

console.log('Aplicando CSS atómico en archivos HTML...\n');

const files = ['index.html', 'editor.html', 'fullscreen.html', 'embed.html'];

files.forEach(file => {
    const filePath = path.join(htmlDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Eliminar CSS anterior si existe
    let newContent = content.replace(/\s*\/\* Ocultar por completo el botón de comunidad\/proyecto en la barra superior \*\/[^}]*\}/g, '');
    newContent = newContent.replace(/\s*\/\* Bloqueo total de cualquier botón secundario o de comunidad en la barra de menú \*\/[^}]*\}/g, '');
    
    // Agregar nuevo CSS atómico antes de cerrar </style>
    if (newContent.includes('</style>')) {
        newContent = newContent.replace('</style>', atomicCSS + '\n    </style>');
        console.log(`✓ Modificado: ${file}`);
        fs.writeFileSync(filePath, newContent, 'utf8');
    } else {
        console.log(`✗ Error: ${file} no tiene etiqueta </style>`);
    }
});

console.log('\n✓ Todos los archivos HTML han sido actualizados con CSS atómico.');
