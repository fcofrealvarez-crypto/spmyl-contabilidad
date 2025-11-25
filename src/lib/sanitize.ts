/**
 * Utilidades para sanitizar entrada de usuario y prevenir inyecciones
 */

// 🧹 Sanitizar texto general (prevenir XSS)
export const sanitizeText = (text: string): string => {
    if (!text) return "";

    return text
        .trim()
        .replace(/[<>]/g, "") // Eliminar < y >
        .replace(/javascript:/gi, "") // Eliminar javascript:
        .replace(/on\w+=/gi, "") // Eliminar event handlers (onclick=, etc)
        .substring(0, 1000); // Limitar longitud
};

// 🔢 Sanitizar números
export const sanitizeNumber = (value: any): number => {
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    return Math.max(0, Math.min(num, 999999999)); // Entre 0 y 999,999,999
};

// 📧 Sanitizar email
export const sanitizeEmail = (email: string): string => {
    if (!email) return "";

    return email
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9@._-]/g, "") // Solo caracteres válidos en email
        .substring(0, 255);
};

// 🆔 Sanitizar RUT chileno
export const sanitizeRUT = (rut: string): string => {
    if (!rut) return "";

    // Eliminar todo excepto números, K y guión
    const cleaned = rut
        .toUpperCase()
        .replace(/[^0-9K-]/g, "");

    // Formato: 12345678-9
    const parts = cleaned.split("-");
    if (parts.length !== 2) return cleaned;

    const body = parts[0].replace(/\D/g, "").substring(0, 8);
    const dv = parts[1].substring(0, 1);

    return body && dv ? `${body}-${dv}` : cleaned;
};

// 📅 Sanitizar fecha
export const sanitizeDate = (date: string): string => {
    if (!date) return "";

    // Verificar que sea una fecha válida
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return "";

    // Retornar en formato ISO (YYYY-MM-DD)
    return parsed.toISOString().split("T")[0];
};

// 🔤 Sanitizar código de cuenta
export const sanitizeAccountCode = (code: string): string => {
    if (!code) return "";

    return code
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9.-]/g, "") // Solo letras, números, puntos y guiones
        .substring(0, 50);
};

// 📝 Sanitizar descripción/glosa
export const sanitizeDescription = (text: string): string => {
    if (!text) return "";

    return text
        .trim()
        .replace(/[<>]/g, "") // Eliminar < y >
        .replace(/\s+/g, " ") // Normalizar espacios
        .substring(0, 500);
};

// 🗂️ Sanitizar nombre de archivo
export const sanitizeFileName = (fileName: string): string => {
    if (!fileName) return "";

    return fileName
        .trim()
        .replace(/[^a-zA-Z0-9._-]/g, "_") // Solo caracteres seguros
        .substring(0, 255);
};

// 🔐 Sanitizar objeto completo de transacción
export const sanitizeTransaction = (data: any) => {
    return {
        type: ["Ingreso", "Gasto"].includes(data.type) ? data.type : "Gasto",
        category: sanitizeText(data.category),
        description: sanitizeDescription(data.description),
        amount: sanitizeNumber(data.amount),
        date: sanitizeDate(data.date),
        document: data.document ? sanitizeFileName(data.document) : null,
    };
};

// 📊 Sanitizar objeto de asiento contable
export const sanitizeAsientoContable = (data: any) => {
    return {
        tipo_comprobante: ["TRASPASO", "EGRESO", "INGRESO"].includes(data.tipo_comprobante)
            ? data.tipo_comprobante
            : "TRASPASO",
        numero_comprobante: data.numero_comprobante ? sanitizeText(data.numero_comprobante) : null,
        fecha: sanitizeDate(data.fecha),
        mes: data.mes ? Math.max(1, Math.min(12, parseInt(data.mes))) : null,
        codigo_cuenta: sanitizeAccountCode(data.codigo_cuenta),
        cuenta_descripcion: sanitizeDescription(data.cuenta_descripcion),
        glosa: data.glosa ? sanitizeDescription(data.glosa) : null,
        debe: sanitizeNumber(data.debe || 0),
        haber: sanitizeNumber(data.haber || 0),
        control: data.control ? sanitizeNumber(data.control) : null,
        compensacion: data.compensacion ? sanitizeNumber(data.compensacion) : null,
        tipo_documento: data.tipo_documento ? sanitizeText(data.tipo_documento) : null,
        numero_documento: data.numero_documento ? sanitizeText(data.numero_documento) : null,
        rut: data.rut ? sanitizeRUT(data.rut) : null,
        nombre: data.nombre ? sanitizeText(data.nombre) : null,
    };
};

// 🛡️ Prevenir SQL injection en búsquedas
export const sanitizeSearchQuery = (query: string): string => {
    if (!query) return "";

    return query
        .trim()
        .replace(/['";\\]/g, "") // Eliminar caracteres peligrosos para SQL
        .replace(/--/g, "") // Eliminar comentarios SQL
        .replace(/\/\*/g, "") // Eliminar comentarios SQL
        .substring(0, 100);
};
