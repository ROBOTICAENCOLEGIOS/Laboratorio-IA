const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Restaurando archivos JS desde git para corregir problema de enrutamiento...\n');

try {
    // Cambiar al directorio Laboratorio-IA
    process.chdir('c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA');
    
    // Ejecutar git checkout para restaurar archivos JS
    const result = execSync('git checkout -- js/*.js', { encoding: 'utf8' });
    console.log('✓ Archivos JS restaurados desde git');
    
    console.log('\nAhora vamos a aplicar SOLO los cambios seguros:');
    console.log('1. Título dinámico (sin tocar enrutamiento)');
    console.log('2. Botón principal (sin tocar See Project Page)');
    
} catch (error) {
    console.error('✗ Error al restaurar archivos:', error.message);
}
