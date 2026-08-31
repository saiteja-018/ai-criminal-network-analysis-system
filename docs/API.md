# AI-Powered Criminal Network Analysis System — REST API Reference

All requests require JWT authentication header: `Authorization: Bearer <token>`

---

## Authentication Endpoints

### 1. Login & Obtain JWT Token
* **POST** `/api/auth/login/`
* **Request Body**:
```json
{
  "username": "investigator",
  "password": "Investigator@123"
}
```
* **Response (200 OK)**:
```json
{
  "access": "eyJhbGciOiJIUzI1Ni...",
  "refresh": "eyJhbGciOiJIUzI1Ni...",
  "user": {
    "id": 2,
    "username": "investigator",
    "email": "investigator@intelligence.gov",
    "role": "INVESTIGATOR"
  }
}
```

---

## Investigation Case Endpoints

### 2. List Investigations
* **GET** `/api/investigations/`
* **Response (200 OK)**:
```json
[
  {
    "id": 1,
    "case_number": "CASE-2026-NEXUS-01",
    "title": "Operation Nexus - Transnational Smuggling Ring",
    "description": "Investigation into suspected contraband smuggling network...",
    "status": "IN_PROGRESS",
    "priority": "CRITICAL",
    "created_at": "2026-08-20T10:00:00Z"
  }
]
```

### 3. Create Investigation
* **POST** `/api/investigations/`
* **Request Body**:
```json
{
  "case_number": "CASE-2026-VG-09",
  "title": "Operation Vanguard",
  "description": "Financial intelligence case regarding shell corporations.",
  "priority": "HIGH",
  "status": "OPEN"
}
```

---

## Entity & Network Endpoints

### 4. Search & Filter Entities
* **GET** `/api/entities/?investigation=1&entity_type=PERSON`
* **Response (200 OK)**:
```json
[
  {
    "id": 1,
    "investigation": 1,
    "entity_type": "PERSON",
    "name": "Ravi Kumar",
    "normalized_name": "ravi kumar",
    "confidence": 0.95,
    "source": "DEMO_SEED",
    "created_at": "2026-08-20T10:00:00Z"
  }
]
```

### 5. Fetch Entity Sub-Graph Network
* **GET** `/api/entities/1/network/?depth=2`
* **Response (200 OK)**:
```json
{
  "center_entity_id": 1,
  "depth": 2,
  "total_nodes": 12,
  "total_edges": 15,
  "nodes": [
    {
      "id": "1",
      "label": "Ravi Kumar",
      "type": "PERSON",
      "confidence": 0.95,
      "degree_centrality": 0.35,
      "is_center": true
    }
  ],
  "edges": [
    {
      "id": "rel_1_2",
      "source": "1",
      "target": "2",
      "label": "COMMUNICATED_WITH",
      "confidence": 0.92
    }
  ]
}
```

### 6. Entity Timeline Reconstruction
* **GET** `/api/entities/1/timeline/`
* **Response (200 OK)**:
```json
{
  "entity_id": 1,
  "entity_name": "Ravi Kumar",
  "total_events": 5,
  "events": [
    {
      "id": "comm_10",
      "event_type": "COMMUNICATION",
      "title": "CALL: Ravi Kumar -> Anand Sharma",
      "timestamp": "2026-08-20T11:30:00Z",
      "details": { "duration": 180, "type": "CALL" }
    }
  ]
}
```

---

## Data Ingestion & NLP Endpoints

### 7. Import Data (Unstructured Text / CSV)
* **POST** `/api/data/import/`
* **Form-Data**:
  * `investigation_id`: `1`
  * `import_type`: `TEXT_DOCUMENT` | `CSV_CDR` | `CSV_FINANCIAL` | `CSV_LOCATION`
  * `title`: `Surveillance Report 1`
  * `content`: `Ravi Kumar called Anand Sharma at +1-555-0192.`
* **Response (200 OK)**:
```json
{
  "document_id": 4,
  "total_records": 1,
  "successful_records": 1,
  "failed_records": 0,
  "entities_created": 2,
  "relationships_created": 1,
  "processing_time_seconds": 0.412
}
```

---

## Analytics & Anomaly Endpoints

### 8. Run Analytical Pipeline
* **POST** `/api/analysis/run/`
* **Request Body**:
```json
{
  "investigation_id": 1
}
```

### 9. Get Anomaly Alerts
* **GET** `/api/analysis/1/anomalies/`
* **Response (200 OK)**:
```json
{
  "investigation_id": 1,
  "total_anomalies": 2,
  "anomalies": [
    {
      "id": 1,
      "alert_type": "CIRCULAR_MONEY_FLOW",
      "severity": "CRITICAL",
      "description": "Circular transaction loop detected: Anand Sharma -> David Miller -> Elena Rostova -> Anand Sharma",
      "score": 0.95,
      "status": "NEW"
    }
  ]
}
```

### 10. System Health Check
* **GET** `/health/`
* **Response (200 OK)**:
```json
{
  "status": "healthy",
  "database": "connected",
  "neo4j": "connected",
  "redis": "connected"
}
```
