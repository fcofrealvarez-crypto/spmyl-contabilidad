import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface SheetInfo {
  name: string;
  rowCount: number;
  columns: string[];
  sampleData: any[];
}

/**
 * Script para analizar la estructura del archivo Excel de contabilidad
 * y generar un reporte detallado de cada hoja
 */
async function analyzeExcel() {
  const excelPath = path.join(__dirname, '..', 'data', 'Proyecto ContaSPMYL.xlsx');
  
  console.log('📊 Analizando archivo Excel:', excelPath);
  console.log('='.repeat(80));
  
  // Leer archivo Excel
  const workbook = XLSX.readFile(excelPath);
  const sheets: SheetInfo[] = [];
  
  // Analizar cada hoja
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n📄 Hoja ${index + 1}: ${sheetName}`);
    console.log('-'.repeat(80));
    
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length === 0) {
      console.log('⚠️  Hoja vacía');
      return;
    }
    
    // Obtener encabezados (primera fila)
    const headers = jsonData[0] as string[];
    console.log(`\n📋 Columnas (${headers.length}):`);
    headers.forEach((header, i) => {
      console.log(`  ${i + 1}. ${header || '(Sin nombre)'}`);
    });
    
    // Contar filas con datos
    const rowCount = jsonData.length - 1; // -1 porque la primera es encabezado
    console.log(`\n📈 Total de registros: ${rowCount}`);
    
    // Obtener datos de muestra (primeras 3 filas después del encabezado)
    const sampleData = jsonData.slice(1, 4);
    console.log(`\n🔍 Datos de muestra (primeras 3 filas):`);
    
    sampleData.forEach((row: any, index) => {
      console.log(`\n  Fila ${index + 1}:`);
      headers.forEach((header, i) => {
        const value = row[i];
        if (value !== undefined && value !== null && value !== '') {
          console.log(`    ${header}: ${value}`);
        }
      });
    });
    
    sheets.push({
      name: sheetName,
      rowCount,
      columns: headers,
      sampleData: sampleData
    });
  });
  
  // Generar reporte JSON
  const reportPath = path.join(__dirname, '..', 'data', 'excel_analysis.json');
  fs.writeFileSync(reportPath, JSON.stringify(sheets, null, 2));
  
  console.log('\n\n' + '='.repeat(80));
  console.log(`✅ Análisis completado`);
  console.log(`📄 Reporte guardado en: ${reportPath}`);
  console.log('='.repeat(80));
}

// Ejecutar análisis
analyzeExcel().catch(console.error);
