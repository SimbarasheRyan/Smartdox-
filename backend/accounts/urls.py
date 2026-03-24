from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MeView, UserViewSet, RegisterView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user-admin')

urlpatterns = [
    path('me/', MeView.as_view(), name='me'),
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
]
