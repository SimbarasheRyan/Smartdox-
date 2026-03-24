from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, TagViewSet

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'tags', TagViewSet, basename='tag')

urlpatterns = [ 
    path('', include(router.urls)),
    path('documents/<int:pk>/archive/', DocumentViewSet.as_view({'post': 'archive'}), name='document-archive'),
    path('documents/<int:pk>/unarchive/', DocumentViewSet.as_view({'post': 'unarchive'}), name='document-unarchive'),
    path('documents/<int:pk>/soft_delete/', DocumentViewSet.as_view({'post': 'soft_delete'}), name='document-soft-delete'),
    path('documents/<int:pk>/restore/', DocumentViewSet.as_view({'post': 'restore'}), name='document-restore'),
    path('documents/<int:pk>/hard_delete/', DocumentViewSet.as_view({'delete': 'hard_delete'}), name='document-hard-delete'),
    
    
    ]
