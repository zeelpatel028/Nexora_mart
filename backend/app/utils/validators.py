import re

def validate_phone(phone: str) -> bool:
    """Validate 10 to 15 digit phone numbers."""
    if not phone:
        return True
    cleaned = re.sub(r"[^\d+]", "", phone)
    return 8 <= len(cleaned) <= 16

def validate_gst(gst: str) -> bool:
    """Validate standard 15-character Indian GST format (e.g., 22AAAAA0000A1Z5)."""
    if not gst:
        return True
    pattern = r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
    return bool(re.match(pattern, gst.strip().upper()))
