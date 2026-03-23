// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      faturamento_plano: {
        Row: {
          co_participacao: number | null
          created_at: string
          data_finalizacao: string | null
          face: string | null
          id: string
          matricula: string | null
          nome_paciente: string
          plano: string | null
          procedimento_codigo: string | null
          regiao: string | null
          repasse: number | null
        }
        Insert: {
          co_participacao?: number | null
          created_at?: string
          data_finalizacao?: string | null
          face?: string | null
          id?: string
          matricula?: string | null
          nome_paciente: string
          plano?: string | null
          procedimento_codigo?: string | null
          regiao?: string | null
          repasse?: number | null
        }
        Update: {
          co_participacao?: number | null
          created_at?: string
          data_finalizacao?: string | null
          face?: string | null
          id?: string
          matricula?: string | null
          nome_paciente?: string
          plano?: string | null
          procedimento_codigo?: string | null
          regiao?: string | null
          repasse?: number | null
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          codigo: string | null
          created_at: string
          id: string
          nome: string
          prestador: string | null
          telefone: string | null
        }
        Insert: {
          codigo?: string | null
          created_at?: string
          id?: string
          nome: string
          prestador?: string | null
          telefone?: string | null
        }
        Update: {
          codigo?: string | null
          created_at?: string
          id?: string
          nome?: string
          prestador?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      procedimentos_realizados: {
        Row: {
          created_at: string
          data_finalizacao: string | null
          face: string | null
          id: string
          nome_paciente: string
          nome_procedimento: string | null
          paciente_codigo: string | null
          plano: string | null
          procedimento_codigo: string | null
          regiao: string | null
          valor_convenio: number | null
        }
        Insert: {
          created_at?: string
          data_finalizacao?: string | null
          face?: string | null
          id?: string
          nome_paciente: string
          nome_procedimento?: string | null
          paciente_codigo?: string | null
          plano?: string | null
          procedimento_codigo?: string | null
          regiao?: string | null
          valor_convenio?: number | null
        }
        Update: {
          created_at?: string
          data_finalizacao?: string | null
          face?: string | null
          id?: string
          nome_paciente?: string
          nome_procedimento?: string | null
          paciente_codigo?: string | null
          plano?: string | null
          procedimento_codigo?: string | null
          regiao?: string | null
          valor_convenio?: number | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: faturamento_plano
//   id: uuid (not null, default: gen_random_uuid())
//   matricula: text (nullable)
//   nome_paciente: text (not null)
//   procedimento_codigo: text (nullable)
//   regiao: text (nullable)
//   face: text (nullable)
//   data_finalizacao: date (nullable)
//   repasse: numeric (nullable)
//   co_participacao: numeric (nullable)
//   plano: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: pacientes
//   id: uuid (not null, default: gen_random_uuid())
//   codigo: text (nullable)
//   nome: text (not null)
//   prestador: text (nullable)
//   telefone: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: procedimentos_realizados
//   id: uuid (not null, default: gen_random_uuid())
//   paciente_codigo: text (nullable)
//   nome_paciente: text (not null)
//   procedimento_codigo: text (nullable)
//   nome_procedimento: text (nullable)
//   regiao: text (nullable)
//   face: text (nullable)
//   data_finalizacao: date (nullable)
//   valor_convenio: numeric (nullable)
//   plano: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: faturamento_plano
//   PRIMARY KEY faturamento_plano_pkey: PRIMARY KEY (id)
// Table: pacientes
//   PRIMARY KEY pacientes_pkey: PRIMARY KEY (id)
// Table: procedimentos_realizados
//   PRIMARY KEY procedimentos_realizados_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: faturamento_plano
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: pacientes
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: procedimentos_realizados
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
