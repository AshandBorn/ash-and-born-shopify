/**
 * Bundles Carousel with Flip Cards
 * Handles carousel navigation, card flipping, and touch/swipe gestures
 */

class BundlesCarousel {
  constructor(container) {
    this.container = container;
    this.track = container.querySelector('.bundles-carousel-track');
    this.cards = [...container.querySelectorAll('.bundles-card')];
    this.prevBtn = container.querySelector('.carousel-nav-prev');
    this.nextBtn = container.querySelector('.carousel-nav-next');
    this.dotsContainer = container.querySelector('.carousel-dots');
    
    this.currentIndex = 0;
    this.cardWidth = 0;
    this.cardsPerView = this.getCardsPerView();
    this.maxIndex = Math.max(0, this.cards.length - this.cardsPerView);
    
    // Touch/swipe properties
    this.startX = 0;
    this.currentX = 0;
    this.isDragging = false;
    this.dragThreshold = 50;
    
    this.init();
  }
  
  init() {
    this.setupCards();
    this.setupNavigation();
    this.setupDots();
    this.setupTouchEvents();
    this.setupFlipCards();
    this.setupResizeHandler();
    this.updateCarousel();
  }
  
  getCardsPerView() {
    const containerWidth = this.container.offsetWidth;
    if (containerWidth < 480) return 1;
    if (containerWidth < 768) return 1.5;
    if (containerWidth < 1024) return 2.5;
    return 3.5;
  }
  
  setupCards() {
    this.cardWidth = this.cards[0]?.offsetWidth + 32 || 312; // card width + gap
    this.cards.forEach((card, index) => {
      card.style.transform = `translateX(${index * this.cardWidth}px)`;
      card.setAttribute('data-index', index);
    });
  }
  
  setupNavigation() {
    this.prevBtn?.addEventListener('click', () => this.goToPrev());
    this.nextBtn?.addEventListener('click', () => this.goToNext());
  }
  
  setupDots() {
    if (!this.dotsContainer) return;
    
    this.dotsContainer.innerHTML = '';
    const numDots = Math.ceil(this.cards.length / this.cardsPerView);
    
    for (let i = 0; i < numDots; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => this.goToSlide(i));
      this.dotsContainer.appendChild(dot);
    }
  }
  
  setupTouchEvents() {
    // Mouse events for desktop
    this.track.addEventListener('mousedown', this.handleStart.bind(this));
    this.track.addEventListener('mousemove', this.handleMove.bind(this));
    this.track.addEventListener('mouseup', this.handleEnd.bind(this));
    this.track.addEventListener('mouseleave', this.handleEnd.bind(this));
    
    // Touch events for mobile
    this.track.addEventListener('touchstart', this.handleStart.bind(this), { passive: true });
    this.track.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
    this.track.addEventListener('touchend', this.handleEnd.bind(this));
    
    // Prevent text selection during drag
    this.track.addEventListener('selectstart', (e) => e.preventDefault());
  }
  
  setupFlipCards() {
    this.cards.forEach(card => {
      const flipBtn = card.querySelector('.flip-card-btn');
      const flipBackBtn = card.querySelector('.flip-back-btn');
      
      if (flipBtn) {
        flipBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.flipCard(card, true);
        });
      }
      
      if (flipBackBtn) {
        flipBackBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.flipCard(card, false);
        });
      }
      
      // Double tap to flip on mobile
      let tapCount = 0;
      card.addEventListener('touchend', (e) => {
        tapCount++;
        if (tapCount === 1) {
          setTimeout(() => {
            if (tapCount === 2) {
              e.preventDefault();
              this.flipCard(card);
            }
            tapCount = 0;
          }, 300);
        }
      });
    });
  }
  
  setupResizeHandler() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.cardsPerView = this.getCardsPerView();
        this.maxIndex = Math.max(0, this.cards.length - this.cardsPerView);
        this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
        this.setupCards();
        this.setupDots();
        this.updateCarousel();
      }, 250);
    });
  }
  
  handleStart(e) {
    this.isDragging = true;
    this.startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    this.track.style.cursor = 'grabbing';
    this.track.style.transition = 'none';
  }
  
  handleMove(e) {
    if (!this.isDragging) return;
    
    e.preventDefault();
    this.currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const deltaX = this.currentX - this.startX;
    const currentTransform = -(this.currentIndex * this.cardWidth);
    
    this.track.style.transform = `translateX(${currentTransform + deltaX}px)`;
  }
  
  handleEnd() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.track.style.cursor = 'grab';
    this.track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    const deltaX = this.currentX - this.startX;
    
    if (Math.abs(deltaX) > this.dragThreshold) {
      if (deltaX > 0 && this.currentIndex > 0) {
        this.goToPrev();
      } else if (deltaX < 0 && this.currentIndex < this.maxIndex) {
        this.goToNext();
      } else {
        this.updateCarousel();
      }
    } else {
      this.updateCarousel();
    }
    
    this.startX = 0;
    this.currentX = 0;
  }
  
  flipCard(card, forceFlip = null) {
    const isFlipped = card.classList.contains('flipped');
    
    if (forceFlip !== null) {
      card.classList.toggle('flipped', forceFlip);
    } else {
      card.classList.toggle('flipped', !isFlipped);
    }
    
    // Add haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }
  
  goToPrev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateCarousel();
    }
  }
  
  goToNext() {
    if (this.currentIndex < this.maxIndex) {
      this.currentIndex++;
      this.updateCarousel();
    }
  }
  
  goToSlide(index) {
    this.currentIndex = Math.min(Math.max(0, index), this.maxIndex);
    this.updateCarousel();
  }
  
  updateCarousel() {
    const translateX = -(this.currentIndex * this.cardWidth);
    this.track.style.transform = `translateX(${translateX}px)`;
    
    // Update navigation buttons
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentIndex === 0;
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentIndex >= this.maxIndex;
    }
    
    // Update dots
    const dots = this.dotsContainer?.querySelectorAll('.carousel-dot');
    dots?.forEach((dot, index) => {
      dot.classList.toggle('active', index === Math.floor(this.currentIndex));
    });
    
    // Close any flipped cards when navigating
    this.cards.forEach(card => {
      if (card.classList.contains('flipped')) {
        card.classList.remove('flipped');
      }
    });
  }
  
  // Auto-close flipped cards after delay
  scheduleAutoClose(card) {
    clearTimeout(card.autoCloseTimer);
    card.autoCloseTimer = setTimeout(() => {
      if (card.classList.contains('flipped')) {
        this.flipCard(card, false);
      }
    }, 5000);
  }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const carouselContainers = document.querySelectorAll('.bundles-carousel');
  
  carouselContainers.forEach(container => {
    new BundlesCarousel(container);
  });
});

// Handle cart form submissions with AJAX
document.addEventListener('submit', function(e) {
  if (e.target.matches('.bundles-carousel .product-form')) {
    e.preventDefault();
    
    const form = e.target;
    const button = form.querySelector('.add-to-cart-btn');
    const originalText = button.textContent;
    
    // Show loading state
    button.textContent = 'ADDING...';
    button.disabled = true;
    
    // Submit form data
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: new URLSearchParams(new FormData(form))
    })
    .then(response => response.json())
    .then(data => {
      // Show success state
      button.textContent = 'ADDED!';
      button.style.background = '#4caf50';
      
      // Update cart count if cart icon exists
      const cartCount = document.querySelector('.cart-count');
      if (cartCount) {
        fetch('/cart.js')
          .then(res => res.json())
          .then(cart => {
            cartCount.textContent = cart.item_count;
          });
      }
      
      // Reset button after delay
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        button.style.background = '';
      }, 2000);
    })
    .catch(error => {
      console.error('Error adding to cart:', error);
      button.textContent = 'ERROR';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
    });
  }
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
  const activeCarousel = document.querySelector('.bundles-carousel:hover');
  if (!activeCarousel) return;
  
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    activeCarousel.querySelector('.carousel-nav-prev')?.click();
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    activeCarousel.querySelector('.carousel-nav-next')?.click();
  }
});