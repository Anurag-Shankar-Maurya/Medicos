from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'medicines'

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'medicines', views.MedicineViewSet)
router.register(r'batches', views.BatchViewSet)
router.register(r'purchases', views.PurchaseViewSet)
router.register(r'purchase-items', views.PurchaseItemViewSet)
router.register(r'sales', views.SaleViewSet)
router.register(r'sale-items', views.SaleItemViewSet)
router.register(r'stock-adjustments', views.StockAdjustmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Custom report endpoints
    path('reports/expiring-batches/', views.expiring_batches_report, name='expiring-batches-report'),
    path('reports/low-stock/', views.low_stock_alerts, name='low-stock-alerts'),
    path('reports/sales-analytics/', views.sales_analytics, name='sales-analytics'),
]
