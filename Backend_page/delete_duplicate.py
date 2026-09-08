import sys
import os

# Ensure app is in path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.extensions.database import db
from app.models.event import EventDetails

events = EventDetails.query.filter(EventDetails.event_name.ilike('%Industrial Expo%')).order_by(EventDetails.created_at.desc()).all()
print("Found events:")
for e in events:
    print(f"ID: {e.id}, Created: {e.created_at}, Name: {e.event_name}")

if len(events) > 1:
    # The first one is the newest due to desc()
    dup = events[0]
    print(f"Deleting newest duplicate event ID: {dup.id}")
    db.session.delete(dup)
    db.session.commit()
    print("Deleted duplicate successfully.")
else:
    print("No duplicate found or only 1 exists.")
