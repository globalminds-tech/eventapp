-- ============================================================================
-- BOOKMYEVENT ENTERPRISE DATABASE SCHEMA MIGRATION: 001_uuid_schema.sql
-- Architecture: PostgreSQL (Supabase) with Native UUID Primary Keys
-- Multi-Currency Support: Dual-Currency Columns (INR / USD) + User Preferences
-- Security: gen_random_uuid() for unpredictable IDs, indexed foreign keys
-- ============================================================================

-- 1. Enable Native Cryptographic UUID Extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop all legacy tables cleanly (Cascading FK cleanup)
DROP TABLE IF EXISTS attendee_checkin_logs CASCADE;
DROP TABLE IF EXISTS user_booking_details CASCADE;
DROP TABLE IF EXISTS exhibitor_stall_bookings CASCADE;
DROP TABLE IF EXISTS "Exhibitor_stall_bookings" CASCADE;
DROP TABLE IF EXISTS stall_amenities CASCADE;
DROP TABLE IF EXISTS event_stalls CASCADE;
DROP TABLE IF EXISTS event_vendors CASCADE;
DROP TABLE IF EXISTS vendor_documents CASCADE;
DROP TABLE IF EXISTS vendor_details CASCADE;
DROP TABLE IF EXISTS event_sponsors CASCADE;
DROP TABLE IF EXISTS sponsor_documents CASCADE;
DROP TABLE IF EXISTS sponsors_details CASCADE;
DROP TABLE IF EXISTS event_terms CASCADE;
DROP TABLE IF EXISTS event_guests CASCADE;
DROP TABLE IF EXISTS event_files CASCADE;
DROP TABLE IF EXISTS event_layout CASCADE;
DROP TABLE IF EXISTS event_booking_details CASCADE;
DROP TABLE IF EXISTS event_food_items CASCADE;
DROP TABLE IF EXISTS food_live_count CASCADE;
DROP TABLE IF EXISTS event_vehicle_addons CASCADE;
DROP TABLE IF EXISTS event_vehicle_details CASCADE;
DROP TABLE IF EXISTS event_programs CASCADE;
DROP TABLE IF EXISTS feedback_event CASCADE;
DROP TABLE IF EXISTS complaint CASCADE;
DROP TABLE IF EXISTS chat_history CASCADE;
DROP TABLE IF EXISTS faq CASCADE;
DROP TABLE IF EXISTS todo_tasks CASCADE;
DROP TABLE IF EXISTS messages_greetings_table CASCADE;
DROP TABLE IF EXISTS my_contacts CASCADE;
DROP TABLE IF EXISTS policies CASCADE;
DROP TABLE IF EXISTS venue_documents CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS states CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS organizer_profiles CASCADE;
DROP TABLE IF EXISTS exhibitor_profiles CASCADE;
DROP TABLE IF EXISTS category_requests CASCADE;
DROP TABLE IF EXISTS category_master_table CASCADE;
DROP TABLE IF EXISTS event_details_table CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- 3. CORE IDENTITY & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    roles TEXT[] DEFAULT ARRAY['user'],
    active_role VARCHAR(50) DEFAULT 'user',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    mobile VARCHAR(20),
    address TEXT,
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    profile_image TEXT,
    organization_name VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    -- Multi-currency & Locale Settings
    locale VARCHAR(10) DEFAULT 'en_IN',
    currency_preference VARCHAR(3) DEFAULT 'INR',
    timezone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- 4. PROFILES & ROLES
-- ============================================================================

CREATE TABLE organizer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    business_type VARCHAR(100),
    gstin VARCHAR(50),
    pan_number VARCHAR(50),
    business_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    website_url VARCHAR(255),
    bank_name VARCHAR(150),
    account_number VARCHAR(100),
    ifsc_code VARCHAR(50),
    account_holder VARCHAR(150),
    upi_id VARCHAR(100),
    kyc_status VARCHAR(50) DEFAULT 'VERIFIED',
    default_currency VARCHAR(3) DEFAULT 'INR'
);

CREATE INDEX idx_organizer_profiles_user_id ON organizer_profiles(user_id);
CREATE INDEX idx_organizer_profiles_slug ON organizer_profiles(slug);

CREATE TABLE exhibitor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    vendor_category VARCHAR(100),
    gstin VARCHAR(50),
    pan_number VARCHAR(50),
    business_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    website_url VARCHAR(255),
    bank_name VARCHAR(150),
    account_number VARCHAR(100),
    ifsc_code VARCHAR(50),
    account_holder VARCHAR(150),
    upi_id VARCHAR(100),
    kyc_status VARCHAR(50) DEFAULT 'VERIFIED'
);

CREATE INDEX idx_exhibitor_profiles_user_id ON exhibitor_profiles(user_id);

-- ============================================================================
-- 5. CATEGORIES & TAXONOMY
-- ============================================================================

CREATE TABLE category_master_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(150) UNIQUE,
    subcategories TEXT,
    icon_name VARCHAR(50) DEFAULT 'Tag',
    category_image TEXT,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_categories_slug ON category_master_table(slug);

CREATE TABLE category_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID,
    organizer_name VARCHAR(150),
    category_name VARCHAR(100) NOT NULL,
    subcategory_name VARCHAR(100),
    reason TEXT,
    status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. EVENTS & EVENT DETAILS
-- ============================================================================

CREATE TABLE event_details_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_code VARCHAR(50) UNIQUE,
    slug VARCHAR(255) UNIQUE,
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
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    currency_code VARCHAR(3) DEFAULT 'INR',
    approved_at TIMESTAMP,
    rejected_at TIMESTAMP,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_events_slug ON event_details_table(slug);
CREATE INDEX idx_events_user_id ON event_details_table(user_id);
CREATE INDEX idx_events_status ON event_details_table(status);
CREATE INDEX idx_events_category ON event_details_table(category);

CREATE TABLE event_booking_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES event_details_table(id) ON DELETE CASCADE,
    booking_start_date DATE,
    booking_end_date DATE,
    price_inr NUMERIC(10, 2) DEFAULT 0.00,
    capacity INT DEFAULT 500,
    pass_type VARCHAR(50) DEFAULT 'Single Pass',
    group_member_limit INT DEFAULT 5,
    title VARCHAR(100),
    title_type VARCHAR(50),
    title_selection TEXT,
    designation VARCHAR(100),
    designation_type VARCHAR(50),
    designation_selection TEXT,
    company VARCHAR(100),
    company_type VARCHAR(50),
    company_selection TEXT,
    entry_type VARCHAR(50) DEFAULT 'Single Entry',
    max_reentries VARCHAR(50) DEFAULT 'Unlimited',
    charge_type VARCHAR(50) DEFAULT 'Paid',
    max_pass INT DEFAULT 4,
    razorpay_key TEXT,
    include_tax BOOLEAN DEFAULT FALSE,
    taxes TEXT,
    price_type VARCHAR(50) DEFAULT 'National',
    currency VARCHAR(50) DEFAULT 'INR',
    currency_code VARCHAR(3) DEFAULT 'INR',
    early_bird_expire TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_booking_details_event_id ON event_booking_details(event_id);

CREATE TABLE event_layout (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES event_details_table(id) ON DELETE CASCADE,
    floor_type VARCHAR(50),
    day_based BOOLEAN DEFAULT FALSE,
    person_pass INT DEFAULT 1,
    include_tax BOOLEAN DEFAULT FALSE,
    taxes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_event_layout_event_id ON event_layout(event_id);

CREATE TABLE event_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES event_details_table(id) ON DELETE CASCADE,
    file_name VARCHAR(255),
    file_path TEXT,
    file_type VARCHAR(50),
    doc_type VARCHAR(100),
    doc_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_files_event_id ON event_files(event_id);
CREATE INDEX idx_event_files_type ON event_files(event_id, file_type);

CREATE TABLE event_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES event_details_table(id) ON DELETE CASCADE,
    policy_group VARCHAR(100),
    policy_type VARCHAR(100),
    policy_name VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_terms_event_id ON event_terms(event_id);

CREATE TABLE event_guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES event_details_table(id) ON DELETE CASCADE,
    guest_name VARCHAR(150),
    designation VARCHAR(150),
    contact VARCHAR(20),
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_guests_event_id ON event_guests(event_id);

-- ============================================================================
-- 7. STALLS & EXHIBITOR BOOKINGS
-- ============================================================================

CREATE TABLE event_stalls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES event_details_table(id) ON DELETE CASCADE,
    stall_name VARCHAR(255),
    stall_size VARCHAR(50),
    size_range VARCHAR(100),
    visibility VARCHAR(50) DEFAULT 'Public',
    stall_type VARCHAR(50) DEFAULT 'Paid',
    price_inr VARCHAR(50) DEFAULT '0.00',
    price_usd VARCHAR(50) DEFAULT '0.00',
    prime_seat BOOLEAN DEFAULT FALSE,
    prime_price_inr VARCHAR(50) DEFAULT '0.00',
    prime_price_usd VARCHAR(50) DEFAULT '0.00',
    quantity INT DEFAULT 1,
    single_area_sqft FLOAT DEFAULT 100.0,
    total_area_sqft FLOAT DEFAULT 100.0,
    currency_code VARCHAR(3) DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_stalls_event_id ON event_stalls(event_id);

CREATE TABLE stall_amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES event_details_table(id) ON DELETE CASCADE,
    stall_name VARCHAR(255),
    amenity VARCHAR(255),
    qty INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stall_amenities_event_id ON stall_amenities(event_id);

CREATE TABLE exhibitor_stall_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES event_details_table(id) ON DELETE CASCADE,
    user_id UUID,
    title VARCHAR(10),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150),
    mobile VARCHAR(20),
    event_name VARCHAR(100),
    designation VARCHAR(150),
    company_name VARCHAR(150),
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    messages TEXT,
    pin_code VARCHAR(20),
    stall_area VARCHAR(50),
    products VARCHAR(100),
    visiting_card VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    approval_message TEXT,
    rejection_reason TEXT,
    payment_expiry_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exhibitor_stall_bookings_event_id ON exhibitor_stall_bookings(event_id);
CREATE INDEX idx_exhibitor_stall_bookings_user_id ON exhibitor_stall_bookings(user_id);
CREATE INDEX idx_exhibitor_stall_bookings_email ON exhibitor_stall_bookings(email);

-- ============================================================================
-- 8. ATTENDEE BOOKINGS & GATE ACCESS LOGS
-- ============================================================================

CREATE TABLE user_booking_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES event_details_table(id) ON DELETE CASCADE,
    user_id UUID,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(15),
    food_preference VARCHAR(50) DEFAULT 'None',
    qr_data TEXT,
    ticket_code VARCHAR(60) UNIQUE,
    scanner_id VARCHAR(50),
    is_scanned BOOLEAN DEFAULT FALSE,
    scanned_at TIMESTAMP,
    is_checked_in BOOLEAN DEFAULT FALSE,
    checkin_at TIMESTAMP,
    checkin_scanner_id VARCHAR(50),
    is_checked_out BOOLEAN DEFAULT FALSE,
    checkout_at TIMESTAMP,
    checkout_scanner_id VARCHAR(50),
    total_checkins INT DEFAULT 0,
    total_checkouts INT DEFAULT 0,
    currency_code VARCHAR(3) DEFAULT 'INR',
    amount_paid NUMERIC(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_booking_event_id ON user_booking_details(event_id);
CREATE INDEX idx_user_booking_user_id ON user_booking_details(user_id);
CREATE INDEX idx_user_booking_ticket_code ON user_booking_details(ticket_code);
CREATE INDEX idx_user_booking_email ON user_booking_details(email);

CREATE TABLE attendee_checkin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES user_booking_details(id) ON DELETE CASCADE,
    ticket_code VARCHAR(60),
    event_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'CHECK_IN' or 'CHECK_OUT'
    gate_name VARCHAR(100),
    scanner_id VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attendee_logs_booking_id ON attendee_checkin_logs(booking_id);
CREATE INDEX idx_attendee_logs_event_id ON attendee_checkin_logs(event_id);

-- ============================================================================
-- 9. VENUES (EXTERNAL API-DRIVEN GEOCODING)
-- ============================================================================

CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_code VARCHAR(20),
    venue_name VARCHAR(200) NOT NULL,
    address TEXT,
    country_name VARCHAR(100),
    state_name VARCHAR(100),
    city_name VARCHAR(100),
    pin_code VARCHAR(10),
    venue_image TEXT,
    total_area_sqft FLOAT DEFAULT 50000.0,
    status VARCHAR(20) DEFAULT 'Active',
    organizer_id UUID,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    google_place_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(150),
    modified_by VARCHAR(150),
    modified_on TIMESTAMP
);

CREATE INDEX idx_venues_organizer_id ON venues(organizer_id);

CREATE TABLE venue_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    document_type VARCHAR(100),
    document_number VARCHAR(100),
    document_file TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_venue_docs_venue_id ON venue_documents(venue_id);

-- ============================================================================
-- 10. VENDORS & SPONSORS
-- ============================================================================

CREATE TABLE vendor_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_type VARCHAR(50),
    vendor_name VARCHAR(150) NOT NULL,
    company_name VARCHAR(150),
    primary_contact VARCHAR(20),
    secondary_contact VARCHAR(20),
    mail_id VARCHAR(150),
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    bank_name VARCHAR(150),
    account_holder VARCHAR(150),
    ifsc_code VARCHAR(50),
    account_number VARCHAR(50),
    bank_passbook TEXT,
    status VARCHAR(20) DEFAULT 'Active',
    organizer_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(150),
    modified_by VARCHAR(150),
    modified_on TIMESTAMP
);

CREATE INDEX idx_vendor_details_organizer ON vendor_details(organizer_id);

CREATE TABLE vendor_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendor_details(id) ON DELETE CASCADE,
    document_type VARCHAR(50),
    document_number VARCHAR(100),
    document_file TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES event_details_table(id) ON DELETE CASCADE,
    vendor_type VARCHAR(100),
    vendor_name VARCHAR(150),
    pass_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_vendors_event_id ON event_vendors(event_id);

CREATE TABLE sponsors_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_code VARCHAR(50),
    sponsor_name VARCHAR(150) NOT NULL,
    primary_contact VARCHAR(20),
    secondary_contact VARCHAR(20),
    mail_id VARCHAR(150),
    address TEXT,
    status VARCHAR(20) DEFAULT 'Active',
    organizer_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(150),
    modified_by VARCHAR(150),
    modified_on TIMESTAMP
);

CREATE INDEX idx_sponsors_organizer ON sponsors_details(organizer_id);

CREATE TABLE sponsor_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_id UUID,
    document_type VARCHAR(50),
    document_number VARCHAR(100),
    document_file TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES event_details_table(id) ON DELETE CASCADE,
    sponsor_name VARCHAR(150),
    sponsorship_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_sponsors_event_id ON event_sponsors(event_id);

-- ============================================================================
-- 11. MEALS, PARKING, PROGRAMS & OPERATIONS
-- ============================================================================

CREATE TABLE food_live_count (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID,
    meal_time VARCHAR(50),
    meal_type VARCHAR(50),
    guests_inside INT DEFAULT 0,
    total_capacity INT DEFAULT 0,
    waiting_outside INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES event_details_table(id) ON DELETE CASCADE,
    caterer_name VARCHAR(150),
    meal_type VARCHAR(50),
    food_type VARCHAR(50),
    price_inr NUMERIC(10, 2) DEFAULT 0.00,
    price_usd NUMERIC(10, 2) DEFAULT 0.00,
    menu_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_food_event_id ON event_food_items(event_id);

CREATE TABLE event_vehicle_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES event_details_table(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(100),
    price_inr NUMERIC(10, 2) DEFAULT 0.00,
    price_usd NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_vehicle_event_id ON event_vehicle_details(event_id);

CREATE TABLE event_vehicle_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES event_details_table(id) ON DELETE CASCADE,
    is_parent BOOLEAN DEFAULT FALSE,
    addon_name VARCHAR(150),
    price NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES event_details_table(id) ON DELETE CASCADE,
    program_name VARCHAR(255),
    program_code VARCHAR(50),
    category VARCHAR(100),
    type VARCHAR(100),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    venue VARCHAR(255),
    max_participants INT DEFAULT 0,
    budget NUMERIC(10, 2) DEFAULT 0.0,
    coordinator_name VARCHAR(150),
    coordinator_email VARCHAR(150),
    description TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_programs_event_id ON event_programs(event_id);

-- ============================================================================
-- 12. SUPPORT, POLICIES, CONTACTS & TODOS
-- ============================================================================

CREATE TABLE feedback_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_code VARCHAR(50),
    event_id UUID NOT NULL REFERENCES event_details_table(id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    explanation TEXT,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_on DATE
);

CREATE TABLE complaint (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_code VARCHAR(20) UNIQUE,
    event_id UUID REFERENCES event_details_table(id) ON DELETE SET NULL,
    event_name VARCHAR(255),
    infrastructure_rating INT DEFAULT 0,
    amenities_rating INT DEFAULT 0,
    overall_experience_rating INT DEFAULT 0,
    venue_locations_rating INT DEFAULT 0,
    transportation_rating INT DEFAULT 0,
    convenience_rating INT DEFAULT 0,
    explanation TEXT,
    status VARCHAR(20) DEFAULT 'Active',
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100),
    message TEXT,
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE faq (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT,
    answer TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE todo_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_name VARCHAR(255) NOT NULL,
    task_description TEXT,
    todo_list_name VARCHAR(255),
    start_date DATE,
    end_date DATE,
    assigned_to VARCHAR(100),
    status VARCHAR(50) DEFAULT 'In-Progress',
    complete_percent INT DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages_greetings_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES event_details_table(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'Messages' NOT NULL,
    message_group VARCHAR(255) NOT NULL,
    topics VARCHAR(255),
    sub_topics VARCHAR(255),
    description TEXT,
    image_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE my_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    email VARCHAR(255),
    mobile VARCHAR(20),
    user_type VARCHAR(100),
    group_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_code VARCHAR(50),
    policy_name VARCHAR(255),
    policy_type VARCHAR(50),
    policy_group VARCHAR(100),
    description TEXT,
    file_path TEXT,
    organizer_id UUID,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(150),
    modified_by VARCHAR(150),
    modified_on TIMESTAMP
);

-- ============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendee_checkin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_booking_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_details_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow service role full access on attendee_checkin_logs" ON attendee_checkin_logs FOR ALL USING (true);
CREATE POLICY "Allow service role full access on user_booking_details" ON user_booking_details FOR ALL USING (true);
CREATE POLICY "Allow service role full access on event_details_table" ON event_details_table FOR ALL USING (true);
