from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import (
    Category, Medicine, Batch, Purchase, PurchaseItem,
    Sale, SaleItem, StockAdjustment
)


class CategoryAdmin(admin.ModelAdmin):
    """Admin for medicine categories with hierarchical display"""

    list_display = ('name', 'parent', 'is_active', 'created_at', 'subcategories_count')
    list_filter = ('is_active', 'parent')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at',)

    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'parent')
        }),
        ('Status', {
            'fields': ('is_active', 'created_at')
        }),
    )

    def subcategories_count(self, obj):
        return obj.subcategories.count()
    subcategories_count.short_description = "Subcategories"

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('subcategories')


class BatchInline(admin.TabularInline):
    """Inline admin for medicine batches"""
    model = Batch
    extra = 0
    readonly_fields = ('days_to_expiry', 'is_expired', 'is_near_expiry')
    fields = ('batch_number', 'manufacturing_date', 'expiry_date', 'quantity',
              'purchase_price', 'mrp', 'days_to_expiry', 'is_near_expiry', 'is_expired')

    def days_to_expiry(self, obj):
        return obj.days_to_expiry
    days_to_expiry.short_description = "Days to Expiry"

    def is_near_expiry(self, obj):
        return obj.is_near_expiry
    is_near_expiry.boolean = True
    is_near_expiry.short_description = "Near Expiry"

    def is_expired(self, obj):
        return obj.is_expired
    is_expired.boolean = True


class PurchaseItemInline(admin.TabularInline):
    """Inline admin for purchase items"""
    model = PurchaseItem
    extra = 0
    readonly_fields = ('subtotal', 'discount_amount', 'tax_amount', 'total')
    fields = ('medicine', 'batch_number', 'quantity', 'free_quantity',
              'purchase_price', 'mrp', 'gst_percentage', 'discount_percentage',
              'subtotal', 'discount_amount', 'tax_amount', 'total')


class SaleItemInline(admin.TabularInline):
    """Inline admin for sale items"""
    model = SaleItem
    extra = 0
    readonly_fields = ('subtotal', 'discount_amount', 'tax_amount', 'total')
    fields = ('medicine', 'batch_number', 'quantity', 'selling_price', 'mrp',
              'gst_percentage', 'discount_percentage', 'subtotal',
              'discount_amount', 'tax_amount', 'total')


class MedicineAdmin(admin.ModelAdmin):
    """Admin for medicines with comprehensive management"""

    list_display = ('name', 'medicine_type', 'category', 'manufacturer',
                   'quantity_in_stock', 'selling_price', 'mrp', 'needs_reorder_status',
                   'is_overstocked_status', 'is_active')
    list_filter = ('medicine_type', 'category', 'is_active', 'requires_prescription',
                  'is_schedule_h', 'is_schedule_x', 'supplier')
    search_fields = ('name', 'generic_name', 'manufacturer', 'composition',
                    'barcode', 'sku')
    readonly_fields = ('created_at', 'updated_at', 'profit_margin', 'needs_reorder_status', 'is_overstocked_status')

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'generic_name', 'medicine_type', 'category',
                      'manufacturer', 'supplier')
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
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )

    inlines = [BatchInline]

    def needs_reorder_status(self, obj):
        return obj.needs_reorder
    needs_reorder_status.boolean = True
    needs_reorder_status.short_description = "Needs Reorder"

    def is_overstocked_status(self, obj):
        return obj.is_overstocked
    is_overstocked_status.boolean = True
    is_overstocked_status.short_description = "Overstocked"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('category', 'supplier')


class BatchAdmin(admin.ModelAdmin):
    """Admin for medicine batches with expiry tracking"""

    list_display = ('medicine', 'batch_number', 'manufacturing_date', 'expiry_date',
                   'quantity', 'mrp', 'days_to_expiry', 'is_near_expiry', 'is_expired', 'is_active')
    list_filter = ('is_active', 'manufacturing_date', 'expiry_date')
    search_fields = ('medicine__name', 'batch_number')
    readonly_fields = ('days_to_expiry', 'is_expired', 'is_near_expiry', 'created_at', 'updated_at')
    date_hierarchy = 'expiry_date'

    fieldsets = (
        (None, {
            'fields': ('medicine', 'batch_number', 'manufacturing_date', 'expiry_date')
        }),
        ('Inventory', {
            'fields': ('quantity', 'purchase_price', 'mrp')
        }),
        ('Status', {
            'fields': ('received_date', 'is_active', 'days_to_expiry',
                      'is_near_expiry', 'is_expired', 'created_at', 'updated_at')
        }),
    )

    def days_to_expiry(self, obj):
        return obj.days_to_expiry
    days_to_expiry.short_description = "Days to Expiry"

    def is_near_expiry(self, obj):
        return obj.is_near_expiry
    is_near_expiry.boolean = True

    def is_expired(self, obj):
        return obj.is_expired
    is_expired.boolean = True

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('medicine')


class PurchaseAdmin(admin.ModelAdmin):
    """Admin for purchase orders"""

    list_display = ('invoice_number', 'supplier', 'purchase_date', 'total_amount',
                   'payment_status', 'amount_paid', 'balance_due', 'created_by')
    list_filter = ('payment_status', 'payment_method', 'purchase_date', 'supplier')
    search_fields = ('invoice_number', 'supplier__name', 'supplier_invoice_number')
    readonly_fields = ('balance_due', 'created_at', 'updated_at')
    date_hierarchy = 'purchase_date'

    fieldsets = (
        (None, {
            'fields': ('invoice_number', 'supplier', 'purchase_date')
        }),
        ('Financial Details', {
            'fields': ('subtotal', 'tax_amount', 'discount', 'shipping_charges', 'total_amount')
        }),
        ('Payment Information', {
            'fields': ('payment_method', 'payment_status', 'amount_paid', 'balance_due')
        }),
        ('Additional Details', {
            'fields': ('supplier_invoice_number', 'notes')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'created_by')
        }),
    )

    inlines = [PurchaseItemInline]

    def balance_due(self, obj):
        return obj.balance_due
    balance_due.short_description = "Balance Due"

    raw_id_fields = ('supplier', 'created_by')


class SaleAdmin(admin.ModelAdmin):
    """Admin for sales transactions"""

    list_display = ('invoice_number', 'customer', 'sale_date', 'total_amount',
                   'payment_method', 'amount_paid', 'doctor', 'created_by')
    list_filter = ('payment_method', 'sale_date', 'customer', 'doctor')
    search_fields = ('invoice_number', 'customer__name', 'customer__phone',
                    'prescription_number', 'doctor__name')
    readonly_fields = ('change_returned', 'created_at', 'updated_at')
    date_hierarchy = 'sale_date'

    fieldsets = (
        (None, {
            'fields': ('invoice_number', 'customer', 'sale_date')
        }),
        ('Prescription Details', {
            'fields': ('doctor', 'prescription_number', 'prescription_image')
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

    raw_id_fields = ('customer', 'doctor', 'created_by')


class StockAdjustmentAdmin(admin.ModelAdmin):
    """Admin for stock adjustments"""

    list_display = ('medicine', 'batch', 'adjustment_type', 'quantity',
                   'adjustment_date', 'adjusted_by')
    list_filter = ('adjustment_type', 'adjustment_date', 'adjusted_by')
    search_fields = ('medicine__name', 'batch__batch_number', 'reason')
    readonly_fields = ('created_at',)
    date_hierarchy = 'adjustment_date'

    fieldsets = (
        (None, {
            'fields': ('medicine', 'batch', 'adjustment_type', 'quantity')
        }),
        ('Details', {
            'fields': ('reason', 'adjustment_date', 'adjusted_by')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )

    raw_id_fields = ('medicine', 'batch', 'adjusted_by')


# Register all models
admin.site.register(Category, CategoryAdmin)
admin.site.register(Medicine, MedicineAdmin)
admin.site.register(Batch, BatchAdmin)
admin.site.register(Purchase, PurchaseAdmin)
admin.site.register(Sale, SaleAdmin)
admin.site.register(StockAdjustment, StockAdjustmentAdmin)
