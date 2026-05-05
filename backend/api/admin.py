from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser, Task, Lead, Client, Attendance, SalesPipeline


@admin.register(CustomUser)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'status', 'created_date')
    list_filter = ('role', 'status', 'created_date')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-created_date',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone')}),
        ('Permissions', {'fields': ('role', 'status', 'is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login_date', 'created_date')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'role', 'status'),
        }),
    )
    
    readonly_fields = ('created_date', 'last_login_date')


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'assigned_to', 'priority', 'status', 'due_date', 'created_date')
    list_filter = ('priority', 'status', 'task_type', 'due_date')
    search_fields = ('title', 'description')
    ordering = ('-due_date',)
    date_hierarchy = 'due_date'


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'company', 'status', 'source', 'value', 'created_date')
    list_filter = ('status', 'source', 'created_date')
    search_fields = ('name', 'email', 'company')
    ordering = ('-created_date',)


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'company', 'phone', 'created_date')
    list_filter = ('created_date',)
    search_fields = ('name', 'email', 'company')
    ordering = ('-created_date',)


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'status', 'check_in', 'check_out')
    list_filter = ('status', 'date')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    ordering = ('-date',)
    date_hierarchy = 'date'


@admin.register(SalesPipeline)
class SalesPipelineAdmin(admin.ModelAdmin):
    list_display = ('deal_name', 'client', 'stage', 'value', 'probability', 'expected_close_date')
    list_filter = ('stage', 'expected_close_date')
    search_fields = ('deal_name', 'client__name')
    ordering = ('-created_date',)
