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

  // 🔹 Estado del usuario autenticado
  const [user, setUser] = useState<User | null>(null);

  // 🔹 Cargar usuario actual de Supabase
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate("/login"); // Si no hay usuario, redirigir al login
      } else {
        setUser(data.user);
      }
    };
    getUser();

    // 🔹 Escuchar cambios de sesión (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login");
      else setUser(session.user);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  // 🔹 Cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-white font-bold text-xl">
              M
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                SPMYL Contabilidad
              </h1>
              <p className="text-xs text-muted-foreground">
                Sistema de Gestión Financiera
              </p>
            </div>
          </div>

          {/* 🔹 Usuario autenticado */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground">
                    {user.email?.split("@")[0]}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                  {user.email?.[0]?.toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-red-600 hover:text-red-800"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <p className="text-xs text-gray-400 italic">Cargando...</p>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r bg-card min-h-[calc(100vh-4rem)]">
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-secondary",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="container py-6 px-4 lg:px-8">{children}</div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card shadow-lg">
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
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
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
