// API Configuration for Vercel Serverless Backend
const API_CONFIG = {
    // Base URL for API calls (Vercel backend)
    BASE_URL: 'https://dhanavruksha-crm-api.vercel.app/api',
    
    // Fallback to localhost for development
    FALLBACK_URL: 'http://localhost:3000/api',
    
    // API Endpoints
    ENDPOINTS: {
        USERS: '/users',
        TASKS: '/tasks',
        CLIENTS: '/clients',
        SALES_PIPELINE: '/sales-pipeline',
        ATTENDANCE: '/attendance'
    },
    
    // Headers for API requests
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    
    // Get full URL for endpoint
    getUrl: function(endpoint) {
        const baseUrl = this.BASE_URL || this.FALLBACK_URL;
        return baseUrl + this.ENDPOINTS[endpoint];
    },
    
    // Make API request with fallback
    request: async function(endpoint, options = {}) {
        const url = this.getUrl(endpoint);
        const config = {
            headers: this.HEADERS,
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            // Fallback to LocalStorage if API fails
            console.log('Falling back to LocalStorage');
            return this.getFromLocalStorage(endpoint);
        }
    },
    
    // Fallback to LocalStorage
    getFromLocalStorage: function(endpoint) {
        const storageKey = endpoint.toLowerCase();
        const data = localStorage.getItem(storageKey);
        return data ? JSON.parse(data) : [];
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
} else {
    window.API_CONFIG = API_CONFIG;
}
