-- =============================================================================
-- NexusOS — Phase 17: Automation Engine & Workflow Builder Migration
-- Engine: Supabase PostgreSQL (v15+)
-- =============================================================================

-- 1. WORKFLOWS TABLE (Rule Definitions)
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    trigger_event TEXT NOT NULL, -- invoice_created, invoice_paid, service_renewal_due, ticket_created, payment_completed, client_onboarded
    conditions JSONB DEFAULT '[]'::jsonb,
    actions JSONB DEFAULT '[]'::jsonb,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    priority TEXT NOT NULL DEFAULT 'normal', -- low, normal, high, urgent
    execution_count INT NOT NULL DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflows_trigger ON public.workflows(trigger_event);

-- 2. AUTOMATION JOBS QUEUE TABLE
CREATE TABLE IF NOT EXISTS public.automation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
    trigger_event TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued', -- queued, running, completed, failed
    payload JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    retries_count INT NOT NULL DEFAULT 0,
    run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_jobs_status ON public.automation_jobs(status);

-- 3. AUTOMATION HISTORY TABLE (Audit Trail for Workflow Executions)
CREATE TABLE IF NOT EXISTS public.automation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.automation_jobs(id) ON DELETE SET NULL,
    workflow_name TEXT NOT NULL,
    trigger_event TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    duration_ms INT NOT NULL DEFAULT 45,
    logs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_history_created_at ON public.automation_history(created_at);

-- Seed default automation workflows
INSERT INTO public.system_settings (category, value) VALUES ('automation', '{"engineStatus": "active"}'::jsonb) ON CONFLICT (category) DO NOTHING;

INSERT INTO public.workflows (name, description, trigger_event, actions, is_enabled)
VALUES
  ('Auto-Generate Renewal Invoices', 'Automatically issues recurring billing invoices 30 days prior to service expiration.', 'service_renewal_due', '[{"type": "generate_invoice"}, {"type": "send_notification"}]'::jsonb, true),
  ('Send UddoktaPay Receipt Email', 'Dispatches payment receipt and updates invoice status upon UddoktaPay checkout webhook.', 'payment_completed', '[{"type": "send_email"}, {"type": "update_status"}]'::jsonb, true),
  ('Alert Support Team on Ticket Opened', 'Triggers urgent in-app alert and notification to support staff when a new ticket is opened.', 'ticket_created', '[{"type": "send_notification"}]'::jsonb, true),
  ('Client Onboarding Welcome Alert', 'Sends welcome email and creates client portal onboarding checklist when account is activated.', 'client_onboarded', '[{"type": "send_email"}, {"type": "send_notification"}]'::jsonb, true)
ON CONFLICT DO NOTHING;

-- 4. RLS SECURITY POLICIES
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_workflows" ON public.workflows;
DROP POLICY IF EXISTS "admin_all_automation_jobs" ON public.automation_jobs;
DROP POLICY IF EXISTS "admin_all_automation_history" ON public.automation_history;

-- Admin policies (Full Access)
CREATE POLICY "admin_all_workflows" ON public.workflows FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_automation_jobs" ON public.automation_jobs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_automation_history" ON public.automation_history FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
