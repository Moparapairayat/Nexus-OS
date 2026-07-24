-- =============================================================================
-- NexusOS — Phase 19: Security Operations Center & Audit System Migration
-- Engine: Supabase PostgreSQL (v15+)
-- =============================================================================

-- 1. SECURITY EVENTS TABLE (Comprehensive Audit Engine)
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL DEFAULT 'System',
    target_entity TEXT,
    target_id TEXT,
    action TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'security', -- auth, security, credentials, vault, settings, permissions, billing
    severity TEXT NOT NULL DEFAULT 'info', -- info, warning, critical
    ip_address TEXT DEFAULT '127.0.0.1',
    user_agent TEXT,
    status TEXT NOT NULL DEFAULT 'success', -- success, failed
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_category ON public.security_events(category);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at);

-- 2. USER SESSIONS TABLE (Active Session Governance)
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    device_info TEXT NOT NULL DEFAULT 'Desktop Workstation',
    browser TEXT NOT NULL DEFAULT 'Chrome 122',
    os TEXT NOT NULL DEFAULT 'Windows 11',
    ip_address TEXT NOT NULL DEFAULT '103.114.152.18',
    is_current_session BOOLEAN NOT NULL DEFAULT FALSE,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);

-- 3. CREDENTIAL ACCESS LOGS TABLE (Vault Access Audit)
CREATE TABLE IF NOT EXISTS public.credential_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    credential_id UUID REFERENCES public.service_credentials(id) ON DELETE CASCADE,
    actor_name TEXT NOT NULL,
    action TEXT NOT NULL, -- viewed, copied, updated, shared
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credential_access_logs_service ON public.credential_access_logs(service_id);

-- Seed sample security events
INSERT INTO public.security_events (actor_name, action, category, severity, ip_address, status)
VALUES
  ('Admin Staff', 'Admin Authenticated Successfully', 'auth', 'info', '103.114.152.18', 'success'),
  ('Admin Staff', 'Updated UddoktaPay Gateway Settings', 'settings', 'warning', '103.114.152.18', 'success'),
  ('Client User', 'Copied Control Panel Password', 'credentials', 'info', '180.211.233.5', 'success'),
  ('System', 'Feature Flag [service_renewals_engine] Toggled', 'settings', 'info', '127.0.0.1', 'success'),
  ('Unknown User', 'Failed Login Attempt (Invalid Password)', 'auth', 'critical', '198.51.100.44', 'failed')
ON CONFLICT DO NOTHING;

-- 4. RLS SECURITY POLICIES
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_access_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_security_events" ON public.security_events;
DROP POLICY IF EXISTS "admin_all_user_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "admin_all_credential_access_logs" ON public.credential_access_logs;

-- Admin policies (Full Access)
CREATE POLICY "admin_all_security_events" ON public.security_events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_user_sessions" ON public.user_sessions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_credential_access_logs" ON public.credential_access_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
