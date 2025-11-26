export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          rut: string | null
          address: string | null
          phone: string | null
          email: string | null
          website: string | null
          logo_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          rut?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          rut?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_members: {
        Row: {
          id: string
          company_id: string
          user_id: string
          role: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          role?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          role?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      chart_of_accounts: {
        Row: {
          id: string
          company_id: string
          code: string
          name: string
          account_type: string
          parent_code: string | null
          level: number
          is_detail: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          code: string
          name: string
          account_type: string
          parent_code?: string | null
          level?: number
          is_detail?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          code?: string
          name?: string
          account_type?: string
          parent_code?: string | null
          level?: number
          is_detail?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      journal_entries: {
        Row: {
          id: string
          company_id: string
          entry_number: string
          entry_type: string
          entry_date: string
          month: number
          year: number
          description: string | null
          gloss: string | null
          document_type: string | null
          document_number: string | null
          status: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          entry_number: string
          entry_type: string
          entry_date: string
          month: number
          year: number
          description?: string | null
          gloss?: string | null
          document_type?: string | null
          document_number?: string | null
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          entry_number?: string
          entry_type?: string
          entry_date?: string
          month?: number
          year?: number
          description?: string | null
          gloss?: string | null
          document_type?: string | null
          document_number?: string | null
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      journal_entry_lines: {
        Row: {
          id: string
          journal_entry_id: string
          account_code: string
          account_name: string
          debit: number
          credit: number
          control: number | null
          compensation: number | null
          third_party_rut: string | null
          third_party_name: string | null
          line_order: number
          created_at: string
        }
        Insert: {
          id?: string
          journal_entry_id: string
          account_code: string
          account_name: string
          debit?: number
          credit?: number
          control?: number | null
          compensation?: number | null
          third_party_rut?: string | null
          third_party_name?: string | null
          line_order: number
          created_at?: string
        }
        Update: {
          id?: string
          journal_entry_id?: string
          account_code?: string
          account_name?: string
          debit?: number
          credit?: number
          control?: number | null
          compensation?: number | null
          third_party_rut?: string | null
          third_party_name?: string | null
          line_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          }
        ]
      }
      purchase_book: {
        Row: {
          id: string
          company_id: string
          month: number
          year: number
          line_number: number
          document_type: string
          purchase_type: string
          supplier_rut: string
          supplier_name: string
          folio: string | null
          document_date: string | null
          reception_date: string | null
          acknowledgment_date: string | null
          exempt_amount: number
          net_amount: number
          iva_amount: number
          fixed_asset_amount: number
          non_recoverable_iva: number
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          month: number
          year: number
          line_number: number
          document_type: string
          purchase_type: string
          supplier_rut: string
          supplier_name: string
          folio?: string | null
          document_date?: string | null
          reception_date?: string | null
          acknowledgment_date?: string | null
          exempt_amount?: number
          net_amount?: number
          iva_amount?: number
          fixed_asset_amount?: number
          non_recoverable_iva?: number
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          month?: number
          year?: number
          line_number?: number
          document_type?: string
          purchase_type?: string
          supplier_rut?: string
          supplier_name?: string
          folio?: string | null
          document_date?: string | null
          reception_date?: string | null
          acknowledgment_date?: string | null
          exempt_amount?: number
          net_amount?: number
          iva_amount?: number
          fixed_asset_amount?: number
          non_recoverable_iva?: number
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_book_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      sales_book: {
        Row: {
          id: string
          company_id: string
          month: number
          year: number
          line_number: number
          document_type: string
          sale_type: string
          customer_rut: string
          customer_name: string
          folio: string | null
          issue_date: string | null
          exempt_amount: number
          net_amount: number
          iva_amount: number
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          month: number
          year: number
          line_number: number
          document_type: string
          sale_type: string
          customer_rut: string
          customer_name: string
          folio?: string | null
          issue_date?: string | null
          exempt_amount?: number
          net_amount?: number
          iva_amount?: number
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          month?: number
          year?: number
          line_number?: number
          document_type?: string
          sale_type?: string
          customer_rut?: string
          customer_name?: string
          folio?: string | null
          issue_date?: string | null
          exempt_amount?: number
          net_amount?: number
          iva_amount?: number
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_book_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
