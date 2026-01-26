/**
 * Litmus Science — Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavScroll();
    initSmoothScroll();
    initWaitlistForm();
    initScrollAnimations();
});

/**
 * Navigation scroll effect
 */
function initNavScroll() {
    const nav = document.querySelector('.nav');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const navHeight = document.querySelector('.nav').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Waitlist form handling
 */
function initWaitlistForm() {
    const form = document.getElementById('waitlist-form');
    
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const emailInput = document.getElementById('email-input');
        const roleSelect = document.getElementById('role-select');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        const email = emailInput.value;
        const role = roleSelect.value;
        
        // Disable form during submission
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        // Simulate API call (replace with actual endpoint)
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Success state
            form.innerHTML = `
                <div class="success-message">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px; color: var(--base-teal); margin-bottom: 1rem;">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <h3 style="color: var(--white); font-size: 1.5rem; margin-bottom: 0.5rem;">You're on the list!</h3>
                    <p style="color: var(--gray-200);">We'll reach out to <strong>${email}</strong> when we're ready.</p>
                </div>
            `;
            
            // Log for demo purposes
            console.log('Waitlist signup:', { email, role });
            
        } catch (error) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Request Access';
            alert('Something went wrong. Please try again.');
        }
    });
}

/**
 * Scroll-triggered animations
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.problem-card, .step, .privacy-option, .trust-item');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach((el, index) => {
        el.classList.add('fade-in');
        el.style.transitionDelay = `${index * 0.05}s`;
        observer.observe(el);
    });
}
