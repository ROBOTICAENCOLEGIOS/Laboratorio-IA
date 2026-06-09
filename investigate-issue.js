const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('=== INFORME DE INVESTIGACIÓN: Por qué no abre index.html ===\n');

// Verificar estado de player.js después del git checkout
console.log('1. ESTADO DE player.js DESPUÉS DE GIT CHECKOUT:');
const playerPath = path.join(jsDir, 'player.js');
const playerContent = fs.readFileSync(playerPath, 'utf8');

const hasNewButtonText = playerContent.includes('Cómo usar la I.A.');
const hasNewURL = playerContent.includes('www.roboticaencolegios.com.ar');
const hasOldText = playerContent.includes('Proyecto R.E.C.');
const hasOldURL = playerContent.includes('roboticaencolegios.my.canva.site');
const hasOriginalTitle = playerContent.includes('Ejecute proyectos de Scratch más rápido');
const hasSeeProjectPage = playerContent.includes('See Project Page');

console.log(`   - Contiene "Cómo usar la I.A.": ${hasNewButtonText ? 'SÍ' : 'NO'}`);
console.log(`   - Contiene "www.roboticaencolegios.com.ar": ${hasNewURL ? 'SÍ' : 'NO'}`);
console.log(`   - Contiene "Proyecto R.E.C.": ${hasOldText ? 'SÍ' : 'NO'}`);
console.log(`   - Contiene "roboticaencolegios.my.canva.site": ${hasOldURL ? 'SÍ' : 'NO'}`);
console.log(`   - Contiene título original "Ejecute proyectos...": ${hasOriginalTitle ? 'SÍ' : 'NO'}`);
console.log(`   - Contiene "See Project Page": ${hasSeeProjectPage ? 'SÍ' : 'NO'}`);

// Verificar tamaño del archivo
const stats = fs.statSync(playerPath);
console.log(`   - Tamaño del archivo: ${stats.size} bytes`);

// Verificar si hay sintaxis básica válida
console.log('\n2. VERIFICACIÓN DE SINTAXIS BÁSICA:');
try {
    // Intentar parsear el archivo para detectar errores de sintaxis obvios
    const firstChars = playerContent.substring(0, 100);
    const lastChars = playerContent.substring(playerContent.length - 100);
    console.log(`   - Primeros 100 caracteres: ${firstChars}`);
    console.log(`   - Últimos 100 caracteres: ${lastChars}`);
    
    // Verificar si el archivo termina correctamente
    if (playerContent.endsWith(')();') || playerContent.endsWith('}')) {
        console.log('   - El archivo parece terminar correctamente: SÍ');
    } else {
        console.log('   - El archivo parece terminar correctamente: NO (puede estar corrupto)');
    }
} catch (error) {
    console.log(`   - Error al verificar sintaxis: ${error.message}`);
}

// Verificar referencias en index.html
console.log('\n3. REFERENCIAS EN index.html:');
const htmlPath = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/index.html';
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const scriptReferences = htmlContent.match(/<script src="js\/[^"]+"><\/script>/g);
console.log(`   - Referencias a scripts JS encontradas: ${scriptReferences ? scriptReferences.length : 0}`);
if (scriptReferences) {
    scriptReferences.forEach((ref, i) => {
        console.log(`     ${i + 1}. ${ref}`);
    });
}

// Verificar si los archivos referenciados existen
console.log('\n4. VERIFICACIÓN DE EXISTENCIA DE ARCHIVOS JS REFERENCIADOS:');
if (scriptReferences) {
    scriptReferences.forEach(ref => {
        const match = ref.match(/src="js\/([^"]+)"/);
        if (match) {
            const jsFile = match[1];
            const filePath = path.join(jsDir, jsFile);
            const exists = fs.existsSync(filePath);
            console.log(`   - ${jsFile}: ${exists ? 'EXISTS' : 'MISSING'}`);
        }
    });
}

console.log('\n=== FIN DEL INFORME ===');
