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
      coes_forecast: {
        Row: {
          created_at: string
          ejecutado: number | null
          fecha: string
          id: string
          pronostico: number | null
          rango_inferior: number | null
          rango_superior: number | null
          reprogramado: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          ejecutado?: number | null
          fecha: string
          id?: string
          pronostico?: number | null
          rango_inferior?: number | null
          rango_superior?: number | null
          reprogramado?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          ejecutado?: number | null
          fecha?: string
          id?: string
          pronostico?: number | null
          rango_inferior?: number | null
          rango_superior?: number | null
          reprogramado?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      coes_historical: {
        Row: {
          created_at: string | null
          demanda_programada: number | null
          ejecutado: number | null
          error_porcentual: number | null
          fecha: string
          id: string
          prog_semanal: number | null
          reprogramacion_diaria: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          demanda_programada?: number | null
          ejecutado?: number | null
          error_porcentual?: number | null
          fecha: string
          id?: string
          prog_semanal?: number | null
          reprogramacion_diaria?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          demanda_programada?: number | null
          ejecutado?: number | null
          error_porcentual?: number | null
          fecha?: string
          id?: string
          prog_semanal?: number | null
          reprogramacion_diaria?: number | null
          updated_at?: string | null
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
      daily_tab: {
        Row: {
          created_at: string | null
          "Demanda Real (MW)": number | null
          hora: string
          id: string
          "Prog. Demanda (MW)": number | null
          "Rango Inferior (MW)": number | null
          "Rango Superior (MW)": number | null
          "Reprogramación (MW)": number | null
        }
        Insert: {
          created_at?: string | null
          "Demanda Real (MW)"?: number | null
          hora: string
          id?: string
          "Prog. Demanda (MW)"?: number | null
          "Rango Inferior (MW)"?: number | null
          "Rango Superior (MW)"?: number | null
          "Reprogramación (MW)"?: number | null
        }
        Update: {
          created_at?: string | null
          "Demanda Real (MW)"?: number | null
          hora?: string
          id?: string
          "Prog. Demanda (MW)"?: number | null
          "Rango Inferior (MW)"?: number | null
          "Rango Superior (MW)"?: number | null
          "Reprogramación (MW)"?: number | null
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
      forecast_data: {
        Row: {
          created_at: string | null
          daily_forecast: number | null
          date: string | null
          demand_real: number | null
          id: string
          weekly_forecast: number | null
        }
        Insert: {
          created_at?: string | null
          daily_forecast?: number | null
          date?: string | null
          demand_real?: number | null
          id?: string
          weekly_forecast?: number | null
        }
        Update: {
          created_at?: string | null
          daily_forecast?: number | null
          date?: string | null
          demand_real?: number | null
          id?: string
          weekly_forecast?: number | null
        }
        Relationships: []
      }
      forecast_settings: {
        Row: {
          id: string
          last_update: string | null
          modulation_time: string | null
          risk_level: string | null
        }
        Insert: {
          id?: string
          last_update?: string | null
          modulation_time?: string | null
          risk_level?: string | null
        }
        Update: {
          id?: string
          last_update?: string | null
          modulation_time?: string | null
          risk_level?: string | null
        }
        Relationships: []
      }
      historical_demand: {
        Row: {
          created_at: string
          daily_schedule: number | null
          date: string
          executed_power: number | null
          id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          daily_schedule?: number | null
          date: string
          executed_power?: number | null
          id?: never
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          daily_schedule?: number | null
          date?: string
          executed_power?: number | null
          id?: never
          updated_at?: string | null
        }
        Relationships: []
      }
      modulation_data: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          is_modulated: boolean | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          is_modulated?: boolean | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          is_modulated?: boolean | null
        }
        Relationships: []
      }
      modulation_days: {
        Row: {
          created_at: string | null
          date: string
          id: string
          is_modulated: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          is_modulated?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          is_modulated?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      modulation_tab: {
        Row: {
          date: string
          id: number
          modulated: string | null
        }
        Insert: {
          date: string
          id?: number
          modulated?: string | null
        }
        Update: {
          date?: string
          id?: number
          modulated?: string | null
        }
        Relationships: []
      }
      monthly_forecast: {
        Row: {
          created_at: string | null
          demanda_real: number | null
          fecha: string
          id: number
          programacion_diaria: number | null
          programacion_semanal: number | null
        }
        Insert: {
          created_at?: string | null
          demanda_real?: number | null
          fecha: string
          id?: number
          programacion_diaria?: number | null
          programacion_semanal?: number | null
        }
        Update: {
          created_at?: string | null
          demanda_real?: number | null
          fecha?: string
          id?: number
          programacion_diaria?: number | null
          programacion_semanal?: number | null
        }
        Relationships: []
      }
      peak_power: {
        Row: {
          created_at: string
          date: string
          id: number
          is_modulated: boolean | null
          max_power: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: never
          is_modulated?: boolean | null
          max_power: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: never
          is_modulated?: boolean | null
          max_power?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      power_peaks: {
        Row: {
          created_at: string
          date: string
          id: string
          is_modulated: boolean | null
          peak_time: string
          peak_value: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_modulated?: boolean | null
          peak_time: string
          peak_value: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_modulated?: boolean | null
          peak_time?: string
          peak_value?: number
          updated_at?: string | null
        }
        Relationships: []
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
      tickets: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_accounts: {
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
          profile_image: string | null
          role: string
          ruc: string | null
          updated_at: string
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
          profile_image?: string | null
          role?: string
          ruc?: string | null
          updated_at?: string
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
          profile_image?: string | null
          role?: string
          ruc?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          activity: string | null
          address: string | null
          company_name: string | null
          contract_expiration: string | null
          contracted_power: string | null
          created_at: string | null
          department: string | null
          electric_supplier: string | null
          email: string
          id: string
          name: string | null
          notice_period: string | null
          password: string | null
          permissions: Json | null
          phone: string | null
          role: string | null
          ruc: string | null
        }
        Insert: {
          activity?: string | null
          address?: string | null
          company_name?: string | null
          contract_expiration?: string | null
          contracted_power?: string | null
          created_at?: string | null
          department?: string | null
          electric_supplier?: string | null
          email: string
          id?: string
          name?: string | null
          notice_period?: string | null
          password?: string | null
          permissions?: Json | null
          phone?: string | null
          role?: string | null
          ruc?: string | null
        }
        Update: {
          activity?: string | null
          address?: string | null
          company_name?: string | null
          contract_expiration?: string | null
          contracted_power?: string | null
          created_at?: string | null
          department?: string | null
          electric_supplier?: string | null
          email?: string
          id?: string
          name?: string | null
          notice_period?: string | null
          password?: string | null
          permissions?: Json | null
          phone?: string | null
          role?: string | null
          ruc?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clear_monthly_forecast: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      load_monthly_forecast: {
        Args: {
          p_fecha: string
          p_demanda_real: number
          p_programacion_diaria: number
          p_programacion_semanal: number
        }
        Returns: undefined
      }
      truncate_monthly_forecast: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "superuser" | "user"
      modulation_state: "modulado" | "no_modulado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["superuser", "user"],
      modulation_state: ["modulado", "no_modulado"],
    },
  },
} as const
