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

interface Purchase {
    id: string;
    document_date: string | null;
    supplier_name: string;
    supplier_rut: string;
    document_type: string;
    folio: string | null;
    net_amount: number;
    iva_amount: number;
    total_amount: number;
}

export default function LibroCompras() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("purchase_book")
                .select("*")
                .order("document_date", { ascending: false });

            if (error) throw error;
            setPurchases(data || []);
        } catch (error) {
            console.error("Error fetching purchases:", error);
            toast.error("Error al cargar el Libro de Compras");
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

    const filteredPurchases = purchases.filter((p) =>
        p.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.supplier_rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.folio && p.folio.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(
            purchases.map((p) => ({
                Fecha: formatDate(p.document_date),
                RUT: p.supplier_rut,
                Proveedor: p.supplier_name,
                Tipo: p.document_type,
                Folio: p.folio,
                Neto: p.net_amount,
                IVA: p.iva_amount,
                Total: p.total_amount,
            }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Libro Compras");
        XLSX.writeFile(wb, "Libro_Compras.xlsx");
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Libro de Compras</h1>
                        <p className="text-muted-foreground">
                            Registro detallado de facturas y documentos de compra
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
                            <CardTitle>Movimientos Registrados</CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar proveedor o folio..."
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
                                        <TableHead>Proveedor</TableHead>
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
                                    ) : filteredPurchases.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center h-24">
                                                No se encontraron registros
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPurchases.map((purchase) => (
                                            <TableRow key={purchase.id}>
                                                <TableCell>{formatDate(purchase.document_date)}</TableCell>
                                                <TableCell>{purchase.supplier_rut}</TableCell>
                                                <TableCell className="font-medium">
                                                    {purchase.supplier_name}
                                                </TableCell>
                                                <TableCell>{purchase.document_type}</TableCell>
                                                <TableCell>{purchase.folio || "-"}</TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(purchase.net_amount)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(purchase.iva_amount)}
                                                </TableCell>
                                                <TableCell className="text-right font-bold">
                                                    {formatCurrency(purchase.total_amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground">
                            Mostrando {filteredPurchases.length} registros
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
