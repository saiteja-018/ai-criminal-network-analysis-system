from django.db import models
from apps.investigations.models import Investigation
from django.conf import settings

class EntityType(models.TextChoices):
    PERSON = 'PERSON', 'Person'
    ORGANIZATION = 'ORGANIZATION', 'Organization'
    LOCATION = 'LOCATION', 'Location'
    VEHICLE = 'VEHICLE', 'Vehicle'
    PHONE = 'PHONE', 'Phone'
    EMAIL = 'EMAIL', 'Email'
    ACCOUNT = 'ACCOUNT', 'Account'
    CASE = 'CASE', 'Case'
    EVENT = 'EVENT', 'Event'
    SOCIAL_PROFILE = 'SOCIAL_PROFILE', 'Social Profile'
    DOCUMENT = 'DOCUMENT', 'Document'

class Entity(models.Model):
    investigation = models.ForeignKey(Investigation, on_delete=models.CASCADE, null=True, blank=True, related_name='entities')
    entity_type = models.CharField(max_length=30, choices=EntityType.choices, default=EntityType.PERSON)
    name = models.CharField(max_length=255)
    normalized_name = models.CharField(max_length=255, db_index=True)
    confidence = models.FloatField(default=1.0)
    source = models.CharField(max_length=255, blank=True, default='MANUAL')
    external_reference = models.CharField(max_length=255, blank=True, default='', db_index=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['normalized_name']),
            models.Index(fields=['entity_type']),
            models.Index(fields=['external_reference']),
            models.Index(fields=['created_at']),
        ]

    def save(self, *args, **kwargs):
        if not self.normalized_name:
            self.normalized_name = self.name.strip().lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.entity_type})"


class EntityMergeCandidate(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Review'
        APPROVED = 'APPROVED', 'Merged / Approved'
        REJECTED = 'REJECTED', 'Rejected'

    investigation = models.ForeignKey(Investigation, on_delete=models.CASCADE, null=True, blank=True, related_name='merge_candidates')
    source_entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='source_merge_candidates')
    target_entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='target_merge_candidates')
    similarity_score = models.FloatField(default=0.0)
    match_reason = models.CharField(max_length=255, blank=True, default='')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('source_entity', 'target_entity')

    def __str__(self):
        return f"Merge candidate: {self.source_entity.name} <-> {self.target_entity.name} ({self.similarity_score:.2f})"
