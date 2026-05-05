from api.models import CustomUser
from django.contrib.auth import authenticate

# Test admin authentication
admin = CustomUser.objects.get(email='admin@dhanavruksha.com')
print(f'User found: {admin.email}')
print(f'User role: {admin.role}')
print(f'User status: {admin.status}')
print(f'User is_active: {admin.is_active}')

# Test authentication
user = authenticate(username='admin@dhanavruksha.com', password='admin123')
print(f'\nAuthentication test:')
print(f'Success: {user is not None}')

if user:
    print(f'Authenticated user role: {user.role}')
    print(f'Authenticated user status: {user.status}')
else:
    print('Authentication failed!')
