import csv
import json
import time
import io
from django.utils import timezone
from apps.entities.models import Entity, EntityType
from apps.relationships.models import Relationship, RelationshipType, CommunicationRecord, FinancialTransaction, LocationEvent
from apps.documents.models import Document
from services.nlp.entity_extractor import extract_entities
from services.nlp.relationship_extractor import extract_relationships_from_text
from services.graph.graph_sync import sync_investigation_to_neo4j
from services.entity_resolution.resolver import resolve_entities_for_investigation
from services.anomaly_detection.engine import run_anomaly_detection

def process_text_document(investigation_id: int, title: str, text: str, doc_type: str = 'POLICE_REPORT', source: str = 'UPLOAD') -> dict:
    """
    Process raw document text:
    1. Save Document model.
    2. Extract entities via NLP pipeline.
    3. Extract relationships via NLP pipeline.
    4. Save Entities & Relationships to PostgreSQL.
    5. Sync to Neo4j.
    6. Run Entity Resolution.
    7. Run Anomaly Detection.
    """
    start_time = time.time()
    
    # 1. Create Document
    doc = Document.objects.create(
        investigation_id=investigation_id,
        document_type=doc_type,
        title=title,
        raw_text=text,
        source=source
    )

    # 2. NLP Entity Extraction
    extracted_ents = extract_entities(text)
    entities_created = 0
    entity_map = {}

    for e in extracted_ents:
        norm_name = e['text'].strip().lower()
        ent, created = Entity.objects.get_or_create(
            investigation_id=investigation_id,
            normalized_name=norm_name,
            defaults={
                'name': e['text'].strip(),
                'entity_type': e['type'],
                'confidence': e['confidence'],
                'source': f"NLP_DOC_{doc.id}"
            }
        )
        if created:
            entities_created += 1
        entity_map[norm_name] = ent

    # 3. NLP Relationship Extraction
    extracted_rels = extract_relationships_from_text(text, extracted_ents)
    rels_created = 0

    for r in extracted_rels:
        src_norm = r['source_name'].strip().lower()
        tgt_norm = r['target_name'].strip().lower()

        src_ent = entity_map.get(src_norm)
        tgt_ent = entity_map.get(tgt_norm)

        if src_ent and tgt_ent and src_ent.id != tgt_ent.id:
            rel, created = Relationship.objects.get_or_create(
                investigation_id=investigation_id,
                source_entity=src_ent,
                target_entity=tgt_ent,
                relationship_type=r['relationship_type'],
                defaults={
                    'confidence': r['confidence'],
                    'evidence': r['evidence'],
                    'source': f"NLP_DOC_{doc.id}"
                }
            )
            if created:
                rels_created += 1

    # Mark document processed
    doc.processed = True
    doc.save()

    # 4. Sync & Pipeline Triggers
    sync_investigation_to_neo4j(investigation_id)
    resolve_entities_for_investigation(investigation_id)
    run_anomaly_detection(investigation_id)

    elapsed = round(time.time() - start_time, 3)

    return {
        "document_id": doc.id,
        "total_records": 1,
        "successful_records": 1,
        "failed_records": 0,
        "entities_created": entities_created,
        "relationships_created": rels_created,
        "processing_time_seconds": elapsed
    }

def import_csv_data(investigation_id: int, csv_content: str, import_type: str) -> dict:
    """
    Import structured CSV data (CDR, Financial, Location).
    """
    start_time = time.time()
    reader = csv.DictReader(io.StringIO(csv_content))

    total = 0
    success = 0
    failed = 0
    entities_created = 0
    rels_created = 0

    for row in reader:
        total += 1
        try:
            if import_type == 'CSV_CDR':
                # Columns: caller, receiver, timestamp, duration
                caller_name = row.get('caller') or row.get('sender') or row.get('source')
                receiver_name = row.get('receiver') or row.get('target') or row.get('destination')
                ts = row.get('timestamp') or timezone.now().isoformat()
                dur = int(row.get('duration', 0))

                if caller_name and receiver_name:
                    e1, c1 = Entity.objects.get_or_create(
                        investigation_id=investigation_id,
                        normalized_name=caller_name.strip().lower(),
                        defaults={'name': caller_name.strip(), 'entity_type': 'PERSON', 'source': 'CSV_CDR'}
                    )
                    e2, c2 = Entity.objects.get_or_create(
                        investigation_id=investigation_id,
                        normalized_name=receiver_name.strip().lower(),
                        defaults={'name': receiver_name.strip(), 'entity_type': 'PERSON', 'source': 'CSV_CDR'}
                    )
                    if c1: entities_created += 1
                    if c2: entities_created += 1

                    rel, rc = Relationship.objects.get_or_create(
                        investigation_id=investigation_id,
                        source_entity=e1,
                        target_entity=e2,
                        relationship_type='COMMUNICATED_WITH',
                        defaults={'confidence': 0.95, 'source': 'CSV_CDR', 'evidence': f"CDR Call record ({dur}s)"}
                    )
                    if rc: rels_created += 1

                    CommunicationRecord.objects.create(
                        investigation_id=investigation_id,
                        source_entity=e1,
                        target_entity=e2,
                        communication_type='CALL',
                        timestamp=ts,
                        duration=dur
                    )
                    success += 1

            elif import_type == 'CSV_FINANCIAL':
                # Columns: sender, receiver, amount, currency, timestamp
                sender_name = row.get('sender') or row.get('from')
                receiver_name = row.get('receiver') or row.get('to')
                amt = float(row.get('amount', 0))
                curr = row.get('currency', 'USD')
                ts = row.get('timestamp') or timezone.now().isoformat()

                if sender_name and receiver_name:
                    e1, c1 = Entity.objects.get_or_create(
                        investigation_id=investigation_id,
                        normalized_name=sender_name.strip().lower(),
                        defaults={'name': sender_name.strip(), 'entity_type': 'PERSON', 'source': 'CSV_FINANCIAL'}
                    )
                    e2, c2 = Entity.objects.get_or_create(
                        investigation_id=investigation_id,
                        normalized_name=receiver_name.strip().lower(),
                        defaults={'name': receiver_name.strip(), 'entity_type': 'PERSON', 'source': 'CSV_FINANCIAL'}
                    )
                    if c1: entities_created += 1
                    if c2: entities_created += 1

                    rel, rc = Relationship.objects.get_or_create(
                        investigation_id=investigation_id,
                        source_entity=e1,
                        target_entity=e2,
                        relationship_type='TRANSFERRED_TO',
                        defaults={'confidence': 0.98, 'source': 'CSV_FINANCIAL', 'evidence': f"Financial transaction: ${amt}"}
                    )
                    if rc: rels_created += 1

                    FinancialTransaction.objects.create(
                        investigation_id=investigation_id,
                        sender=e1,
                        receiver=e2,
                        amount=amt,
                        currency=curr,
                        timestamp=ts
                    )
                    success += 1

            elif import_type == 'CSV_LOCATION':
                # Columns: entity, location, timestamp, event_type
                ent_name = row.get('entity') or row.get('person')
                loc_name = row.get('location') or row.get('place')
                ts = row.get('timestamp') or timezone.now().isoformat()
                ev_type = row.get('event_type', 'CHECK_IN')

                if ent_name and loc_name:
                    e1, c1 = Entity.objects.get_or_create(
                        investigation_id=investigation_id,
                        normalized_name=ent_name.strip().lower(),
                        defaults={'name': ent_name.strip(), 'entity_type': 'PERSON', 'source': 'CSV_LOCATION'}
                    )
                    e2, c2 = Entity.objects.get_or_create(
                        investigation_id=investigation_id,
                        normalized_name=loc_name.strip().lower(),
                        defaults={'name': loc_name.strip(), 'entity_type': 'LOCATION', 'source': 'CSV_LOCATION'}
                    )
                    if c1: entities_created += 1
                    if c2: entities_created += 1

                    rel, rc = Relationship.objects.get_or_create(
                        investigation_id=investigation_id,
                        source_entity=e1,
                        target_entity=e2,
                        relationship_type='LOCATED_AT',
                        defaults={'confidence': 0.90, 'source': 'CSV_LOCATION', 'evidence': f"Location event: {ev_type}"}
                    )
                    if rc: rels_created += 1

                    LocationEvent.objects.create(
                        investigation_id=investigation_id,
                        entity=e1,
                        location=loc_name,
                        timestamp=ts,
                        event_type=ev_type
                    )
                    success += 1

        except Exception as err:
            print(f"Row import error: {err}")
            failed += 1

    # Post-import sync & pipeline execution
    sync_investigation_to_neo4j(investigation_id)
    resolve_entities_for_investigation(investigation_id)
    run_anomaly_detection(investigation_id)

    elapsed = round(time.time() - start_time, 3)

    return {
        "total_records": total,
        "successful_records": success,
        "failed_records": failed,
        "entities_created": entities_created,
        "relationships_created": rels_created,
        "processing_time_seconds": elapsed
    }
