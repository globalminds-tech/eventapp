from app.extensions.database import db
from app.models.user import User
from app.models.organizer_profile import OrganizerProfile
from app.models.exhibitor_profile import ExhibitorProfile
from sqlalchemy import select

class AuthRepository:
    @staticmethod
    def get_user_by_email(email: str) -> User | None:
        if not email:
            return None
        try:
            stmt = select(User).where(User.email == email.strip().lower())
            return db.session.scalar(stmt)
        except Exception:
            try:
                db.session.rollback()
            except Exception:
                pass
            stmt = select(User).where(User.email == email.strip().lower())
            return db.session.scalar(stmt)

    @staticmethod
    def get_user_by_id(user_id) -> User | None:
        import uuid
        parsed_id = user_id
        if isinstance(user_id, str):
            try:
                parsed_id = uuid.UUID(user_id)
            except Exception:
                parsed_id = user_id
        try:
            return db.session.get(User, parsed_id)
        except Exception:
            try:
                db.session.rollback()
            except Exception:
                pass
            return db.session.get(User, parsed_id)

    @staticmethod
    def get_organizer_profile_by_user_id(user_id) -> OrganizerProfile | None:
        stmt = select(OrganizerProfile).where(OrganizerProfile.user_id == user_id)
        return db.session.scalar(stmt)

    @staticmethod
    def get_exhibitor_profile_by_user_id(user_id) -> ExhibitorProfile | None:
        stmt = select(ExhibitorProfile).where(ExhibitorProfile.user_id == user_id)
        return db.session.scalar(stmt)

    @staticmethod
    def create_user(name: str, email: str, password_hash: str, role: str, mobile: str = None) -> User:
        clean_role = (role or "user").strip().lower()
        user_roles = [clean_role] if clean_role == "user" else [clean_role, "user"]
        user = User(
            name=name,
            email=email.strip().lower(),
            password=password_hash,
            roles=user_roles,
            active_role=clean_role,
            mobile=mobile,
            status="ACTIVE"
        )
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def _apply_profile_field(profile, key: str, val):
        from app.utils.security_crypto import encrypt_field, blind_index_hash
        if val is None or val == "":
            return
        if key == "pan_number":
            clean_val = str(val).strip().upper()
            profile.pan_number = encrypt_field(clean_val)
            profile.pan_hash = blind_index_hash(clean_val)
        elif key == "account_number":
            clean_val = str(val).strip()
            profile.account_number = encrypt_field(clean_val)
            profile.account_hash = blind_index_hash(clean_val)
        else:
            setattr(profile, key, val)

    @staticmethod
    def create_organizer_user(data: dict, password_hash: str) -> User:
        from app.utils.security_crypto import encrypt_field, blind_index_hash
        user = User(
            name=data.get("name"),
            email=data.get("email").strip().lower(),
            password=password_hash,
            roles=["organizer", "user"],
            active_role="organizer",
            mobile=data.get("mobile"),
            organization_name=data.get("company_name"),
            address=data.get("business_address"),
            city=data.get("city"),
            state=data.get("state"),
            status="ACTIVE"
        )
        db.session.add(user)
        db.session.flush()

        pan_raw = data.get("pan_number")
        acc_raw = data.get("account_number")
        pan_enc = encrypt_field(str(pan_raw).strip().upper()) if pan_raw else None
        pan_h = blind_index_hash(str(pan_raw).strip().upper()) if pan_raw else None
        acc_enc = encrypt_field(str(acc_raw).strip()) if acc_raw else None
        acc_h = blind_index_hash(str(acc_raw).strip()) if acc_raw else None

        profile = OrganizerProfile(
            user_id=user.id,
            company_name=data.get("company_name"),
            business_type=data.get("business_type"),
            gstin=data.get("gstin"),
            pan_number=pan_enc,
            pan_hash=pan_h,
            business_address=data.get("business_address"),
            city=data.get("city"),
            state=data.get("state"),
            pincode=data.get("pincode"),
            website_url=data.get("website_url"),
            bank_name=data.get("bank_name"),
            account_number=acc_enc,
            account_hash=acc_h,
            ifsc_code=data.get("ifsc_code"),
            account_holder=data.get("account_holder"),
            upi_id=data.get("upi_id"),
            kyc_status="PENDING"
        )
        db.session.add(profile)
        db.session.commit()
        return user

    @staticmethod
    def get_shared_kyc_data(user_id) -> dict:
        """Fetch pre-existing shared KYC fields from either profile if present."""
        from app.utils.security_crypto import decrypt_field
        shared = {}
        org_profile = db.session.scalar(select(OrganizerProfile).where(OrganizerProfile.user_id == user_id))
        exh_profile = db.session.scalar(select(ExhibitorProfile).where(ExhibitorProfile.user_id == user_id))

        source = org_profile or exh_profile
        if source:
            for field in [
                "company_name", "gstin", "pan_number", "business_address",
                "city", "state", "pincode", "website_url", "bank_name",
                "account_number", "ifsc_code", "account_holder", "upi_id"
            ]:
                val = getattr(source, field, None)
                if val:
                    if field in ["pan_number", "account_number"]:
                        shared[field] = decrypt_field(val)
                    else:
                        shared[field] = val
        return shared

    @staticmethod
    def save_organizer_step1(user: User, data: dict) -> User:
        if data.get("mobile"):
            user.mobile = data.get("mobile")
        if data.get("company_name"):
            user.organization_name = data.get("company_name")
        if data.get("business_address"):
            user.address = data.get("business_address")
        if data.get("city"):
            user.city = data.get("city")
        if data.get("state"):
            user.state = data.get("state")

        profile = db.session.scalar(select(OrganizerProfile).where(OrganizerProfile.user_id == user.id))
        if not profile:
            profile = OrganizerProfile(user_id=user.id, company_name=data.get("company_name", ""))
            db.session.add(profile)

        for key in ["company_name", "business_type", "gstin", "pan_number", "business_address", "city", "state", "pincode", "website_url"]:
            val = data.get(key)
            if val is not None and val != "":
                AuthRepository._apply_profile_field(profile, key, val)

        if profile.kyc_status != "VERIFIED":
            profile.kyc_status = "IN_PROGRESS"

        db.session.commit()
        return user

    @staticmethod
    def attach_organizer_profile(user: User, data: dict, password_hash: str = "") -> User:
        current_roles = list(user.roles) if user.roles else ["user"]
        if "organizer" not in current_roles:
            current_roles.append("organizer")
        user.roles = current_roles
        user.active_role = "organizer"
        if data.get("name"):
            user.name = data.get("name")
        if password_hash:
            user.password = password_hash
        if data.get("mobile"):
            user.mobile = data.get("mobile")
        if data.get("company_name"):
            user.organization_name = data.get("company_name")
        if data.get("business_address"):
            user.address = data.get("business_address")
        if data.get("city"):
            user.city = data.get("city")
        if data.get("state"):
            user.state = data.get("state")

        profile = db.session.scalar(select(OrganizerProfile).where(OrganizerProfile.user_id == user.id))
        if not profile:
            profile = OrganizerProfile(
                user_id=user.id,
                company_name=data.get("company_name", "")
            )
            db.session.add(profile)

        for key in ["company_name", "business_type", "gstin", "pan_number", "business_address", "city", "state", "pincode", "website_url", "bank_name", "account_number", "ifsc_code", "account_holder", "upi_id"]:
            val = data.get(key)
            if val is not None and val != "":
                AuthRepository._apply_profile_field(profile, key, val)
        profile.kyc_status = "PENDING"

        db.session.commit()
        return user

    @staticmethod
    def create_exhibitor_user(data: dict, password_hash: str) -> User:
        from app.utils.security_crypto import encrypt_field, blind_index_hash
        user = User(
            name=data.get("name"),
            email=data.get("email").strip().lower(),
            password=password_hash,
            roles=["exhibitor", "user"],
            active_role="exhibitor",
            mobile=data.get("mobile"),
            organization_name=data.get("company_name"),
            address=data.get("business_address"),
            city=data.get("city"),
            state=data.get("state"),
            status="ACTIVE"
        )
        db.session.add(user)
        db.session.flush()

        pan_raw = data.get("pan_number")
        acc_raw = data.get("account_number")
        pan_enc = encrypt_field(str(pan_raw).strip().upper()) if pan_raw else None
        pan_h = blind_index_hash(str(pan_raw).strip().upper()) if pan_raw else None
        acc_enc = encrypt_field(str(acc_raw).strip()) if acc_raw else None
        acc_h = blind_index_hash(str(acc_raw).strip()) if acc_raw else None

        profile = ExhibitorProfile(
            user_id=user.id,
            company_name=data.get("company_name"),
            vendor_category=data.get("vendor_category"),
            gstin=data.get("gstin"),
            pan_number=pan_enc,
            pan_hash=pan_h,
            business_address=data.get("business_address"),
            city=data.get("city"),
            state=data.get("state"),
            pincode=data.get("pincode"),
            website_url=data.get("website_url"),
            bank_name=data.get("bank_name"),
            account_number=acc_enc,
            account_hash=acc_h,
            ifsc_code=data.get("ifsc_code"),
            account_holder=data.get("account_holder"),
            upi_id=data.get("upi_id"),
            kyc_status="PENDING"
        )
        db.session.add(profile)
        db.session.commit()
        return user

    @staticmethod
    def save_exhibitor_step1(user: User, data: dict) -> User:
        if data.get("mobile"):
            user.mobile = data.get("mobile")
        if data.get("company_name"):
            user.organization_name = data.get("company_name")
        if data.get("business_address"):
            user.address = data.get("business_address")
        if data.get("city"):
            user.city = data.get("city")
        if data.get("state"):
            user.state = data.get("state")

        profile = db.session.scalar(select(ExhibitorProfile).where(ExhibitorProfile.user_id == user.id))
        if not profile:
            profile = ExhibitorProfile(user_id=user.id, company_name=data.get("company_name", ""))
            db.session.add(profile)

        for key in ["company_name", "vendor_category", "gstin", "pan_number", "business_address", "city", "state", "pincode", "website_url"]:
            val = data.get(key)
            if val is not None and val != "":
                AuthRepository._apply_profile_field(profile, key, val)

        if profile.kyc_status != "VERIFIED":
            profile.kyc_status = "IN_PROGRESS"

        db.session.commit()
        return user

    @staticmethod
    def attach_exhibitor_profile(user: User, data: dict, password_hash: str = "") -> User:
        current_roles = list(user.roles) if user.roles else ["user"]
        if "exhibitor" not in current_roles:
            current_roles.append("exhibitor")
        user.roles = current_roles
        user.active_role = "exhibitor"
        if data.get("name"):
            user.name = data.get("name")
        if password_hash:
            user.password = password_hash
        if data.get("mobile"):
            user.mobile = data.get("mobile")
        if data.get("company_name"):
            user.organization_name = data.get("company_name")
        if data.get("business_address"):
            user.address = data.get("business_address")
        if data.get("city"):
            user.city = data.get("city")
        if data.get("state"):
            user.state = data.get("state")

        profile = db.session.scalar(select(ExhibitorProfile).where(ExhibitorProfile.user_id == user.id))
        if not profile:
            profile = ExhibitorProfile(
                user_id=user.id,
                company_name=data.get("company_name", "")
            )
            db.session.add(profile)

        for key in ["company_name", "vendor_category", "gstin", "pan_number", "business_address", "city", "state", "pincode", "website_url", "bank_name", "account_number", "ifsc_code", "account_holder", "upi_id"]:
            val = data.get(key)
            if val is not None and val != "":
                AuthRepository._apply_profile_field(profile, key, val)
        profile.kyc_status = "PENDING"

        db.session.commit()
        return user

    @staticmethod
    def update_password(email: str, password_hash: str) -> bool:
        user = AuthRepository.get_user_by_email(email)
        if user:
            user.password = password_hash
            user.must_change_password = False
            db.session.commit()
            return True
        return False

    @staticmethod
    def update_user_password(user_id, password_hash: str) -> bool:
        try:
            user = AuthRepository.get_user_by_id(user_id)
            if user:
                user.password = password_hash
                user.must_change_password = False
                db.session.commit()
                return True
            return False
        except Exception as e:
            db.session.rollback()
            raise e

