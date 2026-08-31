# AI-Powered Criminal Network Analysis System — Investigator User Guide

## 1. System Access & Authentication
1. Launch the system dashboard at `http://localhost:5173`.
2. Sign in using officer credentials:
   * **Investigator**: `investigator` / `Investigator@123`
   * **Administrator**: `admin` / `Admin@123`
   * **Analyst**: `analyst` / `Analyst@123`
   * **Viewer**: `viewer` / `Viewer@123`

---

## 2. Navigating the Interactive Graph Explorer
1. Navigate to **Network Explorer** in the left sidebar menu.
2. Select the target **Case File** from the top header bar.
3. Adjust the **Hop Radius** (1-Hop, 2-Hops, 3-Hops) to expand or narrow the visual topology radius.
4. **Node Color Legend**:
   * **Cyan**: Person
   * **Amber**: Organization
   * **Emerald**: Location
   * **Purple**: Vehicle
   * **Blue**: Phone
   * **Rose**: Financial Account / Wire
5. Click on any Node or Relationship Edge to open the **Entity Inspector Drawer** on the right.
6. Use the **Entity Filters** to toggle specific entity types on or off.

---

## 3. Data Ingestion & Automated Entity Extraction
1. Navigate to **Data Ingestion** in the sidebar.
2. Select the active **Target Case File**.
3. Choose the import format:
   * **Unstructured Intelligence Report**: Paste freeform text (police surveillance report, FIR text, transcript). The spaCy NLP engine automatically extracts entities and relationships.
   * **CSV Formats**: Select Call Detail Records (CDR), Financial Wire Logs, or Location Check-ins.
4. Click **PROCESS INGESTION PIPELINE**.

---

## 4. Entity Resolution & Merging
1. Navigate to **Entity Resolution**.
2. Review candidate duplicate entities identified by the fuzzy match resolver (e.g., "Ravi Kumar" vs "R. Kumar").
3. Inspect match confidence score and evidence reason.
4. Click **MERGE** to consolidate duplicate nodes or **REJECT** to dismiss the match candidate.

---

## 5. Automated Anomaly Alerts
1. Navigate to **Alerts & Anomalies**.
2. Review detected risk signals (Circular Money Flow, Dispatcher Hub, Rapid Location Movement, Shared Phone Collision).
3. Update alert status to `UNDER_REVIEW`, `RESOLVED`, or `DISMISSED`.

---

## 6. Audit Logging & Compliance
1. All sensitive actions (views, network queries, merges, data imports, user authentication) are recorded in **Audit Logs**.
2. Sensitive keys (passwords, tokens) are automatically redacted in compliance with law-enforcement standards.
