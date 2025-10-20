import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Transactions from "./pages/Transactions";
import IVA from "./pages/IVA";
import Obligations from "./pages/Obligations";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

// 🔹 Componente para proteger rutas privadas
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar sesión actual
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    checkSession();

    // Escuchar cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Mientras verifica la sesión
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Verificando sesión...
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* 🔹 Ruta pública de login */}
          <Route path="/login" element={<Login />} />

          {/* 🔹 Rutas privadas dentro del layout */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Index />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/transacciones"
            element={
              <PrivateRoute>
                <Layout>
                  <Transactions />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/iva"
            element={
              <PrivateRoute>
                <Layout>
                  <IVA />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/obligaciones"
            element={
              <PrivateRoute>
                <Layout>
                  <Obligations />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/informes"
            element={
              <PrivateRoute>
                <Layout>
                  <Reports />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Ruta de error */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
