import re
import spacy

try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None

PHONE_REGEX = re.compile(r'(?:\+?\d{1,4}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}(?:[-.\s]?\d{3,4})?\b')
EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
VEHICLE_REGEX = re.compile(r'\b(?:[A-Z]{1,3}[-\s]?\d{1,4}[-\s]?[A-Z]{0,3}|[0-9][A-Z]{3}[0-9]{3})\b', re.IGNORECASE)
ACCOUNT_REGEX = re.compile(r'\b(?:ACC|ACCT|ACCOUNT|IBAN)[-\s:]*([A-Z0-9]{8,24})\b', re.IGNORECASE)

ORG_KEYWORDS = ['INC', 'LTD', 'CORP', 'LLC', 'GROUP', 'SYNDICATE', 'ENTERPRISES', 'HOLDINGS', 'CARTEL', 'GANG', 'CLUB', 'BANK']
LOC_KEYWORDS = ['STREET', 'AVENUE', 'CITY', 'ROAD', 'AIRPORT', 'STATION', 'DISTRICT', 'HARBOR', 'HIGHWAY', 'TOWN', 'PARK', 'PORT']

def extract_entities(text: str) -> list[dict]:
    """
    Extract structured entities from unstructured crime/intelligence text using spaCy and regex rules.
    Returns list of entity dicts: [{"text": str, "type": str, "confidence": float, "start": int, "end": int}]
    """
    entities = []
    seen = set()

    # 1. Regex Extraction for structured formats
    # Phones
    for match in PHONE_REGEX.finditer(text):
        val = match.group().strip()
        key = (val.lower(), "PHONE")
        if key not in seen:
            seen.add(key)
            entities.append({
                "text": val,
                "type": "PHONE",
                "confidence": 0.98,
                "start": match.start(),
                "end": match.end()
            })

    # Emails
    for match in EMAIL_REGEX.finditer(text):
        val = match.group().strip()
        key = (val.lower(), "EMAIL")
        if key not in seen:
            seen.add(key)
            entities.append({
                "text": val,
                "type": "EMAIL",
                "confidence": 0.99,
                "start": match.start(),
                "end": match.end()
            })

    # Bank Accounts
    for match in ACCOUNT_REGEX.finditer(text):
        val = match.group(1).strip() if match.groups() else match.group().strip()
        key = (val.lower(), "ACCOUNT")
        if key not in seen:
            seen.add(key)
            entities.append({
                "text": val,
                "type": "ACCOUNT",
                "confidence": 0.92,
                "start": match.start(),
                "end": match.end()
            })

    # 2. spaCy Extraction if available
    if nlp is not None:
        doc = nlp(text)
        for ent in doc.ents:
            val = ent.text.strip()
            if len(val) < 2:
                continue
            
            ent_type = "PERSON"
            confidence = 0.85
            
            if ent.label_ == "PERSON":
                ent_type = "PERSON"
                confidence = 0.90
            elif ent.label_ in ["ORG", "COMPANIES"]:
                ent_type = "ORGANIZATION"
                confidence = 0.88
            elif ent.label_ in ["GPE", "LOC", "FAC"]:
                ent_type = "LOCATION"
                confidence = 0.92
            elif ent.label_ in ["DATE", "TIME"]:
                ent_type = "EVENT"
                confidence = 0.80
            elif ent.label_ in ["MONEY"]:
                continue # Handled elsewhere
            else:
                continue

            # Check keyword overrides
            val_upper = val.upper()
            if any(kw in val_upper for kw in ORG_KEYWORDS):
                ent_type = "ORGANIZATION"
            elif any(kw in val_upper for kw in LOC_KEYWORDS):
                ent_type = "LOCATION"

            key = (val.lower(), ent_type)
            if key not in seen:
                seen.add(key)
                entities.append({
                    "text": val,
                    "type": ent_type,
                    "confidence": confidence,
                    "start": ent.start_char,
                    "end": ent.end_char
                })
    else:
        # Fallback simple capitalized name / keyword extractor if spaCy model is unavailable
        words = text.split()
        for i, word in enumerate(words):
            clean = re.sub(r'[^\w\s]', '', word)
            if clean and clean[0].isupper() and len(clean) > 2:
                upper = clean.upper()
                ent_type = "PERSON"
                if any(kw in upper for kw in ORG_KEYWORDS):
                    ent_type = "ORGANIZATION"
                elif any(kw in upper for kw in LOC_KEYWORDS):
                    ent_type = "LOCATION"
                
                key = (clean.lower(), ent_type)
                if key not in seen and clean.lower() not in ['the', 'this', 'that', 'from', 'with', 'after', 'before']:
                    seen.add(key)
                    entities.append({
                        "text": clean,
                        "type": ent_type,
                        "confidence": 0.75,
                        "start": 0,
                        "end": 0
                    })

    return entities

def normalize_entity(name: str) -> str:
    """Normalize entity name for matching."""
    cleaned = re.sub(r'[^\w\s]', '', name).strip().lower()
    return " ".join(cleaned.split())

def classify_entity(text: str) -> str:
    """Classify entity type from raw text string."""
    if PHONE_REGEX.search(text):
        return "PHONE"
    if EMAIL_REGEX.search(text):
        return "EMAIL"
    if ACCOUNT_REGEX.search(text):
        return "ACCOUNT"
    upper = text.upper()
    if any(kw in upper for kw in ORG_KEYWORDS):
        return "ORGANIZATION"
    if any(kw in upper for kw in LOC_KEYWORDS):
        return "LOCATION"
    return "PERSON"

def calculate_confidence(entity_data: dict) -> float:
    """Calculate confidence score for entity."""
    return entity_data.get('confidence', 0.85)
