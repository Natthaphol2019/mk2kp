
create policy "Anyone can read push subscriptions" on public.push_subscriptions for select using (auth.role() = 'authenticated');

