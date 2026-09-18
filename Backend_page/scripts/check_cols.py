from app.extensions.database import db
from sqlalchemy import text

session = db.session
res = session.execute(text("SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME IN ('organizer_profiles', 'exhibitor_profiles') AND COLUMN_NAME IN ('pan_number', 'account_number', 'gstin')")).fetchall()
for r in res:
    print(r)
