from rest_framework import viewsets, status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import Task, Lead, Client, Attendance, SalesPipeline
from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserDetailSerializer,
    TaskSerializer, LeadSerializer, ClientSerializer, 
    AttendanceSerializer, SalesPipelineSerializer,
    LoginSerializer, PasswordChangeSerializer
)
from django.contrib.auth import get_user_model

CustomUser = get_user_model()


# Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """User self-registration endpoint - creates user with 'user' role"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'User created successfully',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Login with email, password, and role verification"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Update last login
        user.last_login_date = timezone.now()
        user.save(update_fields=['last_login_date'])
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change password for authenticated user"""
    serializer = PasswordChangeSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        
        # Check old password
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'error': 'Old password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({'message': 'Password changed successfully'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """Get current authenticated user details"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


# User Management Views (Admin Only)
class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users. Only accessible by admin.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        return CustomUser.objects.all().order_by('-created_date')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserSerializer
        return UserDetailSerializer
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.role == 'admin' and CustomUser.objects.filter(role='admin').count() == 1:
            return Response(
                {'error': 'Cannot delete the last admin user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)


# Task Views with Role-Based Access
class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for tasks.
    - Admins can see/create/edit/delete all tasks
    - Regular users can only see tasks assigned to them
    - Users can update task status (mark complete)
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Task.objects.all()
        # Regular users see only their assigned tasks
        return Task.objects.filter(assigned_to=user)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        
        # Non-admin users can only update status
        if user.role != 'admin':
            # Check if user is trying to update fields other than status
            restricted_fields = set(request.data.keys()) - {'status', 'completed_date'}
            if restricted_fields:
                return Response(
                    {'error': 'You can only update task status'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response(
                {'error': 'Only admins can delete tasks'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


# Lead Views
class LeadViewSet(viewsets.ModelViewSet):
    """
    ViewSet for leads.
    - Admins have full access
    - Other roles can only view assigned leads
    """
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Lead.objects.all()
        return Lead.objects.filter(assigned_to=user)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


# Client Views
class ClientViewSet(viewsets.ModelViewSet):
    """
    ViewSet for clients.
    - Admins have full access
    - Other roles can only view assigned clients
    """
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Client.objects.all()
        return Client.objects.filter(assigned_to=user)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


# Attendance Views
class AttendanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for attendance.
    - Admins can view all attendance records
    - Users can only view their own records
    """
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Attendance.objects.all()
        return Attendance.objects.filter(user=user)
    
    def perform_create(self, serializer):
        # Only admins can create attendance records
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied('Only admins can create attendance records')
        serializer.save()


# Sales Pipeline Views
class SalesPipelineViewSet(viewsets.ModelViewSet):
    """
    ViewSet for sales pipeline.
    - Admins have full access
    - Other roles can only view assigned deals
    """
    serializer_class = SalesPipelineSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return SalesPipeline.objects.all()
        return SalesPipeline.objects.filter(assigned_to=user)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


# Dashboard/Statistics Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_stats(request):
    """Get dashboard statistics based on user role"""
    user = request.user
    
    stats = {}
    
    if user.role == 'admin':
        # Admin sees all statistics
        stats['total_users'] = CustomUser.objects.count()
        stats['total_tasks'] = Task.objects.count()
        stats['pending_tasks'] = Task.objects.filter(status='pending').count()
        stats['completed_tasks'] = Task.objects.filter(status='completed').count()
        stats['total_leads'] = Lead.objects.count()
        stats['total_clients'] = Client.objects.count()
        stats['total_deals'] = SalesPipeline.objects.count()
        stats['deal_value'] = float(SalesPipeline.objects.aggregate(
            total=models.Sum('value')
        )['total'] or 0)
    else:
        # Regular user sees only their statistics
        stats['my_tasks'] = Task.objects.filter(assigned_to=user).count()
        stats['my_pending_tasks'] = Task.objects.filter(
            assigned_to=user, status='pending'
        ).count()
        stats['my_completed_tasks'] = Task.objects.filter(
            assigned_to=user, status='completed'
        ).count()
        stats['my_leads'] = Lead.objects.filter(assigned_to=user).count()
        stats['my_clients'] = Client.objects.filter(assigned_to=user).count()
        stats['my_deals'] = SalesPipeline.objects.filter(assigned_to=user).count()
    
    return Response(stats)


# Import models for aggregation
from django.db import models
