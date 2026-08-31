import re
from typing import List, Dict, Any

RELATIONSHIP_PATTERNS = [
    (re.compile(r'\b(?:called|phoned|contacted|communicated with|messaged|texted)\b', re.I), "COMMUNICATED_WITH", 0.88),
    (re.compile(r'\b(?:transferred|sent|paid|wired|remitted)\b', re.I), "TRANSFERRED_TO", 0.90),
    (re.compile(r'\b(?:owns|drives|operates|registered to)\b', re.I), "OWNS", 0.92),
    (re.compile(r'\b(?:works for|employed by|member of|belongs to|head of|leader of)\b', re.I), "WORKS_FOR", 0.85),
    (re.compile(r'\b(?:located at|spotted at|seen in|resides at|visited)\b', re.I), "LOCATED_AT", 0.85),
    (re.compile(r'\b(?:associated with|partner of|accomplice of|linked to|connected with)\b', re.I), "ASSOCIATED_WITH", 0.80),
]

def extract_relationships_from_text(text: str, entities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Extract relationships between identified entities in text sentences.
    """
    relationships = []
    seen = set()

    # Split text into sentences
    sentences = re.split(r'[.!?\n]+', text)
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        
        # Find which entities appear in this sentence
        present_entities = []
        for ent in entities:
            ent_name = ent.get('text', '')
            if ent_name and ent_name.lower() in sentence.lower():
                present_entities.append(ent)
        
        if len(present_entities) >= 2:
            # Check for pattern triggers in sentence
            for i in range(len(present_entities)):
                for j in range(i + 1, len(present_entities)):
                    e1 = present_entities[i]
                    e2 = present_entities[j]

                    rel_type = "MENTIONED_WITH"
                    confidence = 0.70

                    for pattern, p_type, p_conf in RELATIONSHIP_PATTERNS:
                        if pattern.search(sentence):
                            rel_type = p_type
                            confidence = p_conf
                            break

                    # Specialized default logic based on entity types
                    t1, t2 = e1.get('type'), e2.get('type')
                    if t1 == 'PERSON' and t2 == 'VEHICLE':
                        rel_type = 'OWNS'
                    elif t1 == 'PERSON' and t2 == 'LOCATION':
                        rel_type = 'LOCATED_AT'
                    elif t1 == 'PERSON' and t2 == 'ORGANIZATION':
                        rel_type = 'ASSOCIATED_WITH'
                    elif t1 == 'PERSON' and t2 == 'PHONE':
                        rel_type = 'OWNS'
                    elif t1 == 'PERSON' and t2 == 'ACCOUNT':
                        rel_type = 'OWNS'

                    pair_key = (e1['text'].lower(), e2['text'].lower(), rel_type)
                    if pair_key not in seen:
                        seen.add(pair_key)
                        relationships.append({
                            "source_name": e1['text'],
                            "source_type": e1['type'],
                            "target_name": e2['text'],
                            "target_type": e2['type'],
                            "relationship_type": rel_type,
                            "confidence": confidence,
                            "evidence": sentence,
                            "source": "NLP_TEXT_EXTRACTION"
                        })

    return relationships
