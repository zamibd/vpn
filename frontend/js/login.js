const API_URL = window.location.origin + '/api';

document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers for demo credentials
    const demoCreds = document.querySelectorAll('.demo-cred');
    demoCreds.forEach((cred, index) => {
        cred.style.cursor = 'pointer';
        cred.addEventListener('click', function() {
            const value = this.querySelector('.demo-value').textContent;
            if (index === 0) { // Username
                document.getElementById('username').value = value;
                document.getElementById('username').focus();
            } else { // Password  
                document.getElementById('password').value = value;
                document.getElementById('password').focus();
            }
            
            // Add visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Add input focus effects
    const inputs = document.querySelectorAll('.form-control-modern');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
        
        input.addEventListener('input', function() {
            if (this.value) {
                this.parentElement.classList.add('has-value');
            } else {
                this.parentElement.classList.remove('has-value');
            }
        });
    });
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const alertBox = document.getElementById('alertBox');
    const alertText = document.getElementById('alertText');
    const submitBtn = document.querySelector('.btn-login');
    
    // Hide any existing alerts
    alertBox.classList.add('d-none');
    
    // Validation
    if (!username || !password) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok || data.error) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        
        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Show success message briefly
        showAlert('Login successful! Redirecting...', 'success');
        
        // Add a small delay for better UX
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.message.includes('credentials')) {
            errorMessage = 'Invalid username or password. Please check your credentials.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showAlert(errorMessage, 'danger');
        
        // Add shake animation to form
        const loginCard = document.querySelector('.login-card');
        loginCard.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            loginCard.style.animation = '';
        }, 500);
        
    } finally {
        // Remove loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});

function showAlert(message, type = 'danger') {
    const alertBox = document.getElementById('alertBox');
    const alertText = document.getElementById('alertText');
    
    alertText.textContent = message;
    alertBox.className = `alert alert-${type} alert-modern`;
    alertBox.classList.remove('d-none');
    
    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            alertBox.classList.add('d-none');
        }, 3000);
    }
    
    // Scroll to alert if needed
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Enter key on demo credentials
    if (e.target.closest('.demo-cred') && e.key === 'Enter') {
        e.target.closest('.demo-cred').click();
    }
    
    // Escape key to clear form
    if (e.key === 'Escape') {
        document.getElementById('loginForm').reset();
        document.getElementById('alertBox').classList.add('d-none');
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('focused', 'has-value');
        });
    }
});

// Add CSS for shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .demo-cred {
        transition: transform 0.15s ease;
    }
    
    .demo-cred:hover {
        transform: scale(1.02);
        background: #f8f9fa !important;
    }
    
    .form-group.focused .input-icon {
        color: #667eea !important;
        transform: translateY(-50%) scale(1.1);
    }
    
    .form-group.has-value .input-icon {
        color: #4a5568;
    }
    
    .alert-success {
        background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%) !important;
        color: #2f855a !important;
        border-left: 4px solid #38a169 !important;
    }
`;
document.head.appendChild(style);
