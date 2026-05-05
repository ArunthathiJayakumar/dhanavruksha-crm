# Django Backend Setup Script for Windows
# Run this in PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DHANAVRUKSHA CRM - Backend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python is not installed. Please install Python 3.10+" -ForegroundColor Red
    exit 1
}

# Check if PostgreSQL is installed
Write-Host ""
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgStatus = Get-Service -Name postgresql* -ErrorAction Stop
    if ($pgStatus.Status -eq "Running") {
        Write-Host "PostgreSQL is running" -ForegroundColor Green
    } else {
        Write-Host "WARNING: PostgreSQL is installed but not running" -ForegroundColor Yellow
        Write-Host "Please start PostgreSQL service" -ForegroundColor Yellow
    }
} catch {
    Write-Host "WARNING: PostgreSQL service not found" -ForegroundColor Yellow
    Write-Host "Please ensure PostgreSQL is installed and running" -ForegroundColor Yellow
}

# Navigate to backend directory
Write-Host ""
Write-Host "Navigating to backend directory..." -ForegroundColor Yellow
Set-Location -Path "backend" -ErrorAction Stop
Write-Host "In: $(Get-Location)" -ForegroundColor Green

# Create virtual environment
Write-Host ""
Write-Host "Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "Virtual environment already exists" -ForegroundColor Green
} else {
    python -m venv venv
    Write-Host "Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host ""
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
Write-Host "Virtual environment activated" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
Write-Host "Dependencies installed" -ForegroundColor Green

# Create .env file if it doesn't exist
Write-Host ""
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host ".env file already exists" -ForegroundColor Green
} else {
    Copy-Item ".env.example" ".env"
    Write-Host ".env file created from template" -ForegroundColor Yellow
    Write-Host "IMPORTANT: Edit .env with your database credentials!" -ForegroundColor Red
}

# Run migrations
Write-Host ""
Write-Host "Running database migrations..." -ForegroundColor Yellow
python manage.py makemigrations
python manage.py migrate
Write-Host "Migrations completed" -ForegroundColor Green

# Create superuser prompt
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Almost Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env file with your PostgreSQL credentials" -ForegroundColor White
Write-Host "2. Create admin user by running:" -ForegroundColor White
Write-Host "   python manage.py createsuperuser" -ForegroundColor Cyan
Write-Host "3. Start the server:" -ForegroundColor White
Write-Host "   python manage.py runserver" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then in another terminal, start frontend:" -ForegroundColor Yellow
Write-Host "cd .." -ForegroundColor Cyan
Write-Host "python -m http.server 8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access points:" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:8080" -ForegroundColor Green
Write-Host "Backend API: http://localhost:8000" -ForegroundColor Green
Write-Host "API Docs: http://localhost:8000/api/docs/" -ForegroundColor Green
Write-Host "Admin Panel: http://localhost:8000/admin/" -ForegroundColor Green
Write-Host ""
Write-Host "For detailed instructions, see QUICKSTART.md" -ForegroundColor Yellow
Write-Host ""
