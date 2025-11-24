const API_URL = 'http://localhost:8080/api';

let currentUser = null;
let token = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = JSON.parse(userStr);
    document.getElementById('userRole').textContent = `Role: ${currentUser.role.toUpperCase()}`;
    
    // Load profile
    await loadProfile();
    
    // Show/hide tabs based on role
    if (currentUser.role === 'admin') {
        document.getElementById('adminTab').style.display = 'block';
        document.getElementById('profileTab').onclick = () => showTab('profile');
        await loadAllUsers();
    } else if (currentUser.role === 'reseller') {
        document.getElementById('resellerTab').style.display = 'block';
        document.getElementById('profileTab').onclick = () => showTab('profile');
        await loadResellerData();
    }
    
    // Setup event listeners
    setupEventListeners();
});

function showTab(tabName) {
    // Hide all content
    document.querySelectorAll('.content-tab').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.list-group-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected content
    if (tabName === 'profile') {
        document.getElementById('profileContent').style.display = 'block';
        document.getElementById('profileTab').classList.add('active');
    } else if (tabName === 'admin') {
        document.getElementById('adminContent').style.display = 'block';
        document.getElementById('adminTab').classList.add('active');
        loadAllUsers();
    } else if (tabName === 'reseller') {
        document.getElementById('resellerContent').style.display = 'block';
        document.getElementById('resellerTab').classList.add('active');
        loadResellerData();
    }
}

async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const user = await response.json();
        
        document.getElementById('profileUsername').textContent = user.username;
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('profileRole').textContent = user.role.toUpperCase();
        document.getElementById('profileStatus').innerHTML = 
            `<span class="badge status-${user.status}">${user.status.toUpperCase()}</span>`;
        document.getElementById('profileCreated').textContent = new Date(user.created_at).toLocaleDateString();
        
        if (user.expires_at) {
            const expiresDate = new Date(user.expires_at);
            document.getElementById('profileExpires').textContent = expiresDate.toLocaleDateString();
        }
        
        document.getElementById('newEmail').value = user.email;
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function loadAllUsers() {
    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const users = await response.json();
        const tbody = document.getElementById('usersTableBody');
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <span class="badge status-${user.status}">
                        ${user.status.toUpperCase()}
                    </span>
                </td>
                <td>${new Date(user.expires_at).toLocaleDateString()}</td>
                <td>
                    ${user.status === 'active' ? `
                        <button class="btn btn-sm btn-warning" onclick="suspendUser(${user.id})">
                            Suspend
                        </button>
                    ` : `
                        <button class="btn btn-sm btn-success" onclick="activateUser(${user.id})">
                            Activate
                        </button>
                    `}
                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function suspendUser(userId) {
    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}/suspend`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        await loadAllUsers();
        alert('User suspended successfully');
    } catch (error) {
        alert('Error suspending user');
    }
}

async function activateUser(userId) {
    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}/activate`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        await loadAllUsers();
        alert('User activated successfully');
    } catch (error) {
        alert('Error activating user');
    }
}

async function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}/delete`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            await loadAllUsers();
            alert('User deleted successfully');
        } catch (error) {
            alert('Error deleting user');
        }
    }
}

async function loadResellerData() {
    try {
        // Load quota
        const quotaResponse = await fetch(`${API_URL}/reseller/quota`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const quotaData = await quotaResponse.json();
        
        document.getElementById('totalQuota').textContent = quotaData.total_quota;
        document.getElementById('usersCreated').textContent = quotaData.used;
        document.getElementById('remainingQuota').textContent = quotaData.remaining;
        
        // Load users
        const usersResponse = await fetch(`${API_URL}/reseller/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await usersResponse.json();
        
        const tbody = document.getElementById('resellerUsersTableBody');
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>
                    <span class="badge status-${user.status}">
                        ${user.status.toUpperCase()}
                    </span>
                </td>
                <td>${new Date(user.expires_at).toLocaleDateString()}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading reseller data:', error);
    }
}

function setupEventListeners() {
    // Update profile form
    const updateForm = document.getElementById('updateProfileForm');
    if (updateForm) {
        updateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('newEmail').value;
            
            try {
                const response = await fetch(`${API_URL}/user/update`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });
                
                alert('Profile updated successfully');
                await loadProfile();
            } catch (error) {
                alert('Error updating profile');
            }
        });
    }
    
    // Create user form (reseller)
    const createForm = document.getElementById('createUserForm');
    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('userEmail').value;
            const expiryDays = parseInt(document.getElementById('expiryDays').value);
            
            try {
                const response = await fetch(`${API_URL}/reseller/create-user`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, expiry_days: expiryDays })
                });
                
                const data = await response.json();
                
                alert(`User Created!\nUsername: ${data.username}\nPassword: ${data.password}`);
                
                createForm.reset();
                await loadResellerData();
            } catch (error) {
                alert('Error creating user');
            }
        });
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

async function setResellerQuota() {
    const resellerID = document.getElementById('resellerIdInput').value;
    const quota = document.getElementById('quotaInput').value;
    
    if (!resellerID || !quota) {
        alert('Please fill in all fields');
        return;
    }
    
    try {
        // This would need a backend endpoint to be implemented
        alert('Quota update functionality to be implemented');
    } catch (error) {
        alert('Error updating quota');
    }
}
