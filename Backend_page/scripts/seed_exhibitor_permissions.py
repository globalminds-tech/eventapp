import os
import sys

# Add Backend_page root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.extensions.database import db_session
from app.models.rbac import Permission, Role, RolePermission
import uuid

EXHIBITOR_PERMISSIONS = [
    # 1. Executive Dashboard
    {
        "module": "exhibitor_dashboard",
        "action": "view",
        "code": "exhibitor.dashboard.view",
        "name": "View Booth Dashboard",
        "description": "Can access booth KPIs, spend summary, active reservations, and lead counters",
        "scope": "EXHIBITOR"
    },

    # 2. Upcoming Expos & Floorplans
    {
        "module": "exhibitor_events",
        "action": "browse",
        "code": "exhibitor.events.browse",
        "name": "Browse Upcoming Expos",
        "description": "Can browse upcoming expos, event dates, venues, and registration deadlines",
        "scope": "EXHIBITOR"
    },
    {
        "module": "exhibitor_events",
        "action": "floorplan",
        "code": "exhibitor.events.floorplan",
        "name": "View Floor Plans & Layouts",
        "description": "Can inspect expo hall floor plans, stall dimensions, and layout blueprints",
        "scope": "EXHIBITOR"
    },

    # 3. Stall Reservations & Amenities
    {
        "module": "exhibitor_stalls",
        "action": "view",
        "code": "exhibitor.stalls.view",
        "name": "View My Bookings",
        "description": "Can inspect booked stalls, application status, stall number, and approvals",
        "scope": "EXHIBITOR"
    },
    {
        "module": "exhibitor_stalls",
        "action": "book",
        "code": "exhibitor.stalls.book",
        "name": "Book Exhibition Stalls",
        "description": "Can submit stall booking applications, select stall categories, and upload credentials",
        "scope": "EXHIBITOR"
    },
    {
        "module": "exhibitor_stalls",
        "action": "manage",
        "code": "exhibitor.stalls.manage",
        "name": "Manage Stall Preferences",
        "description": "Can request corner booth preferences, custom dimensions, and power amenities",
        "scope": "EXHIBITOR"
    },
    {
        "module": "exhibitor_stalls",
        "action": "cancel",
        "code": "exhibitor.stalls.cancel",
        "name": "Cancel Stall Application",
        "description": "Can withdraw or cancel pending stall reservation applications before approval",
        "scope": "EXHIBITOR"
    },

    # 4. Visitor Leads & Buyer Inquiries
    {
        "module": "exhibitor_leads",
        "action": "view",
        "code": "exhibitor.leads.view",
        "name": "View Visitor Leads",
        "description": "Can browse visitor contacts, inquiries, and leads captured at the stall",
        "scope": "EXHIBITOR"
    },
    {
        "module": "exhibitor_leads",
        "action": "create",
        "code": "exhibitor.leads.create",
        "name": "Capture & Log Spot Leads",
        "description": "Can log new on-site buyer inquiries, set buying intent, and record discussion notes",
        "scope": "EXHIBITOR"
    },
    {
        "module": "exhibitor_leads",
        "action": "export",
        "code": "exhibitor.leads.export",
        "name": "Export Visitor Leads",
        "description": "Can download collected attendee leads into CSV/Excel spreadsheets",
        "scope": "EXHIBITOR"
    },

    # 5. Billings, Invoices & Finance
    {
        "module": "exhibitor_billing",
        "action": "view",
        "code": "exhibitor.billing.view",
        "name": "View Stall Invoices & Ledgers",
        "description": "Can view stall rental payment ledgers, payment lock status, and fee breakdowns",
        "scope": "EXHIBITOR"
    },
    {
        "module": "exhibitor_billing",
        "action": "download",
        "code": "exhibitor.billing.download",
        "name": "Download GST Tax Invoices",
        "description": "Can print and download official 18% GST tax invoices and payment receipts",
        "scope": "EXHIBITOR"
    },

    # 6. Organization & Team Governance
    {
        "module": "exhibitor_team",
        "action": "view",
        "code": "exhibitor.team.view",
        "name": "View Booth Team",
        "description": "Can view list of active booth representatives, designations, and staff roster",
        "scope": "EXHIBITOR"
    },
    {
        "module": "exhibitor_team",
        "action": "invite",
        "code": "exhibitor.team.invite",
        "name": "Invite Booth Members",
        "description": "Can send email invitations to new booth staff and product demo hosts",
        "scope": "EXHIBITOR"
    },
    {
        "module": "exhibitor_team",
        "action": "edit",
        "code": "exhibitor.team.edit",
        "name": "Edit Team Members",
        "description": "Can update staff designations, contact details, and reassign roles",
        "scope": "EXHIBITOR"
    },
    {
        "module": "exhibitor_team",
        "action": "remove",
        "code": "exhibitor.team.remove",
        "name": "Remove Booth Members",
        "description": "Can deactivate or remove booth staff accounts from the organization",
        "scope": "EXHIBITOR"
    },
    {
        "module": "exhibitor_team",
        "action": "roles_view",
        "code": "exhibitor.roles.view",
        "name": "View Roles",
        "description": "Can view available system and custom booth roles",
        "scope": "EXHIBITOR"
    },
    {
        "module": "exhibitor_team",
        "action": "roles_manage",
        "code": "exhibitor.roles.manage",
        "name": "Manage Custom Roles",
        "description": "Can create, edit, and configure custom booth roles and permission sets",
        "scope": "EXHIBITOR"
    }
]

def seed_permissions():
    session = db_session()
    try:
        inserted_count = 0
        updated_count = 0

        for p_data in EXHIBITOR_PERMISSIONS:
            code = p_data["code"]
            existing = session.query(Permission).filter(Permission.code == code).first()
            if not existing:
                perm = Permission(
                    id=uuid.uuid4(),
                    module=p_data["module"],
                    action=p_data["action"],
                    code=code,
                    name=p_data["name"],
                    description=p_data["description"],
                    scope=p_data["scope"]
                )
                session.add(perm)
                inserted_count += 1
            else:
                existing.name = p_data["name"]
                existing.description = p_data["description"]
                existing.module = p_data["module"]
                existing.action = p_data["action"]
                existing.scope = p_data["scope"]
                updated_count += 1

        session.commit()
        print(f"SUCCESS: Seeded {inserted_count} new permissions, updated {updated_count} existing permissions.")

        # Also map to superuser role if it exists
        superuser_role = session.query(Role).filter(Role.code.in_(["superuser", "superadmin"])).first()
        if superuser_role:
            all_perms = session.query(Permission).all()
            mapped = 0
            for p in all_perms:
                exists = session.query(RolePermission).filter(
                    RolePermission.role_id == superuser_role.id,
                    RolePermission.permission_id == p.id
                ).first()
                if not exists:
                    rp = RolePermission(id=uuid.uuid4(), role_id=superuser_role.id, permission_id=p.id)
                    session.add(rp)
                    mapped += 1
            session.commit()
            print(f"Mapped {mapped} permissions to Super Admin role.")

    except Exception as e:
        session.rollback()
        print(f"ERROR: {e}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    seed_permissions()
