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
  const checkoutBtn = document.querySelector('.checkout-btn');
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

  // Checkout logic
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert("Your cart is empty! Add some cute things first 🧶");
        return;
      }
      
      // Show success message
      alert("Thanks for your order! We'll be in touch 💝");
      
      // Empty the array, save to local storage, and redraw the cart
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

// ==========================================================================
  // Contact Form Logic (with Formspree)
  // ==========================================================================
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Stop the page from reloading
      
      let valid = true;
      const inputs = contactForm.querySelectorAll('input, select, textarea');
      const submitBtn = contactForm.querySelector('button');
      const originalBtnText = submitBtn.innerText;

      // Custom shake animation for empty fields
      inputs.forEach(input => {
        if (!input.value.trim()) {
          valid = false;
          input.classList.add('error-shake');
          setTimeout(() => input.classList.remove('error-shake'), 400);
        }
      });

      if (valid) {
        // Change button text to show it's working
        submitBtn.innerText = "Sending... ✉️";
        
        // Package the form data
        const formData = new FormData(contactForm);

        try {
          // ⚠️ PASTE YOUR FORMSPREE URL RIGHT HERE ⚠️
          const response = await fetch("https://formspree.io/f/mlgywdyg", {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            // Success! Replace the form with the cute thank you message
            contactForm.innerHTML = `
              <div style="text-align: center; padding: 40px;">
                <h2 class="pacifico" style="color: var(--pink-deep); margin-bottom:16px;">Message sent! 💝</h2>
                <p>We'll get back to you within 1–2 business days. Thank you for reaching out!</p>
              </div>
            `;
          } else {
            // If Formspree rejects it (e.g. invalid email format)
            alert("Oops! There was a problem sending your message. Please check your info and try again.");
            submitBtn.innerText = originalBtnText;
          }
        } catch (error) {
          // If the internet connection fails
          alert("Oops! There was a network error. Please try again.");
          submitBtn.innerText = originalBtnText;
        }
      }
    });
  }
});

// ==========================================================================
  // Dynamic Product Pages & Routing (Upgraded for Photos & Carousels)
  // ==========================================================================
  
  // 1. Make all product cards clickable
  document.querySelectorAll('.card').forEach(card => {
    if (!card.querySelector('.product-img')) return;

    card.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

      const name = card.querySelector('h3').innerText;
      const price = card.querySelector('.price-tag').innerText;
      const desc = card.querySelector('p').innerText;
      
      // Grab the image tag for the cart
      const cartImgHTML = card.querySelector('.product-img').innerHTML;
      
      // Check for multiple images, otherwise fallback to the cover image
      const imagesAttr = card.getAttribute('data-images');
      let imageArray = [];
      if (imagesAttr) {
        imageArray = imagesAttr.split(','); // Splits the string into a list of URLs
      } else {
        // Fallback if you haven't added data-images to a card yet
        const imgTag = card.querySelector('img');
        imageArray = imgTag ? [imgTag.src] : [cartImgHTML];
      }

      const productData = { name, price, desc, cartImg: cartImgHTML, images: imageArray };
      localStorage.setItem('currentProductView', JSON.stringify(productData));

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      window.location.href = `product.html?item=${slug}`;
    });
  });

  // Global function for the arrow button
  window.scrollCarousel = function() {
    const track = document.getElementById('carousel-track');
    // Finds the width of one image, plus the 16px gap, and scrolls exactly that far
    const slideWidth = track.querySelector('.carousel-slide').clientWidth;
    track.scrollBy({ left: slideWidth + 16, behavior: 'smooth' });
  };

  // 2. Render the template page
  const productDetailContainer = document.getElementById('product-detail-container');
  if (productDetailContainer) {
    const productData = JSON.parse(localStorage.getItem('currentProductView'));

    if (productData) {
      document.title = `${productData.name} | The Crochet Studio`;

      // Build the image slides HTML
      let carouselHTML = '';
      const hasMultipleImages = productData.images.length > 1;

      // Map through the array of images and create an <img> tag for each
      const slides = productData.images.map(src => {
        // Ensures if it's an old emoji it still renders, otherwise makes it an image
        return src.includes('<') ? 
          `<div class="carousel-slide" style="display:flex; justify-content:center; align-items:center; font-size:180px; background:var(--pink-light); flex: 0 0 100%;">${src}</div>` : 
          `<img src="${src}" class="carousel-slide" ${!hasMultipleImages ? 'style="flex: 0 0 100%;"' : ''}>`;
      }).join('');

      // Add the arrow button ONLY if there are multiple images
      const arrowBtn = hasMultipleImages ? `<button class="carousel-next-btn" onclick="scrollCarousel()">➔</button>` : '';

      carouselHTML = `
        <div class="product-carousel">
          <div class="carousel-track" id="carousel-track">
            ${slides}
          </div>
          ${arrowBtn}
        </div>
      `;

      // Inject the dynamic HTML
      productDetailContainer.innerHTML = `
        ${carouselHTML}
        <div style="display: flex; flex-direction: column; justify-content: center; padding: 24px 0;">
          <h1 class="pacifico" style="font-size: var(--fs-3xl); color: var(--text-dark); margin-bottom: 16px;">${productData.name}</h1>
          <span class="price-tag" style="font-size: var(--fs-xl); padding: 8px 24px; display: inline-block; width: fit-content; margin-bottom: 24px;">${productData.price}</span>
          <p style="font-size: var(--fs-lg); color: var(--text-mid); margin-bottom: 32px;">
            ${productData.desc}. Every piece is lovingly handcrafted stitch by stitch, made with the softest eco-conscious yarns to bring a little extra warmth and joy into your world.
          </p>
          <ul style="color: var(--text-mid); margin-bottom: 32px; font-size: var(--fs-md); line-height: 2;">
            <li>✨ 100% Handmade</li>
            <li>🧶 Premium hypoallergenic yarn</li>
            <li>💝 Ready to gift</li>
          </ul>
          <div style="display: flex; gap: 16px;">
            <button class="btn btn-primary add-to-cart-detail" style="flex: 1; font-size: var(--fs-lg); padding: 16px;">Add to Cart 🛒</button>
          </div>
        </div>
      `;

      productDetailContainer.querySelector('.add-to-cart-detail').addEventListener('click', () => {
        const priceVal = parseFloat(productData.price.replace('$', ''));
        const existingItem = cart.find(item => item.name === productData.name);
        
        if (existingItem) existingItem.qty += 1;
        // Uses the cartImg HTML we scraped so the real photo shows up in the cart sidebar!
        else cart.push({ name: productData.name, price: priceVal, img: productData.cartImg, qty: 1 });
        
        localStorage.setItem('cartItems', JSON.stringify(cart));
        renderCart(); 
        const cartSidebar = document.querySelector('.cart-sidebar');
        if (cartSidebar) cartSidebar.classList.add('open');
      });
      
    } else {
      productDetailContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 80px 0;">
          <h2 class="pacifico" style="font-size: var(--fs-2xl); color: var(--pink-deep);">Oops! Product not found.</h2>
          <a href="products.html" class="btn btn-primary">Back to Shop</a>
        </div>
      `;
    }
  }