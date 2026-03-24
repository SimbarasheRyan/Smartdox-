from rest_framework import serializers
from django.db.models import Max
import json
from .models import Document, DocumentVersion, Tag

class TagSerializer(serializers.ModelSerializer):
    class Meta: model = Tag; fields = ('id','name')

class DocumentVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentVersion
        fields = ('id','version','file','uploaded_by','uploaded_at','checksum')
        read_only_fields = ('version','uploaded_by','uploaded_at','checksum')

class DocumentSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, required=False)
    versions = DocumentVersionSerializer(many=True, read_only=True)

    class Meta:
        model = Document
        fields = (
            'id','title','case_number','description','marker','tags',
            'created_by','created_at','updated_at','versions',
            'is_archived','archived_at','is_deleted','deleted_at'
        )
        read_only_fields = ('created_by','created_at','updated_at','versions','archived_at','deleted_at')

    def _parse_tags(self, tags_data):
        if isinstance(tags_data, str):
            try: return json.loads(tags_data)
            except: return [{'name': t.strip()} for t in tags_data.split(',') if t.strip()]
        return tags_data or []

    def _apply_tags(self, doc, tags_data):
        for t in tags_data:
            tag, _ = Tag.objects.get_or_create(name=t.get('name') or str(t))
            doc.tags.add(tag)

    def _create_version(self, document, file, user):
        current_max = document.versions.aggregate(m=Max('version')).get('m') or 0
        DocumentVersion.objects.create(
            document=document, file=file, version=current_max+1, uploaded_by=user,
        )

    def create(self, validated_data):
        # DRF won't auto-parse nested JSON when multipart; pull from request
        request = self.context['request']
        tags_data = self._parse_tags(request.data.get('tags', validated_data.pop('tags', [])))
        user = request.user
        file = request.FILES.get('file')
        doc = Document.objects.create(created_by=user, **validated_data)
        self._apply_tags(doc, tags_data)
        if file: self._create_version(doc, file, user)
        return doc

    def update(self, instance, validated_data):
        tags_data = self._parse_tags(self.context['request'].data.get('tags', None))
        for k,v in validated_data.items(): setattr(instance, k, v)
        instance.save()
        if tags_data is not None:
            instance.tags.clear()
            self._apply_tags(instance, tags_data)
        return instance
