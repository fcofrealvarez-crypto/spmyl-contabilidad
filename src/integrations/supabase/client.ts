// ✅ Archivo corregido: src/integrations/supabase/client.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 🚨 Validación: si falta alguna variable, muestra error claro
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Supabase URL o Anon Key no definidas. Verifica tus variables en Vercel.");
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
