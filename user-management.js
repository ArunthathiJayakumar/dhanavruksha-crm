// User Management JavaScript

let users = [];
let currentUser = null;

// Initialize with default admin user
const defaultUsers = [
    {
        id: 'USR-001',
        name: 'Admin User',
        email: 'admin@dhanavruksha.com',
        role: 'admin',
        status: 'active',
        password: 'admin123', // In production, this should be hashed
        createdDate: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    }
];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Get current user session
    currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
    
    // If no user is logged in, redirect to login
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Only admins can access user management
    if (currentUser.role !== 'admin') {
        showNotification('Access denied. Admin privileges required.', 'error');
        setTimeout(() => {
            window.location.href = 'tasks.html';
        }, 1500);
        return;
    }
    
    await loadUsers();
    displayUsers();
    updateUserStats();
});

// Open modal for adding user
function openAddUserModal() {
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Add New User';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userModal').classList.add('show');
}

// Close modal
function closeUserModal() {
    document.getElementById('userModal').classList.remove('show');
}

// Save user (create or update)
function saveUser(event) {
    event.preventDefault();
    
    const userId = document.getElementById('userId').value;
    
    const user = {
        id: userId || generateUserId(),
        name: document.getElementById('userName').value.trim(),
        email: document.getElementById('userEmail').value.trim(),
        role: document.getElementById('userRole').value,
        status: document.getElementById('userStatus').value,
        password: document.getElementById('userPassword').value,
        createdDate: userId ? getExistingUser(userId).createdDate : new Date().toISOString(),
        lastLogin: userId ? getExistingUser(userId).lastLogin : null
    };
    
    console.log('=== SAVING USER ===');
    console.log('User data:', user);
    
    if (userId) {
        // Update existing user - preserve password if empty
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            if (!user.password) {
                user.password = users[index].password;
            }
            users[index] = user;
            console.log('User updated:', user);
        }
    } else {
        // Check if email already exists
        if (users.some(u => u.email === user.email)) {
            alert('Email address already exists!');
            return;
        }
        users.push(user);
        console.log('User added:', user);
    }
    
    saveUsers();
    console.log('Users saved to localStorage');
    displayUsers();
    updateUserStats();
    closeUserModal();
    
    showNotification(userId ? 'User updated successfully!' : 'User created successfully!', 'success');
}

// Get existing user by ID
function getExistingUser(userId) {
    return users.find(u => u.id === userId);
}

// Generate unique user ID
function generateUserId() {
    const count = users.length + 1;
    return `USR-${String(count).padStart(3, '0')}`;
}

// Save users to localStorage
function saveUsers() {
    console.log('=== SAVING USERS TO LOCALSTORAGE ===');
    console.log('Users to save:', users);
    
    // Save to both localStorage and sessionStorage for cross-page compatibility
    const usersJSON = JSON.stringify(users);
    localStorage.setItem('crmUsers', usersJSON);
    sessionStorage.setItem('crmUsers', usersJSON);
    
    // Verify save worked
    const saved = localStorage.getItem('crmUsers');
    console.log('Verification - saved data:', saved);
    const parsed = JSON.parse(saved);
    console.log('Verification - parsed users:', parsed);
    console.log('=== SAVE COMPLETE ===');
}

// Load users from backend API
async function loadUsers() {
    console.log('=== LOADING USERS FROM BACKEND ===');
    
    try {
        users = await API_CONFIG.request('USERS');
        console.log('✅ Loaded users from backend:', users);
        console.log('✅ Total users loaded:', users.length);
        
        // Verify users array is valid
        if (!Array.isArray(users)) {
            console.error('❌ Users data is not an array, using fallback...');
            users = [...defaultUsers];
        } else if (users.length === 0) {
            console.warn('⚠️ Users array is empty, initializing with default admin...');
            users = [...defaultUsers];
        }
    } catch (error) {
        console.error('❌ Error loading users from backend:', error);
        console.log('Falling back to LocalStorage...');
        const stored = localStorage.getItem('crmUsers');
        if (stored) {
            try {
                users = JSON.parse(stored);
            } catch (parseError) {
                console.error('❌ Error parsing LocalStorage:', parseError);
                users = [...defaultUsers];
            }
        } else {
            users = [...defaultUsers];
        }
    }
    
    console.log('✅ Final users array:', users);
}

// Display users in table
function displayUsers() {
    console.log('=== DISPLAYING USERS ===');
    console.log('Users to display:', users);
    console.log('Users count:', users.length);
    
    const tableBody = document.getElementById('usersTableBody');
    
    if (!tableBody) {
        console.error('❌ usersTableBody element not found!');
        return;
    }
    
    tableBody.innerHTML = '';
    
    if (users.length === 0) {
        console.warn('⚠️ No users to display');
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 3rem; color: #888;">
                    <i class="fas fa-users-slash" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    No users found. Click "Add New User" to create one.
                </td>
            </tr>
        `;
        return;
    }
    
    console.log(`✅ Displaying ${users.length} user(s)`);
    
    users.forEach((user, index) => {
        console.log(`Displaying user ${index + 1}:`, user);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${user.id}</strong></td>
            <td>${escapeHtml(user.name)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td><span class="role-badge ${user.role}">${user.role}</span></td>
            <td><span class="status-badge ${user.status}">${user.status}</span></td>
            <td>${formatDate(user.createdDate)}</td>
            <td>${user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</td>
            <td>
                <button class="btn-deal-action btn-edit" onclick="editUser('${user.id}')" style="margin-right: 0.5rem;">
                    <i class="fas fa-edit"></i> Edit
                </button>
                ${user.id !== 'USR-001' ? `
                    <button class="btn-deal-action btn-delete-deal" onclick="deleteUser('${user.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : '<span style="color: #888; font-size: 0.85rem;">Default Admin</span>'}
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    console.log('✅ Users displayed successfully');
}

// Edit user
function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit User';
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userStatus').value = user.status;
    document.getElementById('userPassword').value = ''; // Clear password field
    
    document.getElementById('userModal').classList.add('show');
}

// Delete user
function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        users = users.filter(u => u.id !== userId);
        saveUsers();
        displayUsers();
        updateUserStats();
        showNotification('User deleted successfully!', 'success');
    }
}

// Update user statistics
function updateUserStats() {
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const userCount = users.filter(u => u.role === 'user').length;
    
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('adminCount').textContent = adminCount;
    document.getElementById('userCount').textContent = userCount;
}

// Format date
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        background: type === 'success' ? '#28a745' : '#17a2b8',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontWeight: '600',
        animation: 'slideInRight 0.3s ease',
        maxWidth: '400px'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target === modal) {
        closeUserModal();
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

console.log('User Management JS loaded');
