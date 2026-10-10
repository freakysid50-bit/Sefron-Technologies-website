/**
 * ==========================================================================
 * SEFRON TECHNOLOGIES - Interactive Horizontal Carousels
 * Team Showcase & Featured Projects
 * ==========================================================================
 * 
 * Features:
 * - Single horizontal row of items with smooth left-to-right navigation.
 * - Editable Team Member dataset (Name, Role, Image, Description, Socials).
 * - Vertical mouse-wheel conversion to horizontal scrolling over carousel sections.
 * - Natural trackpad horizontal gestures and momentum.
 * - Desktop click-and-drag with Pointer Events & threshold guard against accidental clicks.
 * - Native mobile touch swipe gestures with CSS scroll snapping.
 * - Boundary detection that smoothly allows vertical page scroll when at beginning/end.
 * - Navigation arrows with disabled states, progress bar, and pagination dots.
 * - Fully accessible with keyboard navigation and ARIA attributes.
 */

// --------------------------------------------------------------------------
// 1. EDITABLE TEAM MEMBER DATA
// --------------------------------------------------------------------------
const TEAM_MEMBERS = [
  {
    name: "Mohamed Siddiq.M",
    role: "Chief Executive Officer & Founder",
    badge: "CEO & Founder",
    badgeClass: "badge-ceo",
    image: "/assets/team/mohamed_siddiq.jpg",
    photoClass: "photo-siddiq",
    description: "Visionary entrepreneur steering Sefron's technology roadmap, enterprise B2B client partnerships, and AI innovations.",
    linkedin: "https://www.linkedin.com/in/mohamed-siddiq-m-520848385",
    instagram: "https://www.instagram.com/freak_ysid?stkn=MmtkNWNuajJyazd3"
  },
  {
    name: "Sanjai.M",
    role: "Chief Financial Officer & Co-Founder",
    badge: "CFO & Co-Founder",
    badgeClass: "badge-cfo",
    image: "/assets/team/sanjai_m.jpg",
    photoClass: "photo-sanjai",
    description: "Spearheading financial operations, strategic capitalization, corporate growth strategies, and fiscal management for scale.",
    linkedin: "https://www.linkedin.com/in/sanjai-m-9705a3387?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    instagram: "https://www.instagram.com/iam_sxnjxi.x?utm_source=qr&stkn=enZ3aXhlZjU3MXY1"
  },
  {
    name: "Ahamed Faizal",
    role: "Chief Technical Officer & Co-Founder",
    badge: "CTO & Co-Founder",
    badgeClass: "badge-cto",
    image: "/assets/team/ahamed_faizal.jpg",
    photoClass: "photo-faizal",
    description: "Engineering leader directing enterprise AI architectures, full-stack infrastructure, high-throughput backend systems, and scalable cloud innovations.",
    linkedin: "https://www.linkedin.com/in/ahamed-faizal-a-109624366?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    instagram: "https://www.instagram.com/do_0r._die?stkn=MWNjenpzNnJkNjd1MQ=="
  },
  {
    name: "Rahul.P",
    role: "Chief Product Officer & Co-Founder",
    badge: "CPO & Co-Founder",
    badgeClass: "badge-cpo",
    image: "/assets/team/rahul_p.jpg",
    photoClass: "photo-rahul",
    description: "Leading product roadmap execution, enterprise solution delivery, client tech requirements, and scalable user-centric product engineering.",
    linkedin: "https://www.linkedin.com/in/rahul-p-865705375?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    instagram: "https://www.instagram.com/rahul_nathaniel18?stkn=MWM3cXUxYnhtcXI2Mw=="
  }
];

// --------------------------------------------------------------------------
// 2. REUSABLE HORIZONTAL CAROUSEL CONTROLLER
// --------------------------------------------------------------------------
function setupHorizontalSlider(config) {
  const {
    sectionId,
    trackWrapperId,
    trackId,
    prevBtnId,
    nextBtnId,
    progressBarId,
    dotsContainerId,
    cardSelector
  } = config;

  const section = document.getElementById(sectionId);
  const trackWrapper = document.getElementById(trackWrapperId);
  const track = document.getElementById(trackId);
  const prevBtn = document.getElementById(prevBtnId);
  const nextBtn = document.getElementById(nextBtnId);
  const progressBar = document.getElementById(progressBarId);
  const dotsContainer = document.getElementById(dotsContainerId);

  if (!trackWrapper || !track) return;

  function getScrollStep() {
    const card = track.querySelector(cardSelector || '.team-card, .project-card');
    if (card) {
      const computedGap = parseFloat(window.getComputedStyle(track).gap);
      const gap = !isNaN(computedGap) ? computedGap : 24;
      return card.offsetWidth + gap;
    }
    return 340;
  }

  function scrollToIndex(index) {
    const cards = track.querySelectorAll(cardSelector || '.team-card, .project-card');
    if (cards[index]) {
      const cardLeft = cards[index].offsetLeft - track.offsetLeft;
      trackWrapper.scrollTo({ left: cardLeft, behavior: 'smooth' });
    }
  }

  // Dots click binding
  if (dotsContainer) {
    const dots = dotsContainer.querySelectorAll('.team-dot');
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => scrollToIndex(idx));
    });
  }

  // Smooth Arrow navigation with wrap-around support
  function slideByDirection(direction) {
    const step = getScrollStep();
    const current = trackWrapper.scrollLeft;
    const maxScroll = trackWrapper.scrollWidth - trackWrapper.clientWidth;
    let target = current + (direction * step);

    if (direction > 0 && current >= maxScroll - 16) {
      target = 0; // Smooth loop to beginning
    } else if (direction < 0 && current <= 16) {
      target = maxScroll; // Smooth loop to end
    } else {
      target = Math.max(0, Math.min(maxScroll, target));
    }
    trackWrapper.scrollTo({ left: target, behavior: 'smooth' });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      slideByDirection(-1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      slideByDirection(1);
    });
  }

  // Mouse wheel horizontal conversion without trapping natural vertical page scrolling
  // Trackpad horizontal gestures (swipe left/right) are natively handled with full GPU acceleration by overflow-x: auto.
  // When Shift + Mouse Wheel is scrolled, move horizontally.
  trackWrapper.addEventListener('wheel', (e) => {
    if (e.shiftKey && Math.abs(e.deltaY) > 0) {
      e.preventDefault();
      trackWrapper.scrollBy({ left: e.deltaY, behavior: 'auto' });
    }
  }, { passive: false });

  // Desktop Mouse Drag with Inertial Momentum Glide
  let isPointerDown = false;
  let startX = 0;
  let startScrollLeft = 0;
  let hasDragged = false;
  let dragDistance = 0;
  let activePointerId = null;
  let velocityX = 0;
  let lastMoveX = 0;
  let lastMoveTime = 0;

  trackWrapper.addEventListener('pointerdown', (e) => {
    // 1. Never initiate carousel drag if user touched or clicked an interactive link or button
    if (e.target.closest('a, button, input, textarea, select')) {
      isPointerDown = false;
      hasDragged = false;
      dragDistance = 0;
      velocityX = 0;
      return;
    }

    // 2. Only handle primary mouse clicks; allow touch devices to use native touch-swipe
    if (e.pointerType === 'touch' || e.button !== 0) {
      isPointerDown = false;
      hasDragged = false;
      dragDistance = 0;
      velocityX = 0;
      return;
    }

    isPointerDown = true;
    hasDragged = false;
    dragDistance = 0;
    activePointerId = e.pointerId;
    startX = e.clientX || e.pageX;
    lastMoveX = startX;
    lastMoveTime = performance.now();
    velocityX = 0;
    startScrollLeft = trackWrapper.scrollLeft;
  });

  trackWrapper.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return;
    const currentX = e.clientX || e.pageX;
    const dx = currentX - startX;
    dragDistance = Math.abs(dx);

    const now = performance.now();
    const dt = now - lastMoveTime;
    if (dt > 0 && dt < 120) {
      velocityX = (currentX - lastMoveX) / dt;
    }
    lastMoveX = currentX;
    lastMoveTime = now;

    if (dragDistance > 8) {
      if (!hasDragged) {
        hasDragged = true;
        trackWrapper.classList.add('is-dragging');
        trackWrapper.style.scrollBehavior = 'auto';
        trackWrapper.style.scrollSnapType = 'none';

        if (activePointerId !== null) {
          try {
            trackWrapper.setPointerCapture(activePointerId);
          } catch (err) {}
        }
      }
      trackWrapper.scrollLeft = startScrollLeft - dx;
    }
  });

  function stopDrag(e) {
    if (!isPointerDown) return;
    isPointerDown = false;

    if (hasDragged) {
      trackWrapper.classList.remove('is-dragging');
      trackWrapper.style.scrollBehavior = 'smooth';
      trackWrapper.style.scrollSnapType = 'x proximity';

      // Apply gentle momentum glide if dragged and released with speed
      if (Math.abs(velocityX) > 0.3) {
        const glide = -velocityX * 180;
        trackWrapper.scrollBy({ left: glide, behavior: 'smooth' });
      }

      if (e && e.pointerId) {
        try {
          trackWrapper.releasePointerCapture(e.pointerId);
        } catch (err) {}
      } else if (activePointerId !== null) {
        try {
          trackWrapper.releasePointerCapture(activePointerId);
        } catch (err) {}
      }

      setTimeout(() => {
        hasDragged = false;
        dragDistance = 0;
        activePointerId = null;
        velocityX = 0;
      }, 100);
    } else {
      activePointerId = null;
      dragDistance = 0;
      velocityX = 0;
    }
  }

  trackWrapper.addEventListener('pointerup', stopDrag);
  trackWrapper.addEventListener('pointercancel', stopDrag);
  window.addEventListener('pointerup', stopDrag);

  // Prevent accidental drag navigation, while ALWAYS allowing direct link touches and clicks
  trackWrapper.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) {
      // If drag distance was small (< 15px), it was an intentional tap/click, allow it to open!
      if (dragDistance < 15) {
        hasDragged = false;
        return;
      }
    }

    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // Ensure all Vercel and external project links open reliably on touch and click
  trackWrapper.querySelectorAll('a[href]').forEach(link => {
    let touchStartX = 0;
    let touchStartY = 0;

    link.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    link.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        const dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
        const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
        // If movement is under 12px, it is an intentional tap - open the link immediately!
        if (dx < 12 && dy < 12) {
          const url = link.getAttribute('href');
          const target = link.getAttribute('target') || '_self';
          if (url && !url.startsWith('#') && !url.startsWith('tel:') && !url.startsWith('mailto:')) {
            window.open(url, target, 'noopener,noreferrer');
          }
        }
      }
    }, { passive: true });
  });

  trackWrapper.querySelectorAll('img').forEach(img => {
    img.addEventListener('dragstart', (e) => e.preventDefault());
  });

  // Keyboard navigation
  trackWrapper.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      trackWrapper.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      trackWrapper.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
    }
  });

  // Carousel UI updates
  let isTicking = false;

  function updateCarouselUI() {
    const scrollLeft = trackWrapper.scrollLeft;
    const maxScroll = trackWrapper.scrollWidth - trackWrapper.clientWidth;

    const canScroll = maxScroll > 8;

    if (prevBtn) {
      prevBtn.disabled = !canScroll;
      prevBtn.setAttribute('aria-disabled', String(!canScroll));
    }

    if (nextBtn) {
      nextBtn.disabled = !canScroll;
      nextBtn.setAttribute('aria-disabled', String(!canScroll));
    }

    if (progressBar) {
      if (maxScroll <= 0) {
        progressBar.style.width = '100%';
      } else {
        const progress = Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100));
        progressBar.style.width = `${progress}%`;
      }
    }

    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.team-dot');
      const step = getScrollStep();
      const activeIndex = Math.min(dots.length - 1, Math.max(0, Math.round(scrollLeft / step)));

      dots.forEach((dot, idx) => {
        const isActive = idx === activeIndex;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', String(isActive));
      });
    }

    isTicking = false;
  }

  trackWrapper.addEventListener('scroll', () => {
    if (!isTicking) {
      window.requestAnimationFrame(updateCarouselUI);
      isTicking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    updateCarouselUI();
  }, { passive: true });

  // Automatic rotation / carousel progression (smooth and pauses on user interaction)
  let autoplayTimer = null;
  let isInteracting = false;

  function startAutoplay() {
    if (config.autoplay === false) return;
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      if (isInteracting || isPointerDown) return;
      const maxScroll = trackWrapper.scrollWidth - trackWrapper.clientWidth;
      if (maxScroll <= 0) return;
      const currentScroll = trackWrapper.scrollLeft;
      const step = getScrollStep();
      if (currentScroll >= maxScroll - 12) {
        trackWrapper.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        trackWrapper.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, config.autoplayInterval || 5000);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  trackWrapper.addEventListener('mouseenter', () => { isInteracting = true; });
  trackWrapper.addEventListener('mouseleave', () => { isInteracting = false; });
  trackWrapper.addEventListener('touchstart', () => { isInteracting = true; }, { passive: true });
  trackWrapper.addEventListener('touchend', () => {
    setTimeout(() => { isInteracting = false; }, 2500);
  }, { passive: true });
  if (prevBtn) prevBtn.addEventListener('click', () => { isInteracting = true; setTimeout(() => { isInteracting = false; }, 4000); });
  if (nextBtn) nextBtn.addEventListener('click', () => { isInteracting = true; setTimeout(() => { isInteracting = false; }, 4000); });

  startAutoplay();

  updateCarouselUI();
}

// --------------------------------------------------------------------------
// 3. INITIALIZATION
// --------------------------------------------------------------------------
function initSliders() {
  // 1. Initialize Featured Projects Horizontal Slider
  setupHorizontalSlider({
    sectionId: 'projects',
    trackWrapperId: 'projectsTrackWrapper',
    trackId: 'projectsTrack',
    prevBtnId: 'projectPrevBtn',
    nextBtnId: 'projectNextBtn',
    progressBarId: 'projectProgressBar',
    dotsContainerId: 'projectDotsContainer',
    cardSelector: '.project-card',
    autoplay: true,
    autoplayInterval: 5000
  });

  // 2. Initialize Meet the Team Horizontal Slider
  setupHorizontalSlider({
    sectionId: 'team',
    trackWrapperId: 'teamTrackWrapper',
    trackId: 'teamTrack',
    prevBtnId: 'teamPrevBtn',
    nextBtnId: 'teamNextBtn',
    progressBarId: 'teamProgressBar',
    dotsContainerId: 'teamDotsContainer',
    cardSelector: '.team-card',
    autoplay: true,
    autoplayInterval: 5500
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSliders);
} else {
  initSliders();
}
