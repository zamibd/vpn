const API_URL = 'http://bdtunnel.com/api';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const alertBox = document.getElementById('alertBox');
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.error) {
            alertBox.textContent = data.error;
            alertBox.classList.remove('d-none');
            return;
        }
        
        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } catch (error) {
        alertBox.textContent = 'Login error: ' + error.message;
        alertBox.classList.remove('d-none');
    }
});
