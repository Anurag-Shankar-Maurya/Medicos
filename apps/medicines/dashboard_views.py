from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, F, Avg
from django.utils import timezone
from datetime import timedelta
from .models import Medicine, Sale, SaleItem

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Get comprehensive dashboard statistics including:
    1. Financial Summaries (Today)
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

    # --- 4. Payment Method Breakdown (For Pie Chart) ---
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
    recent_sales = Sale.objects.select_related('customer').all().order_by('-sale_date')[:5]
    
    data = []
    for sale in recent_sales:
        data.append({
            "id": sale.id,
            "invoice": sale.invoice_number,
            "customer": sale.customer.name if sale.customer else "Walk-in Customer",
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