from rest_framework import serializers
from .models import Medicine, Sale, SaleItem

class MedicineSerializer(serializers.ModelSerializer):
    """Serializer for medicines"""
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name', default=None)
    profit_margin = serializers.SerializerMethodField()
    needs_reorder = serializers.SerializerMethodField()
    is_overstocked = serializers.SerializerMethodField()

    class Meta:
        model = Medicine
        fields = [
            'id', 'name', 'generic_name', 'medicine_type',
            'manufacturer', 'supplier_name',
            'composition', 'strength', 'pack_size', 'purchase_price',
            'mrp', 'selling_price', 'wholesale_price', 'gst_percentage',
            'hsn_code', 'quantity_in_stock', 'reorder_level', 'max_stock_level',
            'rack_number', 'shelf_number', 'requires_prescription',
            'is_schedule_h', 'is_schedule_x', 'side_effects',
            'usage_instructions', 'barcode', 'sku', 'is_active',
            'created_at', 'updated_at', 'created_by', 'created_by_name',
            'profit_margin', 'needs_reorder', 'is_overstocked'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'profit_margin', 'needs_reorder', 'is_overstocked']

    def get_profit_margin(self, obj):
        return obj.profit_margin

    def get_needs_reorder(self, obj):
        return obj.needs_reorder

    def get_is_overstocked(self, obj):
        return obj.is_overstocked


class SaleItemSerializer(serializers.ModelSerializer):
    """Serializer for sale items"""
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    subtotal = serializers.SerializerMethodField()
    discount_amount = serializers.SerializerMethodField()
    tax_amount = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()

    class Meta:
        model = SaleItem
        fields = [
            'id', 'sale', 'medicine', 'medicine_name', 'quantity',
            'selling_price', 'mrp', 'gst_percentage',
            'discount_percentage', 'subtotal', 'discount_amount',
            'tax_amount', 'total'
        ]

    def get_subtotal(self, obj):
        return obj.subtotal

    def get_discount_amount(self, obj):
        return obj.discount_amount

    def get_tax_amount(self, obj):
        return obj.tax_amount

    def get_total(self, obj):
        return obj.total


class SaleSerializer(serializers.ModelSerializer):
    """Serializer for sales with nested items"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    change_returned = serializers.SerializerMethodField()
    items = SaleItemSerializer(many=True, read_only=True)

    class Meta:
        model = Sale
        fields = [
            'id', 'invoice_number', 'customer_name', 'customer_contact',
            'sale_date', 'doctor_name', 'doctor_registration', 'prescription_number',
            'prescription_image', 'subtotal', 'tax_amount', 'discount',
            'total_amount', 'payment_method', 'amount_paid',
            'change_returned', 'points_earned', 'points_redeemed',
            'notes', 'created_at', 'updated_at', 'created_by',
            'created_by_name', 'items'
        ]
        read_only_fields = [
            'invoice_number', 'subtotal', 'tax_amount', 'amount_paid',
            'change_returned', 'created_at', 'updated_at', 'created_by'
        ]

    def get_change_returned(self, obj):
        return obj.change_returned
