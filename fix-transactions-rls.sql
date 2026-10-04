
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view transactions" ON public.transactions FOR SELECT USING (auth.role() = 'authenticated');

