from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import User, Supplier, Customer, Doctor
from .serializers import (
    UserSerializer, SupplierSerializer,
    CustomerSerializer, DoctorSerializer
)


# User Views
class UserListCreateView(generics.ListCreateAPIView):
    """List all users or create a new user"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter users based on role if not admin"""
        user = self.request.user
        if user.role == 'admin':
            return User.objects.all()
        return User.objects.filter(id=user.id)

    def perform_create(self, serializer):
        """Set created_by when creating user"""
        serializer.save(created_by=self.request.user)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a user"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Allow users to access only their own data unless admin"""
        user = self.request.user
        if user.role == 'admin':
            return User.objects.all()
        return User.objects.filter(id=user.id)


# Supplier Views
class SupplierListCreateView(generics.ListCreateAPIView):
    """List all suppliers or create a new supplier"""
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """Set created_by when creating supplier"""
        serializer.save(created_by=self.request.user)


class SupplierDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a supplier"""
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]


# Customer Views
class CustomerListCreateView(generics.ListCreateAPIView):
    """List all customers or create a new customer"""
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """Set created_by when creating customer"""
        serializer.save(created_by=self.request.user)


class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a customer"""
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]


# Doctor Views
class DoctorListCreateView(generics.ListCreateAPIView):
    """List all doctors or create a new doctor"""
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]


class DoctorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a doctor"""
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]


# Authentication Views
@api_view(['POST'])
def login_view(request):
    """User login endpoint"""
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)

    if user:
        # Update last login
        user.last_login = timezone.now()
        user.save()
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """User logout endpoint"""
    # In a real implementation, you might want to blacklist tokens
    # For now, we'll just return a success response
    return Response(
        {'message': 'Logged out successfully'},
        status=status.HTTP_200_OK
    )
