# Login Troubleshooting Guide

## ✅ What Has Been Fixed

1. **Backend Server** - Now running on http://localhost:8000
2. **Rate Limiting** - Increased from 100/day to 1000/day
3. **API Login** - Now sends the required `role` field
4. **Default Admin User** - Auto-created in localStorage on page load
5. **Database Admin** - Password reset to `admin123`

## 🔐 Login Credentials

### Default Admin Account
- **Email:** `admin@dhanavruksha.com`
- **Password:** `admin123`
- **Role:** Select "Admin" from dropdown

## 🧪 How to Test Login

### Option 1: Use the Debug Tool (Recommended)
1. Open `login-debug.html` in your browser
2. This will automatically test:
   - Backend connection
   - LocalStorage users
   - API login
   - LocalStorage login
3. Follow the on-screen results

### Option 2: Use the Main Login
1. Open `index.html` in your browser
2. **IMPORTANT:** Press `Ctrl+F5` to hard refresh (clears cache)
3. Login modal should auto-open
4. Enter credentials:
   - Email: `admin@dhanavruksha.com`
   - Password: `admin123`
   - Role: Admin
5. Click "Login"

### Option 3: Test API Directly
1. Open `test-api-login.html`
2. Click "Test Login" button
3. Check the response

## 🔍 If Login Still Doesn't Work

### Check 1: Is Backend Running?
Open terminal and run:
```powershell
cd c:\Users\arunt\Downloads\DP1\backend
python manage.py runserver
```
You should see: `Starting development server at http://127.0.0.1:8000/`

### Check 2: Clear Browser Cache
1. Press `Ctrl+Shift+Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Close and reopen browser
5. Open `index.html` and press `Ctrl+F5`

### Check 3: Open Browser Console
1. Press `F12` to open Developer Tools
2. Go to "Console" tab
3. Look for these messages:
   - ✅ "Default admin user initialized in localStorage"
   - ✅ "Users already exist in localStorage"
   - Login attempt logs

### Check 4: Manually Add Admin to LocalStorage
1. Open browser console (F12)
2. Paste this code and press Enter:
```javascript
localStorage.setItem('crmUsers', JSON.stringify([{
    id: 'USR-001',
    name: 'Admin User',
    email: 'admin@dhanavruksha.com',
    role: 'admin',
    status: 'active',
    password: 'admin123',
    createdDate: new Date().toISOString(),
    lastLogin: new Date().toISOString()
}]));
console.log('Admin user added!');
location.reload();
```

### Check 5: Verify Database User
Run this in terminal:
```powershell
cd c:\Users\arunt\Downloads\DP1\backend
python manage.py shell -c "from api.models import CustomUser; admin = CustomUser.objects.get(email='admin@dhanavruksha.com'); print(f'User: {admin.email}, Role: {admin.role}, Status: {admin.status}')"
```

## 📊 Login Flow

The login function tries **TWO** methods:

### Method 1: LocalStorage Login (First Priority)
- Checks users stored in browser's localStorage
- Faster, no server needed
- Used for admin-created users

### Method 2: API Login (Fallback)
- Sends request to Django backend
- Validates against database
- Returns JWT tokens
- Used if localStorage fails

## 🐛 Common Errors & Solutions

### Error: "429 Too Many Requests"
**Solution:** Backend rate limit was increased. Restart backend server.

### Error: "showNotification is not defined"
**Solution:** Fixed! Function is now properly defined in script.js

### Error: "No users found"
**Solution:** Default admin is auto-created on page load. Hard refresh (Ctrl+F5)

### Error: "Invalid email or password"
**Solution:** 
- Make sure you're using exact credentials
- Email: `admin@dhanavruksha.com` (case-sensitive)
- Password: `admin123`
- Role: Select "Admin" (not "User")

### Error: "Wrong role"
**Solution:** Select "Admin" from the role dropdown when logging in as admin

## 📞 Still Having Issues?

1. Open `login-debug.html` and share the results
2. Open browser console (F12) and share any error messages
3. Check backend terminal for error logs

## 🎯 Quick Success Checklist

- [ ] Backend server is running (http://localhost:8000)
- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] Page hard refreshed (Ctrl+F5)
- [ ] Using correct email: `admin@dhanavruksha.com`
- [ ] Using correct password: `admin123`
- [ ] Selected correct role: "Admin"
- [ ] Browser console shows no errors

---

**Last Updated:** April 28, 2026
