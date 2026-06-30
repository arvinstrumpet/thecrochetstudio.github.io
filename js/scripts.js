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
  const clearCartBtn = document.querySelector('.clear-cart-btn');
  const cartBadge = document.querySelector('.cart-badge');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartTotalEl = document.getElementById('cart-total');

  let cart = JSON.parse(localStorage.getItem('cartItems')) || [];

  function renderCart() {
    let total = 0;
    let count = 0;

    // Safety check: Only try to render items if the container exists on this page
    if (cartItemsContainer) {
      if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="color: var(--text-mid);">Your cart is empty. Time to find some cute things!</p>';
      } else {
        cartItemsContainer.innerHTML = '';
        cart.forEach((item, index) => {
          total += item.price * item.qty;
          count += item.qty;
          
          cartItemsContainer.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--pink-light); padding-bottom: 8px;">
              <div style="display: flex; gap: 12px; align-items: center;">
                <div style="font-size: 24px; background: var(--pink-light); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">${item.img}</div>
                <div>
                  <div style="font-weight: 700; font-size: var(--fs-sm); color: var(--text-dark);">${item.name}</div>
                  <div style="color: var(--text-mid); font-size: var(--fs-xs);">$${item.price.toFixed(2)} x ${item.qty}</div>
                </div>
              </div>
              <button onclick="removeFromCart(${index})" style="background: none; border: none; color: var(--pink-deep); font-size: 24px; cursor: pointer;">&times;</button>
            </div>
          `;
        });
      }
    } else {
      // If the container isn't on the page, still calculate the count for the badge
      cart.forEach(item => count += item.qty);
    }

    if (cartTotalEl) cartTotalEl.innerText = `Total: $${total.toFixed(2)}`;
    if (cartBadge) {
      cartBadge.innerText = count;
      cartBadge.style.animation = 'none';
      setTimeout(() => cartBadge.style.animation = 'heartBeat 0.5s ease', 10);
    }
  }

  // Remove individual item
  window.removeFromCart = function(index) {
    cart.splice(index, 1);
    localStorage.setItem('cartItems', JSON.stringify(cart));
    renderCart();
  };

  // Clear entire cart
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      cart = [];
      localStorage.setItem('cartItems', JSON.stringify(cart));
      renderCart();
    });
  }

  // Open/Close Sidebar
  if (cartBtn && cartSidebar) {
    cartBtn.addEventListener('click', () => cartSidebar.classList.add('open'));
    closeCartBtn.addEventListener('click', () => cartSidebar.classList.remove('open'));
  }

  // Add to Cart Logic
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    // Clone and replace the button to wipe out any old phantom event listeners
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = e.target.closest('.card');
      if (!card) return;

      const name = card.querySelector('h3').innerText;
      const priceText = card.querySelector('.price-tag').innerText;
      const price = parseFloat(priceText.replace('$', ''));
      const img = card.querySelector('.product-img').innerHTML;

      const existingItem = cart.find(item => item.name === name);
      if (existingItem) {
        existingItem.qty += 1;
      } else {
        cart.push({ name, price, img, qty: 1 });
      }

      localStorage.setItem('cartItems', JSON.stringify(cart));
      renderCart();
      if (cartSidebar) cartSidebar.classList.add('open');
    });
  });

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