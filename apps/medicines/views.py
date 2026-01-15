from rest_framework import generics, viewsets, status, serializers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, F, Sum, Count
from django.db import transaction
from django.utils import timezone
from .models import (
    Category, Medicine, Batch, Purchase, PurchaseItem,
    Sale, SaleItem, StockAdjustment
)
from .serializers import (
    CategorySerializer, MedicineSerializer, BatchSerializer,
    PurchaseSerializer, PurchaseItemSerializer, SaleSerializer,
    SaleItemSerializer, StockAdjustmentSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for medicine categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Category.objects.prefetch_related('subcategories')
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        return queryset.order_by('name')


class MedicineViewSet(viewsets.ModelViewSet):
    """ViewSet for medicines"""
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Medicine.objects.select_related('category', 'supplier', 'created_by').prefetch_related('batches')
        search = self.request.query_params.get('search', None)
        category = self.request.query_params.get('category', None)
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
        if category:
            queryset = queryset.filter(category_id=category)
        if medicine_type:
            queryset = queryset.filter(medicine_type=medicine_type)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        return queryset.order_by('name')

    @transaction.atomic
    def perform_create(self, serializer):
        """Set created_by when creating medicine and create initial batch if stock provided"""
        medicine = serializer.save(created_by=self.request.user)
        
        # Create initial batch if there's stock but no batches
        if medicine.quantity_in_stock > 0:
            Batch.objects.create(
                medicine=medicine,
                batch_number="INITIAL-" + timezone.now().strftime("%Y%m%d"),
                quantity=medicine.quantity_in_stock,
                purchase_price=medicine.purchase_price,
                mrp=medicine.mrp,
                manufacturing_date=timezone.now().date(),
                expiry_date=timezone.now().date() + timezone.timedelta(days=730), # 2 years default
                is_active=True
            )

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get medicines that need reorder"""
        medicines = self.get_queryset().filter(
            quantity_in_stock__lte=F('reorder_level'),
            is_active=True
        ).annotate(
            shortage= F('reorder_level') - F('quantity_in_stock')
        )
        serializer = self.get_serializer(medicines, many=True)
        return Response(serializer.data)


class BatchViewSet(viewsets.ModelViewSet):
    """ViewSet for medicine batches"""
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Batch.objects.select_related('medicine')
        medicine = self.request.query_params.get('medicine', None)
        expired = self.request.query_params.get('expired', None)
        near_expiry = self.request.query_params.get('near_expiry', None)
        is_active = self.request.query_params.get('is_active', None)

        if medicine:
            queryset = queryset.filter(medicine_id=medicine)
        if expired is not None:
            queryset = queryset.filter(expiry_date__lt=timezone.now().date())
        if near_expiry is not None:
            # Near expiry: expires within 90 days
            future_date = timezone.now().date() + timezone.timedelta(days=90)
            queryset = queryset.filter(
                expiry_date__gte=timezone.now().date(),
                expiry_date__lte=future_date
            )
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        return queryset.order_by('expiry_date')

    @action(detail=False, methods=['get'])
    def expiring(self, request):
        """Get batches that are expiring soon or already expired"""
        # Expired batches
        expired = self.get_queryset().filter(expiry_date__lt=timezone.now().date())

        # Near expiry (within 90 days)
        future_date = timezone.now().date() + timezone.timedelta(days=90)
        near_expiry = self.get_queryset().filter(
            expiry_date__gte=timezone.now().date(),
            expiry_date__lte=future_date
        )

        data = {
            'expired': self.get_serializer(expired, many=True).data,
            'near_expiry': self.get_serializer(near_expiry, many=True).data
        }
        return Response(data)


class PurchaseViewSet(viewsets.ModelViewSet):
    """ViewSet for purchases"""
    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Purchase.objects.select_related('supplier', 'created_by').prefetch_related('items__medicine')
        supplier = self.request.query_params.get('supplier', None)
        payment_status = self.request.query_params.get('payment_status', None)
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)

        if supplier:
            queryset = queryset.filter(supplier_id=supplier)
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        if start_date:
            queryset = queryset.filter(purchase_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(purchase_date__lte=end_date)

        return queryset.order_by('-purchase_date')

    def perform_create(self, serializer):
        """Set created_by when creating purchase"""
        serializer.save(created_by=self.request.user)


class PurchaseItemViewSet(viewsets.ModelViewSet):
    """ViewSet for purchase items"""
    queryset = PurchaseItem.objects.all()
    serializer_class = PurchaseItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = PurchaseItem.objects.select_related('purchase', 'medicine', 'batch')
        purchase = self.request.query_params.get('purchase', None)
        medicine = self.request.query_params.get('medicine', None)

        if purchase:
            queryset = queryset.filter(purchase_id=purchase)
        if medicine:
            queryset = queryset.filter(medicine_id=medicine)

        return queryset.order_by('-id')


class SaleViewSet(viewsets.ModelViewSet):
    """ViewSet for sales"""
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Sale.objects.select_related('customer', 'doctor', 'created_by').prefetch_related('items__medicine')
        customer = self.request.query_params.get('customer', None)
        doctor = self.request.query_params.get('doctor', None)
        payment_method = self.request.query_params.get('payment_method', None)
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)

        if customer:
            queryset = queryset.filter(customer_id=customer)
        if doctor:
            queryset = queryset.filter(doctor_id=doctor)
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        if start_date:
            queryset = queryset.filter(sale_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(sale_date__lte=end_date)

        return queryset.order_by('-sale_date')

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        items_data = data.pop('items', [])
        
        # Add invoice number if not present
        if not data.get('invoice_number'):
            import uuid
            data['invoice_number'] = f"INV-{uuid.uuid4().hex[:8].upper()}"
        
        # Ensure totals are present for validation
        if not data.get('subtotal') and data.get('total_amount'):
             total = float(data.get('total_amount'))
             data['subtotal'] = f"{total / 1.12:.2f}"
             data['tax_amount'] = f"{total - float(data['subtotal']):.2f}"
        
        if not data.get('amount_paid'):
            data['amount_paid'] = data.get('total_amount', '0.00')

        if data.get('customer_name') and not data.get('customer'):
            data['notes'] = f"Customer: {data.get('customer_name')}\n" + (data.get('notes') or "")
        
        # Calculate totals from backend if needed, but here we trust frontend with validation
        sale_serializer = self.get_serializer(data=data)
        if not sale_serializer.is_valid():
            print(f"DEBUG: Sale validation errors: {sale_serializer.errors}")
            return Response(sale_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Pass the backend-generated fields during save
        sale = sale_serializer.save(
            created_by=self.request.user,
            invoice_number=data.get('invoice_number'),
            subtotal=data.get('subtotal', '0.00'),
            tax_amount=data.get('tax_amount', '0.00'),
            amount_paid=data.get('amount_paid', '0.00')
        )

        for item in items_data:
            medicine = Medicine.objects.get(id=item['medicine_id'])
            
            # Find the best batch (FIFO - First In First Out)
            batch = Batch.objects.filter(
                medicine=medicine, 
                quantity__gt=0,
                expiry_date__gt=timezone.now().date()
            ).order_by('expiry_date').first()
            
            if not batch:
                raise serializers.ValidationError(f"No active stock for {medicine.name}")
            
            qty = int(item['quantity'])
            if batch.quantity < qty:
                 # In a real app, we might split across multiple batches
                 raise serializers.ValidationError(f"Insufficient stock in earliest batch for {medicine.name}")

            SaleItem.objects.create(
                sale=sale,
                medicine=medicine,
                batch=batch,
                quantity=qty,
                selling_price=item['price'],
                mrp=batch.mrp,
                batch_number=batch.batch_number,
                gst_percentage=medicine.gst_percentage
            )
            
            # Update stock
            batch.quantity -= qty
            batch.save()
            
            medicine.quantity_in_stock -= qty
            medicine.save()

        return Response(sale_serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        """Set created_by when creating sale"""
        serializer.save(created_by=self.request.user)


class SaleItemViewSet(viewsets.ModelViewSet):
    """ViewSet for sale items"""
    queryset = SaleItem.objects.all()
    serializer_class = SaleItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = SaleItem.objects.select_related('sale', 'medicine', 'batch')
        sale = self.request.query_params.get('sale', None)
        medicine = self.request.query_params.get('medicine', None)

        if sale:
            queryset = queryset.filter(sale_id=sale)
        if medicine:
            queryset = queryset.filter(medicine_id=medicine)

        return queryset.order_by('-id')


class StockAdjustmentViewSet(viewsets.ModelViewSet):
    """ViewSet for stock adjustments"""
    queryset = StockAdjustment.objects.all()
    serializer_class = StockAdjustmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = StockAdjustment.objects.select_related('medicine', 'batch', 'adjusted_by')
        medicine = self.request.query_params.get('medicine', None)
        adjustment_type = self.request.query_params.get('adjustment_type', None)
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)

        if medicine:
            queryset = queryset.filter(medicine_id=medicine)
        if adjustment_type:
            queryset = queryset.filter(adjustment_type=adjustment_type)
        if start_date:
            queryset = queryset.filter(adjustment_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(adjustment_date__lte=end_date)

        return queryset.order_by('-adjustment_date')

    def perform_create(self, serializer):
        """Set adjusted_by when creating adjustment"""
        serializer.save(adjusted_by=self.request.user)


# Custom API Views for Reports
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def expiring_batches_report(request):
    """Get report of expiring and expired batches"""
    expired = Batch.objects.filter(
        expiry_date__lt=timezone.now().date(),
        is_active=True
    ).select_related('medicine')

    near_expiry = Batch.objects.filter(
        expiry_date__gte=timezone.now().date(),
        expiry_date__lte=timezone.now().date() + timezone.timedelta(days=90),
        is_active=True
    ).select_related('medicine')

    data = {
        'expired_count': expired.count(),
        'near_expiry_count': near_expiry.count(),
        'expired_batches': BatchSerializer(expired, many=True).data,
        'near_expiry_batches': BatchSerializer(near_expiry, many=True).data
    }
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def low_stock_alerts(request):
    """Get medicines that need reorder"""
    medicines = Medicine.objects.filter(
        quantity_in_stock__lte=F('reorder_level'),
        is_active=True
    ).select_related('category', 'supplier').prefetch_related('batches').annotate(
        shortage=F('reorder_level') - F('quantity_in_stock')
    )

    data = {
        'count': medicines.count(),
        'medicines': MedicineSerializer(medicines, many=True).data
    }
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_analytics(request):
    """Get sales analytics data"""
    # Date range from query params
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')

    sales_query = Sale.objects.all()
    if start_date:
        sales_query = sales_query.filter(sale_date__gte=start_date)
    if end_date:
        sales_query = sales_query.filter(sale_date__lte=end_date)

    # Total sales
    total_sales = sales_query.aggregate(
        total_amount=Sum('total_amount'),
        total_discount=Sum('discount'),
        total_tax=Sum('tax_amount'),
        count=Count('id')
    )

    # Payment method breakdown
    payment_methods = sales_query.values('payment_method').annotate(
        total=Sum('total_amount'),
        count=Count('id')
    ).order_by('-total')

    # Top selling medicines
    top_medicines = SaleItem.objects.filter(
        sale__in=sales_query
    ).values('medicine__name').annotate(
        total_quantity=Sum('quantity'),
        total_amount=Sum('total')
    ).order_by('-total_amount')[:10]

    data = {
        'summary': total_sales,
        'payment_methods': payment_methods,
        'top_medicines': top_medicines
    }
    return Response(data)
