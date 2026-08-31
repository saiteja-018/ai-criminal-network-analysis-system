from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from apps.investigations.models import Investigation
from apps.entities.models import Entity
from apps.relationships.models import FinancialTransaction, CommunicationRecord
from services.anomaly_detection.engine import run_anomaly_detection

class AnomalyTestCase(TestCase):
    def setUp(self):
        self.inv = Investigation.objects.create(title="Anomaly Case", case_number="CASE-ANOMALY-01")
        self.e1 = Entity.objects.create(investigation=self.inv, name="Alpha", normalized_name="alpha")
        self.e2 = Entity.objects.create(investigation=self.inv, name="Beta", normalized_name="beta")
        self.e3 = Entity.objects.create(investigation=self.inv, name="Gamma", normalized_name="gamma")

    def test_circular_money_flow_detection(self):
        now = timezone.now()
        FinancialTransaction.objects.create(investigation=self.inv, sender=self.e1, receiver=self.e2, amount=10000, timestamp=now)
        FinancialTransaction.objects.create(investigation=self.inv, sender=self.e2, receiver=self.e3, amount=9500, timestamp=now)
        FinancialTransaction.objects.create(investigation=self.inv, sender=self.e3, receiver=self.e1, amount=9000, timestamp=now)

        alerts = run_anomaly_detection(self.inv.id)
        alert_types = [a.alert_type for a in alerts]
        self.assertIn("CIRCULAR_MONEY_FLOW", alert_types)

    def test_high_comm_frequency_detection(self):
        now = timezone.now()
        for i in range(6):
            CommunicationRecord.objects.create(
                investigation=self.inv,
                source_entity=self.e1,
                target_entity=self.e2,
                communication_type="CALL",
                timestamp=now - timedelta(minutes=i*10)
            )

        alerts = run_anomaly_detection(self.inv.id)
        alert_types = [a.alert_type for a in alerts]
        self.assertIn("HIGH_COMMUNICATION_FREQUENCY", alert_types)
