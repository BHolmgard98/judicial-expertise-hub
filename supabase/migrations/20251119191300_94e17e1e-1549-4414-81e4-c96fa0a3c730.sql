-- Remove sentenca column
ALTER TABLE pericias DROP COLUMN IF EXISTS sentenca;

-- Add deslocamento field
ALTER TABLE pericias ADD COLUMN deslocamento text;

-- Add transport fields (nullable, only used when deslocamento = 'Transporte Público')
ALTER TABLE pericias ADD COLUMN estacao text;
ALTER TABLE pericias ADD COLUMN linha_numero text;
ALTER TABLE pericias ADD COLUMN linha_cor text;