// Tasks & Follow-Up Management JavaScript

let tasks = [];
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Get current user session - check both localStorage and sessionStorage
    currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
    
    console.log('Current user:', currentUser);
    
    // If no user is logged in, redirect to login
    if (!currentUser) {
        alert('Please login first to access this page!');
        window.location.href = 'index.html';
        return;
    }
    
    loadTasks();
    displayTasks();
    updateTaskStats();
    populateUserDropdown();
    checkReminders();
    setupRoleBasedUI();
});

// Open modal for adding task
function openAddTaskModal() {
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Create New Task';
    document.getElementById('taskForm').reset();
    document.getElementById('taskId').value = '';
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDueDate').setAttribute('min', today);
    
    document.getElementById('taskModal').classList.add('show');
}

// Close modal
function closeTaskModal() {
    document.getElementById('taskModal').classList.remove('show');
}

// Save task (create or update)
function saveTask(event) {
    event.preventDefault();
    
    const taskId = document.getElementById('taskId').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const dueTime = document.getElementById('taskDueTime').value || '23:59';
    
    const task = {
        id: taskId || generateTaskId(),
        title: document.getElementById('taskTitle').value.trim(),
        type: document.getElementById('taskType').value,
        priority: document.getElementById('taskPriority').value,
        assignedTo: document.getElementById('taskAssignedTo').value || '',
        dueDate: dueDate,
        dueTime: dueTime,
        relatedTo: document.getElementById('taskRelatedTo').value.trim(),
        description: document.getElementById('taskDescription').value.trim(),
        reminder: document.getElementById('taskReminder').checked,
        status: 'pending',
        createdDate: taskId ? getExistingTask(taskId).createdDate : new Date().toISOString(),
        completedDate: null
    };
    
    if (taskId) {
        // Update existing task
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            task.status = tasks[index].status; // Preserve status
            task.completedDate = tasks[index].completedDate;
            tasks[index] = task;
        }
    } else {
        // Add new task
        tasks.push(task);
    }
    
    saveTasks();
    displayTasks();
    updateTaskStats();
    closeTaskModal();
    
    showNotification(taskId ? 'Task updated successfully!' : 'Task created successfully!', 'success');
}

// Get existing task by ID
function getExistingTask(taskId) {
    return tasks.find(t => t.id === taskId);
}

// Generate unique task ID
function generateTaskId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TASK-${timestamp}-${random}`;
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('crmTasks', JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasks() {
    const stored = localStorage.getItem('crmTasks');
    if (stored) {
        tasks = JSON.parse(stored);
    }
}

// Display tasks with filters
function displayTasks() {
    const tasksList = document.getElementById('tasksList');
    const filterStatus = document.getElementById('filterStatus').value;
    const filterPriority = document.getElementById('filterPriority').value;
    
    tasksList.innerHTML = '';
    
    // Filter tasks based on user role
    let userFilteredTasks = [...tasks];
    
    // Non-admin users can only see tasks assigned to them
    if (currentUser.role !== 'admin') {
        userFilteredTasks = userFilteredTasks.filter(t => t.assignedTo === currentUser.id || t.assignedTo === currentUser.email);
    }
    
    if (userFilteredTasks.length === 0) {
        tasksList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #888;">
                <i class="fas fa-clipboard-check" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <p>${currentUser.role === 'admin' ? 'No tasks yet. Click "Create New Task" to add one.' : 'No tasks assigned to you yet.'}</p>
            </div>
        `;
        return;
    }
    
    // Apply status and priority filters
    let filteredTasks = [...userFilteredTasks];
    
    if (filterStatus !== 'all') {
        if (filterStatus === 'completed') {
            filteredTasks = filteredTasks.filter(t => t.status === 'completed');
        } else if (filterStatus === 'pending') {
            filteredTasks = filteredTasks.filter(t => t.status === 'pending' && !isOverdue(t));
        } else if (filterStatus === 'overdue') {
            filteredTasks = filteredTasks.filter(t => isOverdue(t));
        }
    }
    
    if (filterPriority !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.priority === filterPriority);
    }
    
    // Sort by due date and priority
    filteredTasks.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(a.dueDate + 'T' + a.dueTime) - new Date(b.dueDate + 'T' + b.dueTime);
    });
    
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        tasksList.appendChild(taskElement);
    });
}

// Create task element
function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `task-item priority-${task.priority} ${task.status === 'completed' ? 'completed' : ''}`;
    
    const dueDateTime = new Date(task.dueDate + 'T' + task.dueTime);
    const now = new Date();
    const isOverdueTask = dueDateTime < now && task.status !== 'completed';
    const isToday = dueDateTime.toDateString() === now.toDateString();
    
    let dueClass = 'upcoming';
    if (isOverdueTask) dueClass = 'overdue';
    else if (isToday) dueClass = 'today';
    
    div.innerHTML = `
        <input type="checkbox" class="task-checkbox" 
            ${task.status === 'completed' ? 'checked' : ''} 
            onchange="toggleTaskCompletion('${task.id}')">
        
        <div class="task-content">
            <h4 class="task-title">${escapeHtml(task.title)}</h4>
            <div class="task-meta">
                <span class="task-type-badge">${task.type}</span>
                <span class="task-meta-item">
                    <i class="fas fa-flag"></i>
                    <span style="text-transform: capitalize;">${task.priority}</span>
                </span>
                ${task.assignedTo ? `
                    <span class="task-meta-item">
                        <i class="fas fa-user-tie"></i>
                        <span>${getUserName(task.assignedTo)}</span>
                    </span>
                ` : ''}
                ${task.relatedTo ? `
                    <span class="task-meta-item">
                        <i class="fas fa-link"></i>
                        <span>${escapeHtml(task.relatedTo)}</span>
                    </span>
                ` : ''}
            </div>
        </div>
        
        <div class="task-due ${dueClass}">
            <i class="fas fa-calendar-alt"></i>
            ${formatDate(task.dueDate)} ${task.dueTime !== '23:59' ? 'at ' + formatTime(task.dueTime) : ''}
            ${isOverdueTask ? '<br><small>(Overdue)</small>' : ''}
        </div>
        
        <div class="task-actions">
            ${task.status === 'pending' ? `
                <button class="btn-task-action btn-complete-task" onclick="toggleTaskCompletion('${task.id}')" title="Mark Complete">
                    <i class="fas fa-check"></i>
                </button>
            ` : ''}
            <button class="btn-task-action btn-edit-task" onclick="editTask('${task.id}')" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-task-action btn-delete-task" onclick="deleteTask('${task.id}')" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return div;
}

// Toggle task completion
function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (task.status === 'completed') {
        task.status = 'pending';
        task.completedDate = null;
    } else {
        task.status = 'completed';
        task.completedDate = new Date().toISOString();
    }
    
    saveTasks();
    displayTasks();
    updateTaskStats();
    
    showNotification(
        task.status === 'completed' ? 'Task marked as complete!' : 'Task marked as pending!',
        'success'
    );
}

// Edit task
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Task';
    document.getElementById('taskId').value = task.id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskType').value = task.type;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskAssignedTo').value = task.assignedTo;
    document.getElementById('taskDueDate').value = task.dueDate;
    document.getElementById('taskDueTime').value = task.dueTime;
    document.getElementById('taskRelatedTo').value = task.relatedTo || '';
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskReminder').checked = task.reminder;
    
    document.getElementById('taskModal').classList.add('show');
}

// Delete task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        displayTasks();
        updateTaskStats();
        showNotification('Task deleted successfully!', 'success');
    }
}

// Filter tasks
function filterTasks() {
    displayTasks();
}

// Update task statistics
function updateTaskStats() {
    // Filter tasks based on user role
    let userFilteredTasks = [...tasks];
    
    // Non-admin users can only see tasks assigned to them
    if (currentUser.role !== 'admin') {
        userFilteredTasks = userFilteredTasks.filter(t => t.assignedTo === currentUser.id || t.assignedTo === currentUser.email);
    }
    
    const totalTasks = userFilteredTasks.length;
    const completedTasks = userFilteredTasks.filter(t => t.status === 'completed').length;
    const pendingTasks = userFilteredTasks.filter(t => t.status === 'pending' && !isOverdue(t)).length;
    const overdueTasks = userFilteredTasks.filter(t => isOverdue(t)).length;
    
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('pendingTasks').textContent = pendingTasks;
    document.getElementById('overdueTasks').textContent = overdueTasks;
}

// Check if task is overdue
function isOverdue(task) {
    if (task.status === 'completed') return false;
    const dueDateTime = new Date(task.dueDate + 'T' + task.dueTime);
    return dueDateTime < new Date();
}

// Check and show reminders
function checkReminders() {
    const now = new Date();
    
    tasks.forEach(task => {
        if (task.reminder && task.status === 'pending') {
            const dueDateTime = new Date(task.dueDate + 'T' + task.dueTime);
            const timeDiff = dueDateTime - now;
            
            // Show reminder if within 30 minutes of due time
            if (timeDiff > 0 && timeDiff < 30 * 60 * 1000) {
                showNotification(`⏰ Reminder: "${task.title}" is due soon!`, 'info');
            }
        }
    });
    
    // Display upcoming reminders
    displayUpcomingReminders();
}

// Display upcoming reminders
function displayUpcomingReminders() {
    const remindersList = document.getElementById('remindersList');
    const now = new Date();
    
    const upcomingTasks = tasks
        .filter(t => t.status === 'pending' && t.reminder)
        .filter(t => {
            const dueDateTime = new Date(t.dueDate + 'T' + t.dueTime);
            const timeDiff = dueDateTime - now;
            return timeDiff > 0 && timeDiff < 24 * 60 * 60 * 1000; // Next 24 hours
        })
        .sort((a, b) => new Date(a.dueDate + 'T' + a.dueTime) - new Date(b.dueDate + 'T' + b.dueTime));
    
    if (upcomingTasks.length === 0) {
        remindersList.innerHTML = '<p style="color: #888; text-align: center;">No upcoming reminders</p>';
        return;
    }
    
    remindersList.innerHTML = upcomingTasks.map(task => `
        <div class="reminder-item">
            <div class="reminder-icon">
                <i class="fas fa-bell"></i>
            </div>
            <div class="reminder-content">
                <div class="reminder-title">${escapeHtml(task.title)}</div>
                <div class="reminder-time">
                    <i class="fas fa-clock"></i>
                    Due: ${formatDate(task.dueDate)} at ${formatTime(task.dueTime)}
                </div>
            </div>
        </div>
    `).join('');
}

// Populate user dropdown from user management
function populateUserDropdown() {
    const storedUsers = localStorage.getItem('crmUsers');
    let users = [];
    
    if (storedUsers) {
        users = JSON.parse(storedUsers);
    } else {
        // Default users if none exist
        users = [
            { id: 'USR-001', name: 'Admin User', email: 'admin@dhanavruksha.com' },
            { id: 'USR-002', name: 'Regular User', email: 'user@dhanavruksha.com' }
        ];
    }
    
    const select = document.getElementById('taskAssignedTo');
    select.innerHTML = '<option value="">Select User</option>' +
        users.map(u => `<option value="${u.id}">${u.name} (${u.email})</option>`).join('');
}

// Setup UI based on user role
function setupRoleBasedUI() {
    const addTaskBar = document.querySelector('.add-task-bar');
    const createTaskButton = document.querySelector('.btn-primary[onclick="openAddTaskModal()"]');
    
    // Non-admin users cannot create tasks, only view their assigned tasks
    if (currentUser.role !== 'admin') {
        if (createTaskButton) {
            createTaskButton.style.display = 'none';
        }
        
        // Update page header for non-admin users
        const headerP = document.querySelector('.tasks-header p');
        if (headerP) {
            headerP.textContent = 'View and manage your assigned tasks';
        }
        
        // Hide admin-only navigation links
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'none';
        });
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Get user name by ID
function getUserName(userId) {
    const storedUsers = localStorage.getItem('crmUsers');
    if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const user = users.find(u => u.id === userId || u.email === userId);
        if (user) {
            return user.name;
        }
    }
    
    // Fallback to default mapping
    const defaultUsers = {
        'USR-001': 'Admin User',
        'USR-002': 'Regular User'
    };
    return defaultUsers[userId] || userId;
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

// Format time
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Escape HTML
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
    const modal = document.getElementById('taskModal');
    if (event.target === modal) {
        closeTaskModal();
    }
}

console.log('Tasks JS loaded');
