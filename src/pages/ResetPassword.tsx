import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMessage("✅ Tu contraseña ha sido actualizada correctamente.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al restablecer la contraseña.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleReset}
        className="bg-white p-8 rounded-xl shadow-lg w-96 space-y-5"
      >
        {/* Título */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-700 mb-1">
            Restablecer Contraseña
          </h1>
          <p className="text-sm text-gray-500">
            Ingresa una nueva contraseña para tu cuenta
          </p>
        </div>

        {/* Campos */}
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Confirmar nueva contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Actualizando..." : "Guardar nueva contraseña"}
        </button>

        {/* Mensajes */}
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        {message && (
          <p className="text-green-600 text-sm text-center">{message}</p>
        )}

        {/* Volver al login */}
        {message && (
          <p className="text-sm text-center mt-3">
            <a
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Volver al inicio de sesión
            </a>
          </p>
        )}
      </form>
    </div>
  );
}
