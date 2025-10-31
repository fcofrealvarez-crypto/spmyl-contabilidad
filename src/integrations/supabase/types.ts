export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      // 🔹 Tabla: Asientos contables
      asientos_contables: {
        Row: {
          codigo_cuenta: string
          compensacion: number | null
          control: number | null
          created_at: string
          cuenta_descripcion: string
          debe: number | null
          fecha: string
          glosa: string | null
          haber: number | null
          id: string
          mes: number | null
          nombre: string | null
          numero_comprobante: string | null
          numero_documento: string | null
          rut: string | null
          tipo_comprobante: string
          tipo_documento: string | null
          updated_at: string
          user_id: string
        }
        Insert: Omit<Database["public"]["Tables"]["asientos_contables"]["Row"], "id" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["asientos_contables"]["Row"]>
        Relationships: []
      }

      // 🔹 Tabla: Cuentas
      cuentas: {
        Row: {
          codigo: string
          created_at: string
          descripcion: string
          id: string
          tipo: string
        }
        Insert: Omit<Database["public"]["Tables"]["cuentas"]["Row"], "id" | "created_at">
        Update: Partial<Database["public"]["Tables"]["cuentas"]["Row"]>
        Relationships: []
      }

      // 🔹 Tabla: Transacciones contables
      transactions: {
        Row: {
          id: string
          type: "Ingreso" | "Gasto"
          category: string
          description: string
          amount: number
          date: string
          document?: string | null
          created_at?: string | null
        }
        Insert: {
          id?: string
          type: "Ingreso" | "Gasto"
          category: string
          description: string
          amount: number
          date: string
          document?: string | null
          created_at?: string | null
        }
        Update: Partial<{
          type: "Ingreso" | "Gasto"
          category: string
          description: string
          amount: number
          date: string
          document?: string | null
          created_at?: string | null
        }>
        Relationships: []
      }

      // 🔹 Tabla: Registros IVA (F29)
      iva_records: {
        Row: {
          id: string
          period: string
          debito: number
          credito: number
          pagar: number
          status: string
          date: string
          created_at?: string | null
        }
        Insert: {
          id?: string
          period: string
          debito: number
          credito: number
          pagar: number
          status: string
          date: string
          created_at?: string | null
        }
        Update: Partial<{
          period: string
          debito: number
          credito: number
          pagar: number
          status: string
          date: string
          created_at?: string | null
        }>
        Relationships: []
      }

      // ✅ NUEVA TABLA: Soporte (para solicitudes de informes)
      soporte: {
        Row: {
          id: string
          nombre: string
          email: string
          mensaje: string
          fecha: string
          created_at?: string | null
        }
        Insert: {
          id?: string
          nombre: string
          email: string
          mensaje: string
          fecha: string
          created_at?: string | null
        }
        Update: Partial<{
          nombre: string
          email: string
          mensaje: string
          fecha: string
          created_at?: string | null
        }>
        Relationships: []
      }
    }

    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

// 🔹 Helpers generados por Supabase CLI
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends { Row: infer R }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends { Row: infer R }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Insert: infer I }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Insert: infer I }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Update: infer U }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Update: infer U }
      ? U
      : never
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
