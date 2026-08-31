from rest_framework import serializers
from .models import Alert

class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = [
            'id', 'investigation', 'alert_type', 'severity', 'description',
            'score', 'status', 'related_entities', 'evidence', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
