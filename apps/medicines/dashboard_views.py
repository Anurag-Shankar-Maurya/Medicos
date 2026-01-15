from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from datetime import timedelta
from .models import Medicine, Batch, Sale

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get summarized dashboard statistics"""
    today = timezone.now().date()
    
    # 1. Today's Revenue
    todays_revenue = Sale.objects.filter(
        sale_date__date=today
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    # 2. Low Stock Count
    low_stock_count = Medicine.objects.filter(
        quantity_in_stock__lte=F('reorder_level'),
        is_active=True
    ).count()
    
    # 3. Expiring Soon Count (within 90 days)
    ninety_days_from_now = today + timedelta(days=90)
    expiring_soon_count = Batch.objects.filter(
        expiry_date__gte=today,
        expiry_date__lte=ninety_days_from_now,
        is_active=True
    ).count()
    
    # 4. Total Sales (Count for today or total volume?)
    # Based on labels, let's provide total sales count for today
    total_sales_count = Sale.objects.all().count()

    return Response({
        "todaysRevenue": float(todays_revenue),
        "lowStockCount": low_stock_count,
        "expiringSoonCount": expiring_soon_count,
        "totalSales": total_sales_count
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_chart_data(request):
    """Get weekly sales data for charts"""
    today = timezone.now().date()
    chart_data = []
    
    # Get last 7 days of sales
    for i in range(6, -1, -1):
        date = today - timedelta(days=i)
        day_name = date.strftime('%a')
        
        daily_sales = Sale.objects.filter(
            sale_date__date=date
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        chart_data.append({
            "name": day_name,
            "sales": float(daily_sales)
        })
        
    return Response(chart_data)
