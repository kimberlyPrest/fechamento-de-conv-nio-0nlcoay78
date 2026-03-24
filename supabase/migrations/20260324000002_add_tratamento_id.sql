-- Adiciona tratamento_id para permitir o merge entre
-- "Pesquisar procedimentos" e "Produção por procedimento"
ALTER TABLE public.procedimentos_realizados
ADD COLUMN IF NOT EXISTS tratamento_id TEXT;
