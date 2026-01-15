from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Supplier, Customer, Doctor


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """Custom admin for User model with additional fields"""

    # Add custom fields to fieldsets
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('role', 'phone', 'address', 'date_of_birth', 'employee_id')
        }),
        ('Status', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    # Add custom fields to list display
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'employee_id', 'is_active', 'created_at')

    # Add search fields
    search_fields = ('username', 'email', 'first_name', 'last_name', 'employee_id', 'phone')

    # Add list filters
    list_filter = ('role', 'is_active', 'is_staff', 'is_superuser', 'date_joined')

    # Make timestamps readonly
    readonly_fields = ('created_at', 'updated_at')

    # Add date hierarchy
    date_hierarchy = 'date_joined'

    # Order by creation date (newest first)
    ordering = ('-date_joined',)


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    """Admin for Supplier model"""

    # List display fields
    list_display = ('name', 'contact_person', 'phone', 'email', 'gstin', 'is_active', 'created_at')

    # Search fields
    search_fields = ('name', 'contact_person', 'phone', 'email', 'gstin', 'pan_number', 'drug_license_number')

    # List filters
    list_filter = ('is_active', 'credit_period_days')

    # Fieldsets for organized form display
    fieldsets = (
        (None, {
            'fields': ('name', 'contact_person', 'phone', 'email', 'address')
        }),
        ('Business Details', {
            'fields': ('gstin', 'pan_number', 'drug_license_number')
        }),
        ('Payment Terms', {
            'fields': ('credit_period_days', 'credit_limit')
        }),
        ('Status', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )

    # Readonly fields
    readonly_fields = ('created_at', 'updated_at')

    # Date hierarchy
    date_hierarchy = 'created_at'

    # Ordering
    ordering = ('name',)


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    """Admin for Customer model"""

    # List display fields
    list_display = ('name', 'customer_type', 'phone', 'email', 'loyalty_points', 'total_purchases', 'created_at')

    # Search fields
    search_fields = ('name', 'phone', 'email', 'doctor_name')

    # List filters
    list_filter = ('customer_type', 'loyalty_points')

    # Fieldsets for organized form display
    fieldsets = (
        (None, {
            'fields': ('name', 'customer_type', 'phone', 'email', 'address')
        }),
        ('Medical Information', {
            'fields': ('doctor_name', 'allergies')
        }),
        ('Loyalty Program', {
            'fields': ('loyalty_points', 'total_purchases')
        }),
        ('Status', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    # Readonly fields
    readonly_fields = ('created_at', 'updated_at', 'total_purchases')

    # Date hierarchy
    date_hierarchy = 'created_at'

    # Ordering (newest first)
    ordering = ('-created_at',)


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    """Admin for Doctor model"""

    # List display fields
    list_display = ('name', 'registration_number', 'specialization', 'phone', 'email', 'clinic_hospital_name', 'is_active')

    # Search fields
    search_fields = ('name', 'registration_number', 'phone', 'email', 'clinic_hospital_name')

    # List filters
    list_filter = ('specialization', 'is_active')

    # Fieldsets for organized form display
    fieldsets = (
        (None, {
            'fields': ('name', 'registration_number', 'specialization')
        }),
        ('Contact Information', {
            'fields': ('phone', 'email', 'clinic_hospital_name', 'address')
        }),
        ('Status', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )

    # Readonly fields
    readonly_fields = ('created_at', 'updated_at')

    # Date hierarchy
    date_hierarchy = 'created_at'

    # Ordering
    ordering = ('name',)
