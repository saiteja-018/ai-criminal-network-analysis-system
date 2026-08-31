from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InvestigationViewSet

router = DefaultRouter()
router.register(r'', InvestigationViewSet, basename='investigation')

urlpatterns = [
    path('', include(router.urls)),
]
