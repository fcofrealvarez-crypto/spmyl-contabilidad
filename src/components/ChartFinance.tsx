import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

// 🔹 Tipos definidos para seguridad de TypeScript
interface Movimiento {
  id: number;
  tipo: "ingreso" | "gasto";
  categoria: string;
  monto: number;
  fecha: string;
}

interface Props {
  movimientos: Movimiento[];
}

// 🔹 Estructuras de datos internas
interface DataMensual {
  [mes: string]: {
    mes: string;
    ingresos: number;
    gastos: number;
  };
}

export default function ChartFinance({ movimientos }: Props) {
  // Si no hay movimientos, mostramos mensaje vacío
  if (!movimientos.length)
    return (
      <p className="text-center text-gray-500 py-10">
        No hay datos disponibles aún.
      </p>
    );

  // 📅 Agrupar por mes
  const dataMensual = movimientos.reduce<DataMensual>((acc, mov) => {
    const mes = new Date(mov.fecha).toLocaleString("es-CL", { month: "short" });
    if (!acc[mes]) acc[mes] = { mes, ingresos: 0, gastos: 0 };

    if (mov.tipo === "ingreso") acc[mes].ingresos += mov.monto;
    else acc[mes].gastos += mov.monto;

    return acc;
  }, {});

  // 💰 Ingresos por categoría
  const ingresosPorCategoria = movimientos
    .filter((m) => m.tipo === "ingreso")
    .reduce<Record<string, number>>((acc, m) => {
      acc[m.categoria] = (acc[m.categoria] || 0) + m.monto;
      return acc;
    }, {});

  // 📉 Gastos por categoría
  const gastosPorCategoria = movimientos
    .filter((m) => m.tipo === "gasto")
    .reduce<Record<string, number>>((acc, m) => {
      acc[m.categoria] = (acc[m.categoria] || 0) + m.monto;
      return acc;
    }, {});

  // 🔢 Transformar datos para los gráficos
  const dataBarra = Object.values(dataMensual);
  const dataPieIngresos = Object.entries(ingresosPorCategoria).map(
    ([name, value]) => ({ name, value })
  );
  const dataPieGastos = Object.entries(gastosPorCategoria).map(
    ([name, value]) => ({ name, value })
  );

  const COLORS = ["#16a34a", "#2563eb", "#f59e0b", "#ef4444", "#8b5cf6"];

  // 🎨 Render principal
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* 📊 Gráfico de barras */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Evolución Mensual</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataBarra}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="ingresos" fill="#16a34a" name="Ingresos" />
            <Bar dataKey="gastos" fill="#ef4444" name="Gastos" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🥧 Gráficos de distribución */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Distribución por Categoría</h2>
        <div className="flex flex-col md:flex-row justify-around">
          {/* Ingresos */}
          <div className="flex flex-col items-center">
            <h3 className="font-medium mb-2">Ingresos</h3>
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={dataPieIngresos}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {dataPieIngresos.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gastos */}
          <div className="flex flex-col items-center mt-6 md:mt-0">
            <h3 className="font-medium mb-2">Gastos</h3>
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={dataPieGastos}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {dataPieGastos.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}


