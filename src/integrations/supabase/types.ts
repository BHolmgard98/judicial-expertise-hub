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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      pericias: {
        Row: {
          cidade: string | null
          created_at: string | null
          data_entrega: string | null
          data_esclarecimento: string | null
          data_nomeacao: string
          data_pericia_agendada: string | null
          data_prazo: string | null
          data_recebimento: string | null
          deslocamento: string | null
          email_reclamada: string | null
          email_reclamante: string | null
          endereco: string | null
          estacao: string | null
          funcao: string | null
          honorarios: number | null
          horario: string | null
          id: string
          linha_cor: string | null
          linha_numero: string | null
          link_processo: string | null
          nr15: number[] | null
          nr16: number[] | null
          numero: number | null
          numero_processo: string
          observacoes: string | null
          perito: string
          prazo_esclarecimento: string | null
          requerente: string
          requerido: string
          status: Database["public"]["Enums"]["pericia_status"] | null
          updated_at: string | null
          user_id: string | null
          valor_causa: number | null
          valor_recebimento: number | null
          vara: string
        }
        Insert: {
          cidade?: string | null
          created_at?: string | null
          data_entrega?: string | null
          data_esclarecimento?: string | null
          data_nomeacao: string
          data_pericia_agendada?: string | null
          data_prazo?: string | null
          data_recebimento?: string | null
          deslocamento?: string | null
          email_reclamada?: string | null
          email_reclamante?: string | null
          endereco?: string | null
          estacao?: string | null
          funcao?: string | null
          honorarios?: number | null
          horario?: string | null
          id?: string
          linha_cor?: string | null
          linha_numero?: string | null
          link_processo?: string | null
          nr15?: number[] | null
          nr16?: number[] | null
          numero?: number | null
          numero_processo: string
          observacoes?: string | null
          perito: string
          prazo_esclarecimento?: string | null
          requerente: string
          requerido: string
          status?: Database["public"]["Enums"]["pericia_status"] | null
          updated_at?: string | null
          user_id?: string | null
          valor_causa?: number | null
          valor_recebimento?: number | null
          vara: string
        }
        Update: {
          cidade?: string | null
          created_at?: string | null
          data_entrega?: string | null
          data_esclarecimento?: string | null
          data_nomeacao?: string
          data_pericia_agendada?: string | null
          data_prazo?: string | null
          data_recebimento?: string | null
          deslocamento?: string | null
          email_reclamada?: string | null
          email_reclamante?: string | null
          endereco?: string | null
          estacao?: string | null
          funcao?: string | null
          honorarios?: number | null
          horario?: string | null
          id?: string
          linha_cor?: string | null
          linha_numero?: string | null
          link_processo?: string | null
          nr15?: number[] | null
          nr16?: number[] | null
          numero?: number | null
          numero_processo?: string
          observacoes?: string | null
          perito?: string
          prazo_esclarecimento?: string | null
          requerente?: string
          requerido?: string
          status?: Database["public"]["Enums"]["pericia_status"] | null
          updated_at?: string | null
          user_id?: string | null
          valor_causa?: number | null
          valor_recebimento?: number | null
          vara?: string
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
      pericia_status:
        | "Aguardando"
        | "Em andamento"
        | "Suspensa"
        | "Concluída"
        | "Arquivada"
        | "FINALIZADO EM ACORDO ANTES DA PERÍCIA"
        | "AGENDAR PERÍCIA"
        | "AGUARDANDO PERÍCIA"
        | "AGUARDANDO LAUDO"
        | "AGUARDANDO ESCLARECIMENTOS"
        | "LAUDO/ESCLARECIMENTOS ENTREGUES"
        | "SENTENÇA"
        | "RECURSO ORDINÁRIO"
        | "ACORDO APÓS REALIZAÇÃO DA PERÍCIA"
        | "CERTIDÃO DE TRÂNSITO EM JULGADO"
        | "SOLICITAÇÃO DE PAGAMENTO DE HONORÁRIOS"
        | "HONORÁRIOS RECEBIDOS"
        | "REFAZER A PERÍCIA - ORDEM JUDICIAL"
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
      pericia_status: [
        "Aguardando",
        "Em andamento",
        "Suspensa",
        "Concluída",
        "Arquivada",
        "FINALIZADO EM ACORDO ANTES DA PERÍCIA",
        "AGENDAR PERÍCIA",
        "AGUARDANDO PERÍCIA",
        "AGUARDANDO LAUDO",
        "AGUARDANDO ESCLARECIMENTOS",
        "LAUDO/ESCLARECIMENTOS ENTREGUES",
        "SENTENÇA",
        "RECURSO ORDINÁRIO",
        "ACORDO APÓS REALIZAÇÃO DA PERÍCIA",
        "CERTIDÃO DE TRÂNSITO EM JULGADO",
        "SOLICITAÇÃO DE PAGAMENTO DE HONORÁRIOS",
        "HONORÁRIOS RECEBIDOS",
        "REFAZER A PERÍCIA - ORDEM JUDICIAL",
      ],
    },
  },
} as const
