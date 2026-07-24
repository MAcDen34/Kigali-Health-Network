import re

def parse_interval_hours(dosage: str) -> int:
    """
    Parses free-text dosage strings into an interval in hours between doses.
    Falls back to 24 (once daily) if nothing recognizable is found.
    """
    text = dosage.lower()

    match = re.search(r"every (\d+) hours?", text)
    if match:
        return int(match.group(1))

    if "three times" in text or "thrice" in text:
        return 8
    if "twice" in text:
        return 12
    if "daily" in text or "once" in text:
        return 24

    return 24
