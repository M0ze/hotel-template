/**
 * Joyce Hotel Mubende — main UI script
 *
 * - Navbar toggle (mobile)
 * - Smooth scroll offset for anchored links
 * - Scroll reveal via IntersectionObserver
 * - Animated counters for hero stats (as positioned)
 * - Scroll spy for nav link highlighting
 * - Reservation form handler (real fetch + validation + real states)
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
  const sectionIds = ['hero', 'rooms', 'dining', 'wellness', 'about', 'contact'];
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
  const revealEls = document.querySelectorAll('.room, .dining-card, .wf, .about__text, .contact__info, .footer__col');

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

  /* ---------- 5. Animated counters in hero (run only near top) ---------- */
  function animateCounters() {
    const stats = document.querySelectorAll('.stat__num');
    const duration = 1600;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
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

  /* ---------- 6. Reservation form handler ---------- */
  const reserveForm = document.getElementById('reserveForm');
  const formSuccess = document.querySelector('.form__status--success');
  const formError = document.querySelector('.form__status--error');
  const formErrors = document.getElementById('formErrors');
  const formReference = document.getElementById('formReference');

  // Point this at your booking API / backend route.
  // In production this should be an HTTPS URL such as:
  //   'https://api.joycehotel.mu/api/v1/reservations'
  // For a local/demo build you can leave it unset and the site will
  // surface a clear usability message rather than a silent failure.
  const API_ENDPOINT = 'https://api.joycehotel.mu/api/v1/reservations';

  if (reserveForm) {
    reserveForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Clear previous states
      formSuccess.style.display = 'none';
      formError.style.display = 'none';
      formErrors.innerHTML = '';
      reserveForm.classList.remove('is-submitting');

      // Client-side validation
      const name = reserveForm.name.value.trim();
      const email = reserveForm.email.value.trim();
      const checkin = reserveForm.checkin.value;
      const checkout = reserveForm.checkout.value;
      const errors = [];

      if (!name) errors.push('Full name is required.');
      if (!email) errors.push('Email address is required.');
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Please enter a valid email address.');
      if (!checkin) errors.push('Check-in date is required.');
      if (!checkout) errors.push('Check-out date is required.');
      else if (checkout <= checkin) errors.push('Check-out date must be after check-in.');

      if (errors.length) {
        formErrors.innerHTML = errors.map(function (err) { return '<li>' + escapeHtml(err) + '</li>'; }).join('');
        formError.style.display = 'block';
        reserveForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Show submitting state
      reserveForm.classList.add('is-submitting');
      reserveForm.querySelector('button[type="submit"]').textContent = 'Sending...';

      try {
        const payload = {
          name: name,
          email: email,
          checkin: checkin,
          checkout: checkout,
          room: reserveForm.room.value,
          source: 'web form'
        };

        const res = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include'
        });

        if (!res.ok) throw new Error('Server responded with status ' + res.status);

        const data = await res.json().catch(function () { return {}; });
        const ref = data.reference || data.id || generateRef();

        formReference.textContent = ref;
        formSuccess.style.display = 'block';
        reserveForm.reset();
      } catch (err) {
        console.error('Reservation submit failed:', err);
        formErrors.innerHTML = '<li>Could not send your reservation. Please check your connection and try again.</li>';
        formError.style.display = 'block';
      } finally {
        reserveForm.classList.remove('is-submitting');
        reserveForm.querySelector('button[type="submit"]').textContent = 'Request Reservation';
      }
    });
  }

  /* ---------- Utilities ---------- */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function generateRef() {
    const d = new Date();
    const year = d.getFullYear();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return year + '-' + rand + '-' + (Math.floor(Math.random() * 9000) + 1000).toString();
  }

  console.log('✨ Joyce Hotel Mubende UI ready.');
})();
