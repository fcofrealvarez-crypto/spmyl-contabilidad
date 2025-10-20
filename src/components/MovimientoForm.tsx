import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MovimientoForm({ onAdd }: { onAdd: () => void }) {
  const [tipo, setTipo] = useState("ingreso");
  const [categoria, setCategoria] = useState("");
  const [monto, setMonto] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!categoria || !monto) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Debe iniciar sesión para agregar movimientos.");
    return;
  }

  const { error } = await supabase.from("movimientos").insert([
    {
      tipo,
      categoria,
      monto: Number(monto),
      usuario_id: user.id, // 🔹 vincula el movimiento al usuario logueado
    },
  ]);

  if (!error) {
    setCategoria("");
    setMonto("");
    onAdd();
  } else {
    console.error(error.message);
  }
};


  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-sm font-medium">Tipo</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="border p-2 rounded w-40"
        >
          <option value="ingreso">Ingreso</option>
          <option value="gasto">Gasto</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Categoría</label>
        <input
          type="text"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="border p-2 rounded w-60"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Monto</label>
        <input
          type="number"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="border p-2 rounded w-40"
        />
      </div>

      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Agregar
      </button>
    </form>
  );
}
