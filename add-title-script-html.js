const fs = require('fs');
const path = require('path');

const htmlDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA';

const titleScript = `
    <script>
        // Forzar el título correcto de forma continua y segura sin romper las rutas de React
        document.title = "@roboticaencolegios - I.A. ROBOTICA y PROGRAMACION en un mismo lugar";
        
        // Evitar que el JS interno lo sobrescriba con textos residuales
        Object.defineProperty(document, 'title', {
            enumerable: true,
            configurable: true,
            value: "@roboticaencolegios - I.A. ROBOTICA y PROGRAMACION en un mismo lugar",
            writable: false // Bloquea cualquier intento del sistema de cambiar el título
        });
    </script>`;

console.log('Agregando script de título forzado en archivos HTML...\n');

const files = ['index.html', 'editor.html', 'fullscreen.html', 'embed.html'];

files.forEach(file => {
    const filePath = path.join(htmlDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Eliminar script anterior si existe
    let newContent = content.replace(/\s*<script>\s*\/\/ Forzar el título correcto[^<]*<\/script>/g, '');
    
    // Agregar nuevo script antes de cerrar </body>
    if (newContent.includes('</body>')) {
        newContent = newContent.replace('</body>', titleScript + '\n  </body>');
        console.log(`✓ Modificado: ${file}`);
        fs.writeFileSync(filePath, newContent, 'utf8');
    } else {
        console.log(`✗ Error: ${file} no tiene etiqueta </body>`);
    }
});

console.log('\n✓ Todos los archivos HTML han sido actualizados con script de título forzado.');
