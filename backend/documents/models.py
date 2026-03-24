from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError
import re

MARKER_RE = re.compile(r"^(?P<name>[A-Za-z]+)?CT(?P<num>\d{1,3})$")

class Tag(models.Model):
    name = models.CharField(max_length=64, unique=True)
    def __str__(self): return self.name

class Document(models.Model):
    title = models.CharField(max_length=255)
    case_number = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    marker = models.CharField(max_length=128, blank=True, help_text="e.g., SimbaCT1 (CT1..CT100)")
    tags = models.ManyToManyField(Tag, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_documents')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # lifecycle
    is_archived = models.BooleanField(default=False)
    archived_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)  # soft delete
    deleted_at = models.DateTimeField(null=True, blank=True)

    def clean(self):
        super().clean()
        if self.marker:
            m = MARKER_RE.match(self.marker)
            if not m:
                raise ValidationError({'marker': 'Use something like SimbaCT1'})
            num = int(m.group('num'))
            if not (1 <= num <= 100):
                raise ValidationError({'marker': 'CT number must be 1..100'})

    def archive(self):
        self.is_archived, self.archived_at = True, timezone.now()
        self.save(update_fields=['is_archived','archived_at'])
    def unarchive(self):
        self.is_archived, self.archived_at = False, None
        self.save(update_fields=['is_archived','archived_at'])
    def soft_delete(self):
        self.is_deleted, self.deleted_at = True, timezone.now()
        self.save(update_fields=['is_deleted','deleted_at'])
    def restore(self):
        self.is_deleted, self.deleted_at = False, None
        self.save(update_fields=['is_deleted','deleted_at'])

class DocumentVersion(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='versions')
    file = models.FileField(upload_to='documents/%Y/%m/%d/')
    version = models.PositiveIntegerField()
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    checksum = models.CharField(max_length=128, blank=True)

    class Meta:
        unique_together = ('document','version')
        ordering = ['-version']

    def __str__(self): return f"{self.document.title} v{self.version}"
