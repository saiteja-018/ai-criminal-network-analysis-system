from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EntityViewSet, EntityMergeCandidateViewSet, GlobalSearchView

router = DefaultRouter()
router.register(r'merge-candidates', EntityMergeCandidateViewSet, basename='merge-candidate')
router.register(r'', EntityViewSet, basename='entity')

urlpatterns = [
    path('search/', GlobalSearchView.as_view(), name='global-search'),
    path('', include(router.urls)),
]
