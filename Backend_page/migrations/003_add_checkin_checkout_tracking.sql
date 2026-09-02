-- ============================================================================
-- SUPABASE POSTGRESQL SCHEMA MIGRATION FILE
-- File: migrations/003_add_checkin_checkout_tracking.sql
-- Description: Run this SQL directly inside Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. Add Check-in & Check-out Tracking Columns to user_booking_details
ALTER TABLE user_booking_details ADD COLUMN IF NOT EXISTS is_checked_in BOOLEAN DEFAULT FALSE;
ALTER TABLE user_booking_details ADD COLUMN IF NOT EXISTS checkin_at TIMESTAMP;
ALTER TABLE user_booking_details ADD COLUMN IF NOT EXISTS checkin_scanner_id VARCHAR(50);

ALTER TABLE user_booking_details ADD COLUMN IF NOT EXISTS is_checked_out BOOLEAN DEFAULT FALSE;
ALTER TABLE user_booking_details ADD COLUMN IF NOT EXISTS checkout_at TIMESTAMP;
ALTER TABLE user_booking_details ADD COLUMN IF NOT EXISTS checkout_scanner_id VARCHAR(50);

ALTER TABLE user_booking_details ADD COLUMN IF NOT EXISTS total_checkins INTEGER DEFAULT 0;
ALTER TABLE user_booking_details ADD COLUMN IF NOT EXISTS total_checkouts INTEGER DEFAULT 0;

-- 2. Create Audit Log Table for Multi-Entry Gate Activity
CREATE TABLE IF NOT EXISTS attendee_checkin_logs (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES user_booking_details(id) ON DELETE CASCADE,
    ticket_code VARCHAR(60),
    event_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'CHECK_IN' or 'CHECK_OUT'
    gate_name VARCHAR(100),
    scanner_id VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Enable RLS and Create Permissive Policy for Backend Access
ALTER TABLE attendee_checkin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role full access on attendee_checkin_logs" ON attendee_checkin_logs FOR ALL USING (true);

-- 4. Create Performance Index on Ticket Code and Action Logs
CREATE INDEX IF NOT EXISTS idx_ubd_ticket_code ON user_booking_details(ticket_code);
CREATE INDEX IF NOT EXISTS idx_acl_booking_id ON attendee_checkin_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_acl_event_id ON attendee_checkin_logs(event_id);
