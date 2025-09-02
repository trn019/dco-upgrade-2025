// ===== Clean Habits - scripts.js (infinite carousel, width fix) =====
document.addEventListener('DOMContentLoaded', () => {
    // -------------------------
    // Day selection
    // -------------------------
    const dayItems = document.querySelectorAll('.day-item');
    dayItems.forEach((day) => {
      day.addEventListener('click', () => {
        dayItems.forEach((d) => d.classList.remove('active'));
        day.classList.add('active');
      });
    });
  
    // -------------------------
    // Tab toggles
    // -------------------------
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });
  
    // -------------------------
    // Shuffle button animation
    // -------------------------
    const shuffleBtn = document.querySelector('.shuffle-btn');
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', () => {
        shuffleBtn.style.transform = 'rotate(180deg)';
        setTimeout(() => (shuffleBtn.style.transform = 'rotate(0deg)'), 300);
      });
    }
  
    // -------------------------
    // FAB animation
    // -------------------------
    const fab = document.querySelector('.fab');
    if (fab) {
      fab.addEventListener('click', () => {
        fab.style.transform = 'scale(0.9) rotate(45deg)';
        setTimeout(() => (fab.style.transform = 'scale(1) rotate(0deg)'), 150);
      });
    }
  
    // -------------------------
    // Infinite Carousel
    // -------------------------
    const viewport = document.querySelector('.carousel-viewport');
    const track = document.querySelector('.carousel-track');
    const baseSlides = Array.from(document.querySelectorAll('.carousel-track .task-card'));
    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');
    const dotsContainer = document.querySelector('.carousel-dots');
  
    if (viewport && track && baseSlides.length > 0 && dotsContainer) {
      // Helper to measure width reliably (handles transforms/rounding)
      const measureWidth = () => viewport.getBoundingClientRect().width;
  
      // Clone first and last for looping
      const firstClone = baseSlides[0].cloneNode(true);
      const lastClone = baseSlides[baseSlides.length - 1].cloneNode(true);
      firstClone.classList.add('clone');
      lastClone.classList.add('clone');
      track.insertBefore(lastClone, baseSlides[0]);
      track.appendChild(firstClone);
  
      const slides = Array.from(track.querySelectorAll('.task-card')); // includes clones
      let current = 1; // start at first "real" slide
      let slideWidth = measureWidth();
  
      // Build dots for real slides only
      dotsContainer.innerHTML = '';
      baseSlides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i + 1)); // account for leading clone
        dotsContainer.appendChild(dot);
      });
      const dots = Array.from(dotsContainer.querySelectorAll('.dot'));
  
      const updateDots = () => {
        dots.forEach((d, i) => d.classList.toggle('active', i === current - 1));
      };
  
      const goTo = (index, animate = true) => {
        current = index;
        track.style.transition = animate ? 'transform 300ms ease' : 'none';
        track.style.transform = `translateX(-${slideWidth * current}px)`;
        updateDots();
      };
  
      const next = () => goTo(current + 1);
      const prev = () => goTo(current - 1);
  
      // Transition end: snap when hitting a clone
      track.addEventListener('transitionend', () => {
        const atLastClone = slides[current] && slides[current].classList.contains('clone') && current === slides.length - 1;
        const atFirstClone = slides[current] && slides[current].classList.contains('clone') && current === 0;
  
        if (atLastClone) {
          // jumped past real last -> snap to real first
          goTo(1, false);
        } else if (atFirstClone) {
          // jumped before real first -> snap to real last
          goTo(slides.length - 2, false);
        }
      });
  
      // Buttons
      if (prevBtn) prevBtn.addEventListener('click', prev);
      if (nextBtn) nextBtn.addEventListener('click', next);
  
      // Resize: recompute width and re-apply transform
      const onResize = () => {
        slideWidth = measureWidth();
        goTo(current, false);
      };
      window.addEventListener('resize', onResize);
  
      // Touch swipe
      let startX = 0, deltaX = 0, isSwiping = false;
      const onTouchStart = (e) => {
        isSwiping = true;
        startX = e.touches[0].clientX;
        track.style.transition = 'none';
      };
      const onTouchMove = (e) => {
        if (!isSwiping) return;
        deltaX = e.touches[0].clientX - startX;
        const offset = -current * slideWidth + deltaX;
        track.style.transform = `translateX(${offset}px)`;
      };
      const onTouchEnd = () => {
        track.style.transition = 'transform 300ms ease';
        if (Math.abs(deltaX) > slideWidth * 0.2) {
          deltaX < 0 ? next() : prev();
        } else {
          goTo(current);
        }
        isSwiping = false;
        deltaX = 0;
      };
      viewport.addEventListener('touchstart', onTouchStart, { passive: true });
      viewport.addEventListener('touchmove', onTouchMove, { passive: true });
      viewport.addEventListener('touchend', onTouchEnd);
  
      // Keyboard
      viewport.tabIndex = 0;
      viewport.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
      });
  
      // Init after clones exist & width measured
      // Use rAF so layout is settled before first transform
      requestAnimationFrame(() => goTo(current, false));
    }
  
    // -------------------------
    // Task buttons (delegation)
    // -------------------------
    document.addEventListener('click', (e) => {
      const completeBtn = e.target.closest('.btn-complete');
      const focusBtn = e.target.closest('.btn-focus-mode');
  
      if (completeBtn) {
        const originalText = completeBtn.textContent;
        completeBtn.textContent = 'Completed!';
        completeBtn.style.background = '#4caf50';
        setTimeout(() => {
          completeBtn.textContent = originalText;
          completeBtn.style.background = '#4caf50';
        }, 2000);
      }
  
      if (focusBtn) {
        const originalText = focusBtn.textContent;
        focusBtn.textContent = 'Focus Mode Active';
        focusBtn.style.background = '#f44336';
        setTimeout(() => {
          focusBtn.textContent = originalText;
          focusBtn.style.background = '#ff9800';
        }, 3000);
      }
    });
  });
  // ===== End scripts.js =====
  