const fs = require('fs');
const path = require('path');

const htmlDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA';

const newTitleScript = `
    <script>
        // Cambiar el título al cargar
        document.title = "@roboticaencolegios - I.A. ROBOTICA y PROGRAMACION en un mismo lugar";

        // Corregir el título si React lo cambia, de forma amigable y sin romper la app
        const targetNode = document.querySelector('title') || document.head;
        const observer = new MutationObserver(() => {
            const targetTitle = "@roboticaencolegios - I.A. ROBOTICA y PROGRAMACION en un mismo lugar";
            if (document.title !== targetTitle) {
                document.title = targetTitle;
            }
        });
        observer.observe(targetNode, { subtree: true, characterData: true, childList: true });
    </script>`;

console.log('Reemplazando script de título en archivos HTML (sin bloquear propiedad .title)...\n');

const files = ['index.html', 'editor.html', 'fullscreen.html', 'embed.html'];

files.forEach(file => {
    const filePath = path.join(htmlDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Eliminar script anterior de título
    let newContent = content.replace(/\s*<script>\s*\/\/ Forzar el título correcto[^<]*<\/script>/g, '');
    
    // Agregar nuevo script antes de cerrar </body>
    if (newContent.includes('</body>')) {
        newContent = newContent.replace('</body>', newTitleScript + '\n  </body>');
        console.log(`✓ Modificado: ${file}`);
        fs.writeFileSync(filePath, newContent, 'utf8');
    } else {
        console.log(`✗ Error: ${file} no tiene etiqueta </body>`);
    }
});

console.log('\n✓ Todos los archivos HTML han sido actualizados con script de título corregido.');
