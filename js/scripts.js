/* ==========================================================================
   Smooth Scroll to Top on Refresh
   ========================================================================== */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, 100);
});

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if(menuBtn) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      menuBtn.innerHTML = navLinks.classList.contains('open') ? '✕' : '☰';
    });
  }

  // Active Nav Highlighting
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === currentPath.split('/').pop() || (currentPath.endsWith('/') && link.getAttribute('href') === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Scroll Observer (Fade Slide Up)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
  }

  // Favorites LocalStorage Toggle
  const hearts = document.querySelectorAll('.heart-btn');
  hearts.forEach(btn => {
    const productId = btn.dataset.id;
    if (localStorage.getItem(`fav_${productId}`) === 'true') {
      btn.classList.add('active');
      btn.innerHTML = '❤️';
    }
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const isActive = btn.classList.toggle('active');
      btn.innerHTML = isActive ? '❤️' : '🤍';
      localStorage.setItem(`fav_${productId}`, isActive);
    });
  });

  // ==========================================================================
  // Cart Sidebar Toggle & Functional Logic
  // ==========================================================================
  const cartBtn = document.querySelector('.floating-cart-btn');
  const cartSidebar = document.querySelector('.cart-sidebar');
  const closeCartBtn = document.querySelector('.close-cart');
  const cartBadge = document.querySelector('.cart-badge');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartTotalEl = document.getElementById('cart-total');

  // Load cart from local storage or start fresh
  let cart = JSON.parse(localStorage.getItem('cartItems')) || [];

  // Function to save and render the cart
  function renderCart() {
    // Only run if the cart exists on this page
    if (!cartSidebar) return; 

    let total = 0;
    let count = 0;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p style="color: var(--text-mid);">Your cart is empty. Time to find some cute things!</p>';
    } else {
      cartItemsContainer.innerHTML = ''; // Clear container
      
      cart.forEach((item, index) => {
        total += item.price * item.qty;
        count += item.qty;

        // Create the HTML for each cart item
        cartItemsContainer.innerHTML += `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--pink-light); padding-bottom: 8px;">
            <div style="display: flex; gap: 12px; align-items: center;">
              <div style="font-size: 24px; background: var(--pink-light); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">${item.img}</div>
              <div>
                <div style="font-weight: 700; font-size: var(--fs-sm); color: var(--text-dark);">${item.name}</div>
                <div style="color: var(--text-mid); font-size: var(--fs-xs);">$${item.price.toFixed(2)} x ${item.qty}</div>
              </div>
            </div>
            <button onclick="removeFromCart(${index})" style="background: none; border: none; color: var(--pink-deep); font-size: 24px; cursor: pointer; transition: transform 0.2s;">&times;</button>
          </div>
        `;
      });
    }

    // Update Text Elements
    if (cartTotalEl) cartTotalEl.innerText = `Total: $${total.toFixed(2)}`;
    if (cartBadge) {
      cartBadge.innerText = count;
      // Trigger badge animation
      cartBadge.style.animation = 'none';
      setTimeout(() => cartBadge.style.animation = 'heartBeat 0.5s ease', 10);
    }
  }

  // Make the remove function globally available so the inline HTML button can click it
  window.removeFromCart = function(index) {
    cart.splice(index, 1); // Remove item from array
    localStorage.setItem('cartItems', JSON.stringify(cart)); // Save to storage
    renderCart(); // Update UI
  };

  // Open/Close Sidebar listeners
  if (cartBtn && cartSidebar) {
    cartBtn.addEventListener('click', () => cartSidebar.classList.add('open'));
    closeCartBtn.addEventListener('click', () => cartSidebar.classList.remove('open'));
  }

  // Add to Cart Button Listener
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Navigate up the HTML tree to find the parent card, then extract text
      const card = e.target.closest('.card');
      const name = card.querySelector('h3').innerText;
      const priceText = card.querySelector('.price-tag').innerText;
      const price = parseFloat(priceText.replace('$', ''));
      const img = card.querySelector('.product-img').innerHTML;

      // Check if this item is already in the cart array
      const existingItem = cart.find(item => item.name === name);
      if (existingItem) {
        existingItem.qty += 1;
      } else {
        cart.push({ name, price, img, qty: 1 });
      }

      // Save and update
      localStorage.setItem('cartItems', JSON.stringify(cart));
      renderCart();
      
      // Auto-open the cart so the user sees their item was added!
      if (cartSidebar) cartSidebar.classList.add('open');
    });
  });

  // Render on initial page load
  renderCart();

  // Product Filtering (Products Page)
  const filterChips = document.querySelectorAll('.chip');
  const productCards = document.querySelectorAll('.product-grid .card');
  if (filterChips.length > 0) {
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.dataset.filter;
        
        productCards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'block';
            if(!prefersReducedMotion) {
               card.style.animation = 'popIn 0.4s ease-out forwards';
            }
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // FAQ Accordion (Contact Page)
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(q => {
    q.addEventListener('click', () => {
      const answer = q.nextElementSibling;
      const icon = q.querySelector('span');
      if (answer.style.maxHeight) {
        answer.style.maxHeight = null;
        icon.innerText = '+';
      } else {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        icon.innerText = '-';
      }
    });
  });

  // Form Validation (Contact Page)
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('click', (e) => {
      if(e.target.tagName === 'BUTTON') {
        e.preventDefault();
        let valid = true;
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
          if (!input.value.trim()) {
            valid = false;
            input.classList.add('error-shake');
            setTimeout(() => input.classList.remove('error-shake'), 400);
          }
        });

        if (valid) {
          contactForm.innerHTML = `
            <div style="text-align: center; padding: 40px;">
              <h2 class="pacifico" style="color: var(--pink-deep); margin-bottom:16px;">Message sent! 💝</h2>
              <p>We'll get back to you within 1–2 business days. Thank you for reaching out!</p>
            </div>
          `;
        }
      }
    });
  }
});