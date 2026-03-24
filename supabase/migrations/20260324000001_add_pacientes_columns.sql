-- Adiciona novas colunas à tabela pacientes
ALTER TABLE public.pacientes 
ADD COLUMN IF NOT EXISTS sexo TEXT,
ADD COLUMN IF NOT EXISTS idade INTEGER,
ADD COLUMN IF NOT EXISTS data_cadastro DATE;
