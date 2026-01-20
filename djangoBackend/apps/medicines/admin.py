from django.contrib import admin
from .models import Medicine, Sale, SaleItem


class SaleItemInline(admin.TabularInline):
    """Inline admin for sale items"""
    model = SaleItem
    extra = 0
    readonly_fields = ('subtotal', 'discount_amount', 'tax_amount', 'total')
    fields = ('medicine', 'quantity', 'selling_price', 'mrp',
              'gst_percentage', 'discount_percentage', 'subtotal',
              'discount_amount', 'tax_amount', 'total')
    autocomplete_fields = ['medicine']


class MedicineAdmin(admin.ModelAdmin):
    """Admin for medicines with comprehensive management"""

    list_display = ('name', 'medicine_type', 'manufacturer', 'quantity_in_stock', 
                    'selling_price', 'mrp', 'needs_reorder_status',
                    'is_overstocked_status', 'is_active')
    list_filter = ('medicine_type', 'is_active', 'requires_prescription',
                  'is_schedule_h', 'is_schedule_x')
    search_fields = ('name', 'generic_name', 'manufacturer', 'composition',
                    'barcode', 'sku')
    readonly_fields = ('created_at', 'updated_at', 'profit_margin', 
                       'needs_reorder_status', 'is_overstocked_status')
    
    # Enable searching for this model when used in foreign keys (like in SaleItem)
    search_help_text = "Search by Name, Generic Name, Barcode, or SKU"

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'generic_name', 'medicine_type',
                      'manufacturer', 'supplier_name')
        }),
        ('Product Details', {
            'fields': ('composition', 'strength', 'pack_size', 'barcode', 'sku')
        }),
        ('Pricing', {
            'fields': ('purchase_price', 'mrp', 'selling_price',
                      'wholesale_price', 'gst_percentage', 'hsn_code', 'profit_margin')
        }),
        ('Inventory', {
            'fields': ('quantity_in_stock', 'reorder_level', 'max_stock_level',
                      'rack_number', 'shelf_number', 'needs_reorder_status', 'is_overstocked_status')
        }),
        ('Prescription & Safety', {
            'fields': ('requires_prescription', 'is_schedule_h', 'is_schedule_x')
        }),
        ('Additional Information', {
            'fields': ('side_effects', 'usage_instructions')
        }),
        ('Status', {
            'fields': ('is_active', 'created_at', 'updated_at', 'created_by')
        }),
    )

    def needs_reorder_status(self, obj):
        return obj.needs_reorder
    needs_reorder_status.boolean = True
    needs_reorder_status.short_description = "Needs Reorder"

    def is_overstocked_status(self, obj):
        return obj.is_overstocked
    is_overstocked_status.boolean = True
    is_overstocked_status.short_description = "Overstocked"




class SaleAdmin(admin.ModelAdmin):
    """Admin for sales transactions"""

    list_display = ('invoice_number', 'customer_name', 'sale_date', 'total_amount',
                   'payment_method', 'amount_paid', 'doctor_name', 'created_by')
    list_filter = ('payment_method', 'sale_date')
    search_fields = ('invoice_number', 'customer_name', 'customer_contact',
                    'prescription_number', 'doctor_name')
    readonly_fields = ('change_returned', 'created_at', 'updated_at')
    date_hierarchy = 'sale_date'

    fieldsets = (
        (None, {
            'fields': ('invoice_number', 'customer_name', 'customer_contact', 'sale_date')
        }),
        ('Prescription Details', {
            'fields': ('doctor_name', 'doctor_registration', 'prescription_number', 'prescription_image')
        }),
        ('Financial Details', {
            'fields': ('subtotal', 'tax_amount', 'discount', 'total_amount')
        }),
        ('Payment Information', {
            'fields': ('payment_method', 'amount_paid', 'change_returned')
        }),
        ('Loyalty Program', {
            'fields': ('points_earned', 'points_redeemed')
        }),
        ('Additional Details', {
            'fields': ('notes',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'created_by')
        }),
    )

    inlines = [SaleItemInline]

    # Use raw_id_fields for better performance with large datasets
    raw_id_fields = ('created_by',)


# Register remaining models
admin.site.register(Medicine, MedicineAdmin)
admin.site.register(Sale, SaleAdmin)
