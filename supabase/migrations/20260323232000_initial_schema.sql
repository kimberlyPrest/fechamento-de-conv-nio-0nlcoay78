-- Migrate tables for closed conventions
CREATE TABLE IF NOT EXISTS public.pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT,
  nome TEXT NOT NULL,
  prestador TEXT,
  telefone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.procedimentos_realizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_codigo TEXT,
  nome_paciente TEXT NOT NULL,
  procedimento_codigo TEXT,
  nome_procedimento TEXT,
  regiao TEXT,
  face TEXT,
  data_finalizacao DATE,
  valor_convenio NUMERIC,
  plano TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faturamento_plano (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula TEXT,
  nome_paciente TEXT NOT NULL,
  procedimento_codigo TEXT,
  regiao TEXT,
  face TEXT,
  data_finalizacao DATE,
  repasse NUMERIC,
  co_participacao NUMERIC,
  plano TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedimentos_realizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faturamento_plano ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all" ON public.pacientes;
CREATE POLICY "authenticated_all" ON public.pacientes FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.procedimentos_realizados;
CREATE POLICY "authenticated_all" ON public.procedimentos_realizados FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.faturamento_plano;
CREATE POLICY "authenticated_all" ON public.faturamento_plano FOR ALL TO authenticated USING (true);

-- Seed data block
DO $
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert seed user if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'kimberly@adapta.org') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'kimberly@adapta.org',
      crypt('securepassword123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Kimberly"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;
  
  -- Seed data for procedimentos_realizados
  INSERT INTO public.procedimentos_realizados (id, paciente_codigo, nome_paciente, procedimento_codigo, nome_procedimento, regiao, face, data_finalizacao, valor_convenio, plano)
  VALUES 
    ('10000000-0000-0000-0000-000000000001'::uuid, 'PAC001', 'Ana Clara Albuquerque', '85100196', 'Restauração Resina', 'Dente 14', 'Oclusal', '2023-10-15', 155.0, 'Bradesco Saúde'),
    ('10000000-0000-0000-0000-000000000002'::uuid, 'PAC002', 'Carlos Eduardo Mendes', '85200050', 'Limpeza Profilática', 'Geral', 'N/A', '2023-10-15', 80.0, 'SulAmérica'),
    ('10000000-0000-0000-0000-000000000003'::uuid, 'PAC003', 'Beatriz Souza Campos', '85300011', 'Extração Simples', 'Dente 28', 'N/A', '2023-10-16', 210.5, 'Unimed')
  ON CONFLICT (id) DO NOTHING;

  -- Seed data for faturamento_plano
  INSERT INTO public.faturamento_plano (id, matricula, nome_paciente, procedimento_codigo, regiao, face, data_finalizacao, repasse, co_participacao, plano)
  VALUES
    ('20000000-0000-0000-0000-000000000001'::uuid, 'MAT001', 'Ana Clara Albuquerque', '85100196', 'Dente 14', 'Oclusal', '2023-10-15', 155.0, 0, 'Bradesco Saúde'),
    ('20000000-0000-0000-0000-000000000002'::uuid, 'MAT002', 'Carlos Eduardo Mendes', '85200050', 'Geral', 'N/A', '2023-10-15', 40.0, 0, 'SulAmérica'),
    ('20000000-0000-0000-0000-000000000003'::uuid, 'MAT003', 'Beatriz Souza Campos', '85300011', 'Dente 28', 'N/A', '2023-10-16', 210.5, 0, 'Unimed')
  ON CONFLICT (id) DO NOTHING;

END $;
