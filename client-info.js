// Client Information Management JavaScript

let clients = [];
let uploadedFile = null;

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
    return user ? `clientInformation_${user.email}` : 'clientInformation';
}

// Get all clients (admin sees all, users see their own)
function getAllClients() {
    if (isAdmin()) {
        // Admin sees all clients from all users
        const allClients = [];
        const keys = Object.keys(localStorage).filter(key => key.startsWith('clientInformation_'));
        keys.forEach(key => {
            try {
                const userClients = JSON.parse(localStorage.getItem(key) || '[]');
                allClients.push(...userClients);
            } catch (error) {
                console.log('Error loading clients for key:', key);
            }
        });
        return allClients;
    } else {
        // Regular users see only their own clients
        return clients;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Please login to access client management!', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    loadClients();
    displayClients();
    updateSummary();
});

// Preview uploaded file
function previewFile() {
    const fileInput = document.getElementById('proposalUpload');
    const filePreview = document.getElementById('filePreview');
    
    if (fileInput.files && fileInput.files[0]) {
        uploadedFile = fileInput.files[0];
        const fileName = uploadedFile.name;
        const fileSize = (uploadedFile.size / 1024).toFixed(2); // KB
        
        let icon = 'fa-file';
        if (fileName.endsWith('.pdf')) icon = 'fa-file-pdf';
        else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) icon = 'fa-file-word';
        else if (fileName.endsWith('.jpg') || fileName.endsWith('.png')) icon = 'fa-file-image';
        
        filePreview.innerHTML = `
            <i class="fas ${icon}"></i>
            <strong>${fileName}</strong> (${fileSize} KB)
        `;
        filePreview.classList.add('show');
    }
}

// Clear file preview
function clearFilePreview() {
    uploadedFile = null;
    const fileInput = document.getElementById('proposalUpload');
    const filePreview = document.getElementById('filePreview');
    
    if (fileInput) fileInput.value = '';
    if (filePreview) filePreview.classList.remove('show');
}

// Add new client
function addClient(event) {
    event.preventDefault();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Please login to add clients!', 'error');
        return;
    }
    
    const clientName = document.getElementById('clientName').value.trim();
    const meetingNotes = document.getElementById('meetingNotes').value.trim();
    
    // Create client object
    const client = {
        id: generateClientId(),
        userId: currentUser.email,
        name: clientName,
        meetingNotes: meetingNotes,
        proposal: uploadedFile ? {
            name: uploadedFile.name,
            size: uploadedFile.size,
            type: uploadedFile.type,
            data: null // Will be populated if FileReader is used
        } : null,
        addedDate: new Date().toISOString()
    };
    
    // If file was uploaded, convert to base64 for storage
    if (uploadedFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            client.proposal.data = e.target.result;
            
            // Save to array and localStorage
            clients.push(client);
            saveClients();
            
            // Reset form and refresh display
            document.getElementById('clientForm').reset();
            clearFilePreview();
            displayClients();
            updateSummary();
            
            showNotification('Client added successfully!', 'success');
        };
        reader.readAsDataURL(uploadedFile);
    } else {
        // No file, just save directly
        clients.push(client);
        saveClients();
        
        // Reset form
        document.getElementById('clientForm').reset();
        clearFilePreview();
        
        // Refresh display
        displayClients();
        updateSummary();
        
        showNotification('Client added successfully!', 'success');
    }
}

// Generate unique client ID
function generateClientId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `CLT-${timestamp}-${random}`;
}

// Save clients to localStorage
function saveClients() {
    const userKey = getUserStorageKey();
    localStorage.setItem(userKey, JSON.stringify(clients));
}

// Load clients from localStorage
function loadClients() {
    const userKey = getUserStorageKey();
    const stored = localStorage.getItem(userKey);
    if (stored) {
        clients = JSON.parse(stored);
    } else {
        clients = [];
    }
}

// Display clients in table
function displayClients() {
    const tbody = document.getElementById('clientTableBody');
    const currentUser = getCurrentUser();
    const displayClients = getAllClients();
    
    if (displayClients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem; color: #888;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    ${isAdmin() ? 'No clients found in the system.' : 'No clients added yet. Add your first client using the form above.'}
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date (most recent first)
    const sortedClients = [...displayClients].sort((a, b) => 
        new Date(b.addedDate) - new Date(a.addedDate)
    );
    
    tbody.innerHTML = sortedClients.map((client, index) => {
        const shortId = client.id.split('-')[1];
        const date = new Date(client.addedDate);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Show user info only to admin
        const userInfo = isAdmin() && client.userId ? 
            `<br><small style="color: #666;">Added by: ${client.userId}</small>` : '';
        
        return `
            <tr>
                <td><strong>#${shortId}</strong>${userInfo}</td>
                <td><strong>${escapeHtml(client.name)}</strong></td>
                <td>${escapeHtml(client.meetingNotes || 'No notes')}</td>
                <td>${client.proposal ? 
                    `<span style="color: #28a745;"><i class="fas fa-check-circle"></i> ${client.proposal.name}</span>
                     <br><button class="btn-action btn-view" onclick="downloadProposal('${client.id}')" style="margin-top: 0.5rem;">
                         <i class="fas fa-download"></i> Download
                     </button>` : 
                    '<span style="color: #dc3545;"><i class="fas fa-times-circle"></i> No proposal</span>'}</td>
                <td>${formattedDate}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="editClient('${client.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteClient('${client.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// View client details
function viewClient(clientId) {
    const allClients = getAllClients();
    const client = allClients.find(c => c.id === clientId);
    if (!client) return;
    
    const date = new Date(client.addedDate);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let details = `CLIENT INFORMATION\n`;
    details += `${'='.repeat(50)}\n\n`;
    details += `Client ID: ${client.id}\n`;
    details += `Client Name: ${client.name}\n`;
    if (isAdmin() && client.userId) {
        details += `Added By: ${client.userId}\n`;
    }
    details += `Added Date: ${formattedDate}\n\n`;
    details += `MEETING NOTES\n`;
    details += `${'-'.repeat(50)}\n`;
    details += `${client.meetingNotes}\n\n`;
    
    if (client.proposal) {
        details += `PROPOSAL\n`;
        details += `${'-'.repeat(50)}\n`;
        details += `File Name: ${client.proposal.name}\n`;
        details += `File Size: ${(client.proposal.size / 1024).toFixed(2)} KB\n`;
        details += `File Type: ${client.proposal.type || 'Unknown'}\n`;
        details += `\nClick "Download Proposal" to view the full file.`;
    } else {
        details += `PROPOSAL\n`;
        details += `${'-'.repeat(50)}\n`;
        details += `No proposal uploaded\n`;
    }
    
    alert(details);
}

// Download/view proposal
async function downloadProposal(clientId) {
    const allClients = getAllClients();
    const client = allClients.find(c => c.id === clientId);
    if (!client || !client.proposal) {
        showNotification('No proposal found for this client!', 'error');
        return;
    }
    
    console.log('Proposal data:', client.proposal);
    console.log('Proposal data length:', client.proposal.data ? client.proposal.data.length : 'No data');
    
    try {
        let blob;
        
        // Check if proposal data exists and is valid
        if (!client.proposal.data) {
            showNotification('Proposal file data is corrupted or missing!', 'error');
            return;
        }
        
        // Handle different data formats
        if (client.proposal.data.startsWith('data:')) {
            // Data is already in data URL format
            try {
                // Extract the base64 part and content type
                const matches = client.proposal.data.match(/^data:(.+?);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    const mimeType = matches[1];
                    const base64Data = matches[2];
                    const byteCharacters = atob(base64Data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    blob = new Blob([byteArray], { type: mimeType });
                } else {
                    // Fallback: try to use fetch
                    const response = await fetch(client.proposal.data);
                    blob = await response.blob();
                }
            } catch (dataUrlError) {
                console.error('Data URL parsing error:', dataUrlError);
                showNotification('Error parsing proposal data!', 'error');
                return;
            }
        } else {
            // Data is base64 encoded, convert to blob
            try {
                const byteCharacters = atob(client.proposal.data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                blob = new Blob([byteArray], { type: client.proposal.type || 'application/octet-stream' });
            } catch (base64Error) {
                console.error('Base64 conversion error:', base64Error);
                showNotification('Proposal file format is invalid!', 'error');
                return;
            }
        }
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = client.proposal.name || 'proposal';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification('Proposal downloaded successfully!', 'success');
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Error downloading proposal: ' + error.message, 'error');
    }
}

// Edit client
function editClient(clientId) {
    const allClients = getAllClients();
    const client = allClients.find(c => c.id === clientId);
    if (!client) {
        showNotification('Client not found!', 'error');
        return;
    }
    
    // Populate form with client data
    document.getElementById('clientName').value = client.name;
    document.getElementById('meetingNotes').value = client.meetingNotes || '';
    
    // Show proposal info if exists
    if (client.proposal) {
        const filePreview = document.getElementById('filePreview');
        let icon = 'fa-file';
        if (client.proposal.name.endsWith('.pdf')) icon = 'fa-file-pdf';
        else if (client.proposal.name.endsWith('.doc') || client.proposal.name.endsWith('.docx')) icon = 'fa-file-word';
        else if (client.proposal.name.endsWith('.jpg') || client.proposal.name.endsWith('.png')) icon = 'fa-file-image';
        
        filePreview.innerHTML = `
            <i class="fas ${icon}"></i>
            <strong>${client.proposal.name}</strong> (${(client.proposal.size / 1024).toFixed(2)} KB)
            <br><small>Current proposal - will be replaced if new file uploaded</small>
        `;
        filePreview.classList.add('show');
        uploadedFile = null; // Clear uploaded file
    }
    
    // Store client ID for update
    window.editingClientId = clientId;
    
    // Change form submit button text
    const submitBtn = document.querySelector('#clientForm button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Client';
    }
    
    // Scroll to form
    document.getElementById('clientForm').scrollIntoView({ behavior: 'smooth' });
    
    showNotification('Edit client details and submit to update', 'info');
}

// Update the addClient function to handle both add and edit
function addClient(event) {
    event.preventDefault();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Please login to add clients!', 'error');
        return;
    }
    
    const clientName = document.getElementById('clientName').value.trim();
    const meetingNotes = document.getElementById('meetingNotes').value.trim();
    const isEditing = window.editingClientId;
    
    if (isEditing) {
        // Update existing client
        const allClients = getAllClients();
        const client = allClients.find(c => c.id === isEditing);
        if (!client) {
            showNotification('Client not found!', 'error');
            return;
        }
        
        // Update client data
        client.name = clientName;
        client.meetingNotes = meetingNotes;
        client.modifiedDate = new Date().toISOString();
        
        // Update proposal if new file uploaded
        if (uploadedFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                client.proposal = {
                    name: uploadedFile.name,
                    size: uploadedFile.size,
                    type: uploadedFile.type,
                    data: e.target.result
                };
                
                updateClientInStorage(client);
                resetForm();
                showNotification('Client updated successfully!', 'success');
            };
            reader.readAsDataURL(uploadedFile);
        } else {
            updateClientInStorage(client);
            resetForm();
            showNotification('Client updated successfully!', 'success');
        }
    } else {
        // Add new client
        const client = {
            id: generateClientId(),
            userId: currentUser.email,
            name: clientName,
            meetingNotes: meetingNotes,
            proposal: uploadedFile ? {
                name: uploadedFile.name,
                size: uploadedFile.size,
                type: uploadedFile.type,
                data: null // Will be populated if FileReader is used
            } : null,
            addedDate: new Date().toISOString()
        };
        
        // If file was uploaded, convert to base64 for storage
        if (uploadedFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                client.proposal.data = e.target.result;
                
                // Save to array and localStorage
                clients.push(client);
                saveClients();
                
                resetForm();
                showNotification('Client added successfully!', 'success');
            };
            reader.readAsDataURL(uploadedFile);
        } else {
            // No file, just save directly
            clients.push(client);
            saveClients();
            
            resetForm();
            showNotification('Client added successfully!', 'success');
        }
    }
}

// Helper function to update client in storage
function updateClientInStorage(updatedClient) {
    if (isAdmin()) {
        // Admin updates from the specific user's data
        const userKey = `clientInformation_${updatedClient.userId}`;
        const userClients = JSON.parse(localStorage.getItem(userKey) || '[]');
        const index = userClients.findIndex(c => c.id === updatedClient.id);
        if (index !== -1) {
            userClients[index] = updatedClient;
            localStorage.setItem(userKey, JSON.stringify(userClients));
        }
    } else {
        // Regular user updates their own data
        const index = clients.findIndex(c => c.id === updatedClient.id);
        if (index !== -1) {
            clients[index] = updatedClient;
            saveClients();
        }
    }
    
    displayClients();
    updateSummary();
}

// Helper function to reset form
function resetForm() {
    document.getElementById('clientForm').reset();
    clearFilePreview();
    window.editingClientId = null;
    
    // Reset submit button text
    const submitBtn = document.querySelector('#clientForm button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Client';
    }
    
    displayClients();
    updateSummary();
}

// Delete client
function deleteClient(clientId) {
    if (confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
        const allClients = getAllClients();
        const client = allClients.find(c => c.id === clientId);
        
        if (!client) {
            showNotification('Client not found!', 'error');
            return;
        }
        
        if (isAdmin()) {
            // Admin deletes from the specific user's data
            const userKey = `clientInformation_${client.userId}`;
            const userClients = JSON.parse(localStorage.getItem(userKey) || '[]');
            const updatedClients = userClients.filter(c => c.id !== clientId);
            localStorage.setItem(userKey, JSON.stringify(updatedClients));
        } else {
            // Regular user deletes from their own data
            clients = clients.filter(c => c.id !== clientId);
            saveClients();
        }
        
        displayClients();
        updateSummary();
        showNotification('Client deleted successfully!', 'success');
    }
}

// Update summary cards
function updateSummary() {
    const totalClients = clients.length;
    const withProposals = clients.filter(c => c.proposal !== null).length;
    
    // Count clients added in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentAdditions = clients.filter(c => 
        new Date(c.addedDate) >= oneWeekAgo
    ).length;
    
    document.getElementById('totalClients').textContent = totalClients;
    document.getElementById('withProposals').textContent = withProposals;
    document.getElementById('recentAdditions').textContent = recentAdditions;
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
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
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

// Utility: Truncate file name
function truncateFileName(name, maxLength) {
    if (name.length <= maxLength) return name;
    const ext = name.split('.').pop();
    const baseName = name.substring(0, maxLength - ext.length - 2);
    return `${baseName}...${ext}`;
}

console.log('Client Info JS loaded');
