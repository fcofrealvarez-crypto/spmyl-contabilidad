import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
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
import { supabase } from "@/integrations/supabase/client";
import { transactionSchema } from "@/lib/validators";
import { sanitizeTransaction } from "@/lib/sanitize";
import { handleDatabaseError, handleSuccess, withErrorHandling } from "@/lib/errorHandler";
import { z } from "zod";

export default function Transactions() {
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 📥 Cargar transacciones existentes
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    await withErrorHandling(async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    }, "Load Transactions");
  };

  // 📥 Registrar nueva transacción
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Preparar datos
      const rawData = {
        type: String(formData.get("type")),
        category: String(formData.get("category")),
        description: String(formData.get("description")),
        amount: Number(formData.get("amount")),
        date: String(formData.get("date")),
        document: formData.get("document") ? (formData.get("document") as File).name : null,
      };

      // Validar con Zod
      const validatedData = transactionSchema.parse(rawData);

      // Sanitizar datos
      const sanitizedData = sanitizeTransaction(validatedData);

      // Obtener user_id actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // Insertar en base de datos
      const { data, error } = await supabase
        .from("transactions")
        .insert([{
          ...sanitizedData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      handleSuccess("✅ Transacción registrada exitosamente");

      // Actualizar lista
      setTransactions([data, ...transactions]);
      setShowForm(false);
      setErrors({});

      // Limpiar formulario
      e.currentTarget.reset();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        handleDatabaseError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };


  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);

  return (
    <Layout>
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
                {/* Tipo */}
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Transacción</Label>
                  <Select name="type" required>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ingreso">Ingreso</SelectItem>
                      <SelectItem value="Gasto">Gasto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Categoría */}
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select name="category" required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Servicios">Servicios Profesionales</SelectItem>
                      <SelectItem value="Arriendo">Arriendo</SelectItem>
                      <SelectItem value="Suministros">Suministros</SelectItem>
                      <SelectItem value="Honorarios">Honorarios</SelectItem>
                      <SelectItem value="Otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Monto */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto (CLP)</Label>
                  <Input id="amount" name="amount" type="number" placeholder="0" required />
                </div>

                {/* Fecha */}
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input id="date" name="date" type="date" required />
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Detalles de la transacción..."
                  rows={3}
                  required
                />
              </div>

              {/* Comprobante */}
              <div className="space-y-2">
                <Label htmlFor="document">Comprobante (opcional)</Label>
                <Input id="document" name="document" type="file" accept=".pdf,.jpg,.jpeg,.png" />
              </div>

              {/* Botones */}
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
              {transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-all hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl ${transaction.type === "Ingreso"
                          ? "bg-success/10"
                          : "bg-destructive/10"
                        }`}
                    >
                      <Receipt
                        className={`h-5 w-5 ${transaction.type === "Ingreso"
                            ? "text-success"
                            : "text-destructive"
                          }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-semibold ${transaction.type === "Ingreso"
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
                      className={`text-xl font-bold ${transaction.type === "Ingreso"
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
    </Layout>
  );
}
