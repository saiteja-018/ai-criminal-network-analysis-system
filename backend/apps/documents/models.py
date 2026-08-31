import hashlib
from django.db import models
from apps.investigations.models import Investigation

class Document(models.Model):
    class DocumentType(models.TextChoices):
        FIR = 'FIR', 'First Information Report (FIR)'
        POLICE_REPORT = 'POLICE_REPORT', 'Police Report'
        SURVEILLANCE_NOTE = 'SURVEILLANCE_NOTE', 'Surveillance Note'
        INTELLIGENCE_NOTE = 'INTELLIGENCE_NOTE', 'Intelligence Note'
        CDR_LOG = 'CDR_LOG', 'Call Detail Record (CDR)'
        BANK_STATEMENT = 'BANK_STATEMENT', 'Bank Statement'
        OTHER = 'OTHER', 'Other Document'

    investigation = models.ForeignKey(Investigation, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=50, choices=DocumentType.choices, default=DocumentType.POLICE_REPORT)
    title = models.CharField(max_length=255)
    raw_text = models.TextField()
    source = models.CharField(max_length=255, blank=True, default='UPLOAD')
    hash = models.CharField(max_length=64, blank=True, db_index=True)
    processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if self.raw_text and not self.hash:
            self.hash = hashlib.sha256(self.raw_text.encode('utf-8')).hexdigest()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.document_type})"
