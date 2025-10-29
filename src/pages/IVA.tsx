import { useState, useEffect } from "react";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Calculator,
  Download,
  Calendar
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

// 🔹 Tipado de registros
interface IVARecord {
  period: string;
  debito: number;
  credito: number;
  pagar: number;
  status: string;
  date: string;
}

export default function IVA() {
  const [ivaHistory, setIvaHistory] = useState<IVARecord[]>([]);
  const [ivaData, setIvaData] = useState({
    debito: 0,
    credito: 0,
    pagar: 0,
  });

  // 🔹 Mes actual dinámico
  const currentPeriod = new Date().toLocaleDateString("es-CL", {
    month: "long",
    year: "numeric",
  });

  // 🔹 Cargar transacciones desde Supabase
  useEffect(() => {
    const fetchTransactions = async () => {
      const { data, error } = await supabase.from("transactions").select("*");
      if (error) {
        console.error(error);
        toast.error("Error al cargar transacciones");
        return;
      }

      // Calcular IVA débito y crédito (19%)
      const debito = data
        .filter((t) => t.type === "Ingreso")
        .reduce((sum, t) => sum + t.amount * 0.19, 0);
      const credito = data
        .filter((t) => t.type === "Gasto")
        .reduce((sum, t) => sum + t.amount * 0.19, 0);

      const pagar = debito - credito;

      setIvaData({ debito, credito, pagar });
    };

    fetchTransactions();
  }, []);

  // 🔹 Guardar resultado y generar PDF
  const handleGenerateF29 = async () => {
    const record: IVARecord = {
      period: currentPeriod,
      debito: ivaData.debito,
      credito: ivaData.credito,
      pagar: ivaData.pagar,
      status: ivaData.pagar >= 0 ? "Pendiente de Pago" : "A Recuperar",
      date: new Date().toLocaleDateString("es-CL"),
    };

    // Guardar en Supabase
    const { error } = await supabase.from("iva_records").insert(record);
    if (error) {
      console.error(error);
      toast.error("Error al guardar declaración IVA");
      return;
    }

    // Agregar al historial local
    setIvaHistory((prev) => [...prev, record]);
    toast.success("F29 generado exitosamente");

    // Generar PDF
    const doc = new jsPDF();
    doc.text(`Formulario 29 - Declaración Mensual IVA`, 14, 15);
    doc.text(`Período: ${currentPeriod}`, 14, 25);

    autoTable(doc, {
      startY: 35,
      head: [["Concepto", "Monto"]],
      body: [
        ["IVA Débito Fiscal (19%)", formatCurrency(ivaData.debito)],
        ["IVA Crédito Fiscal (19%)", formatCurrency(ivaData.credito)],
        ["IVA a Pagar / Recuperar", formatCurrency(ivaData.pagar)],
      ],
    });

    doc.save(`F29_${currentPeriod}.pdf`);
  };

  // 🔹 Formato CLP
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);
  };

  // 🔹 Tarjetas resumen
  const ivaStats = [
    {
      title: "IVA Débito Fiscal",
      value: formatCurrency(ivaData.debito),
      change: "Ventas del período",
      changeType: "positive" as const,
      icon: TrendingUp,
      iconColor: "bg-green-500/10",
    },
    {
      title: "IVA Crédito Fiscal",
      value: formatCurrency(ivaData.credito),
      change: "Compras del período",
      changeType: "negative" as const,
      icon: TrendingDown,
      iconColor: "bg-blue-500/10",
    },
    {
      title: "IVA a Pagar / Recuperar",
      value: formatCurrency(ivaData.pagar),
      change:
        ivaData.pagar >= 0
          ? "Monto pendiente por pagar"
          : "Saldo a recuperar",
      changeType: "neutral" as const,
      icon: Calculator,
      iconColor: "bg-yellow-500/10",
    },
    {
      title: "Última Declaración",
      value: ivaHistory.length
        ? ivaHistory[ivaHistory.length - 1].period
        : "Sin registro",
      change: ivaHistory.length
        ? ivaHistory[ivaHistory.length - 1].status
        : "No declarada",
      changeType: "neutral" as const,
      icon: FileText,
      iconColor: "bg-gray-200",
    },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Seguimiento IVA</h1>
          <p className="text-muted-foreground mt-1">
            Control y cálculo automático de tu IVA mensual
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            {currentPeriod.charAt(0).toUpperCase() + currentPeriod.slice(1)}
          </Button>
          <Button
            size="sm"
            className="bg-gradient-primary"
            onClick={handleGenerateF29}
          >
            <Download className="h-4 w-4 mr-2" />
            Generar F29
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {ivaStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Detalle del Período Actual */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">
          Detalle Período Actual
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-2">IVA Débito Fiscal</h3>
            <p className="text-muted-foreground mb-1">
              Ventas afectas → {formatCurrency(ivaData.debito / 0.19)}
            </p>
            <p className="font-bold text-green-600">
              {formatCurrency(ivaData.debito)}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">IVA Crédito Fiscal</h3>
            <p className="text-muted-foreground mb-1">
              Compras afectas → {formatCurrency(ivaData.credito / 0.19)}
            </p>
            <p className="font-bold text-blue-600">
              {formatCurrency(ivaData.credito)}
            </p>
          </div>
        </div>

        {/* Total a Pagar */}
        <div className="mt-6 p-6 rounded-xl bg-gradient-primary text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Total IVA a Pagar</p>
              <p className="text-3xl font-bold">
                {formatCurrency(ivaData.pagar)}
              </p>
              <p className="text-white/80 text-sm mt-2">
                Fecha de vencimiento: {currentPeriod}
              </p>
            </div>
            <Calculator className="h-12 w-12 text-white/80" />
          </div>
        </div>
      </Card>

      {/* Historial */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">
          Historial de Declaraciones
        </h2>

        {ivaHistory.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No hay declaraciones registradas aún.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Período
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Débito Fiscal
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Crédito Fiscal
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    IVA a Pagar
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Estado
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody>
                {ivaHistory.map((record, i) => (
                  <tr
                    key={i}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium">
                      {record.period}
                    </td>
                    <td className="py-4 px-4 text-right text-green-600 font-semibold">
                      {formatCurrency(record.debito)}
                    </td>
                    <td className="py-4 px-4 text-right text-blue-600 font-semibold">
                      {formatCurrency(record.credito)}
                    </td>
                    <td className="py-4 px-4 text-right text-white bg-gradient-to-r from-blue-600 to-blue-400 rounded-md">
                      {formatCurrency(record.pagar)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-success/10 text-success">
                        {record.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-sm text-muted-foreground">
                      {record.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
