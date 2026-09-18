from app.extensions.database import db
from sqlalchemy import text
from app.models.organizer_profile import OrganizerProfile
from app.models.exhibitor_profile import ExhibitorProfile
from app.utils.security_crypto import encrypt_field, blind_index_hash

session = db.session

# 1. Alter column lengths in SQL Server
print("Widening columns in SQL Server...")
sql_commands = [
    "ALTER TABLE organizer_profiles ALTER COLUMN pan_number NVARCHAR(255);",
    "ALTER TABLE organizer_profiles ALTER COLUMN account_number NVARCHAR(255);",
    "ALTER TABLE exhibitor_profiles ALTER COLUMN pan_number NVARCHAR(255);",
    "ALTER TABLE exhibitor_profiles ALTER COLUMN account_number NVARCHAR(255);"
]

for sql in sql_commands:
    try:
        session.execute(text(sql))
        session.commit()
        print(f"Executed: {sql}")
    except Exception as e:
        session.rollback()
        print(f"Warning executing {sql}: {e}")

# 2. Add blind index columns if not present
def add_column_if_missing(table, col, col_type):
    check_sql = f"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{table}' AND COLUMN_NAME = '{col}'"
    exists = session.execute(text(check_sql)).first()
    if not exists:
        add_sql = f"ALTER TABLE {table} ADD {col} {col_type};"
        session.execute(text(add_sql))
        session.commit()
        print(f"Added column: {table}.{col}")
    else:
        print(f"Column already exists: {table}.{col}")

add_column_if_missing("organizer_profiles", "account_hash", "NVARCHAR(64) NULL")
add_column_if_missing("organizer_profiles", "pan_hash", "NVARCHAR(64) NULL")
add_column_if_missing("exhibitor_profiles", "account_hash", "NVARCHAR(64) NULL")
add_column_if_missing("exhibitor_profiles", "pan_hash", "NVARCHAR(64) NULL")

# 3. Encrypt existing records
print("\nEncrypting existing Organizer Profiles...")
for op in session.query(OrganizerProfile).all():
    updated = False
    if op.pan_number and not op.pan_number.startswith("enc::"):
        raw_pan = op.pan_number
        op.pan_hash = blind_index_hash(raw_pan)
        op.pan_number = encrypt_field(raw_pan)
        updated = True
        print(f"Encrypted PAN for organizer: {op.company_name}")
    elif op.pan_number:
        op.pan_hash = blind_index_hash(op.pan_number)

    if op.account_number and not op.account_number.startswith("enc::"):
        raw_acc = op.account_number
        op.account_hash = blind_index_hash(raw_acc)
        op.account_number = encrypt_field(raw_acc)
        updated = True
        print(f"Encrypted Account Number for organizer: {op.company_name}")
    elif op.account_number:
        op.account_hash = blind_index_hash(op.account_number)

session.commit()

print("\nEncrypting existing Exhibitor Profiles...")
for ep in session.query(ExhibitorProfile).all():
    updated = False
    if ep.pan_number and not ep.pan_number.startswith("enc::"):
        raw_pan = ep.pan_number
        ep.pan_hash = blind_index_hash(raw_pan)
        ep.pan_number = encrypt_field(raw_pan)
        updated = True
        print(f"Encrypted PAN for exhibitor: {ep.company_name}")
    elif ep.pan_number:
        ep.pan_hash = blind_index_hash(ep.pan_number)

    if ep.account_number and not ep.account_number.startswith("enc::"):
        raw_acc = ep.account_number
        ep.account_hash = blind_index_hash(raw_acc)
        ep.account_number = encrypt_field(raw_acc)
        updated = True
        print(f"Encrypted Account Number for exhibitor: {ep.company_name}")
    elif ep.account_number:
        ep.account_hash = blind_index_hash(ep.account_number)

session.commit()
print("\n>>> ALL SENSITIVE DATA MIGRATED AND ENCRYPTED SUCCESSFULLY!")
