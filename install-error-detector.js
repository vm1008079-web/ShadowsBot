import { readFileSync, writeFileSync } from 'fs';

// Este script agrega automáticamente el import al archivo principal
const mainFile = './main.js'; // o index.js, depending de tu estructura
const importLine = `import './plugins/detect-error.js';\n`;

try {
    const data = readFileSync(mainFile, 'utf8');
    
    // Verificar si ya está importado
    if (data.includes('detect-error')) {
        console.log('✅ El detector de errores ya está instalado');
    } else {
        // Encontrar donde agregar el import (después de los otros imports)
        const lines = data.split('\n');
        let lastImportIndex = -1;
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith('import') && lines[i].includes('from')) {
                lastImportIndex = i;
            }
        }
        
        if (lastImportIndex !== -1) {
            lines.splice(lastImportIndex + 1, 0, importLine);
            writeFileSync(mainFile, lines.join('\n'), 'utf8');
            console.log('✅ Detector de errores instalado correctamente');
        } else {
            // Si no hay imports, agregar al inicio
            writeFileSync(mainFile, importLine + data, 'utf8');
            console.log('✅ Detector de errores instalado al inicio');
        }
    }
} catch (error) {
    console.error('❌ Error al instalar:', error);
}
