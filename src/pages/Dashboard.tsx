import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Receipt,
  FileText,
  Calendar,
  ArrowUpRight
} from "lucide-react";

// 🔹 Interfaces tipadas
interface Transaction {
  id: number;
  type: string;
  description: string;
  amount: string;
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
  // 🔹 Datos iniciales vacíos
  const stats = [
    {
      title: "Ingresos del Mes",
      value: "$0",
      change: "0% vs mes anterior",
      changeType: "neutral" as const,
      icon: TrendingUp,
      iconColor: "bg-green-500/10",
    },
    {
      title: "Gastos del Mes",
      value: "$0",
      change: "0% vs mes anterior",
      changeType: "neutral" as const,
      icon: TrendingDown,
      iconColor: "bg-red-500/10",
    },
    {
      title: "IVA a Pagar",
      value: "$0",
      change: "Sin vencimiento",
      changeType: "neutral" as const,
      icon: FileText,
      iconColor: "bg-yellow-500/10",
    },
    {
      title: "Balance Actual",
      value: "$0",
      change: "0% vs mes anterior",
      changeType: "neutral" as const,
      icon: DollarSign,
      iconColor: "bg-blue-500/10",
    },
  ];

  const recentTransactions: Transaction[] = [];
  const upcomingObligations: Obligation[] = [];

  return (
    <section className="p-6 space-y-8">
      {/* 🔹 Encabezado principal */}
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
            Junio 2025
          </Button>
          <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
            <Receipt className="h-4 w-4 mr-2" />
            Nueva Transacción
          </Button>
        </div>
      </header>

      {/* 🔹 Tarjetas resumen */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* 🔹 Sección inferior */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Transacciones Recientes */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Transacciones Recientes</h2>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
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
                      <p className="text-sm text-muted-foreground">{t.date}</p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold ${
                      t.type === "Ingreso" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.amount}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Próximas Obligaciones */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Próximas Obligaciones</h2>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
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
