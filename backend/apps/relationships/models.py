from django.db import models
from apps.investigations.models import Investigation
from apps.entities.models import Entity

class RelationshipType(models.TextChoices):
    KNOWS = 'KNOWS', 'Knows'
    COMMUNICATED_WITH = 'COMMUNICATED_WITH', 'Communicated With'
    CALLED = 'CALLED', 'Called'
    TRANSFERRED_TO = 'TRANSFERRED_TO', 'Transferred To'
    OWNS = 'OWNS', 'Owns'
    ASSOCIATED_WITH = 'ASSOCIATED_WITH', 'Associated With'
    LOCATED_AT = 'LOCATED_AT', 'Located At'
    WORKS_FOR = 'WORKS_FOR', 'Works For'
    TRAVELLED_TO = 'TRAVELLED_TO', 'Travelled To'
    PARTICIPATED_IN = 'PARTICIPATED_IN', 'Participated In'
    LINKED_TO = 'LINKED_TO', 'Linked To'
    MENTIONED_WITH = 'MENTIONED_WITH', 'Mentioned With'

class Relationship(models.Model):
    investigation = models.ForeignKey(Investigation, on_delete=models.CASCADE, null=True, blank=True, related_name='relationships')
    source_entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='outgoing_relationships')
    target_entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='incoming_relationships')
    relationship_type = models.CharField(max_length=40, choices=RelationshipType.choices, default=RelationshipType.ASSOCIATED_WITH)
    confidence = models.FloatField(default=1.0)
    source = models.CharField(max_length=255, blank=True, default='MANUAL')
    evidence = models.TextField(blank=True, default='')
    first_seen = models.DateTimeField(null=True, blank=True)
    last_seen = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-confidence', '-created_at']
        unique_together = ('investigation', 'source_entity', 'target_entity', 'relationship_type')

    def __str__(self):
        return f"{self.source_entity.name} -[{self.relationship_type}]-> {self.target_entity.name}"


class CommunicationRecord(models.Model):
    investigation = models.ForeignKey(Investigation, on_delete=models.CASCADE, null=True, blank=True, related_name='communication_records')
    source_entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='outgoing_communications')
    target_entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='incoming_communications')
    communication_type = models.CharField(max_length=20, default='CALL')
    timestamp = models.DateTimeField(db_index=True)
    duration = models.IntegerField(default=0, help_text="Duration in seconds")
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Comm: {self.source_entity.name} -> {self.target_entity.name} @ {self.timestamp}"


class FinancialTransaction(models.Model):
    investigation = models.ForeignKey(Investigation, on_delete=models.CASCADE, null=True, blank=True, related_name='financial_transactions')
    sender = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='sent_transactions')
    receiver = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='received_transactions')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=10, default='USD')
    timestamp = models.DateTimeField(db_index=True)
    transaction_type = models.CharField(max_length=50, default='WIRE_TRANSFER')
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Tx: {self.sender.name} -> {self.receiver.name} (${self.amount}) @ {self.timestamp}"


class LocationEvent(models.Model):
    investigation = models.ForeignKey(Investigation, on_delete=models.CASCADE, null=True, blank=True, related_name='location_events')
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='location_events')
    location = models.CharField(max_length=255)
    timestamp = models.DateTimeField(db_index=True)
    event_type = models.CharField(max_length=50, default='CHECK_IN')
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Location: {self.entity.name} @ {self.location} [{self.timestamp}]"
