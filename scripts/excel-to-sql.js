const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Script para convertir el archivo Excel de contabilidad a SQL
 * Genera archivos de migración con INSERT statements
 */

// Función helper para formatear fechas de Excel a SQL
function excelDateToSQL(excelDate) {
    if (!excelDate || typeof excelDate !== 'number') return null;
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
}

// Función helper para escapar string SQL
function escapeSql(value) {
    if (value === null || value === undefined || value === '') return 'NULL';
    if (typeof value === 'number') return value;
    return `'${String(value).replace(/'/g, "''")}'`;
}

// Función helper para generar UUID (simple para ejemplo)
function generateUUID() {
    return 'gen_random_uuid()';
}

async function convertExcelToSQL() {
    const excelPath = path.join(__dirname, '..', 'data', 'Proyecto ContaSPMYL.xlsx');
    const outputDir = path.join(__dirname, '..', 'supabase', 'migrations');

    console.log('📊 Convirtiendo Excel a SQL...');
    console.log('='.repeat(80));

    const workbook = XLSX.readFile(excelPath);
    let sqlStatements = [];

    // Variable para almacenar company_id (deberás cambiar esto por el ID real)
    const companyIdPlaceholder = '{{COMPANY_ID}}'; // Se reemplazará manualmente

    sqlStatements.push('-- ============================================================================');
    sqlStatements.push('-- IMPORTACIÓN DE DATOS REALES DESDE EXCEL');
    sqlStatements.push('-- ============================================================================');
    sqlStatements.push('-- NOTA: Reemplaza {{COMPANY_ID}} con el UUID de tu empresa antes de ejecutar');
    sqlStatements.push('-- Por ejemplo: SELECT id FROM companies WHERE name = \'TU EMPRESA\';');
    sqlStatements.push('-- ============================================================================\\n');

    // ========================================================================
    // HOJA 1: LIBRO MAYOR (journal_entries y journal_entry_lines)
    // ========================================================================
    console.log('\\n📄 Procesando Hoja 1: Libro Mayor...');

    const libroMayor = workbook.Sheets['Hoja1'];
    const libroMayorData = XLSX.utils.sheet_to_json(libroMayor);

    console.log(`   Registros encontrados: ${libroMayorData.length}`);

    // Agrupar por número de comprobante
    const entries = {};

    libroMayorData.forEach((row, index) => {
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
            tipoDoc: row['TIPO DOC '] || '',
            nDoc: row['N. DOC '] || '',
            rut: row['RUT '] || '',
            nombre: row['NOMBRE'] || ''
        });
    });

    sqlStatements.push('-- ============================================================================');
    sqlStatements.push('-- LIBRO MAYOR - Journal Entries');
    sqlStatements.push('-- ============================================================================\\n');

    let entryCount = 0;
    let lineCount = 0;

    Object.keys(entries).forEach((entryKey, index) => {
        const entry = entries[entryKey];
        const entryId = `entry_${index + 1}`;
        const entryDate = excelDateToSQL(entry.fecha) || '2023-01-01';
        const month = new Date(entryDate).getMonth() + 1;
        const year = new Date(entryDate).getFullYear();

        // Insertar journal entry (solo primeros 50 para no exceder límites)
        if (entryCount < 50) {
            sqlStatements.push(`-- Entry #${entryCount + 1}: ${entry.tipo}`);
            sqlStatements.push(`INSERT INTO public.journal_entries (id, company_id, entry_number, entry_type, entry_date, month, year, description, gloss, status, created_at)`);
            sqlStatements.push(`VALUES (`);
            sqlStatements.push(`    ${generateUUID()}, -- id`);
            sqlStatements.push(`    ${companyIdPlaceholder}, -- company_id`);
            sqlStatements.push(`    ${escapeSql('ENTRY_' + (entryCount + 1))}, -- entry_number`);
            sqlStatements.push(`    ${escapeSql(entry.tipo)}, -- entry_type`);
            sqlStatements.push(`    ${escapeSql(entryDate)}, -- entry_date`);
            sqlStatements.push(`    ${month}, -- month`);
            sqlStatements.push(`    ${year}, -- year`);
            sqlStatements.push(`    ${escapeSql(entry.glosa)}, -- description`);
            sqlStatements.push(`    ${escapeSql(entry.glosa)}, -- gloss`);
            sqlStatements.push(`    'POSTED', -- status`);
            sqlStatements.push(`    now() -- created_at`);
            sqlStatements.push(`) RETURNING id;`);
            sqlStatements.push('');

            // Insertar líneas (solo primeras 3 líneas por asiento para ejemplo)
            entry.lines.slice(0, 3).forEach((line, lineIndex) => {
                sqlStatements.push(`-- Line ${lineIndex + 1}`);
                sqlStatements.push(`INSERT INTO public.journal_entry_lines (journal_entry_id, account_code, account_name, debit, credit, control, compensation, third_party_rut, third_party_name, line_order)`);
                sqlStatements.push(`SELECT id, ${escapeSql(line.codigo)}, ${escapeSql(line.cuenta)}, ${line.debe}, ${line.haber}, ${line.control || 'NULL'}, ${line.compensacion || 'NULL'}, ${escapeSql(line.rut)}, ${escapeSql(line.nombre)}, ${lineIndex + 1}`);
                sqlStatements.push(`FROM public.journal_entries WHERE entry_number = ${escapeSql('ENTRY_' + (entryCount + 1))} AND company_id = ${companyIdPlaceholder};`);
                sqlStatements.push('');
                lineCount++;
            });

            entryCount++;
        }
    });

    console.log(`   ✓ Generados ${entryCount} asientos con ${lineCount} líneas (muestra)`);

    // ========================================================================
    // HOJA 2: LIBRO DE COMPRAS
    // ========================================================================
    console.log('\\n📄 Procesando Hoja 2: Libro de Compras...');

    const libroCompras = workbook.Sheets['Libro compra '];
    const libroComprasData = XLSX.utils.sheet_to_json(libroCompras);

    console.log(`   Registros encontrados: ${libroComprasData.length}`);

    sqlStatements.push('\\n-- ============================================================================');
    sqlStatements.push('-- LIBRO DE COMPRAS');
    sqlStatements.push('-- ============================================================================\\n');

    libroComprasData.slice(0, 50).forEach((row, index) => {
        const docDate = excelDateToSQL(row['Fecha Docto']) || '2023-01-01';
        const recDate = excelDateToSQL(row['Fecha Recepcion']);
        const ackDate = excelDateToSQL(row['Fecha Acuse']);
        const month = parseInt(row['Mes']) || 1;
        const year = new Date(docDate).getFullYear();

        sqlStatements.push(`INSERT INTO public.purchase_book (`);
        sqlStatements.push(`    company_id, month, year, line_number, document_type, purchase_type,`);
        sqlStatements.push(`    supplier_rut, supplier_name, folio, document_date, reception_date, acknowledgment_date,`);
        sqlStatements.push(`    exempt_amount, net_amount, iva_amount, fixed_asset_amount, non_recoverable_iva, total_amount`);
        sqlStatements.push(`) VALUES (`);
        sqlStatements.push(`    ${companyIdPlaceholder}, -- company_id`);
        sqlStatements.push(`    ${month}, -- month`);
        sqlStatements.push(`    ${year}, -- year`);
        sqlStatements.push(`    ${parseInt(row['Nro']) || (index + 1)}, -- line_number`);
        sqlStatements.push(`    ${escapeSql(row['Tipo Doc'])}, -- document_type`);
        sqlStatements.push(`    ${escapeSql(row['Tipo Compra'])}, -- purchase_type`);
        sqlStatements.push(`    ${escapeSql(row['RUT Proveedor'])}, -- supplier_rut`);
        sqlStatements.push(`    ${escapeSql(row['Razon Social'])}, -- supplier_name`);
        sqlStatements.push(`    ${escapeSql(row['Folio'])}, -- folio`);
        sqlStatements.push(`    ${escapeSql(docDate)}, -- document_date`);
        sqlStatements.push(`    ${escapeSql(recDate)}, -- reception_date`);
        sqlStatements.push(`    ${escapeSql(ackDate)}, -- acknowledgment_date`);
        sqlStatements.push(`    ${parseFloat(row['Monto Exento']) || 0}, -- exempt_amount`);
        sqlStatements.push(`    ${parseFloat(row['Monto Neto']) || 0}, -- net_amount`);
        sqlStatements.push(`    ${parseFloat(row['Monto IVA Recuperable']) || 0}, -- iva_amount`);
        sqlStatements.push(`    ${parseFloat(row['Monto Neto Activo Fijo']) || 0}, -- fixed_asset_amount`);
        sqlStatements.push(`    ${parseFloat(row['Monto Iva No Recuperable']) || 0}, -- non_recoverable_iva`);
        sqlStatements.push(`    ${parseFloat(row['Monto Total']) || 0} -- total_amount`);
        sqlStatements.push(`);\\n`);
    });

    console.log(`   ✓ Generados ${Math.min(libroComprasData.length, 50)} registros de compras`);

    // ========================================================================
    // HOJA 3: LIBRO DE VENTAS
    // ========================================================================
    console.log('\\n📄 Procesando Hoja 3: Libro de Ventas...');

    const libroVentas = workbook.Sheets['Libro Ventas'];
    const libroVentasData = XLSX.utils.sheet_to_json(libroVentas);

    console.log(`   Registros encontrados: ${libroVentasData.length}`);

    sqlStatements.push('\\n-- ============================================================================');
    sqlStatements.push('-- LIBRO DE VENTAS');
    sqlStatements.push('-- ============================================================================\\n');

    libroVentasData.forEach((row, index) => {
        const issueDate = excelDateToSQL(row['Fecha Docto']) || '2023-01-01';
        const month = parseInt(row['Mes']) || 1;
        const year = new Date(issueDate).getFullYear();

        sqlStatements.push(`INSERT INTO public.sales_book (`);
        sqlStatements.push(`    company_id, month, year, line_number, document_type, sale_type,`);
        sqlStatements.push(`    customer_rut, customer_name,folio, issue_date,`);
        sqlStatements.push(`    exempt_amount, net_amount, iva_amount, total_amount`);
        sqlStatements.push(`) VALUES (`);
        sqlStatements.push(`    ${companyIdPlaceholder}, -- company_id`);
        sqlStatements.push(`    ${month}, -- month`);
        sqlStatements.push(`    ${year}, -- year`);
        sqlStatements.push(`    ${parseInt(row['Nro']) || (index + 1)}, -- line_number`);
        sqlStatements.push(`    ${escapeSql(row['Tipo Doc'])}, -- document_type`);
        sqlStatements.push(`    ${escapeSql(row['Tipo Venta'])}, -- sale_type`);
        sqlStatements.push(`    ${escapeSql(row['Rut cliente'])}, -- customer_rut`);
        sqlStatements.push(`    ${escapeSql(row['Razon Social'])}, -- customer_name`);
        sqlStatements.push(`    ${escapeSql(row['Folio'])}, -- folio`);
        sqlStatements.push(`    ${escapeSql(issueDate)}, -- issue_date`);
        sqlStatements.push(`    ${parseFloat(row['Monto Exento']) || 0}, -- exempt_amount`);
        sqlStatements.push(`    ${parseFloat(row['Monto Neto']) || 0}, -- net_amount`);
        sqlStatements.push(`    ${parseFloat(row['Monto IVA']) || 0}, -- iva_amount`);
        sqlStatements.push(`    ${parseFloat(row['Monto total']) || 0} -- total_amount`);
        sqlStatements.push(`);\\n`);
    });

    console.log(`   ✓ Generados ${libroVentasData.length} registros de ventas`);

    // ========================================================================
    // GUARDAR ARCHIVO SQL
    // ========================================================================
    const outputPath = path.join(outputDir, '20251126000001_import_real_data.sql');
    const sqlContent = sqlStatements.join('\\n');

    fs.writeFileSync(outputPath, sqlContent);

    console.log('\\n' + '='.repeat(80));
    console.log(`✅ Conversión completada`);
    console.log(`📄 Archivo SQL generado: ${outputPath}`);
    console.log('\\n⚠️  IMPORTANTE: Antes de ejecutar la migración:`);
    console.log(`   1. Reemplaza {{COMPANY_ID}} con el UUID de tu empresa`);
    console.log(`   2. Revisa los datos generados`);
    console.log(`   3. Este es solo una MUESTRA de los datos (primeros 50 registros)`);
    console.log('='.repeat(80));
}

// Ejecutar conversión
convertExcelToSQL().catch(console.error);
