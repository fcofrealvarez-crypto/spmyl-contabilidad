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
    return "'" + String(value).replace(/'/g, "''") + "'";
}

async function convertExcelToSQL() {
    console.log('📊 Convirtiendo Excel a SQL...');
    console.log('='.repeat(80));

    const excelPath = path.join(__dirname, '..', 'data', 'Proyecto ContaSPMYL.xlsx');
    const outputDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const workbook = XLSX.readFile(excelPath);
    const sql = [];
    const cid = '{{COMPANY_ID}}';

    sql.push('-- DATOS REALES | Reemplaza {{COMPANY_ID}}\\n');

    // L IBRO COMPRAS
    console.log('Procesando Compras...');
    const lc = XLSX.utils.sheet_to_json(workbook.Sheets['Libro compra ']);
    sql.push('-- COMPRAS (' + lc.length + ')\\n');
    lc.forEach((r, i) => {
        sql.push('INSERT INTO public.purchase_book (company_id, month, year, line_number, document_type, purchase_type, supplier_rut, supplier_name, folio, document_date, reception_date, acknowledgment_date, exempt_amount, net_amount, iva_amount, fixed_asset_amount, non_recoverable_iva, total_amount) VALUES (' + escapeSql(cid) + ',' + (parseInt(r.Mes) || 1) + ',' + new Date(excelDateToSQL(r['Fecha Docto']) || '2023-01-01').getFullYear() + ',' + ((parseInt(r.Nro) || i + 1)) + ',' + escapeSql(r['Tipo Doc']) + ',' + escapeSql(r['Tipo Compra']) + ',' + escapeSql(r['RUT Proveedor']) + ',' + escapeSql(r['Razon Social']) + ',' + escapeSql(r.Folio) + ',' + escapeSql(excelDateToSQL(r['Fecha Docto'])) + ',' + escapeSql(excelDateToSQL(r['Fecha Recepcion'])) + ',' + escapeSql(excelDateToSQL(r['Fecha Acuse'])) + ',' + (parseFloat(r['Monto Exento']) || 0) + ',' + (parseFloat(r['Monto Neto']) || 0) + ',' + (parseFloat(r['Monto IVA Recuperable']) || 0) + ',' + (parseFloat(r['Monto Neto Activo Fijo']) || 0) + ',' + (parseFloat(r['Monto Iva No Recuperable']) || 0) + ',' + (parseFloat(r['Monto Total']) || 0) + ');\\n');
    });
    console.log('✓ ' + lc.length + ' compras');

    // LIBRO VENTAS
    console.log('Procesando Ventas...');
    const lv = XLSX.utils.sheet_to_json(workbook.Sheets['Libro Ventas']);
    sql.push('-- VENTAS (' + lv.length + ')\\n');
    lv.forEach((r, i) => {
        sql.push('INSERT INTO public.sales_book (company_id, month, year, line_number, document_type, sale_type, customer_rut, customer_name, folio, issue_date, exempt_amount, net_amount, iva_amount, total_amount) VALUES (' + escapeSql(cid) + ',' + (parseInt(r.Mes) || 1) + ',' + new Date(excelDateToSQL(r['Fecha Docto']) || '2023-01-01').getFullYear() + ',' + ((parseInt(r.Nro) || i + 1)) + ',' + escapeSql(r['Tipo Doc']) + ',' + escapeSql(r['Tipo Venta']) + ',' + escapeSql(r['Rut cliente']) + ',' + escapeSql(r['Razon Social']) + ',' + escapeSql(r.Folio) + ',' + escapeSql(excelDateToSQL(r['Fecha Docto'])) + ',' + (parseFloat(r['Monto Exento']) || 0) + ',' + (parseFloat(r['Monto Neto']) || 0) + ',' + (parseFloat(r['Monto IVA']) || 0) + ',' + (parseFloat(r['Monto total']) || 0) + ');\\n');
    });
    console.log('✓ ' + lv.length + ' ventas');

    // GUARDAR
    const out = path.join(outputDir, '20251126000001_import_real_data.sql');
    fs.writeFileSync(out, sql.join('\\n'));
    console.log('\\n✅ LISTO: ' + out);
    console.log('Compras: ' + lc.length + ' | Ventas: ' + lv.length);
}

convertExcelToSQL().catch(console.error);
