
import * as React from "react";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  FileText,
  Download,
  TrendingUp,
  Calendar,
  BarChart3,
  PieChart,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// ⚙️ Inicialización Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Reports() {
  // 🔹 Control de modal y formulario
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [confirmacion, setConfirmacion] = useState("");

  // 🔹 Fechas dinámicas
  const currentDate = new Date();
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  // 🔹 Datos demo
  const quickStats = {
    ingresos: 0,
    gastos: 0,
    resultado: 0,
    rentabilidad: 0,
  };

  const reports = [
    {
      id: 1,
      title: "Estado de Resultados",
      description: "Ingresos, gastos y resultado del período",
      icon: TrendingUp,
      period: `${currentMonth} ${currentYear}`,
    },
    {
      id: 2,
      title: "Balance General",
      description: "Activos, pasivos y patrimonio",
      icon: BarChart3,
      period: `Al ${new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
      ).toLocaleDateString("es-CL")}`,
    },
    {
      id: 3,
      title: "Flujo de Caja",
      description: "Movimientos de efectivo del período",
      icon: FileText,
      period: `${currentMonth} ${currentYear}`,
    },
    {
      id: 4,
      title: "Libro de Compras y Ventas",
      description: "Registro de operaciones con IVA",
      icon: FileText,
      period: `${currentMonth} ${currentYear}`,
    },
    {
      id: 5,
      title: "Gastos por Categoría",
      description: "Distribución de gastos operacionales",
      icon: PieChart,
      period: `${currentMonth} ${currentYear}`,
    },
    {
      id: 6,
      title: "Evolución Mensual",
      description: "Comparativa de ingresos y gastos",
      icon: TrendingUp,
      period: "Último año",
    },
  ];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);

  // 🔹 Enviar solicitud a Supabase
  const enviarSolicitud = async () => {
    if (!nombre || !email || !mensaje) {
      setConfirmacion("Por favor completa todos los campos.");
      return;
    }

    setEnviando(true);
    setConfirmacion("");

    const { error } = await supabase.from("soporte").insert([
      {
        nombre,
        email,
        mensaje,
        fecha: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error al enviar:", error);
      setConfirmacion("❌ Ocurrió un error. Inténtalo nuevamente.");
    } else {
      setConfirmacion("✅ Tu solicitud fue enviada correctamente.");
      setNombre("");
      setEmail("");
      setMensaje("");
      setTimeout(() => setOpen(false), 2000);
    }

    setEnviando(false);
  };

  return (
    <Layout>
      <div className="space-y-6 pb-20 lg:pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Informes Financieros
            </h1>
            <p className="text-muted-foreground mt-1">
              Análisis y reportes de tu gestión contable
            </p>
          </div>
          <Button className="bg-gradient-primary">
            <Calendar className="h-4 w-4 mr-2" />
            Seleccionar Período
          </Button>
        </div>

        {/* Resumen rápido */}
        <Card className="p-6 bg-gradient-card">
          <h2 className="text-xl font-bold text-foreground mb-6">
            Resumen Rápido - {currentMonth} {currentYear}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-xl bg-success/10 border border-success/20">
              <p className="text-sm text-muted-foreground mb-1">
                Ingresos Totales
              </p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(quickStats.ingresos)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-muted-foreground mb-1">
                Gastos Totales
              </p>
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(quickStats.gastos)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">
                Resultado Neto
              </p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(quickStats.resultado)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
              <p className="text-sm text-muted-foreground mb-1">Rentabilidad</p>
              <p className="text-2xl font-bold text-accent">
                {quickStats.rentabilidad.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>

        {/* Cards de informes */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <Card
                key={report.id}
                className="p-6 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary group-hover:scale-110 transition-all">
                    <Icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground mb-1">
                      {report.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {report.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Período
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {report.period}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8">
                      <FileText className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button size="sm" className="h-8 bg-gradient-primary">
                      <Download className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Contactar soporte */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-2">
                ¿Necesitas un informe personalizado?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Podemos generar informes a medida según tus necesidades
                específicas. Contacta con nuestro equipo de soporte para
                solicitar informes personalizados.
              </p>
              <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                Contactar Soporte
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitud de Informe Personalizado</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Tu nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <Input
              placeholder="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Textarea
              placeholder="Describe el tipo de informe que necesitas..."
              value={mensaje}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMensaje(e.target.value)}

            />
            {confirmacion && (
              <p className="text-sm text-center text-muted-foreground">
                {confirmacion}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button onClick={enviarSolicitud} disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar solicitud"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
