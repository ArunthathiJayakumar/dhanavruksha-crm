// API Configuration for DHANAVRUKSHA CRM
// Change API_BASE_URL for production deployment

const API_BASE_URL = 'http://localhost:8000/api'; // API Configuration

// API Endpoints
const API_ENDPOINTS = {
    // Authentication
    REGISTER: `${API_BASE_URL}/auth/register/`,
    LOGIN: `${API_BASE_URL}/auth/login/`,
    TOKEN_REFRESH: `${API_BASE_URL}/auth/token/refresh/`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password/`,
    CURRENT_USER: `${API_BASE_URL}/auth/me/`,
    
    // Resources
    USERS: `${API_BASE_URL}/users/`,
    TASKS: `${API_BASE_URL}/tasks/`,
    LEADS: `${API_BASE_URL}/leads/`,
    CLIENTS: `${API_BASE_URL}/clients/`,
    ATTENDANCE: `${API_BASE_URL}/attendance/`,
    PIPELINE: `${API_BASE_URL}/pipeline/`,
    DASHBOARD: `${API_BASE_URL}/dashboard/`,
};

// Helper function to get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Helper function to make API requests
async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: getAuthHeaders(),
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(endpoint, options);
        
        // Handle token expiration
        if (response.status === 401) {
            // Token expired, try to refresh
            const refreshed = await refreshToken();
            if (refreshed) {
                // Retry request with new token
                options.headers = getAuthHeaders();
                return await fetch(endpoint, options);
            } else {
                // Refresh failed, redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
                return null;
            }
        }
        
        return response;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Refresh access token
async function refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;
    
    try {
        const response = await fetch(API_ENDPOINTS.TOKEN_REFRESH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access);
            if (data.refresh) {
                localStorage.setItem('refresh_token', data.refresh);
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error('Token refresh error:', error);
        return false;
    }
}

// Check if user is authenticated
function isAuthenticated() {
    return !!localStorage.getItem('access_token');
}

// Get current user from localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Logout function
function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
