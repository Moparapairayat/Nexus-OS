-- =============================================================================
-- NexusOS — Phase 15: System Control Center & Global Settings Migration
-- Engine: Supabase PostgreSQL (v15+)
-- =============================================================================

-- 1. SYSTEM SETTINGS TABLE (Category-based JSONB Storage)
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL UNIQUE, -- company, branding, invoices, uddoktapay, email, security, localization
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. FEATURE FLAGS TABLE
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'module', -- beta, experimental, module, general
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SYSTEM AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL DEFAULT 'System',
    action TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'settings', -- settings, security, billing, user_management
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_audit_logs_category ON public.system_audit_logs(category);
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_created_at ON public.system_audit_logs(created_at);

-- Seed default system settings
INSERT INTO public.system_settings (category, value)
VALUES 
  ('company', '{"companyName": "NexusOS Enterprise", "businessEmail": "support@nexusos.io", "phone": "+880 1700-000000", "website": "https://nexusos.io", "address": "Dhaka, Bangladesh", "country": "Bangladesh", "timezone": "Asia/Dhaka", "currency": "USD", "taxNumber": "TRN-99887766"}'::jsonb),
  ('branding', '{"primaryColor": "#3b82f6", "accentColor": "#10b981", "lightLogo": "/logo.svg", "darkLogo": "/logo-dark.svg"}'::jsonb),
  ('invoices', '{"invoicePrefix": "INV-2026", "dueDays": 14, "startingNumber": 1001, "currency": "USD", "footerText": "Thank you for partnering with NexusOS. All payments are securely processed via UddoktaPay."}'::jsonb),
  ('uddoktapay', '{"storeId": "nexus_sandbox", "apiKey": "ud_sandbox_api_key_2026", "baseUrl": "https://sandbox.uddoktapay.com/api/v2", "isSandbox": true}'::jsonb),
  ('email', '{"senderName": "NexusOS Operations", "senderEmail": "noreply@nexusos.io", "replyTo": "support@nexusos.io"}'::jsonb),
  ('security', '{"minPasswordLength": 8, "sessionTimeoutMinutes": 120, "maxLoginAttempts": 5, "require2FA": false}'::jsonb)
ON CONFLICT (category) DO NOTHING;

-- Seed default feature flags
INSERT INTO public.feature_flags (key, name, description, category, is_enabled)
VALUES
  ('uddoktapay_gateway', 'UddoktaPay Payment Gateway', 'Enables real-time bKash, Nagad, Rocket, and Card payments via UddoktaPay v2 API', 'module', true),
  ('client_global_search', 'Global Search (Ctrl + K)', 'Enables instant global command search across services, invoices, payments, and tickets', 'module', true),
  ('service_renewals_engine', 'Automated Renewal Engine', 'Enables 30-day service expiration tracking and quick renewal invoice checkout', 'module', true),
  ('support_internal_notes', 'Staff Internal Notes', 'Allows support team to post staff-only internal notes hidden from clients via RLS', 'beta', true),
  ('business_intelligence', 'Executive BI & Analytics', 'Enables Monthly Recurring Revenue (MRR) and category distribution analytics', 'module', true)
ON CONFLICT (key) DO NOTHING;

-- 4. RLS SECURITY POLICIES
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "admin_all_feature_flags" ON public.feature_flags;
DROP POLICY IF EXISTS "admin_all_system_audit_logs" ON public.system_audit_logs;

DROP POLICY IF EXISTS "read_public_feature_flags" ON public.feature_flags;

-- Admin policies
CREATE POLICY "admin_all_system_settings" ON public.system_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_feature_flags" ON public.feature_flags FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_system_audit_logs" ON public.system_audit_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Public read feature flags
CREATE POLICY "read_public_feature_flags" ON public.feature_flags FOR SELECT USING (true);
