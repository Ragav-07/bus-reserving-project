// BusReserve Pro - Interactive Features

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add/remove glass effect based on scroll
        if (currentScroll > 50) {
            navbar.classList.add('nav-scrolled');
        } else {
            navbar.classList.remove('nav-scrolled');
        }

        // Hide/show navbar on scroll direction
        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    let isMenuOpen = false;

    mobileMenuBtn.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        
        if (isMenuOpen) {
            mobileMenu.classList.remove('hidden');
            setTimeout(() => {
                mobileMenu.classList.add('active');
            }, 10);
            mobileMenuBtn.innerHTML = '<i data-lucide="x" class="w-6 h-6"></i>';
        } else {
            mobileMenu.classList.remove('active');
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300);
            mobileMenuBtn.innerHTML = '<i data-lucide="menu" class="w-6 h-6"></i>';
        }
        
        lucide.createIcons();
    });

    // Close mobile menu when clicking on a link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            isMenuOpen = false;
            mobileMenu.classList.remove('active');
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300);
            mobileMenuBtn.innerHTML = '<i data-lucide="menu" class="w-6 h-6"></i>';
            lucide.createIcons();
        });
    });

    // Smooth Scroll for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active Navigation Link Highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('text-orange-400');
            link.querySelector('span')?.classList.remove('w-full');
            
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('text-orange-400');
                link.querySelector('span')?.classList.add('w-full');
            }
        });
    });

    // Search Form Animation
    const searchBtn = document.querySelector('button[type="submit"]');
    if (searchBtn) {
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add loading state
            const originalContent = this.innerHTML;
            this.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Searching...';
            this.disabled = true;
            lucide.createIcons();
            
            // Simulate search
            setTimeout(() => {
                this.innerHTML = originalContent;
                this.disabled = false;
                lucide.createIcons();
                
                // Show alert (in real app, this would redirect to results)
                showNotification('Searching for available buses...', 'info');
            }, 1500);
        });
    }

    // Notification System
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.notification-toast');
        if (existing) existing.remove();

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification-toast fixed bottom-5 right-5 z-50 px-6 py-4 rounded-xl glass-card border-l-4 shadow-2xl transform translate-y-20 opacity-0 transition-all duration-500 ${
            type === 'success' ? 'border-green-500' : 
            type === 'error' ? 'border-red-500' : 'border-orange-500'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center gap-3">
                <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info'}" class="w-5 h-5 ${type === 'success' ? 'text-green-500' : type === 'error' ? 'text-red-500' : 'text-orange-500'}"></i>
                <span class="text-white font-medium">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        lucide.createIcons();
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-y-20', 'opacity-0');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-y-20', 'opacity-0');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // Intersection Observer for Fade-in Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    document.querySelectorAll('.glass-card').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });

    // Parallax Effect for Hero Section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('#home .absolute.inset-0');
        if (parallax) {
            parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // Input Focus Effects
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('scale-105');
            this.parentElement.style.transition = 'transform 0.3s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('scale-105');
        });
    });

    // Dynamic Date Input (Set Today as Min)
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    // Card Hover Sound Effect (Optional - subtle feedback)
    const cards = document.querySelectorAll('.group');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });

    // Keyboard Navigation Support
    document.addEventListener('keydown', (e) => {
        // ESC to close mobile menu
        if (e.key === 'Escape' && isMenuOpen) {
            mobileMenuBtn.click();
        }
    });

    // Performance: Debounce Resize Events
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Recalculate positions if needed
            if (window.innerWidth >= 768 && isMenuOpen) {
                mobileMenuBtn.click();
            }
        }, 250);
    });

    console.log('🚌 BusReserve Pro initialized successfully!');
});