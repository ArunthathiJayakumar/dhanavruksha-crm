# DHANAVRUKSHA CRM - Backend API

Django REST API backend for DHANAVRUKSHA CRM Portal with PostgreSQL database, JWT authentication, and role-based access control.

## Tech Stack

- **Framework**: Django 5.0 + Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Render.com
- **API Documentation**: Swagger/Redoc

## Features

- User registration and authentication (JWT)
- Role-based access control (Admin, User, Sales, Support)
- Task management with assignment
- Lead management
- Client management
- Attendance tracking
- Sales pipeline tracking
- RESTful API with comprehensive documentation
- CORS support for frontend integration
- Rate limiting and security features

## Prerequisites

- Python 3.10 or higher
- PostgreSQL 14 or higher
- pip (Python package manager)

## Local Development Setup

### 1. Clone the Repository

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Setup PostgreSQL Database

```sql
-- Open PostgreSQL command line
CREATE DATABASE crm_database;
CREATE USER postgres WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE crm_database TO postgres;
```

### 5. Configure Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=crm_database
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

### 6. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Superuser (Admin)

```bash
python manage.py createsuperuser
```

Enter:
- Email: admin@dhanavruksha.com
- First Name: Admin
- Last Name: User
- Password: admin123

### 8. Run Development Server

```bash
python manage.py runserver
```

The API will be available at: `http://localhost:8000`

### 9. Access API Documentation

- Swagger UI: http://localhost:8000/api/docs/
- Redoc: http://localhost:8000/api/redoc/
- Django Admin: http://localhost:8000/admin/

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register/` | Register new user | No |
| POST | `/api/auth/login/` | Login with credentials | No |
| POST | `/api/auth/token/refresh/` | Refresh access token | No |
| POST | `/api/auth/change-password/` | Change password | Yes |
| GET | `/api/auth/me/` | Get current user details | Yes |

### Users (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/` | List all users |
| POST | `/api/users/` | Create new user |
| GET | `/api/users/{id}/` | Get user details |
| PUT | `/api/users/{id}/` | Update user |
| DELETE | `/api/users/{id}/` | Delete user |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/` | List tasks (filtered by role) |
| POST | `/api/tasks/` | Create task (Admin only) |
| GET | `/api/tasks/{id}/` | Get task details |
| PUT | `/api/tasks/{id}/` | Update task |
| DELETE | `/api/tasks/{id}/` | Delete task (Admin only) |

### Leads

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads/` | List leads |
| POST | `/api/leads/` | Create lead |
| GET | `/api/leads/{id}/` | Get lead details |
| PUT | `/api/leads/{id}/` | Update lead |
| DELETE | `/api/leads/{id}/` | Delete lead |

### Clients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients/` | List clients |
| POST | `/api/clients/` | Create client |
| GET | `/api/clients/{id}/` | Get client details |
| PUT | `/api/clients/{id}/` | Update client |
| DELETE | `/api/clients/{id}/` | Delete client |

### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance/` | List attendance records |
| POST | `/api/attendance/` | Create attendance record |
| GET | `/api/attendance/{id}/` | Get record details |
| PUT | `/api/attendance/{id}/` | Update record |
| DELETE | `/api/attendance/{id}/` | Delete record |

### Sales Pipeline

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pipeline/` | List deals |
| POST | `/api/pipeline/` | Create deal |
| GET | `/api/pipeline/{id}/` | Get deal details |
| PUT | `/api/pipeline/{id}/` | Update deal |
| DELETE | `/api/pipeline/{id}/` | Delete deal |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/` | Get dashboard statistics |

## Usage Examples

### Register New User

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "password": "password123",
    "password_confirm": "password123",
    "phone": "+1234567890"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "role": "user"
  }'
```

Response:
```json
{
  "refresh": "eyJ0eXAi...",
  "access": "eyJ0eXAi...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user"
  }
}
```

### Create Task (Authenticated)

```bash
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Follow up with client",
    "task_type": "call",
    "priority": "high",
    "assigned_to": 2,
    "due_date": "2024-12-31",
    "due_time": "14:00:00",
    "description": "Call the client to discuss proposal"
  }'
```

## Role-Based Access Control

### Admin
- Full access to all features
- Can create/edit/delete users
- Can manage all tasks, leads, clients
- View all attendance records
- Access to Django admin panel

### User/Sales/Support
- Can view only assigned tasks/leads/clients
- Can update task status (mark complete)
- Cannot create or delete records
- Can view own attendance records

## Deployment to Render.com

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```

### 2. Deploy on Render

1. Go to https://render.com
2. Sign up/Login
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: dhanavruksha-crm-api
   - **Region**: Oregon
   - **Branch**: main
   - **Root Directory**: backend
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - **Start Command**: `gunicorn crm_backend.wsgi:application`

### 3. Add PostgreSQL Database

1. In Render dashboard, click "New +" → "PostgreSQL"
2. Configure:
   - **Name**: crm-db
   - **Region**: Oregon (same as web service)
   - **Plan**: Free
3. Copy the internal database URL

### 4. Set Environment Variables

In Render web service settings, add:
- `DATABASE_URL`: (from PostgreSQL service)
- `SECRET_KEY`: (generate a new secure key)
- `DEBUG`: `false`
- `ALLOWED_HOSTS`: `your-app.onrender.com`
- `CORS_ALLOWED_ORIGINS`: `your-frontend-url.com`

### 5. Run Migrations

After deployment, run migrations via Render shell:
```bash
python manage.py migrate
python manage.py createsuperuser
```

## Testing

### Run Tests

```bash
python manage.py test
```

### Test with Postman

1. Import API endpoints to Postman
2. Create environment variables for `base_url` and `access_token`
3. Test authentication flow
4. Test CRUD operations with proper authorization

## Security Features

- JWT token-based authentication
- Password hashing (PBKDF2)
- CORS protection
- Rate limiting (100 req/day anon, 1000 req/day authenticated)
- SQL injection prevention (Django ORM)
- XSS protection
- CSRF protection
- Input validation via serializers

## Troubleshooting

### Database Connection Error

```bash
# Check PostgreSQL is running
# Windows
pg_ctl status

# Linux
sudo systemctl status postgresql
```

### Migration Issues

```bash
# Reset migrations (development only)
python manage.py migrate --run-syncdb
python manage.py makemigrations
python manage.py migrate
```

### CORS Issues

Ensure `CORS_ALLOWED_ORIGINS` in `.env` includes your frontend URL.

## Support

- **Email**: akash@dhanavruksha.in
- **Phone**: +91 96001 06659
- **Address**: Chennai, Tamil Nadu, India

## License

Proprietary - DHANAVRUKSHA CRM
