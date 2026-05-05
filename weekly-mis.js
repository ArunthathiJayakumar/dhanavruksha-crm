// Weekly MIS Management JavaScript

let misRecords = [];

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
    return user ? `weeklyMISRecords_${user.email}` : 'weeklyMISRecords';
}

// Get all MIS records (admin sees all, users see their own)
function getAllMISRecords() {
    if (isAdmin()) {
        // Admin sees all MIS records from all users
        const allMISRecords = [];
        const keys = Object.keys(localStorage).filter(key => key.startsWith('weeklyMISRecords_'));
        keys.forEach(key => {
            try {
                const userMISRecords = JSON.parse(localStorage.getItem(key) || '[]');
                allMISRecords.push(...userMISRecords);
            } catch (error) {
                console.log('Error loading MIS records for key:', key);
            }
        });
        return allMISRecords;
    } else {
        // Regular users see only their own MIS records
        return misRecords;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Please login to access Weekly MIS!', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    loadMISRecords();
    displayMISRecords();
    updateMISStats();
});

// Open modal for adding MIS
function openMISModal() {
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Add Weekly MIS';
    document.getElementById('misForm').reset();
    document.getElementById('misId').value = '';
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('misDate').value = today;
    
    document.getElementById('misModal').classList.add('show');
}

// Close modal
function closeMISModal() {
    document.getElementById('misModal').classList.remove('show');
}

// Save MIS record (create or update)
function saveMIS(event) {
    event.preventDefault();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Please login to save MIS records!', 'error');
        return;
    }
    
    const misId = document.getElementById('misId').value;
    
    const misRecord = {
        id: misId || generateMISId(),
        userId: currentUser.email,
        date: document.getElementById('misDate').value,
        physicalMeetings: parseInt(document.getElementById('physicalMeetings').value) || 0,
        virtualMeetings: parseInt(document.getElementById('virtualMeetings').value) || 0,
        phoneCalls: parseInt(document.getElementById('phoneCalls').value) || 0,
        newLeads: parseInt(document.getElementById('newLeads').value) || 0,
        references: parseInt(document.getElementById('references').value) || 0,
        sipFTW: parseFloat(document.getElementById('sipFTW').value) || 0,
        sipMTD: parseFloat(document.getElementById('sipMTD').value) || 0,
        mfLumpsumFTW: parseFloat(document.getElementById('mfLumpsumFTW').value) || 0,
        mfLumpsumMTD: parseFloat(document.getElementById('mfLumpsumMTD').value) || 0,
        healthInsFTW: parseFloat(document.getElementById('healthInsFTW').value) || 0,
        healthInsMTD: parseFloat(document.getElementById('healthInsMTD').value) || 0,
        termInsFTW: parseFloat(document.getElementById('termInsFTW').value) || 0,
        termInsMTD: parseFloat(document.getElementById('termInsMTD').value) || 0,
        fdFTW: parseFloat(document.getElementById('fdFTW').value) || 0,
        fdMTD: parseFloat(document.getElementById('fdMTD').value) || 0,
        arnTransferFTW: parseFloat(document.getElementById('arnTransferFTW').value) || 0,
        arnTransferMTD: parseFloat(document.getElementById('arnTransferMTD').value) || 0,
        othersFTW: parseFloat(document.getElementById('othersFTW').value) || 0,
        othersMTD: parseFloat(document.getElementById('othersMTD').value) || 0,
        othersDescription: document.getElementById('othersDescription').value.trim(),
        createdDate: misId ? getExistingMIS(misId).createdDate : new Date().toISOString(),
        modifiedDate: new Date().toISOString()
    };
    
    if (misId) {
        // Update existing record
        const index = misRecords.findIndex(m => m.id === misId);
        if (index !== -1) {
            misRecords[index] = misRecord;
        }
    } else {
        // Add new record
        misRecords.push(misRecord);
    }
    
    saveMISRecords();
    displayMISRecords();
    updateMISStats();
    closeMISModal();
    
    showNotification(misId ? 'MIS record updated successfully!' : 'MIS record created successfully!', 'success');
}

// Get existing MIS record by ID
function getExistingMIS(misId) {
    return misRecords.find(m => m.id === misId);
}

// Generate unique MIS ID
function generateMISId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `MIS-${timestamp}-${random}`;
}

// Save MIS records to localStorage
function saveMISRecords() {
    const userKey = getUserStorageKey();
    localStorage.setItem(userKey, JSON.stringify(misRecords));
}

// Load MIS records from localStorage
function loadMISRecords() {
    const userKey = getUserStorageKey();
    const stored = localStorage.getItem(userKey);
    if (stored) {
        misRecords = JSON.parse(stored);
    } else {
        misRecords = [];
    }
}

// Display MIS records in table
function displayMISRecords() {
    const tableBody = document.getElementById('misTableBody');
    const displayRecords = getAllMISRecords();
    
    if (displayRecords.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="13" style="text-align: center; padding: 3rem; color: #888;">
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <h3>${isAdmin() ? 'No MIS Records Found in System' : 'No MIS Records Yet'}</h3>
                        <p>${isAdmin() ? 'No MIS records have been created by any user.' : 'Click "Add Weekly MIS" to create your first record.'}</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort records by date (newest first)
    const sortedRecords = [...displayRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedRecords.forEach(record => {
        const row = document.createElement('tr');
        
        // Show user info only to admin
        const userInfo = isAdmin() && record.userId ? 
            `<br><small style="color: #666;">Added by: ${record.userId}</small>` : '';
        
        row.innerHTML = `
            <td><strong>${formatDate(record.date)}</strong>${userInfo}</td>
            <td>${record.physicalMeetings}</td>
            <td>${record.virtualMeetings}</td>
            <td>${record.phoneCalls}</td>
            <td>${record.newLeads}</td>
            <td>${record.references}</td>
            <td>${formatCurrency(record.sipFTW)} / ${formatCurrency(record.sipMTD)}</td>
            <td>${formatCurrency(record.mfLumpsumFTW)}L / ${formatCurrency(record.mfLumpsumMTD)}L</td>
            <td>${formatCurrency(record.healthInsFTW)}k / ${formatCurrency(record.healthInsMTD)}k</td>
            <td>${formatCurrency(record.termInsFTW)}k / ${formatCurrency(record.termInsMTD)}k</td>
            <td>${formatCurrency(record.fdFTW)}L / ${formatCurrency(record.fdMTD)}L</td>
            <td>${formatCurrency(record.arnTransferFTW)}L / ${formatCurrency(record.arnTransferMTD)}L</td>
            <td>
                ${formatCurrency(record.othersFTW)} / ${formatCurrency(record.othersMTD)}
                ${record.othersDescription ? `<br><small>${record.othersDescription}</small>` : ''}
            </td>
            <td>
                <button class="btn-mis-action btn-edit" onclick="editMIS('${record.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-mis-action btn-delete" onclick="deleteMIS('${record.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Edit MIS record
function editMIS(misId) {
    const record = misRecords.find(m => m.id === misId);
    if (!record) return;
    
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Weekly MIS';
    document.getElementById('misId').value = record.id;
    document.getElementById('misDate').value = record.date;
    document.getElementById('physicalMeetings').value = record.physicalMeetings;
    document.getElementById('virtualMeetings').value = record.virtualMeetings;
    document.getElementById('phoneCalls').value = record.phoneCalls;
    document.getElementById('newLeads').value = record.newLeads;
    document.getElementById('references').value = record.references;
    document.getElementById('sipFTW').value = record.sipFTW;
    document.getElementById('sipMTD').value = record.sipMTD;
    document.getElementById('mfLumpsumFTW').value = record.mfLumpsumFTW;
    document.getElementById('mfLumpsumMTD').value = record.mfLumpsumMTD;
    document.getElementById('healthInsFTW').value = record.healthInsFTW;
    document.getElementById('healthInsMTD').value = record.healthInsMTD;
    document.getElementById('termInsFTW').value = record.termInsFTW;
    document.getElementById('termInsMTD').value = record.termInsMTD;
    document.getElementById('fdFTW').value = record.fdFTW;
    document.getElementById('fdMTD').value = record.fdMTD;
    document.getElementById('arnTransferFTW').value = record.arnTransferFTW;
    document.getElementById('arnTransferMTD').value = record.arnTransferMTD;
    document.getElementById('othersFTW').value = record.othersFTW;
    document.getElementById('othersMTD').value = record.othersMTD;
    document.getElementById('othersDescription').value = record.othersDescription || '';
    
    document.getElementById('misModal').classList.add('show');
}

// Delete MIS record
function deleteMIS(misId) {
    if (confirm('Are you sure you want to delete this MIS record?')) {
        misRecords = misRecords.filter(m => m.id !== misId);
        saveMISRecords();
        displayMISRecords();
        updateMISStats();
        showNotification('MIS record deleted successfully!', 'success');
    }
}

// Update MIS statistics
function updateMISStats() {
    const weeklyReports = misRecords.length;
    const totalMeetings = misRecords.reduce((sum, m) => sum + m.physicalMeetings + m.virtualMeetings, 0);
    const totalCalls = misRecords.reduce((sum, m) => sum + m.phoneCalls, 0);
    const totalLeads = misRecords.reduce((sum, m) => sum + m.newLeads, 0);
    
    document.getElementById('weeklyReports').textContent = weeklyReports;
    document.getElementById('totalMeetings').textContent = totalMeetings;
    document.getElementById('totalCalls').textContent = totalCalls;
    document.getElementById('totalLeads').textContent = totalLeads;
}

// Export MIS data
function exportMISData() {
    if (misRecords.length === 0) {
        showNotification('No data to export!', 'error');
        return;
    }
    
    // Create CSV content
    const headers = [
        'Date', 'Physical Meetings', 'Virtual Meetings', 'Phone Calls', 'New Leads', 'References',
        'SIP FTW', 'SIP MTD', 'MF Lumpsum FTW (Lacs)', 'MF Lumpsum MTD (Lacs)',
        'Health Insurance FTW (K)', 'Health Insurance MTD (K)', 'Term Insurance FTW (K)', 'Term Insurance MTD (K)',
        'FD FTW (Lacs)', 'FD MTD (Lacs)', 'ARN Transfer FTW (Lacs)', 'ARN Transfer MTD (Lacs)',
        'Others FTW', 'Others MTD', 'Others Description'
    ];
    
    const csvContent = [
        headers.join(','),
        ...misRecords.map(record => [
            record.date,
            record.physicalMeetings,
            record.virtualMeetings,
            record.phoneCalls,
            record.newLeads,
            record.references,
            record.sipFTW,
            record.sipMTD,
            record.mfLumpsumFTW,
            record.mfLumpsumMTD,
            record.healthInsFTW,
            record.healthInsMTD,
            record.termInsFTW,
            record.termInsMTD,
            record.fdFTW,
            record.fdMTD,
            record.arnTransferFTW,
            record.arnTransferMTD,
            record.othersFTW,
            record.othersMTD,
            `"${record.othersDescription || ''}"`
        ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-mis-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('MIS data exported successfully!', 'success');
}

// Generate report
function generateReport() {
    if (misRecords.length === 0) {
        showNotification('No data to generate report!', 'error');
        return;
    }
    
    // Calculate totals and averages
    const totals = {
        physicalMeetings: misRecords.reduce((sum, m) => sum + m.physicalMeetings, 0),
        virtualMeetings: misRecords.reduce((sum, m) => sum + m.virtualMeetings, 0),
        phoneCalls: misRecords.reduce((sum, m) => sum + m.phoneCalls, 0),
        newLeads: misRecords.reduce((sum, m) => sum + m.newLeads, 0),
        references: misRecords.reduce((sum, m) => sum + m.references, 0),
        sipFTW: misRecords.reduce((sum, m) => sum + m.sipFTW, 0),
        sipMTD: misRecords.reduce((sum, m) => sum + m.sipMTD, 0),
        mfLumpsumFTW: misRecords.reduce((sum, m) => sum + m.mfLumpsumFTW, 0),
        mfLumpsumMTD: misRecords.reduce((sum, m) => sum + m.mfLumpsumMTD, 0),
        healthInsFTW: misRecords.reduce((sum, m) => sum + m.healthInsFTW, 0),
        healthInsMTD: misRecords.reduce((sum, m) => sum + m.healthInsMTD, 0),
        termInsFTW: misRecords.reduce((sum, m) => sum + m.termInsFTW, 0),
        termInsMTD: misRecords.reduce((sum, m) => sum + m.termInsMTD, 0),
        fdFTW: misRecords.reduce((sum, m) => sum + m.fdFTW, 0),
        fdMTD: misRecords.reduce((sum, m) => sum + m.fdMTD, 0),
        arnTransferFTW: misRecords.reduce((sum, m) => sum + m.arnTransferFTW, 0),
        arnTransferMTD: misRecords.reduce((sum, m) => sum + m.arnTransferMTD, 0),
        othersFTW: misRecords.reduce((sum, m) => sum + m.othersFTW, 0),
        othersMTD: misRecords.reduce((sum, m) => sum + m.othersMTD, 0)
    };
    
    const averages = {
        physicalMeetings: (totals.physicalMeetings / misRecords.length).toFixed(1),
        virtualMeetings: (totals.virtualMeetings / misRecords.length).toFixed(1),
        phoneCalls: (totals.phoneCalls / misRecords.length).toFixed(1),
        newLeads: (totals.newLeads / misRecords.length).toFixed(1),
        references: (totals.references / misRecords.length).toFixed(1)
    };
    
    // Create report content
    const reportContent = `
WEEKLY MIS REPORT
Generated on: ${new Date().toLocaleDateString()}
Total Records: ${misRecords.length}

SUMMARY STATISTICS:
================
Total Physical Meetings: ${totals.physicalMeetings} (Avg: ${averages.physicalMeetings}/week)
Total Virtual Meetings: ${totals.virtualMeetings} (Avg: ${averages.virtualMeetings}/week)
Total Phone Calls: ${totals.phoneCalls} (Avg: ${averages.phoneCalls}/week)
Total New Leads: ${totals.newLeads} (Avg: ${averages.newLeads}/week)
Total References: ${totals.references} (Avg: ${averages.references}/week)

BUSINESS METRICS:
================
SIP Initiated:
  FTW Total: ₹${formatCurrency(totals.sipFTW)}
  MTD Total: ₹${formatCurrency(totals.sipMTD)}

MF Lumpsum:
  FTW Total: ₹${formatCurrency(totals.mfLumpsumFTW)} Lacs
  MTD Total: ₹${formatCurrency(totals.mfLumpsumMTD)} Lacs

Health Insurance:
  FTW Total: ₹${formatCurrency(totals.healthInsFTW)}K
  MTD Total: ₹${formatCurrency(totals.healthInsMTD)}K

Term Insurance:
  FTW Total: ₹${formatCurrency(totals.termInsFTW)}K
  MTD Total: ₹${formatCurrency(totals.termInsMTD)}K

Fixed Deposits:
  FTW Total: ₹${formatCurrency(totals.fdFTW)} Lacs
  MTD Total: ₹${formatCurrency(totals.fdMTD)} Lacs

ARN Transfer:
  FTW Total: ₹${formatCurrency(totals.arnTransferFTW)} Lacs
  MTD Total: ₹${formatCurrency(totals.arnTransferMTD)} Lacs

Others:
  FTW Total: ₹${formatCurrency(totals.othersFTW)}
  MTD Total: ₹${formatCurrency(totals.othersMTD)}

DETAILED RECORDS:
================
${misRecords.map(record => `
Date: ${formatDate(record.date)}
Physical Meetings: ${record.physicalMeetings} | Virtual Meetings: ${record.virtualMeetings} | Phone Calls: ${record.phoneCalls}
New Leads: ${record.newLeads} | References: ${record.references}
SIP: FTW ₹${formatCurrency(record.sipFTW)} | MTD ₹${formatCurrency(record.sipMTD)}
MF Lumpsum: FTW ₹${formatCurrency(record.mfLumpsumFTW)}L | MTD ₹${formatCurrency(record.mfLumpsumMTD)}L
Health Ins: FTW ₹${formatCurrency(record.healthInsFTW)}k | MTD ₹${formatCurrency(record.healthInsMTD)}k
Term Ins: FTW ₹${formatCurrency(record.termInsFTW)}k | MTD ₹${formatCurrency(record.termInsMTD)}k
FD: FTW ₹${formatCurrency(record.fdFTW)}L | MTD ₹${formatCurrency(record.fdMTD)}L
ARN Transfer: FTW ₹${formatCurrency(record.arnTransferFTW)}L | MTD ₹${formatCurrency(record.arnTransferMTD)}L
Others: FTW ₹${formatCurrency(record.othersFTW)} | MTD ₹${formatCurrency(record.othersMTD)}${record.othersDescription ? ` (${record.othersDescription})` : ''}
---`).join('\n')}
    `;
    
    // Create download link for report
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-mis-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('MIS report generated successfully!', 'success');
}

// Format currency
function formatCurrency(amount) {
    return parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Show notification (using existing function from script.js)
function showNotification(message, type = 'success') {
    // This function should already exist in script.js
    if (typeof showNotification === 'function') {
        showNotification(message, type);
    } else {
        // Fallback notification
        const notification = document.createElement('div');
        notification.className = `mis-message ${type}`;
        notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10001;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}
