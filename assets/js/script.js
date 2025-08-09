/*
 * Global JavaScript for Ash & Born website
 * Handles navigation toggles, cart functionality, search overlay, scroll animations,
 * notifications, loading animations and dynamic effects.
 */

// Cart state
let cart = [];
let cartCount = 0;

// Add product to cart and update UI
function addToCart(productName, price) {
    cart.push({ name: productName, price: price });
    cartCount++;
    const cartCountEl = document.querySelector('.cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = cartCount;
    }
    showNotification(`${productName} added to cart!`);
}

// Display a temporary notification message
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--green-primary);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        z-index: 1001;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Toggle the mobile navigation menu
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

// Toggle search overlay input
function toggleSearch() {
    const existingInput = document.querySelector('.search-overlay');
    if (existingInput) return;
    const searchInput = document.createElement('input');
    searchInput.className = 'search-overlay';
    searchInput.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        max-width: 400px;
        padding: 1rem;
        border: 2px solid var(--green-primary);
        border-radius: 50px;
        font-size: 1.1rem;
        z-index: 1002;
        outline: none;
        background: white;
    `;
    searchInput.placeholder = 'Search products...';
    const overlay = document.createElement('div');
    overlay.className = 'search-backdrop';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1001;
    `;
    document.body.appendChild(overlay);
    document.body.appendChild(searchInput);
    searchInput.focus();
    function closeSearch() {
        overlay.remove();
        searchInput.remove();
    }
    overlay.addEventListener('click', closeSearch);
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSearch();
        }
    });
}

// Simple cart toggle to display contents
function toggleCart() {
    alert(`Cart has ${cartCount} item(s)`);
}

// Initialize intersection observer for scroll animations
function initObserver() {
    const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, options);
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Header scroll effect to adjust style on scroll
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 30px rgba(0,0,0,0.15)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        }
    });
}

// Parallax effect for hero section
function initParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    });
}

// Bubble generator for new arrivals section
function createBubble() {
    const bubblesContainer = document.querySelector('.bubbles');
    if (!bubblesContainer) return;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const size = Math.random() * 20 + 5;
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.position = 'absolute';
    bubble.style.background = 'rgba(255,255,255,0.2)';
    bubble.style.borderRadius = '50%';
    bubble.style.left = Math.random() * 100 + '%';
    bubble.style.top = Math.random() * 100 + '%';
    bubble.style.animation = 'bubble-float 4s ease-in-out infinite';
    bubble.style.animationDelay = Math.random() * 4 + 's';
    bubblesContainer.appendChild(bubble);
    setTimeout(() => {
        bubble.remove();
    }, 6000);
}

// Loading animation on page load
function initLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader-overlay';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, var(--green-primary) 0%, var(--green-secondary) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
    `;
    loader.innerHTML = `
        <div style="text-align: center; color: white;">
            <div style="font-size: 3rem; font-weight: 900; margin-bottom: 1rem; letter-spacing: -1px;">ASH & BORN</div>
            <div style="width: 50px; height: 50px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        </div>
    `;
    const spinStyle = document.createElement('style');
    spinStyle.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(spinStyle);
    document.body.appendChild(loader);
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.remove();
        }, 500);
    }, 1500);
}

// Document ready initializations
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMobileMenu);
    }
    // Search icon toggle
    const searchIcon = document.querySelector('.search-icon');
    if (searchIcon) {
        searchIcon.addEventListener('click', toggleSearch);
    }
    // Cart icon toggle
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', toggleCart);
    }
    initObserver();
    initHeaderScroll();
    initParallax();
    initLoader();
    // Generate bubbles periodically if bubble container exists
    setInterval(createBubble, 2000);
});