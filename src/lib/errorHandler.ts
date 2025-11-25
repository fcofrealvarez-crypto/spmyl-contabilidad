import { toast } from "sonner";
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Sistema centralizado de manejo de errores
 */

// 🔍 Tipos de errores
export enum ErrorType {
    AUTH = "AUTH",
    DATABASE = "DATABASE",
    VALIDATION = "VALIDATION",
    NETWORK = "NETWORK",
    PERMISSION = "PERMISSION",
    UNKNOWN = "UNKNOWN",
}

// 📝 Interface para errores personalizados
export interface AppError {
    type: ErrorType;
    message: string;
    userMessage: string;
    originalError?: any;
    timestamp: Date;
}

// 🎯 Detectar tipo de error
const detectErrorType = (error: any): ErrorType => {
    // Errores de Supabase Auth
    if (error?.message?.includes("Invalid login credentials")) {
        return ErrorType.AUTH;
    }
    if (error?.message?.includes("User already registered")) {
        return ErrorType.AUTH;
    }
    if (error?.message?.includes("Email not confirmed")) {
        return ErrorType.AUTH;
    }

    // Errores de base de datos
    if (error?.code?.startsWith("PGRST") || error?.code?.startsWith("23")) {
        return ErrorType.DATABASE;
    }

    // Errores de red
    if (error?.message?.includes("fetch") || error?.message?.includes("network")) {
        return ErrorType.NETWORK;
    }

    // Errores de permisos
    if (error?.message?.includes("permission") || error?.message?.includes("policy")) {
        return ErrorType.PERMISSION;
    }

    return ErrorType.UNKNOWN;
};

// 💬 Mensajes de error amigables
const getUserFriendlyMessage = (error: any, type: ErrorType): string => {
    // Mensajes específicos de autenticación
    if (type === ErrorType.AUTH) {
        if (error?.message?.includes("Invalid login credentials")) {
            return "Email o contraseña incorrectos. Por favor verifica tus datos.";
        }
        if (error?.message?.includes("User already registered")) {
            return "Este email ya está registrado. Intenta iniciar sesión.";
        }
        if (error?.message?.includes("Email not confirmed")) {
            return "Por favor confirma tu email antes de iniciar sesión.";
        }
        if (error?.message?.includes("Password should be at least")) {
            return "La contraseña debe tener al menos 6 caracteres.";
        }
        return "Error de autenticación. Por favor intenta nuevamente.";
    }

    // Mensajes de base de datos
    if (type === ErrorType.DATABASE) {
        if (error?.code === "23505") {
            return "Este registro ya existe en el sistema.";
        }
        if (error?.code === "23503") {
            return "No se puede eliminar este registro porque está siendo usado.";
        }
        if (error?.code === "PGRST116") {
            return "No se encontraron registros.";
        }
        return "Error al procesar la información. Por favor intenta nuevamente.";
    }

    // Mensajes de red
    if (type === ErrorType.NETWORK) {
        return "Error de conexión. Verifica tu internet e intenta nuevamente.";
    }

    // Mensajes de permisos
    if (type === ErrorType.PERMISSION) {
        return "No tienes permisos para realizar esta acción.";
    }

    // Mensaje genérico
    return "Ocurrió un error inesperado. Por favor intenta nuevamente.";
};

// 🚨 Manejador principal de errores
export const handleError = (error: any, context?: string): AppError => {
    const type = detectErrorType(error);
    const userMessage = getUserFriendlyMessage(error, type);

    const appError: AppError = {
        type,
        message: error?.message || "Unknown error",
        userMessage,
        originalError: error,
        timestamp: new Date(),
    };

    // Log en desarrollo
    if (import.meta.env.DEV) {
        console.error(`[${type}] ${context || "Error"}:`, {
            message: appError.message,
            userMessage: appError.userMessage,
            originalError: error,
        });
    }

    // Mostrar toast al usuario
    toast.error(userMessage);

    return appError;
};

// 🔐 Manejador específico para errores de autenticación
export const handleAuthError = (error: any): AppError => {
    return handleError(error, "Authentication");
};

// 💾 Manejador específico para errores de base de datos
export const handleDatabaseError = (error: PostgrestError | any): AppError => {
    return handleError(error, "Database");
};

// ✅ Manejador de éxito
export const handleSuccess = (message: string) => {
    toast.success(message);
};

// ⚠️ Manejador de advertencias
export const handleWarning = (message: string) => {
    toast.warning(message);
};

// ℹ️ Manejador de información
export const handleInfo = (message: string) => {
    toast.info(message);
};

// 🔄 Wrapper para operaciones async con manejo de errores
export const withErrorHandling = async <T>(
    operation: () => Promise<T>,
    context?: string
): Promise<T | null> => {
    try {
        return await operation();
    } catch (error) {
        handleError(error, context);
        return null;
    }
};

// 📊 Validar respuesta de Supabase
export const validateSupabaseResponse = <T>(
    data: T | null,
    error: PostgrestError | null,
    context?: string
): T | null => {
    if (error) {
        handleDatabaseError(error);
        return null;
    }
    return data;
};
