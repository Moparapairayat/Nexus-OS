-- =============================================================================
-- NexusOS — Phase 13: Communication Center & Notification Engine Migration
-- Engine: Supabase PostgreSQL (v15+)
-- =============================================================================

-- 1. EXTEND NOTIFICATIONS TABLE (In-App Alerts)
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS action_label TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_notifications_client_id ON public.notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON public.notifications(category);

-- 2. EMAIL LOGS TABLE (Dispatch & Audit Trail)
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    template_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent', -- queued, sent, delivered, failed
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON public.email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);

-- 3. ANNOUNCEMENTS TABLE (Broadcast & Maintenance Notices)
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'announcement', -- announcement, maintenance, downtime, feature, update
    audience TEXT NOT NULL DEFAULT 'all', -- all, specific_clients
    target_client_ids JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'published', -- draft, published, scheduled, archived
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_status ON public.announcements(status);

-- 4. EMAIL TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default email templates
INSERT INTO public.email_templates (template_key, name, subject_template, body_template, category)
VALUES 
  ('invoice_created', 'Invoice Generated', 'Invoice {{invoice_number}} Generated - {{company_name}}', 'Dear {{client_name}},\n\nYour new invoice {{invoice_number}} for {{amount}} has been generated and is due on {{due_date}}.\n\nPay online with UddoktaPay: {{payment_url}}\n\nRegards,\nNexusOS Billing Engine', 'billing'),
  ('payment_receipt', 'Payment Receipt', 'Payment Confirmation for Invoice {{invoice_number}} - {{company_name}}', 'Dear {{client_name}},\n\nThank you! We have received your payment of {{amount}} via {{method}} (Transaction ID: {{transaction_id}}).\n\nYour receipt {{receipt_number}} is available in your client portal.\n\nRegards,\nNexusOS Billing Engine', 'billing'),
  ('renewal_reminder', 'Service Renewal Reminder', 'Upcoming Renewal Notice for {{service_name}}', 'Dear {{client_name}},\n\nYour digital service {{service_name}} is scheduled for renewal on {{renewal_date}} ({{amount}} / {{billing_cycle}}).\n\nPlease ensure your payment details are up to date.\n\nRegards,\nNexusOS Operations', 'renewals'),
  ('ticket_reply', 'Support Ticket Reply', 'Reply to Ticket {{ticket_number}}: {{subject}}', 'Dear {{client_name}},\n\nA new response has been posted to your support ticket {{ticket_number}} by our support team.\n\nView thread: {{ticket_url}}\n\nRegards,\nNexusOS Support Desk', 'support')
ON CONFLICT (template_key) DO NOTHING;

-- 5. RLS SECURITY POLICIES
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_notifications" ON public.notifications;
DROP POLICY IF EXISTS "admin_all_email_logs" ON public.email_logs;
DROP POLICY IF EXISTS "admin_all_announcements" ON public.announcements;
DROP POLICY IF EXISTS "admin_all_email_templates" ON public.email_templates;

DROP POLICY IF EXISTS "client_select_own_notifications" ON public.notifications;
DROP POLICY IF EXISTS "client_select_own_email_logs" ON public.email_logs;
DROP POLICY IF EXISTS "client_select_published_announcements" ON public.announcements;

-- Admin policies (Full Access)
CREATE POLICY "admin_all_notifications" ON public.notifications FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_email_logs" ON public.email_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_announcements" ON public.announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_email_templates" ON public.email_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Client policies
CREATE POLICY "client_select_own_notifications" ON public.notifications FOR SELECT USING (
  client_id IN (SELECT id FROM public.clients WHERE profile_id = auth.uid())
  OR recipient_id = auth.uid()
);

CREATE POLICY "client_select_own_email_logs" ON public.email_logs FOR SELECT USING (
  client_id IN (SELECT id FROM public.clients WHERE profile_id = auth.uid())
);

CREATE POLICY "client_select_published_announcements" ON public.announcements FOR SELECT USING (
  status = 'published'
);
