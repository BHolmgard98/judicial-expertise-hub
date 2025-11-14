-- Add link_processo column to pericias table
ALTER TABLE public.pericias 
ADD COLUMN link_processo text;