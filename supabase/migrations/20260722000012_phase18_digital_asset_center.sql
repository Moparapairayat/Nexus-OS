-- =============================================================================
-- NexusOS — Phase 18: Digital Asset & Service Management Center Migration
-- Engine: Supabase PostgreSQL (v15+)
-- =============================================================================

-- 1. SERVICE CREDENTIALS TABLE (Encrypted Vault for Digital Assets)
CREATE TABLE IF NOT EXISTS public.service_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    credential_name TEXT NOT NULL DEFAULT 'Login Credentials',
    username TEXT,
    encrypted_password TEXT,
    login_url TEXT,
    api_key TEXT,
    license_key TEXT,
    secret_notes TEXT,
    is_client_visible BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure columns exist if table was previously created
ALTER TABLE public.service_credentials ADD COLUMN IF NOT EXISTS is_client_visible BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.service_credentials ADD COLUMN IF NOT EXISTS credential_name TEXT NOT NULL DEFAULT 'Login Credentials';
ALTER TABLE public.service_credentials ADD COLUMN IF NOT EXISTS api_key TEXT;
ALTER TABLE public.service_credentials ADD COLUMN IF NOT EXISTS license_key TEXT;

CREATE INDEX IF NOT EXISTS idx_service_credentials_service_id ON public.service_credentials(service_id);

-- 2. SERVICE ACTIVITIES TABLE (Asset Timeline Trail)
CREATE TABLE IF NOT EXISTS public.service_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- created, assigned, activated, updated, renewed, suspended, reactivated, cancelled, expired, credential_updated
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    performed_by TEXT DEFAULT 'System',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_activities_service_id ON public.service_activities(service_id);

-- Seed comprehensive digital asset categories
INSERT INTO public.service_categories (name, slug, description, color, icon_name)
VALUES
  ('Web Hosting', 'web-hosting', 'Managed Cloud & VPS Web Hosting Infrastructure', 'blue', 'Server'),
  ('Domain Registration', 'domain', 'Domain Name Registration & DNS Management', 'emerald', 'Globe'),
  ('Cloudflare WAF', 'cloudflare', 'Cloudflare CDN, WAF Security & Anti-DDoS Protection', 'amber', 'Cloud'),
  ('SSL Certificate', 'ssl', 'HTTPS SSL/TLS Security Certificates', 'purple', 'Shield'),
  ('Business Email', 'business-email', 'Enterprise G-Suite & Custom Domain Mailboxes', 'indigo', 'Mail'),
  ('SMS Gateway', 'sms-gateway', 'Bulk SMS API Gateway Subscriptions', 'pink', 'MessageSquare'),
  ('Payment Gateway', 'payment-gateway', 'Merchant Gateway Credentials & UddoktaPay Accounts', 'emerald', 'CreditCard'),
  ('Software License', 'software-license', 'Enterprise Software & Plugin Subscriptions', 'blue', 'Key'),
  ('API Subscription', 'api-subscription', 'REST & GraphQL Third-Party API Allocations', 'purple', 'Cpu'),
  ('Custom Digital Service', 'custom-service', 'Tailored Development, Maintenance & Retainers', 'amber', 'Package')
ON CONFLICT (slug) DO NOTHING;

-- 3. RLS SECURITY POLICIES
ALTER TABLE public.service_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_service_credentials" ON public.service_credentials;
DROP POLICY IF EXISTS "admin_all_service_activities" ON public.service_activities;

DROP POLICY IF EXISTS "client_select_visible_service_credentials" ON public.service_credentials;
DROP POLICY IF EXISTS "client_select_own_service_activities" ON public.service_activities;

-- Admin policies (Full Access)
CREATE POLICY "admin_all_service_credentials" ON public.service_credentials FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_service_activities" ON public.service_activities FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Client policies (Strictly isolates shared credentials where is_client_visible = true)
CREATE POLICY "client_select_visible_service_credentials" ON public.service_credentials FOR SELECT USING (
  is_client_visible IS TRUE
  AND service_id IN (
    SELECT id FROM public.services 
    WHERE client_id IN (SELECT id FROM public.clients WHERE profile_id = auth.uid())
  )
);

CREATE POLICY "client_select_own_service_activities" ON public.service_activities FOR SELECT USING (
  service_id IN (
    SELECT id FROM public.services 
    WHERE client_id IN (SELECT id FROM public.clients WHERE profile_id = auth.uid())
  )
);
