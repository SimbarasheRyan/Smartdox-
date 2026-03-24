from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q, Max

from .models import Document, DocumentVersion, Tag
from .serializers import DocumentSerializer, DocumentVersionSerializer, TagSerializer
from .permissions import RolePermission
from audit.utils import audit


class TagViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Tag.objects.all().order_by('name')
    serializer_class = TagSerializer
    permission_classes = [RolePermission]


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all().order_by('-updated_at')
    serializer_class = DocumentSerializer
    permission_classes = [RolePermission]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        qs = super().get_queryset()
        qp = self.request.query_params

        # support both ?q= and ?search=
        q = qp.get('q') or qp.get('search')
        tag = qp.get('tag')
        marker = qp.get('marker')

        # flags to INCLUDE records normally hidden
        include_deleted = qp.get('include_deleted') == '1'
        include_archived = qp.get('include_archived') == '1'

        # explicit state filters (so counts work: ?is_deleted=1, ?is_archived=1)
        is_deleted = qp.get('is_deleted')
        is_archived = qp.get('is_archived')

        # Deleted filtering
        if is_deleted in ('1', 'true', 'True'):
            qs = qs.filter(is_deleted=True)
        else:
            if not include_deleted:
                qs = qs.filter(is_deleted=False)

        # Archived filtering
        if is_archived in ('1', 'true', 'True'):
            qs = qs.filter(is_archived=True)
        else:
            if not include_archived:
                qs = qs.filter(is_archived=False)

        if q:
            qs = qs.filter(
                Q(title__icontains=q)
                | Q(case_number__icontains=q)
                | Q(description__icontains=q)
            )
        if marker:
            qs = qs.filter(marker__iexact=marker)
        if tag:
            qs = qs.filter(tags__name__iexact=tag)

        return qs.distinct()

    def destroy(self, request, *args, **kwargs):
        # default DELETE on /documents/:id/ is hard delete
        instance = self.get_object()
        audit(request.user, 'DELETE', 'Document', instance.id, {'title': instance.title, 'hard': True})
        return super().destroy(request, *args, **kwargs)

    def perform_create(self, serializer):
        doc = serializer.save()
        audit(self.request.user, 'CREATE', 'Document', doc.id, {'title': doc.title})

    def perform_update(self, serializer):
        doc = serializer.save()
        audit(self.request.user, 'UPDATE', 'Document', doc.id, {'title': doc.title})

    @action(detail=True, methods=['post'], url_path='upload-version', parser_classes=[MultiPartParser, FormParser])
    def upload_version(self, request, pk=None):
        doc = self.get_object()
        file = self.request.FILES.get('file')
        if not file:
            return Response({'detail': 'file is required'}, status=status.HTTP_400_BAD_REQUEST)
        current_max = doc.versions.aggregate(m=Max('version')).get('m') or 0
        ver = DocumentVersion.objects.create(document=doc, file=file, version=current_max + 1, uploaded_by=request.user)
        audit(request.user, 'UPLOAD_VERSION', 'Document', doc.id, {'version': ver.version})
        return Response(DocumentVersionSerializer(ver).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        doc = self.get_object()
        doc.archive()
        audit(request.user, 'ARCHIVE', 'Document', doc.id, {})
        return Response(DocumentSerializer(doc, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def unarchive(self, request, pk=None):
        doc = self.get_object()
        doc.unarchive()
        audit(request.user, 'UNARCHIVE', 'Document', doc.id, {})
        return Response(DocumentSerializer(doc, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def soft_delete(self, request, pk=None):
        doc = self.get_object()
        doc.soft_delete()
        audit(request.user, 'SOFT_DELETE', 'Document', doc.id, {})
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        doc = self.get_object()
        doc.restore()
        audit(request.user, 'RESTORE', 'Document', doc.id, {})
        return Response(DocumentSerializer(doc, context={'request': request}).data)

    @action(detail=True, methods=['delete'])
    def hard_delete(self, request, pk=None):
        doc = self.get_object()
        audit(request.user, 'HARD_DELETE', 'Document', doc.id, {})
        doc.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
