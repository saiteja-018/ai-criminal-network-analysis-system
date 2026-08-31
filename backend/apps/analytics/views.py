from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db import connection
from services.graph.graph_analytics import calculate_centrality_metrics, build_networkx_graph
from services.anomaly_detection.engine import run_anomaly_detection
from services.graph.neo4j_client import neo4j_client
from apps.alerts.models import Alert
from apps.alerts.serializers import AlertSerializer
from apps.audit.models import log_audit_action
from apps.entities.models import Entity
import redis, os

class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        db_status = "connected"
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except Exception as e:
            db_status = f"error: {str(e)}"

        neo4j_status = "connected" if neo4j_client.check_connection() else "disconnected"

        redis_status = "connected"
        try:
            r = redis.Redis.from_url(os.environ.get('REDIS_URL', 'redis://redis:6379/0'))
            r.ping()
        except Exception as e:
            redis_status = f"error: {str(e)}"

        is_healthy = (db_status == "connected")

        return Response({
            "status": "healthy" if is_healthy else "unhealthy",
            "database": db_status,
            "neo4j": neo4j_status,
            "redis": redis_status
        }, status=status.HTTP_200_OK if is_healthy else status.HTTP_500_INTERNAL_SERVER_ERROR)


class RunAnalysisView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        investigation_id = request.data.get('investigation_id')
        if not investigation_id:
            return Response({'error': 'investigation_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Run Centrality & Community Detection
        centrality_data = calculate_centrality_metrics(investigation_id)

        # 2. Run Anomaly Detection
        alerts_created = run_anomaly_detection(investigation_id)

        log_audit_action(
            user=request.user,
            action='RUN_ANALYSIS',
            resource_type='Investigation',
            resource_id=str(investigation_id),
            ip_address=request.META.get('REMOTE_ADDR'),
            metadata={
                'nodes_analyzed': len(centrality_data),
                'new_alerts_generated': len(alerts_created)
            }
        )

        return Response({
            'status': 'COMPLETED',
            'investigation_id': investigation_id,
            'nodes_analyzed': len(centrality_data),
            'alerts_generated': len(alerts_created)
        })


class CentralityAnalysisView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, investigation_id):
        centrality_data = calculate_centrality_metrics(investigation_id)
        
        # Enrich with entity details
        entities = {e.id: e for e in Entity.objects.filter(investigation_id=investigation_id)}
        enriched = []
        for ent_id, metrics in centrality_data.items():
            ent = entities.get(ent_id)
            if ent:
                metrics['name'] = ent.name
                metrics['entity_type'] = ent.entity_type
            enriched.append(metrics)

        # Sort by Degree Centrality descending
        enriched.sort(key=lambda x: x.get('degree_centrality', 0.0), reverse=True)

        return Response({
            'investigation_id': investigation_id,
            'results': enriched
        })


class CommunitiesAnalysisView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, investigation_id):
        centrality_data = calculate_centrality_metrics(investigation_id)
        entities = {e.id: e for e in Entity.objects.filter(investigation_id=investigation_id)}

        communities = {}
        for ent_id, metrics in centrality_data.items():
            comm_id = metrics.get('community', 1)
            ent = entities.get(ent_id)
            if comm_id not in communities:
                communities[comm_id] = {
                    'community_id': comm_id,
                    'members_count': 0,
                    'entities': []
                }
            if ent:
                communities[comm_id]['members_count'] += 1
                communities[comm_id]['entities'].append({
                    'id': ent.id,
                    'name': ent.name,
                    'entity_type': ent.entity_type
                })

        return Response({
            'investigation_id': investigation_id,
            'total_communities': len(communities),
            'communities': list(communities.values())
        })


class AnomaliesAnalysisView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, investigation_id):
        alerts = Alert.objects.filter(investigation_id=investigation_id).order_by('-score')
        serializer = AlertSerializer(alerts, many=True)
        return Response({
            'investigation_id': investigation_id,
            'total_anomalies': alerts.count(),
            'anomalies': serializer.data
        })
