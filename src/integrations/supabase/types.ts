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
      chat_history: {
        Row: {
          created_at: string
          id: string
          message: string
          response: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          response: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          response?: string
          user_id?: string | null
        }
        Relationships: []
      }
      coes_demand_data: {
        Row: {
          created_at: string
          daily_forecast: number | null
          date: string
          demanda_mw: number | null
          executed_power: number | null
          id: string
          margen_reserva_porcentaje: number | null
          maximum_power: number | null
          potencia_efectiva_mw: number | null
          prog_diaria_mw: number | null
          prog_semanal_mw: number | null
          reserva_mw: number | null
          weekly_forecast: number | null
        }
        Insert: {
          created_at?: string
          daily_forecast?: number | null
          date: string
          demanda_mw?: number | null
          executed_power?: number | null
          id?: string
          margen_reserva_porcentaje?: number | null
          maximum_power?: number | null
          potencia_efectiva_mw?: number | null
          prog_diaria_mw?: number | null
          prog_semanal_mw?: number | null
          reserva_mw?: number | null
          weekly_forecast?: number | null
        }
        Update: {
          created_at?: string
          daily_forecast?: number | null
          date?: string
          demanda_mw?: number | null
          executed_power?: number | null
          id?: string
          margen_reserva_porcentaje?: number | null
          maximum_power?: number | null
          potencia_efectiva_mw?: number | null
          prog_diaria_mw?: number | null
          prog_semanal_mw?: number | null
          reserva_mw?: number | null
          weekly_forecast?: number | null
        }
        Relationships: []
      }
      daily_power_data: {
        Row: {
          created_at: string
          date: string
          id: string
          is_modulated: boolean | null
          max_power: number
          peak_hour: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_modulated?: boolean | null
          max_power: number
          peak_hour: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_modulated?: boolean | null
          max_power?: number
          peak_hour?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          deleted: boolean | null
          document_type: string
          file_path: string
          filename: string
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          deleted?: boolean | null
          document_type: string
          file_path: string
          filename: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          deleted?: boolean | null
          document_type?: string
          file_path?: string
          filename?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      energy_data: {
        Row: {
          created_at: string
          date: string
          executed_power: number
          forecasted_power: number
          id: string
          time: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          executed_power: number
          forecasted_power: number
          id?: string
          time: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          executed_power?: number
          forecasted_power?: number
          id?: string
          time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "energy_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activity: string | null
          business_name: string | null
          contact_name: string | null
          contract_expiration: string | null
          contracted_power: string | null
          corporate_email: string | null
          created_at: string
          electricity_provider: string | null
          email: string
          has_access: boolean
          id: string
          notice_period: string | null
          phone: string | null
          position: string | null
          profile: string | null
          role: Database["public"]["Enums"]["app_role"]
          ruc: string | null
          updated_at: string | null
        }
        Insert: {
          activity?: string | null
          business_name?: string | null
          contact_name?: string | null
          contract_expiration?: string | null
          contracted_power?: string | null
          corporate_email?: string | null
          created_at?: string
          electricity_provider?: string | null
          email: string
          has_access?: boolean
          id: string
          notice_period?: string | null
          phone?: string | null
          position?: string | null
          profile?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          ruc?: string | null
          updated_at?: string | null
        }
        Update: {
          activity?: string | null
          business_name?: string | null
          contact_name?: string | null
          contract_expiration?: string | null
          contracted_power?: string | null
          corporate_email?: string | null
          created_at?: string
          electricity_provider?: string | null
          email?: string
          has_access?: boolean
          id?: string
          notice_period?: string | null
          phone?: string | null
          position?: string | null
          profile?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          ruc?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      report_numbers: {
        Row: {
          created_at: string
          id: string
          month: number
          report_number: number
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          month: number
          report_number: number
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          month?: number
          report_number?: number
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      report_templates: {
        Row: {
          client_name: string | null
          code: string | null
          content: Json
          created_at: string
          id: string
          location: string | null
          name: string
          sections_enabled: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          client_name?: string | null
          code?: string | null
          content: Json
          created_at?: string
          id?: string
          location?: string | null
          name: string
          sections_enabled?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          client_name?: string | null
          code?: string | null
          content?: Json
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          sections_enabled?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "superuser" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
