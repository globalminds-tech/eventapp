import re
from typing import Type, Any, Optional
from sqlalchemy import select

def slugify(text: str) -> str:
    """
    Converts text to a URL-friendly slug.
    Example: "Tech Summit & Expo 2026!" -> "tech-summit-expo-2026"
    """
    if not text:
        return ""
    # Convert to lowercase
    s = text.lower().strip()
    # Replace non-alphanumeric characters with hyphens
    s = re.sub(r'[^a-z0-9]+', '-', s)
    # Strip leading and trailing hyphens
    s = s.strip('-')
    return s

def generate_unique_slug(
    session: Any,
    model_class: Type[Any],
    title_text: str,
    current_id: Optional[Any] = None,
    default_prefix: str = "item"
) -> str:
    """
    Generates a unique slug for a given SQLAlchemy model.
    Appends numeric increments (-1, -2, ...) if a collision occurs.
    """
    base_slug = slugify(title_text)
    if not base_slug:
        base_slug = default_prefix

    candidate = base_slug
    counter = 1

    while True:
        stmt = select(model_class).where(model_class.slug == candidate)
        if current_id is not None:
            stmt = stmt.where(model_class.id != current_id)
        
        existing = session.scalars(stmt).first()
        if not existing:
            return candidate

        candidate = f"{base_slug}-{counter}"
        counter += 1

def backfill_missing_slugs(session: Any):
    """
    Checks EventDetails, CategoryMaster, and OrganizerProfile tables
    and populates any missing slug fields.
    """
    try:
        from app.models.event import EventDetails
        from app.models.category import CategoryMaster
        from app.models.organizer_profile import OrganizerProfile

        # Backfill Events
        events = session.scalars(select(EventDetails).where((EventDetails.slug == None) | (EventDetails.slug == ""))).all()
        for e in events:
            e.slug = generate_unique_slug(session, EventDetails, e.event_name or "event", current_id=e.id, default_prefix="event")

        # Backfill Categories
        cats = session.scalars(select(CategoryMaster).where((CategoryMaster.slug == None) | (CategoryMaster.slug == ""))).all()
        for c in cats:
            c.slug = generate_unique_slug(session, CategoryMaster, c.name or "category", current_id=c.id, default_prefix="category")

        # Backfill Organizers
        orgs = session.scalars(select(OrganizerProfile).where((OrganizerProfile.slug == None) | (OrganizerProfile.slug == ""))).all()
        for o in orgs:
            o.slug = generate_unique_slug(session, OrganizerProfile, o.company_name or "organizer", current_id=o.id, default_prefix="organizer")

        session.commit()
    except Exception as err:
        session.rollback()
        print(f"Notice: Slug backfill encountered: {err}")
