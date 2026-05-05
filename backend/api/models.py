from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class CustomUser(AbstractUser):
    """Custom User model with role-based access control"""
    
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
        ('sales', 'Sales Executive'),
        ('support', 'Support Staff'),
    )
    
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    )
    
    username = None  # Remove default username field
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    phone = models.CharField(max_length=15, blank=True, null=True)
    created_date = models.DateTimeField(auto_now_add=True)
    last_login_date = models.DateTimeField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_date']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email}) - {self.role}"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"


class Task(models.Model):
    """Task model for task management and assignment"""
    
    PRIORITY_CHOICES = (
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    )
    
    TYPE_CHOICES = (
        ('call', 'Call'),
        ('meeting', 'Meeting'),
        ('email', 'Email'),
        ('followup', 'Follow-up'),
        ('proposal', 'Proposal'),
        ('other', 'Other'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    title = models.CharField(max_length=255)
    task_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES)
    assigned_to = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='assigned_tasks',
        null=True,
        blank=True
    )
    created_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='created_tasks'
    )
    due_date = models.DateField()
    due_time = models.TimeField(null=True, blank=True)
    related_to = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    reminder = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_date = models.DateTimeField(auto_now_add=True)
    completed_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'tasks'
        ordering = ['-due_date', '-priority']
    
    def __str__(self):
        return f"{self.title} - {self.get_priority_display()} - {self.get_status_display()}"
    
    def save(self, *args, **kwargs):
        if self.status == 'completed' and not self.completed_date:
            self.completed_date = timezone.now()
        super().save(*args, **kwargs)


class Lead(models.Model):
    """Lead management model"""
    
    STATUS_CHOICES = (
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('qualified', 'Qualified'),
        ('proposal', 'Proposal Sent'),
        ('negotiation', 'Negotiation'),
        ('won', 'Won'),
        ('lost', 'Lost'),
    )
    
    SOURCE_CHOICES = (
        ('website', 'Website'),
        ('referral', 'Referral'),
        ('social_media', 'Social Media'),
        ('email_campaign', 'Email Campaign'),
        ('phone', 'Phone'),
        ('walk_in', 'Walk-in'),
        ('other', 'Other'),
    )
    
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    company = models.CharField(max_length=255, blank=True, null=True)
    designation = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='website')
    value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True, null=True)
    assigned_to = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='assigned_leads'
    )
    created_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='created_leads'
    )
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    converted_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'leads'
        ordering = ['-created_date']
    
    def __str__(self):
        return f"{self.name} - {self.email} - {self.get_status_display()}"


class Client(models.Model):
    """Client information management"""
    
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    company = models.CharField(max_length=255)
    designation = models.CharField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    meeting_notes = models.TextField(blank=True, null=True)
    assigned_to = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='assigned_clients'
    )
    created_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='created_clients'
    )
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'clients'
        ordering = ['-created_date']
    
    def __str__(self):
        return f"{self.name} - {self.company}"


class Attendance(models.Model):
    """Attendance tracking model"""
    
    STATUS_CHOICES = (
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('half_day', 'Half Day'),
        ('leave', 'Leave'),
        ('holiday', 'Holiday'),
    )
    
    user = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='attendance_records'
    )
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='present')
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'attendance'
        unique_together = ['user', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.date} - {self.get_status_display()}"


class SalesPipeline(models.Model):
    """Sales pipeline and deal tracking"""
    
    STAGE_CHOICES = (
        ('lead', 'Lead'),
        ('qualification', 'Qualification'),
        ('needs_analysis', 'Needs Analysis'),
        ('value_proposition', 'Value Proposition'),
        ('proposal', 'Proposal/Price Quote'),
        ('negotiation', 'Negotiation/Review'),
        ('closed_won', 'Closed Won'),
        ('closed_lost', 'Closed Lost'),
    )
    
    deal_name = models.CharField(max_length=255)
    client = models.ForeignKey(
        Client, 
        on_delete=models.CASCADE, 
        related_name='deals'
    )
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='lead')
    value = models.DecimalField(max_digits=12, decimal_places=2)
    probability = models.IntegerField(default=0, help_text="Probability percentage (0-100)")
    expected_close_date = models.DateField()
    description = models.TextField(blank=True, null=True)
    assigned_to = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='assigned_deals'
    )
    created_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='created_deals'
    )
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    closed_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'sales_pipeline'
        ordering = ['-created_date']
    
    def __str__(self):
        return f"{self.deal_name} - {self.client.name} - {self.get_stage_display()}"
