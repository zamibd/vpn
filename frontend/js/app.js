const API_URL = window.location.origin + '/api';

// Mobile-responsive package loading
async function loadPackages() {
    try {
        const response = await fetch(`${API_URL}/packages`);
        const packages = await response.json();
        
        const container = document.getElementById('packagesContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        packages.forEach(pkg => {
            const col = document.createElement('div');
            // Responsive column classes for better mobile display
            col.className = 'col-lg-3 col-md-6 col-sm-6 col-12 mb-4';
            
            col.innerHTML = `
                <div class="package-card h-100">
                    <h4>${pkg.name}</h4>
                    <div class="package-price">$${pkg.price}</div>
                    <div class="package-days">${pkg.days} Days</div>
                    <div class="package-description">${pkg.description}</div>
                    <button class="btn btn-primary btn-lg w-100 mt-auto" onclick="selectPackage(${pkg.id})">
                        Choose Plan
                    </button>
                </div>
            `;
            
            container.appendChild(col);
        });
        
        // Add touch event handlers for mobile
        addMobileTouchHandlers();
        
    } catch (error) {
        console.error('Error loading packages:', error);
        const container = document.getElementById('packagesContainer');
        if (container) {
            container.innerHTML = '<div class="col-12 text-center"><p class="text-muted">Error loading packages. Please try again later.</p></div>';
        }
    }
}

// Add mobile touch handlers
function addMobileTouchHandlers() {
    const packageCards = document.querySelectorAll('.package-card');
    
    packageCards.forEach(card => {
        // Add touch feedback for mobile devices
        card.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        card.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
        
        // Prevent double-tap zoom on buttons
        const button = card.querySelector('button');
        if (button) {
            button.addEventListener('touchend', function(e) {
                e.preventDefault();
                this.click();
            });
        }
    });
}

// Enhanced smooth scrolling with mobile consideration
function smoothScrollTo(targetId) {
    const target = document.getElementById(targetId);
    if (target) {
        const offset = window.innerWidth <= 768 ? 80 : 100; // Smaller offset on mobile
        const targetPosition = target.offsetTop - offset;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Mobile-optimized package selection
function selectPackage(packageId) {
    // Add visual feedback
    const button = event.target;
    const originalText = button.textContent;
    
    button.textContent = 'Selected!';
    button.classList.add('btn-success');
    button.classList.remove('btn-primary');
    
    // Store selection in localStorage for mobile users
    localStorage.setItem('selectedPackage', packageId);
    
    // Redirect to signup with the selected package
    setTimeout(() => {
        window.location.href = `signup.html?package=${packageId}`;
    }, 800);
}

// Mobile navigation improvements
function initMobileNavigation() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    // Close mobile menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 991 && navbarCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                bsCollapse.hide();
            }
        });
    });
    
    // Handle anchor links with smooth scrolling
    navLinks.forEach(link => {
        if (link.getAttribute('href').startsWith('#')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                smoothScrollTo(targetId);
            });
        }
    });
}

// Responsive image lazy loading
function initLazyLoading() {
    const images = document.querySelectorAll('img[src*="placeholder"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    // Keep placeholder for demo, but add loading animation
                    img.style.opacity = '0.7';
                    img.style.transition = 'opacity 0.3s';
                    setTimeout(() => {
                        img.style.opacity = '1';
                    }, 500);
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Mobile viewport height adjustment for iOS Safari
function handleMobileViewport() {
    // Fix iOS Safari viewport height issues
    const setViewportHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', () => {
        setTimeout(setViewportHeight, 100);
    });
}

// Enhanced initialization for mobile
document.addEventListener('DOMContentLoaded', function() {
    // Load packages with mobile optimization
    loadPackages();
    
    // Initialize mobile-specific features
    initMobileNavigation();
    initLazyLoading();
    handleMobileViewport();
    
    // Add touch feedback to all buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        btn.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        });
    });
    
    // Prevent zoom on form inputs (iOS)
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.getAttribute('type') !== 'range') {
            input.style.fontSize = '16px'; // Prevents iOS zoom
        }
    });
    
    // Add swipe gestures for mobile (optional enhancement)
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 100;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            // Could add swipe navigation here if needed
            console.log(diff > 0 ? 'Swiped left' : 'Swiped right');
        }
    }
});

// Performance optimization for mobile
window.addEventListener('load', function() {
    // Preload critical resources
    const criticalResources = [
        '/api/packages',
        'login.html'
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = resource;
        document.head.appendChild(link);
    });
});
