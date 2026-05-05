from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    register_user, login_user, change_password, get_current_user,
    UserViewSet, TaskViewSet, LeadViewSet, ClientViewSet,
    AttendanceViewSet, SalesPipelineViewSet, get_dashboard_stats
)

# Create router
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'tasks', TaskViewSet, basename='tasks')
router.register(r'leads', LeadViewSet, basename='leads')
router.register(r'clients', ClientViewSet, basename='clients')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'pipeline', SalesPipelineViewSet, basename='pipeline')

urlpatterns = [
    # Authentication endpoints (public)
    path('auth/register/', register_user, name='register'),
    path('auth/login/', login_user, name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/change-password/', change_password, name='change_password'),
    path('auth/me/', get_current_user, name='current_user'),
    
    # Dashboard
    path('dashboard/', get_dashboard_stats, name='dashboard_stats'),
    
    # API routes (authenticated)
    path('', include(router.urls)),
]
