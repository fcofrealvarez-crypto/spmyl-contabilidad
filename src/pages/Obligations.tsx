import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CalendarView from "react-calendar"; // 📅 npm install react-calendar
import "react-calendar/dist/Calendar.css";

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

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "warning"
  | "success"
  | "primary";

export default function Obligations() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [obligations, setObligations] = useState<Obligation[]>([
    {
      id: 1,
      title: "Declaración IVA F29",
      description: "Pago mensual del IVA correspondiente al período anterior",
      dueDate: "2025-10-31",
      amount: 250000,
      priority: "high",
      status: "pending",
      category: "Tributaria",
    },
    {
      id: 2,
      title: "Remuneraciones Octubre",
      description: "Pago de sueldos a trabajadores del mes",
      dueDate: "2025-10-30",
      amount: 850000,
      priority: "medium",
      status: "pending",
      category: "Laboral",
    },
    {
      id: 3,
      title: "Formulario 29 - Septiembre",
      description: "Declaración realizada en fecha límite",
      dueDate: "2025-09-30",
      amount: 210000,
      priority: "low",
      status: "completed",
      category: "Tributaria",
    },
  ]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

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

  // 🔹 Marcar como pagada
  const handleMarkAsPaid = (id: number) => {
    setObligations((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "completed" } : o
      )
    );
  };

  const pendingObligations = obligations.filter((o) => o.status === "pending");
  const completedObligations = obligations.filter((o) => o.status === "completed");

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Obligaciones Tributarias</h1>
          <p className="text-muted-foreground mt-1">
            Seguimiento de tus obligaciones fiscales y contables
          </p>
        </div>
        <Button className="bg-gradient-primary" onClick={() => setShowCalendar(true)}>
          <Calendar className="h-4 w-4 mr-2" />
          Ver Calendario
        </Button>
      </div>

      {/* Tarjetas resumen */}
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

      {/* Obligaciones Pendientes */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Próximas Obligaciones</h2>
        {pendingObligations.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay obligaciones pendientes.</p>
        ) : (
          pendingObligations.map((o) => {
            const days = getDaysUntilDue(o.dueDate);
            const urgent = days <= 5;
            return (
              <Card key={o.id} className="p-6 hover:shadow-md transition-all">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${urgent ? "bg-red-100" : "bg-yellow-100"}`}>
                        <AlertCircle
                          className={`h-5 w-5 ${urgent ? "text-red-600" : "text-yellow-600"}`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{o.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{o.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={getPriorityColor(o.priority)}>
                            Prioridad {getPriorityLabel(o.priority)}
                          </Badge>
                          <Badge variant="outline">{o.category}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className={`text-sm font-semibold ${urgent ? "text-red-600" : "text-gray-500"}`}>
                      {days > 0 ? `${days} días restantes` : days === 0 ? "Vence hoy" : "Vencido"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.dueDate).toLocaleDateString("es-CL")}
                    </p>
                    <p className="text-lg font-bold text-primary">{formatCurrency(o.amount)}</p>
                    <Button size="sm" className="bg-gradient-primary" onClick={() => handleMarkAsPaid(o.id)}>
                      Marcar como Pagado
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Calendario modal */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Calendario de Obligaciones</DialogTitle>
          </DialogHeader>
          <CalendarView
            tileContent={({ date }) => {
              const found = obligations.find(
                (o) => new Date(o.dueDate).toDateString() === date.toDateString()
              );
              return found ? <div className="text-xs text-blue-600 mt-1 font-semibold">●</div> : null;
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
