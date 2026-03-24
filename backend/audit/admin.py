from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditAdmin(admin.ModelAdmin):
    list_display = ('created_at','user','action','object_type','object_id')
    search_fields = ('action','object_type','object_id','user__username')
    list_filter = ('action','created_at')
