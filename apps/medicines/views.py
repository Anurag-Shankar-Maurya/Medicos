from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, F, Sum, Count, Avg
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
import uuid
from decimal import Decimal

from .models import Medicine, Sale, SaleItem, Cart, CartItem
from .serializers import MedicineSerializer, SaleSerializer, SaleItemSerializer, CartSerializer, CartItemSerializer

# ==========================================
# VIEWSETS (CRUD OPERATIONS)
# ==========================================

class MedicineViewSet(viewsets.ModelViewSet):
    """ViewSet for medicines"""
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Medicine.objects.select_related('created_by')
        search = self.request.query_params.get('search', None)
        medicine_type = self.request.query_params.get('medicine_type', None)
        is_active = self.request.query_params.get('is_active', None)

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(generic_name__icontains=search) |
                Q(manufacturer__icontains=search) |
                Q(barcode__icontains=search) |
                Q(sku__icontains=search)
            )
        if medicine_type:
            queryset = queryset.filter(medicine_type=medicine_type)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        return queryset.order_by('name')

    def perform_create(self, serializer):
        """Set created_by when creating medicine"""
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get medicines that need reorder (Active & Stock <= Reorder Level)"""
        medicines = self.get_queryset().filter(
            quantity_in_stock__lte=F('reorder_level'),
            is_active=True
        ).annotate(
            shortage=F('reorder_level') - F('quantity_in_stock')
        )
        serializer = self.get_serializer(medicines, many=True)
        return Response(serializer.data)


class SaleViewSet(viewsets.ModelViewSet):
    """ViewSet for sales"""
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated]
    ordering_fields = ['sale_date', 'total_amount', 'customer_name', 'created_at']
    ordering = ['-sale_date']

    def get_queryset(self):
        queryset = Sale.objects.select_related('created_by').prefetch_related('items__medicine')
        customer = self.request.query_params.get('customer', None)
        doctor = self.request.query_params.get('doctor', None)
        payment_method = self.request.query_params.get('payment_method', None)
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)

        if customer:
            queryset = queryset.filter(customer_name__icontains=customer)
        if doctor:
            queryset = queryset.filter(doctor_name__icontains=doctor)
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        if start_date:
            queryset = queryset.filter(sale_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(sale_date__lte=end_date)

        return queryset.order_by('-sale_date')

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Custom create method to handle:
        1. Atomic transaction
        2. Stock deduction from Medicine model
        3. Calculations for Tax and Totals
        """
        data = request.data.copy()
        items_data = data.pop('items', [])
        
        if not items_data:
            return Response({"error": "No items in sale"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Validation Logic & Stock Check
        items_to_process = []
        total_subtotal = Decimal('0.00')
        total_tax = Decimal('0.00')

        for item_data in items_data:
            try:
                # Lock the medicine row for update to prevent race conditions
                medicine = Medicine.objects.select_for_update().get(id=item_data['medicine_id'])
            except (Medicine.DoesNotExist, KeyError):
                return Response({"error": f"Medicine ID {item_data.get('medicine_id')} not found"}, status=status.HTTP_400_BAD_REQUEST)
            
            qty = int(item_data['quantity'])
            if qty <= 0:
                return Response({"error": f"Quantity must be greater than 0 for {medicine.name}"}, status=status.HTTP_400_BAD_REQUEST)
            
            if medicine.quantity_in_stock < qty:
                 return Response({"error": f"Insufficient stock for {medicine.name} (Available: {medicine.quantity_in_stock})"}, status=status.HTTP_400_BAD_REQUEST)

            price = Decimal(str(item_data['price']))
            
            # Calculations
            item_subtotal = price * qty
            # Assuming price is exclusive of tax for calculation base, or inclusive? 
            # Logic here assumes Price is the unit selling price, Tax is calculated on top.
            item_tax = (item_subtotal * medicine.gst_percentage) / 100
            
            total_subtotal += item_subtotal
            total_tax += item_tax
            
            items_to_process.append({
                'medicine': medicine,
                'quantity': qty,
                'price': price,
                'gst_percentage': medicine.gst_percentage
            })

        # 2. Create Sale Header
        if not data.get('invoice_number'):
            data['invoice_number'] = f"INV-{uuid.uuid4().hex[:8].upper()}"
        
        data['subtotal'] = total_subtotal
        data['tax_amount'] = total_tax
        data['total_amount'] = total_subtotal + total_tax
        if not data.get('amount_paid'):
            data['amount_paid'] = data['total_amount']

        sale_serializer = self.get_serializer(data=data)
        if not sale_serializer.is_valid():
            return Response(sale_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        sale = sale_serializer.save(
            created_by=self.request.user,
            invoice_number=data['invoice_number'],
            subtotal=data['subtotal'],
            tax_amount=data['tax_amount'],
            total_amount=data['total_amount'],
            amount_paid=data['amount_paid']
        )

        # 3. Create Sale Items and Deduct Stock
        final_total = Decimal('0.00')
        final_tax = Decimal('0.00')
        final_subtotal = Decimal('0.00')

        for item in items_to_process:
            si = SaleItem.objects.create(
                sale=sale,
                medicine=item['medicine'],
                quantity=item['quantity'],
                selling_price=item['price'],
                mrp=item['medicine'].mrp,
                gst_percentage=item['gst_percentage']
            )
            
            final_subtotal += si.subtotal
            final_tax += si.tax_amount
            final_total += si.total
            
            # Deduct Stock
            item['medicine'].quantity_in_stock -= item['quantity']
            item['medicine'].save()

        # Update sale header with finalized numbers (in case of rounding diffs)
        sale.subtotal = final_subtotal
        sale.tax_amount = final_tax
        sale.total_amount = final_total
        if not data.get('amount_paid'):
            sale.amount_paid = final_total
        sale.save()

        return Response(self.get_serializer(sale).data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        """Set created_by when creating sale"""
        serializer.save(created_by=self.request.user)


class SaleItemViewSet(viewsets.ModelViewSet):
    """ViewSet for sale items"""
    queryset = SaleItem.objects.all()
    serializer_class = SaleItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = SaleItem.objects.select_related('sale', 'medicine')
        sale = self.request.query_params.get('sale', None)
        medicine = self.request.query_params.get('medicine', None)

        if sale:
            queryset = queryset.filter(sale_id=sale)
        if medicine:
            queryset = queryset.filter(medicine_id=medicine)

        return queryset.order_by('-id')


class CartViewSet(viewsets.ModelViewSet):
    """ViewSet for shopping cart"""
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user).prefetch_related('items__medicine')

    def list(self, request, *args, **kwargs):
        """Return the user's cart, creating it if it doesn't exist"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart = self.get_queryset().filter(id=cart.id).first()
        if cart:
            serializer = self.get_serializer(cart)
            return Response(serializer.data)
        return Response({"detail": "Cart not found"}, status=status.HTTP_404_NOT_FOUND)

    def get_object(self):
        """Get or create cart for the user"""
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Add medicine to cart"""
        medicine_id = request.data.get('medicine_id')
        quantity = request.data.get('quantity', 1)

        try:
            medicine = Medicine.objects.get(id=medicine_id, is_active=True)
        except Medicine.DoesNotExist:
            return Response({"error": "Medicine not found"}, status=status.HTTP_404_NOT_FOUND)

        if quantity <= 0:
            return Response({"error": "Quantity must be greater than 0"}, status=status.HTTP_400_BAD_REQUEST)

        if medicine.quantity_in_stock < quantity:
            return Response({"error": f"Insufficient stock. Available: {medicine.quantity_in_stock}"}, status=status.HTTP_400_BAD_REQUEST)

        cart, created = Cart.objects.get_or_create(user=request.user)

        cart_item, item_created = CartItem.objects.get_or_create(
            cart=cart,
            medicine=medicine,
            defaults={'quantity': quantity}
        )

        if not item_created:
            new_quantity = cart_item.quantity + quantity
            if medicine.quantity_in_stock < new_quantity:
                return Response({"error": f"Insufficient stock for total quantity. Available: {medicine.quantity_in_stock}"}, status=status.HTTP_400_BAD_REQUEST)
            cart_item.quantity = new_quantity
            cart_item.save()

        serializer = self.get_serializer(cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def update_item(self, request):
        """Update quantity of cart item"""
        cart_item_id = request.data.get('cart_item_id')
        quantity = request.data.get('quantity')

        try:
            cart_item = CartItem.objects.get(id=cart_item_id, cart__user=request.user)
        except CartItem.DoesNotExist:
            return Response({"error": "Cart item not found"}, status=status.HTTP_404_NOT_FOUND)

        if quantity <= 0:
            cart_item.delete()
            cart = self.get_object()
            serializer = self.get_serializer(cart)
            return Response(serializer.data)

        if cart_item.medicine.quantity_in_stock < quantity:
            return Response({"error": f"Insufficient stock. Available: {cart_item.medicine.quantity_in_stock}"}, status=status.HTTP_400_BAD_REQUEST)

        cart_item.quantity = quantity
        cart_item.save()

        cart = self.get_object()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        """Remove item from cart"""
        cart_item_id = request.data.get('cart_item_id')

        try:
            cart_item = CartItem.objects.get(id=cart_item_id, cart__user=request.user)
            cart_item.delete()
        except CartItem.DoesNotExist:
            return Response({"error": "Cart item not found"}, status=status.HTTP_404_NOT_FOUND)

        cart = self.get_object()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def clear_cart(self, request):
        """Clear all items from cart"""
        cart = self.get_object()
        cart.items.all().delete()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)


# ==========================================
# DASHBOARD & ANALYTICS VIEWS
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Get comprehensive dashboard statistics including:
    1. Financial Summaries (Today & Lifetime)
    2. Inventory Health (Stock counts & Valuation)
    3. Payment Analysis
    """
    today = timezone.now().date()
    
    # --- 1. Sales & Revenue Metrics ---
    todays_sales_qs = Sale.objects.filter(sale_date__date=today)
    
    todays_revenue = todays_sales_qs.aggregate(total=Sum('total_amount'))['total'] or 0
    todays_transactions = todays_sales_qs.count()
    
    # Calculate Average Order Value (AOV)
    total_lifetime_revenue = Sale.objects.aggregate(total=Sum('total_amount'))['total'] or 0
    total_lifetime_count = Sale.objects.count()
    average_order_value = (total_lifetime_revenue / total_lifetime_count) if total_lifetime_count > 0 else 0

    # --- 2. Inventory Health ---
    # Low Stock: > 0 but <= reorder_level
    low_stock_count = Medicine.objects.filter(
        quantity_in_stock__lte=F('reorder_level'),
        quantity_in_stock__gt=0,
        is_active=True
    ).count()
    
    # Out of Stock: <= 0
    out_of_stock_count = Medicine.objects.filter(
        quantity_in_stock__lte=0,
        is_active=True
    ).count()

    # Total Medicines
    total_medicines = Medicine.objects.filter(is_active=True).count()

    # --- 3. Inventory Valuation (Estimates) ---
    # Cost Value: How much money is tied up in stock (Purchase Price * Qty)
    inventory_cost_value = Medicine.objects.filter(is_active=True).aggregate(
        val=Sum(F('quantity_in_stock') * F('purchase_price'))
    )['val'] or 0

    # Potential Sales Value: How much revenue the stock represents (Selling Price * Qty)
    inventory_sales_value = Medicine.objects.filter(is_active=True).aggregate(
        val=Sum(F('quantity_in_stock') * F('selling_price'))
    )['val'] or 0

    # --- 4. Payment Method Breakdown ---
    payment_breakdown = Sale.objects.values('payment_method').annotate(
        total=Sum('total_amount'),
        count=Count('id')
    ).order_by('-total')

    return Response({
        "sales_summary": {
            "todaysRevenue": float(todays_revenue),
            "todaysTransactions": todays_transactions,
            "totalLifetimeSales": total_lifetime_count,
            "averageOrderValue": float(round(average_order_value, 2))
        },
        "inventory_summary": {
            "totalProducts": total_medicines,
            "lowStockCount": low_stock_count,
            "outOfStockCount": out_of_stock_count,
            "inventoryCostValue": float(inventory_cost_value),
            "inventoryPotentialValue": float(inventory_sales_value),
            "estimatedPotentialProfit": float(inventory_sales_value - inventory_cost_value)
        },
        "payment_analytics": list(payment_breakdown)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def top_selling_products(request):
    """Get top 5 selling medicines by quantity"""
    top_products = SaleItem.objects.values(
        'medicine__name', 'medicine__medicine_type'
    ).annotate(
        total_qty=Sum('quantity'),
        total_revenue=Sum('total')
    ).order_by('-total_qty')[:5]
    
    return Response(top_products)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_transactions(request):
    """Get last 5 transactions for a feed widget"""
    recent_sales = Sale.objects.all().order_by('-sale_date')[:5]

    data = []
    for sale in recent_sales:
        data.append({
            "id": sale.id,
            "invoice": sale.invoice_number,
            "customer": sale.customer_name or "Walk-in Customer",
            "amount": float(sale.total_amount),
            "time": sale.sale_date.strftime("%H:%M"),
            "status": "Paid" if sale.amount_paid >= sale.total_amount else "Partial/Unpaid"
        })

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_chart_data(request):
    """Get weekly sales data for charts"""
    today = timezone.now().date()
    chart_data = []
    
    # Get last 7 days of sales
    for i in range(6, -1, -1):
        date = today - timedelta(days=i)
        day_name = date.strftime('%a') # Mon, Tue, etc.
        
        # Aggregate stats for the day
        daily_stats = Sale.objects.filter(
            sale_date__date=date
        ).aggregate(
            revenue=Sum('total_amount'),
            orders=Count('id')
        )
        
        chart_data.append({
            "name": day_name,
            "date": date.strftime('%Y-%m-%d'),
            "sales": float(daily_stats['revenue'] or 0),
            "orders": daily_stats['orders'] or 0
        })
        
    return Response(chart_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def low_stock_alerts(request):
    """
    Dedicated endpoint for Low Stock Report
    Returns detailed list of medicines needing reorder
    """
    medicines = Medicine.objects.filter(
        quantity_in_stock__lte=F('reorder_level'),
        is_active=True
    ).annotate(
        shortage=F('reorder_level') - F('quantity_in_stock')
    )

    data = {
        'count': medicines.count(),
        'medicines': MedicineSerializer(medicines, many=True).data
    }
    return Response(data)
