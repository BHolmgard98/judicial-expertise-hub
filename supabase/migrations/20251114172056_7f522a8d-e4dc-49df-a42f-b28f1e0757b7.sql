-- Corrigir search_path da função generate_pericia_numero
CREATE OR REPLACE FUNCTION generate_pericia_numero()
RETURNS trigger AS $$
BEGIN
  IF NEW.numero IS NULL THEN
    SELECT COALESCE(MAX(numero), 0) + 1 INTO NEW.numero FROM pericias WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;