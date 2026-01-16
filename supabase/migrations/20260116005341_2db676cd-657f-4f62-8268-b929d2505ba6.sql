-- Add explicit anonymous access denial policies for all tables
-- These are RESTRICTIVE policies that require authentication

-- For profiles
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);

-- For clients
CREATE POLICY "Deny anonymous access to clients"
ON public.clients
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);

-- For flights
CREATE POLICY "Deny anonymous access to flights"
ON public.flights
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);

-- For quotations
CREATE POLICY "Deny anonymous access to quotations"
ON public.quotations
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);

-- For financial_documents
CREATE POLICY "Deny anonymous access to financial_documents"
ON public.financial_documents
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);

-- For companies
CREATE POLICY "Deny anonymous access to companies"
ON public.companies
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);

-- For user_roles
CREATE POLICY "Deny anonymous access to user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);