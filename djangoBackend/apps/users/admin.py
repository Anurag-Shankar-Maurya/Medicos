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
