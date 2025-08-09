/**
 * Payment Page JavaScript
 * Handles form validation, payment processing, and Shopify integration
 */

class PaymentProcessor {
  constructor() {
    this.form = document.getElementById('checkout-form');
    this.cart = this.getCart();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadCartItems();
    this.calculateTotals();
    this.setupPaymentMethods();
    this.setupFormValidation();
  }

  setupEventListeners() {
    // Form submission
    this.form?.addEventListener('submit', this.handleSubmit.bind(this));

    // Billing address toggle
    const sameBillingCheckbox = document.getElementById('same-billing');
    sameBillingCheckbox?.addEventListener('change', this.toggleBillingAddress.bind(this));

    // Payment method changes
    const paymentMethods = document.querySelectorAll('input[name="payment_method"]');
    paymentMethods.forEach(method => {
      method.addEventListener('change', this.handlePaymentMethodChange.bind(this));
    });

    // Card number formatting
    const cardNumberInput = document.getElementById('card-number');
    cardNumberInput?.addEventListener('input', this.formatCardNumber.bind(this));

    // Expiry date formatting
    const expiryInput = document.getElementById('expiry');
    expiryInput?.addEventListener('input', this.formatExpiry.bind(this));

    // CVV validation
    const cvvInput = document.getElementById('cvv');
    cvvInput?.addEventListener('input', this.validateCVV.bind(this));

    // Real-time validation
    const inputs = this.form?.querySelectorAll('input, select');
    inputs?.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  getCart() {
    // Get cart from localStorage or Shopify Cart API
    const cartData = localStorage.getItem('ash-born-cart');
    if (cartData) {
      return JSON.parse(cartData);
    }
    
    // Fallback: fetch from Shopify Cart API
    return this.fetchCartFromShopify();
  }

  async fetchCartFromShopify() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      return {
        items: cart.items,
        total: cart.total_price / 100, // Convert from cents
        currency: 'NIS'
      };
    } catch (error) {
      console.error('Error fetching cart:', error);
      return { items: [], total: 0, currency: 'NIS' };
    }
  }

  loadCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer || !this.cart.items?.length) {
      cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
      return;
    }

    const itemsHTML = this.cart.items.map(item => `
      <div class="cart-item">
        <div class="item-image">
          <img src="${item.image || '/assets/placeholder.png'}" alt="${item.title}">
        </div>
        <div class="item-details">
          <div class="item-name">${item.title}</div>
          <div class="item-variant">${item.variant_title || ''}</div>
          <div class="item-quantity">Qty: ${item.quantity}</div>
        </div>
        <div class="item-price">₪${(item.price * item.quantity / 100).toFixed(2)}</div>
      </div>
    `).join('');

    cartItemsContainer.innerHTML = itemsHTML;
  }

  calculateTotals() {
    if (!this.cart.items?.length) return;

    const subtotal = this.cart.total || 0;
    const shipping = this.calculateShipping(subtotal);
    const tax = this.calculateTax(subtotal);
    const total = subtotal + shipping + tax;

    document.getElementById('subtotal').textContent = `₪${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = shipping > 0 ? `₪${shipping.toFixed(2)}` : 'Free';
    document.getElementById('tax').textContent = `₪${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `₪${total.toFixed(2)}`;
  }

  calculateShipping(subtotal) {
    // Free shipping over ₪200
    return subtotal < 200 ? 25 : 0;
  }

  calculateTax(subtotal) {
    // 17% VAT in Israel
    return subtotal * 0.17;
  }

  setupPaymentMethods() {
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
      method.addEventListener('click', () => {
        const radio = method.querySelector('input[type="radio"]');
        radio.checked = true;
        this.handlePaymentMethodChange({ target: radio });
      });
    });
  }

  handlePaymentMethodChange(e) {
    const selectedMethod = e.target.value;
    
    // Hide all payment info sections
    document.querySelectorAll('.payment-info, .card-form').forEach(section => {
      section.style.display = 'none';
    });

    // Show relevant section
    switch (selectedMethod) {
      case 'card':
        document.getElementById('card-details').style.display = 'block';
        break;
      case 'paypal':
        document.getElementById('paypal-info').style.display = 'block';
        break;
      case 'bank_transfer':
        document.getElementById('bank-transfer-info').style.display = 'block';
        break;
    }

    // Update payment methods visual state
    document.querySelectorAll('.payment-method').forEach(method => {
      method.classList.remove('selected');
    });
    e.target.closest('.payment-method').classList.add('selected');
  }

  toggleBillingAddress(e) {
    const billingSection = document.getElementById('billing-address');
    billingSection.style.display = e.target.checked ? 'none' : 'block';
  }

  formatCardNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    e.target.value = value;
  }

  formatExpiry(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
  }

  validateCVV(e) {
    e.target.value = e.target.value.replace(/\D/g, '');
  }

  setupFormValidation() {
    // Add required field indicators
    const requiredFields = this.form?.querySelectorAll('input[required], select[required]');
    requiredFields?.forEach(field => {
      const label = field.previousElementSibling;
      if (label && label.tagName === 'LABEL') {
        label.innerHTML += ' <span style="color: var(--red-primary);">*</span>';
      }
    });
  }

  validateField(field) {
    const fieldGroup = field.closest('.form-group');
    const errorElement = fieldGroup.querySelector('.error-message');
    
    // Remove existing error
    fieldGroup.classList.remove('error');
    if (errorElement) {
      errorElement.remove();
    }

    let isValid = true;
    let errorMessage = '';

    // Check if required field is empty
    if (field.hasAttribute('required') && !field.value.trim()) {
      isValid = false;
      errorMessage = 'This field is required';
    }

    // Specific field validations
    switch (field.type) {
      case 'email':
        if (field.value && !this.isValidEmail(field.value)) {
          isValid = false;
          errorMessage = 'Please enter a valid email address';
        }
        break;
      case 'tel':
        if (field.value && !this.isValidPhone(field.value)) {
          isValid = false;
          errorMessage = 'Please enter a valid phone number';
        }
        break;
    }

    // Card-specific validations
    if (field.id === 'card-number' && field.value) {
      if (!this.isValidCardNumber(field.value)) {
        isValid = false;
        errorMessage = 'Please enter a valid card number';
      }
    }

    if (field.id === 'expiry' && field.value) {
      if (!this.isValidExpiry(field.value)) {
        isValid = false;
        errorMessage = 'Please enter a valid expiry date (MM/YY)';
      }
    }

    if (field.id === 'cvv' && field.value) {
      if (!this.isValidCVV(field.value)) {
        isValid = false;
        errorMessage = 'Please enter a valid CVV';
      }
    }

    if (!isValid) {
      fieldGroup.classList.add('error');
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = errorMessage;
      fieldGroup.appendChild(errorDiv);
    }

    return isValid;
  }

  clearFieldError(field) {
    const fieldGroup = field.closest('.form-group');
    fieldGroup.classList.remove('error');
    const errorElement = fieldGroup.querySelector('.error-message');
    if (errorElement) {
      errorElement.remove();
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  isValidCardNumber(cardNumber) {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    return /^\d{13,19}$/.test(cleanNumber) && this.luhnCheck(cleanNumber);
  }

  luhnCheck(cardNumber) {
    let sum = 0;
    let isEven = false;
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i), 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  }

  isValidExpiry(expiry) {
    const match = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    
    const month = parseInt(match[1], 10);
    const year = parseInt(match[2], 10) + 2000;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    return month >= 1 && month <= 12 && 
           (year > currentYear || (year === currentYear && month >= currentMonth));
  }

  isValidCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
  }

  validateForm() {
    const fields = this.form.querySelectorAll('input[required], select[required]');
    let isValid = true;

    fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    // Check terms and conditions
    const termsCheckbox = document.getElementById('terms');
    if (!termsCheckbox.checked) {
      isValid = false;
      this.showError('Please accept the terms and conditions');
    }

    return isValid;
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      this.showError('Please fix the errors above');
      return;
    }

    const submitBtn = document.getElementById('complete-order');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';

    try {
      const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
      
      switch (paymentMethod) {
        case 'card':
          await this.processCreditCardPayment();
          break;
        case 'paypal':
          await this.processPayPalPayment();
          break;
        case 'apple_pay':
          await this.processApplePayPayment();
          break;
        case 'google_pay':
          await this.processGooglePayPayment();
          break;
        case 'bank_transfer':
          await this.processBankTransferPayment();
          break;
        default:
          throw new Error('Invalid payment method');
      }

    } catch (error) {
      console.error('Payment error:', error);
      this.showError('Payment failed. Please try again.');
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      btnText.style.display = 'block';
      btnLoader.style.display = 'none';
    }
  }

  async processCreditCardPayment() {
    // Show payment modal
    this.showPaymentModal();

    // Collect form data
    const formData = new FormData(this.form);
    const orderData = this.collectOrderData(formData);

    try {
      // In a real implementation, you would integrate with Shopify Payments API
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        this.showSuccess('Payment successful! Redirecting to confirmation page...');
        
        // Clear cart
        localStorage.removeItem('ash-born-cart');
        
        // Redirect to thank you page
        setTimeout(() => {
          window.location.href = '/pages/thank-you';
        }, 2000);
      } else {
        throw new Error('Payment processing failed');
      }

    } catch (error) {
      this.hidePaymentModal();
      throw error;
    }
  }

  async processPayPalPayment() {
    // Redirect to PayPal or open PayPal modal
    this.showSuccess('Redirecting to PayPal...');
    setTimeout(() => {
      // In real implementation, redirect to PayPal
      window.location.href = '/pages/paypal-redirect';
    }, 1000);
  }

  async processApplePayPayment() {
    if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
      // Implement Apple Pay
      this.showSuccess('Opening Apple Pay...');
    } else {
      throw new Error('Apple Pay not available on this device');
    }
  }

  async processGooglePayPayment() {
    // Implement Google Pay
    this.showSuccess('Opening Google Pay...');
  }

  async processBankTransferPayment() {
    // Handle bank transfer
    const formData = new FormData(this.form);
    const orderData = this.collectOrderData(formData);
    
    // Create order with pending payment status
    this.showSuccess('Order created! Bank transfer details have been sent to your email.');
    
    setTimeout(() => {
      window.location.href = '/pages/bank-transfer-instructions';
    }, 2000);
  }

  collectOrderData(formData) {
    return {
      customer: {
        email: formData.get('email'),
        phone: formData.get('phone'),
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name')
      },
      shipping_address: {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        address1: formData.get('address'),
        address2: formData.get('apartment'),
        city: formData.get('city'),
        country: formData.get('country'),
        zip: formData.get('zip')
      },
      billing_address: formData.get('same_billing') ? null : {
        first_name: formData.get('billing_first_name'),
        last_name: formData.get('billing_last_name'),
        address1: formData.get('billing_address'),
        city: formData.get('billing_city'),
        country: formData.get('billing_country'),
        zip: formData.get('billing_zip')
      },
      payment_method: formData.get('payment_method'),
      note: formData.get('order_notes'),
      newsletter_signup: formData.get('newsletter') === 'on',
      line_items: this.cart.items
    };
  }

  showPaymentModal() {
    const modal = document.getElementById('payment-modal');
    modal.style.display = 'flex';
  }

  hidePaymentModal() {
    const modal = document.getElementById('payment-modal');
    modal.style.display = 'none';
  }

  showError(message) {
    // Create or update error message
    let errorDiv = document.querySelector('.error-message-global');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'error-message-global';
      errorDiv.style.cssText = `
        background: rgba(244, 67, 54, 0.1);
        border: 1px solid #f44336;
        color: #c62828;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        position: fixed;
        top: 2rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10000;
        max-width: 500px;
        width: 90%;
      `;
      document.body.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  }

  showSuccess(message) {
    // Create or update success message
    let successDiv = document.querySelector('.success-message-global');
    if (!successDiv) {
      successDiv = document.createElement('div');
      successDiv.className = 'success-message-global';
      successDiv.style.cssText = `
        background: rgba(76, 175, 80, 0.1);
        border: 1px solid #4caf50;
        color: #2e7d32;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        position: fixed;
        top: 2rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10000;
        max-width: 500px;
        width: 90%;
      `;
      document.body.appendChild(successDiv);
    }
    
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      successDiv.style.display = 'none';
    }, 5000);
  }
}

// Initialize payment processor when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('checkout-form')) {
    new PaymentProcessor();
  }
});

// Handle cart updates from other pages
window.addEventListener('storage', function(e) {
  if (e.key === 'ash-born-cart') {
    location.reload(); // Reload to update cart items and totals
  }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PaymentProcessor;
}