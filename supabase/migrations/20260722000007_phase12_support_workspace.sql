-- =============================================================================
-- NexusOS — Phase 12: Enterprise Support Center & Ticket Workspace Migration
-- Engine: Supabase PostgreSQL (v15+)
-- =============================================================================

-- 1. Extend support_tickets table
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_support_tickets_client_id ON public.support_tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_service_id ON public.support_tickets(service_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_department ON public.support_tickets(department);

-- 2. Extend ticket_messages table for attachments
ALTER TABLE public.ticket_messages
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- 3. Create ticket_logs table for audit & timeline
CREATE TABLE IF NOT EXISTS public.ticket_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- ticket_created, status_changed, priority_changed, department_changed, assigned_changed, reply_added, internal_note_added, ticket_resolved, ticket_closed, ticket_reopened
    description TEXT NOT NULL,
    performed_by TEXT DEFAULT 'System',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_logs_ticket_id ON public.ticket_logs(ticket_id);

-- 4. RLS Security Policies for Internal Notes Protection
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_support_tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "admin_all_ticket_messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "admin_all_ticket_logs" ON public.ticket_logs;

DROP POLICY IF EXISTS "client_select_own_support_tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "client_select_own_messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "client_select_own_ticket_logs" ON public.ticket_logs;

-- Admin policies (Full Access)
CREATE POLICY "admin_all_support_tickets" ON public.support_tickets FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_ticket_messages" ON public.ticket_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_ticket_logs" ON public.ticket_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Client policies (Strictly hides internal staff notes is_internal = true)
CREATE POLICY "client_select_own_support_tickets" ON public.support_tickets FOR SELECT USING (
  client_id IN (SELECT id FROM public.clients WHERE profile_id = auth.uid())
  OR created_by = auth.uid()
);

CREATE POLICY "client_select_own_messages" ON public.ticket_messages FOR SELECT USING (
  (is_internal IS FALSE OR is_internal IS NULL)
  AND ticket_id IN (
    SELECT id FROM public.support_tickets 
    WHERE client_id IN (SELECT id FROM public.clients WHERE profile_id = auth.uid())
       OR created_by = auth.uid()
  )
);

CREATE POLICY "client_select_own_ticket_logs" ON public.ticket_logs FOR SELECT USING (
  ticket_id IN (
    SELECT id FROM public.support_tickets 
    WHERE client_id IN (SELECT id FROM public.clients WHERE profile_id = auth.uid())
       OR created_by = auth.uid()
  )
);
