from rest_framework import permissions, views, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .serializers import UserSerializer, AdminUserSerializer
from .models import User
from .permissions import IsAdminRole

class MeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response(UserSerializer(request.user).data)

class UserViewSet(viewsets.ModelViewSet):
    """
    Admin-only CRUD for users.
    Supports ?q=<username/email> search.
    """
    queryset = User.objects.all().order_by('username')
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(Q(username__icontains=q) | Q(email__icontains=q))
        return qs

    @action(detail=True, methods=['post'])
    def set_password(self, request, pk=None):
        new_password = request.data.get('new_password')
        if not new_password:
            return Response({'detail':'new_password required'}, status=status.HTTP_400_BAD_REQUEST)
        u = self.get_object()
        u.set_password(new_password); u.save()
        return Response({'detail':'password updated'})

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        u = self.get_object(); u.is_active = True; u.save(update_fields=['is_active'])
        return Response(UserSerializer(u).data)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        u = self.get_object(); u.is_active = False; u.save(update_fields=['is_active'])
        return Response(UserSerializer(u).data)
# ⬇️ append to the bottom of the file
from rest_framework import generics, permissions
from .serializers import RegistrationSerializer

class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegistrationSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = getattr(user, 'role', None)  # add role claim
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
