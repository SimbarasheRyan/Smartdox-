from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    class Meta:
        model = AuditLog
        fields = ('id','created_at','user','action','object_type','object_id','meta')
    def get_user(self, obj):
        return obj.user.username if obj.user else None
