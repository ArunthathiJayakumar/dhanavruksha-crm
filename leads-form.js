// Lead Form JavaScript

// Formspree Configuration
const FORMSPREE_CONFIG = {
    FORM_ID: 'xlgpobkj'  // Formspree form ID
};

// Form submission handling
document.getElementById('leadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    // Collect form data
    const formData = new FormData(this);
    
    // Add formatted data for email
    const formattedData = new FormData();
    
    // Personal Info
    formattedData.append('First Name', formData.get('firstName'));
    formattedData.append('Last Name', formData.get('lastName'));
    formattedData.append('Full Name', `${formData.get('firstName')} ${formData.get('lastName')}`);
    formattedData.append('Age', formData.get('age') || 'Not provided');
    formattedData.append('Gender', formData.get('gender') || 'Not provided');
    
    // Contact Info
    formattedData.append('Phone', formData.get('phone'));
    formattedData.append('Email', formData.get('email'));
    formattedData.append('Address', formData.get('address') || 'Not provided');
    formattedData.append('City', formData.get('city') || 'Not provided');
    formattedData.append('State', formData.get('state') || 'Not provided');
    
    // Financial Info
    formattedData.append('Portfolio Value', formatPortfolioValue(formData.get('portfolioValue')));
    formattedData.append('Annual Income', formatAnnualIncome(formData.get('annualIncome')));
    formattedData.append('Investment Interests', formData.getAll('investmentInterest').join(', ') || 'None selected');
    
    // Inquiry Details
    formattedData.append('Inquiry Source', formatSource(formData.get('inquirySource')));
    formattedData.append('Reason for Call', formData.get('reasonForCall'));
    formattedData.append('Services Interested', formData.getAll('servicesInterested').join(', ') || 'None selected');
    
    // Additional Info
    formattedData.append('Additional Notes', formData.get('additionalNotes') || 'None');
    formattedData.append('Follow-up Date', formData.get('followUpDate') || 'Not specified');
    formattedData.append('Priority', (formData.get('priority') || 'medium').toUpperCase());
    formattedData.append('Lead ID', 'LEAD-' + Date.now());
    formattedData.append('Submission Date', new Date().toLocaleString());
    
    // Save to localStorage for backup
    const leadData = {
        personalInfo: {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            age: formData.get('age'),
            gender: formData.get('gender')
        },
        contactInfo: {
            phone: formData.get('phone'),
            email: formData.get('email'),
            address: formData.get('address'),
            city: formData.get('city'),
            state: formData.get('state')
        },
        financialInfo: {
            portfolioValue: formData.get('portfolioValue'),
            annualIncome: formData.get('annualIncome'),
            investmentInterests: formData.getAll('investmentInterest')
        },
        inquiryDetails: {
            source: formData.get('inquirySource'),
            reasonForCall: formData.get('reasonForCall'),
            servicesInterested: formData.getAll('servicesInterested')
        },
        additionalInfo: {
            notes: formData.get('additionalNotes'),
            followUpDate: formData.get('followUpDate'),
            priority: formData.get('priority')
        },
        timestamp: new Date().toISOString(),
        leadId: 'LEAD-' + Date.now()
    };
    saveLead(leadData);
    
    // Send to Formspree using traditional form submission (most reliable)
    const formUrl = `https://formspree.io/f/${FORMSPREE_CONFIG.FORM_ID}`;
    
    // Create a hidden form and submit it
    const hiddenForm = document.createElement('form');
    hiddenForm.method = 'POST';
    hiddenForm.action = formUrl;
    hiddenForm.target = '_self'; // Open in same tab
    hiddenForm.style.display = 'none';
    
    // Add all form fields
    const fields = {
        'First Name': formData.get('firstName'),
        'Last Name': formData.get('lastName'),
        'Full Name': `${formData.get('firstName')} ${formData.get('lastName')}`,
        'Age': formData.get('age') || 'Not provided',
        'Gender': formData.get('gender') || 'Not provided',
        'Phone': formData.get('phone'),
        'Email': formData.get('email'),
        'Address': formData.get('address') || 'Not provided',
        'City': formData.get('city') || 'Not provided',
        'State': formData.get('state') || 'Not provided',
        'Portfolio Value': formatPortfolioValue(formData.get('portfolioValue')),
        'Annual Income': formatAnnualIncome(formData.get('annualIncome')),
        'Investment Interests': formData.getAll('investmentInterest').join(', ') || 'None selected',
        'Inquiry Source': formatSource(formData.get('inquirySource')),
        'Reason for Call': formData.get('reasonForCall'),
        'Services Interested': formData.getAll('servicesInterested').join(', ') || 'None selected',
        'Additional Notes': formData.get('additionalNotes') || 'None',
        'Follow-up Date': formData.get('followUpDate') || 'Not specified',
        'Priority': (formData.get('priority') || 'medium').toUpperCase(),
        'Lead ID': 'LEAD-' + Date.now(),
        'Submission Date': new Date().toLocaleString()
    };
    
    // Create hidden inputs for each field
    for (const [key, value] of Object.entries(fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        hiddenForm.appendChild(input);
    }
    
    // Add form to document and submit
    document.body.appendChild(hiddenForm);
    
    // Submit the form
    hiddenForm.submit();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(hiddenForm);
    }, 1000);
    
    // Show success and reset
    showSuccessModal();
    document.getElementById('leadForm').reset();
    localStorage.removeItem('leadFormDraft');
    
    // Restore button state
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
});

// Helper function to format portfolio value
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

// Helper function to format annual income
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

// Helper function to format inquiry source
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

// Save lead to localStorage
function saveLead(leadData) {
    let leads = JSON.parse(localStorage.getItem('crmLeads') || '[]');
    leads.push(leadData);
    localStorage.setItem('crmLeads', JSON.stringify(leads));
    console.log('Lead saved:', leadData);
}

// Show success modal
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('active');
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('successModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Phone number validation - allow only numbers and common phone characters
document.getElementById('phone').addEventListener('input', function(e) {
    // Remove any non-numeric characters except +, -, (, ), and spaces
    this.value = this.value.replace(/[^0-9+\-()\s]/g, '');
});

// Age validation
document.getElementById('age').addEventListener('input', function(e) {
    const age = parseInt(this.value);
    if (age < 18) {
        this.setCustomValidity('Age must be at least 18');
    } else if (age > 100) {
        this.setCustomValidity('Please enter a valid age');
    } else {
        this.setCustomValidity('');
    }
});

// Set minimum date for follow-up to today
const followUpDateInput = document.getElementById('followUpDate');
if (followUpDateInput) {
    const today = new Date().toISOString().split('T')[0];
    followUpDateInput.setAttribute('min', today);
}

// Add visual feedback on form interaction
const formInputs = document.querySelectorAll('.lead-form input, .lead-form select, .lead-form textarea');
formInputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
});

// Mobile menu toggle is handled in script.js

// Auto-save form data to prevent loss on accidental refresh
let autoSaveInterval;
const leadForm = document.getElementById('leadForm');

function autoSaveForm() {
    const formData = new FormData(leadForm);
    const data = {};
    for (let [key, value] of formData.entries()) {
        if (data[key]) {
            if (!Array.isArray(data[key])) {
                data[key] = [data[key]];
            }
            data[key].push(value);
        } else {
            data[key] = value;
        }
    }
    localStorage.setItem('leadFormDraft', JSON.stringify(data));
}

// Start auto-save when user starts typing
leadForm.addEventListener('input', function() {
    if (!autoSaveInterval) {
        autoSaveInterval = setInterval(autoSaveForm, 5000); // Save every 5 seconds
    }
});

// Restore form data on page load
window.addEventListener('load', function() {
    const savedDraft = localStorage.getItem('leadFormDraft');
    if (savedDraft) {
        const data = JSON.parse(savedDraft);
        // Ask user if they want to restore
        if (confirm('You have unsaved form data. Would you like to restore it?')) {
            Object.keys(data).forEach(key => {
                const field = leadForm.querySelector(`[name="${key}"]`);
                if (field) {
                    if (field.type === 'checkbox') {
                        field.checked = data[key].includes(field.value);
                    } else if (field.type === 'radio') {
                        const radio = leadForm.querySelector(`[name="${key}"][value="${data[key]}"]`);
                        if (radio) radio.checked = true;
                    } else {
                        field.value = data[key];
                    }
                }
            });
        }
    }
});

// Clear draft on successful submission
leadForm.addEventListener('submit', function() {
    localStorage.removeItem('leadFormDraft');
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }
});

// Export leads functionality (for admin use)
function exportLeads() {
    const leads = JSON.parse(localStorage.getItem('crmLeads') || '[]');
    if (leads.length === 0) {
        alert('No leads to export');
        return;
    }
    
    const csvContent = convertToCSV(leads);
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

// Convert leads data to CSV format
function convertToCSV(leads) {
    const headers = ['Lead ID', 'Date', 'First Name', 'Last Name', 'Phone', 'Email', 'Portfolio Value', 'Priority', 'Source'];
    const rows = leads.map(lead => [
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
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

// Add keyboard shortcut for form submission (Ctrl+Enter)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        leadForm.dispatchEvent(new Event('submit'));
    }
});

console.log('Lead Form JS loaded successfully');
