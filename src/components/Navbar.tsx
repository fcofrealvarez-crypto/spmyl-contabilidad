import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { LogOut } from "lucide-react";
import { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  // 🔹 Cargar el usuario autenticado desde Supabase
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
  }, []);

  // 🔹 Cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      {/* LOGO + Nombre */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-xl font-semibold">
          M
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">SPMYL Contabilidad</h1>
          <p className="text-xs text-gray-500">Sistema de Gestión Financiera</p>
        </div>
      </div>

      {/* Usuario + Logout */}
      {user ? (
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium text-gray-800">
              {user?.email?.split("@")[0] || "Usuario"}
            </p>
            <p className="text-xs text-gray-500">{user?.email || ""}</p>
          </div>

          <div className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-semibold">
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      ) : (
        <a
          href="/login"
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          Iniciar sesión
        </a>
      )}
    </nav>
  );
}
