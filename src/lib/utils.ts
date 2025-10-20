import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ✅ Combina clases de Tailwind sin duplicados.
 * Corrige el error de tipo en `clsx(inputs)` usando spread (...inputs)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
