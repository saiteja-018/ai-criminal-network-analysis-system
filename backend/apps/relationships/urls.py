from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RelationshipViewSet, CommunicationRecordViewSet,
    FinancialTransactionViewSet, LocationEventViewSet
)

router = DefaultRouter()
router.register(r'communications', CommunicationRecordViewSet, basename='communication')
router.register(r'transactions', FinancialTransactionViewSet, basename='transaction')
router.register(r'locations', LocationEventViewSet, basename='location-event')
router.register(r'', RelationshipViewSet, basename='relationship')

urlpatterns = [
    path('', include(router.urls)),
]
