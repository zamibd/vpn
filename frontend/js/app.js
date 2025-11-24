const API_URL = 'https://bdtunnel.com/api';

// Load packages on homepage
async function loadPackages() {
    try {
        const response = await fetch(`${API_URL}/packages`);
        const packages = await response.json();
        
        const container = document.getElementById('packagesContainer');
        container.innerHTML = packages.map(pkg => `
            <div class="col-md-6 col-lg-3">
                <div class="package-card">
                    <div class="package-days">${pkg.days} Days</div>
                    <h4>${pkg.name}</h4>
                    <p class="package-description">${pkg.description}</p>
                    <div class="package-price">$${pkg.price}</div>
                    <a href="login.html" class="btn btn-primary">Get Started</a>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading packages:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadPackages);
