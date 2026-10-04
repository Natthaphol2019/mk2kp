
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.workspace_members;
CREATE POLICY "Users can view their own memberships" ON public.workspace_members FOR SELECT USING (auth.role() = 'authenticated');

