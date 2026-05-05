// Sales Pipeline Management JavaScript

let deals = [];

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Check if current user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Get user-specific storage key
function getUserStorageKey() {
    const user = getCurrentUser();
    return user ? `salesDeals_${user.email}` : 'salesDeals';
}

// Get all deals (admin sees all, users see their own)
function getAllDeals() {
    if (isAdmin()) {
        // Admin sees all deals from all users
        const allDeals = [];
        const keys = Object.keys(localStorage).filter(key => key.startsWith('salesDeals_'));
        keys.forEach(key => {
            try {
                const userDeals = JSON.parse(localStorage.getItem(key) || '[]');
                allDeals.push(...userDeals);
            } catch (error) {
                console.log('Error loading deals for key:', key);
            }
        });
        return allDeals;
    } else {
        // Regular users see only their own deals
        return deals;
    }
}

// Probability percentages for each stage
const stageProbabilities = {
    lead: 10,
    contacted: 25,
    proposal: 50,
    negotiation: 75,
    won: 100,
    lost: 0
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Please login to access sales pipeline!', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    loadDeals();
    displayDeals();
    updatePipelineStats();
});

// Open modal for adding deal
function openAddDealModal() {
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Add New Deal';
    document.getElementById('dealForm').reset();
    document.getElementById('dealId').value = '';
    document.getElementById('probability').value = '';
    document.getElementById('expectedRevenue').value = '';
    document.getElementById('dealModal').classList.add('show');
    
    // Initialize probability calculation
    updateProbability();
}

// Close modal
function closeDealModal() {
    document.getElementById('dealModal').classList.remove('show');
}

// Update probability based on stage
function updateProbability() {
    const stage = document.getElementById('dealStage').value;
    const dealValue = parseFloat(document.getElementById('dealValue').value) || 0;
    
    if (stage && stageProbabilities[stage] !== undefined) {
        const probability = stageProbabilities[stage];
        document.getElementById('probability').value = probability + '%';
        
        const expectedRevenue = (dealValue * probability / 100).toFixed(2);
        document.getElementById('expectedRevenue').value = '₹' + formatNumber(expectedRevenue);
    }
}

// Save deal (create or update)
function saveDeal(event) {
    event.preventDefault();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Please login to save deals!', 'error');
        return;
    }
    
    const dealId = document.getElementById('dealId').value;
    const stage = document.getElementById('dealStage').value;
    const dealValue = parseFloat(document.getElementById('dealValue').value) || 0;
    const probability = stageProbabilities[stage] || 0;
    const expectedRevenue = (dealValue * probability / 100).toFixed(2);
    
    const deal = {
        id: dealId || generateDealId(),
        userId: currentUser.email,
        client: document.getElementById('clientName').value.trim(),
        value: dealValue,
        stage: stage,
        probability: probability,
        expectedRevenue: parseFloat(expectedRevenue),
        description: document.getElementById('description').value.trim(),
        createdDate: dealId ? getExistingDeal(dealId).createdDate : new Date().toISOString(),
        modifiedDate: new Date().toISOString()
    };
    
    if (dealId) {
        // Update existing deal
        const index = deals.findIndex(d => d.id === dealId);
        if (index !== -1) {
            deals[index] = deal;
        }
    } else {
        // Add new deal
        deals.push(deal);
    }
    
    saveDeals();
    displayDeals();
    updatePipelineStats();
    closeDealModal();
    
    showNotification(dealId ? 'Deal updated successfully!' : 'Deal created successfully!', 'success');
}

// Get existing deal by ID
function getExistingDeal(dealId) {
    return deals.find(d => d.id === dealId);
}

// Generate unique deal ID
function generateDealId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `DEAL-${timestamp}-${random}`;
}

// Save deals to localStorage
function saveDeals() {
    const userKey = getUserStorageKey();
    localStorage.setItem(userKey, JSON.stringify(deals));
}

// Load deals from localStorage
function loadDeals() {
    const userKey = getUserStorageKey();
    const stored = localStorage.getItem(userKey);
    if (stored) {
        deals = JSON.parse(stored);
    } else {
        deals = [];
    }
}

// Display deals in board and table
function displayDeals() {
    const displayDeals = getAllDeals();
    
    // Clear all stages
    ['lead', 'contacted', 'proposal', 'negotiation', 'won', 'lost'].forEach(stage => {
        document.getElementById(`${stage}Stage`).innerHTML = '';
        document.getElementById(`${stage}Count`).textContent = '0';
    });
    
    // Clear table body
    const tableBody = document.getElementById('dealsTableBody');
    tableBody.innerHTML = '';
    
    if (displayDeals.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem; color: #888;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    ${isAdmin() ? 'No deals found in the system.' : 'No deals yet. Click "Add New Deal" to create one.'}
                </td>
            </tr>
        `;
        return;
    }
    
    // Group deals by stage
    const dealsByStage = {};
    ['lead', 'contacted', 'proposal', 'negotiation', 'won', 'lost'].forEach(stage => {
        dealsByStage[stage] = displayDeals.filter(d => d.stage === stage);
    });
    
    // Display deals in each stage
    ['lead', 'contacted', 'proposal', 'negotiation', 'won', 'lost'].forEach(stage => {
        const stageDeals = dealsByStage[stage];
        const stageContainer = document.getElementById(`${stage}Stage`);
        const stageCount = document.getElementById(`${stage}Count`);
        
        stageCount.textContent = stageDeals.length;
        
        stageDeals.forEach(deal => {
            const card = createDealCard(deal);
            stageContainer.appendChild(card);
        });
    });
    
    // Fill table
    displayDeals.forEach(deal => {
        const row = document.createElement('tr');
        
        // Show user info only to admin
        const userInfo = isAdmin() && deal.userId ? 
            `<br><small style="color: #666;">Added by: ${deal.userId}</small>` : '';
        
        row.innerHTML = `
            <td><strong>${escapeHtml(deal.client)}</strong>${userInfo}</td>
            <td><span class="stage-badge ${deal.stage}">${deal.stage}</span></td>
            <td style="color: #007bff; font-weight: 700;">₹${formatNumber(deal.value.toFixed(2))}</td>
            <td>${deal.probability}%</td>
            <td style="color: #28a745; font-weight: 700;">₹${formatNumber(deal.expectedRevenue.toFixed(2))}</td>
            <td>${formatDate(deal.createdDate)}</td>
            <td>
                <button class="btn-deal-action btn-edit" onclick="editDeal('${deal.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-deal-action btn-delete-deal" onclick="deleteDeal('${deal.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Create deal card for pipeline board
function createDealCard(deal) {
    const card = document.createElement('div');
    card.className = 'deal-card';
    card.draggable = true;
    card.innerHTML = `
        <div class="deal-card-header">
            <div>
                <h5 class="deal-name">${escapeHtml(deal.client)}</h5>
                <p class="deal-details">
                    <i class="fas fa-rupee-sign"></i> Value: ₹${formatNumber(deal.value.toFixed(2))}
                </p>
            </div>
        </div>
        <div class="deal-value">₹${formatNumber(deal.value.toFixed(2))}</div>
        <div class="deal-info">
            <span class="probability-badge"><i class="fas fa-percentage"></i> ${deal.probability}%</span>
            <span class="expected-revenue">₹${formatNumber(deal.expectedRevenue.toFixed(2))}</span>
        </div>
        <div class="deal-actions">
            <button class="btn-deal-action btn-edit" onclick="editDeal('${deal.id}')">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn-deal-action btn-delete-deal" onclick="deleteDeal('${deal.id}')">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    return card;
}

// Edit deal
function editDeal(dealId) {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;
    
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Deal';
    document.getElementById('dealId').value = deal.id;
    document.getElementById('clientName').value = deal.client;
    document.getElementById('dealValue').value = deal.value;
    document.getElementById('dealStage').value = deal.stage;
    document.getElementById('probability').value = deal.probability + '%';
    document.getElementById('expectedRevenue').value = '₹' + formatNumber(deal.expectedRevenue.toFixed(2));
    document.getElementById('description').value = deal.description || '';
    
    document.getElementById('dealModal').classList.add('show');
}

// Delete deal
function deleteDeal(dealId) {
    if (confirm('Are you sure you want to delete this deal?')) {
        deals = deals.filter(d => d.id !== dealId);
        saveDeals();
        displayDeals();
        updatePipelineStats();
        showNotification('Deal deleted successfully!', 'success');
    }
}

// Update pipeline statistics
function updatePipelineStats() {
    const totalDeals = deals.length;
    const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
    const expectedRevenue = deals.reduce((sum, d) => sum + d.expectedRevenue, 0);
    const avgDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;
    
    document.getElementById('totalDeals').textContent = totalDeals;
    document.getElementById('totalValue').textContent = '₹' + formatNumber(totalValue.toFixed(2));
    document.getElementById('expectedRevenue').textContent = '₹' + formatNumber(expectedRevenue.toFixed(2));
    document.getElementById('avgDealSize').textContent = '₹' + formatNumber(avgDealSize.toFixed(2));
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
    const modal = document.getElementById('dealModal');
    if (event.target === modal) {
        closeDealModal();
    }
}

console.log('Sales Pipeline JS loaded');
