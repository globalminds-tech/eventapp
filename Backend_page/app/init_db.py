from app.database import get_db_connection

def create_tables():

    db = get_db_connection(None)
    cursor = db.cursor(buffered=True)
    cursor.execute("CREATE DATABASE IF NOT EXISTS event_db")

    cursor.close()
    db.close()
    # 🔹 Step 2: Connect to event_db
    db = get_db_connection()
    cursor = db.cursor(buffered=True)

    users_table = """
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        role VARCHAR(50),
        status VARCHAR(50) DEFAULT 'ACTIVE',
        mobile VARCHAR(20),
        organization_name VARCHAR(255)
    )
    """

    organizer_profiles_table = """
    CREATE TABLE IF NOT EXISTS organizer_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        company_name VARCHAR(255) NOT NULL,
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
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """

    exhibitor_profiles_table = """
    CREATE TABLE IF NOT EXISTS exhibitor_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
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
        kyc_status VARCHAR(50) DEFAULT 'VERIFIED',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """

    event_details_table = """
    CREATE TABLE IF NOT EXISTS event_details_table (
        id INT AUTO_INCREMENT PRIMARY KEY,

        event_code VARCHAR(50),

        category VARCHAR(100),
        event_name VARCHAR(255),
        description TEXT,
        amenities TEXT,
        tags TEXT,

        visibility VARCHAR(50),
        include_program VARCHAR(10),

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

        event_type VARCHAR(50),
        occurrence VARCHAR(50),

        start_date DATE,
        start_time TIME,
        end_date DATE,
        end_time TIME,

        venue VARCHAR(255),
        address TEXT,
        user_id INT,
        status ENUM('PENDING','APPROVED','REJECTED') ,
        approved_at DATETIME,
        rejected_at DATETIME,
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """

    event_booking_table="""CREATE TABLE IF NOT EXISTS event_booking_details (
    id INT AUTO_INCREMENT PRIMARY KEY,

    event_id INT,

    booking_start_date DATE,
    booking_end_date DATE,

    capacity INT,
    pass_type VARCHAR(50),

    title VARCHAR(100),
    title_type VARCHAR(50),
    title_selection TEXT,

    designation VARCHAR(100),
    designation_type VARCHAR(50),
    designation_selection TEXT,

    company VARCHAR(100),
    company_type VARCHAR(50),
    company_selection TEXT,

    entry_type VARCHAR(50),

    charge_type VARCHAR(50),
    max_pass INT,

    razorpay_key TEXT,

    include_tax BOOLEAN,

    price_type VARCHAR(50),
    currency VARCHAR(50),

    early_bird_expire DATETIME,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (event_id) REFERENCES event_details_table(id) ON DELETE CASCADE
);"""

    food_live_count = """
    CREATE TABLE IF NOT EXISTS food_live_count (
        id INT AUTO_INCREMENT PRIMARY KEY,

        event_id INT,
        meal_time VARCHAR(50),
        meal_type VARCHAR(50),

        guests_inside INT DEFAULT 0,
        total_capacity INT DEFAULT 0,
        waiting_outside INT DEFAULT 0,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
    countries_table = """
    CREATE TABLE IF NOT EXISTS countries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        country_name VARCHAR(100)
    )
    """

    states_table = """
    CREATE TABLE IF NOT EXISTS states (
        id INT AUTO_INCREMENT PRIMARY KEY,
        state_name VARCHAR(100),
        country_id INT,
        FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
    )
    """

    cities_table = """
    CREATE TABLE IF NOT EXISTS cities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        city_name VARCHAR(100),
        state_id INT,
        FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
    )
    """

    venues_table = """
    CREATE TABLE IF NOT EXISTS venues (
        id INT AUTO_INCREMENT PRIMARY KEY,
        venue_code VARCHAR(20),
        venue_name VARCHAR(200),
        address TEXT,
        country_name  VARCHAR(30),
        state_name  VARCHAR(30),
        city_name  VARCHAR(30),
        pin_code VARCHAR(10),
        venue_image LONGTEXT,
        status VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(150),
        modified_by VARCHAR(150),
        modified_on TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
    )
    """

    sponsor_detail="""
    CREATE TABLE IF NOT EXISTS sponsors_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sponsor_code VARCHAR(50),
    sponsor_name VARCHAR(150),
    primary_contact VARCHAR(20),
    secondary_contact VARCHAR(20),
    mail_id VARCHAR(150),
    address TEXT,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    """
    Sponsor_Document="""
    CREATE TABLE IF NOT EXISTS sponsor_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sponsor_id INT,
    document_type VARCHAR(50),
    document_number VARCHAR(100),
    document_file LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"""

    documents_table = """
    CREATE TABLE IF NOT EXISTS venue_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        venue_id INT,
        document_type VARCHAR(100),
        document_number VARCHAR(100),
        document_file LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
    )
    """
    vendor_details="""
    CREATE TABLE IF NOT EXISTS vendor_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_type VARCHAR(50),
    vendor_name VARCHAR(150),
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
    bank_passbook LONGTEXT,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(150),
    modified_by VARCHAR(150),
    modified_on TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
);
    """
    Vendor_Document="""
    CREATE TABLE IF NOT EXISTS vendor_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT,
    document_type VARCHAR(50),
    document_number VARCHAR(100),
    document_file LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendor_details(id) ON DELETE CASCADE
);
    """
    policy_table="""CREATE TABLE IF NOT EXISTS policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_code VARCHAR(50),
    policy_name VARCHAR(255),
    policy_type VARCHAR(50),
    policy_group VARCHAR(100),
    description TEXT,
    organizer_id INT,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(150),
    modified_by VARCHAR(150),
    modified_on TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
);"""

    event_layout="""
  CREATE TABLE IF NOT EXISTS event_layout (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,

    floor_type VARCHAR(50),
    day_based BOOLEAN,
    person_pass INT,
    include_tax BOOLEAN,
    taxes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES event_details_table(id) ON DELETE CASCADE
);
    """

    event_stalls="""CREATE TABLE IF NOT EXISTS event_stalls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,

    stall_name VARCHAR(255),
    stall_size VARCHAR(50),
    size_range VARCHAR(100),
    visibility VARCHAR(50),
    stall_type VARCHAR(50),

    price_inr VARCHAR(50),
    price_usd VARCHAR(50),

    prime_seat BOOLEAN,
    prime_price_inr VARCHAR(50),
    prime_price_usd VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES event_details_table(id) ON DELETE CASCADE
);"""
    stall_amenities="""
    CREATE TABLE IF NOT EXISTS stall_amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,

    stall_name VARCHAR(255),
    amenity VARCHAR(255),
    qty INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES event_details_table(id) ON DELETE CASCADE
);
    """
    event_document="""
    CREATE TABLE IF NOT EXISTS event_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    file_name VARCHAR(255),
    file_path TEXT,
    file_type VARCHAR(50), -- banner / document / video
    doc_type VARCHAR(100),
    doc_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id)
    REFERENCES event_details_table(id)
    ON DELETE CASCADE
    
);
"""
    event_Terms="""
    CREATE TABLE IF NOT EXISTS event_terms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    policy_group VARCHAR(100),
    policy_type VARCHAR(100),
    policy_name VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_event_terms_event
    FOREIGN KEY (event_id)
    REFERENCES event_details_table(id)
    ON DELETE CASCADE
);
    """
    event_vendor="""
    CREATE TABLE IF NOT EXISTS event_vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    vendor_type VARCHAR(100),
    vendor_name VARCHAR(150),
    pass_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id)
    REFERENCES event_details_table(id)
    ON DELETE CASCADE
);
    """
    event_sponsors="""
    CREATE TABLE IF NOT EXISTS event_sponsors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    sponsor_name VARCHAR(150),
    sponsorship_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id)
    REFERENCES event_details_table(id)
    ON DELETE CASCADE
);
    """
    event_guest="""CREATE TABLE IF NOT EXISTS event_guests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    guest_name VARCHAR(150),
    designation VARCHAR(150),
    contact VARCHAR(20),
    image LONGTEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id)
    REFERENCES event_details_table(id)
    ON DELETE CASCADE
);"""
    user_booking_details="""CREATE TABLE  IF NOT EXISTS user_booking_details (
    id INT AUTO_INCREMENT PRIMARY KEY,

    event_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(15),
    food_preference VARCHAR(50) DEFAULT 'None',
    qr_data TEXT,
    is_scanned BOOLEAN DEFAULT FALSE,
    scanned_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES event_details_table(id) ON DELETE CASCADE
);"""
    feedback_table="""CREATE TABLE IF NOT EXISTS feedback_event (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    feedback_code VARCHAR(50),
    event_id      INT NOT NULL,
    event_name    VARCHAR(255) NOT NULL,
    explanation   TEXT,
    status        VARCHAR(20)  DEFAULT 'Active',
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    modified_on   DATE         DEFAULT NULL,
    FOREIGN KEY (event_id) REFERENCES event_details_table(id) ON DELETE CASCADE
);"""

    def alter_booking_details_table(cursor):
        try:
            columns_to_add = [
                ("food_preference", "VARCHAR(50) DEFAULT 'None'"),
                ("qr_data", "TEXT"),
                ("is_scanned", "BOOLEAN DEFAULT FALSE"),
                ("scanned_at", "DATETIME")
            ]
            
            for col_name, col_type in columns_to_add:
                cursor.execute(f"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'user_booking_details' AND COLUMN_NAME = %s AND TABLE_SCHEMA = DATABASE()", (col_name,))
                if not cursor.fetchone():
                    cursor.execute(f"ALTER TABLE user_booking_details ADD COLUMN {col_name} {col_type};")
                    print(f"Added {col_name} to user_booking_details")
        except Exception as e:
            print("Alter booking error:", str(e))

    stall_booking="""
    CREATE TABLE  IF NOT EXISTS Exhibitor_stall_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    user_id INT,

    title VARCHAR(10),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150),
    mobile VARCHAR(20),
    eventName VARCHAR(100),

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

    status VARCHAR(50) DEFAULT 'pending',  -- ✅ here

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (event_id) REFERENCES event_details_table(id) ON DELETE CASCADE
);
    """
    todo_tasks_table = """
        CREATE TABLE IF NOT EXISTS todo_tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
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
"""
    messages_table="""
        CREATE TABLE IF NOT EXISTS messages_greetings_table (
            id              INT AUTO_INCREMENT PRIMARY KEY,
            event_id        INT           NOT NULL,
            type            VARCHAR(20)   NOT NULL DEFAULT 'Messages',
            message_group   VARCHAR(255)  NOT NULL,
            topics          VARCHAR(255)  DEFAULT NULL,
            sub_topics      VARCHAR(255)  DEFAULT NULL,
            description     LONGTEXT      DEFAULT NULL,
            image_path      LONGTEXT      DEFAULT NULL,

            created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP,
            updated_at      DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_mg_event
                FOREIGN KEY (event_id)
                REFERENCES event_details_table(id)
                ON DELETE CASCADE
        );
        """
    my_contacts_table = """
    CREATE TABLE IF NOT EXISTS my_contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        mobile VARCHAR(20),
        user_type VARCHAR(100),
        group_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """

    def alter_policies_table(cursor):
        try:
            # Existing alterations
            cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'policies' AND COLUMN_NAME = 'file_path' AND TABLE_SCHEMA = DATABASE()")
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE policies ADD COLUMN file_path TEXT;")
                print("file_path added to policies")

            # Check for organizer_id
            cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'policies' AND COLUMN_NAME = 'organizer_id' AND TABLE_SCHEMA = DATABASE()")
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE policies ADD COLUMN organizer_id INT;")
                print("organizer_id added to policies")

            # Check for audit columns
            audit_cols = [
                ("created_by", "VARCHAR(150)"),
                ("modified_by", "VARCHAR(150)"),
                ("created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"),
                ("modified_on", "TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP")
            ]
            for col, col_type in audit_cols:
                cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'policies' AND COLUMN_NAME = %s AND TABLE_SCHEMA = DATABASE()", (col,))
                if not cursor.fetchone():
                    cursor.execute(f"ALTER TABLE policies ADD COLUMN {col} {col_type};")
                    print(f"Added {col} to policies")
        except Exception as e:
            print("Alter error:", str(e))

    def alter_event_table_user_id(cursor):
        try:
            cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'event_details_table' 
                AND COLUMN_NAME = 'user_id'
                AND TABLE_SCHEMA = DATABASE()
            """)
            column = cursor.fetchone()

            if not column:
                cursor.execute("ALTER TABLE event_details_table ADD COLUMN user_id INT;")
                print("user_id column added to event_details_table table")
            
            # Add created_by column if missing
            cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'event_details_table' 
                AND COLUMN_NAME = 'created_by'
                AND TABLE_SCHEMA = DATABASE()
            """)
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE event_details_table ADD COLUMN created_by VARCHAR(100);")
                print("created_by column added to event_details_table table")

            # Add vehicle_pass column if missing
            cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'event_details_table' 
                AND COLUMN_NAME = 'vehicle_pass'
                AND TABLE_SCHEMA = DATABASE()
            """)
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE event_details_table ADD COLUMN vehicle_pass BOOLEAN DEFAULT FALSE;")
                print("vehicle_pass column added to event_details_table table")

            # Add vehicle_number column if missing
            cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'event_details_table' 
                AND COLUMN_NAME = 'vehicle_number'
                AND TABLE_SCHEMA = DATABASE()
            """)
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE event_details_table ADD COLUMN vehicle_number BOOLEAN DEFAULT FALSE;")
                print("vehicle_number column added to event_details_table table")

        except Exception as e:
            print("Alter event error:", str(e))

    def alter_venues_table_organizer(cursor):
        try:
            # Check for organizer_id
            cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'venues' AND COLUMN_NAME = 'organizer_id' AND TABLE_SCHEMA = DATABASE()")
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE venues ADD COLUMN organizer_id INT;")
                print("Added organizer_id to venues")

            # Check for audit columns
            audit_cols = [
                ("created_by", "VARCHAR(150)"),
                ("modified_by", "VARCHAR(150)"),
                ("created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"),
                ("modified_on", "TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP")
            ]
            for col, col_type in audit_cols:
                cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'venues' AND COLUMN_NAME = %s AND TABLE_SCHEMA = DATABASE()", (col,))
                if not cursor.fetchone():
                    cursor.execute(f"ALTER TABLE venues ADD COLUMN {col} {col_type};")
                    print(f"Added {col} to venues")
        except Exception as e:
            print("Alter venues error:", e)

    def alter_venues_table_pincode(cursor):
        try:
            cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'venues' AND COLUMN_NAME = 'pin_code' AND TABLE_SCHEMA = DATABASE()")
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE venues ADD COLUMN pin_code VARCHAR(10);")
                print("Added pin_code to venues")
        except Exception as e:
            print("Alter venues pincode error:", e)

    def alter_vendor_table_organizer(cursor):
        try:
            # Check for organizer_id
            cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'vendor_details' AND COLUMN_NAME = 'organizer_id' AND TABLE_SCHEMA = DATABASE()")
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE vendor_details ADD COLUMN organizer_id INT;")
                print("Added organizer_id to vendor_details")

            # Check for location columns
            location_cols = [
                ("country", "VARCHAR(100)"),
                ("state", "VARCHAR(100)"),
                ("city", "VARCHAR(100)")
            ]
            for col, col_type in location_cols:
                cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'vendor_details' AND COLUMN_NAME = %s AND TABLE_SCHEMA = DATABASE()", (col,))
                if not cursor.fetchone():
                    cursor.execute(f"ALTER TABLE vendor_details ADD COLUMN {col} {col_type};")
                    print(f"Added {col} to vendor_details")

            # Check for bank_passbook
            cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'vendor_details' AND COLUMN_NAME = 'bank_passbook' AND TABLE_SCHEMA = DATABASE()")
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE vendor_details ADD COLUMN bank_passbook LONGTEXT;")
                print("Added bank_passbook to vendor_details")

            # Check for audit columns
            audit_cols = [
                ("created_by", "VARCHAR(150)"),
                ("modified_by", "VARCHAR(150)"),
                ("created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"),
                ("modified_on", "TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP")
            ]
            for col, col_type in audit_cols:
                cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'vendor_details' AND COLUMN_NAME = %s AND TABLE_SCHEMA = DATABASE()", (col,))
                if not cursor.fetchone():
                    cursor.execute(f"ALTER TABLE vendor_details ADD COLUMN {col} {col_type};")
                    print(f"Added {col} to vendor_details")
        except Exception as e:
            print("Alter vendor error:", e)

    def alter_event_vendors(cursor):
        try:
            cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'event_vendors' AND COLUMN_NAME = 'pass_count' AND TABLE_SCHEMA = DATABASE()")
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE event_vendors ADD COLUMN pass_count INT DEFAULT 0;")
                print("Added pass_count to event_vendors")
        except Exception as e:
            print("Alter event_vendors error:", e)

    def alter_sponsor_table_organizer(cursor):
        try:
            # Check for organizer_id
            cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'sponsors_details' AND COLUMN_NAME = 'organizer_id' AND TABLE_SCHEMA = DATABASE()")
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE sponsors_details ADD COLUMN organizer_id INT;")
                print("Added organizer_id to sponsors_details")

            # Check for audit columns
            audit_cols = [
                ("created_by", "VARCHAR(150)"),
                ("modified_by", "VARCHAR(150)"),
                ("created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"),
                ("modified_on", "TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP")
            ]
            for col, col_type in audit_cols:
                cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'sponsors_details' AND COLUMN_NAME = %s AND TABLE_SCHEMA = DATABASE()", (col,))
                if not cursor.fetchone():
                    cursor.execute(f"ALTER TABLE sponsors_details ADD COLUMN {col} {col_type};")
                    print(f"Added {col} to sponsors_details")
        except Exception as e:
            print("Alter sponsor error:", e)

    

    def alter_event_terms_table(cursor):
        try:
            cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'event_terms' AND COLUMN_NAME = 'is_default' AND TABLE_SCHEMA = DATABASE()")
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE event_terms ADD COLUMN is_default BOOLEAN DEFAULT FALSE;")
                print("is_default added to event_terms")
        except Exception as e:
            print("Alter event_terms error:", str(e))

    def alter_users_table(cursor):
        try:
            columns_to_add = [
                ("mobile", "VARCHAR(20)"),
                ("address", "TEXT"),
                ("country", "VARCHAR(100)"),
                ("state", "VARCHAR(100)"),
                ("city", "VARCHAR(100)"),
                ("profile_image", "LONGTEXT"),
                ("organization_name", "VARCHAR(255)")

            ]
            for col_name, col_type in columns_to_add:
                cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = %s AND TABLE_SCHEMA = DATABASE()", (col_name,))
                if not cursor.fetchone():
                    cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type};")
                    print(f"Added {col_name} to users table")
        except Exception as e:
            print("Alter users error:", str(e))

    def alter_venue_documents_table(cursor):
        try:
            cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'venue_documents' AND COLUMN_NAME = 'created_at' AND TABLE_SCHEMA = DATABASE()")
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE venue_documents ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;")
                print("Added created_at to venue_documents")
            try:
                cursor.execute("ALTER TABLE venue_documents ADD CONSTRAINT fk_venue_documents_venue FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE;")
                print("Added foreign key constraint to venue_documents")
            except Exception:
                pass
        except Exception as e:
            print("Alter venue_documents error:", str(e))

    def alter_event_layout_table(cursor):
        try:
            cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'event_layout' AND COLUMN_NAME = 'taxes' AND TABLE_SCHEMA = DATABASE()")
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE event_layout ADD COLUMN taxes TEXT;")
                print("Added taxes to event_layout")
        except Exception as e:
            print("Alter event_layout error:", str(e))

    # 1. First create base tables (No foreign keys or referenced by others)
    cursor.execute(users_table)
    alter_users_table(cursor)
    print("Users table checked")

    cursor.execute(event_details_table)
    alter_event_table_user_id(cursor)
    print("Event details table checked")

    cursor.execute(countries_table)
    cursor.execute(states_table)
    cursor.execute(cities_table)
    print("Location tables checked")

    # 2. Create tables that reference event_details_table or others
    cursor.execute(event_booking_table)
    cursor.execute(event_layout)
    alter_event_layout_table(cursor)
    cursor.execute(event_stalls)
    cursor.execute(stall_amenities)
    cursor.execute(event_document)
    cursor.execute(event_Terms)
    cursor.execute(event_guest)
    cursor.execute(event_sponsors)
    cursor.execute(event_vendor)
    alter_event_vendors(cursor)
    print("Event vendors table checked")
    cursor.execute(user_booking_details)
    cursor.execute(stall_booking)
    cursor.execute(food_live_count)
    cursor.execute(messages_table)
    cursor.execute(feedback_table)
    cursor.execute(todo_tasks_table)
    
    # New tables for Food and Vehicle Pass Details
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS event_food_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT,
        caterer_name VARCHAR(150),
        meal_type VARCHAR(50),
        food_type VARCHAR(50),
        price_inr DECIMAL(10, 2),
        price_usd DECIMAL(10, 2),
        menu_details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES event_details_table(id) ON DELETE CASCADE
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS event_vehicle_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT,
        vehicle_type VARCHAR(100),
        price_inr DECIMAL(10, 2),
        price_usd DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES event_details_table(id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS event_vehicle_addons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT,
        is_parent BOOLEAN DEFAULT FALSE,
        addon_name VARCHAR(150),
        price DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES event_details_table(id) ON DELETE CASCADE
    )
    """)
    
    # 3. Create remaining independent or specific tables
    cursor.execute(venues_table)
    cursor.execute(documents_table)
    cursor.execute(my_contacts_table)
    cursor.execute(sponsor_detail)
    cursor.execute(Sponsor_Document)
    cursor.execute(vendor_details)
    cursor.execute(Vendor_Document)
    cursor.execute(policy_table)
    
    alter_policies_table(cursor)
    alter_booking_details_table(cursor)
    alter_venues_table_organizer(cursor)
    alter_venues_table_pincode(cursor)
    alter_vendor_table_organizer(cursor)
    alter_sponsor_table_organizer(cursor)
    alter_event_terms_table(cursor)
    alter_venue_documents_table(cursor)
    
    print("All tables checked / created successfully")

    complaint_table = """
    CREATE TABLE IF NOT EXISTS complaint (
        id INT AUTO_INCREMENT PRIMARY KEY,
        complaint_code VARCHAR(20) UNIQUE,
        event_id INT,
        event_name VARCHAR(255),
        infrastructure_rating INT DEFAULT 0,
        amenities_rating INT DEFAULT 0,
        overall_experience_rating INT DEFAULT 0,
        venue_locations_rating INT DEFAULT 0,
        transportation_rating INT DEFAULT 0,
        convenience_rating INT DEFAULT 0,
        explanation TEXT,
        status VARCHAR(20) DEFAULT 'Active',
        created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES event_details_table(id) ON DELETE SET NULL
    )
    """
    cursor.execute(complaint_table)
    
    event_programs_table = """
    CREATE TABLE IF NOT EXISTS event_programs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT,
        program_name VARCHAR(255),
        program_code VARCHAR(50),
        category VARCHAR(100),
        type VARCHAR(100),
        start_date DATETIME,
        end_date DATETIME,
        venue VARCHAR(255),
        max_participants INT DEFAULT 0,
        budget DECIMAL(10, 2) DEFAULT 0.0,
        coordinator_name VARCHAR(150),
        coordinator_email VARCHAR(150),
        description TEXT,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES event_details_table(id) ON DELETE CASCADE
    );
    """
    cursor.execute(event_programs_table)
    cursor.execute("CREATE TABLE IF NOT EXISTS chat_history (id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(100), message TEXT, response TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    cursor.execute("CREATE TABLE IF NOT EXISTS faq (id INT AUTO_INCREMENT PRIMARY KEY, question TEXT, answer TEXT, category VARCHAR(100), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")

    # -------------------------------
    # CHECK IF DATA EXISTS
    # -------------------------------
    cursor.execute("SELECT id FROM countries WHERE country_name=%s", ("India",))
    existing = cursor.fetchone()

    if existing:
        print("Data already exists")

    else:
        # -------------------------------
        # 1. Insert Country
        # -------------------------------
        cursor.execute(
            "INSERT INTO countries (country_name) VALUES (%s)",
            ("India",)
        )

        country_id = cursor.lastrowid

        # -------------------------------
        # 2. Insert States
        # -------------------------------
        states = [
            'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
            'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
            'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
            'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
            'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
            'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
        ]

        state_ids = {}

        for state in states:
            cursor.execute(
                "INSERT INTO states (state_name, country_id) VALUES (%s, %s)",
                (state, country_id)
            )
            state_ids[state] = cursor.lastrowid

        # -------------------------------
        # 3. Insert Cities (Tamil Nadu)
        # -------------------------------
        tamil_nadu_id = state_ids["Tamil Nadu"]

        cities = [
            'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
            'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
            'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
            'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
            'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
            'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
            'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai',
            'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
        ]

        for city in cities:
            cursor.execute(
                "INSERT INTO cities (city_name, state_id) VALUES (%s, %s)",
                (city, tamil_nadu_id)
            )

        print("Seed data inserted")

    # -------------------------------
    # ENSURE SLUG COLUMNS AND BACKFILL
    # -------------------------------
    try:
        cursor.execute("SHOW COLUMNS FROM event_details_table LIKE 'slug'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE event_details_table ADD COLUMN slug VARCHAR(255) NULL AFTER event_code")

        cursor.execute("SHOW COLUMNS FROM organizer_profiles LIKE 'slug'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE organizer_profiles ADD COLUMN slug VARCHAR(255) NULL AFTER company_name")

        cursor.execute("SHOW COLUMNS FROM category_master_table LIKE 'slug'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE category_master_table ADD COLUMN slug VARCHAR(150) NULL AFTER name")

        db.commit()

        import re
        def local_slugify(t):
            if not t: return "item"
            s = re.sub(r'[^a-z0-9]+', '-', t.lower().strip()).strip('-')
            return s or "item"

        cursor.execute("SELECT id, event_name FROM event_details_table WHERE slug IS NULL OR slug = ''")
        events = cursor.fetchall()
        for eid, ename in events:
            base_slug = local_slugify(ename or "event")
            slug = base_slug
            c = 1
            while True:
                cursor.execute("SELECT id FROM event_details_table WHERE slug = %s AND id != %s", (slug, eid))
                if not cursor.fetchone():
                    break
                slug = f"{base_slug}-{c}"
                c += 1
            cursor.execute("UPDATE event_details_table SET slug = %s WHERE id = %s", (slug, eid))

        cursor.execute("SELECT id, company_name FROM organizer_profiles WHERE slug IS NULL OR slug = ''")
        orgs = cursor.fetchall()
        for oid, cname in orgs:
            base_slug = local_slugify(cname or "organizer")
            slug = base_slug
            c = 1
            while True:
                cursor.execute("SELECT id FROM organizer_profiles WHERE slug = %s AND id != %s", (slug, oid))
                if not cursor.fetchone():
                    break
                slug = f"{base_slug}-{c}"
                c += 1
            cursor.execute("UPDATE organizer_profiles SET slug = %s WHERE id = %s", (slug, oid))

        cursor.execute("SELECT id, name FROM category_master_table WHERE slug IS NULL OR slug = ''")
        cats = cursor.fetchall()
        for cid, cname in cats:
            base_slug = local_slugify(cname or "category")
            slug = base_slug
            c = 1
            while True:
                cursor.execute("SELECT id FROM category_master_table WHERE slug = %s AND id != %s", (slug, cid))
                if not cursor.fetchone():
                    break
                slug = f"{base_slug}-{c}"
                c += 1
            cursor.execute("UPDATE category_master_table SET slug = %s WHERE id = %s", (slug, cid))

        db.commit()
    except Exception as e:
        print("Slug column ensure/backfill note:", e)

    # -------------------------------
    # FINAL COMMIT & CLOSE
    # -------------------------------
    db.commit()
    cursor.close()
    db.close()

    print("Tables checked / created successfully")

if __name__ == "__main__":
    create_tables()
