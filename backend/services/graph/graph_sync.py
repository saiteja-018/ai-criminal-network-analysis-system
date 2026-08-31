from apps.entities.models import Entity
from apps.relationships.models import Relationship
from .neo4j_client import neo4j_client

def sync_investigation_to_neo4j(investigation_id: int) -> bool:
    """
    Sync PostgreSQL Entities and Relationships for an investigation into Neo4j graph database.
    Creates nodes with labels matching EntityType and relationships with type matching RelationshipType.
    """
    if not neo4j_client.check_connection():
        print("Neo4j not connected. Graph sync skipped.")
        return False

    entities = Entity.objects.filter(investigation_id=investigation_id)
    relationships = Relationship.objects.filter(investigation_id=investigation_id)

    # 1. Sync Entities (Nodes)
    for entity in entities:
        label = entity.entity_type.capitalize()
        query = f"""
        MERGE (n:{label} {{id: $id}})
        SET n.name = $name,
            n.normalized_name = $normalized_name,
            n.entity_type = $entity_type,
            n.confidence = $confidence,
            n.investigation_id = $investigation_id
        """
        neo4j_client.execute_query(query, {
            "id": entity.id,
            "name": entity.name,
            "normalized_name": entity.normalized_name,
            "entity_type": entity.entity_type,
            "confidence": entity.confidence,
            "investigation_id": investigation_id
        })

    # 2. Sync Relationships (Edges)
    for rel in relationships:
        src_label = rel.source_entity.entity_type.capitalize()
        tgt_label = rel.target_entity.entity_type.capitalize()
        rel_type = rel.relationship_type

        # Sanitize rel_type for Cypher query
        clean_rel_type = "".join([c if c.isalnum() or c == '_' else '_' for c in rel_type])

        query = f"""
        MATCH (src:{src_label} {{id: $src_id}})
        MATCH (tgt:{tgt_label} {{id: $tgt_id}})
        MERGE (src)-[r:{clean_rel_type} {{id: $rel_id}}]->(tgt)
        SET r.confidence = $confidence,
            r.relationship_type = $relationship_type,
            r.source = $source,
            r.evidence = $evidence,
            r.investigation_id = $investigation_id
        """
        neo4j_client.execute_query(query, {
            "src_id": rel.source_entity.id,
            "tgt_id": rel.target_entity.id,
            "rel_id": rel.id,
            "confidence": rel.confidence,
            "relationship_type": rel.relationship_type,
            "source": rel.source or 'MANUAL',
            "evidence": rel.evidence or '',
            "investigation_id": investigation_id
        })

    return True
