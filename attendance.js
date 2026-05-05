// Attendance JavaScript

// Sample staff data (you can modify this)
const staffList = [
    { id: 1, name: 'Krishna Dassan' },
    { id: 2, name: 'Balaji V' },
    { id: 3, name: 'Balaji S' },
    { id: 4, name: 'Ganesh T' },
    { id: 5, name: 'Bharathi K' },
    { id: 6, name: 'Thirunavukarasu' },
    { id: 7, name: 'Vijay' },
    { id: 8, name: 'Keerthana' },
    { id: 9, name: 'Akash' },
    { id: 10, name: 'Aarthi' }
];

let monthlyAttendance = {};
let attendanceRecords = [];
let selectedMonth = new Date().getMonth();
let selectedYear = new Date().getFullYear();
let daysInMonth = 30;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeMonthYear();
    loadAttendanceRecords();
    generateAttendanceGrid();
});

// Generate attendance grid for the selected month
function generateAttendanceGrid() {
    // Calculate days in month
    daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    
    // Update day headers
    const dayNumbersRow = document.querySelector('.day-numbers');
    dayNumbersRow.innerHTML = '';
    
    for (let day = 1; day <= 31; day++) {
        const th = document.createElement('th');
        th.className = `day-cell ${day > daysInMonth ? 'inactive-day' : ''}`;
        th.textContent = day <= daysInMonth ? day : '';
        if (day <= daysInMonth) {
            // Add weekday indicator
            const date = new Date(selectedYear, selectedMonth, day);
            const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
            th.setAttribute('data-weekday', weekday);
            if (weekday === 'Sat' || weekday === 'Sun') {
                th.classList.add('weekend');
            }
        }
        dayNumbersRow.appendChild(th);
    }
    
    // Generate staff rows
    const tbody = document.getElementById('staffAttendanceBody');
    tbody.innerHTML = '';
    
    // Initialize monthly attendance if not exists
    if (!monthlyAttendance[selectedYear]) {
        monthlyAttendance[selectedYear] = {};
    }
    if (!monthlyAttendance[selectedYear][selectedMonth]) {
        monthlyAttendance[selectedYear][selectedMonth] = {};
        staffList.forEach(staff => {
            monthlyAttendance[selectedYear][selectedMonth][staff.id] = {};
            for (let day = 1; day <= daysInMonth; day++) {
                // Store as object with status and time
                monthlyAttendance[selectedYear][selectedMonth][staff.id][day] = { status: null, time: null };
            }
        });
    }
    
    // Create row for each staff member
    staffList.forEach(staff => {
        const tr = document.createElement('tr');
        tr.className = 'staff-row';
        tr.innerHTML = `
            <td class="staff-name">${staff.name}</td>
            ${generateDayCells(staff.id)}
            <td class="stat-cell present-stat" id="present-${staff.id}">0</td>
            <td class="stat-cell absent-stat" id="absent-${staff.id}">0</td>
            <td class="stat-cell percent-stat" id="percent-${staff.id}">0%</td>
        `;
        tbody.appendChild(tr);
    });
    
    // Apply visual styling to existing selections
    setTimeout(() => initializeGridStyling(), 0);
    
    // Update overall summary
    updateOverallSummary();
}

// Generate day cells for a staff member
function generateDayCells(staffId) {
    let html = '';
    for (let day = 1; day <= 31; day++) {
        if (day > daysInMonth) {
            html += `<td class="day-cell inactive-day"></td>`;
        } else {
            const attendanceData = monthlyAttendance[selectedYear][selectedMonth][staffId][day];
            const attendance = attendanceData.status || null;
            const isWeekend = new Date(selectedYear, selectedMonth, day).getDay() === 0 || 
                             new Date(selectedYear, selectedMonth, day).getDay() === 6;
            html += `
                <td class="day-cell ${day > daysInMonth ? 'inactive-day' : ''} ${isWeekend ? 'weekend' : ''}" 
                    data-day="${day}" 
                    data-staff="${staffId}">
                    <select onchange="updateDayAttendance(${staffId}, ${day}, this.value)" 
                            class="attendance-select ${attendance || ''}" 
                            ${day > daysInMonth ? 'disabled' : ''}>
                        <option value="">-</option>
                        <option value="present" ${attendance === 'present' ? 'selected' : ''}>P</option>
                        <option value="absent" ${attendance === 'absent' ? 'selected' : ''}>A</option>
                    </select>
                </td>
            `;
        }
    }
    return html;
}

// Initialize grid with proper styling after DOM is ready
function initializeGridStyling() {
    // Apply visual styling to all pre-filled dropdowns
    document.querySelectorAll('.attendance-select').forEach(select => {
        const value = select.value;
        if (value) {
            select.classList.remove('present', 'absent');
            select.classList.add(value);
        }
    });
}

// Load attendance records
function loadAttendanceRecords() {
    const stored = localStorage.getItem('attendanceRecords');
    if (stored) {
        attendanceRecords = JSON.parse(stored);
    }
    displayRecords();
}

// Get initials from name
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// Initialize month and year selectors
function initializeMonthYear() {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    
    // Set current month
    monthSelect.value = selectedMonth;
    
    // Populate year dropdown (current year +/- 5 years)
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        if (i === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }
    selectedYear = currentYear;
    
    // Generate initial grid
    generateAttendanceGrid();
}

// Change month/year
function changeMonth() {
    selectedMonth = parseInt(document.getElementById('monthSelect').value);
    selectedYear = parseInt(document.getElementById('yearSelect').value);
    
    // Regenerate grid for the new month
    generateAttendanceGrid();
}

// Update attendance for a specific day
function updateDayAttendance(staffId, day, status) {
    // Get current attendance data
    const currentData = monthlyAttendance[selectedYear][selectedMonth][staffId][day];
    const currentValue = currentData.status || null;
    
    // Only update if value actually changed
    if (currentValue === status) {
        return; // No change needed
    }
    
    // Update with status and current time
    const currentTime = status ? new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    }) : null;
    
    monthlyAttendance[selectedYear][selectedMonth][staffId][day] = {
        status: status || null,
        time: currentTime
    };
    
    calculateStaffStats(staffId);
    updateOverallSummary();
    
    // Update the dropdown visual styling
    updateDropdownVisual(staffId, day, status);
    
    // Show notification with time
    if (status) {
        console.log(`Attendance marked for Day ${day}: ${status} at ${currentTime}`);
    }
}

// Update dropdown visual styling based on selection
function updateDropdownVisual(staffId, day, status) {
    // Find the specific select element
    const dayCell = document.querySelector(`.day-cell[data-day="${day}"][data-staff="${staffId}"]`);
    if (dayCell) {
        const select = dayCell.querySelector('.attendance-select');
        if (select) {
            // Remove all status classes
            select.classList.remove('present', 'absent');
            // Add the appropriate class based on status
            if (status) {
                select.classList.add(status);
            }
        }
    }
}

// Calculate stats for individual staff
function calculateStaffStats(staffId) {
    let presentDays = 0;
    let absentDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
        const attendanceData = monthlyAttendance[selectedYear][selectedMonth][staffId][day];
        const status = attendanceData.status;
        if (status === 'present') presentDays++;
        if (status === 'absent') absentDays++;
    }
    
    const totalMarked = presentDays + absentDays;
    const percentage = totalMarked > 0 ? ((presentDays / totalMarked) * 100).toFixed(1) : 0;
    
    document.getElementById(`present-${staffId}`).textContent = presentDays;
    document.getElementById(`absent-${staffId}`).textContent = absentDays;
    document.getElementById(`percent-${staffId}`).textContent = percentage + '%';
}

// Mark all present for all days
function markAllPresentForMonth() {
    if (!confirm('Mark all staff as PRESENT for all days of this month?')) return;
    
    const currentTime = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    
    staffList.forEach(staff => {
        for (let day = 1; day <= daysInMonth; day++) {
            monthlyAttendance[selectedYear][selectedMonth][staff.id][day] = {
                status: 'present',
                time: currentTime
            };
        }
    });
    
    // Refresh the grid
    generateAttendanceGrid();
}

// Clear all attendance
function clearAllAttendance() {
    if (!confirm('Clear all attendance marks for this month?')) return;
    
    staffList.forEach(staff => {
        for (let day = 1; day <= daysInMonth; day++) {
            monthlyAttendance[selectedYear][selectedMonth][staff.id][day] = { status: null, time: null };
        }
    });
    
    // Refresh the grid
    generateAttendanceGrid();
}

// Save monthly attendance
function saveMonthlyAttendance() {
    // Check if any attendance is marked
    let hasData = false;
    staffList.forEach(staff => {
        for (let day = 1; day <= daysInMonth; day++) {
            const attendanceData = monthlyAttendance[selectedYear][selectedMonth][staff.id][day];
            if (attendanceData.status) {
                hasData = true;
            }
        }
    });
    
    if (!hasData) {
        alert('Please mark at least one attendance before saving');
        return;
    }
    
    // Remove existing record for this month
    attendanceRecords = attendanceRecords.filter(r => 
        !(r.month === selectedMonth && r.year === selectedYear)
    );
    
    // Create monthly attendance record
    const record = {
        id: 'ATT-' + selectedYear + '-' + (selectedMonth + 1),
        month: selectedMonth,
        year: selectedYear,
        monthName: new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' }),
        daysInMonth: daysInMonth,
        attendance: JSON.parse(JSON.stringify(monthlyAttendance[selectedYear][selectedMonth])),
        staffStats: staffList.map(staff => {
            let present = 0, absent = 0;
            for (let day = 1; day <= daysInMonth; day++) {
                const attendanceData = monthlyAttendance[selectedYear][selectedMonth][staff.id][day];
                const status = attendanceData.status;
                if (status === 'present') present++;
                if (status === 'absent') absent++;
            }
            const total = present + absent;
            return {
                id: staff.id,
                name: staff.name,
                role: staff.role,
                present: present,
                absent: absent,
                percentage: total > 0 ? ((present / total) * 100).toFixed(1) : 0
            };
        })
    };
    
    // Save to localStorage
    saveAttendanceRecord(record);
    
    alert(`Monthly attendance for ${record.monthName} ${selectedYear} saved successfully!`);
    
    // Reload records
    loadAttendanceRecords();
}

// Update overall summary
function updateOverallSummary() {
    let totalPresentDays = 0;
    let totalAbsentDays = 0;
    
    staffList.forEach(staff => {
        for (let day = 1; day <= daysInMonth; day++) {
            const status = monthlyAttendance[selectedYear][selectedMonth][staff.id][day];
            if (status === 'present') totalPresentDays++;
            if (status === 'absent') totalAbsentDays++;
        }
    });
    
    const totalMarked = totalPresentDays + totalAbsentDays;
    const overallPresentPercent = totalMarked > 0 ? ((totalPresentDays / totalMarked) * 100).toFixed(1) : 0;
    const overallAbsentPercent = totalMarked > 0 ? ((totalAbsentDays / totalMarked) * 100).toFixed(1) : 0;
    
    document.getElementById('totalDaysCount').textContent = daysInMonth;
    document.getElementById('totalStaffCount').textContent = staffList.length;
    document.getElementById('overallPresent').textContent = overallPresentPercent + '%';
    document.getElementById('overallAbsent').textContent = overallAbsentPercent + '%';
}

// Load existing monthly record
function loadExistingMonthlyRecord() {
    // Check if record exists for selected month
    const existingRecord = attendanceRecords.find(r => 
        r.month === selectedMonth && r.year === selectedYear
    );
    
    if (existingRecord) {
        monthlyAttendance[selectedYear] = {};
        monthlyAttendance[selectedYear][selectedMonth] = JSON.parse(JSON.stringify(existingRecord.attendance));
        generateAttendanceGrid();
    } else {
        // Initialize fresh month
        if (!monthlyAttendance[selectedYear]) {
            monthlyAttendance[selectedYear] = {};
        }
        monthlyAttendance[selectedYear][selectedMonth] = {};
        staffList.forEach(staff => {
            monthlyAttendance[selectedYear][selectedMonth][staff.id] = {};
            for (let day = 1; day <= daysInMonth; day++) {
                monthlyAttendance[selectedYear][selectedMonth][staff.id][day] = null;
            }
        });
        generateAttendanceGrid();
    }
}

// Display records
function displayRecords() {
    const container = document.getElementById('recordsContainer');
    
    if (attendanceRecords.length === 0) {
        container.innerHTML = '<p style="color: #888; text-align: center;">No monthly attendance records yet</p>';
        return;
    }
    
    // Sort by year and month (most recent first)
    const sortedRecords = [...attendanceRecords].sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return b.month - a.month;
    });
    
    container.innerHTML = sortedRecords.map(record => {
        const monthName = record.monthName || new Date(record.year, record.month).toLocaleString('default', { month: 'long' });
        
        return `
            <div class="record-card">
                <div class="record-date">
                    <div class="month">${monthName}</div>
                    <div class="year">${record.year}</div>
                </div>
                <div class="record-stats">
                    <div class="stat-item present">
                        <i class="fas fa-user-check"></i>
                        <span>Avg: ${record.staffStats.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / record.staffStats.length}% Present</span>
                    </div>
                    <div class="stat-item info">
                        <i class="fas fa-users"></i>
                        <span>${record.staffStats.length} Staff</span>
                    </div>
                </div>
                <div class="record-actions">
                    <button class="btn-icon" onclick="viewRecord('${record.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deleteRecord('${record.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// View record details
function viewRecord(recordId) {
    const record = attendanceRecords.find(r => r.id === recordId);
    if (!record) return;
    
    const monthName = record.monthName || new Date(record.year, record.month).toLocaleString('default', { month: 'long' });
    
    let details = `Monthly Attendance for ${monthName} ${record.year}\n\n`;
    details += 'Individual Staff Summary:\n';
    
    record.staffStats.forEach(staff => {
        details += `\n${staff.name} (${staff.role}):\n`;
        details += `  Present: ${staff.present} days\n`;
        details += `  Absent: ${staff.absent} days\n`;
        details += `  Percentage: ${staff.percentage}%\n`;
    });
    
    details += `\n\nTotal Days in Month: ${record.daysInMonth}\n`;
    details += `Total Staff: ${record.staffStats.length}\n`;
    
    alert(details);
}

// Delete record
function deleteRecord(recordId) {
    if (confirm('Are you sure you want to delete this attendance record?')) {
        attendanceRecords = attendanceRecords.filter(r => r.id !== recordId);
        localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
        loadAttendanceRecords();
        
        // If deleted record was for current month, reload it
        const record = attendanceRecords.find(r => r.id === recordId);
        if (record && record.month === selectedMonth && record.year === selectedYear) {
            loadExistingMonthlyRecord();
        }
    }
}

// Save attendance record
function saveAttendanceRecord(record) {
    // Remove existing record for same month
    attendanceRecords = attendanceRecords.filter(r => 
        !(r.month === record.month && r.year === record.year)
    );
    attendanceRecords.push(record);
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
}

console.log('Attendance JS loaded');
