import sys
from app.extensions.database import db
from app.models.user import User
from app.models.organizer_profile import OrganizerProfile
from app.models.exhibitor_profile import ExhibitorProfile
from app.models.organization import Organization, OrganizationMember

session = db.session

# 1. Clean up dummy OrganizerProfiles for Sam and Ram
sam = session.query(User).filter_by(email='supporttabillbook@gmail.com').first()
if sam:
    op_sam = session.query(OrganizerProfile).filter_by(user_id=sam.id).first()
    if op_sam:
        session.delete(op_sam)
        print('Deleted dummy OrganizerProfile for Sam')

ram = session.query(User).filter_by(email='ashokbabu3843@gmail.com').first()
if ram:
    op_ram = session.query(OrganizerProfile).filter_by(user_id=ram.id).first()
    if op_ram:
        session.delete(op_ram)
        print('Deleted dummy OrganizerProfile for Ram')

# 2. Clean up dummy ExhibitorProfile for Smith
smith = session.query(User).filter_by(email='ashokbabu3483@gmail.com').first()
if smith:
    ep_smith = session.query(ExhibitorProfile).filter_by(user_id=smith.id).first()
    if ep_smith:
        session.delete(ep_smith)
        print('Deleted dummy ExhibitorProfile for Smith')
    
    smith_orgs = session.query(Organization).filter_by(owner_id=smith.id).all()
    for s_org in smith_orgs:
        session.query(OrganizationMember).filter_by(organization_id=s_org.id).delete()
        session.delete(s_org)
        print(f'Deleted erroneously auto-provisioned organization: {s_org.name}')

session.commit()
print('Database cleanup committed successfully!')
