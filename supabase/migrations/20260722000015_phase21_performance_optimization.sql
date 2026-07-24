-- =============================================================================
-- NexusOS — Phase 21: Performance & Production Optimization Migration
-- Engine: Supabase PostgreSQL (v15+)
-- =============================================================================

-- High-performance composite indexes for high-volume query paths
CREATE INDEX IF NOT EXISTS idx_invoices_client_status ON public.invoices(client_id, status);
CREATE INDEX IF NOT EXISTS idx_services_client_status ON public.services(client_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_client_status ON public.payments(client_id, status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_client_status ON public.support_tickets(client_id, status);
CREATE INDEX IF NOT EXISTS idx_vault_files_client_category ON public.vault_files(client_id, category);
CREATE INDEX IF NOT EXISTS idx_security_events_actor_created ON public.security_events(actor_id, created_at DESC);
