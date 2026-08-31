from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Entity, EntityMergeCandidate
from .serializers import EntitySerializer, EntityMergeCandidateSerializer
from apps.relationships.models import Relationship, CommunicationRecord, FinancialTransaction, LocationEvent
from apps.investigations.models import Investigation
from services.graph.graph_analytics import get_entity_network, calculate_centrality_metrics
from services.entity_resolution.resolver import merge_entities
from apps.audit.models import log_audit_action

class EntityViewSet(viewsets.ModelViewSet):
    queryset = Entity.objects.all()
    serializer_class = EntitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['investigation', 'entity_type', 'normalized_name']
    search_fields = ['name', 'normalized_name', 'external_reference', 'source']
    ordering_fields = ['name', 'confidence', 'created_at']

    @action(detail=True, methods=['get'])
    def network(self, request, pk=None):
        """GET /api/entities/{id}/network/?depth=1|2|3"""
        depth = int(request.query_params.get('depth', 1))
        max_nodes = int(request.query_params.get('max_nodes', 500))
        network_data = get_entity_network(entity_id=int(pk), depth=depth, max_nodes=max_nodes)
        return Response(network_data)

    @action(detail=True, methods=['get'])
    def timeline(self, request, pk=None):
        """GET /api/entities/{id}/timeline/ - Chronological events for entity."""
        try:
            entity = self.get_object()
        except Entity.DoesNotExist:
            return Response({'error': 'Entity not found'}, status=status.HTTP_404_NOT_FOUND)

        events = []

        # 1. Communications
        comms = CommunicationRecord.objects.filter(Q(source_entity=entity) | Q(target_entity=entity))
        for c in comms:
            events.append({
                'id': f"comm_{c.id}",
                'event_type': 'COMMUNICATION',
                'title': f"{c.communication_type}: {c.source_entity.name} -> {c.target_entity.name}",
                'timestamp': c.timestamp,
                'details': {'duration': c.duration, 'type': c.communication_type}
            })

        # 2. Financial Transactions
        txs = FinancialTransaction.objects.filter(Q(sender=entity) | Q(receiver=entity))
        for t in txs:
            events.append({
                'id': f"tx_{t.id}",
                'event_type': 'FINANCIAL_TRANSACTION',
                'title': f"Transaction ${float(t.amount):,.2f}: {t.sender.name} -> {t.receiver.name}",
                'timestamp': t.timestamp,
                'details': {'amount': float(t.amount), 'currency': t.currency, 'type': t.transaction_type}
            })

        # 3. Location Events
        locs = LocationEvent.objects.filter(entity=entity)
        for l in locs:
            events.append({
                'id': f"loc_{l.id}",
                'event_type': 'LOCATION_EVENT',
                'title': f"Location Event at {l.location} ({l.event_type})",
                'timestamp': l.timestamp,
                'details': {'location': l.location, 'type': l.event_type}
            })

        # Sort chronologically descending
        events.sort(key=lambda x: x['timestamp'], reverse=True)

        return Response({
            'entity_id': entity.id,
            'entity_name': entity.name,
            'events': events,
            'total_events': len(events)
        })

class EntityMergeCandidateViewSet(viewsets.ModelViewSet):
    queryset = EntityMergeCandidate.objects.all()
    serializer_class = EntityMergeCandidateSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['investigation', 'status']

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        candidate = self.get_object()
        success, msg = merge_entities(
            source_entity_id=candidate.source_entity.id,
            target_entity_id=candidate.target_entity.id,
            user=request.user
        )
        if success:
            candidate.status = EntityMergeCandidate.Status.APPROVED
            candidate.reviewed_by = request.user
            candidate.save()
            return Response({'status': 'APPROVED', 'message': msg})
        return Response({'error': msg}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        candidate = self.get_object()
        candidate.status = EntityMergeCandidate.Status.REJECTED
        candidate.reviewed_by = request.user
        candidate.save()
        return Response({'status': 'REJECTED', 'message': 'Candidate match marked as rejected'})

class GlobalSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query or len(query) < 2:
            return Response({'entities': [], 'investigations': []})

        norm_q = query.lower()

        # Search Entities
        entities = Entity.objects.filter(
            Q(name__icontains=query) |
            Q(normalized_name__icontains=norm_q) |
            Q(external_reference__icontains=query)
        )[:20]
        entity_serializer = EntitySerializer(entities, many=True)

        # Search Investigations
        investigations = Investigation.objects.filter(
            Q(title__icontains=query) |
            Q(case_number__icontains=query) |
            Q(description__icontains=query)
        )[:10]

        return Response({
            'query': query,
            'entities': entity_serializer.data,
            'investigations': [
                {'id': inv.id, 'title': inv.title, 'case_number': inv.case_number, 'status': inv.status}
                for inv in investigations
            ]
        })
