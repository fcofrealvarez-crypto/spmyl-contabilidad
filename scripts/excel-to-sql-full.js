const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

function excelDateToSQL(excelDate) {
    if (!excelDate || typeof excelDate !== 'number') return null;
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
}

function escapeSql(value) {
    if (value === null || value === undefined || value === '') return 'NULL';
    if (typeof value === 'number') return value;
    return `'${String(value).replace(/'/g, "''")}'`;
}

async function convertExcelToSQL() {
    const excelPath = path.join(__dirname, '..', 'data', 'Proyecto ContaSPMYL.xlsx');
    const outputDir = path.join(__dirname, '..', 'supabase', 'migrations');

    console.log('📊 Convirtiendo TODOS los datos del Excel a SQL...');
    console.log('='.repeat(80));

    const workbook = XLSX.readFile(excelPath);
    let sqlStatements = [];
    const companyIdPlaceholder = '{{COMPANY_ID}}';

    sqlStatements.push('-- IMPORTACIÓN COMPLETA DE DATOS REALES');
    sqlStatements.push('-- NOTA: Reemplaza {{COMPANY_ID}} con el UUID de tu empresa\n');

    // LIBRO MAYOR
    console.log('\n📄 Procesando Libro Mayor...');
    const libroMayor = workbook.Sheets['Hoja1'];
    const libroMayorData = XLSX.utils.sheet_to_json(libroMayor);
    console.log(`   Total registros: ${libroMayorData.length}`);

    const entries = {};
    libroMayorData.forEach((row) => {
        const entryKey = `${row['TIPO COMP']}-${row['FECHA']}`;
        if (!entries[entryKey]) {
            entries[entryKey] = {
                tipo: row['TIPO COMP'],
                fecha: row['FECHA'],
                glosa: row['GLOSA '] || '',
                lines: []
            };
        }
        entries[entryKey].lines.push({
            codigo: row['CODIGO '] || '',
            cuenta: row['CTA DESCRIPCION'] || '',
            debe: parseFloat(row['DEBE ']) || 0,
            haber: parseFloat(row['HABER ']) || 0,
            control: parseFloat(row['CONTROL ']) || 0,
            compensacion: parseFloat(row['COMPENSACION']) || 0,
            rut: row['RUT '] || '',
            nombre: row['NOMBRE'] || ''
        });
    });

    const totalEntries = Object.keys(entries).length;
    console.log(`   Asientos únicos: ${totalEntries}`);

    sqlStatements.push(`\n-- LIBRO MAYOR - ${totalEntries} Asientos\n`);

    let entryCount = 0;
    let lineCount = 0;

    Object.keys(entries).forEach((entryKey) => {
        const entry = entries[entryKey];
        const entryDate = excelDateToSQL(entry.fecha) || '2023-01-01';
        const month = new Date(entryDate).getMonth() + 1;
        const year = new Date(entryDate).getFullYear();

        sqlStatements.push(`WITH new_entry AS (`);
        sqlStatements.push(`  INSERT INTO public.journal_entries (company_id, entry_number, entry_type, entry_date, month, year, description, gloss, status)`);
        sqlStatements.push(`  VALUES (${companyIdPlaceholder}, ${escapeSql('JE-' + (entryCount + 1).toString().padStart(6, '0'))}, ${escapeSql(entry.tipo)}, ${escapeSql(entryDate)}, ${month}, ${year}, ${escapeSql(entry.glosa)}, ${escapeSql(entry.glosa)}, 'POSTED')`);
        sqlStatements.push(`  RETURNING id`);
        sqlStatements.push(`)`);

        entry.lines.forEach((line, lineIndex) => {
            if (lineIndex === 0) {
                sqlStatements.push(`INSERT INTO public.journal_entry_lines (journal_entry_id, account_code, account_name, debit, credit, control, compensation, third_party_rut, third_party_name, line_order)`);
                sqlStatements.push(`SELECT id, ${escapeSql(line.codigo)}, ${escapeSql(line.cuenta)}, ${line.debe}, ${line.haber}, ${line.control || 'NULL'}, ${line.compensacion || 'NULL'}, ${escapeSql(line.rut)}, ${escapeSql(line.nombre)}, ${lineIndex + 1} FROM new_entry`);
            } else {
                sqlStatements.push(`UNION ALL SELECT id, ${escapeSql(line.codigo)}, ${escapeSql(line.cuenta)}, ${line.debe}, ${line.haber}, ${line.control || 'NULL'}, ${line.compensacion || 'NULL'}, ${escapeSql(line.rut)}, ${escapeSql(line.nombre)}, ${lineIndex + 1} FROM new_entry`);
            }
            lineCount++;
        });

        sqlStatements.push(';\n');
        entryCount++;

        if (entryCount % 100 === 0) {
            console.log(`   Procesados ${entryCount}/${totalEntries}...`);
        }
    });

    console.log(`   ✓ Generados ${entryCount} asientos con ${lineCount} líneas`);

    // LIBRO DE COMPRAS
    console.log('\n📄 Procesando Libro de Compras...');
    const libroCompras = workbook.Sheets['Libro compra '];
    const libroComprasData = XLSX.utils.sheet_to_json(libroCompras);
    console.log(`   Total registros: ${libroComprasData.length}`);

    sqlStatements.push(`\n-- LIBRO DE COMPRAS - ${libroComprasData.length} Registros\n`);

    libroComprasData.forEach((row, index) => {
        const docDate = excelDateToSQL(row['Fecha Docto']) || '2023-01-01';
        const recDate = excelDateToSQL(row['Fecha Recepcion']);
        const ackDate = excelDateToSQL(row['Fecha Acuse']);
        const month = parseInt(row['Mes']) || 1;
        const year = new Date(docDate).getFullYear();

        sqlStatements.push(`INSERT INTO public.purchase_book (company_id, month, year, line_number, document_type, purchase_type, supplier_rut, supplier_name, folio, document_date, reception_date, acknowledgment_date, exempt_amount, net_amount, iva_amount, fixed_asset_amount, non_recoverable_iva, total_amount) VALUES (${companyIdPlaceholder}, ${month}, ${year}, ${parseInt(row['Nro']) || (index + 1)}, ${escapeSql(row['Tipo Doc'])}, ${escapeSql(row['Tipo Compra'])}, ${escapeSql(row['RUT Proveedor'])}, ${escapeSql(row['Razon Social'])}, ${escapeSql(row['Folio'])}, ${escapeSql(docDate)}, ${escapeSql(recDate)}, ${escapeSql(ackDate)}, ${parseFloat(row['Monto Exento']) || 0}, ${parseFloat(row['Monto Neto']) || 0}, ${parseFloat(row['Monto IVA Recuperable']) || 0}, ${parseFloat(row['Monto Neto Activo Fijo']) || 0}, ${parseFloat(row['Monto Iva No Recuperable']) || 0}, ${parseFloat(row['Monto Total']) || 0});\n`);
    });

    console.log(`   ✓ Generados ${libroComprasData.length} registros`);

    sqlStatements.push(`INSERT INTO public.sales_book(company_id, month, year, line_number, document_type, sale_type, customer_rut, customer_name, folio, issue_date, exempt_amount, net_amount, iva_amount, total_amount) VALUES(${companyIdPlaceholder}, ${month}, ${year}, ${parseInt(row['Nro']) || (index + 1)}, ${escapeSql(row['Tipo Doc'])}, ${escapeSql(row['Tipo Venta'])}, ${escapeSql(row['Rut cliente'])}, ${escapeSql(row['Razon Social'])}, ${escapeSql(row['Folio'])}, ${escapeSql(issueDate)}, ${parseFloat(row['Monto Exento']) || 0}, ${parseFloat(row['Monto Neto']) || 0}, ${parseFloat(row['Monto IVA']) || 0}, ${parseFloat(row['Monto total']) || 0}); \n`);
});

console.log(`   ✓ Generados ${libroVentasData.length} registros`);

// GUARDAR
const outputPath = path.join(outputDir, '20251126000001_import_real_data.sql');
fs.writeFileSync(outputPath, sqlStatements.join('\n'));

console.log('\n' + '='.repeat(80));
console.log('✅ CONVERSIÓN COMPLETADA');
console.log('='.repeat(80));
console.log(`📄 Archivo: ${outputPath} `);
console.log(`\n📊 Resumen: `);
console.log(`   - Asientos: ${entryCount} `);
console.log(`   - Líneas: ${lineCount} `);
console.log(`   - Compras: ${libroComprasData.length} `);
console.log(`   - Ventas: ${libroVentasData.length} `);
console.log(`   - TOTAL: ${entryCount + lineCount + libroComprasData.length + libroVentasData.length} registros`);
console.log('\n⚠️  IMPORTANTE: Reemplaza {{COMPANY_ID}} antes de ejecutar');
console.log('='.repeat(80));
}

convertExcelToSQL().catch(console.error);
