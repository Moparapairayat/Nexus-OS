-- =============================================================================
-- NexusOS — Phase 16: Digital Vault & Document Center Migration
-- Engine: Supabase PostgreSQL (v15+)
-- =============================================================================

-- 1. VAULT FILES TABLE
CREATE TABLE IF NOT EXISTS public.vault_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general', -- invoices, receipts, contracts, identity, hosting, ssl, domains, screenshots, backups, support, general
    file_type TEXT NOT NULL DEFAULT 'PDF Document',
    file_size_bytes BIGINT NOT NULL DEFAULT 102400,
    storage_path TEXT NOT NULL,
    download_url TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    download_count INT NOT NULL DEFAULT 0,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vault_files_client_id ON public.vault_files(client_id);
CREATE INDEX IF NOT EXISTS idx_vault_files_category ON public.vault_files(category);
CREATE INDEX IF NOT EXISTS idx_vault_files_service_id ON public.vault_files(service_id);

-- 2. VAULT FILE LOGS TABLE (Audit Trail for File Actions)
CREATE TABLE IF NOT EXISTS public.vault_file_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES public.vault_files(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- uploaded, downloaded, renamed, categorized, deleted
    actor_name TEXT NOT NULL DEFAULT 'System',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vault_file_logs_file_id ON public.vault_file_logs(file_id);

-- 3. RLS SECURITY POLICIES
ALTER TABLE public.vault_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_file_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_vault_files" ON public.vault_files;
DROP POLICY IF EXISTS "admin_all_vault_file_logs" ON public.vault_file_logs;

DROP POLICY IF EXISTS "client_select_own_vault_files" ON public.vault_files;
DROP POLICY IF EXISTS "client_select_own_vault_file_logs" ON public.vault_file_logs;

-- Admin policies (Full Access)
CREATE POLICY "admin_all_vault_files" ON public.vault_files FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_vault_file_logs" ON public.vault_file_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Client policies
CREATE POLICY "client_select_own_vault_files" ON public.vault_files FOR SELECT USING (
  client_id IN (SELECT id FROM public.clients WHERE profile_id = auth.uid())
);

CREATE POLICY "client_select_own_vault_file_logs" ON public.vault_file_logs FOR SELECT USING (
  client_id IN (SELECT id FROM public.clients WHERE profile_id = auth.uid())
);
