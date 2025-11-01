import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// 🔹 Páginas y componentes
import Auth from "@/components/Auth";
import Index from "@/pages/Index";
import LibroMayor from "@/pages/LibroMayor";
import Transactions from "@/pages/Transactions";
import IVA from "@/pages/IVA";
import Obligations from "@/pages/Obligations";
import Reports from "@/pages/Reports";
import ImportarExcel from "@/pages/importar/ImportarExcel"; // ✅ NUEVO
import NotFound from "@/pages/NotFound";

// 🔹 Configuración de React Query
const queryClient = new QueryClient();

// 🔐 Protección de rutas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return <>{children}</>;
}

// 🔹 Componente principal de la app
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* ✅ Toasters: notificaciones globales */}
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            {/* 🔐 Rutas protegidas */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/libro-mayor"
              element={
                <ProtectedRoute>
                  <LibroMayor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transacciones"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/iva"
              element={
                <ProtectedRoute>
                  <IVA />
                </ProtectedRoute>
              }
            />
            <Route
              path="/obligaciones"
              element={
                <ProtectedRoute>
                  <Obligations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/informes"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* ✅ NUEVA RUTA: Importación Excel */}
            <Route
              path="/importar-excel"
              element={
                <ProtectedRoute>
                  <ImportarExcel />
                </ProtectedRoute>
              }
            />

            {/* 🚫 Ruta 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
