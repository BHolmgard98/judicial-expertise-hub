-- Adicionar novos campos à tabela pericias
ALTER TABLE public.pericias
ADD COLUMN numero integer,
ADD COLUMN cidade text,
ADD COLUMN funcao text,
ADD COLUMN valor_causa numeric,
ADD COLUMN nr15 integer[],
ADD COLUMN nr16 integer[],
ADD COLUMN data_pericia_agendada date,
ADD COLUMN horario time,
ADD COLUMN endereco text,
ADD COLUMN email_reclamante text,
ADD COLUMN email_reclamada text,
ADD COLUMN prazo_esclarecimento date,
ADD COLUMN data_esclarecimento date,
ADD COLUMN data_recebimento date,
ADD COLUMN valor_recebimento numeric,
ADD COLUMN sentenca text;

-- Criar função para gerar número sequencial automaticamente
CREATE OR REPLACE FUNCTION generate_pericia_numero()
RETURNS trigger AS $$
BEGIN
  IF NEW.numero IS NULL THEN
    SELECT COALESCE(MAX(numero), 0) + 1 INTO NEW.numero FROM pericias WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para gerar número automaticamente
CREATE TRIGGER set_pericia_numero
BEFORE INSERT ON public.pericias
FOR EACH ROW
EXECUTE FUNCTION generate_pericia_numero();

-- Atualizar registros existentes com números sequenciais
WITH numbered_rows AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as row_num
  FROM pericias
)
UPDATE pericias p
SET numero = nr.row_num
FROM numbered_rows nr
WHERE p.id = nr.id;