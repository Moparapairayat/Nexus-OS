-- =============================================================================
-- NexusOS — Phase 4b: Fix client_status enum mismatch
-- Add 'archived' and 'deleted' to service_status enum for client compatibility
-- =============================================================================

-- Add missing values to service_status enum
ALTER TYPE public.service_status ADD VALUE IF NOT EXISTS 'archived';
ALTER TYPE public.service_status ADD VALUE IF NOT EXISTS 'deleted';

-- Add a dedicated client_status column (TEXT, no enum constraint)
-- so we can support 'pending', 'active', 'suspended', 'archived', 'deleted'
-- without altering the shared service_status enum for all tables
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS client_status TEXT DEFAULT 'active';

-- Sync existing rows: client_status mirrors status
UPDATE public.clients SET client_status = status::TEXT WHERE client_status IS NULL OR client_status = 'active';

-- Add index for fast status queries
CREATE INDEX IF NOT EXISTS idx_clients_client_status ON public.clients(client_status);
