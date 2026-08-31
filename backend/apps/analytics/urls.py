from django.urls import path
from .views import (
    RunAnalysisView, CentralityAnalysisView,
    CommunitiesAnalysisView, AnomaliesAnalysisView
)

urlpatterns = [
    path('run/', RunAnalysisView.as_view(), name='analysis-run'),
    path('<int:investigation_id>/centrality/', CentralityAnalysisView.as_view(), name='analysis-centrality'),
    path('<int:investigation_id>/communities/', CommunitiesAnalysisView.as_view(), name='analysis-communities'),
    path('<int:investigation_id>/anomalies/', AnomaliesAnalysisView.as_view(), name='analysis-anomalies'),
]
