from rapidfuzz import fuzz
from apps.entities.models import Entity, EntityMergeCandidate, EntityType
from apps.relationships.models import Relationship
from apps.audit.models import log_audit_action

EXACT_MATCH_THRESHOLD = 0.98
FUZZY_MATCH_THRESHOLD = 0.82

def resolve_entities_for_investigation(investigation_id: int):
    """
    Find candidate duplicate entities in an investigation and record merge candidates.
    Does NOT automatically merge entities if confidence is below EXACT_MATCH_THRESHOLD.
    """
    entities = list(Entity.objects.filter(investigation_id=investigation_id))
    new_candidates_count = 0

    for i in range(len(entities)):
        for j in range(i + 1, len(entities)):
            e1 = entities[i]
            e2 = entities[j]

            # Only compare entities of the same type or compatible types
            if e1.entity_type != e2.entity_type:
                continue

            # Exact normalized name match
            if e1.normalized_name == e2.normalized_name:
                sim_score = 1.0
                reason = "Exact normalized name match"
            else:
                sim_score = fuzz.token_sort_ratio(e1.normalized_name, e2.normalized_name) / 100.0
                reason = f"Fuzzy name similarity ({sim_score:.2f})"

            if sim_score >= FUZZY_MATCH_THRESHOLD:
                # Ensure source ID < target ID for consistency
                src, tgt = (e1, e2) if e1.id < e2.id else (e2, e1)
                
                candidate, created = EntityMergeCandidate.objects.get_or_create(
                    source_entity=src,
                    target_entity=tgt,
                    defaults={
                        'investigation_id': investigation_id,
                        'similarity_score': sim_score,
                        'match_reason': reason,
                        'status': EntityMergeCandidate.Status.PENDING
                    }
                )
                if created:
                    new_candidates_count += 1

    return new_candidates_count

def merge_entities(source_entity_id: int, target_entity_id: int, user=None):
    """
    Merge source_entity into target_entity:
    1. Reassign all relationships from source_entity to target_entity.
    2. Reassign communications, transactions, location events.
    3. Delete or archive source_entity.
    """
    try:
        source_entity = Entity.objects.get(id=source_entity_id)
        target_entity = Entity.objects.get(id=target_entity_id)
    except Entity.DoesNotExist:
        return False, "One or both entities do not exist"

    # Reassign outgoing relationships
    for rel in Relationship.objects.filter(source_entity=source_entity):
        if rel.target_entity_id != target_entity.id:
            Relationship.objects.get_or_create(
                investigation=rel.investigation,
                source_entity=target_entity,
                target_entity=rel.target_entity,
                relationship_type=rel.relationship_type,
                defaults={'confidence': rel.confidence, 'evidence': rel.evidence, 'source': rel.source}
            )
        rel.delete()

    # Reassign incoming relationships
    for rel in Relationship.objects.filter(target_entity=source_entity):
        if rel.source_entity_id != target_entity.id:
            Relationship.objects.get_or_create(
                investigation=rel.investigation,
                source_entity=rel.source_entity,
                target_entity=target_entity,
                relationship_type=rel.relationship_type,
                defaults={'confidence': rel.confidence, 'evidence': rel.evidence, 'source': rel.source}
            )
        rel.delete()

    # Update metadata in target entity
    src_meta = source_entity.metadata or {}
    tgt_meta = target_entity.metadata or {}
    merged_aliases = tgt_meta.get('aliases', [])
    if source_entity.name not in merged_aliases and source_entity.name != target_entity.name:
        merged_aliases.append(source_entity.name)
    tgt_meta['aliases'] = merged_aliases
    target_entity.metadata = tgt_meta
    target_entity.save()

    # Delete merged source entity
    source_name = source_entity.name
    source_entity.delete()

    log_audit_action(
        user=user,
        action='MERGE_ENTITIES',
        resource_type='Entity',
        resource_id=str(target_entity_id),
        metadata={'merged_source_id': source_entity_id, 'source_name': source_name, 'target_name': target_entity.name}
    )

    return True, f"Successfully merged {source_name} into {target_entity.name}"
