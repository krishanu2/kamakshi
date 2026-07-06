const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Footer year
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// ---- Scroll progress bar ----
const progressBar = document.querySelector('[data-scroll-progress]');
function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (progressBar) progressBar.style.width = `${pct}%`;
}

// ---- Topbar scrolled state + back-to-top visibility (shared scroll listener) ----
const topbar = document.querySelector('[data-topbar]');
const backToTop = document.querySelector('[data-back-to-top]');
const stickyCtaEl = document.querySelector('[data-sticky-cta]');

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateScrollProgress();
    if (topbar) topbar.classList.toggle('is-scrolled', window.scrollY > 10);
    if (backToTop) backToTop.hidden = window.scrollY < 600;
    if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY >= 600);
    ticking = false;
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

// ---- Mobile menu ----
const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');
if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ---- FAQ accordion (smooth) ----
document.querySelectorAll('.faq__trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const item = trigger.closest('.faq__item');
    const expanded = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', String(!expanded));
    item.classList.toggle('is-open', !expanded);
  });
});

// ---- Sticky mobile CTA show/hide ----
if (stickyCtaEl) {
  const hero = document.querySelector('.hero');
  const finalCta = document.querySelector('.final-cta');
  const heroObserver = new IntersectionObserver(
    ([entry]) => stickyCtaEl.classList.toggle('is-visible', !entry.isIntersecting),
    { threshold: 0 }
  );
  if (hero) heroObserver.observe(hero);

  const finalCtaObserver = new IntersectionObserver(
    ([entry]) => stickyCtaEl.classList.toggle('is-hidden', entry.isIntersecting),
    { threshold: 0.2 }
  );
  if (finalCta) finalCtaObserver.observe(finalCta);
}

// ---- Scroll reveal ----
const revealEls = document.querySelectorAll('.reveal');
if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach((el) => el.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
}

// ---- Count-up stats ----
document.querySelectorAll('[data-count-target]').forEach((el) => {
  const target = parseInt(el.dataset.countTarget, 10);
  if (prefersReducedMotion) {
    el.textContent = target;
    return;
  }
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const duration = 1200;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  countObserver.observe(el);
});

// ---- Hero parallax (desktop, pointer-fine only) ----
const parallaxEl = document.querySelector('[data-parallax]');
if (parallaxEl && !prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  const hero = document.querySelector('.hero');
  hero?.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    parallaxEl.style.transform = `translate(${x * -12}px, ${y * -12}px)`;
  });
  hero?.addEventListener('mouseleave', () => {
    parallaxEl.style.transform = 'translate(0, 0)';
  });
}

// ---- Testimonials carousel dots ----
(function initCarousel() {
  const track = document.querySelector('[data-carousel-track]');
  const dotsWrap = document.querySelector('[data-carousel-dots]');
  if (!track || !dotsWrap) return;

  const cards = Array.from(track.children);
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => {
      cards[i].scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', inline: 'start', block: 'nearest' });
    });
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = cards.indexOf(entry.target);
          dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
        }
      });
    },
    { root: track, threshold: 0.6 }
  );
  cards.forEach((c) => cardObserver.observe(c));
})();

// ---- Quiz ----
(function initQuiz() {
  const quizForm = document.querySelector('[data-quiz-form]');
  if (!quizForm) return;

  const questions = Array.from(document.querySelectorAll('.quiz__question'));
  const progressBarEl = document.querySelector('[data-quiz-progress]');
  const nextBtn = document.querySelector('[data-quiz-next]');
  const backBtn = document.querySelector('[data-quiz-back]');
  const resultEl = document.querySelector('[data-quiz-result]');
  const resultTitle = document.querySelector('[data-result-title]');
  const resultBody = document.querySelector('[data-result-body]');
  const emailForm = document.querySelector('[data-quiz-email-form]');
  const quizCta = document.querySelector('[data-quiz-cta]');

  const results = {
    betrayal: {
      title: 'Hypervigilance after a broken trust.',
      body: 'The work here is rebuilding a felt sense of safety in your nervous system — not just "deciding" to trust again.',
    },
    silent: {
      title: 'The freeze-and-withdraw loop.',
      body: 'We work on interrupting the shutdown response before it becomes the whole conversation.',
    },
    conflict: {
      title: 'The same fight, on repeat.',
      body: 'We rewire the trigger-response loop so the third fight this week doesn’t have to happen.',
    },
    disconnect: {
      title: 'Quiet emotional checkout.',
      body: 'We reconnect you to the feeling you’ve been managing around, not just naming it.',
    },
  };

  let current = 0;

  // Highlight the selected option within each question
  questions.forEach((q) => {
    q.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.addEventListener('change', () => {
        q.querySelectorAll('label').forEach((label) => label.classList.remove('is-selected'));
        input.closest('label').classList.add('is-selected');
      });
    });
  });

  function showQuestion(index, direction = 'forward') {
    const active = questions[index];
    questions.forEach((q, i) => { if (i !== index) q.hidden = true; });

    if (prefersReducedMotion) {
      active.hidden = false;
    } else {
      active.classList.add('is-leaving');
      active.hidden = false;
      requestAnimationFrame(() => active.classList.remove('is-leaving'));
    }

    progressBarEl.style.width = `${((index + 1) / questions.length) * 100}%`;
    backBtn.hidden = index === 0;
    nextBtn.textContent = index === questions.length - 1 ? 'See my result' : 'Next';
  }

  function currentAnswered() {
    const q = questions[current];
    return q.querySelector('input[type="radio"]:checked') !== null;
  }

  function tally() {
    const counts = { betrayal: 0, silent: 0, conflict: 0, disconnect: 0 };
    questions.forEach((q) => {
      const checked = q.querySelector('input[type="radio"]:checked');
      if (checked) counts[checked.value] += 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  function showResult() {
    const key = tally();
    const result = results[key];
    resultTitle.textContent = result.title;
    resultBody.textContent = result.body;
    quizForm.hidden = true;
    resultEl.hidden = false;
    try {
      localStorage.setItem('quizResult', key);
    } catch (e) {
      /* localStorage unavailable — non-critical */
    }
  }

  nextBtn.addEventListener('click', () => {
    if (!currentAnswered()) {
      questions[current].reportValidity?.();
      return;
    }
    if (current === questions.length - 1) {
      showResult();
      return;
    }
    current += 1;
    showQuestion(current);
  });

  backBtn.addEventListener('click', () => {
    if (current === 0) return;
    current -= 1;
    showQuestion(current, 'back');
  });

  showQuestion(current);

  if (emailForm) {
    emailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailForm.querySelector('input[type="email"]').value;
      try {
        localStorage.setItem('quizEmail', email);
      } catch (err) {
        /* localStorage unavailable — non-critical */
      }
      // TODO: wire to real email capture backend (Google Form / Mailchimp / etc.)
      emailForm.hidden = true;
      quizCta.hidden = false;
    });
  }
})();
