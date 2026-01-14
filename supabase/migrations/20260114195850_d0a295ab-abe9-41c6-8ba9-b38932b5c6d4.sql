-- Criar enum para tipo de voo
CREATE TYPE public.flight_type AS ENUM ('S', 'N', 'G', 'M');

-- Criar enum para status de voo
CREATE TYPE public.flight_status AS ENUM ('scheduled', 'arrived', 'departed', 'cancelled', 'delayed');

-- Criar enum para tipo de cliente
CREATE TYPE public.client_type AS ENUM ('PF', 'PJ', 'INT');

-- Criar enum para status de cotação
CREATE TYPE public.quotation_status AS ENUM ('created', 'sent', 'approved', 'rejected');

-- Criar enum para moeda
CREATE TYPE public.currency AS ENUM ('BRL', 'USD');

-- Criar enum para tipo de documento financeiro
CREATE TYPE public.financial_document_type AS ENUM ('quotation', 'proforma', 'invoice');

-- Criar enum para status de documento financeiro
CREATE TYPE public.financial_document_status AS ENUM ('draft', 'sent', 'approved', 'rejected', 'paid', 'cancelled');

-- Tabela de voos
CREATE TABLE public.flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  aircraft_prefix TEXT NOT NULL,
  aircraft_model TEXT NOT NULL,
  flight_type flight_type NOT NULL DEFAULT 'G',
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  arrival_date DATE NOT NULL,
  arrival_time TIME NOT NULL,
  departure_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  status flight_status NOT NULL DEFAULT 'scheduled',
  observations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de clientes
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  type client_type NOT NULL,
  -- Campos PF
  full_name TEXT,
  cpf TEXT,
  -- Campos PJ
  operator TEXT,
  cnpj TEXT,
  commercial_email TEXT,
  contact_person TEXT,
  -- Campos INT
  country TEXT,
  -- Campos comuns
  email TEXT,
  phone TEXT,
  observations TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de cotações
CREATE TABLE public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  flight_id UUID REFERENCES public.flights(id) ON DELETE SET NULL,
  number TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  currency currency NOT NULL DEFAULT 'BRL',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status quotation_status NOT NULL DEFAULT 'created',
  observations TEXT,
  valid_until DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de documentos financeiros
CREATE TABLE public.financial_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  flight_id UUID REFERENCES public.flights(id) ON DELETE SET NULL,
  type financial_document_type NOT NULL,
  number TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  currency currency NOT NULL DEFAULT 'BRL',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  taxes NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status financial_document_status NOT NULL DEFAULT 'draft',
  observations TEXT,
  payment_terms TEXT,
  due_date DATE,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_documents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para flights
CREATE POLICY "Users can view own company flights"
ON public.flights FOR SELECT
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert own company flights"
ON public.flights FOR INSERT
WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update own company flights"
ON public.flights FOR UPDATE
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete own company flights"
ON public.flights FOR DELETE
USING (company_id = get_user_company_id(auth.uid()));

-- Políticas RLS para clients
CREATE POLICY "Users can view own company clients"
ON public.clients FOR SELECT
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert own company clients"
ON public.clients FOR INSERT
WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update own company clients"
ON public.clients FOR UPDATE
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete own company clients"
ON public.clients FOR DELETE
USING (company_id = get_user_company_id(auth.uid()));

-- Políticas RLS para quotations
CREATE POLICY "Users can view own company quotations"
ON public.quotations FOR SELECT
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert own company quotations"
ON public.quotations FOR INSERT
WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update own company quotations"
ON public.quotations FOR UPDATE
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete own company quotations"
ON public.quotations FOR DELETE
USING (company_id = get_user_company_id(auth.uid()));

-- Políticas RLS para financial_documents
CREATE POLICY "Users can view own company financial documents"
ON public.financial_documents FOR SELECT
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert own company financial documents"
ON public.financial_documents FOR INSERT
WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update own company financial documents"
ON public.financial_documents FOR UPDATE
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete own company financial documents"
ON public.financial_documents FOR DELETE
USING (company_id = get_user_company_id(auth.uid()));

-- Triggers para updated_at
CREATE TRIGGER update_flights_updated_at
BEFORE UPDATE ON public.flights
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
BEFORE UPDATE ON public.quotations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_documents_updated_at
BEFORE UPDATE ON public.financial_documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();