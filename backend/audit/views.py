from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import AuditLog
from .serializers import AuditLogSerializer

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().order_by('-created_at')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        action = self.request.query_params.get('action')
        object_type = self.request.query_params.get('object_type')
        q = self.request.query_params.get('q')
        since = self.request.query_params.get('since')
        until = self.request.query_params.get('until')
        if action: qs = qs.filter(action__iexact=action)
        if object_type: qs = qs.filter(object_type__iexact=object_type)
        if q: qs = qs.filter(Q(object_id__icontains=q) | Q(meta__icontains=q) | Q(user__username__icontains=q))
        if since: qs = qs.filter(created_at__gte=since)
        if until: qs = qs.filter(created_at__lte=until)
        return qs
