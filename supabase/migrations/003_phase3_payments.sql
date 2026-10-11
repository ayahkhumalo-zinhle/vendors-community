-- ============================================================
-- Phase 3: Payment columns on orders
-- Run via: Supabase dashboard SQL editor or Management API
-- ============================================================

alter table public.orders
  add column if not exists payment_method  text not null default 'card'
    check (payment_method in ('ecocash', 'zipit', 'card')),
  add column if not exists payment_status  text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  add column if not exists paynow_poll_url text,
  add column if not exists paynow_ref      text;

-- Note: the Paynow callback route uses SUPABASE_SERVICE_ROLE_KEY which
-- bypasses RLS automatically — no additional policy needed.
