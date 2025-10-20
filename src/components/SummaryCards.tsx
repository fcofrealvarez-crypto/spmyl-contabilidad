import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Scale, FileText } from "lucide-react";

interface Props {
  ingresos: number;
  gastos: number;
  balance: number;
  iva: number;
}

export default function SummaryCards({ ingresos, gastos, balance, iva }: Props) {
  const formatCurrency = (value: number) =>
    value.toLocaleString("es-CL", { style: "currency", currency: "CLP" });

  const data = [
    {
      title: "Ingresos Totales",
      value: formatCurrency(ingresos),
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
    {
      title: "Gastos Totales",
      value: formatCurrency(gastos),
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-500/10",
    },
    {
      title: "Balance",
      value: formatCurrency(balance),
      icon: Scale,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      title: "IVA Estimado (19%)",
      value: formatCurrency(iva),
      icon: FileText,
      color: "text-yellow-600",
      bg: "bg-yellow-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((item, i) => (
        <Card key={i} className="shadow-sm border rounded-xl">
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <div className={`${item.bg} p-2 rounded-lg`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

