-- ============================================================================
-- Migration: 005_rbac_master_data.sql
-- Description: Register Master Data module permissions (Venues, Vendors, Policies, Sponsors)
--              and assign them to default system roles.
-- ============================================================================

-- 1. Insert Master Data permissions
INSERT INTO permissions (module, action, code, name, description, scope) VALUES
('master_data', 'view', 'master_data.view', 'View Master Data', 'Can view master data directories including venues, vendors, policies, and sponsors', 'ORGANIZER'),
('master_data', 'create', 'master_data.create', 'Create Master Data', 'Can add new venues, vendors, policies, and sponsors', 'ORGANIZER'),
('master_data', 'edit', 'master_data.edit', 'Edit Master Data', 'Can update existing venues, vendors, policies, and sponsors', 'ORGANIZER'),
('master_data', 'delete', 'master_data.delete', 'Delete Master Data', 'Can remove venues, vendors, policies, and sponsors', 'ORGANIZER')
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    module = EXCLUDED.module,
    action = EXCLUDED.action,
    scope = EXCLUDED.scope;

-- 2. Map permissions to Super Admin ('00000000-0000-0000-0000-000000000001')
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permissions WHERE module = 'master_data'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 3. Map permissions to Organization Owner ('00000000-0000-0000-0000-000000000002')
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permissions WHERE module = 'master_data'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 4. Map permissions to Event Manager ('00000000-0000-0000-0000-000000000003')
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', id FROM permissions WHERE module = 'master_data'
ON CONFLICT (role_id, permission_id) DO NOTHING;
