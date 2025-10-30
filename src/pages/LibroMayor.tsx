import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
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
import { Upload, Download, Search, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

interface AsientoContable {
  id?: string;
  numero_comprobante: string;
  tipo_comprobante: string;
  fecha: string;
  mes?: number | null;
  codigo_cuenta: string;
  cuenta_descripcion: string;
  glosa: string;
  debe: number;
  haber: number;
  control?: number | null;
  compensacion?: number | null;
  tipo_documento?: string;
  numero_documento?: string;
  rut: string;
  nombre: string;
  user_id?: string;
}

export default function LibroMayor() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  // ✅ Obtener datos desde Supabase
  const { data: asientos = [], isLoading } = useQuery<AsientoContable[]>({
    queryKey: ["libro-contable"],
    queryFn: async (): Promise<AsientoContable[]> => {
      const { data, error } = await supabase
        .from("libro_contable")
        .select("*")
        .order("fecha", { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  // ✅ Mutación para insertar nuevos registros
  const insertAsientosMutation = useMutation({
    mutationFn: async (asientos: AsientoContable[]) => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user)
        throw new Error("Usuario no autenticado en Supabase");

      const asientosWithUser = asientos.map((asiento) => ({
        ...asiento,
        user_id: user.id,
      }));

      const { error } = await supabase
        .from("libro_contable")
        .insert(asientosWithUser);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["libro-contable"] });
      toast.success("Asientos importados exitosamente");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast.error("Error al importar: " + message);
    },
  });

  // ✅ Importar archivo Excel y enviar a Supabase
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // 💡 Tipado robusto del Excel
      const asientosToInsert = (
        jsonData as Record<string, unknown>[]
      ).map((row) => {
        // 📅 Convertir fecha Excel → ISO
        let fecha = row.FECHA;
        if (typeof fecha === "number") {
          const excelEpoch = new Date(1899, 11, 30);
          fecha = new Date(excelEpoch.getTime() + fecha * 86400000)
            .toISOString()
            .split("T")[0];
        } else if (fecha) {
          const parsedDate = new Date(fecha as string);
          fecha = isNaN(parsedDate.getTime())
            ? new Date().toISOString().split("T")[0]
            : parsedDate.toISOString().split("T")[0];
        } else {
          fecha = new Date().toISOString().split("T")[0];
        }

        return {
          numero_comprobante: (row["N. COMP"] as string) || (row["N COMP"] as string) || "",
          tipo_comprobante: (row["TIPO COMP"] as string) || "TRASPASO",
          fecha,
          mes: row.MES ? parseInt(String(row.MES)) || null : null,
          codigo_cuenta: (row.CODIGO as string) || "",
          cuenta_descripcion:
            (row["CTA DESCRIPCION"] as string) ||
            (row["CTA_DESCRIPCION"] as string) ||
            "",
          glosa: (row.GLOSA as string) || "",
          debe:
            parseFloat(String(row.DEBE || "0").replace(/,/g, "")) || 0,
          haber:
            parseFloat(String(row.HABER || "0").replace(/,/g, "")) || 0,
          control:
            parseFloat(String(row.CONTROL || "0").replace(/,/g, "")) || null,
          compensacion:
            parseFloat(String(row.COMPENSACION || "0").replace(/,/g, "")) ||
            null,
          tipo_documento: (row["TIPO DOC"] as string) || "",
          numero_documento: (row["N. DOC"] as string) || "",
          rut: (row.RUT as string) || "",
          nombre: (row.NOMBRE as string) || "",
        };
      });

      await insertAsientosMutation.mutateAsync(asientosToInsert as AsientoContable[]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error("Error al procesar archivo: " + message);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  // ✅ Exportar datos a Excel
  const handleExport = () => {
    if (!asientos || asientos.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      asientos.map((a) => ({
        "N. COMP": a.numero_comprobante,
        "TIPO COMP": a.tipo_comprobante,
        FECHA: a.fecha,
        CODIGO: a.codigo_cuenta,
        "CTA DESCRIPCION": a.cuenta_descripcion,
        GLOSA: a.glosa,
        DEBE: a.debe,
        HABER: a.haber,
        RUT: a.rut,
        NOMBRE: a.nombre,
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

  // ✅ Filtro de búsqueda
  const filteredAsientos = asientos.filter(
    (a) =>
      a.cuenta_descripcion
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      a.glosa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.rut?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(value);

  // ✅ Render del componente
  return (
    <Layout>
      <div className="space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Libro Mayor</h1>
            <p className="text-muted-foreground">
              Gestiona y visualiza todos tus asientos contables
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              id="file-upload"
            />

            <Button
              onClick={() =>
                document.getElementById("file-upload")?.click()
              }
              disabled={isUploading}
              variant="outline"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar Excel
                </>
              )}
            </Button>

            <Button
              onClick={handleExport}
              disabled={!asientos || asientos.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Buscador */}
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
                placeholder="Buscar asientos contables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card>
          <CardHeader>
            <CardTitle>Asientos Contables</CardTitle>
            <CardDescription>
              Total de asientos: {filteredAsientos?.length || 0}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredAsientos.length > 0 ? (
              <div className="overflow-x-auto">
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
                    {filteredAsientos.map((asiento) => (
                      <TableRow key={asiento.id}>
                        <TableCell>
                          {new Date(asiento.fecha).toLocaleDateString("es-CL")}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            {asiento.tipo_comprobante}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="font-medium text-sm">
                              {asiento.codigo_cuenta}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {asiento.cuenta_descripcion}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {asiento.glosa}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {asiento.debe > 0
                            ? formatCurrency(asiento.debe)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {asiento.haber > 0
                            ? formatCurrency(asiento.haber)
                            : "-"}
                        </TableCell>
                        <TableCell>{asiento.rut}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {asiento.nombre}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No hay asientos contables para mostrar
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Importa un archivo Excel para comenzar
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
