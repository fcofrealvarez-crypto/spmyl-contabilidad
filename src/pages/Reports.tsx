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
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

// 🔹 Tipado de reportes
interface Report {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

export default function Reports() {
  // Estados principales
  const [open, setOpen] = useState(false); // soporte
  const [openPeriodo, setOpenPeriodo] = useState(false); // selector de período
  const [openPreview, setOpenPreview] = useState(false); // vista previa
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Campos soporte
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Fechas dinámicas
  const now = new Date();
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  const [selectedMonth, setSelectedMonth] = useState(months[now.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Datos simulados
  const quickStats = { ingresos: 0, gastos: 0, resultado: 0, rentabilidad: 0 };

  const reports: Report[] = [
    { id: 1, title: "Estado de Resultados", icon: TrendingUp, description: "Ingresos, gastos y resultado del período" },
    { id: 2, title: "Balance General", icon: BarChart3, description: "Activos, pasivos y patrimonio" },
    { id: 3, title: "Flujo de Caja", icon: FileText, description: "Movimientos de efectivo del período" },
    { id: 4, title: "Libro de Compras y Ventas", icon: FileText, description: "Registro de operaciones con IVA" },
    { id: 5, title: "Gastos por Categoría", icon: PieChart, description: "Distribución de gastos operacionales" },
  ];

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n);

  // Envío de soporte
  const enviarSolicitud = async () => {
    if (!nombre || !email || !mensaje) {
      setConfirmacion("Por favor completa todos los campos.");
      return;
    }
    setEnviando(true);
    const { error } = await supabase.from("soporte").insert([
      { nombre, email, mensaje, fecha: new Date().toISOString() },
    ]);
    if (error) {
      console.error(error);
      toast.error("Error al enviar solicitud");
      setConfirmacion("❌ Error al enviar. Intenta nuevamente.");
    } else {
      toast.success("Solicitud enviada correctamente");
      setConfirmacion("✅ Solicitud enviada correctamente.");
      setNombre(""); 
      setEmail(""); 
      setMensaje("");
      setTimeout(() => setOpen(false), 2000);
    }
    setEnviando(false);
  };

  // Ver reporte (modal preview)
  const handleVer = (report: Report) => {
    setSelectedReport(report);
    setOpenPreview(true);
  };

  // Generar PDF
  const handlePDF = (report: Report) => {
    const doc = new jsPDF();
    doc.text(`Informe: ${report.title}`, 14, 15);
    doc.text(`Período: ${selectedMonth} ${selectedYear}`, 14, 25);
    autoTable(doc, {
      startY: 35,
      head: [["Concepto", "Monto"]],
      body: [
        ["Ingresos", formatCurrency(quickStats.ingresos)],
        ["Gastos", formatCurrency(quickStats.gastos)],
        ["Resultado", formatCurrency(quickStats.resultado)],
        ["Rentabilidad", `${quickStats.rentabilidad}%`],
      ],
    });
    doc.save(`${report.title}_${selectedMonth}_${selectedYear}.pdf`);
  };

  return (
    <Layout>
      <div className="space-y-6 pb-20 lg:pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Informes Financieros</h1>
            <p className="text-muted-foreground mt-1">
              Análisis y reportes contables del período seleccionado
            </p>
          </div>
          <Button className="bg-gradient-primary" onClick={() => setOpenPeriodo(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Seleccionar Período
          </Button>
        </div>

        {/* Resumen rápido */}
        <Card className="p-6 bg-gradient-card">
          <h2 className="text-xl font-bold mb-6">
            Resumen - {selectedMonth} {selectedYear}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-xl bg-success/10">
              <p className="text-sm text-muted-foreground">Ingresos</p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(quickStats.ingresos)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-destructive/10">
              <p className="text-sm text-muted-foreground">Gastos</p>
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(quickStats.gastos)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-primary/10">
              <p className="text-sm text-muted-foreground">Resultado</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(quickStats.resultado)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-accent/10">
              <p className="text-sm text-muted-foreground">Rentabilidad</p>
              <p className="text-2xl font-bold text-accent">
                {quickStats.rentabilidad}%
              </p>
            </div>
          </div>
        </Card>

        {/* Cards de informes */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => {
            const Icon = r.icon;
            return (
              <Card key={r.id} className="p-6 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{r.title}</h3>
                    <p className="text-sm text-muted-foreground">{r.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <p className="text-xs text-muted-foreground">Período</p>
                  <p className="text-sm font-semibold">
                    {selectedMonth} {selectedYear}
                  </p>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => handleVer(r)}>
                    <FileText className="h-3 w-3 mr-1" /> Ver
                  </Button>
                  <Button size="sm" className="bg-gradient-primary" onClick={() => handlePDF(r)}>
                    <Download className="h-3 w-3 mr-1" /> PDF
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Contactar soporte */}
        <Card className="p-6 bg-primary/5">
          <h3 className="font-bold mb-2">¿Necesitas un informe personalizado?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Solicita un informe adaptado a tus necesidades.
          </p>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            Contactar Soporte
          </Button>
        </Card>

        {/* Modal soporte */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Solicitud de Informe Personalizado</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Nombre completo"
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
                placeholder="Describe el informe que necesitas..."
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
              />
              {confirmacion && (
                <p className="text-sm text-center">{confirmacion}</p>
              )}
            </div>
            <DialogFooter>
              <Button onClick={enviarSolicitud} disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar solicitud"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal seleccionar período */}
        <Dialog open={openPeriodo} onOpenChange={setOpenPeriodo}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Seleccionar Período</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <select
                className="border rounded-lg p-2"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <Input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              />
            </div>
            <DialogFooter>
              <Button onClick={() => setOpenPeriodo(false)}>Aceptar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal vista previa informe */}
        <Dialog open={openPreview} onOpenChange={setOpenPreview}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedReport?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>Período:</strong> {selectedMonth} {selectedYear}
              </p>
              <p>
                <strong>Ingresos:</strong> {formatCurrency(quickStats.ingresos)}
              </p>
              <p>
                <strong>Gastos:</strong> {formatCurrency(quickStats.gastos)}
              </p>
              <p>
                <strong>Resultado:</strong> {formatCurrency(quickStats.resultado)}
              </p>
              <p>
                <strong>Rentabilidad:</strong> {quickStats.rentabilidad}%
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenPreview(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
