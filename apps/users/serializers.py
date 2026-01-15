from rest_framework import serializers
from .models import User, Supplier, Customer, Doctor


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone', 'address', 'date_of_birth', 'employee_id',
            'is_active', 'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        """Create user with hashed password"""
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        """Update user with password hashing if provided"""
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
