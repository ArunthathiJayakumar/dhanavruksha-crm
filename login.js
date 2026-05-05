// ==========================================
// CLEAN LOGIN SYSTEM - COMPLETELY NEW
// ==========================================

// Show notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 100000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

// ==========================================
// MODAL FUNCTIONS
// ==========================================

function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('show');
        document.body.classList.add('modal-open');
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
    }
}

// ==========================================
// INITIALIZE DEFAULT ADMIN USER
// ==========================================

function initializeUsers() {
    const stored = localStorage.getItem('crmUsers');
    
    if (!stored) {
        // Create fresh admin user
        const adminUser = {
            id: 'USR-001',
            name: 'Admin User',
            email: 'admin@dhanavruksha.com',
            password: 'admin123',
            role: 'admin',
            status: 'active',
            createdDate: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        localStorage.setItem('crmUsers', JSON.stringify([adminUser]));
        console.log('✅ Admin user created successfully');
    } else {
        console.log('✅ Users already exist');
    }
}

// ==========================================
// LOGIN HANDLER - SIMPLE & RELIABLE
// ==========================================

function handleLogin(event) {
    event.preventDefault();
    
    // Get form values
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const loginBtn = document.getElementById('loginBtn');
    
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Role:', role);
    
    // Show loading
    const originalText = loginBtn.innerHTML;
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    
    try {
        // Step 1: Get users from localStorage
        const stored = localStorage.getItem('crmUsers');
        
        if (!stored) {
            throw new Error('No users found. Please reload the page.');
        }
        
        const users = JSON.parse(stored);
        console.log('Total users:', users.length);
        
        // Step 2: Find user by email
        const user = users.find(u => u.email === email);
        
        if (!user) {
            throw new Error('Email not found. Please check your email.');
        }
        
        console.log('User found:', user.email);
        
        // Step 3: Check password
        if (user.password !== password) {
            throw new Error('Incorrect password. Please try again.');
        }
        
        console.log('Password verified ✓');
        
        // Step 4: Check role
        if (user.role !== role) {
            throw new Error(`Wrong role. Your account is: ${user.role}`);
        }
        
        console.log('Role verified ✓');
        
        // Step 5: Check status
        if (user.status === 'inactive' || user.status === 'suspended') {
            throw new Error(`Account is ${user.status}. Contact admin.`);
        }
        
        console.log('Account active ✓');
        
        // Step 6: Create session
        const userData = {
            id: user.id,
            email: user.email,
            first_name: user.name.split(' ')[0],
            last_name: user.name.split(' ').slice(1).join(' ') || '',
            role: user.role
        };
        
        if (rememberMe) {
            localStorage.setItem('currentUser', JSON.stringify(userData));
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(userData));
        }
        
        // Step 7: Update last login
        user.lastLogin = new Date().toISOString();
        localStorage.setItem('crmUsers', JSON.stringify(users));
        
        console.log('Session created ✓');
        
        // Step 8: Close modal
        closeLoginModal();
        
        // Step 9: Show success
        showNotification(`Welcome, ${user.name}!`, 'success');
        
        // Step 10: Redirect
        setTimeout(() => {
            if (role === 'admin') {
                window.location.href = 'user-management.html';
            } else {
                window.location.href = 'tasks.html';
            }
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification(error.message, 'error');
        
        // Reset button
        loginBtn.disabled = false;
        loginBtn.innerHTML = originalText;
    }
}

// ==========================================
// CHECK IF ALREADY LOGGED IN
// ==========================================

function checkExistingSession() {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    
    if (currentUser) {
        const user = JSON.parse(currentUser);
        console.log('User already logged in:', user.email);
        
        showNotification(`Already logged in as ${user.first_name} ${user.last_name}. Redirecting...`, 'info');
        
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = 'user-management.html';
            } else {
                window.location.href = 'tasks.html';
            }
        }, 2000);
        
        return true;
    }
    
    return false;
}

// ==========================================
// INITIALIZE ON PAGE LOAD
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Create admin user if needed
    initializeUsers();
    
    // Check if already logged in
    checkExistingSession();
    
    // Auto-open login modal after 500ms
    setTimeout(() => {
        openLoginModal();
    }, 500);
});

// Close modal when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    if (event.target === loginModal) {
        closeLoginModal();
    }
}
