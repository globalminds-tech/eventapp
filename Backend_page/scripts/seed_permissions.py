import sys
import os
sys.path.insert(0, os.path.abspath('.'))
from sqlalchemy import text
from app.extensions.database import db_session
from app.models.rbac import Permission, Role, RolePermission

# Master Platform Screens & Permissions Registry
MASTER_PERMISSIONS = [
    # Events Module
    {"module": "events", "action": "view", "code": "events.view", "name": "View Events", "description": "Can view event details, listings, and summary analytics"},
    {"module": "events", "action": "create", "code": "events.create", "name": "Create Events", "description": "Can draft and initiate new events in wizard"},
    {"module": "events", "action": "edit", "code": "events.edit", "name": "Edit Events", "description": "Can update event details, dates, pricing, and programs"},
    {"module": "events", "action": "delete", "code": "events.delete", "name": "Delete Events", "description": "Can soft-delete events and restore them"},
    {"module": "events", "action": "publish", "code": "events.publish", "name": "Publish Events", "description": "Can publish events directly or submit for admin approval"},

    # Stalls & Exhibitors Module
    {"module": "stalls", "action": "view", "code": "stalls.view", "name": "View Stalls", "description": "Can view stall listings, layout, and applicant directory"},
    {"module": "stalls", "action": "create", "code": "stalls.create", "name": "Create Stalls", "description": "Can add new stall categories, dimensions, and prices"},
    {"module": "stalls", "action": "edit", "code": "stalls.edit", "name": "Edit Stalls", "description": "Can edit stall layout, pricing, and amenities"},
    {"module": "stalls", "action": "approve", "code": "stalls.approve", "name": "Approve/Reject Stalls", "description": "Can review, approve, or reject exhibitor stall bookings"},
    {"module": "stalls", "action": "delete", "code": "stalls.delete", "name": "Delete Stalls", "description": "Can remove or soft-delete stall inventory"},

    # Gate Check-In & Badging
    {"module": "checkin", "action": "view", "code": "checkin.view", "name": "View Check-In Dashboard", "description": "Can view live check-in counters and gate capacity"},
    {"module": "checkin", "action": "scan", "code": "checkin.scan", "name": "Scan Tickets & Badges", "description": "Can execute QR code scanning to check in / checkout attendees"},

    # Finance & Revenue
    {"module": "finance", "action": "view", "code": "finance.view", "name": "View Finance", "description": "Can inspect revenue, ticket payouts, and invoices"},
    {"module": "finance", "action": "export", "code": "finance.export", "name": "Export Financial Data", "description": "Can download financial ledgers, GST reports, and Excel sheets"},
    {"module": "finance", "action": "refund", "code": "finance.refund", "name": "Issue Refunds", "description": "Can initiate ticket or stall booking refunds"},

    # Team & Member Management
    {"module": "team", "action": "view", "code": "team.view", "name": "View Team Members", "description": "Can view list of organization staff and members"},
    {"module": "team", "action": "invite", "code": "team.invite", "name": "Invite Team Members", "description": "Can send email invitations to new team members"},
    {"module": "team", "action": "edit", "code": "team.edit", "name": "Edit Team Members", "description": "Can change member titles, departments, or reassign roles"},
    {"module": "team", "action": "delete", "code": "team.delete", "name": "Remove Team Members", "description": "Can suspend or remove members from organization"},

    # Role & Access Control
    {"module": "roles", "action": "view", "code": "roles.view", "name": "View Roles", "description": "Can view available system and custom roles"},
    {"module": "roles", "action": "create", "code": "roles.create", "name": "Create Custom Roles", "description": "Can define new custom roles and configure permissions"},
    {"module": "roles", "action": "edit", "code": "roles.edit", "name": "Edit Custom Roles", "description": "Can modify permission assignments on custom roles"},
    {"module": "roles", "action": "delete", "code": "roles.delete", "name": "Delete Custom Roles", "description": "Can delete custom roles with member reassignment"},

    # Venues & Logistics
    {"module": "venues", "action": "view", "code": "venues.view", "name": "View Venues", "description": "Can browse venue directory and floor layouts"},
    {"module": "venues", "action": "manage", "code": "venues.manage", "name": "Manage Venues", "description": "Can create and update venues and attach documents"}
]

def seed_permissions():
    """Directly inject and sync all master platform screens & permissions into PostgreSQL."""
    session = db_session()
    try:
        inserted = 0
        updated = 0
        for item in MASTER_PERMISSIONS:
            existing = session.query(Permission).filter_by(code=item["code"]).first()
            if not existing:
                perm = Permission(
                    module=item["module"],
                    action=item["action"],
                    code=item["code"],
                    name=item["name"],
                    description=item["description"]
                )
                session.add(perm)
                inserted += 1
            else:
                existing.module = item["module"]
                existing.action = item["action"]
                existing.name = item["name"]
                existing.description = item["description"]
                updated += 1

        session.commit()
        print(f"[SUCCESS] Permissions seeded directly in DB: {inserted} inserted, {updated} updated, {len(MASTER_PERMISSIONS)} total.")
        return True
    except Exception as e:
        session.rollback()
        print(f"[ERROR] Failed to seed permissions: {e}")
        return False
    finally:
        session.close()

if __name__ == "__main__":
    seed_permissions()
