-- ============================================================================
-- BOOKMYEVENT ENTERPRISE DATABASE MASTER SCHEMA (MICROSOFT SQL SERVER / SSMS)
-- File: 01_schema_tables_and_constraints.sql
-- Target: eventapp_db
-- Generated directly from Active SQLAlchemy Models (100% Column Alignment)
-- ============================================================================

USE [eventapp_db];
GO

SET NOCOUNT ON;
GO

-- 1. Drop existing Foreign Keys and Tables cleanly to prevent Error 3726
DECLARE @dropFks NVARCHAR(MAX) = N'';
SELECT @dropFks += N'ALTER TABLE ' + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name) + N' DROP CONSTRAINT ' + QUOTENAME(f.name) + N';' + CHAR(13)
FROM sys.foreign_keys f
JOIN sys.tables t ON f.parent_object_id = t.object_id
JOIN sys.schemas s ON t.schema_id = s.schema_id;
IF LEN(@dropFks) > 0 EXEC sp_executesql @dropFks;
GO

DECLARE @dropTables NVARCHAR(MAX) = N'';
SELECT @dropTables += N'DROP TABLE ' + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name) + N';' + CHAR(13)
FROM sys.tables t
JOIN sys.schemas s ON t.schema_id = s.schema_id;
IF LEN(@dropTables) > 0 EXEC sp_executesql @dropTables;
GO
-- 2. Create tables with native SQL Server types
CREATE TABLE dbo.[category_master_table] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[name] NVARCHAR(100) NOT NULL,
[slug] NVARCHAR(150) NULL,
[subcategories] NVARCHAR(MAX) NULL,
[icon_name] NVARCHAR(50) NULL,
[category_image] NVARCHAR(MAX) NULL,
[status] NVARCHAR(20) NOT NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[created_by] UNIQUEIDENTIFIER NULL,
[updated_at] DATETIME2 NULL,
[updated_by] UNIQUEIDENTIFIER NULL,
[deleted_at] DATETIME2 NULL,
[deleted_by] UNIQUEIDENTIFIER NULL
);
GO

CREATE TABLE dbo.[category_requests] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[organizer_id] UNIQUEIDENTIFIER NULL,
[organizer_name] NVARCHAR(150) NULL,
[category_name] NVARCHAR(100) NOT NULL,
[subcategory_name] NVARCHAR(100) NULL,
[reason] NVARCHAR(MAX) NULL,
[status] NVARCHAR(20) NOT NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE()
);
GO

CREATE TABLE dbo.[chat_history] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[user_id] NVARCHAR(100) NULL,
[message] NVARCHAR(MAX) NULL,
[response] NVARCHAR(MAX) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE()
);
GO

CREATE TABLE dbo.[faq] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[question] NVARCHAR(MAX) NULL,
[answer] NVARCHAR(MAX) NULL,
[category] NVARCHAR(100) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE()
);
GO

CREATE TABLE dbo.[food_live_count] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[event_id] UNIQUEIDENTIFIER NULL,
[meal_time] NVARCHAR(50) NULL,
[meal_type] NVARCHAR(50) NULL,
[guests_inside] INTEGER NULL,
[total_capacity] INTEGER NULL,
[waiting_outside] INTEGER NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE()
);
GO

CREATE TABLE dbo.[my_contacts] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[name] NVARCHAR(255) NULL,
[email] NVARCHAR(255) NULL,
[mobile] NVARCHAR(20) NULL,
[user_type] NVARCHAR(100) NULL,
[group_name] NVARCHAR(100) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE()
);
GO

CREATE TABLE dbo.[permissions] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[module] NVARCHAR(100) NOT NULL,
[action] NVARCHAR(50) NOT NULL,
[code] NVARCHAR(150) NOT NULL,
[name] NVARCHAR(150) NOT NULL,
[description] NVARCHAR(MAX) NULL,
[scope] NVARCHAR(50) NOT NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE()
);
GO

CREATE TABLE dbo.[policies] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[policy_code] NVARCHAR(50) NULL,
[policy_name] NVARCHAR(255) NULL,
[policy_type] NVARCHAR(50) NULL,
[policy_group] NVARCHAR(100) NULL,
[description] NVARCHAR(MAX) NULL,
[file_path] NVARCHAR(MAX) NULL,
[document_type] NVARCHAR(50) NULL,
[document_number] NVARCHAR(100) NULL,
[document_file] NVARCHAR(MAX) NULL,
[organizer_id] UNIQUEIDENTIFIER NULL,
[status] NVARCHAR(20) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[created_by] NVARCHAR(150) NULL,
[modified_by] NVARCHAR(150) NULL,
[modified_on] DATETIME2 NULL
);
GO

CREATE TABLE dbo.[policy_documents] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[policy_id] UNIQUEIDENTIFIER NULL,
[document_type] NVARCHAR(50) NULL,
[document_number] NVARCHAR(100) NULL,
[document_file] NVARCHAR(MAX) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE()
);
GO

CREATE TABLE dbo.[sponsor_documents] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[sponsor_id] UNIQUEIDENTIFIER NULL,
[document_type] NVARCHAR(50) NULL,
[document_number] NVARCHAR(100) NULL,
[document_file] NVARCHAR(MAX) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE()
);
GO

CREATE TABLE dbo.[sponsors_details] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[sponsor_code] NVARCHAR(50) NULL,
[sponsor_name] NVARCHAR(150) NULL,
[primary_contact] NVARCHAR(20) NULL,
[secondary_contact] NVARCHAR(20) NULL,
[mail_id] NVARCHAR(150) NULL,
[address] NVARCHAR(MAX) NULL,
[status] NVARCHAR(20) NULL,
[organizer_id] UNIQUEIDENTIFIER NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[created_by] NVARCHAR(150) NULL,
[modified_by] NVARCHAR(150) NULL,
[modified_on] DATETIME2 NULL
);
GO

CREATE TABLE dbo.[todo_tasks] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[task_name] NVARCHAR(255) NOT NULL,
[task_description] NVARCHAR(MAX) NULL,
[todo_list_name] NVARCHAR(255) NULL,
[start_date] DATETIME2 NULL,
[end_date] DATETIME2 NULL,
[assigned_to] NVARCHAR(100) NULL,
[status] NVARCHAR(50) NULL,
[complete_percent] INTEGER NULL,
[remarks] NVARCHAR(MAX) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE()
);
GO

CREATE TABLE dbo.[users] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[name] NVARCHAR(100) NULL,
[email] NVARCHAR(100) NOT NULL,
[password] NVARCHAR(255) NOT NULL,
[roles] NVARCHAR(MAX) NULL,
[active_role] NVARCHAR(50) NULL,
[status] NVARCHAR(50) NULL,
[mobile] NVARCHAR(20) NULL,
[address] NVARCHAR(MAX) NULL,
[country] NVARCHAR(100) NULL,
[state] NVARCHAR(100) NULL,
[city] NVARCHAR(100) NULL,
[profile_image] NVARCHAR(MAX) NULL,
[organization_name] NVARCHAR(255) NULL,
[email_verified] BIT NULL,
[must_change_password] BIT NULL,
[locale] NVARCHAR(10) NULL,
[currency_preference] NVARCHAR(3) NULL,
[timezone] NVARCHAR(50) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[created_by] UNIQUEIDENTIFIER NULL,
[updated_at] DATETIME2 NULL,
[updated_by] UNIQUEIDENTIFIER NULL,
[deleted_at] DATETIME2 NULL,
[deleted_by] UNIQUEIDENTIFIER NULL
);
GO

CREATE TABLE dbo.[vendor_details] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[vendor_type] NVARCHAR(50) NULL,
[vendor_name] NVARCHAR(150) NULL,
[company_name] NVARCHAR(150) NULL,
[primary_contact] NVARCHAR(20) NULL,
[secondary_contact] NVARCHAR(20) NULL,
[mail_id] NVARCHAR(150) NULL,
[country] NVARCHAR(100) NULL,
[state] NVARCHAR(100) NULL,
[city] NVARCHAR(100) NULL,
[address] NVARCHAR(MAX) NULL,
[bank_name] NVARCHAR(150) NULL,
[account_holder] NVARCHAR(150) NULL,
[ifsc_code] NVARCHAR(50) NULL,
[account_number] NVARCHAR(50) NULL,
[bank_passbook] NVARCHAR(MAX) NULL,
[status] NVARCHAR(20) NULL,
[organizer_id] UNIQUEIDENTIFIER NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[created_by] NVARCHAR(150) NULL,
[modified_by] NVARCHAR(150) NULL,
[modified_on] DATETIME2 NULL
);
GO

CREATE TABLE dbo.[event_details_table] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[event_code] NVARCHAR(50) NULL,
[slug] NVARCHAR(255) NULL,
[category] NVARCHAR(100) NULL,
[sub_category] NVARCHAR(100) NULL,
[event_name] NVARCHAR(255) NULL,
[description] NVARCHAR(MAX) NULL,
[amenities] NVARCHAR(MAX) NULL,
[tags] NVARCHAR(MAX) NULL,
[visibility] NVARCHAR(50) NULL,
[include_program] NVARCHAR(10) NULL,
[mail] BIT NULL,
[whatsapp] BIT NULL,
[print] BIT NULL,
[visitor_mail] BIT NULL,
[visitor_name] BIT NULL,
[visitor_photo] BIT NULL,
[visitor_mobile] BIT NULL,
[document_proof] BIT NULL,
[day_pass] BIT NULL,
[is_international_include] BIT NULL,
[aadhar] BIT NULL,
[passport] BIT NULL,
[welcome_kit] BIT NULL,
[food] BIT NULL,
[vehicle_pass] BIT NULL,
[vehicle_number] BIT NULL,
[event_type] NVARCHAR(50) NULL,
[occurrence] NVARCHAR(50) NULL,
[start_date] DATETIME2 NULL,
[start_time] DATETIME2 NULL,
[end_date] DATETIME2 NULL,
[end_time] DATETIME2 NULL,
[venue] NVARCHAR(255) NULL,
[address] NVARCHAR(MAX) NULL,
[user_id] UNIQUEIDENTIFIER NULL,
[organization_id] UNIQUEIDENTIFIER NULL,
[status] NVARCHAR(50) NULL,
[currency_code] NVARCHAR(3) NULL,
[venue_total_area_sqft] DECIMAL(12, 2) NULL,
[approved_at] DATETIME2 NULL,
[rejected_at] DATETIME2 NULL,
[created_by] NVARCHAR(100) NULL,
[updated_by] UNIQUEIDENTIFIER NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[updated_at] DATETIME2 NULL,
[deleted_at] DATETIME2 NULL,
[deleted_by] UNIQUEIDENTIFIER NULL,
    CONSTRAINT [fk_event_details_table_deleted_by] FOREIGN KEY ([deleted_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_event_details_table_user_id] FOREIGN KEY ([user_id]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_event_details_table_updated_by] FOREIGN KEY ([updated_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[exhibitor_profiles] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[user_id] UNIQUEIDENTIFIER NOT NULL,
[company_name] NVARCHAR(255) NOT NULL,
[vendor_category] NVARCHAR(100) NULL,
[gstin] NVARCHAR(50) NULL,
[pan_number] NVARCHAR(50) NULL,
[business_address] NVARCHAR(MAX) NULL,
[city] NVARCHAR(100) NULL,
[state] NVARCHAR(100) NULL,
[pincode] NVARCHAR(20) NULL,
[website_url] NVARCHAR(255) NULL,
[bank_name] NVARCHAR(150) NULL,
[account_number] NVARCHAR(100) NULL,
[ifsc_code] NVARCHAR(50) NULL,
[account_holder] NVARCHAR(150) NULL,
[upi_id] NVARCHAR(100) NULL,
[kyc_status] NVARCHAR(50) NULL,
[organization_id] UNIQUEIDENTIFIER NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[created_by] UNIQUEIDENTIFIER NULL,
[updated_at] DATETIME2 NULL,
[updated_by] UNIQUEIDENTIFIER NULL,
[deleted_at] DATETIME2 NULL,
[deleted_by] UNIQUEIDENTIFIER NULL,
    CONSTRAINT [fk_exhibitor_profiles_user_id] FOREIGN KEY ([user_id]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_exhibitor_profiles_updated_by] FOREIGN KEY ([updated_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_exhibitor_profiles_deleted_by] FOREIGN KEY ([deleted_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_exhibitor_profiles_created_by] FOREIGN KEY ([created_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[gate_presets] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[name] NVARCHAR(150) NOT NULL,
[organizer_id] UNIQUEIDENTIFIER NOT NULL,
[created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [fk_gate_presets_organizer_id] FOREIGN KEY ([organizer_id]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[organizations] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[name] NVARCHAR(255) NOT NULL,
[slug] NVARCHAR(255) NOT NULL,
[org_type] NVARCHAR(50) NOT NULL,
[logo_url] NVARCHAR(MAX) NULL,
[website] NVARCHAR(255) NULL,
[owner_id] UNIQUEIDENTIFIER NOT NULL,
[status] NVARCHAR(50) NOT NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[created_by] UNIQUEIDENTIFIER NULL,
[updated_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[updated_by] UNIQUEIDENTIFIER NULL,
[deleted_at] DATETIME2 NULL,
[deleted_by] UNIQUEIDENTIFIER NULL,
    CONSTRAINT [fk_organizations_owner_id] FOREIGN KEY ([owner_id]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_organizations_created_by] FOREIGN KEY ([created_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_organizations_deleted_by] FOREIGN KEY ([deleted_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_organizations_updated_by] FOREIGN KEY ([updated_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[organizer_profiles] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[user_id] UNIQUEIDENTIFIER NOT NULL,
[company_name] NVARCHAR(255) NOT NULL,
[slug] NVARCHAR(255) NULL,
[business_type] NVARCHAR(100) NULL,
[gstin] NVARCHAR(50) NULL,
[pan_number] NVARCHAR(50) NULL,
[business_address] NVARCHAR(MAX) NULL,
[city] NVARCHAR(100) NULL,
[state] NVARCHAR(100) NULL,
[pincode] NVARCHAR(20) NULL,
[website_url] NVARCHAR(255) NULL,
[bank_name] NVARCHAR(150) NULL,
[account_number] NVARCHAR(100) NULL,
[ifsc_code] NVARCHAR(50) NULL,
[account_holder] NVARCHAR(150) NULL,
[upi_id] NVARCHAR(100) NULL,
[kyc_status] NVARCHAR(50) NULL,
[organization_id] UNIQUEIDENTIFIER NULL,
[default_currency] NVARCHAR(3) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[created_by] UNIQUEIDENTIFIER NULL,
[updated_at] DATETIME2 NULL,
[updated_by] UNIQUEIDENTIFIER NULL,
[deleted_at] DATETIME2 NULL,
[deleted_by] UNIQUEIDENTIFIER NULL,
    CONSTRAINT [fk_organizer_profiles_created_by] FOREIGN KEY ([created_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_organizer_profiles_updated_by] FOREIGN KEY ([updated_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_organizer_profiles_deleted_by] FOREIGN KEY ([deleted_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_organizer_profiles_user_id] FOREIGN KEY ([user_id]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[vendor_documents] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[vendor_id] UNIQUEIDENTIFIER NULL,
[document_type] NVARCHAR(50) NULL,
[document_number] NVARCHAR(100) NULL,
[document_file] NVARCHAR(MAX) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [fk_vendor_documents_vendor_id] FOREIGN KEY ([vendor_id]) REFERENCES dbo.[vendor_details]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[venues] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[venue_code] NVARCHAR(20) NULL,
[venue_name] NVARCHAR(200) NULL,
[address] NVARCHAR(MAX) NULL,
[country_name] NVARCHAR(100) NULL,
[state_name] NVARCHAR(100) NULL,
[city_name] NVARCHAR(100) NULL,
[pin_code] NVARCHAR(10) NULL,
[venue_image] NVARCHAR(MAX) NULL,
[total_area_sqft] FLOAT NULL,
[status] NVARCHAR(20) NULL,
[organizer_id] UNIQUEIDENTIFIER NULL,
[organization_id] UNIQUEIDENTIFIER NULL,
[latitude] DECIMAL(10, 7) NULL,
[longitude] DECIMAL(10, 7) NULL,
[google_place_id] NVARCHAR(255) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[created_by] NVARCHAR(150) NULL,
[updated_at] DATETIME2 NULL,
[updated_by] UNIQUEIDENTIFIER NULL,
[deleted_at] DATETIME2 NULL,
[deleted_by] UNIQUEIDENTIFIER NULL,
    CONSTRAINT [fk_venues_deleted_by] FOREIGN KEY ([deleted_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_venues_updated_by] FOREIGN KEY ([updated_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[audit_logs] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[organization_id] UNIQUEIDENTIFIER NULL,
[user_id] UNIQUEIDENTIFIER NULL,
[user_email] NVARCHAR(150) NULL,
[action] NVARCHAR(100) NOT NULL,
[resource_type] NVARCHAR(100) NOT NULL,
[resource_id] UNIQUEIDENTIFIER NULL,
[before_state] NVARCHAR(MAX) NULL,
[after_state] NVARCHAR(MAX) NULL,
[ip_address] NVARCHAR(45) NULL,
[user_agent] NVARCHAR(MAX) NULL,
[created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [fk_audit_logs_organization_id] FOREIGN KEY ([organization_id]) REFERENCES dbo.[organizations]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_audit_logs_user_id] FOREIGN KEY ([user_id]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[complaint] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[complaint_code] NVARCHAR(20) NULL,
[event_id] UNIQUEIDENTIFIER NULL,
[event_name] NVARCHAR(255) NULL,
[infrastructure_rating] INTEGER NULL,
[amenities_rating] INTEGER NULL,
[overall_experience_rating] INTEGER NULL,
[venue_locations_rating] INTEGER NULL,
[transportation_rating] INTEGER NULL,
[convenience_rating] INTEGER NULL,
[explanation] NVARCHAR(MAX) NULL,
[status] NVARCHAR(20) NULL,
[created_on] DATETIME2 NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [fk_complaint_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[event_booking_details] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[event_id] UNIQUEIDENTIFIER NULL,
[booking_start_date] DATETIME2 NULL,
[booking_end_date] DATETIME2 NULL,
[booking_start_time] NVARCHAR(20) NULL,
[booking_end_time] NVARCHAR(20) NULL,
[price_inr] DECIMAL(10, 2) NULL,
[capacity] INTEGER NULL,
[pass_type] NVARCHAR(50) NULL,
[group_member_limit] INTEGER NULL,
[title] NVARCHAR(100) NULL,
[title_type] NVARCHAR(50) NULL,
[title_selection] NVARCHAR(MAX) NULL,
[designation] NVARCHAR(100) NULL,
[designation_type] NVARCHAR(50) NULL,
[designation_selection] NVARCHAR(MAX) NULL,
[company] NVARCHAR(100) NULL,
[company_type] NVARCHAR(50) NULL,
[company_selection] NVARCHAR(MAX) NULL,
[entry_type] NVARCHAR(50) NULL,
[max_reentries] NVARCHAR(50) NULL,
[charge_type] NVARCHAR(50) NULL,
[max_pass] INTEGER NULL,
[razorpay_key] NVARCHAR(MAX) NULL,
[include_tax] BIT NULL,
[taxes] NVARCHAR(MAX) NULL,
[price_type] NVARCHAR(50) NULL,
[currency] NVARCHAR(50) NULL,
[currency_code] NVARCHAR(3) NULL,
[early_bird_expire] DATETIME2 NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[updated_at] DATETIME2 NULL,
[deleted_at] DATETIME2 NULL,
[deleted_by] UNIQUEIDENTIFIER NULL,
    CONSTRAINT [fk_event_booking_details_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_event_booking_details_deleted_by] FOREIGN KEY ([deleted_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[event_files] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[event_id] UNIQUEIDENTIFIER NULL,
[file_name] NVARCHAR(255) NULL,
[file_path] NVARCHAR(MAX) NULL,
[file_type] NVARCHAR(50) NULL,
[doc_type] NVARCHAR(100) NULL,
[doc_number] NVARCHAR(100) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [fk_event_files_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[event_food_items] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[event_id] UNIQUEIDENTIFIER NULL,
[caterer_name] NVARCHAR(150) NULL,
[meal_type] NVARCHAR(50) NULL,
[food_type] NVARCHAR(50) NULL,
[price_inr] DECIMAL(10, 2) NULL,
[price_usd] DECIMAL(10, 2) NULL,
[menu_details] NVARCHAR(MAX) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [fk_event_food_items_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[event_guests] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[event_id] UNIQUEIDENTIFIER NULL,
[guest_name] NVARCHAR(150) NULL,
[designation] NVARCHAR(150) NULL,
[contact] NVARCHAR(20) NULL,
[image] NVARCHAR(MAX) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [fk_event_guests_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[event_layout] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[event_id] UNIQUEIDENTIFIER NULL,
[floor_type] NVARCHAR(50) NULL,
[day_based] BIT NULL,
[person_pass] INTEGER NULL,
[include_tax] BIT NULL,
[taxes] NVARCHAR(MAX) NULL,
[overall_space_sqft] DECIMAL(12, 2) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[updated_at] DATETIME2 NULL,
    CONSTRAINT [fk_event_layout_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[event_programs] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[event_id] UNIQUEIDENTIFIER NULL,
[program_name] NVARCHAR(255) NULL,
[program_code] NVARCHAR(50) NULL,
[category] NVARCHAR(100) NULL,
[type] NVARCHAR(100) NULL,
[start_date] DATETIME2 NULL,
[end_date] DATETIME2 NULL,
[venue] NVARCHAR(255) NULL,
[max_participants] INTEGER NULL,
[budget] DECIMAL(10, 2) NULL,
[coordinator_name] NVARCHAR(150) NULL,
[coordinator_email] NVARCHAR(150) NULL,
[description] NVARCHAR(MAX) NULL,
[status] NVARCHAR(50) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [fk_event_programs_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[event_sponsors] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[event_id] UNIQUEIDENTIFIER NULL,
[sponsor_name] NVARCHAR(150) NULL,
[sponsorship_type] NVARCHAR(100) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [fk_event_sponsors_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[event_stalls] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[event_id] UNIQUEIDENTIFIER NULL,
[stall_name] NVARCHAR(255) NULL,
[stall_size] NVARCHAR(50) NULL,
[size_range] NVARCHAR(100) NULL,
[visibility] NVARCHAR(50) NULL,
[stall_type] NVARCHAR(50) NULL,
[price_inr] NVARCHAR(50) NULL,
[price_usd] NVARCHAR(50) NULL,
[prime_seat] BIT NULL,
[prime_price_inr] NVARCHAR(50) NULL,
[prime_price_usd] NVARCHAR(50) NULL,
[quantity] INTEGER NULL,
[single_area_sqft] FLOAT NULL,
[total_area_sqft] FLOAT NULL,
[currency_code] NVARCHAR(3) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[updated_at] DATETIME2 NULL,
[created_by] UNIQUEIDENTIFIER NULL,
[updated_by] UNIQUEIDENTIFIER NULL,
[deleted_at] DATETIME2 NULL,
[deleted_by] UNIQUEIDENTIFIER NULL,
    CONSTRAINT [fk_event_stalls_deleted_by] FOREIGN KEY ([deleted_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_event_stalls_updated_by] FOREIGN KEY ([updated_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_event_stalls_created_by] FOREIGN KEY ([created_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_event_stalls_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[event_terms] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[event_id] UNIQUEIDENTIFIER NOT NULL,
[policy_group] NVARCHAR(100) NULL,
[policy_type] NVARCHAR(100) NULL,
[policy_name] NVARCHAR(255) NULL,
[is_default] BIT NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [fk_event_terms_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[event_vehicle_addons] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[event_id] UNIQUEIDENTIFIER NULL,
[is_parent] BIT NULL,
[addon_name] NVARCHAR(150) NULL,
[price] DECIMAL(10, 2) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [fk_event_vehicle_addons_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[event_vehicle_details] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[event_id] UNIQUEIDENTIFIER NULL,
[vehicle_type] NVARCHAR(100) NULL,
[price_inr] DECIMAL(10, 2) NULL,
[price_usd] DECIMAL(10, 2) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [fk_event_vehicle_details_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[event_vendors] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[event_id] UNIQUEIDENTIFIER NULL,
[vendor_type] NVARCHAR(100) NULL,
[vendor_name] NVARCHAR(150) NULL,
[pass_count] INTEGER NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [fk_event_vendors_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[exhibitor_leads] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[event_id] UNIQUEIDENTIFIER NULL,
[user_id] UNIQUEIDENTIFIER NULL,
[visitor_name] NVARCHAR(150) NOT NULL,
[company_name] NVARCHAR(150) NULL,
[email] NVARCHAR(150) NOT NULL,
[mobile] NVARCHAR(20) NULL,
[buying_intent] NVARCHAR(50) NULL,
[notes] NVARCHAR(MAX) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [fk_exhibitor_leads_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[exhibitor_stall_bookings] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[event_id] UNIQUEIDENTIFIER NULL,
[user_id] UNIQUEIDENTIFIER NULL,
[title] NVARCHAR(10) NULL,
[first_name] NVARCHAR(100) NULL,
[last_name] NVARCHAR(100) NULL,
[email] NVARCHAR(150) NULL,
[mobile] NVARCHAR(20) NULL,
[event_name] NVARCHAR(100) NULL,
[designation] NVARCHAR(150) NULL,
[company_name] NVARCHAR(150) NULL,
[country] NVARCHAR(100) NULL,
[state] NVARCHAR(100) NULL,
[city] NVARCHAR(100) NULL,
[address] NVARCHAR(MAX) NULL,
[messages] NVARCHAR(MAX) NULL,
[pin_code] NVARCHAR(20) NULL,
[stall_area] NVARCHAR(50) NULL,
[products] NVARCHAR(100) NULL,
[visiting_card] NVARCHAR(255) NULL,
[status] NVARCHAR(50) NULL,
[approval_message] NVARCHAR(MAX) NULL,
[rejection_reason] NVARCHAR(MAX) NULL,
[payment_expiry_at] DATETIME2 NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [fk_exhibitor_stall_bookings_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[feedback_event] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[feedback_code] NVARCHAR(50) NULL,
[event_id] UNIQUEIDENTIFIER NOT NULL,
[event_name] NVARCHAR(255) NOT NULL,
[explanation] NVARCHAR(MAX) NULL,
[status] NVARCHAR(20) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[modified_on] DATETIME2 NULL,
    CONSTRAINT [fk_feedback_event_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[messages_greetings_table] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[event_id] UNIQUEIDENTIFIER NOT NULL,
[type] NVARCHAR(20) NOT NULL,
[message_group] NVARCHAR(255) NOT NULL,
[topics] NVARCHAR(255) NULL,
[sub_topics] NVARCHAR(255) NULL,
[description] NVARCHAR(MAX) NULL,
[image_path] NVARCHAR(MAX) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[updated_at] DATETIME2 NULL,
    CONSTRAINT [fk_messages_greetings_table_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[organizer_payouts] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[payout_ref] NVARCHAR(60) NOT NULL,
[organizer_user_id] UNIQUEIDENTIFIER NOT NULL,
[event_id] UNIQUEIDENTIFIER NULL,
[amount] DECIMAL(12, 2) NOT NULL,
[currency] NVARCHAR(5) NOT NULL,
[bank_name] NVARCHAR(100) NULL,
[account_number] NVARCHAR(50) NULL,
[ifsc_code] NVARCHAR(20) NULL,
[beneficiary_name] NVARCHAR(150) NULL,
[disbursement_mode] NVARCHAR(30) NOT NULL,
[utr_number] NVARCHAR(100) NULL,
[razorpayx_payout_id] NVARCHAR(100) NULL,
[status] NVARCHAR(30) NOT NULL,
[failure_reason] NVARCHAR(MAX) NULL,
[approved_by] UNIQUEIDENTIFIER NULL,
[settled_at] DATETIME2 NULL,
[created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [fk_organizer_payouts_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_organizer_payouts_organizer_user_id] FOREIGN KEY ([organizer_user_id]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_organizer_payouts_approved_by] FOREIGN KEY ([approved_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[roles] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[organization_id] UNIQUEIDENTIFIER NULL,
[name] NVARCHAR(100) NOT NULL,
[code] NVARCHAR(100) NOT NULL,
[description] NVARCHAR(MAX) NULL,
[is_system_role] BIT NOT NULL,
[is_default] BIT NOT NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[created_by] UNIQUEIDENTIFIER NULL,
[updated_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[updated_by] UNIQUEIDENTIFIER NULL,
[deleted_at] DATETIME2 NULL,
[deleted_by] UNIQUEIDENTIFIER NULL,
    CONSTRAINT [fk_roles_deleted_by] FOREIGN KEY ([deleted_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_roles_updated_by] FOREIGN KEY ([updated_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_roles_created_by] FOREIGN KEY ([created_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_roles_organization_id] FOREIGN KEY ([organization_id]) REFERENCES dbo.[organizations]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[stall_amenities] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[event_id] UNIQUEIDENTIFIER NULL,
[stall_name] NVARCHAR(255) NULL,
[amenity] NVARCHAR(255) NULL,
[qty] INTEGER NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [fk_stall_amenities_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[user_booking_details] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[event_id] UNIQUEIDENTIFIER NOT NULL,
[user_id] UNIQUEIDENTIFIER NULL,
[name] NVARCHAR(100) NOT NULL,
[email] NVARCHAR(150) NOT NULL,
[phone] NVARCHAR(15) NULL,
[food_preference] NVARCHAR(50) NULL,
[qr_data] NVARCHAR(MAX) NULL,
[ticket_code] NVARCHAR(60) NULL,
[scanner_id] NVARCHAR(50) NULL,
[is_scanned] BIT NULL,
[scanned_at] DATETIME2 NULL,
[is_checked_in] BIT NULL,
[checkin_at] DATETIME2 NULL,
[checkin_scanner_id] NVARCHAR(50) NULL,
[is_checked_out] BIT NULL,
[checkout_at] DATETIME2 NULL,
[checkout_scanner_id] NVARCHAR(50) NULL,
[total_checkins] INTEGER NULL,
[total_checkouts] INTEGER NULL,
[currency_code] NVARCHAR(3) NULL,
[amount_paid] DECIMAL(12, 2) NULL,
[subtotal_amount] DECIMAL(12, 2) NULL,
[tax_amount] DECIMAL(12, 2) NULL,
[ticket_count] INTEGER NULL,
[pass_type] NVARCHAR(50) NULL,
[group_size] INTEGER NULL,
[food_details] NVARCHAR(MAX) NULL,
[vehicle_details] NVARCHAR(MAX) NULL,
[vehicle_number] NVARCHAR(50) NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[updated_at] DATETIME2 NULL,
[updated_by] UNIQUEIDENTIFIER NULL,
[deleted_at] DATETIME2 NULL,
[deleted_by] UNIQUEIDENTIFIER NULL,
    CONSTRAINT [fk_user_booking_details_updated_by] FOREIGN KEY ([updated_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_user_booking_details_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_user_booking_details_deleted_by] FOREIGN KEY ([deleted_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[attendee_checkin_logs] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[booking_id] UNIQUEIDENTIFIER NOT NULL,
[ticket_code] NVARCHAR(60) NULL,
[event_id] UNIQUEIDENTIFIER NOT NULL,
[action] NVARCHAR(20) NOT NULL,
[gate_name] NVARCHAR(100) NULL,
[scanner_id] NVARCHAR(50) NULL,
[created_by] UNIQUEIDENTIFIER NULL,
[timestamp] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [fk_attendee_checkin_logs_created_by] FOREIGN KEY ([created_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_attendee_checkin_logs_booking_id] FOREIGN KEY ([booking_id]) REFERENCES dbo.[user_booking_details]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[event_transactions] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[transaction_ref] NVARCHAR(50) NOT NULL,
[event_id] UNIQUEIDENTIFIER NULL,
[booking_id] UNIQUEIDENTIFIER NULL,
[stall_booking_id] UNIQUEIDENTIFIER NULL,
[payer_user_id] UNIQUEIDENTIFIER NULL,
[organizer_user_id] UNIQUEIDENTIFIER NULL,
[transaction_type] NVARCHAR(50) NOT NULL,
[description] NVARCHAR(MAX) NULL,
[currency] NVARCHAR(5) NOT NULL,
[gross_amount] DECIMAL(12, 2) NOT NULL,
[tax_amount] DECIMAL(12, 2) NOT NULL,
[platform_fee] DECIMAL(12, 2) NOT NULL,
[gateway_fee] DECIMAL(12, 2) NOT NULL,
[net_organizer_amount] DECIMAL(12, 2) NOT NULL,
[payment_gateway] NVARCHAR(50) NULL,
[gateway_order_id] NVARCHAR(100) NULL,
[gateway_payment_id] NVARCHAR(100) NULL,
[gateway_signature] NVARCHAR(255) NULL,
[raw_gateway_response] NVARCHAR(MAX) NULL,
[status] NVARCHAR(30) NOT NULL,
[escrow_status] NVARCHAR(30) NOT NULL,
[created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [fk_event_transactions_booking_id] FOREIGN KEY ([booking_id]) REFERENCES dbo.[user_booking_details]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_event_transactions_organizer_user_id] FOREIGN KEY ([organizer_user_id]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_event_transactions_stall_booking_id] FOREIGN KEY ([stall_booking_id]) REFERENCES dbo.[exhibitor_stall_bookings]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_event_transactions_payer_user_id] FOREIGN KEY ([payer_user_id]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_event_transactions_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[organization_invitations] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[organization_id] UNIQUEIDENTIFIER NOT NULL,
[role_id] UNIQUEIDENTIFIER NOT NULL,
[invited_email] NVARCHAR(150) NOT NULL,
[invited_name] NVARCHAR(150) NULL,
[token_hash] NVARCHAR(255) NOT NULL,
[status] NVARCHAR(50) NOT NULL,
[expires_at] DATETIME2 NOT NULL,
[accepted_at] DATETIME2 NULL,
[accepted_by_user_id] UNIQUEIDENTIFIER NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[created_by] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [fk_organization_invitations_organization_id] FOREIGN KEY ([organization_id]) REFERENCES dbo.[organizations]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_organization_invitations_created_by] FOREIGN KEY ([created_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_organization_invitations_accepted_by_user_id] FOREIGN KEY ([accepted_by_user_id]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_organization_invitations_role_id] FOREIGN KEY ([role_id]) REFERENCES dbo.[roles]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[organization_members] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[organization_id] UNIQUEIDENTIFIER NOT NULL,
[user_id] UNIQUEIDENTIFIER NOT NULL,
[role_id] UNIQUEIDENTIFIER NOT NULL,
[title] NVARCHAR(150) NULL,
[department] NVARCHAR(100) NULL,
[status] NVARCHAR(50) NOT NULL,
[joined_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[created_by] UNIQUEIDENTIFIER NULL,
[updated_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[updated_by] UNIQUEIDENTIFIER NULL,
[deleted_at] DATETIME2 NULL,
[deleted_by] UNIQUEIDENTIFIER NULL,
    CONSTRAINT [fk_organization_members_user_id] FOREIGN KEY ([user_id]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_organization_members_deleted_by] FOREIGN KEY ([deleted_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_organization_members_organization_id] FOREIGN KEY ([organization_id]) REFERENCES dbo.[organizations]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_organization_members_updated_by] FOREIGN KEY ([updated_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_organization_members_created_by] FOREIGN KEY ([created_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_organization_members_role_id] FOREIGN KEY ([role_id]) REFERENCES dbo.[roles]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[role_permissions] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[role_id] UNIQUEIDENTIFIER NOT NULL,
[permission_id] UNIQUEIDENTIFIER NOT NULL,
[created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
[created_by] UNIQUEIDENTIFIER NULL,
    CONSTRAINT [fk_role_permissions_created_by] FOREIGN KEY ([created_by]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_role_permissions_permission_id] FOREIGN KEY ([permission_id]) REFERENCES dbo.[permissions]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_role_permissions_role_id] FOREIGN KEY ([role_id]) REFERENCES dbo.[roles]([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.[financial_invoices] (
[id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
[invoice_number] NVARCHAR(60) NOT NULL,
[invoice_type] NVARCHAR(40) NOT NULL,
[recipient_user_id] UNIQUEIDENTIFIER NULL,
[event_id] UNIQUEIDENTIFIER NULL,
[transaction_id] UNIQUEIDENTIFIER NULL,
[billing_name] NVARCHAR(150) NOT NULL,
[billing_email] NVARCHAR(150) NULL,
[billing_address] NVARCHAR(MAX) NULL,
[billing_gstin] NVARCHAR(30) NULL,
[subtotal] DECIMAL(12, 2) NOT NULL,
[cgst] DECIMAL(12, 2) NOT NULL,
[sgst] DECIMAL(12, 2) NOT NULL,
[igst] DECIMAL(12, 2) NOT NULL,
[total_amount] DECIMAL(12, 2) NOT NULL,
[pdf_url] NVARCHAR(MAX) NULL,
[status] NVARCHAR(30) NOT NULL,
[created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [fk_financial_invoices_event_id] FOREIGN KEY ([event_id]) REFERENCES dbo.[event_details_table]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_financial_invoices_recipient_user_id] FOREIGN KEY ([recipient_user_id]) REFERENCES dbo.[users]([id]) ON DELETE NO ACTION,
    CONSTRAINT [fk_financial_invoices_transaction_id] FOREIGN KEY ([transaction_id]) REFERENCES dbo.[event_transactions]([id]) ON DELETE NO ACTION
);
GO

PRINT '01_schema_tables_and_constraints.sql completed successfully with 100% column alignment!';
GO
