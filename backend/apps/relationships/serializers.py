from rest_framework import serializers
from .models import Relationship, CommunicationRecord, FinancialTransaction, LocationEvent
from apps.entities.serializers import EntitySerializer

class RelationshipSerializer(serializers.ModelSerializer):
    source_entity_detail = EntitySerializer(source='source_entity', read_only=True)
    target_entity_detail = EntitySerializer(source='target_entity', read_only=True)

    class Meta:
        model = Relationship
        fields = [
            'id', 'investigation', 'source_entity', 'target_entity',
            'source_entity_detail', 'target_entity_detail',
            'relationship_type', 'confidence', 'source', 'evidence',
            'first_seen', 'last_seen', 'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class CommunicationRecordSerializer(serializers.ModelSerializer):
    source_entity_detail = EntitySerializer(source='source_entity', read_only=True)
    target_entity_detail = EntitySerializer(source='target_entity', read_only=True)

    class Meta:
        model = CommunicationRecord
        fields = [
            'id', 'investigation', 'source_entity', 'target_entity',
            'source_entity_detail', 'target_entity_detail',
            'communication_type', 'timestamp', 'duration', 'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class FinancialTransactionSerializer(serializers.ModelSerializer):
    sender_detail = EntitySerializer(source='sender', read_only=True)
    receiver_detail = EntitySerializer(source='receiver', read_only=True)

    class Meta:
        model = FinancialTransaction
        fields = [
            'id', 'investigation', 'sender', 'receiver',
            'sender_detail', 'receiver_detail',
            'amount', 'currency', 'timestamp', 'transaction_type', 'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class LocationEventSerializer(serializers.ModelSerializer):
    entity_detail = EntitySerializer(source='entity', read_only=True)

    class Meta:
        model = LocationEvent
        fields = [
            'id', 'investigation', 'entity', 'entity_detail',
            'location', 'timestamp', 'event_type', 'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
