const API_URL = window.location.origin + '/api';

let selectedPackage = null;

document.addEventListener('DOMContentLoaded', function() {
    // Load packages for selection
    loadPackages();
    
    // Check if package was pre-selected from homepage
    const urlParams = new URLSearchParams(window.location.search);
    const packageId = urlParams.get('package');
    if (packageId) {
        setTimeout(() => selectPackage(parseInt(packageId)), 500);
    }
    
    // Add form validation and submission
    setupFormHandlers();
});

// Load available VPN packages
async function loadPackages() {
    try {
        const response = await fetch(`${API_URL}/packages`);
        const packages = await response.json();
        
        const container = document.getElementById('packagesList');
        container.innerHTML = '';
        
        packages.forEach(pkg => {
            const packageItem = document.createElement('div');
            packageItem.className = 'package-item';
            packageItem.dataset.packageId = pkg.id;
            
            packageItem.innerHTML = `
                <div class="package-info">
                    <h5>${pkg.name}</h5>
                    <small>${pkg.description} - ${pkg.days} days access</small>
                </div>
                <div class="package-price">$${pkg.price}</div>
            `;
            
            packageItem.addEventListener('click', () => selectPackage(pkg.id));
            container.appendChild(packageItem);
        });
    } catch (error) {
        console.error('Error loading packages:', error);
        showAlert('Error loading packages. Please refresh the page.', 'danger');
    }
}

// Select a package
function selectPackage(packageId) {
    // Remove previous selection
    document.querySelectorAll('.package-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Select new package
    const packageElement = document.querySelector(`[data-package-id="${packageId}"]`);
    if (packageElement) {
        packageElement.classList.add('selected');
        selectedPackage = packageId;
        
        // Update button text with selected package
        const packageName = packageElement.querySelector('h5').textContent;
        const packagePrice = packageElement.querySelector('.package-price').textContent;
        const button = document.querySelector('.btn-signup .btn-text');
        button.textContent = `Create Account - ${packageName} ${packagePrice}`;
    }
}

// Setup form handlers
function setupFormHandlers() {
    const form = document.getElementById('signupForm');
    const inputs = document.querySelectorAll('.form-control-modern');
    
    // Add input focus effects
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
    
    // Form submission
    form.addEventListener('submit', handleSignup);
}

// Handle signup form submission
async function handleSignup(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = document.querySelector('.btn-signup');
    
    // Hide any existing alerts
    document.getElementById('alertBox').classList.add('d-none');
    
    // Validation
    if (!selectedPackage) {
        showAlert('Please select a VPN package first.', 'danger');
        return;
    }
    
    if (!fullName || !email || !password) {
        showAlert('Please fill in all required fields.', 'danger');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long.', 'danger');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match.', 'danger');
        return;
    }
    
    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address.', 'danger');
        return;
    }
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                full_name: fullName,
                email: email,
                password: password,
                package_id: selectedPackage
            })
        });
        
        const data = await response.json();
        
        if (!response.ok || data.error) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        
        // Success! Show success message with VPN credentials
        showSuccessModal(data);
        
    } catch (error) {
        console.error('Signup error:', error);
        
        let errorMessage = 'Registration failed. Please try again.';
        
        if (error.message.includes('already registered')) {
            errorMessage = 'This email is already registered. Please use a different email or try logging in.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showAlert(errorMessage, 'danger');
        
        // Add shake animation
        const signupCard = document.querySelector('.signup-card');
        signupCard.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            signupCard.style.animation = '';
        }, 500);
        
    } finally {
        // Remove loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Show success modal with VPN credentials
function showSuccessModal(data) {
    // Store user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Create success modal
    const modalHtml = `
        <div class="modal fade" id="successModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0" style="border-radius: 20px; overflow: hidden;">
                    <div class="modal-header bg-success text-white text-center" style="border: none;">
                        <div class="w-100">
                            <i class="bi bi-check-circle-fill" style="font-size: 3rem; margin-bottom: 10px;"></i>
                            <h4 class="modal-title mb-0">Account Created Successfully!</h4>
                        </div>
                    </div>
                    <div class="modal-body p-4">
                        <div class="text-center mb-4">
                            <h5 class="text-success mb-3">Welcome to VPN Pro!</h5>
                            <p class="text-muted">Your VPN account has been created. Here are your connection details:</p>
                        </div>
                        
                        <div class="credential-box p-3 mb-3" style="background: #f8f9fa; border-radius: 12px; border-left: 4px solid #28a745;">
                            <div class="row">
                                <div class="col-sm-4"><strong>VPN Username:</strong></div>
                                <div class="col-sm-8">
                                    <code id="vpnUsername" style="font-size: 1.1rem; color: #495057;">${data.username}</code>
                                    <button class="btn btn-sm btn-outline-secondary ms-2" onclick="copyToClipboard('vpnUsername')" title="Copy">
                                        <i class="bi bi-clipboard"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="credential-box p-3 mb-3" style="background: #f8f9fa; border-radius: 12px; border-left: 4px solid #667eea;">
                            <div class="row">
                                <div class="col-sm-4"><strong>Package:</strong></div>
                                <div class="col-sm-8">
                                    <span class="badge bg-primary">${data.package.name}</span>
                                    <span class="text-muted ms-2">$${data.package.price} - ${data.package.days} days</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="alert alert-info d-flex align-items-center">
                            <i class="bi bi-info-circle-fill me-2"></i>
                            <div>
                                <strong>Important:</strong> Save your VPN username! You'll need it to connect to our VPN servers.
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer justify-content-center" style="border: none; background: #f8f9fa;">
                        <button type="button" class="btn btn-success btn-lg px-4" onclick="goToDashboard()">
                            <i class="bi bi-speedometer2 me-2"></i>Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page and show
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
}

// Copy to clipboard function
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        // Show copied feedback
        const button = element.nextElementSibling;
        const originalHtml = button.innerHTML;
        button.innerHTML = '<i class="bi bi-check"></i>';
        button.classList.add('btn-success');
        button.classList.remove('btn-outline-secondary');
        
        setTimeout(() => {
            button.innerHTML = originalHtml;
            button.classList.remove('btn-success');
            button.classList.add('btn-outline-secondary');
        }, 2000);
    });
}

// Go to dashboard
function goToDashboard() {
    window.location.href = 'dashboard.html';
}

// Show alert function
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
        }, 5000);
    }
    
    // Scroll to alert
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to clear form
    if (e.key === 'Escape') {
        document.getElementById('signupForm').reset();
        document.getElementById('alertBox').classList.add('d-none');
        document.querySelectorAll('.package-item').forEach(item => {
            item.classList.remove('selected');
        });
        selectedPackage = null;
        document.querySelector('.btn-signup .btn-text').textContent = 'Create Account & Start Using VPN';
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
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
    
    .credential-box {
        transition: all 0.3s ease;
    }
    
    .credential-box:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
`;
document.head.appendChild(style);