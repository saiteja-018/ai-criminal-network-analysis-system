from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    user_display = serializers.CharField(source='username', read_only=True)

    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'user_display', 'action', 'resource_type', 'resource_id', 'ip_address', 'metadata', 'timestamp']
        read_only_fields = fields
