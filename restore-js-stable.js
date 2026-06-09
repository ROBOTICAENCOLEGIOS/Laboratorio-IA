const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Restaurando archivos JS desde git a versión estable...\n');

try {
    // Cambiar al directorio Laboratorio-IA
    process.chdir('c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA');
    
    // Ejecutar git checkout para restaurar archivos JS
    const result = execSync('git checkout -- js/*.js', { encoding: 'utf8' });
    console.log('✓ Archivos JS restaurados desde git (versión estable)');
    
} catch (error) {
    console.error('✗ Error al restaurar archivos:', error.message);
}
