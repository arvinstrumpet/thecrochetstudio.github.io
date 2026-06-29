/* ==========================================================================
   Smooth Scroll to Top on Refresh
   ========================================================================== */
// 1. Tell the browser to stop auto-snapping to the previous scroll position
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// 2. Wait until the page fully loads, then smoothly slide to the top
window.addEventListener('load', () => {
  // A tiny 100ms delay ensures the browser has painted the page 
  // before starting the animation, making the slide actually visible!
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

  // Cart Sidebar Toggle & Logic
  const cartBtn = document.querySelector('.floating-cart-btn');
  const cartSidebar = document.querySelector('.cart-sidebar');
  const closeCartBtn = document.querySelector('.close-cart');
  const cartBadge = document.querySelector('.cart-badge');
  let cartCount = parseInt(localStorage.getItem('cartCount')) || 0;
  
  if(cartBadge) cartBadge.innerText = cartCount;

  if (cartBtn && cartSidebar) {
    cartBtn.addEventListener('click', () => cartSidebar.classList.add('open'));
    closeCartBtn.addEventListener('click', () => cartSidebar.classList.remove('open'));
  }

  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      cartCount++;
      localStorage.setItem('cartCount', cartCount);
      if(cartBadge) {
        cartBadge.innerText = cartCount;
        cartBadge.style.animation = 'heartBeat 0.5s ease';
        setTimeout(() => cartBadge.style.animation = '', 500);
      }
    });
  });

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