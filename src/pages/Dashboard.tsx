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
  const [ivaPagar, setIvaPagar] = useState<number>(0);
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
        const { data: txData, error: txError } = await supabase
          .from("transactions")
          .select("*")
          .order("date", { ascending: false })
          .limit(5);

        if (txError) throw txError;

        const { data: ivaData, error: ivaError } = await supabase
          .from("iva_records")
          .select("pagar")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (ivaError && ivaError.code !== "PGRST116") throw ivaError;

        setTransactions(txData || []);
        setIvaPagar(ivaData?.pagar || 0);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar información del dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 💰 Cálculos automáticos
  const ingresos = transactions
    .filter((t) => t.type === "Ingreso")
    .reduce((sum, t) => sum + t.amount, 0);

  const gastos = transactions
    .filter((t) => t.type === "Gasto")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = ingresos - gastos;

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
              <CardTitle>Ingresos del Mes</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(ingresos)}</div>
              <p className="text-sm text-muted-foreground mt-1">Últimos registros</p>
            </CardContent>
          </Card>

          <Card className="border-red-500/20 shadow-sm">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle>Gastos del Mes</CardTitle>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(gastos)}</div>
              <p className="text-sm text-muted-foreground mt-1">Últimos registros</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/20 shadow-sm">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle>IVA a Pagar</CardTitle>
              <FileText className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(ivaPagar)}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {ivaPagar > 0 ? "Pendiente de pago" : "Sin obligaciones actuales"}
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
                className={`text-2xl font-bold ${
                  balance >= 0 ? "text-blue-600" : "text-red-600"
                }`}
              >
                {formatCurrency(balance)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {balance >= 0 ? "Superávit operativo" : "Déficit operativo"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 🔹 Sección inferior */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Transacciones */}
          <Card className="p-6 border-primary/10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Transacciones Recientes</h2>
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
                No hay transacciones registradas aún.
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
                        className={`h-4 w-4 ${
                          t.type === "Ingreso" ? "text-green-600" : "text-red-600"
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
                      className={`font-semibold ${
                        t.type === "Ingreso" ? "text-green-600" : "text-red-600"
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
                  {formatCurrency(ivaPagar)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
