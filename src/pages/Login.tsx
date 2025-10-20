import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let response;
      if (isRegistering) {
        // 🔹 Registro de nuevo usuario
        response = await supabase.auth.signUp({ email, password });
      } else {
        // 🔹 Inicio de sesión existente
        response = await supabase.auth.signInWithPassword({ email, password });
      }

      if (response.error) throw response.error;

      // 🔹 Redirigir al panel principal
      window.location.href = "/home";
    } catch (err: unknown) {
      // ✅ Tipado seguro en lugar de "any"
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al autenticar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleAuth}
        className="bg-white p-8 rounded-xl shadow-lg w-96 space-y-5"
      >
        {/* Título */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-700 mb-1">
            SPMYL Contabilidad
          </h1>
          <p className="text-sm text-gray-500">
            Sistema de Gestión Financiera
          </p>
        </div>

        {/* Campos */}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* Botón principal */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-60"
        >
          {loading
            ? "Procesando..."
            : isRegistering
            ? "Crear cuenta"
            : "Iniciar sesión"}
        </button>

        {/* Mostrar errores */}
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        {/* Alternar entre login y registro */}
        <p className="text-center text-sm text-gray-600">
          {isRegistering ? "¿Ya tienes una cuenta?" : "¿No tienes cuenta?"}{" "}
          <span
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            {isRegistering ? "Inicia sesión" : "Regístrate"}
          </span>
        </p>
      </form>
    </div>
  );
}
