// Leads Display JavaScript

let allLeads = [];
let currentLeadId = null;

// Load leads from localStorage
function loadLeads() {
    const leads = JSON.parse(localStorage.getItem('crmLeads') || '[]');
    // Sort by timestamp (newest first)
    allLeads = leads.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    displayLeads(allLeads);
    updateStats();
}

// Display leads
function displayLeads(leads) {
    const container = document.getElementById('leadsContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (leads.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    container.innerHTML = leads.map(lead => createLeadCard(lead)).join('');
}

// Create lead card HTML
function createLeadCard(lead) {
    const fullName = `${lead.personalInfo.firstName} ${lead.personalInfo.lastName}`;
    const initials = `${lead.personalInfo.firstName[0]}${lead.personalInfo.lastName[0]}`.toUpperCase();
    const priority = lead.additionalInfo.priority || 'medium';
    const date = new Date(lead.timestamp).toLocaleDateString();
    const time = new Date(lead.timestamp).toLocaleTimeString();
    
    return `
        <div class="lead-card" onclick="showLeadDetail('${lead.leadId}')">
            <div class="lead-avatar">${initials}</div>
            <div class="lead-info">
                <div class="lead-name">${fullName}</div>
                <div class="lead-contact">
                    <span><i class="fas fa-phone"></i> ${lead.contactInfo.phone}</span>
                    <span><i class="fas fa-envelope"></i> ${lead.contactInfo.email}</span>
                </div>
            </div>
            <div class="lead-meta">
                <span class="priority-badge priority-${priority}">${priority}</span>
                <span class="lead-date">${date} ${time}</span>
            </div>
        </div>
    `;
}

// Update statistics
function updateStats() {
    const totalLeads = allLeads.length;
    
    // Count today's leads
    const today = new Date().toDateString();
    const todayLeads = allLeads.filter(lead => 
        new Date(lead.timestamp).toDateString() === today
    ).length;
    
    // Count high priority leads
    const highPriority = allLeads.filter(lead => 
        lead.additionalInfo.priority === 'high' || lead.additionalInfo.priority === 'urgent'
    ).length;
    
    document.getElementById('totalLeads').textContent = totalLeads;
    document.getElementById('todayLeads').textContent = todayLeads;
    document.getElementById('highPriority').textContent = highPriority;
}

// Show lead detail modal
function showLeadDetail(leadId) {
    currentLeadId = leadId;
    const lead = allLeads.find(l => l.leadId === leadId);
    
    if (!lead) return;
    
    const fullName = `${lead.personalInfo.firstName} ${lead.personalInfo.lastName}`;
    
    const modalBody = document.getElementById('leadModalBody');
    modalBody.innerHTML = `
        <div class="lead-detail-section">
            <h4><i class="fas fa-user"></i> Personal Information</h4>
            <div class="lead-detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Full Name</div>
                    <div class="detail-value">${fullName}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Age</div>
                    <div class="detail-value">${lead.personalInfo.age || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Gender</div>
                    <div class="detail-value">${lead.personalInfo.gender || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Lead ID</div>
                    <div class="detail-value">${lead.leadId}</div>
                </div>
            </div>
        </div>
        
        <div class="lead-detail-section">
            <h4><i class="fas fa-address-card"></i> Contact Information</h4>
            <div class="lead-detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">${lead.contactInfo.phone}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Email</div>
                    <div class="detail-value">${lead.contactInfo.email}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">City</div>
                    <div class="detail-value">${lead.contactInfo.city || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">State</div>
                    <div class="detail-value">${lead.contactInfo.state || 'N/A'}</div>
                </div>
            </div>
            ${lead.contactInfo.address ? `
            <div class="detail-item" style="margin-top: 1rem;">
                <div class="detail-label">Address</div>
                <div class="detail-value">${lead.contactInfo.address}</div>
            </div>
            ` : ''}
        </div>
        
        <div class="lead-detail-section">
            <h4><i class="fas fa-chart-pie"></i> Financial Information</h4>
            <div class="lead-detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Portfolio Value</div>
                    <div class="detail-value">${formatPortfolioValue(lead.financialInfo.portfolioValue)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Annual Income</div>
                    <div class="detail-value">${formatAnnualIncome(lead.financialInfo.annualIncome)}</div>
                </div>
            </div>
            ${lead.financialInfo.investmentInterests.length > 0 ? `
            <div class="detail-item" style="margin-top: 1rem;">
                <div class="detail-label">Investment Interests</div>
                <div class="detail-value">${lead.financialInfo.investmentInterests.join(', ')}</div>
            </div>
            ` : ''}
        </div>
        
        <div class="lead-detail-section">
            <h4><i class="fas fa-question-circle"></i> Inquiry Details</h4>
            <div class="lead-detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Source</div>
                    <div class="detail-value">${formatSource(lead.inquiryDetails.source)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Priority</div>
                    <div class="detail-value">${(lead.additionalInfo.priority || 'medium').toUpperCase()}</div>
                </div>
            </div>
            <div class="detail-item" style="margin-top: 1rem;">
                <div class="detail-label">Reason for Call</div>
                <div class="detail-value">${lead.inquiryDetails.reasonForCall}</div>
            </div>
            ${lead.inquiryDetails.servicesInterested.length > 0 ? `
            <div class="detail-item" style="margin-top: 1rem;">
                <div class="detail-label">Services Interested</div>
                <div class="detail-value">${lead.inquiryDetails.servicesInterested.join(', ')}</div>
            </div>
            ` : ''}
        </div>
        
        ${lead.additionalInfo.notes ? `
        <div class="lead-detail-section">
            <h4><i class="fas fa-sticky-note"></i> Additional Notes</h4>
            <div class="detail-item">
                <div class="detail-value">${lead.additionalInfo.notes}</div>
            </div>
        </div>
        ` : ''}
        
        <div class="lead-detail-section">
            <h4><i class="fas fa-calendar"></i> Follow-up</h4>
            <div class="lead-detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Submission Date</div>
                    <div class="detail-value">${new Date(lead.timestamp).toLocaleString()}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Follow-up Date</div>
                    <div class="detail-value">${lead.additionalInfo.followUpDate || 'Not specified'}</div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('leadModal').classList.add('active');
}

// Close lead modal
function closeLeadModal() {
    document.getElementById('leadModal').classList.remove('active');
    currentLeadId = null;
}

// Delete current lead
function deleteCurrentLead() {
    if (!currentLeadId) return;
    
    if (confirm('Are you sure you want to delete this lead?')) {
        allLeads = allLeads.filter(lead => lead.leadId !== currentLeadId);
        localStorage.setItem('crmLeads', JSON.stringify(allLeads));
        closeLeadModal();
        displayLeads(allLeads);
        updateStats();
    }
}

// Search leads
function searchLeads(query) {
    const lowerQuery = query.toLowerCase();
    const filtered = allLeads.filter(lead => {
        const fullName = `${lead.personalInfo.firstName} ${lead.personalInfo.lastName}`.toLowerCase();
        return fullName.includes(lowerQuery) ||
               lead.contactInfo.email.toLowerCase().includes(lowerQuery) ||
               lead.contactInfo.phone.includes(query);
    });
    displayLeads(filtered);
}

// Filter by priority
function filterByPriority(priority) {
    if (!priority) {
        displayLeads(allLeads);
        return;
    }
    const filtered = allLeads.filter(lead => 
        lead.additionalInfo.priority === priority
    );
    displayLeads(filtered);
}

// Export leads to CSV
function exportLeads() {
    if (allLeads.length === 0) {
        alert('No leads to export');
        return;
    }
    
    const headers = ['Lead ID', 'Date', 'First Name', 'Last Name', 'Phone', 'Email', 'Portfolio Value', 'Priority', 'Source'];
    const rows = allLeads.map(lead => [
        lead.leadId,
        new Date(lead.timestamp).toLocaleString(),
        lead.personalInfo.firstName,
        lead.personalInfo.lastName,
        lead.contactInfo.phone,
        lead.contactInfo.email,
        lead.financialInfo.portfolioValue,
        lead.additionalInfo.priority,
        lead.inquiryDetails.source
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Helper functions
function formatPortfolioValue(value) {
    const portfolioMap = {
        'below-1l': 'Below ₹1 Lakh',
        '1l-5l': '₹1 Lakh - ₹5 Lakhs',
        '5l-10l': '₹5 Lakhs - ₹10 Lakhs',
        '10l-25l': '₹10 Lakhs - ₹25 Lakhs',
        '25l-50l': '₹25 Lakhs - ₹50 Lakhs',
        '50l-1cr': '₹50 Lakhs - ₹1 Crore',
        'above-1cr': 'Above ₹1 Crore'
    };
    return portfolioMap[value] || value || 'Not provided';
}

function formatAnnualIncome(value) {
    const incomeMap = {
        'below-3l': 'Below ₹3 Lakhs',
        '3l-5l': '₹3 Lakhs - ₹5 Lakhs',
        '5l-10l': '₹5 Lakhs - ₹10 Lakhs',
        '10l-20l': '₹10 Lakhs - ₹20 Lakhs',
        '20l-50l': '₹20 Lakhs - ₹50 Lakhs',
        'above-50l': 'Above ₹50 Lakhs'
    };
    return incomeMap[value] || value || 'Not provided';
}

function formatSource(value) {
    const sourceMap = {
        'phone-call': 'Phone Call',
        'email': 'Email',
        'website': 'Website',
        'social-media': 'Social Media',
        'referral': 'Referral',
        'walk-in': 'Walk-in',
        'advertisement': 'Advertisement',
        'other': 'Other'
    };
    return sourceMap[value] || value;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadLeads();
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchLeads(e.target.value);
        });
    }
    
    // Priority filter
    const priorityFilter = document.getElementById('priorityFilter');
    if (priorityFilter) {
        priorityFilter.addEventListener('change', (e) => {
            filterByPriority(e.target.value);
        });
    }
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('leadModal');
        if (e.target === modal) {
            closeLeadModal();
        }
    });
});

console.log('Leads Display JS loaded');
