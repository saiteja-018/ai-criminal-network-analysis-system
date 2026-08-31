from django.test import TestCase
from apps.investigations.models import Investigation
from apps.entities.models import Entity
from apps.relationships.models import Relationship
from services.graph.graph_analytics import calculate_centrality_metrics, get_entity_network

class AnalyticsTestCase(TestCase):
    def setUp(self):
        self.inv = Investigation.objects.create(title="Test Inv", case_number="CASE-TEST-101")
        self.e1 = Entity.objects.create(investigation=self.inv, name="Person A", normalized_name="person a")
        self.e2 = Entity.objects.create(investigation=self.inv, name="Person B", normalized_name="person b")
        self.e3 = Entity.objects.create(investigation=self.inv, name="Person C", normalized_name="person c")
        Relationship.objects.create(investigation=self.inv, source_entity=self.e1, target_entity=self.e2, relationship_type="KNOWS")
        Relationship.objects.create(investigation=self.inv, source_entity=self.e2, target_entity=self.e3, relationship_type="KNOWS")

    def test_centrality_calculation(self):
        metrics = calculate_centrality_metrics(self.inv.id)
        self.assertEqual(len(metrics), 3)
        self.assertIn(self.e2.id, metrics)
        # Person B connects A and C, so should have highest betweenness
        self.assertGreater(metrics[self.e2.id]['betweenness_centrality'], 0.0)

    def test_entity_network(self):
        net = get_entity_network(self.e1.id, depth=1)
        self.assertEqual(net['total_nodes'], 2) # Person A and Person B
        self.assertEqual(net['total_edges'], 1)
