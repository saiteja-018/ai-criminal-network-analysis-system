from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Alert
from .serializers import AlertSerializer
from apps.audit.models import log_audit_action

class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['investigation', 'severity', 'status', 'alert_type']
    search_fields = ['description', 'alert_type']
    ordering_fields = ['score', 'created_at', 'severity']

    def perform_update(self, serializer):
        alert = serializer.save()
        log_audit_action(
            user=self.request.user,
            action='REVIEW_ALERT',
            resource_type='Alert',
            resource_id=str(alert.id),
            ip_address=self.request.META.get('REMOTE_ADDR'),
            metadata={'alert_type': alert.alert_type, 'new_status': alert.status}
        )
