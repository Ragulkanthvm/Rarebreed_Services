// ===== RAREBREED shared behavior =====

document.addEventListener('DOMContentLoaded', () => {

  /* ── Custom Cursor ── */
  const cursor = document.getElementById('custom-cursor');
  if (cursor) {
    const cursorStoreKey = 'rb_cursor_pos';
    const savedPos = sessionStorage.getItem(cursorStoreKey);
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let tx = cx, ty = cy;
    let rafId;

    if (savedPos) {
      try {
        const parsed = JSON.parse(savedPos);
        cx = parsed.x || cx;
        cy = parsed.y || cy;
        tx = cx;
        ty = cy;
      } catch (e) {
        sessionStorage.removeItem(cursorStoreKey);
      }
    }

    document.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
    });

    const persistCursor = (x, y) => {
      sessionStorage.setItem(cursorStoreKey, JSON.stringify({ x, y }));
    };

    const moveCursor = () => {
      // Smooth lag-follow: lerp towards target
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.left = cx + 'px';
      cursor.style.top  = cy + 'px';
      rafId = requestAnimationFrame(moveCursor);
    };
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
    cursor.style.opacity = '1';
    rafId = requestAnimationFrame(moveCursor);

    // Hover state on interactive elements
    const hoverEls = document.querySelectorAll('a, button, [data-open-popup], input, textarea, select, label, .tilt, .filter-btn, .acc-q');
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });

    // Click state
    document.addEventListener('mousedown', (e) => {
      persistCursor(e.clientX, e.clientY);
      cursor.classList.add('clicking'); cursor.classList.remove('hovering');
    });
    document.addEventListener('mouseup',   () => { cursor.classList.remove('clicking'); });
    document.addEventListener('click', (e) => {
      persistCursor(e.clientX, e.clientY);
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
  }

  /* Loader */
  const loader = document.getElementById('loader');
  if (loader){
    loader.remove();
  }

  /* Sticky nav */
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 12) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* Mobile menu */
  const burger = document.querySelector('.nav-burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-close');
  if (burger && mobileMenu){
    burger.addEventListener('click', () => mobileMenu.classList.add('open'));
    mobileClose && mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));
  }

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12 });
  revealEls.forEach(el => io.observe(el));

  /* Animated counters */
  const counters = document.querySelectorAll('[data-count]');
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.getAttribute('data-count'));
      const suffix = el.getAttribute('data-suffix') || '';
      const dur = 1400;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.floor(target * eased);
        el.textContent = val + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: .5 });
  counters.forEach(el => counterIO.observe(el));

  /* Tilt cards */
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(800px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* FAQ accordion */
  document.querySelectorAll('.acc-item').forEach(item => {
    const q = item.querySelector('.acc-q');
    q && q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.acc-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* Portfolio filter */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portItems = document.querySelectorAll('.portfolio-item');
  if (filterBtns.length){
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.getAttribute('data-filter');
        portItems.forEach(item => {
          const cats = item.getAttribute('data-cat') || '';
          const match = f === 'all' || cats.includes(f);
          item.classList.toggle('show', match);
        });
      });
    });
  }

  /* Consultation popup */
  const popup = document.getElementById('consult-popup');
  const openers = document.querySelectorAll('[data-open-popup]');
  const closer = document.querySelector('.popup-close');
  openers.forEach(o => o.addEventListener('click', (e) => { e.preventDefault(); popup && popup.classList.add('open'); }));
  closer && closer.addEventListener('click', () => popup.classList.remove('open'));
  popup && popup.addEventListener('click', (e) => { if (e.target === popup) popup.classList.remove('open'); });

  setTimeout(() => {
    if (popup && !sessionStorage.getItem('rb_popup_shown')){
      popup.classList.add('open');
      sessionStorage.setItem('rb_popup_shown', '1');
    }
  }, 18000);

  /* Forms: fake success state (no backend) */
  document.querySelectorAll('form[data-fake-submit]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      const original = btn.innerHTML;
      btn.innerHTML = 'Sending…';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = 'Sent — we\'ll be in touch ✓';
        setTimeout(() => {
          btn.innerHTML = original;
          btn.disabled = false;
          form.reset();
          if (popup) popup.classList.remove('open');
        }, 2600);
      }, 900);
    });
  });

  /* Project cost estimator */
  const estForm = document.getElementById('estimator');
  if (estForm){
    const out = document.getElementById('estimator-output');
    const calc = () => {
      const service = estForm.service.value;
      const scope = estForm.scope.value;
      const base = { website:35000, ecommerce:65000, software:150000, mobile:120000, ai:90000 }[service] || 35000;
      const mult = { basic:1, standard:1.8, premium:3 }[scope] || 1;
      const low = Math.round(base*mult);
      const high = Math.round(base*mult*1.6);
      out.innerHTML = `₹${low.toLocaleString('en-IN')} – ₹${high.toLocaleString('en-IN')} <span class="muted" style="font-family:'JetBrains Mono';font-size:12px;display:block;margin-top:6px;">Estimated range · final quote after discovery call</span>`;
    };
    estForm.addEventListener('input', calc);
    calc();
  }

  /* Current year */
  document.querySelectorAll('.cur-year').forEach(el => el.textContent = new Date().getFullYear());

  /* ── Hero Particle System (homepage only) ── */
  const particleContainer = document.getElementById('hero-particles');
  if (particleContainer) {
    const colors = ['#00D4FF', '#00A7D8', '#14B8A6', '#7dd3fc'];
    const count = 28;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'hero-particle';
      const size = Math.random() * 4 + 1.5;
      p.style.cssText = [
        `width:${size}px`,
        `height:${size}px`,
        `left:${Math.random() * 100}%`,
        `bottom:${Math.random() * -20}%`,
        `background:${colors[Math.floor(Math.random() * colors.length)]}`,
        `animation-duration:${6 + Math.random() * 12}s`,
        `animation-delay:${Math.random() * 10}s`,
        `border-radius:${Math.random() > 0.4 ? '50%' : '3px'}`,
        `box-shadow:0 0 ${size * 3}px ${colors[Math.floor(Math.random() * colors.length)]}`,
      ].join(';');
      particleContainer.appendChild(p);
    }

    // Shooting star streaks
    const starColors = ['#00D4FF', '#14B8A6'];
    for (let i = 0; i < 6; i++) {
      const s = document.createElement('div');
      s.className = 'hero-star';
      const w = 60 + Math.random() * 140;
      s.style.cssText = [
        `width:${w}px`,
        `top:${10 + Math.random() * 80}%`,
        `left:${Math.random() * 80}%`,
        `background:linear-gradient(90deg,transparent,${starColors[i % 2]},transparent)`,
        `animation-duration:${3 + Math.random() * 5}s`,
        `animation-delay:${Math.random() * 8}s`,
      ].join(';');
      particleContainer.appendChild(s);
    }
  }

  const heroGrid = document.querySelector('.hero-grid-mesh');
  if (heroGrid) {
    const heroSection = heroGrid.closest('.page-hero') || document.body;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    heroSection.addEventListener('mousemove', (event) => {
      const rect = heroSection.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      const moveX = clamp(x * 14, -14, 14);
      const moveY = clamp(y * 14, -14, 14);
      heroGrid.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
    heroSection.addEventListener('mouseleave', () => {
      heroGrid.style.transform = 'translate3d(0, 0, 0)';
    });
  }
});


