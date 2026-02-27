/* ============================================================
   AB PAVING & LANDSCAPING — MAIN JAVASCRIPT
   main.js — shared across all pages
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── MOBILE MENU ──────────────────────────────────────
  const hamburger  = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  function closeMobileMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger && mobileMenu) {
    if (!mobileMenu.id) mobileMenu.id = 'mobile-navigation';
    hamburger.setAttribute('aria-controls', mobileMenu.id);
    hamburger.setAttribute('aria-expanded', 'false');

    hamburger.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      // BUG FIX: lock body scroll when mobile menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMobileMenu);
    });

    // BUG FIX: close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });

    // BUG FIX: close when clicking outside menu
    document.addEventListener('click', function (e) {
      if (
        mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMobileMenu();
      }
    });
  }

  // ── SMOOTH SCROLL ────────────────────────────────────
  // BUG FIX: offset scroll position so sticky nav doesn't cover the target
  const NAV_HEIGHT = 74;
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const href = a.getAttribute('href');
      if (href === '#') return; // skip bare # links (Services dropdown trigger)
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
        window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
  });

  // ── ACTIVE NAV HIGHLIGHT (scroll spy) ────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
  const sectionNavLinks = Array.from(navLinks).filter(function (a) {
    const href = a.getAttribute('href') || '';
    return href.startsWith('#') && href !== '#';
  });

  if (sections.length && sectionNavLinks.length) {
    function updateActiveNav() {
      let current = '';
      sections.forEach(function (s) {
        if (window.scrollY >= s.offsetTop - NAV_HEIGHT - 20) current = s.id;
      });
      sectionNavLinks.forEach(function (a) {
        a.classList.remove('active');
        if (a.getAttribute('href') === '#' + current) a.classList.add('active');
      });
    }
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
  }

  // ── QUOTE FORM SUBMIT ─────────────────────────────────
  // BUG FIX: original code intercepted the click but never actually submitted
  // the form to Formspree. Now we use fetch on the form submit event.
  const quoteForm = document.querySelector('.qf-form form');
  const formBtn   = document.querySelector('.form-submit');

  if (quoteForm && formBtn) {
    quoteForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Validate required fields
      const requiredInputs = quoteForm.querySelectorAll('input[required], select[required]');
      let valid = true;
      requiredInputs.forEach(function (inp) {
        if (!inp.value.trim()) {
          inp.style.borderColor = '#e53e3e';
          valid = false;
        } else {
          inp.style.borderColor = '';
        }
      });
      if (!valid) return;

      formBtn.textContent = 'Sending\u2026';
      formBtn.disabled = true;

      try {
        const response = await fetch(quoteForm.action, {
          method: 'POST',
          body: new FormData(quoteForm),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          formBtn.textContent = '\u2713 Request Sent! We\'ll be in touch within 24 hours.';
          formBtn.classList.add('sent');
          quoteForm.reset();
        } else {
          formBtn.textContent = 'Send My Free Quote Request \u2192';
          formBtn.disabled = false;
          alert('Something went wrong \u2014 please call us on 07492 263394 or try again.');
        }
      } catch (err) {
        formBtn.textContent = 'Send My Free Quote Request \u2192';
        formBtn.disabled = false;
        alert('Network error \u2014 please call us on 07492 263394 or try again.');
      }
    });

    // Clear red border as user corrects input
    quoteForm.querySelectorAll('input, select, textarea').forEach(function (inp) {
      inp.addEventListener('input', function () { inp.style.borderColor = ''; });
    });
  }

  // ── GALLERY LIGHTBOX (gallery.html) ──────────────────
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lb-img');

  if (lightbox && lbImg) {
    let allGalImgs = [];
    let currentIdx = 0;

    function collectImages() {
      allGalImgs = [];
      document.querySelectorAll('.gal-section:not([style*="display: none"]) .m-item img').forEach(function (img) {
        allGalImgs.push({ src: img.src, alt: img.alt || '' });
      });
    }

    collectImages();

    document.querySelectorAll('.m-item').forEach(function (item) {
      item.addEventListener('click', function () {
        collectImages();
        const src = item.querySelector('img').src;
        currentIdx = allGalImgs.findIndex(function (img) { return img.src === src; });
        if (currentIdx === -1) currentIdx = 0;
        lbImg.src = allGalImgs[currentIdx].src;
        lbImg.alt = allGalImgs[currentIdx].alt;
        lightbox.classList.add('open');
        lightbox.removeAttribute('aria-hidden');
        document.body.style.overflow = 'hidden';
        document.getElementById('lb-close').focus();
      });
    });

    function closeLb() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.getElementById('lb-close').addEventListener('click', closeLb);

    function changeLb(dir) {
      currentIdx = (currentIdx + dir + allGalImgs.length) % allGalImgs.length;
      lbImg.src = allGalImgs[currentIdx].src;
      lbImg.alt = allGalImgs[currentIdx].alt;
    }

    document.getElementById('lb-prev').addEventListener('click', function () { changeLb(-1); });
    document.getElementById('lb-next').addEventListener('click', function () { changeLb(1); });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape')     closeLb();
      if (e.key === 'ArrowLeft')  changeLb(-1);
      if (e.key === 'ArrowRight') changeLb(1);
    });

    // Gallery filter buttons
    document.querySelectorAll('.fbtn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.fbtn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        document.querySelectorAll('.gal-section').forEach(function (s) {
          s.style.display = (cat === 'all' || s.dataset.cat === cat) ? 'block' : 'none';
        });
        collectImages();
      });
    });
  }

  // ── STICKY NAV SHADOW ON SCROLL ───────────────────────
  const nav = document.querySelector('.main-nav');
  if (nav) {
    function updateNavShadow() {
      nav.style.boxShadow = window.scrollY > 10
        ? '0 2px 20px rgba(0,0,0,.18)'
        : '0 2px 16px rgba(0,0,0,.1)';
    }
    window.addEventListener('scroll', updateNavShadow, { passive: true });
  }

  // ── SCROLL REVEAL ─────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { observer.observe(el); });
  }

  // ── AUTO-UPDATE COPYRIGHT YEAR ─────────────────────────
  document.querySelectorAll('.footer-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

});
