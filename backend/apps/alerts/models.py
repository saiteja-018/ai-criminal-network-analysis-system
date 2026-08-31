from django.db import models
from apps.investigations.models import Investigation

class Alert(models.Model):
    class Severity(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        CRITICAL = 'CRITICAL', 'Critical'

    class Status(models.TextChoices):
        NEW = 'NEW', 'New'
        UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
        DISMISSED = 'DISMISSED', 'Dismissed'
        RESOLVED = 'RESOLVED', 'Resolved'

    investigation = models.ForeignKey(Investigation, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=100)
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.MEDIUM)
    description = models.TextField()
    score = models.FloatField(default=0.0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    related_entities = models.JSONField(default=list, blank=True)
    evidence = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score', '-created_at']
        indexes = [
            models.Index(fields=['severity']),
            models.Index(fields=['status']),
            models.Index(fields=['alert_type']),
        ]

    def __str__(self):
        return f"[{self.severity}] {self.alert_type} - {self.description[:40]}"
