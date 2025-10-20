import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// ✅ Configuración optimizada para React + Supabase + Vite
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  // 🔹 Alias correcto para que "@/..." funcione en todo el proyecto
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // 🔹 Asegura compatibilidad con variables .env (Supabase)
  define: {
    "process.env": process.env,
  },
}));
