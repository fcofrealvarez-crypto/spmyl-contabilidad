import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  AlertCircle,
  TrendingUp,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

interface LayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Receipt, label: "Transacciones", href: "/transacciones" },
  { icon: FileText, label: "IVA", href: "/iva" },
  { icon: AlertCircle, label: "Obligaciones", href: "/obligaciones" },
  { icon: TrendingUp, label: "Informes", href: "/informes" },
  { icon: Settings, label: "Configuración", href: "/configuracion" },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  // 🔹 Verificar sesión actual y cambios de autenticación
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        navigate("/login");
      }
    };
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/login");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  // 🔹 Cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-card px-4 py-3 shadow-sm sticky top-0 z-50">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 text-white font-bold text-xl">
            M
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold">SPMYL Contabilidad</h1>
            <p className="text-xs text-muted-foreground">
              Sistema de Gestión Financiera
            </p>
          </div>
        </div>

        {/* Usuario */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">
                  {user.email?.split("@")[0]}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-700 flex items-center justify-center text-white font-semibold">
                {user.email?.[0]?.toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <p className="text-xs text-gray-400 italic">Cargando...</p>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Escritorio */}
        <aside className="hidden lg:flex w-64 flex-col border-r bg-card overflow-y-auto">
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-background">
          {children}
        </main>
      </div>

      {/* Barra inferior móvil */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card shadow-md">
        <div className="flex justify-around items-center h-16">
          {menuItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
                  isActive
                    ? "text-blue-600 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
