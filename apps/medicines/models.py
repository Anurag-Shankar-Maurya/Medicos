from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from django.utils import timezone
from django.conf import settings


class Category(models.Model):
    """Medicine categories for organization"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subcategories'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']


class Medicine(models.Model):
    """Core medicine/product model"""
    MEDICINE_TYPES = [
        ('tablet', 'Tablet'),
        ('capsule', 'Capsule'),
        ('syrup', 'Syrup'),
        ('injection', 'Injection'),
        ('ointment', 'Ointment'),
        ('drops', 'Drops'),
        ('cream', 'Cream'),
        ('gel', 'Gel'),
        ('powder', 'Powder'),
        ('inhaler', 'Inhaler'),
        ('other', 'Other'),
    ]

    # Basic information
    name = models.CharField(max_length=200)
    generic_name = models.CharField(max_length=200, blank=True)
    medicine_type = models.CharField(max_length=20, choices=MEDICINE_TYPES)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='medicines')
    manufacturer = models.CharField(max_length=200)
    
    # Supplier relationship - import from users app
    supplier = models.ForeignKey(
        'users.Supplier',
        on_delete=models.SET_NULL,
        null=True,
        related_name='medicines'
    )
    
    # Product details
    composition = models.TextField(blank=True, help_text="Chemical composition")
    strength = models.CharField(max_length=50, blank=True, help_text="e.g., 500mg, 10ml")
    pack_size = models.CharField(max_length=50, blank=True, help_text="e.g., 10 tablets, 100ml bottle")
    
    # Pricing
    purchase_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    mrp = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Maximum Retail Price"
    )
    selling_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    wholesale_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        default=Decimal('0.00')
    )
    
    # Tax
    gst_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('12.00')
    )
    hsn_code = models.CharField(max_length=8, blank=True, help_text="HSN/SAC code for GST")
    
    # Inventory
    quantity_in_stock = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    reorder_level = models.IntegerField(default=10, help_text="Minimum stock level before reorder")
    max_stock_level = models.IntegerField(default=100, help_text="Maximum stock level")
    
    # Storage location
    rack_number = models.CharField(max_length=20, blank=True, help_text="Storage location")
    shelf_number = models.CharField(max_length=20, blank=True)
    
    # Prescription requirement
    requires_prescription = models.BooleanField(default=False)
    is_schedule_h = models.BooleanField(default=False, help_text="Schedule H drug")
    is_schedule_x = models.BooleanField(default=False, help_text="Schedule X drug")
    
    # Additional information
    side_effects = models.TextField(blank=True)
    usage_instructions = models.TextField(blank=True)
    
    # Metadata
    barcode = models.CharField(max_length=50, blank=True, unique=True)
    sku = models.CharField(max_length=50, blank=True, unique=True, help_text="Stock Keeping Unit")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='medicines_created'
    )

    def __str__(self):
        return f"{self.name} ({self.strength}) - {self.medicine_type}"

    @property
    def needs_reorder(self):
        return self.quantity_in_stock <= self.reorder_level

    @property
    def is_overstocked(self):
        return self.quantity_in_stock > self.max_stock_level

    @property
    def profit_margin(self):
        """Return profit margin percentage safely when prices are present."""
        if self.purchase_price is None or self.selling_price is None:
            return Decimal('0.00')
        try:
            if self.purchase_price > 0:
                return ((self.selling_price - self.purchase_price) / self.purchase_price) * 100
        except (TypeError, InvalidOperation):
            return Decimal('0.00')
        return Decimal('0.00')

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['barcode']),
            models.Index(fields=['sku']),
            models.Index(fields=['is_active']),
        ]


class Batch(models.Model):
    """Medicine batch tracking for expiry and inventory management"""
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name='batches')
    batch_number = models.CharField(max_length=50)
    manufacturing_date = models.DateField()
    expiry_date = models.DateField()
    
    quantity = models.IntegerField(validators=[MinValueValidator(0)])
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    mrp = models.DecimalField(max_digits=10, decimal_places=2)
    
    received_date = models.DateField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.medicine.name} - Batch {self.batch_number}"

    @property
    def is_expired(self):
        if not self.expiry_date:
            return False
        return self.expiry_date < timezone.now().date()

    @property
    def days_to_expiry(self):
        if not self.expiry_date:
            return None
        delta = self.expiry_date - timezone.now().date()
        return delta.days

    @property
    def is_near_expiry(self):
        """Check if batch expires within 90 days"""
        d = self.days_to_expiry
        return d is not None and 0 < d <= 90

    class Meta:
        verbose_name_plural = "Batches"
        ordering = ['expiry_date']
        unique_together = ['medicine', 'batch_number']
        indexes = [
            models.Index(fields=['expiry_date']),
            models.Index(fields=['batch_number']),
        ]


class Purchase(models.Model):
    """Purchase orders from suppliers"""
    PAYMENT_METHODS = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('upi', 'UPI'),
        ('bank_transfer', 'Bank Transfer'),
        ('cheque', 'Cheque'),
        ('credit', 'Credit'),
    ]

    PAYMENT_STATUS = [
        ('paid', 'Paid'),
        ('partial', 'Partially Paid'),
        ('unpaid', 'Unpaid'),
    ]

    invoice_number = models.CharField(max_length=50, unique=True)
    supplier = models.ForeignKey('users.Supplier', on_delete=models.PROTECT, related_name='purchases')
    purchase_date = models.DateTimeField(default=timezone.now)
    
    # Payment details
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    shipping_charges = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='unpaid')
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    # Additional details
    supplier_invoice_number = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='purchases_created'
    )

    def __str__(self):
        return f"Purchase {self.invoice_number} - {self.supplier.name}"

    @property
    def balance_due(self):
        return self.total_amount - self.amount_paid

    class Meta:
        ordering = ['-purchase_date']
        indexes = [
            models.Index(fields=['invoice_number']),
            models.Index(fields=['purchase_date']),
        ]


class PurchaseItem(models.Model):
    """Individual items in a purchase order"""
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, related_name='items')
    medicine = models.ForeignKey(Medicine, on_delete=models.PROTECT)
    batch = models.ForeignKey(Batch, on_delete=models.SET_NULL, null=True, blank=True)
    
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    free_quantity = models.IntegerField(default=0, help_text="Bonus/free items")
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    mrp = models.DecimalField(max_digits=10, decimal_places=2)
    
    batch_number = models.CharField(max_length=50)
    expiry_date = models.DateField()
    
    gst_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.medicine.name} x {self.quantity}"

    def save(self, *args, **kwargs):
        self.subtotal = self.purchase_price * self.quantity
        self.discount_amount = (self.subtotal * self.discount_percentage) / 100
        taxable_amount = self.subtotal - self.discount_amount
        self.tax_amount = (taxable_amount * self.gst_percentage) / 100
        self.total = taxable_amount + self.tax_amount
        super().save(*args, **kwargs)


class Sale(models.Model):
    """Sales/billing transactions"""
    PAYMENT_METHODS = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('upi', 'UPI'),
        ('bank_transfer', 'Bank Transfer'),
        ('insurance', 'Insurance'),
    ]

    invoice_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(
        'users.Customer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sales'
    )
    sale_date = models.DateTimeField(default=timezone.now)
    
    # Prescription details
    doctor = models.ForeignKey(
        'users.Doctor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='prescriptions'
    )
    prescription_number = models.CharField(max_length=50, blank=True)
    prescription_image = models.ImageField(upload_to='media/prescriptions/', blank=True)
    
    # Payment details
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    change_returned = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    # Loyalty points
    points_earned = models.IntegerField(default=0)
    points_redeemed = models.IntegerField(default=0)
    
    notes = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sales_created'
    )

    def __str__(self):
        return f"Sale {self.invoice_number}"

    class Meta:
        ordering = ['-sale_date']
        indexes = [
            models.Index(fields=['invoice_number']),
            models.Index(fields=['sale_date']),
        ]


class SaleItem(models.Model):
    """Individual items in a sale"""
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    medicine = models.ForeignKey(Medicine, on_delete=models.PROTECT)
    batch = models.ForeignKey(Batch, on_delete=models.SET_NULL, null=True)
    
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    mrp = models.DecimalField(max_digits=10, decimal_places=2)
    
    batch_number = models.CharField(max_length=50)
    
    gst_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.medicine.name} x {self.quantity}"

    def save(self, *args, **kwargs):
        self.subtotal = self.selling_price * self.quantity
        self.discount_amount = (self.subtotal * self.discount_percentage) / 100
        taxable_amount = self.subtotal - self.discount_amount
        self.tax_amount = (taxable_amount * self.gst_percentage) / 100
        self.total = taxable_amount + self.tax_amount
        super().save(*args, **kwargs)


class StockAdjustment(models.Model):
    """Track inventory adjustments"""
    ADJUSTMENT_TYPES = [
        ('add', 'Stock Added'),
        ('remove', 'Stock Removed'),
        ('damage', 'Damaged'),
        ('expired', 'Expired'),
        ('return_supplier', 'Return to Supplier'),
        ('return_customer', 'Customer Return'),
        ('loss', 'Loss/Theft'),
        ('found', 'Found'),
        ('correction', 'Stock Correction'),
    ]

    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name='stock_adjustments')
    batch = models.ForeignKey(Batch, on_delete=models.SET_NULL, null=True, blank=True)
    adjustment_type = models.CharField(max_length=20, choices=ADJUSTMENT_TYPES)
    quantity = models.IntegerField()
    reason = models.TextField()
    
    adjustment_date = models.DateTimeField(default=timezone.now)
    adjusted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='stock_adjustments'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.medicine.name} - {self.adjustment_type} ({self.quantity})"

    class Meta:
        ordering = ['-adjustment_date']
        indexes = [
            models.Index(fields=['adjustment_date']),
            models.Index(fields=['adjustment_type']),
        ]