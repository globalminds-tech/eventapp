-- ============================================================
-- BOOKMYEVENT DATABASE SCHEMA MIGRATION: 001_initial_schema.sql
-- ============================================================

-- 1. EVENT DETAILS TABLE
CREATE TABLE IF NOT EXISTS event_details_table (
    id SERIAL PRIMARY KEY,
    event_code VARCHAR(50) UNIQUE,
    category VARCHAR(100),
    sub_category VARCHAR(100),
    event_name VARCHAR(255) NOT NULL,
    description TEXT,
    amenities TEXT,
    tags TEXT,
    visibility VARCHAR(50) DEFAULT 'Public',
    include_program VARCHAR(10) DEFAULT 'false',
    mail BOOLEAN DEFAULT FALSE,
    whatsapp BOOLEAN DEFAULT FALSE,
    print BOOLEAN DEFAULT FALSE,
    visitor_mail BOOLEAN DEFAULT FALSE,
    visitor_name BOOLEAN DEFAULT FALSE,
    visitor_photo BOOLEAN DEFAULT FALSE,
    visitor_mobile BOOLEAN DEFAULT FALSE,
    document_proof BOOLEAN DEFAULT FALSE,
    day_pass BOOLEAN DEFAULT FALSE,
    is_international_include BOOLEAN DEFAULT FALSE,
    aadhar BOOLEAN DEFAULT FALSE,
    passport BOOLEAN DEFAULT FALSE,
    welcome_kit BOOLEAN DEFAULT FALSE,
    food BOOLEAN DEFAULT FALSE,
    vehicle_pass BOOLEAN DEFAULT FALSE,
    vehicle_number BOOLEAN DEFAULT FALSE,
    event_type VARCHAR(50) DEFAULT 'OneTime',
    occurrence VARCHAR(50) DEFAULT 'Single',
    start_date DATE,
    start_time TIME,
    end_date DATE,
    end_time TIME,
    venue VARCHAR(255),
    address TEXT,
    user_id INT,
    status VARCHAR(50) DEFAULT 'Active',
    approved_at TIMESTAMP,
    rejected_at TIMESTAMP,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. EVENT BOOKING DETAILS TABLE
CREATE TABLE IF NOT EXISTS event_booking_details (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES event_details_table(id) ON DELETE CASCADE,
    entry_type VARCHAR(50) DEFAULT 'Single Entry',
    charge_type VARCHAR(50) DEFAULT 'Paid',
    pass_type VARCHAR(50) DEFAULT 'Single Pass',
    price_type VARCHAR(50) DEFAULT 'National',
    currency VARCHAR(50) DEFAULT 'INR',
    price_inr NUMERIC(10, 2) DEFAULT 0.00,
    price_usd NUMERIC(10, 2) DEFAULT 0.00,
    capacity INT DEFAULT 500,
    max_pass_per_user INT DEFAULT 4,
    rsvp_approval VARCHAR(50) DEFAULT 'Automatic',
    refund_terms TEXT,
    include_tax BOOLEAN DEFAULT FALSE
);

-- 3. STALLS TABLE
CREATE TABLE IF NOT EXISTS event_stalls (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES event_details_table(id) ON DELETE CASCADE,
    stall_name VARCHAR(100) NOT NULL,
    size VARCHAR(50),
    visibility VARCHAR(50) DEFAULT 'Public',
    type VARCHAR(50) DEFAULT 'Paid',
    price_inr NUMERIC(10, 2) DEFAULT 0.00,
    prime_seat BOOLEAN DEFAULT FALSE,
    prime_price_inr NUMERIC(10, 2) DEFAULT 0.00,
    taxes TEXT[]
);

-- 4. VENDORS TABLE
CREATE TABLE IF NOT EXISTS event_vendors (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES event_details_table(id) ON DELETE CASCADE,
    vendor_name VARCHAR(255) NOT NULL,
    service_type VARCHAR(100),
    contact_no VARCHAR(50),
    pass_count INT DEFAULT 1
);

-- 5. SPONSORS TABLE
CREATE TABLE IF NOT EXISTS event_sponsors (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES event_details_table(id) ON DELETE CASCADE,
    sponsor_name VARCHAR(255) NOT NULL,
    sponsorship_type VARCHAR(100),
    amount NUMERIC(12, 2) DEFAULT 0.00
);

-- 6. POLICIES TABLE
CREATE TABLE IF NOT EXISTS event_terms (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES event_details_table(id) ON DELETE CASCADE,
    policy_group VARCHAR(100),
    policy_type VARCHAR(100),
    policy_name VARCHAR(255),
    description TEXT
);

-- 7. FOOD PROVISIONS TABLE
CREATE TABLE IF NOT EXISTS event_food_items (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES event_details_table(id) ON DELETE CASCADE,
    caterer_name VARCHAR(255),
    meal_type VARCHAR(50),
    food_type VARCHAR(50),
    price_inr NUMERIC(10, 2) DEFAULT 0.00,
    menu_details TEXT
);

-- 8. VEHICLE PROVISIONS TABLE
CREATE TABLE IF NOT EXISTS event_vehicle_details (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES event_details_table(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(100),
    price_inr NUMERIC(10, 2) DEFAULT 0.00
);
