-- Create general_declarations table
CREATE TABLE public.general_declarations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number TEXT NOT NULL,
  company_id UUID NOT NULL,
  flight_id UUID REFERENCES public.flights(id) ON DELETE SET NULL,
  
  -- Declaration Type
  declaration_type TEXT NOT NULL DEFAULT 'outward',
  
  -- Aircraft/Operator Information
  operator TEXT NOT NULL,
  marks_of_registration TEXT NOT NULL,
  aircraft_type TEXT NOT NULL,
  
  -- Flight Information
  airport_departure TEXT NOT NULL,
  date_departure DATE NOT NULL,
  airport_arrival TEXT NOT NULL,
  date_arrival DATE NOT NULL,
  
  -- Crew Members (JSONB array)
  crew_members JSONB NOT NULL DEFAULT '[]',
  
  -- Passengers (JSONB array)
  passengers JSONB NOT NULL DEFAULT '[]',
  
  -- Declaration of Health
  health_persons_illness TEXT DEFAULT 'NIL',
  health_other_conditions TEXT DEFAULT 'NIL',
  health_disinsecting TEXT DEFAULT 'NIL',
  
  -- Customization
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1E3A5F',
  
  -- Additional
  observations TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create trigger for updated_at
CREATE TRIGGER update_general_declarations_updated_at
  BEFORE UPDATE ON public.general_declarations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.general_declarations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Deny anonymous access to general_declarations" 
  ON public.general_declarations
  AS RESTRICTIVE FOR ALL TO public 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own company general_declarations" 
  ON public.general_declarations
  FOR SELECT 
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert own company general_declarations" 
  ON public.general_declarations
  FOR INSERT 
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update own company general_declarations" 
  ON public.general_declarations
  FOR UPDATE 
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete own company general_declarations" 
  ON public.general_declarations
  FOR DELETE 
  USING (company_id = get_user_company_id(auth.uid()));

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.general_declarations;