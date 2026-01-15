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


class SupplierSerializer(serializers.ModelSerializer):
    """Serializer for Supplier model"""

    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Supplier
        fields = [
            'id', 'name', 'contact_person', 'phone', 'email', 'address',
            'gstin', 'pan_number', 'drug_license_number',
            'credit_period_days', 'credit_limit',
            'is_active', 'created_at', 'updated_at',
            'created_by', 'created_by_name'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by']


class CustomerSerializer(serializers.ModelSerializer):
    """Serializer for Customer model"""

    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'customer_type', 'phone', 'email', 'address',
            'doctor_name', 'allergies', 'loyalty_points', 'total_purchases',
            'created_at', 'updated_at', 'created_by', 'created_by_name'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'total_purchases']


class DoctorSerializer(serializers.ModelSerializer):
    """Serializer for Doctor model"""

    class Meta:
        model = Doctor
        fields = [
            'id', 'name', 'registration_number', 'specialization',
            'phone', 'email', 'clinic_hospital_name', 'address',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
