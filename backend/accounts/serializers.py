from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'role', 'is_active')

class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=False)

    class Meta:
        model = User
        fields = (
            'id','username','first_name','last_name','email','role',
            'is_active','is_staff','password'
        )
        read_only_fields = ('is_staff',)

    def validate_role(self, value):
        # ensure valid choice
        choices = [c[0] for c in User.Roles.choices]
        if value not in choices:
            raise serializers.ValidationError("Invalid role.")
        return value

    def create(self, validated_data):
        pwd = validated_data.pop('password', None)
        user = User(**validated_data)
        user.set_password(pwd or User.objects.make_random_password())
        user.save()
        return user

    def update(self, instance, validated_data):
        pwd = validated_data.pop('password', None)
        for k,v in validated_data.items():
            setattr(instance, k, v)
        if pwd:
            instance.set_password(pwd)
        instance.save()
        return instance



from rest_framework import serializers
from .models import User
import os

ELEVATED_ROLES = {'REGISTRAR', 'JUDGE', 'ADMIN'}

class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=User.Roles.choices, required=False)
    role_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'password', 'role', 'role_code')

    def validate(self, attrs):
        desired = attrs.get('role') or User.Roles.CLERK
        code = attrs.pop('role_code', '')
        if desired in ELEVATED_ROLES:
            env_name = f'ROLE_CODE_{desired}'
            expected = os.getenv(env_name, '')
            if not expected or code != expected:
                raise serializers.ValidationError({'role': 'Invalid or missing role_code for elevated role.'})
        attrs['role'] = desired
        return attrs

    def create(self, validated_data):
        pwd = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(pwd)
        user.save()
        return user
