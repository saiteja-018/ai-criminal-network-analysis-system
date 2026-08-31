import networkx as nx
from typing import Dict, List, Any
from apps.entities.models import Entity
from apps.relationships.models import Relationship
from .neo4j_client import neo4j_client

def build_networkx_graph(investigation_id: int) -> nx.Graph:
    """Build a NetworkX Graph representation of an investigation."""
    G = nx.Graph()

    entities = Entity.objects.filter(investigation_id=investigation_id)
    for e in entities:
        G.add_node(e.id, name=e.name, entity_type=e.entity_type, confidence=e.confidence)

    relationships = Relationship.objects.filter(investigation_id=investigation_id)
    for r in relationships:
        G.add_edge(
            r.source_entity_id,
            r.target_entity_id,
            id=r.id,
            relationship_type=r.relationship_type,
            confidence=r.confidence
        )

    return G

def calculate_centrality_metrics(investigation_id: int) -> Dict[int, Dict[str, Any]]:
    """
    Calculate Degree Centrality, Betweenness Centrality, PageRank, and Community assignment.
    Returns dict mapping entity_id to analytical metrics.
    """
    G = build_networkx_graph(investigation_id)

    if len(G) == 0:
        return {}

    # Centrality algorithms
    degree_cent = nx.degree_centrality(G)
    betweenness_cent = nx.betweenness_centrality(G)

    try:
        pagerank_scores = nx.pagerank(G, max_iter=200)
    except Exception:
        pagerank_scores = {node: 0.0 for node in G.nodes()}

    # Community detection
    communities_list = []
    try:
        from networkx.algorithms.community import greedy_modularity_communities
        c_gen = greedy_modularity_communities(G)
        communities_list = [list(c) for c in c_gen]
    except Exception:
        communities_list = [list(G.nodes())]

    # Map node to community ID
    node_community = {}
    for comm_idx, comm_nodes in enumerate(communities_list):
        for node in comm_nodes:
            node_community[node] = comm_idx + 1

    results = {}
    for node_id in G.nodes():
        results[node_id] = {
            "entity_id": node_id,
            "degree_centrality": round(degree_cent.get(node_id, 0.0), 4),
            "betweenness_centrality": round(betweenness_cent.get(node_id, 0.0), 4),
            "pagerank": round(pagerank_scores.get(node_id, 0.0), 4),
            "community": node_community.get(node_id, 1),
            "indication": "High network connectivity" if degree_cent.get(node_id, 0.0) > 0.3 else "Standard connectivity"
        }

    return results

def get_entity_network(entity_id: int, depth: int = 1, max_nodes: int = 500) -> Dict[str, Any]:
    """
    Get neighborhood network graph for an entity up to specified depth.
    Bounded by depth <= 3 and max_nodes <= 500.
    """
    depth = max(1, min(depth, 3))
    max_nodes = max(10, min(max_nodes, 500))

    try:
        entity = Entity.objects.get(id=entity_id)
    except Entity.DoesNotExist:
        return {"nodes": [], "edges": []}

    investigation_id = entity.investigation_id
    G = build_networkx_graph(investigation_id)

    if entity_id not in G:
        return {
            "nodes": [{
                "id": str(entity.id),
                "label": entity.name,
                "type": entity.entity_type,
                "confidence": entity.confidence
            }],
            "edges": []
        }

    # Extract ego graph
    ego = nx.ego_graph(G, entity_id, radius=depth)

    # Respect max_nodes limit
    nodes_subset = list(ego.nodes())[:max_nodes]
    subgraph = ego.subgraph(nodes_subset)

    # Calculate metrics for subgraph nodes
    degree_map = nx.degree_centrality(subgraph)

    nodes = []
    for node_id in subgraph.nodes():
        node_data = G.nodes[node_id]
        nodes.append({
            "id": str(node_id),
            "label": node_data.get("name", f"Entity-{node_id}"),
            "type": node_data.get("entity_type", "PERSON"),
            "confidence": node_data.get("confidence", 1.0),
            "degree_centrality": round(degree_map.get(node_id, 0.0), 4),
            "is_center": (node_id == entity_id)
        })

    edges = []
    for u, v, d in subgraph.edges(data=True):
        edges.append({
            "id": f"e_{d.get('id', f'{u}_{v}')}",
            "source": str(u),
            "target": str(v),
            "label": d.get("relationship_type", "ASSOCIATED_WITH"),
            "relationship_type": d.get("relationship_type", "ASSOCIATED_WITH"),
            "confidence": d.get("confidence", 1.0)
        })

    return {
        "nodes": nodes,
        "edges": edges,
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "depth": depth
    }
