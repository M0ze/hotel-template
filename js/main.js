/**
 * Nova Stay — main UI script
 *
 * - Navbar toggle (mobile)
 * - Scroll reveal / scroll spy
 * - Animated counters for hero stats
 * - Smooth scroll offset for anchored links
 * - Button cursor
 * - Simple nav link highlighting as you scroll
 */

(function () {
  'use strict';

  /* ---------- 1. Navbar toggle (mobile) ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('open');
      navToggle.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('open');
        navToggle.classList.remove('active');
      });
    });
  }

  /* ---------- 2. Active nav link (scroll spy) ---------- */
  const sectionIds = ['hero', 'rooms', 'experiences', 'about', 'contact'];
  const navLinks = document.querySelectorAll('.nav__link');

  function updateSpy() {
    const scrollPos = window.scrollY + 100;
    let current = 'hero';

    sectionIds.forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.offsetTop <= scrollPos) {
        current = id;
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateSpy, { passive: true });
  updateSpy();

  /* ---------- 3. Scrolling offset for anchored links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = anchor.getAttribute('href');
      if (href === '#' || href === '#0') return;
      const target = document.querySelector(href);
      if (!target) return;

      const offset = 70;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      e.preventDefault();
    });
  });

  /* ---------- 4. Scroll reveal with IntersectionObserver ---------- */
  const revealEls = document.querySelectorAll(
    '.room, .exp, .about__text, .contact__info, .footer__col'
  );

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---------- 5. Animated counters in hero ---------- */
  function animateCounters() {
    const stats = document.querySelectorAll('.stat__num');
    const duration = 1600;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      stats.forEach(function (el) {
        const target = parseFloat(el.dataset.target);
        const current = target * ease;
        el.textContent = Math.ceil(current).toLocaleString();
      });
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // Only run counter animation when hero is near top
  function maybeAnimateCounters() {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const offset = hero.getBoundingClientRect().top + window.scrollY;
    if (window.scrollY < offset + 120) {
      animateCounters();
    }
  }

  window.addEventListener('scroll', maybeAnimateCounters, { passive: true });
  maybeAnimateCounters();

  /* ---------- 6. Fix window focus when clicking social links (if any) ---------- */
  // (no-op here, but harmless)

  /* ---------- 7. Form — prevent default + console log (demo) ---------- */
  const reserveForm = document.getElementById('reserveForm');
  if (reserveForm) {
    reserveForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const data = new FormData(reserveForm);
      // In production, POST to your backend here.
      console.log('Reservation submitted:', Object.fromEntries(data));
      alert('Thanks! Your reservation request has been sent. We\'ll get back to you soon.');
      reserveForm.reset();
    });
  }

  console.log('✨ Nova Stay UI ready.');
})();
