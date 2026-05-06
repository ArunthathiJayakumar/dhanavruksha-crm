# Dual Login System - User Guide

## Overview
The DHANAVRUKSHA CRM Portal now features a **dual login system** with role-based access control:
- **Admin**: Full access to all features including task assignment and user management
- **User**: Can only view and manage tasks assigned to them by the admin

## Login Credentials

### Default Admin Login
- **Email**: admin@dhanavruksha.com
- **Password**: admin123
- **Role**: Select "Admin" from the dropdown
- **Access**: Full system access (User Management, Tasks, Leads, Attendance, etc.)

### Default User Login
- **Email**: user@dhanavruksha.com
- **Password**: user123
- **Role**: Select "User" from the dropdown
- **Access**: Limited to viewing assigned tasks only

### Create Your Own Account
Users can create their own accounts by:
1. Click the **Login** button on the homepage
2. Click **"Create Account"** link at the bottom of the login form
3. Fill in the registration form:
   - Full Name
   - Email Address
   - Password (minimum 6 characters)
   - Confirm Password
4. Click **"Create Account"**
5. You'll be redirected to login with your new credentials

**Note**: Self-registered accounts are created with **'User'** role by default

## How It Works

### For Admins:
1. Login with admin credentials
2. Navigate to **User Management** to create new users
3. Navigate to **Tasks** to:
   - Create new tasks
   - Assign tasks to specific users
   - View all tasks across the organization
   - Edit or delete any task
4. Access all CRM features (Leads, Attendance, Clients, Pipeline, etc.)

### For Users:
1. Login with user credentials
2. Automatically redirected to **Tasks** page
3. Can only see tasks that have been assigned to them
4. Can update task status (mark as complete/pending)
5. Cannot create new tasks
6. Cannot access admin-only features (User Management, Leads, etc.)

## Features

### Role-Based Access Control
- **Admin-only pages**:
  - User Management
  - Lead Management (Add/View Leads)
  - Attendance Tracking
  - Client Management
  - Sales Pipeline
  
- **Accessible to all**:
  - Tasks & Follow-Ups (with role-based filtering)
  - Home Page
  - Contact Page

### Task Management
- **Admins can**:
  - Create tasks and assign to any user
  - View all tasks in the system
  - Edit or delete any task
  - Filter tasks by status and priority
  
- **Users can**:
  - View only their assigned tasks
  - Mark tasks as complete or pending
  - Filter their tasks by status and priority
  - Cannot create, edit, or delete tasks

### Session Management
- Login sessions are stored in localStorage (if "Remember Me" is checked) or sessionStorage
- Users can logout from any page using the Logout button in the navigation
- Session is cleared on logout, redirecting to the login page

## How to Assign Tasks (Admin)

1. Login as Admin
2. Navigate to **Tasks** page
3. Click **"Create New Task"** button
4. Fill in the task details:
   - Task Title
   - Task Type (Call, Meeting, Email, Follow-up, etc.)
   - Priority (High, Medium, Low)
   - **Assigned To** (select the user from dropdown)
   - Due Date and Time
   - Description (optional)
   - Enable Reminder (optional)
5. Click **"Save Task"**

The assigned user will then see this task when they login.

## How to View Assigned Tasks (User)

1. Login as User
2. Automatically redirected to **Tasks** page
3. View all tasks assigned to you
4. Use filters to sort by:
   - Status (All, Pending, Completed, Overdue)
   - Priority (All, High, Medium, Low)
5. Click the checkbox to mark a task as complete

## Security Features

- Role-based page access (non-admin users are redirected if they try to access admin pages)
- Session validation on every page load
- Automatic redirect to login if not authenticated
- Password-protected login with role verification

## User Account Management

### Option 1: Self-Registration (For Users)
Any user can create their own account:
1. Go to the homepage and click **"Login"**
2. Click **"Create Account"** at the bottom of the login form
3. Fill in your details and submit
4. Account is created with **'User'** role automatically
5. Login immediately with your new credentials

### Option 2: Admin-Created Accounts (For Admins)
Admins can create accounts with any role:
1. Login as Admin
2. Navigate to **User Management**
3. Click **"Add New User"**
4. Fill in user details:
   - Full Name
   - Email Address
   - Role (Admin, Sales Executive, Support Staff)
   - Status (Active, Inactive, Suspended)
   - Password (minimum 6 characters)
5. Click **"Save User"**

The new user can then login with their credentials.

**Key Difference**: 
- Self-registration creates **'User'** role only
- Admin can create accounts with **any role** (Admin, Sales, Support, User)

## Technical Implementation

- **Authentication**: Email + Password + Role verification
- **Session Storage**: localStorage/sessionStorage
- **Task Filtering**: Based on currentUser.id or currentUser.email
- **Access Control**: CSS class-based hiding + JavaScript validation
- **Default Users**: Pre-configured admin and user accounts

## Support

For any issues or questions, contact:
- **Phone**: +91 96001 06659
- **Email**: akash@dhanavruksha.in
- **Address**: Chennai, Tamil Nadu, India
