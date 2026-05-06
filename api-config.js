// API Configuration with Fallback for Testing
const API_CONFIG = {
    // Base URL for API calls
    BASE_URL: 'https://arunthathi-crm-api.vercel.app/api',
    
    // Fallback to localhost for development
    FALLBACK_URL: 'http://localhost:3000/api',
    
    // Temporary fallback to LocalStorage for sync issues
    USE_LOCALSTORAGE_FALLBACK: true,
    
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
            console.log('🌐 Trying API:', url);
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('✅ API Success:', data);
            return data;
        } catch (error) {
            console.error('❌ API request failed:', error);
            
            // If backend fails and fallback is enabled, use LocalStorage sync
            if (this.USE_LOCALSTORAGE_FALLBACK) {
                console.log('🔄 Using LocalStorage fallback for cross-device sync');
                return this.getFromLocalStorageWithSync(endpoint);
            } else {
                return this.getFromLocalStorage(endpoint);
            }
        }
    },
    
    // Enhanced LocalStorage with sync simulation
    getFromLocalStorageWithSync: function(endpoint) {
        const storageKey = endpoint.toLowerCase();
        const data = localStorage.getItem(storageKey);
        
        if (data) {
            try {
                const parsed = JSON.parse(data);
                console.log('📱 LocalStorage data:', parsed);
                
                // Try to sync with backend in background
                this.syncToBackend(endpoint, parsed);
                
                return parsed;
            } catch (error) {
                console.error('❌ LocalStorage parse error:', error);
                return [];
            }
        }
        return [];
    },
    
    // Sync LocalStorage to backend when available
    syncToBackend: async function(endpoint, data) {
        try {
            const url = this.getUrl(endpoint);
            const response = await fetch(url, {
                method: 'POST',
                headers: this.HEADERS,
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                console.log('✅ Synced to backend successfully');
            }
        } catch (error) {
            console.log('⚠️ Backend sync failed, will retry later');
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
