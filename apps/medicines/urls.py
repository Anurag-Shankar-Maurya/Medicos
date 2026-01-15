from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'medicines'

router = DefaultRouter()
router.register(r'medicines', views.MedicineViewSet)
router.register(r'sales', views.SaleViewSet)
router.register(r'sale-items', views.SaleItemViewSet)

urlpatterns = [
    path('', include(router.urls)),

    # Dashboard Endpoints
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
    path('dashboard/chart-data/', views.sales_chart_data, name='dashboard-chart'),
    path('dashboard/top-products/', views.top_selling_products, name='dashboard-top-products'),
    path('dashboard/recent-transactions/', views.recent_transactions, name='dashboard-recent'),
]