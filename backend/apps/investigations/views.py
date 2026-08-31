from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Investigation
from .serializers import InvestigationSerializer
from apps.audit.models import log_audit_action

class InvestigationViewSet(viewsets.ModelViewSet):
    queryset = Investigation.objects.all()
    serializer_class = InvestigationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'case_number', 'description']
    ordering_fields = ['created_at', 'updated_at', 'priority', 'status']

    def perform_create(self, serializer):
        investigation = serializer.save(created_by=self.request.user)
        log_audit_action(
            user=self.request.user,
            action='CREATE_INVESTIGATION',
            resource_type='Investigation',
            resource_id=str(investigation.id),
            ip_address=self.request.META.get('REMOTE_ADDR'),
            metadata={'title': investigation.title, 'case_number': investigation.case_number}
        )

    def perform_update(self, serializer):
        investigation = serializer.save()
        log_audit_action(
            user=self.request.user,
            action='UPDATE_INVESTIGATION',
            resource_type='Investigation',
            resource_id=str(investigation.id),
            ip_address=self.request.META.get('REMOTE_ADDR'),
            metadata={'title': investigation.title, 'status': investigation.status}
        )
