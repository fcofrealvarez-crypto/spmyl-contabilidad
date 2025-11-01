import React, { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function ImportarExcel() {
  const [file, setFile] = useState<File | null>(null);
  const [table, setTable] = useState<string>("libro_compras");
  const [loading, setLoading] = useState<boolean>(false);

  const handleImport = async () => {
    if (!file) {
      toast.error("Selecciona un archivo Excel antes de importar");
      return;
    }

    setLoading(true);

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        // 📘 Leer el archivo Excel
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // 📄 Tomar la primera hoja
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (!sheet || sheet.length === 0) {
          toast.error("El archivo Excel está vacío o mal formateado");
          setLoading(false);
          return;
        }

        // 🔹 Convertir a estructura JSON compatible con Supabase
        const sheetData = sheet as Record<string, unknown>[];

        // 📤 Subir datos a Supabase (con tipado seguro)
        const { error } = await (supabase as unknown as {
          from: (table: string) => {
            insert: (
              data: Record<string, unknown>[]
            ) => Promise<{ error: { message: string } | null }>;
          };
        })
          .from(table)
          .insert(sheetData);

        if (error) {
          console.error("Error Supabase:", error);
          toast.error(`❌ Error al importar: ${error.message}`);
        } else {
          toast.success(`✅ Datos importados correctamente en "${table}"`);
        }
      } catch (err) {
        console.error("Error al procesar archivo:", err);
        toast.error("❌ Error inesperado al leer el archivo Excel");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <Card className="p-6 space-y-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">📤 Importar Archivos Excel</h1>

      {/* 🔹 Seleccionar tabla destino */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Selecciona la tabla de destino:
        </label>
        <select
          value={table}
          onChange={(e) => setTable(e.target.value)}
          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
        >
          <option value="libro_compras">📘 Libro de Compras</option>
          <option value="libro_ventas">📗 Libro de Ventas</option>
          <option value="libro_contable">📙 Libro Contable</option>
          <option value="resumen_contable">📒 Resumen Contable</option>
        </select>
      </div>

      {/* 🔹 Subir archivo Excel */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Selecciona el archivo Excel:
        </label>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full border rounded-lg p-2"
        />
      </div>

      {/* 🔹 Botón de acción */}
      <Button
        onClick={handleImport}
        className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        disabled={loading}
      >
        {loading ? "Subiendo..." : "Subir Archivo"}
      </Button>
    </Card>
  );
}
