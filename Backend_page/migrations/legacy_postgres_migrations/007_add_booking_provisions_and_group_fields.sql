-- Migration 007: Add ticket booking group size, pass type, and provisions snapshot to user_booking_details
ALTER TABLE user_booking_details ADD COLUMN IF NOT EXISTS ticket_count INTEGER DEFAULT 1;
ALTER TABLE user_booking_details ADD COLUMN IF NOT EXISTS pass_type VARCHAR(50) DEFAULT 'Single Pass';
ALTER TABLE user_booking_details ADD COLUMN IF NOT EXISTS group_size INTEGER DEFAULT 1;
ALTER TABLE user_booking_details ADD COLUMN IF NOT EXISTS food_details TEXT;
ALTER TABLE user_booking_details ADD COLUMN IF NOT EXISTS vehicle_details TEXT;
ALTER TABLE user_booking_details ADD COLUMN IF NOT EXISTS vehicle_number VARCHAR(50);
ALTER TABLE user_booking_details ADD COLUMN IF NOT EXISTS subtotal_amount NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE user_booking_details ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(12, 2) DEFAULT 0;
