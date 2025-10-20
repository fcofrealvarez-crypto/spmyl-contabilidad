import { Layout } from "@/components/Layout";
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
  // 🔹 Datos iniciales en cero
  const ivaStats = [
    {
      title: "IVA Débito Fiscal",
      value: "$0",
      change: "Ventas del período",
      changeType: "neutral" as const,
      icon: TrendingUp,
      iconColor: "bg-success"
    },
    {
      title: "IVA Crédito Fiscal",
      value: "$0",
      change: "Compras del período",
      changeType: "neutral" as const,
      icon: TrendingDown,
      iconColor: "bg-primary-light"
    },
    {
      title: "IVA a Pagar",
      value: "$0",
      change: "Sin vencimiento",
      changeType: "neutral" as const,
      icon: Calculator,
      iconColor: "bg-warning"
    },
    {
      title: "Última Declaración",
      value: "-",
      change: "Sin registro",
      changeType: "neutral" as const,
      icon: FileText,
      iconColor: "bg-primary"
    },
  ];

  // 🔹 Historial vacío
  const ivaHistory: IVARecord[] = [];

  // 🔹 Formato de moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  return (
    <Layout>
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
              Junio 2025
            </Button>
            <Button size="sm" className="bg-gradient-primary">
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
          <h2 className="text-xl font-bold text-foreground mb-6">Detalle Período Actual</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Débito Fiscal */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-success/10">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">IVA Débito Fiscal</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-sm text-muted-foreground">Ventas afectas</span>
                  <span className="font-semibold text-foreground">$0</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-sm text-muted-foreground">IVA (19%)</span>
                  <span className="font-semibold text-success">$0</span>
                </div>
              </div>
            </div>

            {/* Crédito Fiscal */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-primary-light/10">
                  <TrendingDown className="h-5 w-5 text-primary-light" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">IVA Crédito Fiscal</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-sm text-muted-foreground">Compras afectas</span>
                  <span className="font-semibold text-foreground">$0</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-sm text-muted-foreground">IVA (19%)</span>
                  <span className="font-semibold text-primary-light">$0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total a Pagar */}
          <div className="mt-6 p-6 rounded-xl bg-gradient-primary text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Total IVA a Pagar</p>
                <p className="text-3xl font-bold">$0</p>
                <p className="text-white/80 text-sm mt-2">
                  Fecha de vencimiento: No definida
                </p>
              </div>
              <Calculator className="h-12 w-12 text-white/80" />
            </div>
          </div>
        </Card>

        {/* Historial */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Historial de Declaraciones</h2>
          
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
                      Fecha Pago
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ivaHistory.map((record, index) => (
                    <tr 
                      key={index}
                      className="border-b border-border hover:bg-secondary/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span className="font-medium text-foreground">{record.period}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-success font-semibold">
                          {formatCurrency(record.debito)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-primary-light font-semibold">
                          {formatCurrency(record.credito)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-foreground font-bold">
                          {formatCurrency(record.pagar)}
                        </span>
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
    </Layout>
  );
}
