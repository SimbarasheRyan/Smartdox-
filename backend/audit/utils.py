from .models import AuditLog
def audit(user, action, object_type, object_id, meta=None):
    AuditLog.objects.create(
        user=user, action=action, object_type=object_type,
        object_id=str(object_id), meta=meta or {}
    )
