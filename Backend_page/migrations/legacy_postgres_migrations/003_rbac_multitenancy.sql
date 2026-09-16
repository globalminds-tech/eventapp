-- ============================================================================
-- BOOKMYEVENT DATABASE MIGRATION: 003_rbac_multitenancy.sql
-- Purpose:
-- 1. Multi-Tenant Organization Architecture (Tenants: Organizer / Exhibitor entities)
-- 2. Granular Permission-Based Access Control (RBAC)
-- 3. System Roles & Tenant-Scoped Custom Roles
-- 4. Team Member Management & Secure Email Invitation Flow
-- 5. Immutable Audit Log Trail
-- 6. Initial Seeding of Platform Permissions & Roles
-- ============================================================================

-- 1. Organizations (Tenants)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    org_type VARCHAR(50) NOT NULL DEFAULT 'ORGANIZER', -- 'ORGANIZER', 'EXHIBITOR', 'AGENCY', 'PLATFORM'
    logo_url TEXT,
    website VARCHAR(255),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED', 'DEACTIVATED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_org_slug_active ON organizations(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_owner ON organizations(owner_id) WHERE deleted_at IS NULL;

-- 2. Roles (Global System Roles & Tenant-Scoped Custom Roles)
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    -- NULL organization_id = Global System Role (Super Admin, Organizer Owner, Exhibitor Owner)
    -- Non-NULL organization_id = Custom Tenant Role created by an Organizer / Exhibitor
    name VARCHAR(100) NOT NULL,
    code VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Unique role code within a tenant (or global namespace if organization_id is NULL)
CREATE UNIQUE INDEX IF NOT EXISTS uq_role_tenant_code_active 
ON roles(COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'::UUID), code) 
WHERE deleted_at IS NULL;

-- 3. Permissions (Granular Module & Action Capabilities)
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module VARCHAR(100) NOT NULL,      -- 'events', 'stalls', 'checkin', 'finance', 'team', 'roles', 'venues'
    action VARCHAR(50) NOT NULL,       -- 'view', 'create', 'edit', 'delete', 'approve', 'scan', 'export'
    code VARCHAR(150) UNIQUE NOT NULL, -- e.g. 'events.view', 'events.create', 'finance.view'
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);

-- 4. Role Permissions (Join Table)
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_role_permission UNIQUE (role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_rp_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_rp_permission ON role_permissions(permission_id);

-- 5. Organization Members (Team Memberships)
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    title VARCHAR(150),
    department VARCHAR(100),
    status VARCHAR(50) DEFAULT 'ACTIVE', -- 'INVITED', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_org_user_active ON organization_members(organization_id, user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_role ON organization_members(role_id);

-- 6. Organization Invitations (Secure Tokenized Email Invitations)
CREATE TABLE IF NOT EXISTS organization_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    invited_email VARCHAR(150) NOT NULL,
    invited_name VARCHAR(150),
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON organization_invitations(token_hash);
CREATE INDEX IF NOT EXISTS idx_invitations_lookup ON organization_invitations(organization_id, invited_email, status);

-- 7. Audit Logs (Immutable Security & Operation Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(150),
    action VARCHAR(100) NOT NULL, -- 'role.create', 'event.publish', 'team.invite', 'booking.refund'
    resource_type VARCHAR(100) NOT NULL, -- 'event', 'role', 'team_member', 'ticket'
    resource_id UUID,
    before_state JSONB,
    after_state JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_org_action ON audit_logs(organization_id, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);

-- 8. Apply Auto-Update Timestamp Triggers
DROP TRIGGER IF EXISTS set_timestamp_orgs ON organizations;
CREATE TRIGGER set_timestamp_orgs BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_roles ON roles;
CREATE TRIGGER set_timestamp_roles BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_org_members ON organization_members;
CREATE TRIGGER set_timestamp_org_members BEFORE UPDATE ON organization_members FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================================================
-- 9. SEEDING INITIAL PERMISSIONS TAXONOMY
-- ============================================================================

INSERT INTO permissions (module, action, code, name, description) VALUES
    -- Events Module
    ('events', 'view', 'events.view', 'View Events', 'Can view event details, listings, and summary analytics'),
    ('events', 'create', 'events.create', 'Create Events', 'Can draft and initiate new events in wizard'),
    ('events', 'edit', 'events.edit', 'Edit Events', 'Can update event details, dates, pricing, and programs'),
    ('events', 'delete', 'events.delete', 'Delete Events', 'Can soft-delete events and restore them'),
    ('events', 'publish', 'events.publish', 'Publish Events', 'Can publish events directly or submit for admin approval'),

    -- Stalls & Exhibitors Module
    ('stalls', 'view', 'stalls.view', 'View Stalls', 'Can view stall listings, layout, and applicant directory'),
    ('stalls', 'create', 'stalls.create', 'Create Stalls', 'Can add new stall categories, dimensions, and prices'),
    ('stalls', 'edit', 'stalls.edit', 'Edit Stalls', 'Can edit stall layout, pricing, and amenities'),
    ('stalls', 'approve', 'stalls.approve', 'Approve/Reject Stalls', 'Can review, approve, or reject exhibitor stall bookings'),
    ('stalls', 'delete', 'stalls.delete', 'Delete Stalls', 'Can remove or soft-delete stall inventory'),

    -- Gate Check-In & Badging
    ('checkin', 'view', 'checkin.view', 'View Check-In Dashboard', 'Can view live check-in counters and gate capacity'),
    ('checkin', 'scan', 'checkin.scan', 'Scan Tickets & Badges', 'Can execute QR code scanning to check in / checkout attendees'),

    -- Finance & Revenue
    ('finance', 'view', 'finance.view', 'View Finance', 'Can inspect revenue, ticket payouts, and invoices'),
    ('finance', 'export', 'finance.export', 'Export Financial Data', 'Can download financial ledgers, GST reports, and Excel sheets'),
    ('finance', 'refund', 'finance.refund', 'Issue Refunds', 'Can initiate ticket or stall booking refunds'),

    -- Team & Member Management
    ('team', 'view', 'team.view', 'View Team Members', 'Can view list of organization staff and members'),
    ('team', 'invite', 'team.invite', 'Invite Team Members', 'Can send email invitations to new team members'),
    ('team', 'edit', 'team.edit', 'Edit Team Members', 'Can change member titles, departments, or reassign roles'),
    ('team', 'delete', 'team.delete', 'Remove Team Members', 'Can suspend or remove members from organization'),

    -- Role & Permission Management
    ('roles', 'view', 'roles.view', 'View Roles', 'Can view available system and custom roles'),
    ('roles', 'create', 'roles.create', 'Create Custom Roles', 'Can define new custom roles and configure permissions'),
    ('roles', 'edit', 'roles.edit', 'Edit Custom Roles', 'Can modify permission assignments on custom roles'),
    ('roles', 'delete', 'roles.delete', 'Delete Custom Roles', 'Can delete custom roles with member reassignment'),

    -- Venues & Logistics
    ('venues', 'view', 'venues.view', 'View Venues', 'Can browse venue directory and floor layouts'),
    ('venues', 'manage', 'venues.manage', 'Manage Venues', 'Can create and update venues and attach documents')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 10. SEEDING SYSTEM ROLES & DEFAULT PERMISSION MAPPINGS
-- ============================================================================

-- 1. Super Admin (Global System Role)
INSERT INTO roles (id, organization_id, name, code, description, is_system_role, is_default)
VALUES ('00000000-0000-0000-0000-000000000001', NULL, 'Super Administrator', 'super_admin', 'Universal governance across all platform tenants', TRUE, FALSE)
ON CONFLICT DO NOTHING;

-- 2. Organization Owner (Default Owner of Tenant)
INSERT INTO roles (id, organization_id, name, code, description, is_system_role, is_default)
VALUES ('00000000-0000-0000-0000-000000000002', NULL, 'Organization Owner', 'org_owner', 'Full administrative authority over organization, team, and events', TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- 3. Event Manager Template Role
INSERT INTO roles (id, organization_id, name, code, description, is_system_role, is_default)
VALUES ('00000000-0000-0000-0000-000000000003', NULL, 'Event Manager', 'event_manager', 'Can manage events, stalls, and view team without financial access', TRUE, FALSE)
ON CONFLICT DO NOTHING;

-- 4. Finance Manager Template Role
INSERT INTO roles (id, organization_id, name, code, description, is_system_role, is_default)
VALUES ('00000000-0000-0000-0000-000000000004', NULL, 'Finance Manager', 'finance_manager', 'Can view and export financial metrics, payouts, and billing reports', TRUE, FALSE)
ON CONFLICT DO NOTHING;

-- 5. Gate Security / Scanner Template Role
INSERT INTO roles (id, organization_id, name, code, description, is_system_role, is_default)
VALUES ('00000000-0000-0000-0000-000000000005', NULL, 'Gate Security Scanner', 'gate_scanner', 'Gate check-in scanning only; no access to configuration or finances', TRUE, FALSE)
ON CONFLICT DO NOTHING;

-- Map ALL permissions to Super Admin & Organization Owner
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Map Event Manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', id FROM permissions 
WHERE module IN ('events', 'stalls', 'checkin', 'venues') OR code = 'team.view'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Map Finance Manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000004', id FROM permissions 
WHERE module IN ('finance') OR code IN ('events.view', 'stalls.view')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Map Gate Security Scanner permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000005', id FROM permissions 
WHERE code IN ('events.view', 'checkin.view', 'checkin.scan')
ON CONFLICT (role_id, permission_id) DO NOTHING;
