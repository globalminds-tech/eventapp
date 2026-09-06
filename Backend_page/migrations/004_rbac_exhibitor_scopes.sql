-- ============================================================================
-- Migration: 004_rbac_exhibitor_scopes.sql
-- Description: Add workspace scope to permissions (ORGANIZER vs EXHIBITOR)
--              and seed dedicated Exhibitor screens and capabilities.
-- ============================================================================

-- 1. Add scope column to permissions
ALTER TABLE permissions 
ADD COLUMN IF NOT EXISTS scope VARCHAR(50) DEFAULT 'ORGANIZER' NOT NULL;

CREATE INDEX IF NOT EXISTS idx_permissions_scope ON permissions(scope);

-- 2. Ensure existing organizer permissions have scope = 'ORGANIZER'
UPDATE permissions 
SET scope = 'ORGANIZER' 
WHERE scope IS NULL OR scope = '';

-- 3. Seed Dedicated Exhibitor Permissions
INSERT INTO permissions (module, action, code, name, description, scope) VALUES
-- Upcoming Expos & Floor Plans
('exhibitor_events', 'browse', 'exhibitor.events.browse', 'Browse Upcoming Expos', 'Can explore upcoming expos, event dates, floor plans, and venue details', 'EXHIBITOR'),

-- Stall Bookings & Amenities
('exhibitor_stalls', 'book', 'exhibitor.stalls.book', 'Book Stalls', 'Can reserve stalls, select booth numbers, and submit booking applications', 'EXHIBITOR'),
('exhibitor_stalls', 'view', 'exhibitor.stalls.view', 'View My Bookings', 'Can inspect booked stalls, stall status, allocation numbers, and approvals', 'EXHIBITOR'),
('exhibitor_stalls', 'manage', 'exhibitor.stalls.manage', 'Manage Stall Amenities', 'Can request extra power supply, display furniture, and booth amenities', 'EXHIBITOR'),

-- Visitor Leads & Badge Scanning
('exhibitor_leads', 'view', 'exhibitor.leads.view', 'View Visitor Leads', 'Can browse visitor contacts, inquiries, and leads captured at the stall', 'EXHIBITOR'),
('exhibitor_leads', 'export', 'exhibitor.leads.export', 'Export Visitor Leads', 'Can download collected attendee leads into CSV/Excel spreadsheets', 'EXHIBITOR'),
('exhibitor_leads', 'scan', 'exhibitor.leads.scan', 'Scan Visitor Badges', 'Can use badge scanner on mobile or web to capture visitor contact info', 'EXHIBITOR'),

-- Booth Staff & Pass Allocation
('exhibitor_booth', 'manage', 'exhibitor.booth.manage', 'Manage Booth Staff & Badges', 'Can allocate staff exhibitor passes, badges, and booth schedules', 'EXHIBITOR'),

-- Invoices & Receipts
('exhibitor_billing', 'view', 'exhibitor.billing.view', 'View Stall Invoices & Receipts', 'Can view stall rental payment ledgers, GST tax invoices, and receipts', 'EXHIBITOR'),

-- Booth Team & Role Governance
('exhibitor_team', 'view', 'exhibitor.team.view', 'View Booth Team', 'Can view list of active booth representatives and team members', 'EXHIBITOR'),
('exhibitor_team', 'invite', 'exhibitor.team.invite', 'Invite Booth Members', 'Can send email invitations to new booth staff and product demo hosts', 'EXHIBITOR'),
('exhibitor_team', 'edit', 'exhibitor.team.edit', 'Edit Booth Members', 'Can update staff designations, contact details, and reassign roles', 'EXHIBITOR'),
('exhibitor_team', 'remove', 'exhibitor.team.remove', 'Remove Booth Members', 'Can deactivate or remove booth staff accounts from the organization', 'EXHIBITOR'),
('exhibitor_team', 'manage', 'exhibitor.roles.manage', 'Manage Booth Roles', 'Can create, edit, and configure custom roles for booth staff', 'EXHIBITOR')

ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    module = EXCLUDED.module,
    action = EXCLUDED.action,
    scope = EXCLUDED.scope;
