# Quick Start Guide - DHANAVRUKSHA CRM

Get up and running in 10 minutes!

## Prerequisites Checklist
- [ ] Python 3.10+ installed
- [ ] PostgreSQL 14+ installed and running
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

## Step-by-Step Setup

### Step 1: Database Setup (2 minutes)

Open PostgreSQL command line or pgAdmin:

```sql
CREATE DATABASE crm_database;
```

### Step 2: Backend Setup (3 minutes)

Open terminal in the project directory:

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Configuration (2 minutes)

Create `.env` file:

```bash
# Copy example
cp .env.example .env

# Edit .env file with your details:
# DB_NAME=crm_database
# DB_USER=postgres
# DB_PASSWORD=your_postgres_password
# DB_HOST=localhost
# DB_PORT=5432
```

### Step 4: Initialize Database (1 minute)

```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser
# Email: admin@dhanavruksha.com
# Password: admin123
```

### Step 5: Start Backend (30 seconds)

```bash
python manage.py runserver
```

✅ Backend running at: http://localhost:8000

### Step 6: Start Frontend (30 seconds)

Open a NEW terminal in the root project directory:

```bash
# Simple HTTP server
python -m http.server 8080
```

✅ Frontend running at: http://localhost:8080

### Step 7: Access Application

1. Open browser: http://localhost:8080
2. Click "Login" button
3. Login as admin:
   - Email: `admin@dhanavruksha.com`
   - Password: `admin123`
   - Role: Select "Admin"

## Verify Everything Works

### Backend Health Check
- Visit: http://localhost:8000/api/docs/
- You should see Swagger API documentation

### Frontend Health Check
- Visit: http://localhost:8080
- You should see the CRM landing page
- Login should work

### Test User Registration
1. Click "Login" → "Create Account"
2. Fill in registration form
3. Submit
4. Login with new credentials

## Common Issues

### "Cannot connect to database"
```bash
# Check PostgreSQL is running
# Windows: Check Services → PostgreSQL
# Linux: sudo systemctl status postgresql
```

### "Module not found"
```bash
# Make sure virtual environment is activated
# You should see (venv) in terminal
pip install -r requirements.txt
```

### "CORS error" in browser console
- Backend and frontend must run on different ports
- Backend: port 8000
- Frontend: port 8080
- This is expected and configured correctly

### "Port already in use"
```bash
# Use different port
python manage.py runserver 8001
# Update api-config.js API_BASE_URL to port 8001
```

## Next Steps

1. **Create Users**: Go to User Management page
2. **Assign Tasks**: Create tasks and assign to users
3. **Explore Features**: Check out all CRM modules
4. **Read Docs**: See README.md for full documentation

## Production Deployment

See `backend/README.md` for deployment to Render.com

## Need Help?

- Check `README.md` for detailed docs
- See `backend/README.md` for API documentation
- Contact: akash@dhanavruksha.in

---

**You're all set! 🎉**
