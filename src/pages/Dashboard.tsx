import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
  Receipt,
  ArrowUpRight,
  AlertCircle,
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

interface Obligation {
  id: number;
  title: string;
  date: string;
  priority: string;
  amount: string;
}

export default function Dashboard() {
  const navigate = useNavigate();

  // 📊 Estados principales
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ivaData, setIvaData] = useState<{ pagar: number }>({ pagar: 0 });
  const [loading, setLoading] = useState(true);

  // 🔹 Mes actual dinámico
  const currentMonth = new Date().toLocaleDateString("es-CL", {
    month: "long",
    year: "numeric",
  });

  // 🔹 Cargar datos desde Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1️⃣ Traer transacciones
        const { data: txData, error: txError } = await supabase
          .from("transactions")
          .select("*")
          .order("date", { ascending: false });

        if (txError) throw txError;

        // 2️⃣ Traer el último registro de IVA
        const { data: ivaRecord, error: ivaError } = await supabase
          .from("iva_records")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (ivaError && ivaError.code !== "PGRST116") throw ivaError;

        setTransactions(txData || []);
        setIvaData(ivaRecord || { pagar: 0 });
      } catch (err) {
        console.error("❌ Error cargando Dashboard:", err);
        toast.error("Error al cargar datos del dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 Cálculos automáticos
  const ingresos =
    transactions
      ?.filter((t) => t.type === "Ingreso")
      ?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

  const gastos =
    transactions
      ?.filter((t) => t.type === "Gasto")
      ?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

  const balance = ingresos - gastos;
  const ivaPagar = ivaData?.pagar || 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(value);

  // 📈 Tarjetas resumen
  const stats = [
    {
      title: "Ingresos del Mes",
      value: formatCurrency(ingresos),
      change: "Últimos registros",
      changeType: "positive" as const,
      icon: TrendingUp,
      iconColor: "bg-green-500/10",
    },
    {
      title: "Gastos del Mes",
      value: formatCurrency(gastos),
      change: "Últimos registros",
      changeType: "negative" as const,
      icon: TrendingDown,
      iconColor: "bg-red-500/10",
    },
    {
      title: "IVA a Pagar",
      value: formatCurrency(ivaPagar),
      change: ivaPagar > 0 ? "Pendiente de pago" : "Sin obligaciones actuales",
      changeType: "neutral" as const,
      icon: FileText,
      iconColor: "bg-yellow-500/10",
    },
    {
      title: "Balance Actual",
      value: formatCurrency(balance),
      change:
        balance > 0
          ? "Superávit operativo"
          : balance < 0
          ? "Déficit operativo"
          : "Equilibrado",
      changeType: "neutral" as const,
      icon: DollarSign,
      iconColor: "bg-blue-500/10",
    },
  ];

  const recentTransactions = transactions?.slice(0, 5) || [];
  const upcomingObligations: Obligation[] = [
    {
      id: 1,
      title: "Declaración IVA F29",
      date: "2025-10-31",
      priority: "high",
      amount: formatCurrency(ivaPagar),
    },
  ];

  // ⏳ Estado de carga
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        Cargando información del dashboard...
      </div>
    );
  }

  return (
    <section className="p-6 space-y-8">
      {/* 🧭 Encabezado principal */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Resumen de tu actividad financiera
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => navigate("/transacciones")}
          >
            <Receipt className="h-4 w-4 mr-2" />
            Nueva Transacción
          </Button>
        </div>
      </header>

      {/* 💰 Tarjetas resumen */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* 📋 Sección inferior */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Transacciones recientes */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Transacciones Recientes</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-800"
              onClick={() => navigate("/transacciones")}
            >
              Ver todas
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {recentTransactions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No hay transacciones registradas aún.
            </p>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        t.type === "Ingreso" ? "bg-green-500/10" : "bg-red-500/10"
                      }`}
                    >
                      <Receipt
                        className={`h-4 w-4 ${
                          t.type === "Ingreso" ? "text-green-600" : "text-red-600"
                        }`}
                      />
                    </div>
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

        {/* Próximas obligaciones */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Próximas Obligaciones</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-800"
              onClick={() => navigate("/obligaciones")}
            >
              Ver todas
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {upcomingObligations.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No hay obligaciones pendientes.
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingObligations.map((o) => (
                <div
                  key={o.id}
                  className="flex items-start justify-between p-4 rounded-lg border border-border hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        o.priority === "high" ? "bg-red-500/10" : "bg-yellow-500/10"
                      }`}
                    >
                      <AlertCircle
                        className={`h-4 w-4 ${
                          o.priority === "high" ? "text-red-600" : "text-yellow-600"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{o.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Vence: {o.date}
                      </p>
                      <p className="text-sm font-semibold text-blue-600 mt-1">
                        {o.amount}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
