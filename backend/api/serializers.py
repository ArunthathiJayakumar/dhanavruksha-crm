from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Task, Lead, Client, Attendance, SalesPipeline

CustomUser = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'status', 
                  'phone', 'created_date', 'last_login_date']
        read_only_fields = ['id', 'created_date', 'last_login_date']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name', 'password', 'password_confirm', 'phone']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        
        # Check if email already exists
        if CustomUser.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Email already registered")
        
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Create user with role='user' for self-registration
        user = CustomUser.objects.create(
            username=validated_data['email'],  # Set username same as email for Django auth
            role='user',
            **validated_data
        )
        user.set_password(password)
        user.save()
        
        return user


class UserDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for admin user management"""
    
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'status', 
                  'phone', 'created_date', 'last_login_date']
        read_only_fields = ['id', 'created_date', 'last_login_date']


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model"""
    
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    task_type_display = serializers.CharField(source='get_task_type_display', read_only=True)
    
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['created_by', 'created_date']
    
    def validate(self, data):
        # Validate due_date is not in the past for new tasks
        if not self.instance:  # Only for creation
            from django.utils import timezone
            if data.get('due_date') and data['due_date'] < timezone.now().date():
                raise serializers.ValidationError("Due date cannot be in the past")
        return data


class LeadSerializer(serializers.ModelSerializer):
    """Serializer for Lead model"""
    
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    
    class Meta:
        model = Lead
        fields = '__all__'
        read_only_fields = ['created_by', 'created_date', 'updated_date']


class ClientSerializer(serializers.ModelSerializer):
    """Serializer for Client model"""
    
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ['created_by', 'created_date', 'updated_date']


class AttendanceSerializer(serializers.ModelSerializer):
    """Serializer for Attendance model"""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['created_date']


class SalesPipelineSerializer(serializers.ModelSerializer):
    """Serializer for Sales Pipeline model"""
    
    client_name = serializers.CharField(source='client.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    stage_display = serializers.CharField(source='get_stage_display', read_only=True)
    
    class Meta:
        model = SalesPipeline
        fields = '__all__'
        read_only_fields = ['created_by', 'created_date', 'updated_date']


# Login serializers
class LoginSerializer(serializers.Serializer):
    """Serializer for login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.CharField()
    
    def validate(self, data):
        from django.contrib.auth import authenticate
        from rest_framework.exceptions import AuthenticationFailed
        
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')
        
        user = authenticate(username=email, password=password)
        
        if user is None:
            raise AuthenticationFailed('Invalid email or password')
        
        if user.role != role:
            raise AuthenticationFailed(f'Invalid role. Your account role is: {user.role}')
        
        if user.status != 'active':
            raise AuthenticationFailed('Your account is not active. Please contact admin.')
        
        data['user'] = user
        return data


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)
    new_password_confirm = serializers.CharField(required=True, min_length=6)
    
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return data
