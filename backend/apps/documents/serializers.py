from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'investigation', 'document_type', 'title', 'raw_text', 'source', 'hash', 'processed', 'created_at']
        read_only_fields = ['id', 'hash', 'processed', 'created_at']

class DataImportSerializer(serializers.Serializer):
    investigation_id = serializers.IntegerField(required=True)
    import_type = serializers.ChoiceField(choices=['CSV_CDR', 'CSV_FINANCIAL', 'CSV_LOCATION', 'JSON_ENTITIES', 'TEXT_DOCUMENT'], default='TEXT_DOCUMENT')
    content = serializers.CharField(required=False, allow_blank=True)
    file = serializers.FileField(required=False)
