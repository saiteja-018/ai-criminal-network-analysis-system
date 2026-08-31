from datetime import timedelta
from django.db.models import Count, Q, Sum
from apps.alerts.models import Alert
from apps.relationships.models import Relationship, CommunicationRecord, FinancialTransaction, LocationEvent
from apps.entities.models import Entity
from services.graph.graph_analytics import calculate_centrality_metrics, build_networkx_graph
import networkx as nx

def run_anomaly_detection(investigation_id: int) -> list[dict]:
    """
    Run rule-based anomaly detection on an investigation dataset.
    Generates Alert records for detected suspicious patterns.
    """
    alerts_created = []

    # 1. Pattern 1: High-Frequency Communication
    comm_counts = (
        CommunicationRecord.objects.filter(investigation_id=investigation_id)
        .values('source_entity', 'target_entity')
        .annotate(total_comms=Count('id'))
        .filter(total_comms__gte=5)
    )
    for c in comm_counts:
        src = Entity.objects.get(id=c['source_entity'])
        tgt = Entity.objects.get(id=c['target_entity'])
        count = c['total_comms']
        
        alert, created = Alert.objects.get_or_create(
            investigation_id=investigation_id,
            alert_type="HIGH_COMMUNICATION_FREQUENCY",
            description=f"High communication volume: {src.name} communicated with {tgt.name} {count} times.",
            defaults={
                "severity": Alert.Severity.HIGH if count > 10 else Alert.Severity.MEDIUM,
                "score": min(0.95, 0.5 + (count * 0.04)),
                "related_entities": [src.id, tgt.id],
                "evidence": {
                    "source_entity": src.name,
                    "target_entity": tgt.name,
                    "communication_count": count,
                    "threshold": 5,
                    "explanation": f"Entity {src.name} engaged in {count} direct communications with {tgt.name}, exceeding normal baseline limits."
                }
            }
        )
        if created:
            alerts_created.append(alert)

    # 2. Pattern 2: Circular Money Flow (A -> B -> C -> A)
    txs = FinancialTransaction.objects.filter(investigation_id=investigation_id)
    tx_graph = nx.DiGraph()
    for tx in txs:
        tx_graph.add_edge(tx.sender_id, tx.receiver_id, amount=float(tx.amount))

    try:
        cycles = list(nx.simple_cycles(tx_graph))
        for cycle in cycles:
            if 3 <= len(cycle) <= 5:
                cycle_entities = list(Entity.objects.filter(id__in=cycle))
                names = [e.name for e in cycle_entities]
                names_str = " -> ".join(names) + f" -> {names[0]}"
                
                alert, created = Alert.objects.get_or_create(
                    investigation_id=investigation_id,
                    alert_type="CIRCULAR_MONEY_FLOW",
                    description=f"Potential circular financial loop detected: {names_str}",
                    defaults={
                        "severity": Alert.Severity.CRITICAL,
                        "score": 0.92,
                        "related_entities": cycle,
                        "evidence": {
                            "cycle_entity_ids": cycle,
                            "cycle_names": names,
                            "explanation": f"Financial transactions formed a closed circular loop ({names_str}). Requires investigative review for potential layering patterns."
                        }
                    }
                )
                if created:
                    alerts_created.append(alert)
    except Exception as e:
        print(f"Error checking circular money flow: {e}")

    # 3. Pattern 3: Rapid Multi-Location Movement
    location_events = LocationEvent.objects.filter(investigation_id=investigation_id).order_by('entity', 'timestamp')
    entity_events = {}
    for ev in location_events:
        entity_events.setdefault(ev.entity_id, []).append(ev)

    for ent_id, events in entity_events.items():
        if len(events) >= 2:
            for i in range(len(events) - 1):
                e1, e2 = events[i], events[i + 1]
                if e1.location != e2.location:
                    time_diff = abs((e2.timestamp - e1.timestamp).total_seconds()) / 3600.0 # in hours
                    if time_diff <= 2.0: # Different location within 2 hours
                        ent = Entity.objects.get(id=ent_id)
                        alert, created = Alert.objects.get_or_create(
                            investigation_id=investigation_id,
                            alert_type="RAPID_MULTI_LOCATION_MOVEMENT",
                            description=f"Rapid location change for {ent.name}: {e1.location} to {e2.location} within {time_diff:.1f} hours.",
                            defaults={
                                "severity": Alert.Severity.HIGH,
                                "score": 0.85,
                                "related_entities": [ent_id],
                                "evidence": {
                                    "entity_name": ent.name,
                                    "origin_location": e1.location,
                                    "destination_location": e2.location,
                                    "hours_elapsed": round(time_diff, 2),
                                    "explanation": f"Entity {ent.name} recorded events at distinct locations ({e1.location} and {e2.location}) within a tight {time_diff:.1f}-hour window."
                                }
                            }
                        )
                        if created:
                            alerts_created.append(alert)

    # 4. Pattern 4: Shared Identifiers (Multiple people sharing phone, vehicle, account)
    shared_rels = (
        Relationship.objects.filter(
            investigation_id=investigation_id,
            relationship_type__in=['OWNS', 'USES', 'COMMUNICATED_WITH']
        )
        .values('target_entity')
        .annotate(linked_people=Count('source_entity', distinct=True))
        .filter(linked_people__gte=2)
    )
    for sr in shared_rels:
        shared_entity = Entity.objects.get(id=sr['target_entity'])
        if shared_entity.entity_type in ['PHONE', 'VEHICLE', 'ACCOUNT', 'LOCATION', 'EMAIL']:
            people_ids = list(
                Relationship.objects.filter(investigation_id=investigation_id, target_entity=shared_entity)
                .values_list('source_entity_id', flat=True)
            )
            people_names = [e.name for e in Entity.objects.filter(id__in=people_ids)]
            
            alert, created = Alert.objects.get_or_create(
                investigation_id=investigation_id,
                alert_type="SHARED_IDENTIFIER",
                description=f"Shared {shared_entity.entity_type}: {shared_entity.name} is linked to multiple entities ({', '.join(people_names)})",
                defaults={
                    "severity": Alert.Severity.HIGH,
                    "score": 0.88,
                    "related_entities": people_ids + [shared_entity.id],
                    "evidence": {
                        "shared_identifier": shared_entity.name,
                        "identifier_type": shared_entity.entity_type,
                        "linked_entity_names": people_names,
                        "explanation": f"Identifier '{shared_entity.name}' ({shared_entity.entity_type}) is shared across multiple distinct entities."
                    }
                }
            )
            if created:
                alerts_created.append(alert)

    # 5. Pattern 5: Sudden Transaction Spikes
    high_txs = FinancialTransaction.objects.filter(investigation_id=investigation_id, amount__gte=25000)
    for tx in high_txs:
        alert, created = Alert.objects.get_or_create(
            investigation_id=investigation_id,
            alert_type="TRANSACTION_SPIKE",
            description=f"High-value financial transaction: ${float(tx.amount):,.2f} from {tx.sender.name} to {tx.receiver.name}",
            defaults={
                "severity": Alert.Severity.HIGH,
                "score": 0.86,
                "related_entities": [tx.sender_id, tx.receiver_id],
                "evidence": {
                    "sender": tx.sender.name,
                    "receiver": tx.receiver.name,
                    "amount": float(tx.amount),
                    "currency": tx.currency,
                    "timestamp": str(tx.timestamp),
                    "explanation": f"Financial transaction of ${float(tx.amount):,.2f} exceeds standard baseline threshold ($25,000)."
                }
            }
        )
        if created:
            alerts_created.append(alert)

    # 6. Pattern 6: Bridge Entity (High Betweenness Centrality)
    metrics = calculate_centrality_metrics(investigation_id)
    for ent_id, m in metrics.items():
        if m.get('betweenness_centrality', 0.0) >= 0.25:
            ent = Entity.objects.get(id=ent_id)
            alert, created = Alert.objects.get_or_create(
                investigation_id=investigation_id,
                alert_type="BRIDGE_ENTITY",
                description=f"Potential bridge entity detected: {ent.name} (Betweenness Centrality: {m['betweenness_centrality']})",
                defaults={
                    "severity": Alert.Severity.MEDIUM,
                    "score": 0.82,
                    "related_entities": [ent_id],
                    "evidence": {
                        "entity_name": ent.name,
                        "betweenness_centrality": m['betweenness_centrality'],
                        "pagerank": m['pagerank'],
                        "explanation": f"Entity {ent.name} exhibits high network betweenness centrality, functioning as a structural bridge between distinct network sub-clusters."
                    }
                }
            )
            if created:
                alerts_created.append(alert)

    # 7. Pattern 7: Dense Suspicious Cluster
    G = build_networkx_graph(investigation_id)
    if len(G) >= 4:
        density = nx.density(G)
        if density >= 0.35:
            all_ids = list(G.nodes())
            alert, created = Alert.objects.get_or_create(
                investigation_id=investigation_id,
                alert_type="DENSE_SUSPICIOUS_CLUSTER",
                description=f"Dense network cluster detected (Graph Density: {density:.2f})",
                defaults={
                    "severity": Alert.Severity.HIGH,
                    "score": 0.80,
                    "related_entities": all_ids[:10],
                    "evidence": {
                        "graph_density": round(density, 3),
                        "node_count": len(G),
                        "edge_count": G.number_of_edges(),
                        "explanation": f"Network graph demonstrates an unusually high interconnection density ({density:.2f}), indicating a cohesive cluster requiring investigator review."
                    }
                }
            )
            if created:
                alerts_created.append(alert)

    return alerts_created
