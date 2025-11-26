import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
  Receipt,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Transaction {
  id: string;
  type: "Ingreso" | "Gasto";
  description: string;
  amount: number;
  date: string;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    ingresos: 0,
    gastos: 0,
    ivaPagar: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);

  // 📅 Mes actual dinámico
  const currentMonth = new Date().toLocaleDateString("es-CL", {
    month: "long",
    year: "numeric",
  });

  // 🔹 Cargar datos desde Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Cargar Ventas (Ingresos)
        const { data: sales, error: salesError } = await supabase
          .from("sales_book")
          .select("total_amount, iva_amount, issue_date, customer_name, id")
          .order("issue_date", { ascending: false });

        if (salesError) throw salesError;

        // 2. Cargar Compras (Gastos)
        const { data: purchases, error: purchasesError } = await supabase
          .from("purchase_book")
          .select("total_amount, iva_amount, document_date, supplier_name, id")
          .order("document_date", { ascending: false });

        if (purchasesError) throw purchasesError;

        // 3. Calcular Totales
        const totalIngresos = sales?.reduce((sum, s) => sum + Number(s.total_amount), 0) || 0;
        const totalGastos = purchases?.reduce((sum, p) => sum + Number(p.total_amount), 0) || 0;

        const totalIvaDebito = sales?.reduce((sum, s) => sum + Number(s.iva_amount), 0) || 0;
        const totalIvaCredito = purchases?.reduce((sum, p) => sum + Number(p.iva_amount), 0) || 0;
        const ivaPagar = totalIvaDebito - totalIvaCredito;

        setStats({
          ingresos: totalIngresos,
          gastos: totalGastos,
          ivaPagar: ivaPagar,
          balance: totalIngresos - totalGastos,
        });

        // 4. Combinar para "Transacciones Recientes"
        const recentSales = (sales || []).map(s => ({
          id: s.id,
          type: "Ingreso" as const,
          description: `Venta a ${s.customer_name}`,
          amount: Number(s.total_amount),
          date: s.issue_date || new Date().toISOString(),
        }));

        const recentPurchases = (purchases || []).map(p => ({
          id: p.id,
          type: "Gasto" as const,
          description: `Compra a ${p.supplier_name}`,
          amount: Number(p.total_amount),
          date: p.document_date || new Date().toISOString(),
        }));

        const allTransactions = [...recentSales, ...recentPurchases]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        setTransactions(allTransactions);

      } catch (error) {
        console.error(error);
        toast.error("Error al cargar información del dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(v);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64 text-muted-foreground">
          Cargando información financiera...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* 🔹 Encabezado principal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Control y resumen general de tus finanzas
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}
          </Button>
        </div>

        {/* 🔹 Tarjetas de resumen */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-green-500/20 shadow-sm">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle>Ingresos Totales</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.ingresos)}</div>
              <p className="text-sm text-muted-foreground mt-1">Total Ventas</p>
            </CardContent>
          </Card>

          <Card className="border-red-500/20 shadow-sm">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle>Gastos Totales</CardTitle>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.gastos)}</div>
              <p className="text-sm text-muted-foreground mt-1">Total Compras</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/20 shadow-sm">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle>IVA a Pagar</CardTitle>
              <FileText className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.ivaPagar)}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.ivaPagar > 0 ? "Pendiente de pago" : "A favor / Remanente"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 shadow-sm">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle>Balance Actual</CardTitle>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${stats.balance >= 0 ? "text-blue-600" : "text-red-600"
                  }`}
              >
                {formatCurrency(stats.balance)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.balance >= 0 ? "Superávit operativo" : "Déficit operativo"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 🔹 Sección inferior */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Transacciones */}
          <Card className="p-6 border-primary/10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Movimientos Recientes</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800"
                onClick={() => (window.location.href = "/transacciones")}
              >
                Ver todas <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No hay movimientos registrados aún.
              </p>
            ) : (
              <div className="space-y-4">
                {transactions.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Receipt
                        className={`h-4 w-4 ${t.type === "Ingreso" ? "text-green-600" : "text-red-600"
                          }`}
                      />
                      <div>
                        <p className="font-medium">{t.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(t.date).toLocaleDateString("es-CL")}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-semibold ${t.type === "Ingreso" ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {formatCurrency(t.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Obligaciones */}
          <Card className="p-6 border-primary/10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Próximas Obligaciones</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800"
                onClick={() => (window.location.href = "/obligaciones")}
              >
                Ver todas <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-blue-300 transition-colors">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium">Declaración IVA F29</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Vence: 2025-10-31
                </p>
                <p className="text-sm font-semibold text-blue-600 mt-1">
                  {formatCurrency(stats.ivaPagar > 0 ? stats.ivaPagar : 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
