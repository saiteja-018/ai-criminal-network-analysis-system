from rest_framework import serializers
from .models import Entity, EntityMergeCandidate

class EntitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entity
        fields = [
            'id', 'investigation', 'entity_type', 'name', 'normalized_name',
            'confidence', 'source', 'external_reference', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class EntityMergeCandidateSerializer(serializers.ModelSerializer):
    source_entity_detail = EntitySerializer(source='source_entity', read_only=True)
    target_entity_detail = EntitySerializer(source='target_entity', read_only=True)

    class Meta:
        model = EntityMergeCandidate
        fields = [
            'id', 'investigation', 'source_entity', 'target_entity',
            'source_entity_detail', 'target_entity_detail',
            'similarity_score', 'match_reason', 'status', 'reviewed_by',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
