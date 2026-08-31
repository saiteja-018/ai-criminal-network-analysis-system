import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User
from apps.investigations.models import Investigation
from apps.entities.models import Entity, EntityType, EntityMergeCandidate
from apps.relationships.models import Relationship, RelationshipType, CommunicationRecord, FinancialTransaction, LocationEvent
from apps.documents.models import Document
from services.graph.graph_sync import sync_investigation_to_neo4j
from services.anomaly_detection.engine import run_anomaly_detection
from services.entity_resolution.resolver import resolve_entities_for_investigation

class Command(BaseCommand):
    help = 'Seeds realistic synthetic demo data for criminal network analysis demonstration.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting demo data seeding..."))

        # 1. Create Default Demo Users
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={'email': 'admin@intelligence.gov', 'role': 'ADMIN', 'is_staff': True, 'is_superuser': True}
        )
        admin_user.set_password('Admin@123')
        admin_user.save()

        investigator_user, _ = User.objects.get_or_create(
            username='investigator',
            defaults={'email': 'investigator@intelligence.gov', 'role': 'INVESTIGATOR'}
        )
        investigator_user.set_password('Investigator@123')
        investigator_user.save()

        analyst_user, _ = User.objects.get_or_create(
            username='analyst',
            defaults={'email': 'analyst@intelligence.gov', 'role': 'ANALYST'}
        )
        analyst_user.set_password('Analyst@123')
        analyst_user.save()

        viewer_user, _ = User.objects.get_or_create(
            username='viewer',
            defaults={'email': 'viewer@intelligence.gov', 'role': 'VIEWER'}
        )
        viewer_user.set_password('Viewer@123')
        viewer_user.save()

        self.stdout.write("Created demo users: admin, investigator, analyst, viewer (Password: RoleName@123)")

        # 2. Create Demo Investigation Cases
        inv1, _ = Investigation.objects.get_or_create(
            case_number="CASE-2026-NEXUS-01",
            defaults={
                "title": "Operation Nexus - Transnational Smuggling Ring",
                "description": "Investigation into suspected contraband smuggling network operating across port hubs, local shell corporations, and encrypted communication channels.",
                "status": Investigation.Status.IN_PROGRESS,
                "priority": Investigation.Priority.CRITICAL,
                "created_by": investigator_user
            }
        )

        inv2, _ = Investigation.objects.get_or_create(
            case_number="CASE-2026-PHANTOM-02",
            defaults={
                "title": "Operation Phantom - Cyber-Financial Fraud Loop",
                "description": "Analysis of multi-bank circular fund transfers and shared synthetic identity credentials.",
                "status": Investigation.Status.OPEN,
                "priority": Investigation.Priority.HIGH,
                "created_by": investigator_user
            }
        )

        # 3. Create Entities for Operation Nexus
        people_data = [
            ("Ravi Kumar", "Key coordinator of port logistics"),
            ("Vikram Malhotra", "Head of Apex Trading LLC"),
            ("Anand Sharma", "Financial manager and accountant"),
            ("Marcus Vance", "Overseas shipping agent"),
            ("Devender Singh", "Warehouse supervisor"),
            ("Priya Patel", "Customs broker"),
            ("Karan Johar", "Courier driver"),
            ("Sunil Verma", "Port dispatcher"),
            ("R. Kumar", "Alias associated with Ravi Kumar"),
            ("Ravi K", "Secondary alias for Ravi Kumar"),
            ("David Miller", "International wire intermediary"),
            ("Elena Rostova", "Offshore account holder"),
            ("Tariq Ahmed", "Local distribution liaison"),
            ("Carlos Mendez", "Maritime cargo inspector"),
            ("Suresh Reddy", "Truck fleet manager"),
            ("Amit Shah", "Shell company director"),
            ("Rajesh Gupta", "Informal hawala broker"),
            ("Deepak Joshi", "Security guard supervisor"),
            ("Arjun Nair", "Vessel charter agent"),
            ("Nikhil Saxena", "Document clearing agent")
        ]

        person_entities = []
        for name, desc in people_data:
            ent, _ = Entity.objects.get_or_create(
                investigation=inv1,
                normalized_name=name.strip().lower(),
                defaults={
                    "name": name,
                    "entity_type": EntityType.PERSON,
                    "confidence": 0.95,
                    "source": "DEMO_SEED",
                    "metadata": {"notes": desc}
                }
            )
            person_entities.append(ent)

        # Organizations
        orgs_data = [
            "Apex Trading LLC", "Global Harbor Logistics", "Vanguard Shell Corp",
            "Oceanic Maritime Services", "Horizon Star Financial Group"
        ]
        org_entities = []
        for name in orgs_data:
            ent, _ = Entity.objects.get_or_create(
                investigation=inv1,
                normalized_name=name.strip().lower(),
                defaults={"name": name, "entity_type": EntityType.ORGANIZATION, "confidence": 0.98, "source": "DEMO_SEED"}
            )
            org_entities.append(ent)

        # Locations
        locs_data = [
            "Warehouse 14 - Port Harbor", "Terminal 3 Customs Yard", "Downtown Financial Plaza #402",
            "Suburban Freight Hub", "Airport Cargo Complex"
        ]
        loc_entities = []
        for name in locs_data:
            ent, _ = Entity.objects.get_or_create(
                investigation=inv1,
                normalized_name=name.strip().lower(),
                defaults={"name": name, "entity_type": EntityType.LOCATION, "confidence": 0.96, "source": "DEMO_SEED"}
            )
            loc_entities.append(ent)

        # Phones
        phones_data = ["+1-555-0192", "+1-555-0843", "+1-555-0377", "+1-555-0921", "+1-555-0455", "+1-555-0612"]
        phone_entities = []
        for p in phones_data:
            ent, _ = Entity.objects.get_or_create(
                investigation=inv1,
                normalized_name=p.strip().lower(),
                defaults={"name": p, "entity_type": EntityType.PHONE, "confidence": 0.99, "source": "DEMO_SEED"}
            )
            phone_entities.append(ent)

        # Vehicles
        vehicles_data = ["TRK-882-NY", "VAN-404-FL", "CONTAINER-CX99", "CAR-DL-09-AB-1234"]
        vehicle_entities = []
        for v in vehicles_data:
            ent, _ = Entity.objects.get_or_create(
                investigation=inv1,
                normalized_name=v.strip().lower(),
                defaults={"name": v, "entity_type": EntityType.VEHICLE, "confidence": 0.94, "source": "DEMO_SEED"}
            )
            vehicle_entities.append(ent)

        # Accounts
        accounts_data = ["ACCT-99281744", "ACCT-11029384", "ACCT-77382019", "IBAN-CH930000000000000000"]
        account_entities = []
        for a in accounts_data:
            ent, _ = Entity.objects.get_or_create(
                investigation=inv1,
                normalized_name=a.strip().lower(),
                defaults={"name": a, "entity_type": EntityType.ACCOUNT, "confidence": 0.97, "source": "DEMO_SEED"}
            )
            account_entities.append(ent)

        self.stdout.write(f"Seeded {Entity.objects.filter(investigation=inv1).count()} total entities for Investigation 1.")

        # 4. Create Specific Relationships (Network Patterns)
        ravik = person_entities[0]
        vikram = person_entities[1]
        anand = person_entities[2]
        marcus = person_entities[3]
        devender = person_entities[4]
        priya = person_entities[5]
        karan = person_entities[6]
        sunil = person_entities[7]
        david = person_entities[10]
        elena = person_entities[11]

        shared_phone = phone_entities[0]

        # Dense Cluster relationships (Syndicate Core)
        core_group = [ravik, vikram, anand, devender, priya]
        for i in range(len(core_group)):
            for j in range(i + 1, len(core_group)):
                Relationship.objects.get_or_create(
                    investigation=inv1,
                    source_entity=core_group[i],
                    target_entity=core_group[j],
                    relationship_type=RelationshipType.KNOWS,
                    defaults={"confidence": 0.92, "source": "DEMO_SEED", "evidence": "Intercepted meeting log"}
                )

        # Bridge Person: Marcus Vance connects Syndicate Core to Global Logistics & Overseas agents
        Relationship.objects.get_or_create(investigation=inv1, source_entity=ravik, target_entity=marcus, relationship_type=RelationshipType.COMMUNICATED_WITH, defaults={"confidence": 0.89, "evidence": "Encrypted call"})
        Relationship.objects.get_or_create(investigation=inv1, source_entity=marcus, target_entity=david, relationship_type=RelationshipType.ASSOCIATED_WITH, defaults={"confidence": 0.88, "evidence": "Overseas flight manifest"})
        Relationship.objects.get_or_create(investigation=inv1, source_entity=marcus, target_entity=elena, relationship_type=RelationshipType.TRANSFERRED_TO, defaults={"confidence": 0.90, "evidence": "Swift transfer record"})

        # High Communication Node: Sunil Verma calling multiple individuals
        high_comm_targets = person_entities[8:18]
        now = timezone.now()
        for idx, target in enumerate(high_comm_targets):
            Relationship.objects.get_or_create(investigation=inv1, source_entity=sunil, target_entity=target, relationship_type=RelationshipType.CALLED, defaults={"confidence": 0.95, "evidence": "CDR Dispatch log"})
            for k in range(3):
                CommunicationRecord.objects.create(
                    investigation=inv1,
                    source_entity=sunil,
                    target_entity=target,
                    communication_type="CALL",
                    timestamp=now - timedelta(hours=k*2 + idx),
                    duration=120 + (k * 30)
                )

        # Circular Financial Loop: Anand -> David -> Elena -> Anand
        Relationship.objects.get_or_create(investigation=inv1, source_entity=anand, target_entity=david, relationship_type=RelationshipType.TRANSFERRED_TO, defaults={"confidence": 0.98, "evidence": "Bank Wire #771"})
        Relationship.objects.get_or_create(investigation=inv1, source_entity=david, target_entity=elena, relationship_type=RelationshipType.TRANSFERRED_TO, defaults={"confidence": 0.98, "evidence": "Bank Wire #772"})
        Relationship.objects.get_or_create(investigation=inv1, source_entity=elena, target_entity=anand, relationship_type=RelationshipType.TRANSFERRED_TO, defaults={"confidence": 0.98, "evidence": "Bank Wire #773"})

        FinancialTransaction.objects.create(investigation=inv1, sender=anand, receiver=david, amount=45000.00, currency="USD", timestamp=now - timedelta(days=3))
        FinancialTransaction.objects.create(investigation=inv1, sender=david, receiver=elena, amount=43500.00, currency="USD", timestamp=now - timedelta(days=2))
        FinancialTransaction.objects.create(investigation=inv1, sender=elena, receiver=anand, amount=42000.00, currency="USD", timestamp=now - timedelta(days=1))

        # Shared Identifier Pattern
        Relationship.objects.get_or_create(investigation=inv1, source_entity=ravik, target_entity=shared_phone, relationship_type=RelationshipType.OWNS, defaults={"confidence": 0.95, "evidence": "SIM registration record"})
        Relationship.objects.get_or_create(investigation=inv1, source_entity=devender, target_entity=shared_phone, relationship_type=RelationshipType.OWNS, defaults={"confidence": 0.90, "evidence": "CDR tower ping"})

        # Rapid Multi-Location Movement
        LocationEvent.objects.create(investigation=inv1, entity=ravik, location="Port Harbor Terminal 3", timestamp=now - timedelta(hours=4), event_type="CHECK_IN")
        LocationEvent.objects.create(investigation=inv1, entity=ravik, location="Suburban Freight Hub (50km away)", timestamp=now - timedelta(hours=3), event_type="SPOTTED")

        # 5. Create Intelligence Document
        doc_text = """
        POLICE SURVEILLANCE REPORT - OPERATION NEXUS
        Date: 2026-08-15
        Location: Port Harbor & Warehouse 14

        Subject Ravi Kumar was observed meeting Vikram Malhotra at Apex Trading LLC offices at 09:00 AM. 
        Later at 11:30 AM, Ravi Kumar contacted Anand Sharma using phone +1-555-0192. 
        Anand Sharma subsequently authorized a money wire from account ACCT-99281744 to Marcus Vance.
        Marcus Vance operates as the key international shipping agent connecting Global Harbor Logistics to overseas operations.
        Sunil Verma was seen at Terminal 3 Customs Yard dispatching driver Karan Johar with vehicle TRK-882-NY.
        Customs broker Priya Patel signed cargo release documents alongside Devender Singh.
        """

        Document.objects.create(
            investigation=inv1,
            document_type=Document.DocumentType.POLICE_REPORT,
            title="Surveillance Summary - Port Harbor Operations",
            raw_text=doc_text,
            source="SURVEILLANCE_UNIT_4",
            processed=True
        )

        # 6. Run Neo4j Sync, Entity Resolution & Anomaly Detection
        self.stdout.write("Synchronizing network to Neo4j graph database...")
        sync_investigation_to_neo4j(inv1.id)

        self.stdout.write("Running Entity Resolution scanner...")
        resolve_entities_for_investigation(inv1.id)

        self.stdout.write("Executing Anomaly Detection Engine rules...")
        alerts = run_anomaly_detection(inv1.id)

        self.stdout.write(self.style.SUCCESS(
            f"Demo data successfully seeded! Generated {len(alerts)} alerts and full network graph."
        ))
