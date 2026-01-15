from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator


class User(AbstractUser):
    """Custom user model for staff members"""
    USER_ROLES = [
        ('admin', 'Administrator'),
        ('pharmacist', 'Pharmacist'),
        ('cashier', 'Cashier'),
        ('manager', 'Manager'),
    ]
    
    role = models.CharField(max_length=20, choices=USER_ROLES, default='cashier')
    phone = models.CharField(
        max_length=15,
        validators=[RegexValidator(r'^\+?1?\d{9,15}$')],
        blank=True
    )
    address = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    employee_id = models.CharField(max_length=20, unique=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"

    class Meta:
        ordering = ['first_name', 'last_name']


class Supplier(models.Model):
    """Medicine suppliers/vendors"""
    name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    address = models.TextField()
    
    # Business details
    gstin = models.CharField(
        max_length=15,
        blank=True,
        help_text="GST Identification Number",
        validators=[RegexValidator(r'^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$')]
    )
    pan_number = models.CharField(max_length=10, blank=True)
    drug_license_number = models.CharField(max_length=50, blank=True)
    
    # Payment terms
    credit_period_days = models.IntegerField(default=0, help_text="Credit period in days")
    credit_limit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    # Tracking
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='suppliers_created'
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['is_active']),
        ]


class Customer(models.Model):
    """Store customers/patients"""
    CUSTOMER_TYPES = [
        ('regular', 'Regular'),
        ('wholesale', 'Wholesale'),
        ('hospital', 'Hospital/Clinic'),
    ]
    
    name = models.CharField(max_length=200)
    customer_type = models.CharField(max_length=20, choices=CUSTOMER_TYPES, default='regular')
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    
    # Medical details
    doctor_name = models.CharField(max_length=200, blank=True, help_text="Regular prescribing doctor")
    allergies = models.TextField(blank=True, help_text="Known drug allergies")
    
    # Loyalty program
    loyalty_points = models.IntegerField(default=0)
    total_purchases = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='customers_created'
    )

    def __str__(self):
        return f"{self.name} - {self.phone}"

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['phone']),
            models.Index(fields=['name']),
        ]


class Doctor(models.Model):
    """Prescribing doctors database"""
    SPECIALIZATIONS = [
        ('general', 'General Practitioner'),
        ('pediatrics', 'Pediatrics'),
        ('cardiology', 'Cardiology'),
        ('dermatology', 'Dermatology'),
        ('orthopedics', 'Orthopedics'),
        ('gynecology', 'Gynecology'),
        ('psychiatry', 'Psychiatry'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=200)
    registration_number = models.CharField(max_length=50, unique=True)
    specialization = models.CharField(max_length=50, choices=SPECIALIZATIONS)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    clinic_hospital_name = models.CharField(max_length=200, blank=True)
    address = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Dr. {self.name} ({self.specialization})"

    class Meta:
        ordering = ['name']