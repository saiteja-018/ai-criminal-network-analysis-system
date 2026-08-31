from django.conf import settings
try:
    from neo4j import GraphDatabase, exceptions as neo4j_exceptions
except ImportError:
    GraphDatabase = None
    neo4j_exceptions = None

class Neo4jClient:
    def __init__ (self):
        self.driver = None
        self.uri = getattr(settings, 'NEO4J_URI', 'bolt://neo4j:7687')
        self.user = getattr(settings, 'NEO4J_USER', 'neo4j')
        self.password = getattr(settings, 'NEO4J_PASSWORD', 'neo4j_secure_password_2026')

    def get_driver(self):
        if not GraphDatabase:
            return None
        if self.driver is None:
            try:
                self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
            except Exception as e:
                print(f"Neo4j Connection Failed: {e}")
                self.driver = None
        return self.driver

    def check_connection(self) -> bool:
        driver = self.get_driver()
        if not driver:
            return False
        try:
            with driver.session() as session:
                result = session.run("RETURN 1 AS result")
                record = result.single()
                return record and record["result"] == 1
        except Exception:
            return False

    def execute_query(self, query: str, parameters: dict = None):
        driver = self.get_driver()
        if not driver:
            return []
        try:
            with driver.session() as session:
                result = session.run(query, parameters or {})
                return [record.data() for record in result]
        except Exception as e:
            print(f"Neo4j Query Error: {e}")
            return []

    def close(self):
        if self.driver:
            self.driver.close()
            self.driver = None

neo4j_client = Neo4jClient()
