import uuid

def generate_unique_id(prefix=""):
    uid = str(uuid.uuid4()).replace("-", "")[:12]
    return f"{prefix}_{uid}" if prefix else uid
