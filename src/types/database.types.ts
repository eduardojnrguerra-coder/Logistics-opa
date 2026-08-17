export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string
          id: string
          message: string | null
          severity: string
          status: string
          type: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          severity: string
          status?: string
          type: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          severity?: string
          status?: string
          type?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_settings: {
        Row: {
          business_name: string
          contact_email: string | null
          contact_phone: string | null
          currency_code: string
          id: number
          invoice_notes_default: string | null
          locale: string
          logo_url: string | null
          primary_color: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          business_name: string
          contact_email?: string | null
          contact_phone?: string | null
          currency_code?: string
          id?: number
          invoice_notes_default?: string | null
          locale?: string
          logo_url?: string | null
          primary_color?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          business_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          currency_code?: string
          id?: number
          invoice_notes_default?: string | null
          locale?: string
          logo_url?: string | null
          primary_color?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      customer_messages: {
        Row: {
          body: string
          created_at: string
          customer_id: string
          id: string
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          body: string
          created_at?: string
          customer_id: string
          id?: string
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          body?: string
          created_at?: string
          customer_id?: string
          id?: string
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_messages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_users: {
        Row: {
          created_at: string
          customer_id: string
          email: string
          full_name: string
          id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          email: string
          full_name: string
          id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          email?: string
          full_name?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_users_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          contact_name: string | null
          created_at: string
          customer_type: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          risk_level: string | null
          status: string
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          customer_type?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          risk_level?: string | null
          status?: string
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          customer_type?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          risk_level?: string | null
          status?: string
        }
        Relationships: []
      }
      drivers: {
        Row: {
          assigned_vehicle_id: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          status: string
        }
        Insert: {
          assigned_vehicle_id?: string | null
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          status?: string
        }
        Update: {
          assigned_vehicle_id?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_assigned_vehicle_id_fkey"
            columns: ["assigned_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_id: string
          due_date: string | null
          id: string
          job_id: string | null
          paid_at: string | null
          status: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          customer_id: string
          due_date?: string | null
          id?: string
          job_id?: string | null
          paid_at?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_id?: string
          due_date?: string | null
          id?: string
          job_id?: string | null
          paid_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          assigned_driver_id: string | null
          assigned_vehicle_id: string | null
          created_at: string
          customer_id: string
          delivered_at: string | null
          dropoff_address: string | null
          id: string
          pickup_address: string | null
          pod_notes: string | null
          pod_photo_url: string | null
          pod_signature_url: string | null
          priority: string | null
          scheduled_at: string | null
          status: string
        }
        Insert: {
          assigned_driver_id?: string | null
          assigned_vehicle_id?: string | null
          created_at?: string
          customer_id: string
          delivered_at?: string | null
          dropoff_address?: string | null
          id?: string
          pickup_address?: string | null
          pod_notes?: string | null
          pod_photo_url?: string | null
          pod_signature_url?: string | null
          priority?: string | null
          scheduled_at?: string | null
          status?: string
        }
        Update: {
          assigned_driver_id?: string | null
          assigned_vehicle_id?: string | null
          created_at?: string
          customer_id?: string
          delivered_at?: string | null
          dropoff_address?: string | null
          id?: string
          pickup_address?: string | null
          pod_notes?: string | null
          pod_photo_url?: string | null
          pod_signature_url?: string | null
          priority?: string | null
          scheduled_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_assigned_vehicle_id_fkey"
            columns: ["assigned_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_records: {
        Row: {
          completed_at: string | null
          cost: number | null
          created_at: string
          id: string
          notes: string | null
          scheduled_at: string | null
          status: string
          type: string
          vehicle_id: string
        }
        Insert: {
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_at?: string | null
          status?: string
          type: string
          vehicle_id: string
        }
        Update: {
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_at?: string | null
          status?: string
          type?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          driver_id: string | null
          email: string
          full_name: string
          id: string
          role: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          driver_id?: string | null
          email: string
          full_name: string
          id: string
          role: string
        }
        Update: {
          active?: boolean
          created_at?: string
          driver_id?: string | null
          email?: string
          full_name?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_driver_fk"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_id: string
          id: string
          status: string
          valid_until: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          customer_id: string
          id?: string
          status?: string
          valid_until?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_id?: string
          id?: string
          status?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_provider_status: {
        Row: {
          last_synced_at: string | null
          provider: string
          status: string
          vehicles_linked_count: number | null
        }
        Insert: {
          last_synced_at?: string | null
          provider: string
          status?: string
          vehicles_linked_count?: number | null
        }
        Update: {
          last_synced_at?: string | null
          provider?: string
          status?: string
          vehicles_linked_count?: number | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          created_at: string
          id: string
          name: string | null
          registration: string
          status: string
          tracking_external_id: string | null
          tracking_provider: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          registration: string
          status?: string
          tracking_external_id?: string | null
          tracking_provider?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          registration?: string
          status?: string
          tracking_external_id?: string | null
          tracking_provider?: string | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_customer_id: { Args: never; Returns: string }
      current_driver_id: { Args: never; Returns: string }
      current_role: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

