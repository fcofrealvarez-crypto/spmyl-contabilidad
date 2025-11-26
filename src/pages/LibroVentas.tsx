import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Search, Filter } from "lucide-react";
import * as XLSX from "xlsx";

interface Sale {
    id: string;
    issue_date: string | null;
    customer_name: string;
    customer_rut: string;
    document_type: string;
    folio: string | null;
    net_amount: number;
    iva_amount: number;
    total_amount: number;
}

export default function LibroVentas() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("sales_book")
                .select("*")
                .order("issue_date", { ascending: false });

            if (error) throw error;
            setSales(data || []);
        } catch (error) {
            console.error("Error fetching sales:", error);
            toast.error("Error al cargar el Libro de Ventas");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
        }).format(amount);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("es-CL");
    };

    const filteredSales = sales.filter((s) =>
        s.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.customer_rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.folio && s.folio.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(
            sales.map((s) => ({
                Fecha: formatDate(s.issue_date),
                RUT: s.customer_rut,
                Cliente: s.customer_name,
                Tipo: s.document_type,
                Folio: s.folio,
                Neto: s.net_amount,
                IVA: s.iva_amount,
                Total: s.total_amount,
            }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Libro Ventas");
        XLSX.writeFile(wb, "Libro_Ventas.xlsx");
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Libro de Ventas</h1>
                        <p className="text-muted-foreground">
                            Registro detallado de facturas y documentos de venta
                        </p>
                    </div>
                    <Button onClick={exportToExcel} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Excel
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Ventas Registradas</CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar cliente o folio..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 w-[250px]"
                                    />
                                </div>
                                <Button variant="outline" size="icon">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>RUT</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Tipo Doc</TableHead>
                                        <TableHead>Folio</TableHead>
                                        <TableHead className="text-right">Neto</TableHead>
                                        <TableHead className="text-right">IVA</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center h-24">
                                                Cargando registros...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredSales.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center h-24">
                                                No se encontraron registros
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredSales.map((sale) => (
                                            <TableRow key={sale.id}>
                                                <TableCell>{formatDate(sale.issue_date)}</TableCell>
                                                <TableCell>{sale.customer_rut}</TableCell>
                                                <TableCell className="font-medium">
                                                    {sale.customer_name}
                                                </TableCell>
                                                <TableCell>{sale.document_type}</TableCell>
                                                <TableCell>{sale.folio || "-"}</TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(sale.net_amount)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(sale.iva_amount)}
                                                </TableCell>
                                                <TableCell className="text-right font-bold">
                                                    {formatCurrency(sale.total_amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground">
                            Mostrando {filteredSales.length} registros
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
