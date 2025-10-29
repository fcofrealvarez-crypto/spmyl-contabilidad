import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Filter, Receipt, Download } from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: number;
  type: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  document?: string;
}

export default function Transactions() {
  const [showForm, setShowForm] = useState(false);

  // 🔹 Lista vacía (posteriormente puedes conectarla a Supabase)
  const transactions: Transaction[] = [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Transacción registrada exitosamente");
    setShowForm(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transacciones</h1>
          <p className="text-muted-foreground mt-1">
            Registra y gestiona tus ingresos y gastos
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Transacción
        </Button>
      </div>

      {/* Formulario */}
      {showForm && (
        <Card className="p-6 border-primary/20">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Transacción</Label>
                <Select required>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingreso">Ingreso</SelectItem>
                    <SelectItem value="gasto">Gasto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="servicios">Servicios Profesionales</SelectItem>
                    <SelectItem value="arriendo">Arriendo</SelectItem>
                    <SelectItem value="suministros">Suministros</SelectItem>
                    <SelectItem value="honorarios">Honorarios</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Monto (CLP)</Label>
                <Input id="amount" type="number" placeholder="0" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" type="date" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Detalles de la transacción..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">Comprobante (opcional)</Label>
              <Input id="document" type="file" accept=".pdf,.jpg,.jpeg,.png" />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-gradient-primary">
                Guardar Transacción
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar transacciones..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </Card>

      {/* Lista de Transacciones */}
      <Card className="p-6">
        {transactions.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No hay transacciones registradas aún.
          </p>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      transaction.type === "Ingreso"
                        ? "bg-success/10"
                        : "bg-destructive/10"
                    }`}
                  >
                    <Receipt
                      className={`h-5 w-5 ${
                        transaction.type === "Ingreso"
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          transaction.type === "Ingreso"
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {transaction.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {transaction.category}
                      </span>
                    </div>
                    <p className="font-medium text-foreground">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span>
                        {new Date(transaction.date).toLocaleDateString("es-CL")}
                      </span>
                      {transaction.document && (
                        <>
                          <span>•</span>
                          <span>{transaction.document}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 sm:mt-0 flex items-center gap-3">
                  <p
                    className={`text-xl font-bold ${
                      transaction.type === "Ingreso"
                        ? "text-success"
                        : "text-destructive"
                    }`}
                  >
                    {transaction.type === "Ingreso" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
