// API Configuration for Vercel Serverless Backend
const API_CONFIG = {
    // Base URL for API calls
    BASE_URL: process.env.NODE_ENV === 'production' 
        ? 'https://dhanavruksha-crm.vercel.app/api' 
        : 'http://localhost:3000/api',
    
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
        return this.BASE_URL + this.ENDPOINTS[endpoint];
    },
    
    // Make API request
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
            throw error;
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
} else {
    window.API_CONFIG = API_CONFIG;
}
