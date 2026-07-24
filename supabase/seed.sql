-- =============================================================================
-- NexusOS Database Architecture — Phase 2 Seed Script
-- Environment: Development & Testing
-- =============================================================================

-- Insert Default Service Categories
INSERT INTO public.service_categories (id, name, slug, description, icon, sort_order)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Domain Names', 'domains', 'Domain Registration & DNS Management', 'Globe', 1),
    ('c2222222-2222-2222-2222-222222222222', 'Web Hosting', 'hosting', 'High Performance Managed Cloud Hosting', 'Server', 2),
    ('c3333333-3333-3333-3333-333333333333', 'Cloudflare & CDN', 'cloudflare', 'Cloudflare CDN, WAF, and DDoS Security', 'Shield', 3),
    ('c4444444-4444-4444-4444-444444444444', 'Business Email', 'email', 'Professional Google Workspace & Microsoft 365 Email', 'Mail', 4),
    ('c5555555-5555-5555-5555-555555555555', 'SSL Certificates', 'ssl', 'DV/OV/EV Enterprise Encryption Certificates', 'Lock', 5),
    ('c6666666-6666-6666-6666-666666666666', 'SMS Gateways', 'sms', 'Transactional & Promotional SMS Services', 'MessageSquare', 6),
    ('c7777777-7777-7777-7777-777777777777', 'Custom Solutions', 'custom', 'Bespoke Software & Cloud Engineering Services', 'Code', 7)
ON CONFLICT (name) DO NOTHING;

-- Insert System Settings Defaults
INSERT INTO public.settings (key, category, value, is_public)
VALUES
    ('app_name', 'general', '"NexusOS"'::jsonb, true),
    ('default_currency', 'billing', '"USD"'::jsonb, true),
    ('payment_gateway_default', 'payment', '"uddoktapay"'::jsonb, false),
    ('tax_rate_percent', 'billing', '0.00'::jsonb, false)
ON CONFLICT (key) DO NOTHING;
