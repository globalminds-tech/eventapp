import sys
import os
sys.path.insert(0, os.path.abspath('.'))
import re
from app.extensions.database import db_session
from app.models.user import User
from app.models.organization import Organization, OrganizationMember
from app.models.rbac import Role

def run():
    session = db_session()
    try:
        users = session.query(User).all()
        print(f"Total users: {len(users)}")
        owner_role = session.query(Role).filter_by(code='org_owner').first()
        super_role = session.query(Role).filter_by(code='super_admin').first()

        for u in users:
            existing_org = session.query(Organization).filter_by(owner_id=u.id).first()
            if not existing_org:
                clean_name = u.name or u.email.split('@')[0]
                base_slug = re.sub(r'[^a-zA-Z0-9]+', '-', (u.organization_name or clean_name).lower()).strip('-')
                slug = f"{base_slug}-{str(u.id)[:6]}"
                org = Organization(
                    name=u.organization_name or f"{clean_name}'s Workspace",
                    slug=slug,
                    org_type='PLATFORM' if 'superuser' in (u.roles or []) else 'ORGANIZER',
                    owner_id=u.id,
                    status='ACTIVE'
                )
                session.add(org)
                session.flush()

                role_to_assign = super_role if 'superuser' in (u.roles or []) else owner_role
                if role_to_assign:
                    member = OrganizationMember(
                        organization_id=org.id,
                        user_id=u.id,
                        role_id=role_to_assign.id,
                        title='Owner / Administrator',
                        status='ACTIVE'
                    )
                    session.add(member)
                print(f"Created Org: {org.name} ({org.slug}) for {u.email}")
        session.commit()
        print("Backfill completed successfully!")
    finally:
        session.close()

if __name__ == '__main__':
    run()
