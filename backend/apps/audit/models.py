from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    username = models.CharField(max_length=150, blank=True, default='')
    action = models.CharField(max_length=100)
    resource_type = models.CharField(max_length=100, blank=True, default='')
    resource_id = models.CharField(max_length=100, blank=True, default='')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['action']),
            models.Index(fields=['resource_type']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        user_str = self.user.username if self.user else (self.username or 'System')
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {user_str} - {self.action} ({self.resource_type}:{self.resource_id})"

def log_audit_action(user, action, resource_type='', resource_id='', ip_address=None, metadata=None):
    try:
        username = user.username if user and hasattr(user, 'username') else str(user or 'System')
        user_obj = user if (user and hasattr(user, 'pk') and user.pk) else None
        
        # Sanitize metadata to avoid logging sensitive keys
        clean_metadata = dict(metadata or {})
        for sensitive_key in ['password', 'token', 'secret', 'auth']:
            if sensitive_key in clean_metadata:
                clean_metadata[sensitive_key] = '***REDACTED***'

        AuditLog.objects.create(
            user=user_obj,
            username=username,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id),
            ip_address=ip_address,
            metadata=clean_metadata
        )
    except Exception as e:
        print(f"Failed to record audit log: {e}")
