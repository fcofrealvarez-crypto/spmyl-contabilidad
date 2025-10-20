import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  Calendar,
  CheckCircle2,
  Clock,
  FileText
} from "lucide-react";

// 🔹 Tipado de obligación
interface Obligation {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  amount: number;
  priority: string;
  status: string;
  category: string;
}

// 🔹 Tipado extendido para los colores de Badge
type BadgeVariant = 
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "warning"
  | "success"
  | "primary";

export default function Obligations() {
  // 🔹 Lista vacía (sin datos iniciales)
  const obligations: Obligation[] = [];

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "Sin monto asociado";
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 🔹 Corregido: con tipo BadgeVariant (sin any)
  const getPriorityColor = (priority: string): BadgeVariant => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Media";
      default:
        return "Baja";
    }
  };

  const pendingObligations = obligations.filter((o) => o.status === "pending");
  const completedObligations = obligations.filter((o) => o.status === "completed");

  return (
    <Layout>
      <div className="space-y-6 pb-20 lg:pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Obligaciones Tributarias</h1>
            <p className="text-muted-foreground mt-1">
              Seguimiento de tus obligaciones fiscales y contables
            </p>
          </div>
          <Button className="bg-gradient-primary">
            <Calendar className="h-4 w-4 mr-2" />
            Ver Calendario
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6 border-l-4 border-l-destructive">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-foreground">{pendingObligations.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-success">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold text-foreground">{completedObligations.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-primary">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monto Total</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(pendingObligations.reduce((sum, o) => sum + o.amount, 0))}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pending Obligations */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Próximas Obligaciones</h2>

          {pendingObligations.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No hay obligaciones pendientes registradas.
            </p>
          ) : (
            pendingObligations.map((obligation) => {
              const daysUntilDue = getDaysUntilDue(obligation.dueDate);
              const isUrgent = daysUntilDue <= 5;

              return (
                <Card
                  key={obligation.id}
                  className={`p-6 transition-all hover:shadow-lg ${
                    isUrgent ? "border-destructive/50" : ""
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isUrgent ? "bg-destructive/10" : "bg-warning/10"
                          }`}
                        >
                          <AlertCircle
                            className={`h-5 w-5 ${
                              isUrgent ? "text-destructive" : "text-warning"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-foreground mb-1">
                            {obligation.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {obligation.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={getPriorityColor(obligation.priority)}>
                              Prioridad {getPriorityLabel(obligation.priority)}
                            </Badge>
                            <Badge variant="outline">{obligation.category}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 lg:min-w-[200px]">
                      <div className="text-left sm:text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <p
                            className={`text-sm font-semibold ${
                              isUrgent ? "text-destructive" : "text-muted-foreground"
                            }`}
                          >
                            {daysUntilDue > 0
                              ? `${daysUntilDue} días restantes`
                              : daysUntilDue === 0
                              ? "Vence hoy"
                              : "Vencido"}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {new Date(obligation.dueDate).toLocaleDateString("es-CL", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        {obligation.amount > 0 && (
                          <p className="text-lg font-bold text-primary">
                            {formatCurrency(obligation.amount)}
                          </p>
                        )}
                      </div>
                      <Button size="sm" className="bg-gradient-primary w-full sm:w-auto">
                        Marcar como Pagado
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Completed Obligations */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Obligaciones Completadas</h2>

          {completedObligations.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No hay obligaciones completadas aún.
            </p>
          ) : (
            completedObligations.map((obligation) => (
              <Card key={obligation.id} className="p-6 bg-secondary/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{obligation.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Completado el{" "}
                        {new Date(obligation.dueDate).toLocaleDateString("es-CL")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {obligation.amount > 0 && (
                      <p className="font-semibold text-muted-foreground">
                        {formatCurrency(obligation.amount)}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
