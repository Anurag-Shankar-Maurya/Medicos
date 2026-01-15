from rest_framework import serializers
from .models import (
    Category, Medicine, Batch, Purchase, PurchaseItem,
    Sale, SaleItem, StockAdjustment
)


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for medicine categories"""
    subcategories_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'description', 'parent', 'is_active',
            'created_at', 'subcategories_count'
        ]
        read_only_fields = ['created_at']

    def get_subcategories_count(self, obj):
        return obj.subcategories.count()


class BatchSerializer(serializers.ModelSerializer):
    """Serializer for medicine batches"""
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    days_to_expiry = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    is_near_expiry = serializers.SerializerMethodField()

    class Meta:
        model = Batch
        fields = [
            'id', 'medicine', 'medicine_name', 'batch_number',
            'manufacturing_date', 'expiry_date', 'quantity',
            'purchase_price', 'mrp', 'received_date', 'is_active',
            'created_at', 'updated_at', 'days_to_expiry', 'is_expired', 'is_near_expiry'
        ]
        read_only_fields = ['created_at', 'updated_at', 'days_to_expiry', 'is_expired', 'is_near_expiry']

    def get_days_to_expiry(self, obj):
        return obj.days_to_expiry

    def get_is_expired(self, obj):
        return obj.is_expired

    def get_is_near_expiry(self, obj):
        return obj.is_near_expiry


class MedicineSerializer(serializers.ModelSerializer):
    """Serializer for medicines with nested batches"""
    category_name = serializers.ReadOnlyField(source='category.name', default=None)
    supplier_name = serializers.ReadOnlyField(source='supplier.name', default=None)
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name', default=None)
    profit_margin = serializers.SerializerMethodField()
    needs_reorder = serializers.SerializerMethodField()
    is_overstocked = serializers.SerializerMethodField()
    batches = BatchSerializer(many=True, read_only=True)

    class Meta:
        model = Medicine
        fields = [
            'id', 'name', 'generic_name', 'medicine_type', 'category',
            'category_name', 'manufacturer', 'supplier', 'supplier_name',
            'composition', 'strength', 'pack_size', 'purchase_price',
            'mrp', 'selling_price', 'wholesale_price', 'gst_percentage',
            'hsn_code', 'quantity_in_stock', 'reorder_level', 'max_stock_level',
            'rack_number', 'shelf_number', 'requires_prescription',
            'is_schedule_h', 'is_schedule_x', 'side_effects',
            'usage_instructions', 'barcode', 'sku', 'is_active',
            'created_at', 'updated_at', 'created_by', 'created_by_name',
            'profit_margin', 'needs_reorder', 'is_overstocked', 'batches'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'profit_margin', 'needs_reorder', 'is_overstocked']

    def get_profit_margin(self, obj):
        return obj.profit_margin

    def get_needs_reorder(self, obj):
        return obj.needs_reorder

    def get_is_overstocked(self, obj):
        return obj.is_overstocked


class PurchaseItemSerializer(serializers.ModelSerializer):
    """Serializer for purchase items"""
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    subtotal = serializers.SerializerMethodField()
    discount_amount = serializers.SerializerMethodField()
    tax_amount = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseItem
        fields = [
            'id', 'purchase', 'medicine', 'medicine_name', 'batch',
            'quantity', 'free_quantity', 'purchase_price', 'mrp',
            'batch_number', 'expiry_date', 'gst_percentage',
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


class PurchaseSerializer(serializers.ModelSerializer):
    """Serializer for purchases with nested items"""
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    balance_due = serializers.SerializerMethodField()
    items = PurchaseItemSerializer(many=True, read_only=True)

    class Meta:
        model = Purchase
        fields = [
            'id', 'invoice_number', 'supplier', 'supplier_name',
            'purchase_date', 'subtotal', 'tax_amount', 'discount',
            'shipping_charges', 'total_amount', 'payment_method',
            'payment_status', 'amount_paid', 'balance_due',
            'supplier_invoice_number', 'notes', 'created_at',
            'updated_at', 'created_by', 'created_by_name', 'items'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'balance_due']

    def get_balance_due(self, obj):
        return obj.balance_due


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
            'id', 'sale', 'medicine', 'medicine_name', 'batch', 'quantity',
            'selling_price', 'mrp', 'batch_number', 'gst_percentage',
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
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    change_returned = serializers.SerializerMethodField()
    items = SaleItemSerializer(many=True, read_only=True)

    class Meta:
        model = Sale
        fields = [
            'id', 'invoice_number', 'customer', 'customer_name',
            'sale_date', 'doctor', 'doctor_name', 'prescription_number',
            'prescription_image', 'subtotal', 'tax_amount', 'discount',
            'total_amount', 'payment_method', 'amount_paid',
            'change_returned', 'points_earned', 'points_redeemed',
            'notes', 'created_at', 'updated_at', 'created_by',
            'created_by_name', 'items'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'change_returned']

    def get_change_returned(self, obj):
        return obj.change_returned


class StockAdjustmentSerializer(serializers.ModelSerializer):
    """Serializer for stock adjustments"""
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    batch_number = serializers.CharField(source='batch.batch_number', read_only=True)
    adjusted_by_name = serializers.CharField(source='adjusted_by.get_full_name', read_only=True)

    class Meta:
        model = StockAdjustment
        fields = [
            'id', 'medicine', 'medicine_name', 'batch', 'batch_number',
            'adjustment_type', 'quantity', 'reason', 'adjustment_date',
            'adjusted_by', 'adjusted_by_name', 'created_at'
        ]
        read_only_fields = ['created_at', 'adjusted_by']

    def create(self, validated_data):
        """Set adjusted_by when creating adjustment"""
        validated_data['adjusted_by'] = self.context['request'].user
        return super().create(validated_data)
