export type UserRole = 'ADMIN' | 'INVESTIGATOR' | 'ANALYST' | 'VIEWER';

export interface User {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    is_active?: boolean;
}

export type EntityType =
    | 'PERSON'
    | 'ORGANIZATION'
    | 'LOCATION'
    | 'VEHICLE'
    | 'PHONE'
    | 'EMAIL'
    | 'ACCOUNT'
    | 'CASE'
    | 'EVENT'
    | 'SOCIAL_PROFILE'
    | 'DOCUMENT';

export interface Entity {
    id: number;
    investigation?: number;
    entity_type: EntityType;
    name: string;
    normalized_name: string;
    confidence: number;
    source: string;
    external_reference?: string;
    metadata?: Record<string, any>;
    created_at: string;
}

export interface Relationship {
    id: number;
    investigation?: number;
    source_entity: number;
    target_entity: number;
    source_entity_detail?: Entity;
    target_entity_detail?: Entity;
    relationship_type: string;
    confidence: number;
    source: string;
    evidence: string;
    first_seen?: string;
    last_seen?: string;
    created_at: string;
}

export interface Investigation {
    id: number;
    title: string;
    description: string;
    case_number: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'ARCHIVED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    created_by?: number;
    created_by_detail?: User;
    entity_count?: number;
    relationship_count?: number;
    alert_count?: number;
    document_count?: number;
    created_at: string;
    updated_at: string;
}

export interface Alert {
    id: number;
    investigation: number;
    alert_type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    score: number;
    status: 'NEW' | 'UNDER_REVIEW' | 'DISMISSED' | 'RESOLVED';
    related_entities: number[];
    evidence: Record<string, any>;
    created_at: string;
}

export interface AuditLog {
    id: number;
    user?: number;
    user_display: string;
    action: string;
    resource_type: string;
    resource_id: string;
    ip_address?: string;
    metadata: Record<string, any>;
    timestamp: string;
}

export interface GraphNode {
    id: string;
    label: string;
    type: EntityType;
    confidence: number;
    degree_centrality?: number;
    is_center?: boolean;
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    label: string;
    relationship_type: string;
    confidence: number;
}

export interface GraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
    total_nodes?: number;
    total_edges?: number;
    depth?: number;
}
