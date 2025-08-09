/*
 * Global JavaScript for Ash & Born website
 * Handles navigation toggles, cart functionality, search overlay, scroll animations,
 * notifications, loading animations and dynamic effects.
 */

// Smooth scrolling for hash links with proper timing
document.addEventListener('DOMContentLoaded', function() {
    // Handle all shop-related links that should scroll to #shop section
    document.querySelectorAll('a[href="#shop"], a[href="/#shop"], .shop-now-btn, .shop-all-link').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector('#shop');
            if (target) {
                const headerOffset = 120; // Proper space from header
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Cart state
let cart = [];
let cartCount = 0;

// Mapping of product image filenames to Shopify asset URLs.
// These are populated via Liquid so that the correct URL is generated at build time.
const productImages = {
    'watermelon.png': "{{ 'watermelon.png' | asset_url }}",
    'berry-blast.png': "{{ 'berry-blast.png' | asset_url }}",
    'citrus-splash.png': "{{ 'citrus-splash.png' | asset_url }}",
    'lemon-lime.png': "{{ 'lemon-lime.png' | asset_url }}",
    'cherry-punch.png': "{{ 'cherry-punch.png' | asset_url }}",
    'blue-raspberry.png': "{{ 'blue-raspberry.png' | asset_url }}",
    'mixed-berry.png': "{{ 'mixed-berry.png' | asset_url }}",
    'tropical-sunrise.png': "{{ 'tropical-sunrise.png' | asset_url }}",
    'hero-product.png': "{{ 'hero-product.png' | asset_url }}"
};

/**
 * Displays a quick view modal with product details.
 * @param {string} name - The product name
 * @param {number} price - The current price
 * @param {number} [oldPrice] - The original price (optional)
 * @param {string} description - A short product description
 * @param {string} imageName - The key for the productImages mapping
 */
function quickView(name, price, oldPrice, description, imageName) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'quickview-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 1rem;
        overflow-y: auto;
    `;

    // Create modal container
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 20px;
        max-width: 600px;
        width: 90%;
        padding: 2rem;
        position: relative;
        animation: slideInUp 0.3s ease;
        box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    `;

    // Image
    const img = document.createElement('img');
    img.src = productImages[imageName] || productImages['hero-product.png'];
    img.alt = name;
    img.style.width = '100%';
    img.style.borderRadius = '15px';
    img.style.marginBottom = '1.5rem';
    modal.appendChild(img);

    // Name
    const h2 = document.createElement('h2');
    h2.textContent = name;
    h2.style.fontSize = '1.8rem';
    h2.style.fontWeight = '700';
    h2.style.marginBottom = '0.5rem';
    modal.appendChild(h2);

    // Price row
    const priceRow = document.createElement('div');
    priceRow.style.display = 'flex';
    priceRow.style.alignItems = 'baseline';
    priceRow.style.gap = '0.5rem';
    priceRow.style.marginBottom = '1rem';
    const priceEl = document.createElement('span');
    priceEl.textContent = `${price.toFixed(2)} NIS`;
    priceEl.style.fontSize = '1.5rem';
    priceEl.style.fontWeight = '700';
    priceRow.appendChild(priceEl);
    if (oldPrice && oldPrice > price) {
        const oldEl = document.createElement('span');
        oldEl.textContent = `${oldPrice.toFixed(2)} NIS`;
        oldEl.style.fontSize = '1rem';
        oldEl.style.textDecoration = 'line-through';
        oldEl.style.color = '#999';
        priceRow.appendChild(oldEl);
    }
    modal.appendChild(priceRow);

    // Description
    const desc = document.createElement('p');
    desc.textContent = description;
    desc.style.fontSize = '1rem';
    desc.style.lineHeight = '1.6';
    desc.style.marginBottom = '2rem';
    modal.appendChild(desc);

    // Buttons container
    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '1rem';
    btnContainer.style.marginTop = '2rem';

    // Add to Cart button
    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add to Cart';
    addBtn.style.flex = '1';
    addBtn.style.padding = '1rem';
    addBtn.style.background = 'linear-gradient(135deg, var(--green-primary) 0%, var(--green-secondary) 100%)';
    addBtn.style.color = 'white';
    addBtn.style.border = 'none';
    addBtn.style.borderRadius = '10px';
    addBtn.style.fontWeight = 'bold';
    addBtn.style.cursor = 'pointer';
    addBtn.style.boxShadow = '0 5px 20px rgba(0,0,0,0.2)';
    addBtn.addEventListener('click', () => {
        addToCart(name, price);
        overlay.remove();
    });
    btnContainer.appendChild(addBtn);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.flex = '1';
    closeBtn.style.padding = '1rem';
    closeBtn.style.background = '#ddd';
    closeBtn.style.color = '#333';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '10px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.cursor = 'pointer';
    closeBtn.addEventListener('click', () => {
        overlay.remove();
    });
    btnContainer.appendChild(closeBtn);
    modal.appendChild(btnContainer);

    overlay.appendChild(modal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    document.body.appendChild(overlay);
}

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

// Close mobile menu
function closeMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.classList.remove('active');
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
    
    // Close mobile menu when navigation links are clicked
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const navMenu = document.querySelector('.nav-menu');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        if (navMenu && navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });
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

    // Initialize interactive click animations for buttons
    initClickableAnimations();
});

/**
 * Adds ripple and bounce effects to buttons when clicked.
 */
function initClickableAnimations() {
    const clickableButtons = document.querySelectorAll('.add-to-cart-btn, .shop-now-btn');
    clickableButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // create ripple effect
            createRipple(e, btn);
            // add bounce animation class
            btn.classList.add('click-bounce');
            setTimeout(() => {
                btn.classList.remove('click-bounce');
            }, 300);
        });
    });
}

/**
 * Creates a ripple element at the click position inside a target element.
 * @param {MouseEvent} e - The click event
 * @param {HTMLElement} element - The target element
 */
function createRipple(e, element) {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    element.appendChild(ripple);
    // Remove the ripple after the animation finishes
    setTimeout(() => {
        ripple.remove();
    }, 600);
}