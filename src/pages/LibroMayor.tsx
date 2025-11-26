import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Download, Search, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

interface JournalEntryLine {
  id: string;
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  third_party_rut: string | null;
  third_party_name: string | null;
  journal_entry: {
    entry_number: string;
    entry_type: string;
    entry_date: string;
    gloss: string | null;
    document_type: string | null;
    document_number: string | null;
  };
}

export default function LibroMayor() {
  const [entries, setEntries] = useState<JournalEntryLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("journal_entry_lines")
        .select(`
          *,
          journal_entry:journal_entries (
            entry_number,
            entry_type,
            entry_date,
            gloss,
            document_type,
            document_number
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to match interface if needed, but Supabase returns nested objects
      // We need to cast or ensure the type matches.
      // The query returns an array of objects where journal_entry is a single object (because it's a many-to-one from lines to header)
      setEntries(data as unknown as JournalEntryLine[]);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      toast.error("Error al cargar el Libro Mayor");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!entries || entries.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      entries.map((e) => ({
        "N. COMP": e.journal_entry.entry_number,
        "TIPO COMP": e.journal_entry.entry_type,
        FECHA: new Date(e.journal_entry.entry_date).toLocaleDateString("es-CL"),
        CODIGO: e.account_code,
        "CTA DESCRIPCION": e.account_name,
        GLOSA: e.journal_entry.gloss,
        DEBE: e.debit,
        HABER: e.credit,
        RUT: e.third_party_rut,
        NOMBRE: e.third_party_name,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Libro Mayor");
    XLSX.writeFile(
      workbook,
      `libro-mayor-${new Date().toISOString().split("T")[0]}.xlsx`
    );
    toast.success("Exportado exitosamente");
  };

  const filteredEntries = entries.filter((e) =>
    e.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.journal_entry.gloss && e.journal_entry.gloss.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (e.third_party_name && e.third_party_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    e.account_code.includes(searchTerm)
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(value);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Libro Mayor</h1>
            <p className="text-muted-foreground">
              Visualización de todos los movimientos contables
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              disabled={!entries || entries.length === 0}
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Buscar Asientos</CardTitle>
            <CardDescription>
              Busca por cuenta, glosa, RUT o nombre
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar movimientos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movimientos Contables</CardTitle>
            <CardDescription>
              Total de registros: {filteredEntries.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredEntries.length > 0 ? (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cuenta</TableHead>
                      <TableHead>Glosa</TableHead>
                      <TableHead className="text-right">Debe</TableHead>
                      <TableHead className="text-right">Haber</TableHead>
                      <TableHead>RUT</TableHead>
                      <TableHead>Nombre</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {new Date(entry.journal_entry.entry_date).toLocaleDateString("es-CL")}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            {entry.journal_entry.entry_type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="font-medium text-sm">
                              {entry.account_code}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {entry.account_name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {entry.journal_entry.gloss || "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {entry.debit > 0
                            ? formatCurrency(entry.debit)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {entry.credit > 0
                            ? formatCurrency(entry.credit)
                            : "-"}
                        </TableCell>
                        <TableCell>{entry.third_party_rut || "-"}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {entry.third_party_name || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No hay movimientos para mostrar
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
