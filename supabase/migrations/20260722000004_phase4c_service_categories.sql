-- =============================================================================
-- NexusOS — Phase 4c: Database-Driven Service Categories & Catalog Templates
-- =============================================================================

-- 1. Extend service_categories table
ALTER TABLE public.service_categories
  ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'blue',
  ADD COLUMN IF NOT EXISTS icon_name TEXT;

-- 2. Create service_templates table
CREATE TABLE IF NOT EXISTS public.service_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.service_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  default_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  renewable BOOLEAN DEFAULT TRUE,
  auto_renewal BOOLEAN DEFAULT TRUE,
  visibility TEXT DEFAULT 'public',
  status TEXT DEFAULT 'active',
  default_notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_service_templates_updated_at
  BEFORE UPDATE ON public.service_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. RLS Policies
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_templates ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read service categories
CREATE POLICY "authenticated_select_service_categories" ON public.service_categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to manage service categories
CREATE POLICY "admin_manage_service_categories" ON public.service_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Allow all authenticated users to read service templates
CREATE POLICY "authenticated_select_service_templates" ON public.service_templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to manage service templates
CREATE POLICY "admin_manage_service_templates" ON public.service_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Seed core categories if empty
INSERT INTO public.service_categories (name, slug, description, color)
VALUES 
  ('Domains & DNS', 'domains-dns', 'Domain Registration, DNS Routing & SSL Management', 'blue'),
  ('Cloudflare & CDN', 'cloudflare-cdn', 'Edge Security, WAF Rules & Global CDN Acceleration', 'orange'),
  ('Cloud VPS & Dedicated Servers', 'cloud-vps', 'High Performance Virtual Servers & Bare Metal Hosting', 'emerald'),
  ('Development Retainers', 'development-retainers', 'Dedicated Software Engineering Hours & SLA Support', 'purple')
ON CONFLICT (name) DO NOTHING;
