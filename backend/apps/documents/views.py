from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Document
from .serializers import DocumentSerializer, DataImportSerializer
from services.ingestion.importer import process_text_document, import_csv_data
from apps.audit.models import log_audit_action

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        doc = serializer.save()
        log_audit_action(
            user=self.request.user,
            action='UPLOAD_DOCUMENT',
            resource_type='Document',
            resource_id=str(doc.id),
            ip_address=self.request.META.get('REMOTE_ADDR'),
            metadata={'title': doc.title, 'document_type': doc.document_type}
        )
        # Process document text synchronously or via celery task
        process_text_document(doc.investigation_id, doc.title, doc.raw_text, doc.document_type, doc.source)

class DataImportView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        serializer = DataImportSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        inv_id = serializer.validated_data['investigation_id']
        import_type = serializer.validated_data['import_type']
        content = serializer.validated_data.get('content', '')

        if 'file' in request.FILES:
            content = request.FILES['file'].read().decode('utf-8')

        if not content.strip():
            return Response({'error': 'No text content or file provided for import'}, status=status.HTTP_400_BAD_REQUEST)

        if import_type == 'TEXT_DOCUMENT':
            title = request.data.get('title', 'Imported Document')
            result = process_text_document(inv_id, title, content)
        else:
            result = import_csv_data(inv_id, content, import_type)

        log_audit_action(
            user=request.user,
            action='IMPORT_DATA',
            resource_type='Investigation',
            resource_id=str(inv_id),
            ip_address=request.META.get('REMOTE_ADDR'),
            metadata={'import_type': import_type, 'result': result}
        )

        return Response(result, status=status.HTTP_200_OK)
