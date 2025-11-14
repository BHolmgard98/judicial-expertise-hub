-- Create enum for pericia status
CREATE TYPE public.pericia_status AS ENUM (
  'Aguardando',
  'Em andamento',
  'Suspensa',
  'Concluída',
  'Arquivada'
);

-- Create pericias table
CREATE TABLE public.pericias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_processo TEXT NOT NULL,
  requerente TEXT NOT NULL,
  requerido TEXT NOT NULL,
  vara TEXT NOT NULL,
  perito TEXT NOT NULL,
  status pericia_status DEFAULT 'Aguardando',
  data_nomeacao DATE NOT NULL,
  data_prazo DATE,
  data_entrega DATE,
  honorarios NUMERIC(10,2),
  observacoes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pericias ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own pericias"
  ON public.pericias FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pericias"
  ON public.pericias FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pericias"
  ON public.pericias FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pericias"
  ON public.pericias FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.pericias
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for better performance
CREATE INDEX idx_pericias_user_id ON public.pericias(user_id);
CREATE INDEX idx_pericias_status ON public.pericias(status);
CREATE INDEX idx_pericias_data_nomeacao ON public.pericias(data_nomeacao);