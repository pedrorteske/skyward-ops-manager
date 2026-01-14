export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          cnpj: string | null
          commercial_email: string | null
          company_id: string
          contact_person: string | null
          country: string | null
          cpf: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          observations: string | null
          operator: string | null
          phone: string | null
          status: string
          type: Database["public"]["Enums"]["client_type"]
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          commercial_email?: string | null
          company_id: string
          contact_person?: string | null
          country?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          observations?: string | null
          operator?: string | null
          phone?: string | null
          status?: string
          type: Database["public"]["Enums"]["client_type"]
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          commercial_email?: string | null
          company_id?: string
          contact_person?: string | null
          country?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          observations?: string | null
          operator?: string | null
          phone?: string | null
          status?: string
          type?: Database["public"]["Enums"]["client_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          cnpj: string | null
          created_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_documents: {
        Row: {
          client_id: string
          company_id: string
          created_at: string
          currency: Database["public"]["Enums"]["currency"]
          due_date: string | null
          flight_id: string | null
          id: string
          issue_date: string
          items: Json
          number: string
          observations: string | null
          payment_terms: string | null
          status: Database["public"]["Enums"]["financial_document_status"]
          subtotal: number
          taxes: number
          total: number
          type: Database["public"]["Enums"]["financial_document_type"]
          updated_at: string
        }
        Insert: {
          client_id: string
          company_id: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          due_date?: string | null
          flight_id?: string | null
          id?: string
          issue_date?: string
          items?: Json
          number: string
          observations?: string | null
          payment_terms?: string | null
          status?: Database["public"]["Enums"]["financial_document_status"]
          subtotal?: number
          taxes?: number
          total?: number
          type: Database["public"]["Enums"]["financial_document_type"]
          updated_at?: string
        }
        Update: {
          client_id?: string
          company_id?: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          due_date?: string | null
          flight_id?: string | null
          id?: string
          issue_date?: string
          items?: Json
          number?: string
          observations?: string | null
          payment_terms?: string | null
          status?: Database["public"]["Enums"]["financial_document_status"]
          subtotal?: number
          taxes?: number
          total?: number
          type?: Database["public"]["Enums"]["financial_document_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_documents_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
        ]
      }
      flights: {
        Row: {
          aircraft_model: string
          aircraft_prefix: string
          arrival_date: string
          arrival_time: string
          base: string | null
          company_id: string
          created_at: string
          departure_date: string
          departure_time: string
          destination: string
          flight_type: Database["public"]["Enums"]["flight_type"]
          id: string
          observations: string | null
          origin: string
          status: Database["public"]["Enums"]["flight_status"]
          updated_at: string
        }
        Insert: {
          aircraft_model: string
          aircraft_prefix: string
          arrival_date: string
          arrival_time: string
          base?: string | null
          company_id: string
          created_at?: string
          departure_date: string
          departure_time: string
          destination: string
          flight_type?: Database["public"]["Enums"]["flight_type"]
          id?: string
          observations?: string | null
          origin: string
          status?: Database["public"]["Enums"]["flight_status"]
          updated_at?: string
        }
        Update: {
          aircraft_model?: string
          aircraft_prefix?: string
          arrival_date?: string
          arrival_time?: string
          base?: string | null
          company_id?: string
          created_at?: string
          departure_date?: string
          departure_time?: string
          destination?: string
          flight_type?: Database["public"]["Enums"]["flight_type"]
          id?: string
          observations?: string | null
          origin?: string
          status?: Database["public"]["Enums"]["flight_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flights_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          client_id: string
          company_id: string
          created_at: string
          currency: Database["public"]["Enums"]["currency"]
          flight_id: string | null
          id: string
          items: Json
          number: string
          observations: string | null
          status: Database["public"]["Enums"]["quotation_status"]
          subtotal: number
          total: number
          updated_at: string
          valid_until: string
        }
        Insert: {
          client_id: string
          company_id: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          flight_id?: string | null
          id?: string
          items?: Json
          number: string
          observations?: string | null
          status?: Database["public"]["Enums"]["quotation_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          valid_until: string
        }
        Update: {
          client_id?: string
          company_id?: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          flight_id?: string | null
          id?: string
          items?: Json
          number?: string
          observations?: string | null
          status?: Database["public"]["Enums"]["quotation_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "operational" | "commercial"
      client_type: "PF" | "PJ" | "INT"
      currency: "BRL" | "USD"
      financial_document_status:
        | "draft"
        | "sent"
        | "approved"
        | "rejected"
        | "paid"
        | "cancelled"
      financial_document_type: "quotation" | "proforma" | "invoice"
      flight_status:
        | "scheduled"
        | "arrived"
        | "departed"
        | "cancelled"
        | "delayed"
      flight_type: "S" | "N" | "G" | "M"
      quotation_status: "created" | "sent" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "operational", "commercial"],
      client_type: ["PF", "PJ", "INT"],
      currency: ["BRL", "USD"],
      financial_document_status: [
        "draft",
        "sent",
        "approved",
        "rejected",
        "paid",
        "cancelled",
      ],
      financial_document_type: ["quotation", "proforma", "invoice"],
      flight_status: [
        "scheduled",
        "arrived",
        "departed",
        "cancelled",
        "delayed",
      ],
      flight_type: ["S", "N", "G", "M"],
      quotation_status: ["created", "sent", "approved", "rejected"],
    },
  },
} as const
