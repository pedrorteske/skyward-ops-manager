-- Enum para tipos de aeronave ANAC
CREATE TYPE aircraft_category AS ENUM (
  'fixed_wing',
  'helicopter',
  'glider',
  'motorglider',
  'balloon',
  'airship',
  'amphibious',
  'seaplane',
  'rpa_drone',
  'ultralight',
  'gyrocopter'
);

-- Tabela de aeronaves
CREATE TABLE public.aircraft (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  owner_operator TEXT NOT NULL,
  registration_country TEXT NOT NULL,
  registration_prefix TEXT NOT NULL,
  model TEXT NOT NULL,
  category aircraft_category NOT NULL,
  
  has_avanac BOOLEAN DEFAULT false,
  has_avoem BOOLEAN DEFAULT false,
  has_tecat BOOLEAN DEFAULT false,
  has_gendec_template BOOLEAN DEFAULT false,
  has_fuel_release BOOLEAN DEFAULT false,
  
  observations TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE (company_id, registration_prefix)
);

-- RLS Policies
ALTER TABLE aircraft ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny anonymous access to aircraft" ON aircraft
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own company aircraft" ON aircraft
  FOR SELECT USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert own company aircraft" ON aircraft
  FOR INSERT WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update own company aircraft" ON aircraft
  FOR UPDATE USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete own company aircraft" ON aircraft
  FOR DELETE USING (company_id = get_user_company_id(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_aircraft_updated_at
  BEFORE UPDATE ON aircraft
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Adicionar colunas de documentos operacionais na tabela flights
ALTER TABLE flights
  ADD COLUMN doc_avanac BOOLEAN DEFAULT false,
  ADD COLUMN doc_avoem BOOLEAN DEFAULT false,
  ADD COLUMN doc_tecat BOOLEAN DEFAULT false,
  ADD COLUMN doc_gendec BOOLEAN DEFAULT false,
  ADD COLUMN doc_fuel_release BOOLEAN DEFAULT false,
  ADD COLUMN aircraft_id UUID REFERENCES aircraft(id) ON DELETE SET NULL;