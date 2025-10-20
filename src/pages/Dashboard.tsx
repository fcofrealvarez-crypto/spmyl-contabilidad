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
      iconColor: "bg-success"
    },
    {
      title: "Gastos del Mes",
      value: "$0",
      change: "0% vs mes anterior",
      changeType: "neutral" as const,
      icon: TrendingDown,
      iconColor: "bg-destructive"
    },
    {
      title: "IVA a Pagar",
      value: "$0",
      change: "Sin vencimiento",
      changeType: "neutral" as const,
      icon: FileText,
      iconColor: "bg-warning"
    },
    {
      title: "Balance Actual",
      value: "$0",
      change: "0% vs mes anterior",
      changeType: "neutral" as const,
      icon: DollarSign,
      iconColor: "bg-primary"
    },
  ];

  // 🔹 Listas vacías
  const recentTransactions: Transaction[] = [];
  const upcomingObligations: Obligation[] = [];

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Resumen de tu actividad financiera
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Junio 2025
          </Button>
          <Button size="sm" className="bg-gradient-primary">
            <Receipt className="h-4 w-4 mr-2" />
            Nueva Transacción
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Secciones inferiores */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Transacciones Recientes */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Transacciones Recientes</h2>
            <Button variant="ghost" size="sm" className="text-primary">
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
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === "Ingreso" 
                        ? "bg-success/10" 
                        : "bg-destructive/10"
                    }`}>
                      <Receipt className={`h-4 w-4 ${
                        transaction.type === "Ingreso"
                          ? "text-success"
                          : "text-destructive"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${
                    transaction.type === "Ingreso"
                      ? "text-success"
                      : "text-destructive"
                  }`}>
                    {transaction.amount}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Próximas Obligaciones */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Próximas Obligaciones</h2>
            <Button variant="ghost" size="sm" className="text-primary">
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
              {upcomingObligations.map((obligation) => (
                <div
                  key={obligation.id}
                  className="flex items-start justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      obligation.priority === "high"
                        ? "bg-destructive/10"
                        : "bg-warning/10"
                    }`}>
                      <AlertCircle className={`h-4 w-4 ${
                        obligation.priority === "high"
                          ? "text-destructive"
                          : "text-warning"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{obligation.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Vence: {obligation.date}
                      </p>
                      <p className="text-sm font-semibold text-primary mt-1">
                        {obligation.amount}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
