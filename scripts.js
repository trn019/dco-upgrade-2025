

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

    buildWatchOutSection();
    buildCrushedRoomsFromData(7);
  });

  document.addEventListener('taskdata:ready', () => {
    buildCrushedRoomsFromData(7);
  });
  // ===== End scripts.js =====

  // Add a very overdue room (≥ 21 days)
taskData["sun-10"] = {
  garage: [
    { name: "Sweep Floor", lastCleaned: "4 weeks ago", progress: 90, status: "Overdue!", frequency: "Monthly", progressType: "red", effort: "low" },
    { name: "Organize Tools", lastCleaned: "1 month ago", progress: 95, status: "Overdue!", frequency: "Monthly", progressType: "red", effort: "moderate" }
  ]
};

  
  // --- Helpers (re-useable) ---
  function daysAgoFromText(text) {
    const t = (text || '').toLowerCase().trim();
    if (!t) return 0;
    if (t.includes('today') || t.includes('this morning') || t.includes('this evening')) return 0;
    if (t.includes('yesterday')) return 1;
    const m = t.match(/(\d+)\s*(day|days|week|weeks|month|months)/);
    if (!m) return 0;
    const n = parseInt(m[1], 10);
    const unit = m[2];
    if (unit.startsWith('day'))   return n;
    if (unit.startsWith('week'))  return n * 7;
    if (unit.startsWith('month')) return n * 30;
    return 0;
  }

// Compute worst (max) days-since-clean for each room across ALL taskData entries
function computeRoomOverdueMap(data) {
  const roomMaxDays = {};
  Object.keys(data || {}).forEach(dayKey => {
    const rooms = data[dayKey] || {};
    Object.keys(rooms).forEach(room => {
      (rooms[room] || []).forEach(task => {
        const d = daysAgoFromText(task.lastCleaned);
        roomMaxDays[room] = Math.max(roomMaxDays[room] || 0, d);
      });
    });
  });
  return roomMaxDays;
}


// Simple cleanliness bar % (100% when 0 days, 0% at 21+ days)
function cleanlinessPct(days) {
  return Math.max(0, Math.min(100, Math.round(100 - (days/21)*100)));
}

// Build a card DOM node
function makeWatchOutCard(roomName, days, emoji='🏠') {
  const wrap = document.createElement('div');
  wrap.className = 'room-card';
  const pct = cleanlinessPct(days);
  const barColor = (pct <= 33) ? '#f44336' : (pct >= 67 ? '#4caf50' : '#ffc107');
  wrap.innerHTML = `
    <div class="room-image">${emoji}</div>
    <div class="room-info">
      <h5>${roomName.charAt(0).toUpperCase() + roomName.slice(1)}</h5>
      <p>last cleaned ${days} ${days===1?'day':'days'} ago</p>
      <div class="progress-bar" style="width:120px;background:#ffe8e6;">
        <div class="progress-fill" style="width:${pct}%;background:${barColor};"></div>
      </div>
    </div>`;
  return wrap;
}

// --- Main: build "Watch Out!" from taskData ---
// Call this in DOMContentLoaded AFTER taskData is available on the page
function buildWatchOutSection() {
  const section = document.getElementById('watchOut');
  const list = document.getElementById('watchOutList');
  if (!section || !list) return;

  // 1) Is taskData defined?
  if (typeof taskData === 'undefined') {
    console.warn('[WatchOut] taskData is undefined on Home page.');
    // Keep the section visible with a gentle note:
    list.innerHTML = `<p style="color:#666;">No data yet. Load tasks to see rooms to watch.</p>`;
    return;
  }

  // 2) Compute overdue rooms
  const roomDays = computeRoomOverdueMap(taskData);
  console.log('[WatchOut] roomDays:', roomDays);

  const overdue = Object.entries(roomDays)
    .filter(([_, days]) => days >= 21)
    .sort((a,b) => b[1]-a[1]);

  list.innerHTML = '';
  if (overdue.length === 0) {
    // No rooms overdue ≥3 weeks; show a friendly empty state (don’t hide the section)
    list.innerHTML = `<p style="color:#666;">All rooms look fine right now ✅</p>`;
    return;
  }

  overdue.forEach(([room, days]) => {
    const emoji = (typeof roomData !== 'undefined' && roomData[room]?.emoji) ? roomData[room].emoji : '🏠';
    list.appendChild(makeWatchOutCard(room, days, emoji));
  });
}

// --- Compute most-recent clean (minimum days-ago) per room across ALL taskData ---
function computeRoomRecentMap(data) {
  const roomMinDays = {};
  Object.keys(data || {}).forEach(dayKey => {
    const rooms = data[dayKey] || {};
    Object.keys(rooms).forEach(room => {
      (rooms[room] || []).forEach(task => {
        const d = daysAgoFromText(task.lastCleaned);
        const current = roomMinDays[room];
        roomMinDays[room] = (typeof current === 'number') ? Math.min(current, d) : d;
      });
    });
  });
  return roomMinDays;
}

/**
 * Build "sparkling" room cards from taskData.
 * A room is "sparkling" if its most-recent clean is within THRESHOLD_DAYS.
 * @param {number} THRESHOLD_DAYS - default 7 (this week). Use 2 if you want only very-fresh cleans.
 * @param {number} LIMIT - max cards to show (optional, default 6)
 */
function buildCrushedRoomsFromData(THRESHOLD_DAYS = 7, LIMIT = 6) {
  const container = document.getElementById('crushedRooms');
  if (!container) return;

  if (typeof taskData === 'undefined') {
    container.innerHTML = `<p style="color:#666;">No recent clean data yet.</p>`;
    return;
  }

  const minDaysByRoom = computeRoomRecentMap(taskData);

  // Pick rooms with a recent clean (≤ threshold), sorted by recency (smallest days first)
  const sparkling = Object.entries(minDaysByRoom)
    .filter(([_, days]) => typeof days === 'number' && days <= THRESHOLD_DAYS)
    .sort((a, b) => a[1] - b[1])     // most recent first
    .slice(0, LIMIT);

  container.innerHTML = '';
  if (sparkling.length === 0) {
    container.innerHTML = `<p style="color:#666;">No rooms cleaned in the last ${THRESHOLD_DAYS} days.</p>`;
    return;
  }

  sparkling.forEach(([room, days]) => {
    const emoji = (typeof roomData !== 'undefined' && roomData[room]?.emoji) ? roomData[room].emoji : '✨';
    const prettyName = room.charAt(0).toUpperCase() + room.slice(1);

    const card = document.createElement('div');
    card.className = 'room-card';
    card.innerHTML = `
      <div class="room-image">${emoji}</div>
      <div class="room-info">
        <h5>${prettyName}</h5>
        <p class="sparkling">The ${room} is sparkling ✨ <span style="color:#999;">(${days === 0 ? 'today' : days + 'd ago'})</span></p>
        <div class="progress-bar clean-bar">
          <div class="progress-fill"></div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

