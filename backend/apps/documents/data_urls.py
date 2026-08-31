from django.urls import path
from .views import DataImportView

urlpatterns = [
    path('import/', DataImportView.as_view(), name='data-import'),
]
