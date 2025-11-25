import { z } from "zod";

// 🔐 Validadores de autenticación
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "El email es requerido")
        .email("Email inválido")
        .max(255, "Email demasiado largo"),
    password: z
        .string()
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .max(100, "Contraseña demasiado larga"),
});

export const registerSchema = z.object({
    email: z
        .string()
        .min(1, "El email es requerido")
        .email("Email inválido")
        .max(255, "Email demasiado largo"),
    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(100, "Contraseña demasiado larga")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
        ),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

// 💰 Validadores de transacciones
export const transactionSchema = z.object({
    type: z.enum(["Ingreso", "Gasto"], {
        required_error: "El tipo de transacción es requerido",
    }),
    category: z
        .string()
        .min(1, "La categoría es requerida")
        .max(100, "Categoría demasiado larga"),
    description: z
        .string()
        .min(3, "La descripción debe tener al menos 3 caracteres")
        .max(500, "Descripción demasiado larga"),
    amount: z
        .number({
            required_error: "El monto es requerido",
            invalid_type_error: "El monto debe ser un número",
        })
        .positive("El monto debe ser positivo")
        .max(999999999, "Monto demasiado grande"),
    date: z
        .string()
        .min(1, "La fecha es requerida")
        .refine((date) => !isNaN(Date.parse(date)), "Fecha inválida"),
});

// 📊 Validadores de asientos contables
export const asientoContableSchema = z.object({
    tipo_comprobante: z.enum(["TRASPASO", "EGRESO", "INGRESO"], {
        required_error: "El tipo de comprobante es requerido",
    }),
    fecha: z
        .string()
        .min(1, "La fecha es requerida")
        .refine((date) => !isNaN(Date.parse(date)), "Fecha inválida"),
    codigo_cuenta: z
        .string()
        .min(1, "El código de cuenta es requerido")
        .max(50, "Código de cuenta demasiado largo"),
    cuenta_descripcion: z
        .string()
        .min(1, "La descripción de cuenta es requerida")
        .max(200, "Descripción demasiado larga"),
    glosa: z
        .string()
        .max(500, "Glosa demasiado larga")
        .optional(),
    debe: z
        .number()
        .min(0, "El debe no puede ser negativo")
        .max(999999999, "Monto demasiado grande")
        .default(0),
    haber: z
        .number()
        .min(0, "El haber no puede ser negativo")
        .max(999999999, "Monto demasiado grande")
        .default(0),
    rut: z
        .string()
        .regex(/^\d{1,8}-[\dkK]$/, "RUT inválido (formato: 12345678-9)")
        .optional(),
    nombre: z
        .string()
        .max(200, "Nombre demasiado largo")
        .optional(),
    numero_documento: z
        .string()
        .max(50, "Número de documento demasiado largo")
        .optional(),
});

// 🔍 Validador de RUT chileno
export const validateRUT = (rut: string): boolean => {
    // Eliminar puntos y guión
    const cleanRUT = rut.replace(/\./g, "").replace(/-/g, "");

    if (cleanRUT.length < 2) return false;

    const body = cleanRUT.slice(0, -1);
    const dv = cleanRUT.slice(-1).toUpperCase();

    // Calcular dígito verificador
    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedDV = 11 - (sum % 11);
    const calculatedDV = expectedDV === 11 ? "0" : expectedDV === 10 ? "K" : expectedDV.toString();

    return dv === calculatedDV;
};

// 📧 Validador de email adicional
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// 🔢 Validador de monto
export const isValidAmount = (amount: number): boolean => {
    return !isNaN(amount) && amount > 0 && amount < 999999999;
};

// Types para TypeScript
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type AsientoContableFormData = z.infer<typeof asientoContableSchema>;
