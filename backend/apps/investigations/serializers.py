from rest_framework import serializers
from .models import Investigation
from apps.accounts.serializers import UserSerializer

class InvestigationSerializer(serializers.ModelSerializer):
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    entity_count = serializers.IntegerField(source='entities.count', read_only=True, default=0)
    relationship_count = serializers.IntegerField(source='relationships.count', read_only=True, default=0)
    alert_count = serializers.IntegerField(source='alerts.count', read_only=True, default=0)
    document_count = serializers.IntegerField(source='documents.count', read_only=True, default=0)

    class Meta:
        model = Investigation
        fields = [
            'id', 'title', 'description', 'case_number', 'status', 'priority',
            'created_by', 'created_by_detail', 'entity_count', 'relationship_count',
            'alert_count', 'document_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        return super().create(validated_data)
