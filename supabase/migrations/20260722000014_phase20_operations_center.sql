-- =============================================================================
-- NexusOS — Phase 20: Operations Center & System Monitoring Migration
-- Engine: Supabase PostgreSQL (v15+)
-- =============================================================================

-- 1. SYSTEM HEALTH CHECKS TABLE
CREATE TABLE IF NOT EXISTS public.system_health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL UNIQUE, -- database, storage, uddoktapay, email, automation, auth
    status TEXT NOT NULL DEFAULT 'operational', -- operational, degraded, outage
    latency_ms INT NOT NULL DEFAULT 15,
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    message TEXT NOT NULL DEFAULT 'Service online and responding normally.'
);

-- 2. SYSTEM ERROR LOGS TABLE
CREATE TABLE IF NOT EXISTS public.system_error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module TEXT NOT NULL DEFAULT 'general', -- billing, automation, payments, storage, auth
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    severity TEXT NOT NULL DEFAULT 'warning', -- info, warning, critical
    status TEXT NOT NULL DEFAULT 'unresolved', -- unresolved, resolved
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_error_logs_status ON public.system_error_logs(status);
CREATE INDEX IF NOT EXISTS idx_system_error_logs_created_at ON public.system_error_logs(created_at);

-- 3. MAINTENANCE MODE TABLE
CREATE TABLE IF NOT EXISTS public.maintenance_mode (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    message TEXT NOT NULL DEFAULT 'NexusOS is currently undergoing scheduled platform maintenance. Services will resume shortly.',
    allowed_ip_addresses JSONB DEFAULT '[]'::jsonb,
    enabled_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default health checks
INSERT INTO public.system_health_checks (service_name, status, latency_ms, message)
VALUES
  ('database', 'operational', 12, 'Supabase PostgreSQL v15 responsive.'),
  ('storage', 'operational', 28, 'Supabase Storage buckets online.'),
  ('uddoktapay', 'operational', 145, 'UddoktaPay Bangladesh v2 API connected.'),
  ('email', 'operational', 88, 'Resend Transactional Email Infrastructure ready.'),
  ('automation', 'operational', 42, 'Event Dispatcher & Job Queue operational.'),
  ('auth', 'operational', 18, 'Supabase Auth & RLS active.')
ON CONFLICT (service_name) DO NOTHING;

-- Seed default maintenance mode row
INSERT INTO public.maintenance_mode (is_enabled, message)
VALUES (false, 'NexusOS is operating normally.')
ON CONFLICT DO NOTHING;

-- Seed sample error logs
INSERT INTO public.system_error_logs (module, error_message, severity, status)
VALUES
  ('payments', 'UddoktaPay webhook signature verification warning (Re-validated)', 'info', 'resolved'),
  ('storage', 'Temporary storage bucket quota warning (85% threshold reached)', 'warning', 'unresolved')
ON CONFLICT DO NOTHING;

-- 4. RLS SECURITY POLICIES
ALTER TABLE public.system_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_mode ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_system_health_checks" ON public.system_health_checks;
DROP POLICY IF EXISTS "admin_all_system_error_logs" ON public.system_error_logs;
DROP POLICY IF EXISTS "admin_all_maintenance_mode" ON public.maintenance_mode;
DROP POLICY IF EXISTS "public_read_maintenance_mode" ON public.maintenance_mode;

-- Admin policies (Full Access)
CREATE POLICY "admin_all_system_health_checks" ON public.system_health_checks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_system_error_logs" ON public.system_error_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_maintenance_mode" ON public.maintenance_mode FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Public read maintenance status
CREATE POLICY "public_read_maintenance_mode" ON public.maintenance_mode FOR SELECT USING (true);
