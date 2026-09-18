import os
import sys
import uuid

backend_dir = r"d:\personal\eventapp\Backend_page"
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app
from app.extensions.database import db
from app.models.organizer_profile import OrganizerProfile
from app.models.exhibitor_profile import ExhibitorProfile
from app.models.user import User
from app.modules.auth.repository.auth_repository import AuthRepository
from sqlalchemy import text, select

def test_encryption_onboarding():
    test_email_org = f"test_org_{uuid.uuid4().hex[:6]}@example.com"
    test_email_exh = f"test_exh_{uuid.uuid4().hex[:6]}@example.com"
    
    raw_pan_org = "ABCDE1234F"
    raw_acc_org = "987654321012"

    print("\n--- 1. Testing Organizer Onboarding & Encryption ---")
    org_data = {
        "name": "Acme Organizer",
        "email": test_email_org,
        "company_name": "Acme Events Pvt Ltd",
        "business_type": "Private Limited",
        "gstin": "29ABCDE1234F1Z5",
        "pan_number": raw_pan_org,
        "bank_name": "HDFC Bank",
        "account_number": raw_acc_org,
        "ifsc_code": "HDFC0001234",
        "account_holder": "Acme Events",
        "upi_id": "acme@hdfcbank"
    }

    user_org = AuthRepository.create_organizer_user(org_data, password_hash="dummy_hash")
    print(f"Created Organizer User ID: {user_org.id}")

    # Check raw DB columns
    raw_db_row = db.session.execute(
        text("SELECT pan_number, account_number, pan_hash, account_hash FROM organizer_profiles WHERE user_id = :uid"),
        {"uid": user_org.id}
    ).fetchone()

    db_pan, db_acc, db_pan_hash, db_acc_hash = raw_db_row
    print(f"Raw DB pan_number: {db_pan[:20]}... (len: {len(db_pan)})")
    print(f"Raw DB account_number: {db_acc[:20]}... (len: {len(db_acc)})")
    print(f"Raw DB pan_hash: {db_pan_hash} (len: {len(db_pan_hash) if db_pan_hash else 0})")
    print(f"Raw DB account_hash: {db_acc_hash} (len: {len(db_acc_hash) if db_acc_hash else 0})")

    assert db_pan.startswith("enc::"), "Organizer PAN number in DB is NOT encrypted with enc:: prefix!"
    assert db_acc.startswith("enc::"), "Organizer Account number in DB is NOT encrypted with enc:: prefix!"
    assert len(db_pan_hash) == 64, "Organizer PAN blind index hash is not 64 chars!"
    assert len(db_acc_hash) == 64, "Organizer Account blind index hash is not 64 chars!"
    print("[PASS] DB storage is 100% encrypted & blind indexed.")

    # Test to_dict() masking
    org_profile = db.session.scalar(select(OrganizerProfile).where(OrganizerProfile.user_id == user_org.id))
    masked_dict = org_profile.to_dict(include_sensitive=False)
    print(f"to_dict masked PAN: {masked_dict.get('pan_number')}")
    print(f"to_dict masked Account: {masked_dict.get('account_number')}")

    assert masked_dict.get("pan_number") == "••••••234F", f"Masked PAN unexpected: {masked_dict.get('pan_number')}"
    assert masked_dict.get("account_number") == "••••••••1012", f"Masked Account unexpected: {masked_dict.get('account_number')}"
    print("[PASS] to_dict() correctly masks sensitive information.")

    # Test get_shared_kyc_data (for upgrading user)
    shared_kyc = AuthRepository.get_shared_kyc_data(str(user_org.id))
    print(f"get_shared_kyc_data PAN: {shared_kyc.get('pan_number')}")
    print(f"get_shared_kyc_data Account: {shared_kyc.get('account_number')}")
    assert shared_kyc.get("pan_number") == raw_pan_org, "Shared KYC did not decrypt PAN!"
    assert shared_kyc.get("account_number") == raw_acc_org, "Shared KYC did not decrypt Account!"
    print("[PASS] Shared KYC correctly decrypts data for user upgrade workflow.")

    print("\n--- 2. Testing Exhibitor Onboarding & Encryption ---")
    raw_pan_exh = "XYZPQ9876K"
    raw_acc_exh = "112233445566"
    exh_data = {
        "name": "Beta Exhibitor",
        "email": test_email_exh,
        "company_name": "Beta Innovations",
        "vendor_category": "Technology",
        "gstin": "33XYZPQ9876K1Z9",
        "pan_number": raw_pan_exh,
        "bank_name": "ICICI Bank",
        "account_number": raw_acc_exh,
        "ifsc_code": "ICIC0005678",
        "account_holder": "Beta Innovations",
        "upi_id": "beta@icici"
    }

    user_exh = AuthRepository.create_exhibitor_user(exh_data, password_hash="dummy_hash")
    print(f"Created Exhibitor User ID: {user_exh.id}")

    raw_exh_row = db.session.execute(
        text("SELECT pan_number, account_number, pan_hash, account_hash FROM exhibitor_profiles WHERE user_id = :uid"),
        {"uid": user_exh.id}
    ).fetchone()

    e_pan, e_acc, e_pan_hash, e_acc_hash = raw_exh_row
    print(f"Raw DB exhibitor pan_number: {e_pan[:20]}... (len: {len(e_pan)})")
    print(f"Raw DB exhibitor account_number: {e_acc[:20]}... (len: {len(e_acc)})")
    print(f"Raw DB exhibitor pan_hash: {e_pan_hash} (len: {len(e_pan_hash) if e_pan_hash else 0})")
    print(f"Raw DB exhibitor account_hash: {e_acc_hash} (len: {len(e_acc_hash) if e_acc_hash else 0})")

    assert e_pan.startswith("enc::"), "Exhibitor PAN in DB is NOT encrypted!"
    assert e_acc.startswith("enc::"), "Exhibitor Account in DB is NOT encrypted!"
    assert len(e_pan_hash) == 64, "Exhibitor PAN hash is not 64 chars!"
    assert len(e_acc_hash) == 64, "Exhibitor Account hash is not 64 chars!"

    exh_profile = db.session.scalar(select(ExhibitorProfile).where(ExhibitorProfile.user_id == user_exh.id))
    masked_exh = exh_profile.to_dict(include_sensitive=False)
    assert masked_exh.get("pan_number") == "••••••876K"
    assert masked_exh.get("account_number") == "••••••••5566"
    print("[PASS] Exhibitor DB storage & masking 100% verified.")

    print("\n--- 3. Testing Upgrade Flow (Step 1 + Attach Profile) ---")
    test_email_upg = f"test_upg_{uuid.uuid4().hex[:6]}@example.com"
    user_common = User(
        name="Common User",
        email=test_email_upg,
        password="dummy_pass_hash",
        roles=["user"],
        active_role="user",
        status="ACTIVE"
    )
    db.session.add(user_common)
    db.session.commit()

    # Step 1: Submit PAN
    step1_pan = "MNOPQ4321R"
    AuthRepository.save_organizer_step1(user_common, {
        "company_name": "Upgraded Media",
        "pan_number": step1_pan
    })

    db_upg_pan = db.session.execute(
        text("SELECT pan_number, pan_hash FROM organizer_profiles WHERE user_id = :uid"),
        {"uid": user_common.id}
    ).fetchone()
    assert db_upg_pan[0].startswith("enc::"), "Step 1 PAN is not encrypted!"
    assert len(db_upg_pan[1]) == 64, "Step 1 PAN hash missing!"
    print("[PASS] save_organizer_step1 saved encrypted PAN.")

    # Step 2: Attach profile with bank account
    step2_acc = "998877665544"
    AuthRepository.attach_organizer_profile(user_common, {
        "company_name": "Upgraded Media",
        "bank_name": "Axis Bank",
        "account_number": step2_acc,
        "ifsc_code": "UTIB0001234",
        "account_holder": "Common User"
    })

    db_upg_acc = db.session.execute(
        text("SELECT account_number, account_hash FROM organizer_profiles WHERE user_id = :uid"),
        {"uid": user_common.id}
    ).fetchone()
    assert db_upg_acc[0].startswith("enc::"), "Step 2 Account is not encrypted!"
    assert len(db_upg_acc[1]) == 64, "Step 2 Account hash missing!"
    print("[PASS] attach_organizer_profile saved encrypted Bank Account.")

    # Cleanup test data
    upg_profile = db.session.scalar(select(OrganizerProfile).where(OrganizerProfile.user_id == user_common.id))
    if upg_profile:
        db.session.delete(upg_profile)
    db.session.delete(user_common)

    db.session.delete(org_profile)
    db.session.delete(user_org)
    db.session.delete(exh_profile)
    db.session.delete(user_exh)
    db.session.commit()
    print("\n[PASS] Cleaned up test profiles successfully.")
    print("\nALL ENCRYPTION & ONBOARDING SECURITY TESTS PASSED!")

if __name__ == "__main__":
    test_encryption_onboarding()
