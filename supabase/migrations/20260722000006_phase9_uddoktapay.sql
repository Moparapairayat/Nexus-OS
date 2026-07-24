-- =============================================================================
-- NexusOS — Phase 9: UddoktaPay Payment Infrastructure Migration
-- Engine: Supabase PostgreSQL (v15+)
-- =============================================================================

-- 1. Extend payments table for UddoktaPay Checkout Sessions
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS gateway_invoice_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_url TEXT,
  ADD COLUMN IF NOT EXISTS raw_payload JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_payments_gateway_invoice_id ON public.payments(gateway_invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON public.payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- 2. Ensure payment_transactions has gateway fields
ALTER TABLE public.payment_transactions
  ADD COLUMN IF NOT EXISTS method TEXT DEFAULT 'uddoktapay',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'COMPLETED';

-- 3. Create payment_logs table for audit & timeline
CREATE TABLE IF NOT EXISTS public.payment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- payment_started, redirected, webhook_received, webhook_verified, invoice_paid, receipt_generated, notification_sent, payment_failed, resynced, manual_verified
    description TEXT NOT NULL,
    performed_by TEXT DEFAULT 'System',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_payment_id ON public.payment_logs(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_invoice_id ON public.payment_logs(invoice_id);

-- 4. Extend receipts table for itemization & snapshot
ALTER TABLE public.receipts
  ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'uddoktapay',
  ADD COLUMN IF NOT EXISTS transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;

-- 5. RLS Policies
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "admin_all_payments" ON public.payments;
DROP POLICY IF EXISTS "admin_all_payment_transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "admin_all_payment_logs" ON public.payment_logs;
DROP POLICY IF EXISTS "admin_all_receipts" ON public.receipts;

DROP POLICY IF EXISTS "client_select_own_payments" ON public.payments;
DROP POLICY IF EXISTS "client_select_own_payment_logs" ON public.payment_logs;
DROP POLICY IF EXISTS "client_select_own_receipts" ON public.receipts;

-- Admin policies
CREATE POLICY "admin_all_payments" ON public.payments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_payment_transactions" ON public.payment_transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_payment_logs" ON public.payment_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_receipts" ON public.receipts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Client policies
CREATE POLICY "client_select_own_payments" ON public.payments FOR SELECT USING (
  client_id IN (SELECT id FROM public.clients WHERE profile_id = auth.uid())
);

CREATE POLICY "client_select_own_payment_logs" ON public.payment_logs FOR SELECT USING (
  client_id IN (SELECT id FROM public.clients WHERE profile_id = auth.uid())
);

CREATE POLICY "client_select_own_receipts" ON public.receipts FOR SELECT USING (
  client_id IN (SELECT id FROM public.clients WHERE profile_id = auth.uid())
);
