import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Receipt, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface Transaction {
  id: string;
  type: "Ingreso" | "Gasto";
  description: string;
  amount: number;
  date: string;
  document_type: string;
  folio: string | null;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      // 1. Cargar Ventas
      const { data: sales, error: salesError } = await supabase
        .from("sales_book")
        .select("*")
        .order("issue_date", { ascending: false });

      if (salesError) throw salesError;

      // 2. Cargar Compras
      const { data: purchases, error: purchasesError } = await supabase
        .from("purchase_book")
        .select("*")
        .order("document_date", { ascending: false });

      if (purchasesError) throw purchasesError;

      // 3. Unificar datos
      const salesTx: Transaction[] = (sales || []).map((s) => ({
        id: `sale-${s.id}`,
        type: "Ingreso",
        description: s.customer_name,
        amount: Number(s.total_amount),
        date: s.issue_date || "",
        document_type: s.document_type,
        folio: s.folio,
      }));

      const purchasesTx: Transaction[] = (purchases || []).map((p) => ({
        id: `purchase-${p.id}`,
        type: "Gasto",
        description: p.supplier_name,
        amount: Number(p.total_amount),
        date: p.document_date || "",
        document_type: p.document_type,
        folio: p.folio,
      }));

      const allTx = [...salesTx, ...purchasesTx].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setTransactions(allTx);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Error al cargar movimientos");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.folio && t.folio.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredTransactions.map((t) => ({
        Fecha: new Date(t.date).toLocaleDateString("es-CL"),
        Tipo: t.type,
        Descripción: t.description,
        Documento: t.document_type,
        Folio: t.folio,
        Monto: t.amount,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos");
    XLSX.writeFile(wb, "Movimientos_Unificados.xlsx");
  };

  return (
    <Layout>
      <div className="space-y-6 pb-20 lg:pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Movimientos</h1>
            <p className="text-muted-foreground mt-1">
              Vista unificada de todos tus ingresos (Ventas) y gastos (Compras)
            </p>
          </div>
          <Button onClick={exportToExcel} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>

        {/* Filtros */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, proveedor o folio..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Lista de Transacciones */}
        <Card className="p-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando movimientos...</div>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No hay movimientos registrados aún.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
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
                          {transaction.document_type} {transaction.folio ? `#${transaction.folio}` : ''}
                        </span>
                      </div>
                      <p className="font-medium text-foreground">
                        {transaction.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span>
                          {new Date(transaction.date).toLocaleDateString("es-CL")}
                        </span>
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
