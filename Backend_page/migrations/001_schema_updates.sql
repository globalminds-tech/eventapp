-- ============================================================================
-- SUPABASE POSTGRESQL SCHEMA MIGRATION FILE
-- File: migrations/001_schema_updates.sql
-- Description: Run this SQL directly inside Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. Add Category Image Column to Category Master Table
ALTER TABLE category_master_table ADD COLUMN IF NOT EXISTS category_image TEXT;

-- 2. Add Pass Member Limits & Multi-Entry Counters to Event Booking Details Table
ALTER TABLE event_booking_details_table ADD COLUMN IF NOT EXISTS group_member_limit INTEGER DEFAULT 5;
ALTER TABLE event_booking_details_table ADD COLUMN IF NOT EXISTS max_reentries VARCHAR(50) DEFAULT 'Unlimited';

-- 3. Add Stall Quantity & Area Measurements to Event Stalls Table
ALTER TABLE event_stalls ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE event_stalls ADD COLUMN IF NOT EXISTS single_area_sqft FLOAT DEFAULT 100.0;
ALTER TABLE event_stalls ADD COLUMN IF NOT EXISTS total_area_sqft FLOAT DEFAULT 100.0;

-- 4. Add Payment Expiry Lock & Organizer Review Messages to Exhibitor Stall Bookings Table
ALTER TABLE "Exhibitor_stall_bookings" ADD COLUMN IF NOT EXISTS payment_expiry_at TIMESTAMP;
ALTER TABLE "Exhibitor_stall_bookings" ADD COLUMN IF NOT EXISTS approval_message TEXT;
ALTER TABLE "Exhibitor_stall_bookings" ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
