from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'medicines'

router = DefaultRouter()
router.register(r'medicines', views.MedicineViewSet)
router.register(r'sales', views.SaleViewSet)
router.register(r'sale-items', views.SaleItemViewSet)
router.register(r'cart', views.CartViewSet)
router.register(r'notifications', views.NotificationViewSet)

urlpatterns = [
    path('', include(router.urls)),

    # Dashboard Endpoints
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
    path('dashboard/chart-data/', views.sales_chart_data, name='dashboard-chart'),
    path('dashboard/top-products/', views.top_selling_products, name='dashboard-top-products'),
    path('dashboard/recent-transactions/', views.recent_transactions, name='dashboard-recent'),

    # Reports Endpoints
    path('reports/stock-status/', views.stock_status_report, name='stock-status-report'),
    path('reports/medicine-catalog/', views.medicine_catalog_report, name='medicine-catalog-report'),
    path('reports/profit-margin/', views.profit_margin_report, name='profit-margin-report'),
    path('reports/sales-summary/', views.sales_summary_report, name='sales-summary-report'),
    path('reports/top-selling-medicines/', views.top_selling_medicines_report, name='top-selling-report'),
    path('reports/payment-method-analysis/', views.payment_method_analysis_report, name='payment-analysis-report'),
    path('reports/gst-analysis/', views.gst_analysis_report, name='gst-analysis-report'),
    path('reports/inventory-valuation/', views.inventory_valuation_report, name='inventory-valuation-report'),
    path('reports/medicine-by-type/', views.medicine_by_type_report, name='medicine-by-type-report'),
    path('reports/medicine-by-manufacturer/', views.medicine_by_manufacturer_report, name='medicine-by-manufacturer-report'),
    path('reports/sales-by-period/', views.sales_by_period_report, name='sales-by-period-report'),
    path('reports/tax-collection/', views.tax_collection_report, name='tax-collection-report'),
    path('reports/notification-summary/', views.notification_summary_report, name='notification-summary-report'),
]
