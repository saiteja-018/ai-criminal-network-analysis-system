# 📋 Project Analysis — AI-Powered Criminal Network Analysis System (NEXUS INTEL)

> **Who is this for?** Anyone on the team — beginner or experienced — who wants to understand what we built, why we built it, and how it works. No prior experience required to read this document.

---

## 1. 🔴 Problem — What Is the Problem and Why Does It Exist?

### The Real-World Problem
Law enforcement agencies (police, intelligence units, anti-corruption bureaus) deal with **large, messy, scattered data** every day:
- FIR (First Information Reports) written in plain text
- Phone call records (CDRs) in spreadsheets
- Bank transaction logs from multiple sources
- Surveillance reports typed by field officers

**The core problem:**
> "We know these criminals are connected, but we cannot *see* the connections."

### Why Does This Problem Exist?
1. **Data is scattered** — information lives in Excel sheets, PDFs, handwritten notes, and different databases that don't talk to each other.
2. **Too much data for humans** — a single investigation can involve hundreds of people, thousands of calls, and millions of transactions. No human can spot patterns manually.
3. **Connections are hidden** — a criminal may use 3 different phone numbers, a fake company, and an associate's bank account. Traditional tools miss these indirect links.
4. **No visual map** — investigators cannot "see" who is connected to whom and how strongly.

---

## 2. 🟢 Solution — What Exactly Are We Building?

We are building **NEXUS INTEL** — a web-based intelligence platform that:

1. **Reads messy data** (plain text reports, CSVs, phone logs, bank records)
2. **Automatically finds people, places, phone numbers, organizations** hidden in that data using AI (NLP)
3. **Draws a visual network map** — like a web — showing who is connected to whom
4. **Detects suspicious patterns** automatically (e.g., money going in circles = money laundering)
5. **Lets investigators click and explore** the network interactively
6. **Keeps a secure audit trail** of everything that was accessed or changed

Think of it as **Google Maps for criminal networks** — instead of roads and cities, you see people and their connections.

> **Important:** This is a *tool to assist* investigators, not replace them. Final decisions are always made by humans.

---

## 3. 🔄 Workflow — Complete Flow Step-by-Step

```
Step 1: Login
  └── Officer opens the dashboard at http://localhost:5173
  └── Logs in with their role (Investigator / Analyst / Admin / Viewer)

Step 2: Create a Case
  └── Creates a new "Investigation" (e.g., "Operation Hawala 2024")
  └── All data uploaded will be linked to this case

Step 3: Upload Data (Data Ingestion)
  └── Option A: Paste a surveillance report (free text)
      └── AI (spaCy NLP) reads it and finds: names, phones, locations, orgs
  └── Option B: Upload CSV files
      └── Phone call records (CDR)
      └── Bank transfer logs
      └── Location check-in records

Step 4: AI Processes the Data
  └── NLP extracts "entities" (Person: Ravi Kumar, Phone: 9876543210, etc.)
  └── Relationships are identified ("Ravi called Suresh", "Account A sent money to Account B")
  └── Everything is saved to the database

Step 5: Network Visualization
  └── Investigator opens the "Network Explorer"
  └── Sees a visual graph — nodes (dots) = people/phones/places, edges (lines) = connections
  └── Can click any node to see its details
  └── Can expand to see "friends of friends" (2-hop, 3-hop radius)

Step 6: Automatic Alerts
  └── The system automatically runs anomaly detection rules
  └── Generates alerts like:
      - "Circular money flow detected between 3 accounts"
      - "Node X called 20 different people in 1 day (Dispatcher Hub)"

Step 7: Entity Resolution
  └── System finds possible duplicate entries
      - "Ravi Kumar" and "R. Kumar" might be the same person
  └── Investigator reviews and clicks MERGE or REJECT

Step 8: Analytics & Reports
  └── System calculates importance scores for each person in the network
  └── Shows who is the "most connected" or "most central" suspect
  └── Louvain algorithm groups suspects into crime clusters/gangs

Step 9: Audit Log
  └── Every action (who viewed what, who merged what, who ran a query) is logged
  └── Ensures accountability and legal compliance
```

---

## 4. 🛠️ Tech Stack — Technologies Used, What They Do, and Why

| Technology | What It Does | Why We Use It |
|---|---|---|
| **Python 3.12** | The main programming language for the backend | Easy to read, huge library ecosystem, great for AI/data work |
| **Django 5.0** | A web framework that handles routing, database models, security | Saves time — provides login, admin panel, and database tools out of the box |
| **Django REST Framework (DRF)** | Turns our Django app into a REST API (sends/receives JSON data) | Frontend and backend communicate through this |
| **PostgreSQL 16** | A traditional relational database (like a super-powered Excel) | Stores all our structured data: users, cases, entities, logs |
| **Neo4j 5.15** | A graph database — stores data as nodes and connections | Specially designed for network queries. "Who is 3 hops away from Ravi?" is instant |
| **NetworkX** | A Python library for graph math (Degree, Betweenness, PageRank, community detection) | Calculates how important each node is in the criminal network |
| **spaCy** | An AI/NLP library that reads text and finds names, places, organizations | Automates manual reading of police reports and tagging entities |
| **Redis 7** | A fast in-memory database used as a message queue | When a big file is uploaded, the job goes into a queue and a worker processes it in the background |
| **Celery** | A task runner that picks up jobs from the Redis queue and executes them | Runs heavy tasks (NLP processing, graph sync) without freezing the website |
| **React 18 + Vite** | JavaScript framework for building the visual dashboard (frontend) | Fast, modern, component-based UI |
| **TypeScript** | A stricter version of JavaScript that catches bugs before they happen | Reduces runtime errors in the frontend |
| **Cytoscape.js** | A JavaScript library that draws and animates the interactive network graph | Built specifically for network/graph visualization |
| **Tailwind CSS** | A CSS framework for styling (dark mode, colors, layout) | Build beautiful UIs quickly without writing custom CSS |
| **Docker + Docker Compose** | Packages every service into containers | "Works on my machine" problem solved — same setup runs anywhere |
| **JWT (JSON Web Tokens)** | Used for login authentication | Secure, stateless way to verify that a user is who they say they are |

---

## 5. 📦 Modules / Features — What Each Component Does

### Backend Apps (backend/apps/)

| Module | What It Does |
|---|---|
| **accounts** | Handles user registration, login, JWT token generation, and role management |
| **investigations** | Creates and manages Case Files — a container for all related data |
| **entities** | Stores extracted criminal entities — Person, Organization, Location, Vehicle, Phone, Financial Account |
| **relationships** | Stores connections between entities — "Person A called Person B", "Account X → Account Y" |
| **documents** | Handles raw uploaded data — police reports (text), CDR files, bank logs (CSV) |
| **alerts** | Stores anomaly alerts. Investigators can mark them Under Review / Resolved / Dismissed |
| **audit** | Records every sensitive action. Immutable log for legal compliance |
| **analytics** | Provides graph centrality scores, community clusters, and investigation statistics |

### Backend Services (backend/services/)

| Service | What It Does |
|---|---|
| **nlp/entity_extractor.py** | Uses spaCy to read text and identify PERSON, ORG, LOC entities |
| **nlp/relationship_extractor.py** | Identifies relationships between extracted entities |
| **entity_resolution/resolver.py** | Uses fuzzy string matching to find duplicate entity candidates |
| **graph/neo4j_client.py** | Handles all communication with the Neo4j graph database |
| **graph/graph_sync.py** | Syncs entities/relationships from PostgreSQL to Neo4j after every update |
| **graph/graph_analytics.py** | Runs NetworkX algorithms (PageRank, Betweenness, Louvain clustering) |
| **anomaly_detection/engine.py** | Runs 5 rule-based checks to detect suspicious patterns and generate alerts |
| **ingestion/importer.py** | Coordinates the full pipeline: parse → extract → save → sync → detect |

### Frontend Pages (frontend/src/pages/)

| Page | What It Shows |
|---|---|
| **Login.tsx** | Login form with JWT authentication |
| **Dashboard.tsx** | Summary stats: total entities, active investigations, open alerts |
| **NetworkExplorer.tsx** | The main interactive Cytoscape.js graph canvas |
| **Investigations.tsx** | List of all case files |
| **EntityProfile.tsx** | Detailed profile of a single entity (person/org/phone) |
| **AlertsPage.tsx** | List of all anomaly alerts with status management |
| **IngestionPage.tsx** | Upload interface for text reports and CSVs |
| **EntityResolutionPage.tsx** | Review and merge/reject duplicate entity candidates |
| **AuditLogPage.tsx** | View the complete audit trail |
| **SystemAnalyticsPage.tsx** | Charts and centrality scores for the network |
| **TimelinePage.tsx** | Timeline view of events in chronological order |

---

## 6. 🤖 AI / ML — What AI Is Used For and Why

### a) NLP — Natural Language Processing (spaCy)
- **What it does:** Reads plain text and automatically highlights names, places, organizations.
- **Without AI:** An analyst manually reads every report and types out each name, phone, and location.
- **With AI:** Upload the text → system extracts all entities in seconds.
- **Example:** From *"Ravi Kumar met Suresh Yadav at Hotel Blue Lotus and transferred Rs 5 lakh to account 9876543210"*, spaCy extracts:
  - PERSON: Ravi Kumar, Suresh Yadav
  - LOCATION: Hotel Blue Lotus
  - ACCOUNT: 9876543210

### b) Fuzzy Matching — Entity Resolution (RapidFuzz)
- **What it does:** Compares two entity names and gives a similarity score (0-100%).
- **Why:** The same criminal may appear as "Ravi Kumar", "R. Kumar", "Ravi K." in different reports.
- **How:** If score > 85%, flagged as a potential duplicate for investigator review.

### c) Graph Analytics (NetworkX)
- **Degree Centrality:** How many direct connections? (More = more influential)
- **Betweenness Centrality:** Does a node act as a "bridge"? (High = key connector / gatekeeper)
- **PageRank:** How important is this node? (Same algorithm Google uses for websites)
- **Louvain Clustering:** Groups the network into natural "communities" (gangs/cells) automatically

### d) Rule-Based Anomaly Detection
This is **not machine learning** — it uses hard-coded business rules:
1. Money going A→B→C→A in short time = Money Laundering (Circular Flow)
2. Person calls 15+ different people in 24 hours = Dispatcher Hub
3. High call frequency between two people = Suspicious communication
4. Person detected 50km apart within 2 hours = Rapid movement anomaly
5. Two different people share same phone number = Identity collision / alias

---

## 7. 🗄️ Database — What Data We Store and Why

### PostgreSQL (Primary Database — Source of Truth)

| Table | What's Stored | Why |
|---|---|---|
| accounts_user | User accounts, roles, passwords | Authentication and access control |
| investigations | Case file metadata (name, status, dates) | Organize all data by case |
| entities | Every criminal entity (name, type, confidence score) | Core data of the system |
| relationships | Connections between entities (type, evidence, timestamp) | The "edges" of our network |
| documents | Raw uploaded files and their extracted text | Original source evidence |
| alerts | Anomaly alerts (type, severity, status) | Investigation leads and warnings |
| audit_logs | Who did what and when (action, user, IP, timestamp) | Legal compliance |

### Neo4j (Graph Database — For Exploration)
Stores the same entities and relationships as PostgreSQL, but in graph format:
- **Nodes:** (:Entity {id, name, type, confidence})
- **Edges:** (:Entity)-[:CALLED|TRANSFERRED_TO|MET_AT]->(:Entity)

**Why two databases?**
- PostgreSQL: great for storing and searching structured records (like a spreadsheet)
- Neo4j: great for graph questions like "Find all people connected to Ravi within 3 hops" — milliseconds in Neo4j, very slow in PostgreSQL

---

## 8. 🌍 Real-World Example — Hawala Network Investigation

> **Scenario:** Police receive a tip about a hawala network operating in Mumbai.

**Step 1 — Create a case:**
Investigator creates: *"Operation Hawala Mumbai 2024"*

**Step 2 — Upload data:**
Uploads a field report: *"Informant confirmed Ravi Kumar runs a hawala operation from Shop 12, Dharavi. Associates include Suresh Patel and Meena Gupta. Money funnelled through accounts 7654321 and 8765432."*
Also uploads 3 months of CDR (call records) and bank transaction logs.

**Step 3 — AI extracts entities automatically:**
- PERSON: Ravi Kumar, Suresh Patel, Meena Gupta
- LOCATION: Shop No. 12, Dharavi
- ACCOUNT: 7654321, 8765432

**Step 4 — Network graph appears:**
```
  [Ravi Kumar] ──CALLED──> [Suresh Patel]
  [Ravi Kumar] ──CONTROLS──> [Account 7654321]
  [Account 7654321] ──TRANSFER──> [Account 8765432]
  [Account 8765432] ──TRANSFER──> [Account 7654321]  <-- CIRCULAR!
```

**Step 5 — Alert fires automatically:**
*"WARNING: Circular money flow detected: 7654321 → 8765432 → 7654321 within 48 hours. Possible money laundering."*

**Step 6 — Expand the network:**
Investigator clicks Suresh Patel's node → expands 2-hops → discovers 12 more previously unknown people connected through Suresh.

**Step 7 — Entity resolution:**
System flags "Ravi Kumar" (from report) and "R. Kumar" (from bank records) as 91% match. Investigator clicks MERGE → all connections unified.

**Result:** A complete visual map of the hawala network in 20 minutes — would have taken weeks manually.

---

## 9. 🏗️ MVP — What to Build First

The MVP (Minimum Viable Product) is the smallest version that still delivers real value:

| Priority | Feature | Why First? |
|---|---|---|
| 1 | User login with roles (Admin, Investigator) | Nothing works without authentication |
| 2 | Create and manage case files (investigations) | Need a container for all data |
| 3 | Manual entity creation (add person/phone/org by hand) | Core data entry |
| 4 | Manual relationship creation (link two entities) | Core connection building |
| 5 | Basic Cytoscape.js network graph display | The main value of the system |
| 6 | Text document ingestion + spaCy NLP extraction | Automates the boring manual work |
| 7 | Basic anomaly alerts (circular flow detection) | Demonstrates AI value |
| 8 | Docker Compose setup | Easy deployment for demo |

**Skip for MVP (add later):** Louvain clustering, Timeline view, CSV batch import, Entity resolution, Full audit logging, Advanced analytics

---

## 10. 🚀 Future Features — What Can Be Added Later

| Feature | Description |
|---|---|
| **PDF/Image Ingestion** | OCR (Tesseract) to read scanned FIRs and handwritten notes |
| **Map Integration** | Show location entities on an interactive geographic map (Leaflet.js) |
| **LLM Summaries** | Use an LLM (Gemini/GPT-4) to auto-generate written investigation summaries |
| **Multi-Language NLP** | Support Hindi, Tamil, and other Indian languages using IndicNLP |
| **Real-Time Alerts** | WebSocket push notifications when a new anomaly is detected |
| **Predictive Risk Scoring** | ML model to predict which suspects are highest risk |
| **Inter-Agency Sharing** | Secure API for sharing case data between police departments |
| **Mobile App** | React Native app for field officers to submit reports from phones |
| **PDF Report Export** | Generate court-ready PDF investigation reports with network screenshots |
| **Voice Transcription** | Transcribe recorded calls and auto-extract entities |

---

## 11. 👥 Team Responsibilities — Division of Work (5 Members)

### Member 1 — Backend Lead (Django + APIs)
- Set up Django project structure, models, migrations
- Build REST API endpoints for all modules
- Implement JWT authentication and RBAC permissions
- Write backend unit tests
- **Key files:** `backend/apps/`, `backend/config/settings.py`

### Member 2 — AI / Data Pipeline Engineer
- Build the NLP entity extraction pipeline (spaCy)
- Build the relationship extractor
- Build the entity resolution fuzzy matcher (RapidFuzz)
- Build the anomaly detection engine (5 rules)
- Set up Celery tasks for async processing
- **Key files:** `backend/services/nlp/`, `backend/services/anomaly_detection/`, `backend/services/entity_resolution/`

### Member 3 — Graph & Database Engineer
- Design PostgreSQL schemas and migrations
- Set up Neo4j connection and graph sync logic
- Implement NetworkX graph analytics (PageRank, Betweenness, Louvain)
- Write Cypher queries for network exploration
- **Key files:** `backend/services/graph/`, `backend/apps/entities/`, `backend/apps/relationships/`

### Member 4 — Frontend Developer
- Build all React pages and components
- Integrate Cytoscape.js for the network visualization
- Connect frontend to backend APIs
- Build responsive dark-mode UI with Tailwind CSS
- **Key files:** `frontend/src/pages/`, `frontend/src/graph/`, `frontend/src/components/`

### Member 5 — DevOps + Integration + Documentation
- Write and maintain Docker Compose configuration
- Write .env templates and deployment guides
- Write demo data seeder (seed_demo_data command)
- Maintain README, API docs, and PROJECT_ANALYSIS.md
- Run end-to-end testing and bug triage
- **Key files:** `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `docs/`

---

## 12. 🏛️ Simple Architecture Diagram

```
╔══════════════════════════════════════════════════════════════╗
║                👮 INVESTIGATOR / ANALYST                    ║
║                  (Uses a web browser)                       ║
╚══════════════════════╦══════════════════════════════════════╝
                       │  Opens http://localhost:5173
                       ▼
╔══════════════════════════════════════════════════════════════╗
║             🖥️  REACT FRONTEND  (Port 5173)                 ║
║  ┌──────────┐ ┌─────────────┐ ┌───────────┐ ┌──────────┐  ║
║  │Dashboard │ │Network Graph│ │Data Upload│ │  Alerts  │  ║
║  │ (Stats)  │ │(Cytoscape)  │ │  (NLP)    │ │(Anomaly) │  ║
║  └──────────┘ └─────────────┘ └───────────┘ └──────────┘  ║
╚══════════════════════╦══════════════════════════════════════╝
                       │  REST API (JSON) + JWT Token
                       ▼
╔══════════════════════════════════════════════════════════════╗
║           ⚙️  DJANGO BACKEND  (Port 8000)                   ║
║  ┌─────────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  ║
║  │Auth + RBAC  │ │spaCy NLP │ │NetworkX  │ │ Anomaly   │  ║
║  │(JWT Login)  │ │Extractor │ │Analytics │ │ Detection │  ║
║  └─────────────┘ └──────────┘ └──────────┘ └───────────┘  ║
╚═══╦═══════════════════╦══════════════╦═══════════════════════╝
    │                   │              │
    ▼                   ▼              ▼
╔══════════╗  ╔══════════════╗  ╔════════════╗
║ POSTGRES  ║  ║    NEO4J     ║  ║   REDIS    ║
║ Port 5432 ║  ║  Port 7474   ║  ║ Port 6379  ║
║           ║  ║              ║  ║            ║
║ Users     ║  ║ Nodes:       ║  ║ Task Queue ║
║ Cases     ║  ║  • Person    ║  ║ for Celery ║
║ Entities  ║  ║  • Phone     ║  ║            ║
║ Relations ║  ║  • Location  ║  ║ Background ║
║ Documents ║  ║              ║  ║ Jobs:      ║
║ Alerts    ║  ║ Edges:       ║  ║ • NLP      ║
║ Audit Logs║  ║  • CALLED    ║  ║ • Sync     ║
╚══════════╝  ║  • TRANSFER  ║  ║ • Anomaly  ║
              ║  • MET_AT    ║  ╚════════════╝
              ╚══════════════╝
                     ▲
                     │ Auto-synced after every change
              ╔══════════════╗
              ║   CELERY     ║
              ║   WORKER     ║
              ║ (Background  ║
              ║  Processor)  ║
              ╚══════════════╝

Data Flow:
Upload Report → Django → spaCy reads text → Entities extracted
→ Saved to PostgreSQL → Celery syncs to Neo4j → Anomaly engine runs
→ Alerts generated → Frontend shows graph + alerts to investigator
```

---

## 📌 Key Terms Glossary

| Term | Simple Explanation |
|---|---|
| **Entity** | Any "thing" in our system: a person, phone number, bank account, location, vehicle, or organization |
| **Relationship** | A connection between two entities: "called", "transferred money to", "met at", "owns" |
| **Node** | A dot on the network graph representing an entity |
| **Edge** | A line on the network graph representing a relationship |
| **NLP** | Natural Language Processing — AI that reads and understands human text |
| **Graph Database** | A database that stores data as nodes and connections (like a social network map) |
| **Centrality** | A score that tells how "important" or "central" a node is in the network |
| **Hop** | One step away in the network. "2-hop" means friends-of-friends |
| **CDR** | Call Detail Record — a log of all phone calls made by a number |
| **REST API** | A web service that sends/receives data (JSON format) over the internet |
| **JWT** | JSON Web Token — a secure digital ID card used for login sessions |
| **Docker** | A tool that packages software into a portable "container" |
| **RBAC** | Role-Based Access Control — different users get different permissions |
| **Fuzzy Matching** | Finding strings that are similar but not exactly the same ("Ravi" ≈ "Ravi Kumar") |
| **Celery** | A background task runner — handles heavy jobs so the website doesn't freeze |
| **PageRank** | An algorithm (originally from Google) that scores how important a node is |
| **Louvain** | A community detection algorithm that groups nodes into clusters automatically |
| **MVP** | Minimum Viable Product — the smallest version that still delivers value |

---

*Last Updated: August 2026 | Project: NEXUS INTEL — AI-Powered Criminal Network Analysis System*