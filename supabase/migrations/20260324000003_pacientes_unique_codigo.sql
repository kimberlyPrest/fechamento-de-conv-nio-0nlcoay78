-- Remove duplicatas mantendo o registro mais recente por codigo
DELETE FROM public.pacientes
WHERE id NOT IN (
  SELECT DISTINCT ON (codigo) id
  FROM public.pacientes
  WHERE codigo IS NOT NULL
  ORDER BY codigo, created_at DESC
);

-- Adiciona restrição única no codigo para permitir upsert seguro
ALTER TABLE public.pacientes
ADD CONSTRAINT pacientes_codigo_unique UNIQUE (codigo);
