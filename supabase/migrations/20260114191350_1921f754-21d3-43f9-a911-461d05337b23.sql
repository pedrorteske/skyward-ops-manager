-- Remover política permissiva
DROP POLICY IF EXISTS "Users can insert company during signup" ON public.companies;

-- A inserção de companies é feita apenas pelo trigger handle_new_user (SECURITY DEFINER)
-- Não precisa de política INSERT para usuários normais