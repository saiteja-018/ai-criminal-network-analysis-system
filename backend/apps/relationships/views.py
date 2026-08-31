from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Relationship, CommunicationRecord, FinancialTransaction, LocationEvent
from .serializers import (
    RelationshipSerializer, CommunicationRecordSerializer,
    FinancialTransactionSerializer, LocationEventSerializer
)

class RelationshipViewSet(viewsets.ModelViewSet):
    queryset = Relationship.objects.all()
    serializer_class = RelationshipSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['investigation', 'relationship_type', 'source_entity', 'target_entity']
    search_fields = ['source_entity__name', 'target_entity__name', 'evidence', 'source']
    ordering_fields = ['confidence', 'created_at', 'relationship_type']

class CommunicationRecordViewSet(viewsets.ModelViewSet):
    queryset = CommunicationRecord.objects.all()
    serializer_class = CommunicationRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['investigation', 'source_entity', 'target_entity', 'communication_type']
    ordering_fields = ['timestamp', 'duration']

class FinancialTransactionViewSet(viewsets.ModelViewSet):
    queryset = FinancialTransaction.objects.all()
    serializer_class = FinancialTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['investigation', 'sender', 'receiver', 'currency', 'transaction_type']
    ordering_fields = ['timestamp', 'amount']

class LocationEventViewSet(viewsets.ModelViewSet):
    queryset = LocationEvent.objects.all()
    serializer_class = LocationEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['investigation', 'entity', 'event_type', 'location']
    ordering_fields = ['timestamp']
