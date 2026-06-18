const fs = require('fs');
const path = require('path');

const jsDir = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/js';

console.log('Verificando inserción del Jeep en library-sprites.js...\n');

const librarySpritesPath = path.join(jsDir, 'library-sprites.js');
const content = fs.readFileSync(librarySpritesPath, 'utf8');

// Verificar que el Jeep está al principio del array
if (content.includes('\"name\":\"RobotJeepAuto\"')) {
    console.log('✓ El Jeep está presente en library-sprites.js');
    
    // Verificar que está al principio
    const jeepIndex = content.indexOf('{"name":"RobotJeepAuto"');
    const abbyIndex = content.indexOf('{"name":"Abby"');
    
    if (jeepIndex < abbyIndex) {
        console.log('✓ El Jeep está al principio del array (antes de Abby)');
    } else {
        console.log('✗ El Jeep NO está al principio del array');
    }
    
    // Verificar el assetId correcto
    if (content.includes('53aa51dd2574ab2e13df26e8c4b468a6')) {
        console.log('✓ El assetId del Jeep es correcto (53aa51dd2574ab2e13df26e8c4b468a6)');
    } else {
        console.log('✗ El assetId del Jeep NO es correcto');
    }
    
    // Verificar el md5ext correcto
    if (content.includes('53aa51dd2574ab2e13df26e8c4b468a6.svg')) {
        console.log('✓ El md5ext del Jeep es correcto (53aa51dd2574ab2e13df26e8c4b468a6.svg)');
    } else {
        console.log('✗ El md5ext del Jeep NO es correcto');
    }
    
    // Verificar las etiquetas
    if (content.includes('["robots","vehicles","technology"]')) {
        console.log('✓ Las etiquetas del Jeep son correctas');
    } else {
        console.log('✗ Las etiquetas del Jeep NO son correctas');
    }
    
    // Verificar el nombre
    if (content.includes('"name":"RobotJeepAuto"')) {
        console.log('✓ El nombre del Jeep es correcto (RobotJeepAuto)');
    } else {
        console.log('✗ El nombre del Jeep NO es correcto');
    }
    
    // Verificar el SVG en static/assets
    const svgPath = 'c:/Users/colegios/Desktop/backup dorado/Laboratorio-IA/static/assets/53aa51dd2574ab2e13df26e8c4b468a6.svg';
    if (fs.existsSync(svgPath)) {
        console.log('✓ El archivo SVG del Jeep está en static/assets/');
    } else {
        console.log('✗ El archivo SVG del Jeep NO está en static/assets/');
    }
    
} else {
    console.log('✗ El Jeep NO está presente en library-sprites.js');
}
