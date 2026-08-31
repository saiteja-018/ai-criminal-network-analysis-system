# AI-Powered Criminal Network Analysis System (NEXUS INTEL)

[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/)
[![Django 5.0](https://img.shields.io/badge/django-5.0-green.svg)](https://www.djangoproject.com/)
[![React 18](https://img.shields.io/badge/react-18.2-cyan.svg)](https://react.dev/)
[![Neo4j 5.15](https://img.shields.io/badge/neo4j-5.15-blueviolet.svg)](https://neo4j.com/)
[![Docker Compose](https://img.shields.io/badge/docker-compose-blue.svg)](https://docs.docker.com/compose/)

A production-style containerized web application designed for law-enforcement officers, data analysts, and intelligence investigators to ingest, extract, resolve, visualize, and analyze complex criminal network structures.

---

## Key Capabilities

1. **Multi-Source Data Ingestion & NLP**: Automated entity extraction (PERSON, ORG, LOC, PHONE, EMAIL, ACCOUNT) from freeform intelligence text using spaCy and regex pipelines.
2. **Entity Resolution Service**: Fuzzy matching deduplication engine to identify merge candidates across multi-source feeds.
3. **Dual Database Engine**: PostgreSQL 16 relational system of record paired with Neo4j 5.15 graph database for Cypher queries.
4. **Interactive Network Canvas**: Cytoscape.js visual topology workspace supporting node selection, edge evidence inspection, neighborhood expansion, and filter controls.
5. **Graph Centrality & Community Analytics**: NetworkX calculation of Degree, Betweenness, and PageRank metrics, along with Louvain modularity clustering.
6. **Rule-Based Anomaly Detection**: Automatic detection of circular money flows, high-frequency communications, dispatcher nodes, rapid location movement, and shared phone collisions.
7. **Enterprise Security & Audit**: Role-Based Access Control (RBAC with ADMIN, INVESTIGATOR, ANALYST, VIEWER) and immutable audit logging.

---

## Architecture Overview

```
+-----------------------------------------------------------------------+
|                             REACT FRONTEND                            |
|             Cytoscape.js | Recharts | Tailwind CSS | Vite             |
+-----------------------------------+-----------------------------------+
                                    | REST API / JWT
+-----------------------------------v-----------------------------------+
|                            DJANGO BACKEND                             |
|          REST Framework | spaCy NLP | NetworkX | Anomaly Engine       |
+-----------+-----------------------+-----------------------+-----------+
            |                       |                       |
+-----------v-----------+  +--------v----------+  +---------v-----------+
|     POSTGRESQL 16     |  |    NEO4J 5.15     |  |       REDIS 7       |
| Relational Data & Logs|  |  Graph Database   |  | Queue & Celery Tasks|
+-----------------------+  +-------------------+  +---------------------+
```

---

## Quickstart Guide

### 1. Prerequisites
* Docker & Docker Compose
* Python 3.12+ (for local CLI development)
* Node.js 20+ (for local frontend development)

### 2. Environment Setup
Copy the environment variables template:
```bash
cp .env.example .env
```

### 3. Launch Docker Containers
Run all services (PostgreSQL, Neo4j, Redis, Django Backend, Celery Worker, React Frontend):
```bash
docker compose up --build -d
```

### 4. Run Migrations & Seed Realistic Demo Data
```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed_demo_data
```

---

## Access Credentials & Endpoints

* **Frontend Dashboard**: `http://localhost:5173`
* **Backend API Docs (Swagger)**: `http://localhost:8000/api/docs/`
* **Health Check**: `http://localhost:8000/health/`
* **Neo4j Browser**: `http://localhost:7474` (User: `neo4j` / Password: `password123`)

### Demo Accounts

| Role | Username | Password |
| :--- | :--- | :--- |
| **Investigator** | `investigator` | `Investigator@123` |
| **Admin** | `admin` | `Admin@123` |
| **Analyst** | `analyst` | `Analyst@123` |
| **Viewer** | `viewer` | `Viewer@123` |

---

## Running Test Suite

Execute the complete Django test suite:
```bash
docker compose exec backend python manage.py test
```

---

## Documentation

* [System Architecture & Design (SYSTEM_DESIGN.md)](docs/SYSTEM_DESIGN.md)
* [REST API Reference (API.md)](docs/API.md)
* [Investigator User Guide (USER_GUIDE.md)](docs/USER_GUIDE.md)
