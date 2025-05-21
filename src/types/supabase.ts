export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          code: string
          address: string | null
          phone: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          address?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      claims: {
        Row: {
          id: string
          claim_number: string
          client_id: string
          creation_date: string
          status: string
          department: string
          claim_category: string
          identified_cause: string | null
          installed: boolean
          installation_date: string | null
          installer_name: string | null
          invoice_link: string | null
          solution_amount: number
          claimed_amount: number
          saved_amount: number
          description: string | null
          product_category: string
          last_updated: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          claim_number: string
          client_id: string
          creation_date: string
          status: string
          department: string
          claim_category: string
          identified_cause?: string | null
          installed: boolean
          installation_date?: string | null
          installer_name?: string | null
          invoice_link?: string | null
          solution_amount: number
          claimed_amount: number
          saved_amount: number
          description?: string | null
          product_category: string
          last_updated: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          claim_number?: string
          client_id?: string
          creation_date?: string
          status?: string
          department?: string
          claim_category?: string
          identified_cause?: string | null
          installed?: boolean
          installation_date?: string | null
          installer_name?: string | null
          invoice_link?: string | null
          solution_amount?: number
          claimed_amount?: number
          saved_amount?: number
          description?: string | null
          product_category?: string
          last_updated?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
      }
      claim_products: {
        Row: {
          id: string
          claim_id: string
          description: string
          style: string
          color: string
          quantity: number
          price_per_sy: number
          total_price: number
          claimed_quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          claim_id: string
          description: string
          style: string
          color: string
          quantity: number
          price_per_sy: number
          total_price: number
          claimed_quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          claim_id?: string
          description?: string
          style?: string
          color?: string
          quantity?: number
          price_per_sy?: number
          total_price?: number
          claimed_quantity?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_products_claim_id_fkey"
            columns: ["claim_id"]
            referencedRelation: "claims"
            referencedColumns: ["id"]
          }
        ]
      }
      claim_documents: {
        Row: {
          id: string
          claim_id: string
          name: string
          type: string
          url: string
          upload_date: string
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          claim_id: string
          name: string
          type: string
          url: string
          upload_date: string
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          claim_id?: string
          name?: string
          type?: string
          url?: string
          upload_date?: string
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_documents_claim_id_fkey"
            columns: ["claim_id"]
            referencedRelation: "claims"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          code: string
          color: string
          color_number: string
          description: string
          format: string
          style: string
          style_number: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          color: string
          color_number: string
          description: string
          format: string
          style: string
          style_number: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          color?: string
          color_number?: string
          description?: string
          format?: string
          style?: string
          style_number?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          client_id: string
          invoice_date: string
          currency: string
          exchange_rate: number | null
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          client_id: string
          invoice_date: string
          currency: string
          exchange_rate?: number | null
          total_amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          client_id?: string
          invoice_date?: string
          currency?: string
          exchange_rate?: number | null
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          product_id: string
          shipping_code: string | null
          item_description: string
          unit_cost_price: number
          unit_selling_price: number
          quantity: number
          total_cost: number
          total_price: number
          total_profit: number
          profit_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          product_id: string
          shipping_code?: string | null
          item_description: string
          unit_cost_price: number
          unit_selling_price: number
          quantity: number
          total_cost: number
          total_price: number
          total_profit: number
          profit_percentage: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          product_id?: string
          shipping_code?: string | null
          item_description?: string
          unit_cost_price?: number
          unit_selling_price?: number
          quantity?: number
          total_cost?: number
          total_price?: number
          total_profit?: number
          profit_percentage?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
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