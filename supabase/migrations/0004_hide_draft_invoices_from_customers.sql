-- A customer could previously see their own invoices in any state, including
-- Draft. Drafts are internal working documents — an amount that has not been
-- issued yet and may still change — so exposing them in the portal invites
-- disputes about figures the business never sent.
--
-- Staff policies are unaffected: finance still sees every state.
drop policy "customer_read_own_invoices" on public.invoices;

create policy "customer_read_own_invoices" on public.invoices for select using (
  customer_id = public.current_customer_id ()
  and status <> 'Draft'
);

-- Same reasoning for quotes: a draft quote is not an offer to the customer.
drop policy "customer_read_own_quotes" on public.quotes;

create policy "customer_read_own_quotes" on public.quotes for select using (
  customer_id = public.current_customer_id ()
  and status <> 'Draft'
);
