import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout"; // ✅ Ruta corregida
import Index from "./pages/Index";
import Transactions from "./pages/Transactions";
import IVA from "./pages/IVA";
import Obligations from "./pages/Obligations";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword"; // ✅ Nueva ruta agregada
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

// 🔹 Componente para proteger rutas privadas
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Verificando sesión...
      </div>
    );
  }

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
          {/* 🔹 Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} /> {/* ✅ nueva */}

          {/* 🔹 Rutas privadas dentro del Layout */}
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

          {/* 🔹 Página no encontrada */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
