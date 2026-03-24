from rest_framework.permissions import BasePermission, SAFE_METHODS

class RolePermission(BasePermission):
    """Read for all authenticated; write only for Registrar/Admin."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        role = getattr(request.user, 'role', None)
        action = getattr(view, 'action', None)
        # destructive actions: Registrar/Admin only
        if action in ('archive','unarchive','soft_delete','restore','upload_version','create','update','partial_update','destroy','hard_delete'):
            return role in ('REGISTRAR','ADMIN')
        return role in ('REGISTRAR','ADMIN')
