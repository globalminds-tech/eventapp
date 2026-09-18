-- ============================================================================
-- BOOKMYEVENT ENTERPRISE DATABASE MASTER SEED SCRIPT (MICROSOFT SQL SERVER / SSMS)
-- File: 02_seed_superadmin_and_screens.sql
-- Engine: Microsoft SQL Server (T-SQL)
-- Target: eventapp_db
-- Architecture: Super Admin Account, System Roles, Granular Screen Permissions, Master Categories
-- ============================================================================

USE [eventapp_db];
GO

SET NOCOUNT ON;
GO

-- ============================================================================
-- 1. SEED SUPER ADMIN USER
-- Credentials: bookmyevent2026@gmail.com / admin@#$123
-- ============================================================================

DECLARE @SuperAdminId UNIQUEIDENTIFIER;

IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'bookmyevent2026@gmail.com')
BEGIN
    SET @SuperAdminId = NEWID();
    INSERT INTO dbo.users (
        id, name, email, password, roles, active_role, 
        status, email_verified, must_change_password, currency_preference, locale
    ) VALUES (
        @SuperAdminId,
        N'Super Administrator',
        N'bookmyevent2026@gmail.com',
        -- Werkzeug scrypt hash for 'admin@#$123'
        N'scrypt:32768:8:1$tpaOlynRaGfhbM4H$3cc0afaf1a10432a147b0a47d72ac192542b7acc1f0cf698ab49e34f1e32ac4ee8a18efa5add0d4ed61cdf6581b00a5ccf1086e65a9a3684bdda4b112de365c6',
        N'["superuser", "superadmin"]',
        N'superuser',
        N'ACTIVE',
        1,
        0,
        N'INR',
        N'en_IN'
    );
    PRINT 'Super Admin user created successfully: bookmyevent2026@gmail.com';
END
ELSE
BEGIN
    SELECT @SuperAdminId = id FROM dbo.users WHERE email = 'bookmyevent2026@gmail.com';
    PRINT 'Super Admin user already exists.';
END
GO

-- ============================================================================
-- 2. SEED SYSTEM ROLES (The 4 Core Platform Identities)
-- ============================================================================

-- Clean up any deprecated template roles so only core global roles exist
DELETE FROM dbo.role_permissions 
WHERE role_id IN (
    SELECT id FROM dbo.roles 
    WHERE code IN ('event_manager', 'finance_manager', 'checkin_staff') AND organization_id IS NULL
);

DELETE FROM dbo.roles 
WHERE code IN ('event_manager', 'finance_manager', 'checkin_staff') AND organization_id IS NULL;

-- 2.1 Super Admin (Global Platform Administrator)
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE code = 'superuser' AND organization_id IS NULL)
BEGIN
    INSERT INTO dbo.roles (id, organization_id, name, code, description, is_system_role, is_default)
    VALUES (NEWID(), NULL, N'Super Admin', N'superuser', N'Platform super administrator with unrestricted access to all modules and configurations', 1, 0);
END

-- 2.2 Organizer Admin (Event Organizer Owner)
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE code = 'organizer' AND organization_id IS NULL)
BEGIN
    INSERT INTO dbo.roles (id, organization_id, name, code, description, is_system_role, is_default)
    VALUES (NEWID(), NULL, N'Organizer Admin', N'organizer', N'Full management access to organization events, stalls, finances, and team members', 1, 1);
END

-- 2.3 Exhibitor Owner (Exhibitor Business Owner)
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE code = 'exhibitor' AND organization_id IS NULL)
BEGIN
    INSERT INTO dbo.roles (id, organization_id, name, code, description, is_system_role, is_default)
    VALUES (NEWID(), NULL, N'Exhibitor Owner', N'exhibitor', N'Can view stall layout, reserve stalls, manage booth profile, and track visitors', 1, 1);
END

-- 2.4 Attendee User (Standard Customer / Visitor)
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE code = 'user' AND organization_id IS NULL)
BEGIN
    INSERT INTO dbo.roles (id, organization_id, name, code, description, is_system_role, is_default)
    VALUES (NEWID(), NULL, N'Attendee User', N'user', N'Standard customer role for booking tickets and viewing public events', 1, 1);
END
PRINT 'System roles verified and seeded (4 Core Global Identities: superuser, organizer, exhibitor, user).';
GO

-- ============================================================================
-- 3. SEED SCREEN & RBAC PERMISSIONS (Registry)
-- ============================================================================

DECLARE @Perms TABLE (
    module NVARCHAR(100),
    action NVARCHAR(50),
    code NVARCHAR(150),
    name NVARCHAR(150),
    description NVARCHAR(MAX),
    scope NVARCHAR(50)
);

INSERT INTO @Perms VALUES
-- Events Module
(N'events', N'view', N'events.view', N'View Events', N'Can view event listings, details, and summary stats', N'ORGANIZER'),
(N'events', N'create', N'events.create', N'Create Events', N'Can initiate and draft new events in wizard', N'ORGANIZER'),
(N'events', N'edit', N'events.edit', N'Edit Events', N'Can update event details, dates, pricing, and programs', N'ORGANIZER'),
(N'events', N'delete', N'events.delete', N'Delete Events', N'Can soft-delete events and restore them', N'ORGANIZER'),
(N'events', N'publish', N'events.publish', N'Publish Events', N'Can publish events directly or submit for admin approval', N'ORGANIZER'),

-- Stalls & Exhibitors Module
(N'stalls', N'view', N'stalls.view', N'View Stalls', N'Can view stall listings, layout, and applicant directory', N'GLOBAL'),
(N'stalls', N'create', N'stalls.create', N'Create Stalls', N'Can add new stall categories, dimensions, and prices', N'ORGANIZER'),
(N'stalls', N'edit', N'stalls.edit', N'Edit Stalls', N'Can edit stall layout, pricing, and amenities', N'ORGANIZER'),
(N'stalls', N'approve', N'stalls.approve', N'Approve/Reject Stalls', N'Can review, approve, or reject exhibitor stall bookings', N'ORGANIZER'),
(N'stalls', N'delete', N'stalls.delete', N'Delete Stalls', N'Can remove or soft-delete stall inventory', N'ORGANIZER'),

-- Gate Check-In & Badging
(N'checkin', N'view', N'checkin.view', N'View Check-In Dashboard', N'Can view live check-in counters and gate capacity', N'ORGANIZER'),
(N'checkin', N'scan', N'checkin.scan', N'Scan Tickets & Badges', N'Can execute QR code scanning to check in / checkout attendees', N'ORGANIZER'),

-- Finance & Revenue
(N'finance', N'view', N'finance.view', N'View Finance', N'Can inspect revenue, ticket payouts, and invoices', N'ORGANIZER'),
(N'finance', N'export', N'finance.export', N'Export Financial Data', N'Can download financial ledgers, GST reports, and Excel sheets', N'ORGANIZER'),
(N'finance', N'refund', N'finance.refund', N'Issue Refunds', N'Can initiate ticket or stall booking refunds', N'ORGANIZER'),

-- Team & Member Management
(N'team', N'view', N'team.view', N'View Team Members', N'Can view list of organization staff and members', N'ORGANIZER'),
(N'team', N'invite', N'team.invite', N'Invite Team Members', N'Can send email invitations to new team members', N'ORGANIZER'),
(N'team', N'edit', N'team.edit', N'Edit Team Members', N'Can change member titles, departments, or reassign roles', N'ORGANIZER'),
(N'team', N'delete', N'team.delete', N'Remove Team Members', N'Can suspend or remove members from organization', N'ORGANIZER'),

-- Role & Access Control
(N'roles', N'view', N'roles.view', N'View Roles', N'Can view available system and custom roles', N'ORGANIZER'),
(N'roles', N'create', N'roles.create', N'Create Custom Roles', N'Can define new custom roles and configure permissions', N'ORGANIZER'),
(N'roles', N'edit', N'roles.edit', N'Edit Custom Roles', N'Can modify permission assignments on custom roles', N'ORGANIZER'),
(N'roles', N'delete', N'roles.delete', N'Delete Custom Roles', N'Can delete custom roles with member reassignment', N'ORGANIZER'),

-- Venues & Logistics
(N'venues', N'view', N'venues.view', N'View Venues', N'Can browse venue directory and floor layouts', N'ORGANIZER'),
(N'venues', N'manage', N'venues.manage', N'Manage Venues', N'Can create and update venues and attach documents', N'ORGANIZER'),

-- Master Data & Directories
(N'master_data', N'view', N'master_data.view', N'View Master Data', N'Can browse master directories: Venues, Vendors, Policies, and Sponsors', N'ORGANIZER'),
(N'master_data', N'create', N'master_data.create', N'Create Master Data', N'Can add new Venues, Vendors, Policies, and Sponsors', N'ORGANIZER'),
(N'master_data', N'edit', N'master_data.edit', N'Edit Master Data', N'Can update existing Venues, Vendors, Policies, and Sponsors', N'ORGANIZER'),
(N'master_data', N'delete', N'master_data.delete', N'Delete Master Data', N'Can remove Venues, Vendors, Policies, and Sponsors', N'ORGANIZER'),

-- Dashboard & Executive Analytics
(N'dashboard', N'view', N'dashboard.view', N'View Executive Dashboard', N'Can access executive analytics, revenue KPIs, and event statistics', N'ORGANIZER'),

-- ============================================================================
-- Exhibitor Suite Modules (18 Granular Permissions)
-- ============================================================================
-- Executive Dashboard
(N'exhibitor_dashboard', N'view', N'exhibitor.dashboard.view', N'View Booth Dashboard', N'Can access booth KPIs, spend summary, active reservations, and lead counters', N'EXHIBITOR'),

-- Upcoming Expos & Floorplans
(N'exhibitor_events', N'browse', N'exhibitor.events.browse', N'Browse Upcoming Expos', N'Can browse upcoming expos, event dates, venues, and registration deadlines', N'EXHIBITOR'),
(N'exhibitor_events', N'floorplan', N'exhibitor.events.floorplan', N'View Floor Plans & Layouts', N'Can inspect expo hall floor plans, stall dimensions, and layout blueprints', N'EXHIBITOR'),

-- Stall Reservations & Amenities
(N'exhibitor_stalls', N'view', N'exhibitor.stalls.view', N'View My Bookings', N'Can inspect booked stalls, application status, stall number, and approvals', N'EXHIBITOR'),
(N'exhibitor_stalls', N'book', N'exhibitor.stalls.book', N'Book Exhibition Stalls', N'Can submit stall booking applications, select stall categories, and upload credentials', N'EXHIBITOR'),
(N'exhibitor_stalls', N'manage', N'exhibitor.stalls.manage', N'Manage Stall Preferences', N'Can request corner booth preferences, custom dimensions, and power amenities', N'EXHIBITOR'),
(N'exhibitor_stalls', N'cancel', N'exhibitor.stalls.cancel', N'Cancel Stall Application', N'Can withdraw or cancel pending stall reservation applications before approval', N'EXHIBITOR'),

-- Visitor Leads & Buyer Inquiries
(N'exhibitor_leads', N'view', N'exhibitor.leads.view', N'View Visitor Leads', N'Can browse visitor contacts, inquiries, and leads captured at the stall', N'EXHIBITOR'),
(N'exhibitor_leads', N'create', N'exhibitor.leads.create', N'Capture & Log Spot Leads', N'Can log new on-site buyer inquiries, set buying intent, and record discussion notes', N'EXHIBITOR'),
(N'exhibitor_leads', N'export', N'exhibitor.leads.export', N'Export Visitor Leads', N'Can download collected attendee leads into CSV/Excel spreadsheets', N'EXHIBITOR'),

-- Billings, Invoices & Finance
(N'exhibitor_billing', N'view', N'exhibitor.billing.view', N'View Stall Invoices & Ledgers', N'Can view stall rental payment ledgers, payment lock status, and fee breakdowns', N'EXHIBITOR'),
(N'exhibitor_billing', N'download', N'exhibitor.billing.download', N'Download GST Tax Invoices', N'Can print and download official 18% GST tax invoices and payment receipts', N'EXHIBITOR'),

-- Organization & Booth Team Governance
(N'exhibitor_team', N'view', N'exhibitor.team.view', N'View Booth Team', N'Can view list of active booth representatives, designations, and staff roster', N'EXHIBITOR'),
(N'exhibitor_team', N'invite', N'exhibitor.team.invite', N'Invite Booth Members', N'Can send email invitations to new booth staff and product demo hosts', N'EXHIBITOR'),
(N'exhibitor_team', N'edit', N'exhibitor.team.edit', N'Edit Team Members', N'Can update staff designations, contact details, and reassign roles', N'EXHIBITOR'),
(N'exhibitor_team', N'remove', N'exhibitor.team.remove', N'Remove Booth Members', N'Can deactivate or remove booth staff accounts from the organization', N'EXHIBITOR'),
(N'exhibitor_team', N'roles_view', N'exhibitor.roles.view', N'View Roles', N'Can view available system and custom booth roles', N'EXHIBITOR'),
(N'exhibitor_team', N'roles_manage', N'exhibitor.roles.manage', N'Manage Custom Roles', N'Can create, edit, and configure custom booth roles and permission sets', N'EXHIBITOR');

INSERT INTO dbo.permissions (id, module, action, code, name, description, scope)
SELECT NEWID(), p.module, p.action, p.code, p.name, p.description, p.scope
FROM @Perms p
WHERE NOT EXISTS (SELECT 1 FROM dbo.permissions WHERE code = p.code);

PRINT 'Screen and RBAC permissions seeded successfully (48 total permissions).';
GO

-- ============================================================================
-- 4. MAP PERMISSIONS TO SYSTEM ROLES
-- ============================================================================

-- 4.1 Grant ALL permissions to Super Admin role
INSERT INTO dbo.role_permissions (id, role_id, permission_id)
SELECT NEWID(), r.id, p.id
FROM dbo.roles r
CROSS JOIN dbo.permissions p
WHERE r.code IN ('superuser', 'superadmin')
  AND NOT EXISTS (
      SELECT 1 FROM dbo.role_permissions rp 
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- 4.2 Grant Organizer Admin permissions
INSERT INTO dbo.role_permissions (id, role_id, permission_id)
SELECT NEWID(), r.id, p.id
FROM dbo.roles r
CROSS JOIN dbo.permissions p
WHERE r.code = 'organizer'
  AND p.scope IN ('ORGANIZER', 'GLOBAL')
  AND NOT EXISTS (
      SELECT 1 FROM dbo.role_permissions rp 
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- 4.3 Grant Exhibitor permissions
INSERT INTO dbo.role_permissions (id, role_id, permission_id)
SELECT NEWID(), r.id, p.id
FROM dbo.roles r
CROSS JOIN dbo.permissions p
WHERE r.code = 'exhibitor'
  AND (p.scope = 'EXHIBITOR' OR p.code LIKE 'exhibitor.%' OR p.code = 'stalls.view')
  AND NOT EXISTS (
      SELECT 1 FROM dbo.role_permissions rp 
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

PRINT 'Role permission mappings configured (superuser, organizer, exhibitor).';
GO

-- ============================================================================
-- 5. SEED MASTER CATEGORIES & SUBCATEGORIES
-- ============================================================================

DECLARE @Cats TABLE (
    name NVARCHAR(100),
    slug NVARCHAR(150),
    subcategories NVARCHAR(MAX),
    icon_name NVARCHAR(50)
);

INSERT INTO @Cats VALUES
(N'Exhibition', N'exhibition', N'Trade Shows, Tech Expos, Art & Design Exhibitions, Auto Shows & Mobility, Property & Real Estate Expo', N'Store'),
(N'Conference', N'conference', N'Tech Summit & AI, Academic & Research, Business & Leadership, Medical & Healthcare', N'Briefcase'),
(N'Concert', N'concert', N'Live Music & Bands, Music Festival, EDM & DJ Nights, Classical & Acoustic', N'Music'),
(N'Sports', N'sports', N'Cricket Tournament, Marathon & Running, Esports & Gaming Championship, Fitness & Crossfit Challenge', N'Activity'),
(N'Cultural', N'cultural', N'Food & Wine Festival, Cultural Carnival & Fair, Theatre & Stand-up Comedy', N'Smile'),
(N'Workshop', N'workshop', N'Professional Masterclass, Coding & Tech Bootcamp, Design & UI/UX Sprint, Photography & Creative Arts', N'BookOpen'),
(N'Meetup', N'meetup', N'Networking Mixer, Community Gathering, Startup Pitch Night', N'Users');

INSERT INTO dbo.category_master_table (id, name, slug, subcategories, icon_name, status)
SELECT NEWID(), c.name, c.slug, c.subcategories, c.icon_name, N'Active'
FROM @Cats c
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.category_master_table WHERE name = c.name
);

PRINT 'Master categories and subcategories seeded successfully.';
GO

PRINT '02_seed_superadmin_and_screens.sql completed successfully!';
GO
