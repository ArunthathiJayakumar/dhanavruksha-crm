// Show notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        background: type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: '100000',
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

// Demo button functionality
const demoButtons = document.querySelectorAll('.btn-secondary');
demoButtons.forEach(button => {
    if (button.textContent.includes('Watch Demo') || button.textContent.includes('Schedule Demo')) {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('📹 Demo video coming soon! Contact us for a personalized tour at demo@portalcrm.com');
        });
    }
});

// Login Modal Functions
function openLoginModal() {
    document.getElementById('loginModal').classList.add('show');
    document.body.classList.add('modal-open');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('show');
    document.body.classList.remove('modal-open');
}

// Registration Modal Functions
function openRegisterModal() {
    document.getElementById('registerModal').classList.add('show');
    document.body.classList.add('modal-open');
}

function closeRegisterModal() {
    document.getElementById('registerModal').classList.remove('show');
    document.body.classList.remove('modal-open');
}

// Handle registration form submission - API VERSION
async function handleRegistration(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    console.log('Registration attempt for:', email);
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters!', 'error');
        return;
    }
    
    // Split name into first and last name
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || ' ';
    
    try {
        // Try API registration first
        const response = await fetch(API_ENDPOINTS.REGISTER, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                first_name: firstName,
                last_name: lastName,
                password: password,
                password_confirm: confirmPassword
            })
        });
        
        // Check if response is OK
        if (!response.ok) {
            // Try to parse error message
            let errorMessage = 'Registration failed';
            try {
                const data = await response.json();
                const errors = Object.values(data).flat();
                errorMessage = errors.join(', ');
            } catch (e) {
                // If can't parse JSON, use status text
                errorMessage = `Server error: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        
        // Clear the form
        document.getElementById('registerForm').reset();
        
        // Close registration modal
        closeRegisterModal();
        
        // Show success message
        showNotification('Account created successfully! Please login with your credentials.', 'success');
        
        // Open login modal after 1.5 seconds
        setTimeout(() => {
            openLoginModal();
        }, 1500);
        
    } catch (error) {
        console.error('Registration API error:', error);
        
        // Fallback: Create user in localStorage if API fails
        console.log('API not available, creating user in localStorage...');
        
        // Get existing users or create empty array
        let users = [];
        const storedUsers = localStorage.getItem('crmUsers');
        if (storedUsers) {
            users = JSON.parse(storedUsers);
        }
        
        // Check if email already exists
        if (users.find(u => u.email === email)) {
            showNotification('Email already registered!', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            id: 'USR-' + Date.now(),
            name: name,
            email: email,
            password: password, // Note: In production, never store plain passwords!
            role: 'user',
            first_name: firstName,
            last_name: lastName
        };
        
        users.push(newUser);
        localStorage.setItem('crmUsers', JSON.stringify(users));
        
        // Clear the form
        document.getElementById('registerForm').reset();
        
        // Close registration modal
        closeRegisterModal();
        
        // Show success message
        showNotification('Account created successfully! Please login with your credentials.', 'success');
        
        // Open login modal after 1.5 seconds
        setTimeout(() => {
            openLoginModal();
        }, 1500);
    }
}

// Handle login form submission - FIXED VERSION
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const loginBtn = document.getElementById('loginBtn');
    
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email (normalized):', email);
    console.log('Password:', password);
    console.log('Role:', role);
    
    // Show loading state
    const originalBtnText = loginBtn.innerHTML;
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    
    try {
        // Get users from localStorage
        let stored = localStorage.getItem('crmUsers');
        console.log('📦 Stored users data:', stored);
        
        // If no users found, try to get from sessionStorage or create default
        if (!stored) {
            console.log('❌ No users in localStorage, checking sessionStorage...');
            stored = sessionStorage.getItem('crmUsers');
            console.log('📦 SessionStorage data:', stored);
            
            if (stored) {
                // Move from sessionStorage to localStorage
                localStorage.setItem('crmUsers', stored);
                console.log('✅ Moved users from sessionStorage to localStorage');
            } else {
                console.log('❌ No users found anywhere, creating default admin...');
                // Create default admin user
                const defaultUsers = [{
                    id: 'USR-001',
                    name: 'Admin User',
                    email: 'admin@dhanavruksha.com',
                    role: 'admin',
                    status: 'active',
                    password: 'admin123',
                    createdDate: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                }];
                localStorage.setItem('crmUsers', JSON.stringify(defaultUsers));
                stored = JSON.stringify(defaultUsers);
                console.log('✅ Default admin created');
            }
        }
        
        if (!stored) {
            console.log('❌ Still no users found!');
            console.log('Checking all localStorage keys:', Object.keys(localStorage));
            throw new Error('No users found. Please contact administrator.');
        }
        
        const users = JSON.parse(stored);
        console.log('👥 Total users found:', users.length);
        console.log('📋 User list:', users.map(u => ({email: u.email, role: u.role, status: u.status})));
        
        // Normalize emails for comparison (case-insensitive)
        const normalizedUsers = users.map(u => ({
            ...u,
            email: u.email.toLowerCase().trim()
        }));
        
        console.log('📋 Normalized user emails:', normalizedUsers.map(u => u.email));
        console.log('🔍 Looking for email:', email);
        
        // Find user by normalized email
        const user = normalizedUsers.find(u => u.email === email);
        
        if (!user) {
            console.log('❌ No user found with email:', email);
            console.log('Available emails:', normalizedUsers.map(u => u.email));
            console.log('Raw comparison test:');
            normalizedUsers.forEach(u => {
                console.log(`  ${u.email} === ${email} ?`, u.email === email);
            });
            throw new Error(`Email not found: ${email}. Available emails: ${normalizedUsers.map(u => u.email).join(', ')}`);
        }
        
        console.log('✅ User found:', user.name, '| Role:', user.role, '| Status:', user.status);
        
        // Check password
        if (user.password !== password) {
            console.log('❌ Password mismatch');
            throw new Error('Incorrect password. Please try again.');
        }
        
        console.log('✅ Password verified');
        
        // Check role
        if (user.role !== role) {
            console.log('❌ Role mismatch - User has:', user.role, 'Selected:', role);
            throw new Error(`Wrong role selected. Your account role is: ${user.role}`);
        }
        
        console.log('✅ Role verified');
        
        // Check status
        if (user.status === 'inactive' || user.status === 'suspended') {
            console.log('❌ Account not active:', user.status);
            throw new Error(`Your account is ${user.status}. Please contact admin.`);
        }
        
        console.log('✅ Account status: active');
        
        // Create user session
        const userData = {
            id: user.id,
            email: user.email,
            first_name: user.name.split(' ')[0],
            last_name: user.name.split(' ').slice(1).join(' ') || '',
            role: user.role
        };
        
        console.log('🔐 Creating session:', userData);
        
        // Store session
        if (rememberMe) {
            localStorage.setItem('currentUser', JSON.stringify(userData));
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(userData));
        }
        
        // Update last login
        user.lastLogin = new Date().toISOString();
        localStorage.setItem('crmUsers', JSON.stringify(normalizedUsers));
        
        console.log('✅ Session created and last login updated');
        
        // Close modal
        closeLoginModal();
        
        // Show success
        showNotification(`Welcome back, ${user.name}! Login successful.`, 'success');
        
        // Redirect after 1 second
        setTimeout(() => {
            console.log('🚀 Redirecting to:', role === 'admin' ? 'user-management.html' : 'tasks.html');
            if (role === 'admin') {
                window.location.href = 'user-management.html';
            } else {
                window.location.href = 'tasks.html';
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Login error:', error);
        showNotification(error.message, 'error');
        
        // Reset button
        loginBtn.disabled = false;
        loginBtn.innerHTML = originalBtnText;
    }
}

// Debug function to check stored users
function debugStoredUsers() {
    const stored = localStorage.getItem('crmUsers');
    console.log('=== DEBUG: Stored Users ===');
    if (stored) {
        const users = JSON.parse(stored);
        console.log('Number of users:', users.length);
        users.forEach((user, index) => {
            console.log(`User ${index + 1}:`, {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                hasPassword: !!user.password
            });
        });
    } else {
        console.log('No users found in localStorage');
        console.log('All localStorage keys:', Object.keys(localStorage));
    }
}

// Quick debug function - call this in console
function quickDebug() {
    console.log('=== QUICK DEBUG ===');
    const stored = localStorage.getItem('crmUsers');
    console.log('Raw stored data:', stored);
    
    if (stored) {
        try {
            const users = JSON.parse(stored);
            console.log('Parsed users:', users);
            console.log('Emails:', users.map(u => u.email));
        } catch (e) {
            console.log('JSON parse error:', e);
        }
    } else {
        console.log('No crmUsers key found');
        console.log('Available keys:', Object.keys(localStorage));
    }
}

// Add this to global scope for easy access
window.debugStoredUsers = debugStoredUsers;
window.quickDebug = quickDebug;

// Manual import function - run this in console to copy users from user-management
window.importUsers = function() {
    console.log('=== MANUAL USER IMPORT ===');
    
    // Try to get users from different sources
    const sources = [
        () => localStorage.getItem('crmUsers'),
        () => sessionStorage.getItem('crmUsers'),
        () => {
            // Try to get from user-management page (if accessible)
            try {
                return localStorage.getItem('crmUsers');
            } catch (e) {
                return null;
            }
        }
    ];
    
    let foundUsers = null;
    for (const source of sources) {
        try {
            const data = source();
            if (data) {
                foundUsers = data;
                console.log('Found users in source:', data);
                break;
            }
        } catch (e) {
            console.log('Source failed:', e);
        }
    }
    
    if (foundUsers) {
        // Save to current localStorage
        localStorage.setItem('crmUsers', foundUsers);
        console.log('✅ Users imported successfully!');
        console.log('Imported data:', JSON.parse(foundUsers));
        return true;
    } else {
        console.log('❌ No users found to import');
        return false;
    }
};

// Auto-sync function
window.autoSyncUsers = function() {
    console.log('=== AUTO SYNC USERS ===');
    
    // Check if we have users in current localStorage
    const currentUsers = localStorage.getItem('crmUsers');
    if (!currentUsers) {
        console.log('No users in current localStorage, trying to import...');
        return window.importUsers();
    } else {
        console.log('Users already exist in current localStorage');
        return true;
    }
};

// Add this to login function for debugging
// Call debugStoredUsers() in browser console to check users

// Check if user is already logged in
function checkUserSession() {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        showNotification(`Welcome back, ${user.first_name} ${user.last_name}!`, 'success');
    }
    
    // Initialize default admin user in localStorage
    function initializeDefaultUser() {
        const stored = localStorage.getItem('crmUsers');
        if (!stored) {
            const defaultUsers = [{
                id: 'USR-001',
                name: 'Admin User',
                email: 'admin@dhanavruksha.com',
                role: 'admin',
                status: 'active',
                password: 'admin123',
                createdDate: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            }];
            localStorage.setItem('crmUsers', JSON.stringify(defaultUsers));
            console.log('✅ Default admin user created');
        } else {
            // Verify admin user exists
            const users = JSON.parse(stored);
            const adminExists = users.find(u => u.email === 'admin@dhanavruksha.com');
            if (!adminExists) {
                console.log('⚠️ Admin user not found, adding...');
                users.push({
                    id: 'USR-001',
                    name: 'Admin User',
                    email: 'admin@dhanavruksha.com',
                    role: 'admin',
                    status: 'active',
                    password: 'admin123',
                    createdDate: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                });
                localStorage.setItem('crmUsers', JSON.stringify(users));
                console.log('✅ Admin user added to existing users');
            }
        }
        
        // Initialize sample data for demo
        initializeSampleData();
    }

    // Initialize sample data for demonstration
    function initializeSampleData() {
        // Sample tasks
        if (!localStorage.getItem('tasks')) {
            const sampleTasks = [
                {
                    id: 1,
                    title: 'Follow up with ABC Corporation',
                    description: 'Call client regarding website development proposal',
                    assignedTo: 'admin@dhanavruksha.com',
                    priority: 'high',
                    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    status: 'pending',
                    createdBy: 'admin@dhanavruksha.com',
                    createdDate: new Date().toISOString()
                },
                {
                    id: 2,
                    title: 'Prepare sales report',
                    description: 'Monthly sales performance report for management',
                    assignedTo: 'admin@dhanavruksha.com',
                    priority: 'medium',
                    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
                    status: 'in-progress',
                    createdBy: 'admin@dhanavruksha.com',
                    createdDate: new Date().toISOString()
                },
                {
                    id: 3,
                    title: 'Meeting with XYZ Solutions',
                    description: 'Discuss mobile app requirements and timeline',
                    assignedTo: 'admin@dhanavruksha.com',
                    priority: 'high',
                    dueDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
                    status: 'pending',
                    createdBy: 'admin@dhanavruksha.com',
                    createdDate: new Date().toISOString()
                }
            ];
            localStorage.setItem('tasks', JSON.stringify(sampleTasks));
        }

        // Sample clients
        if (!localStorage.getItem('clients')) {
            const sampleClients = [
                {
                    id: 1,
                    name: 'ABC Corporation',
                    email: 'contact@abc.com',
                    phone: '+91 9876543210',
                    company: 'ABC Corporation',
                    status: 'active',
                    assignedTo: 'admin@dhanavruksha.com',
                    meetings: [
                        {
                            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                            type: 'Initial Meeting',
                            notes: 'Discussed website requirements and budget of ₹2,50,000',
                            nextAction: 'Send detailed proposal'
                        },
                        {
                            date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
                            type: 'Follow-up Call',
                            notes: 'Client interested in proceeding with development',
                            nextAction: 'Finalize contract'
                        }
                    ],
                    createdBy: 'admin@dhanavruksha.com',
                    createdDate: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'XYZ Solutions',
                    email: 'info@xyz.com',
                    phone: '+91 9876543211',
                    company: 'XYZ Solutions',
                    status: 'lead',
                    assignedTo: 'admin@dhanavruksha.com',
                    meetings: [
                        {
                            date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
                            type: 'Discovery Call',
                            notes: 'Initial discussion about mobile app development',
                            nextAction: 'Send requirements document'
                        }
                    ],
                    createdBy: 'admin@dhanavruksha.com',
                    createdDate: new Date().toISOString()
                },
                {
                    id: 3,
                    name: 'TechStart Industries',
                    email: 'hello@techstart.com',
                    phone: '+91 9876543212',
                    company: 'TechStart Industries',
                    status: 'proposal',
                    assignedTo: 'admin@dhanavruksha.com',
                    meetings: [],
                    createdBy: 'admin@dhanavruksha.com',
                    createdDate: new Date().toISOString()
                }
            ];
            localStorage.setItem('clients', JSON.stringify(sampleClients));
        }

        // Sample sales pipeline
        if (!localStorage.getItem('salesPipeline')) {
            const sampleDeals = [
                {
                    id: 1,
                    clientName: 'ABC Corporation',
                    dealName: 'Website Development',
                    value: 250000,
                    probability: 75,
                    stage: 'proposal',
                    expectedCloseDate: new Date(Date.now() + 2592000000).toISOString().split('T')[0],
                    assignedTo: 'admin@dhanavruksha.com',
                    createdBy: 'admin@dhanavruksha.com',
                    createdDate: new Date().toISOString()
                },
                {
                    id: 2,
                    clientName: 'XYZ Solutions',
                    dealName: 'Mobile App Development',
                    value: 150000,
                    probability: 50,
                    stage: 'negotiation',
                    expectedCloseDate: new Date(Date.now() + 5184000000).toISOString().split('T')[0],
                    assignedTo: 'admin@dhanavruksha.com',
                    createdBy: 'admin@dhanavruksha.com',
                    createdDate: new Date().toISOString()
                },
                {
                    id: 3,
                    clientName: 'TechStart Industries',
                    dealName: 'CRM Integration',
                    value: 180000,
                    probability: 25,
                    stage: 'qualification',
                    expectedCloseDate: new Date(Date.now() + 7776000000).toISOString().split('T')[0],
                    assignedTo: 'admin@dhanavruksha.com',
                    createdBy: 'admin@dhanavruksha.com',
                    createdDate: new Date().toISOString()
                }
            ];
            localStorage.setItem('salesPipeline', JSON.stringify(sampleDeals));
        }

        // Sample attendance data
        if (!localStorage.getItem('attendanceData')) {
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            
            const sampleAttendance = {};
            const staffNames = ['Krishna Dassan', 'Balaji V', 'Balaji S', 'Ganesh T', 'Bharathi K', 'Thirunavukarasu', 'Vijay', 'Keerthana', 'Akash', 'Aarthi'];
            
            staffNames.forEach((name, index) => {
                sampleAttendance[index + 1] = {};
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(currentYear, currentMonth, day);
                    const dayOfWeek = date.getDay();
                    
                    // Random attendance for demo (weekends off)
                    if (dayOfWeek === 0 || dayOfWeek === 6) {
                        sampleAttendance[index + 1][day] = { status: null, time: null };
                    } else {
                        const isPresent = Math.random() > 0.2; // 80% attendance rate
                        sampleAttendance[index + 1][day] = {
                            status: isPresent ? 'present' : 'absent',
                            time: isPresent ? '09:00 AM' : null
                        };
                    }
                }
            });
            
            localStorage.setItem('attendanceData', JSON.stringify(sampleAttendance));
        }

        console.log('✅ Sample data initialized for demo');
    }

    initializeDefaultUser();
}

// Initialize login check
document.addEventListener('DOMContentLoaded', () => {
    checkUserSession();
});

// ... (rest of the code remains the same)
// Close modal when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === registerModal) {
        closeRegisterModal();
    }
}
