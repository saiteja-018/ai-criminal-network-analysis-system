from django.test import TestCase
from services.nlp.entity_extractor import extract_entities, normalize_entity, classify_entity
from services.nlp.relationship_extractor import extract_relationships_from_text

class NLPTestCase(TestCase):
    def test_entity_extraction(self):
        text = "Ravi Kumar contacted Kumar from Hyderabad using phone +1-555-0192 and email ravi@example.com"
        entities = extract_entities(text)
        types = [e['type'] for e in entities]
        texts = [e['text'] for e in entities]

        self.assertIn('PERSON', types)
        self.assertIn('PHONE', types)
        self.assertIn('EMAIL', types)

    def test_normalization(self):
        self.assertEqual(normalize_entity(" Ravi  Kumar! "), "ravi kumar")

    def test_classification(self):
        self.assertEqual(classify_entity("+1-555-0192"), "PHONE")
        self.assertEqual(classify_entity("test@agency.gov"), "EMAIL")
        self.assertEqual(classify_entity("Apex Trading LLC"), "ORGANIZATION")

    def test_relationship_extraction(self):
        text = "Ravi Kumar called Anand Sharma regarding the cargo shipment."
        entities = [
            {"text": "Ravi Kumar", "type": "PERSON"},
            {"text": "Anand Sharma", "type": "PERSON"}
        ]
        rels = extract_relationships_from_text(text, entities)
        self.assertTrue(len(rels) >= 1)
        self.assertEqual(rels[0]['relationship_type'], "COMMUNICATED_WITH")
