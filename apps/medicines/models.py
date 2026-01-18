from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal, InvalidOperation
from django.utils import timezone
from django.conf import settings


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
    manufacturer = models.CharField(max_length=200)
    
    # Supplier information - simplified to CharField
    supplier_name = models.CharField(max_length=200, blank=True)
    
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
    customer_name = models.CharField(max_length=200, blank=True)
    customer_contact = models.CharField(max_length=15, blank=True)
    sale_date = models.DateTimeField(default=timezone.now)
    
    # Prescription details
    doctor_name = models.CharField(max_length=200, blank=True)
    doctor_registration = models.CharField(max_length=50, blank=True)
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
    
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    mrp = models.DecimalField(max_digits=10, decimal_places=2)
    
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


class Cart(models.Model):
    """Shopping cart for users"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart for {self.user.get_full_name()}"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def total_amount(self):
        return sum(item.total_price for item in self.items.all())


class CartItem(models.Model):
    """Individual items in the cart"""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])

    def __str__(self):
        return f"{self.medicine.name} x {self.quantity}"

    @property
    def total_price(self):
        return self.medicine.selling_price * self.quantity


class Notification(models.Model):
    """System notifications for users"""
    NOTIFICATION_TYPES = [
        ('low_stock', 'Low Stock Alert'),
        ('out_of_stock', 'Out of Stock Alert'),
        ('expiring_soon', 'Medicine Expiring Soon'),
        ('expired', 'Medicine Expired'),
        ('new_sale', 'New Sale'),
        ('system', 'System Notification'),
    ]

    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')

    # Related objects (optional)
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, null=True, blank=True)
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, null=True, blank=True)

    # User targeting
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    # Status
    is_read = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    read_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} - {self.user.get_full_name()}"

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['is_active']),
        ]
