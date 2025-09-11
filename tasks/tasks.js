const taskData = {
  "thu-7": {
    bedroom: [
      { name: "Vacuum Floor", lastCleaned: "3 weeks ago", progress: 85, status: "Uh oh...", frequency: "Every week", progressType: "red", effort: "high" },
      { name: "Organize Closet", lastCleaned: "3 weeks ago", progress: 60, status: "Getting dusty...", frequency: "Every month", progressType: "yellow", effort: "moderate" },
      { name: "Change Sheets", lastCleaned: "1 week ago", progress: 50, status: "Needs fresh sheets", frequency: "Weekly", progressType: "yellow", effort: "moderate" }
    ],
    kitchen: [
      { name: "Clean Countertops", lastCleaned: "2 days ago", progress: 20, status: "Looking good!", frequency: "Every 3 days", progressType: "green", effort: "low" },
      { name: "Wash Dishes", lastCleaned: "yesterday", progress: 40, status: "Some dishes piling up", frequency: "Daily", progressType: "yellow", effort: "low" },
      { name: "Clean Stove", lastCleaned: "1 week ago", progress: 70, status: "Greasy again", frequency: "Weekly", progressType: "yellow", effort: "moderate" },
      { name: "Take Out Trash", lastCleaned: "today", progress: 10, status: "Empty bin", frequency: "Daily", progressType: "green", effort: "low" }
    ],
    bathroom: [
      { name: "Clean Mirror", lastCleaned: "4 days ago", progress: 60, status: "Getting spotted", frequency: "Weekly", progressType: "yellow", effort: "low" },
      { name: "Scrub Shower", lastCleaned: "2 weeks ago", progress: 80, status: "Mildew starting", frequency: "Biweekly", progressType: "red", effort: "high" }
    ],
    living: [
      { name: "Dust TV Stand", lastCleaned: "5 days ago", progress: 55, status: "Light dust visible", frequency: "Weekly", progressType: "yellow", effort: "low" }
    ]
  },

  "fri-8": {
    bedroom: [
      { name: "Make Bed", lastCleaned: "yesterday", progress: 30, status: "All good!", frequency: "Daily", progressType: "green", effort: "low" }
    ],
    kitchen: [
      { name: "Wash Dishes", lastCleaned: "this morning", progress: 10, status: "Fresh!", frequency: "Daily", progressType: "green", effort: "low" },
      { name: "Clean Stove", lastCleaned: "1 week ago", progress: 70, status: "Needs attention", frequency: "Weekly", progressType: "yellow", effort: "moderate" }
    ]
  },

  "sat-9": {
    bedroom: [
      { name: "Change Sheets", lastCleaned: "2 weeks ago", progress: 80, status: "Time to wash!", frequency: "Every 2 weeks", progressType: "red", effort: "moderate" }
    ],
    kitchen: [
      { name: "Deep Clean Fridge", lastCleaned: "1 month ago", progress: 90, status: "Overdue!", frequency: "Monthly", progressType: "red", effort: "high" }
    ]
  }
};
  
// Persist collapsed state per day -> room
const collapsedRoomsByDay = {};              // e.g. { 'thu-7': { kitchen: true } }
const isCollapsed = (day, room) => !!collapsedRoomsByDay[day]?.[room];
const setCollapsed = (day, room, val) => {
  (collapsedRoomsByDay[day] ||= {})[room] = !!val;
};



const roomData = {
    bedroom: { emoji: "🛏️", tasks: 2 },
    kitchen: { emoji: "🍳", tasks: 1 },
    bathroom: { emoji: "🚿", tasks: 3 },
    living: { emoji: "🛋️", tasks: 1 }
};

// Map each room to its unique image URL
const ROOM_IMAGES = {
  kitchen:  'images/rooms/kitchen.jpg',
  bedroom:  'images/rooms/bedroom.jpg',
  bathroom: 'images/rooms/bathroom.jpg',
  living:   'images/rooms/living.jpg',
  // add more as needed...
};

let currentSort = 'cleanliness'; // 'cleanliness' | 'effort-asc'

const EFFORT_ORDER = { low: 1, moderate: 2, high: 3 };

let currentDay = 'thu-7';
updateTasksForDay(currentDay);
let currentTab = 'tasks';
let floatingButtonsVisible = false;

// Recurring task state
let selectedNumber = 7; // Default to 7
let selectedUnit = 'days'; // Default to days
let selectedRepeat = 'On Monday';
let selectedTime = 'Time';

// place this at the VERY top of tasks.js (before DOMContentLoaded, before updateTasksForDay)
(function preselectTab() {
  const paramTab = new URLSearchParams(location.search).get('tab');
  const hashTab = location.hash ? location.hash.slice(1) : '';
  const initialTab = (paramTab === 'rooms' || hashTab === 'rooms') ? 'rooms' : 'tasks';

  // Apply classes right away so the browser never shows the wrong tab
  document.addEventListener('DOMContentLoaded', () => {
    activateTab(initialTab);
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  // --- Tabs ---
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      const tabName = tab.getAttribute('data-tab');
      const targetContent = document.getElementById(`${tabName}-content`);
      if (targetContent) targetContent.classList.add('active');
      currentTab = tabName;
    });
  });

  // --- Day selector ---
  renderDaySelector();  // ⬅️ builds Thu 7.., sets currentDay, calls updateTasksForDay()



  // --- Add task + floating options ---
  const addTaskBtn = document.querySelector('.add-task');
  const taskOptions = document.getElementById('taskOptions');

  if (addTaskBtn && taskOptions) {
    addTaskBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      floatingButtonsVisible = !floatingButtonsVisible;
      taskOptions.classList.toggle('active', floatingButtonsVisible);
      addTaskBtn.classList.toggle('expanded', floatingButtonsVisible);
    });
  }

  document.querySelectorAll('.task-option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskType = btn.dataset.type;
      taskOptions.classList.remove('active');
      addTaskBtn.classList.remove('expanded');
      floatingButtonsVisible = false;
      if (taskType === 'one-time') showOneTimeTaskModal();
      if (taskType === 'recurring') showRecurringTaskModal();
    });
  });

  document.addEventListener('click', (e) => {
    if (floatingButtonsVisible &&
        !e.target.closest('.add-task') &&
        !e.target.closest('.task-options')) {
      taskOptions.classList.remove('active');
      addTaskBtn.classList.remove('expanded');
      floatingButtonsVisible = false;
    }
  });

  // --- Setup modals ---
  setupModalEventListeners();

  // --- Sort dropdowns for rooms ---
  sortRoomsGridAZ();
});


(function initAddRoomCard() {
  const grid = document.querySelector('.rooms-grid');
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const addCard = e.target.closest('.add-room-card');
    if (!addCard) return;

    const roomName = (prompt('New room name (e.g., “Garage”)') || '').trim();
    if (!roomName) return;

    const key = roomName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    if (!key) return alert('Invalid room name.');

    if (document.querySelector(`.rooms-grid .room-card[data-room="${key}"]`)) {
      return alert('That room already exists.');
    }

    // Update data objects
    roomData[key] = { emoji: '🧽', tasks: 0 };
    Object.keys(taskData).forEach(day => {
      taskData[day][key] = taskData[day][key] || [];
    });

    // Build new room card
    const card = document.createElement('div');
    card.className = 'room-card';
    card.setAttribute('data-room', key);
    card.innerHTML = `
      <div class="room-header">
        <div class="room-info">
          <div class="room-name">${roomName}</div>
          <div class="room-status">no clean yet</div>
        </div>
        <div class="status-indicator status-green"></div>
      </div>
      <div class="room-bottom">
        <div class="task-count">0</div>
        <div class="task-label">tasks</div>
      </div>
    `;

    // Insert new room AFTER the add-room card
    grid.insertBefore(card, addCard.nextSibling);

    card.addEventListener('click', () => openRoomScreen(key));
    card.querySelector('.room-name').textContent = roomName;
sortRoomsGridAZ();
  });

})();



function setupModalEventListeners() {
  // ---- One-time "page" modal ----
  const oneTimeModal  = document.getElementById('oneTimeTaskModal');
  const nextBtn       = document.getElementById('oneTimeNextBtn');
  const backChevron   = oneTimeModal.querySelector('.modal-header .back-btn');
  const closeX        = oneTimeModal.querySelector('.modal-header .close-modal');
  const oneTimeForm   = document.getElementById('oneTimeTaskForm');

  // Next → Page 2
  nextBtn?.addEventListener('click', () => {
    // optional: require fields
    // if (!oneTimeForm.reportValidity()) return;
    gotoOneTimePage(2);
  });

  // Header back: if on page 2 → back to page 1; else close
  backChevron?.addEventListener('click', () => {
    if (oneTimePage > 1) gotoOneTimePage(1);
    else closeOneTimeModal();
  });

  // X close
  closeX?.addEventListener('click', closeOneTimeModal);

  // Click outside modal-content closes
  oneTimeModal.addEventListener('click', (e) => {
    if (e.target === oneTimeModal) closeOneTimeModal();
  });

  // Esc key closes (only when modal is open)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOneTimeOpen()) closeOneTimeModal();
  });

  // (Optional) If you still use submit anywhere, prevent it from closing the page
  oneTimeForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    // … do nothing here in page flow …
  });

  // ---- Recurring modal close wiring (unchanged) ----
  const recurringModal     = document.getElementById('recurringTaskModal');
  const recurringCloseBtn  = recurringModal.querySelector('.close-modal');

  recurringCloseBtn?.addEventListener('click', closeRecurringModal);
  recurringModal.addEventListener('click', (e) => {
    if (e.target === recurringModal) closeRecurringModal();
  });

// --- One-time modal: Effort picker (delegated + accessible) ---
const effortGroup = oneTimeModal.querySelector('.effort-options');
if (effortGroup) {
  // ARIA once
  effortGroup.setAttribute('role', 'radiogroup');
  effortGroup.querySelectorAll('.effort-option').forEach(opt => {
    opt.setAttribute('role', 'radio');
    opt.setAttribute('tabindex', '0');
    opt.setAttribute('aria-checked', opt.classList.contains('selected') ? 'true' : 'false');
  });

  function selectEffort(optionEl) {
    effortGroup.querySelectorAll('.effort-option').forEach(opt => {
      opt.classList.remove('selected');
      opt.setAttribute('aria-checked', 'false');
    });
    optionEl.classList.add('selected');
    optionEl.setAttribute('aria-checked', 'true');
  }

  // Click anywhere in the tile (stars/label included)
  effortGroup.addEventListener('click', (e) => {
    const optionEl = e.target.closest('.effort-option');
    if (!optionEl) return;
    selectEffort(optionEl);
  });

  // Keyboard: Enter/Space
  effortGroup.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const optionEl = e.target.closest('.effort-option');
    if (!optionEl) return;
    e.preventDefault();
    selectEffort(optionEl);
  });
}


  // your existing initializeDualPicker();
  // initializeDualPicker();
}


function initializeDualPicker() {
    // Initialize number picker (1-30)
    const numberPickerList = document.getElementById('numberPickerList');
    const numberPickerScroll = document.getElementById('numberPickerScroll');
    // Initialize unit picker
    const unitPickerList = document.getElementById('unitPickerList');
    const unitPickerScroll = document.getElementById('unitPickerScroll');
    const units = ['days', 'weeks', 'months', 'years'];

    if (!numberPickerList || !unitPickerList) return;
  numberPickerList.innerHTML = '';
  unitPickerList.innerHTML = '';

    for (let i = 1; i <= 30; i++) {
        const numberItem = document.createElement('div');
        numberItem.className = 'picker-item';
        numberItem.setAttribute('data-number', i);
        numberItem.textContent = i;
        
        if (i === 7) { // Default selection
            numberItem.classList.add('selected');
        }
        
        numberItem.addEventListener('click', () => {
            // Remove selected class from all number items
            document.querySelectorAll('#numberPickerList .picker-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            // Add selected class to clicked item
            numberItem.classList.add('selected');
            selectedNumber = i;
            
            console.log('Selected number:', selectedNumber);
        });
        
        numberPickerList.appendChild(numberItem);
    }
    
    
    
    units.forEach((unit, index) => {
        const unitItem = document.createElement('div');
        unitItem.className = 'picker-item';
        unitItem.setAttribute('data-unit', unit);
        unitItem.textContent = unit;
        
        if (unit === 'days') { // Default selection
            unitItem.classList.add('selected');
        }
        
        unitItem.addEventListener('click', () => {
            // Remove selected class from all unit items
            document.querySelectorAll('#unitPickerList .picker-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            // Add selected class to clicked item
            unitItem.classList.add('selected');
            selectedUnit = unit;
            
            console.log('Selected unit:', selectedUnit);
        });
        
        unitPickerList.appendChild(unitItem);
    });
    
    // Center the default selections in view
    setTimeout(() => {
        // Center number 7
        const selectedNumberItem = numberPickerList.querySelector('[data-number="7"]');
        if (selectedNumberItem) {
            const scrollTop = selectedNumberItem.offsetTop - numberPickerScroll.offsetHeight / 2 + selectedNumberItem.offsetHeight / 2;
            numberPickerScroll.scrollTop = scrollTop;
        }
        
        // Center "days" unit
        const selectedUnitItem = unitPickerList.querySelector('[data-unit="days"]');
        if (selectedUnitItem) {
            const scrollTop = selectedUnitItem.offsetTop - unitPickerScroll.offsetHeight / 2 + selectedUnitItem.offsetHeight / 2;
            unitPickerScroll.scrollTop = scrollTop;
        }
    }, 100);
}

let oneTimePage = 1;

function isOneTimeOpen() {
  const modal = document.getElementById('oneTimeTaskModal');
  return modal && getComputedStyle(modal).display !== 'none';
}

function resetOneTimeForm() {
  const modal = document.getElementById('oneTimeTaskModal');
  if (!modal) return;
  document.getElementById('oneTimeTaskForm')?.reset();
  modal.querySelectorAll('.effort-option').forEach(opt => opt.classList.remove('selected'));
  // ensure next open starts on page 1
  gotoOneTimePage(1);
}

function gotoOneTimePage(n) {
  oneTimePage = n;
  const modal = document.getElementById('oneTimeTaskModal');
  modal.querySelectorAll('.modal-page').forEach(pg => {
    pg.classList.toggle('is-active', pg.getAttribute('data-page') === String(n));
  });
}

function showOneTimeTaskModal() {
  const modal = document.getElementById('oneTimeTaskModal');
  if (!modal) return;
  modal.classList.add('modal--page');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  gotoOneTimePage(1);

  // Reset effort to NONE selected
  const eg = modal.querySelector('.effort-options');
  if (eg) {
    eg.querySelectorAll('.effort-option').forEach(opt => {
      opt.classList.remove('selected');
      opt.setAttribute('aria-checked', 'false');
    });
  }
}



function closeOneTimeModal() {
  const modal = document.getElementById('oneTimeTaskModal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
  resetOneTimeForm();
}



// Build a quick review for Page 2 (customize as you like)
function buildOneTimeReview() {
  const room  = document.getElementById('oneTimeTaskRoom').value || '—';
  const task  = document.getElementById('oneTimeTaskName').value || '—';
  const notes = document.getElementById('oneTimeTaskNotes').value || '—';
  const selectedEffort = document.querySelector('#oneTimeTaskModal .effort-option.selected')?.getAttribute('data-level') || 'low';

  document.getElementById('oneTimeReview').innerHTML = `
    <div><strong>Room:</strong> ${room}</div>
    <div><strong>Task:</strong> ${task}</div>
    <div><strong>Effort:</strong> ${selectedEffort}</div>
    <div><strong>Notes:</strong> ${notes ? notes.replace(/\n/g,'<br>') : '—'}</div>
  `;
}

// ===== Recurring modal pager =====
let recurringPage = 1;



//check if this is correct
let recurringPickerBuilt = false;


function showRecurringTaskModal() {
  const modal = document.getElementById('recurringTaskModal');
  if (!modal) return;
  modal.classList.add('modal--page');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  gotoRecurringPage(1);
}

function closeRecurringModal() {
  const modal = document.getElementById('recurringTaskModal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';

  // clear forms as you already do...
  document.getElementById('recurringTaskForm')?.reset();
  document.getElementById('recurringTaskFormPage1')?.reset();

  // clear picker DOM to avoid duplicates next open
  document.getElementById('numberPickerList')?.replaceChildren();
  document.getElementById('unitPickerList')?.replaceChildren();

  // reset state
  recurringPickerBuilt = false;
  selectedNumber = 7; selectedUnit = 'days';
  selectedRepeat = 'On Monday'; selectedTime = 'Time';
  const rv = document.getElementById('repeatValue'); if (rv) rv.textContent = 'On Monday ›';
  const tv = document.getElementById('timeValue');   if (tv) tv.textContent = 'Time ›';
}


// Wire up buttons (inside your existing setupModalEventListeners or after DOMContentLoaded)
(function wireRecurringModal() {
  const modal = document.getElementById('recurringTaskModal');
  if (!modal) return;

  // Header X closes
  modal.querySelector('.close-modal')?.addEventListener('click', closeRecurringModal);


  // Page 1 → Next (validate requireds)
  document.getElementById('recurringNextBtn')?.addEventListener('click', () => {
    const ok1 = document.getElementById('recurringTaskRoom').checkValidity();
    const ok2 = document.getElementById('recurringTaskName').checkValidity();
    if (!ok1 || !ok2) {
      document.getElementById('recurringTaskFormPage1').reportValidity();
      return;
    }
    gotoRecurringPage(2);
    initializeDualPicker();
  });

  // Page 2 ← Back
  document.getElementById('recurringPrevBtn')?.addEventListener('click', () => gotoRecurringPage(1));

  // Effort picker (Page 1)
  modal.querySelectorAll('#recurringEffortOptions .effort-option').forEach(opt => {
    opt.addEventListener('click', () => {
      modal.querySelectorAll('#recurringEffortOptions .effort-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  // Keep your existing handlers for: initializeDualPicker(), showRepeatOptions(), showTimeOptions()
})();

// ---- State for repeat days (sun..sat) ----
const DOW_ORDER = ['sun','mon','tue','wed','thu','fri','sat'];
let selectedRepeatDays = new Set(); // mirrors 'selectedRepeat' summary

// Replace your existing showRepeatOptions() to open the sub-page
function showRepeatOptions() {
  openRepeatPicker();
}

function openRepeatPicker() {
  const modal = document.getElementById('recurringTaskModal');
  if (!modal) return;

  // Activate the repeat page, hide page 2
  modal.querySelector('[data-page="2"]')?.classList.remove('is-active');
  const pg = modal.querySelector('[data-page="repeat"]');
  pg?.classList.add('is-active');

  // Header title -> "Repeat"
  const titleEl = modal.querySelector('.modal-header h2');
  if (titleEl) {
    titleEl.textContent = '';              // visually empty
    titleEl.setAttribute('aria-hidden','true'); // don't announce blank heading
  }

  // Mark we're on the subpage for back behavior
  recurringPage = 'repeat';

  // Initialize checkboxes from current summary (selectedRepeat) if empty
  if (selectedRepeatDays.size === 0) hydrateDaysFromSummary();

  // Reflect current set into checkboxes
  pg.querySelectorAll('.repeat-day').forEach(cb => {
    const key = cb.dataset.day;
    cb.checked = selectedRepeatDays.has(key);
  });

  // Wire change handlers (idempotent)
  if (!pg.dataset.wired) {
    pg.addEventListener('change', (e) => {
      const cb = e.target.closest('.repeat-day');
      if (!cb) return;
      const key = cb.dataset.day;
      if (!key) return;
      if (cb.checked) selectedRepeatDays.add(key);
      else selectedRepeatDays.delete(key);
      // Optional: immediate summary preview (not visible on this page)
    });
    pg.dataset.wired = '1';
  }
}

function closeRepeatPicker() {
  const modal = document.getElementById('recurringTaskModal');
  if (!modal) return;

  // Build summary text and push to Page 2
  selectedRepeat = summarizeRepeatDays(selectedRepeatDays);
  const rv = document.getElementById('repeatValue');
  if (rv) rv.textContent = selectedRepeat + ' ›';

  // Return to Page 2
  modal.querySelector('[data-page="repeat"]')?.classList.remove('is-active');
  modal.querySelector('[data-page="2"]')?.classList.add('is-active');

  // Restore header title
  const titleEl = modal.querySelector('.modal-header h2');
  if (titleEl) {
    titleEl.textContent = 'Recurring Task'; // restore
    titleEl.removeAttribute('aria-hidden');
  }

  recurringPage = 2;
}

(function installSingleRecurringBackHandler() {
  const modal = document.getElementById('recurringTaskModal');
  if (!modal) return;
  const backBtn = modal.querySelector('.modal-header .back-btn');
  if (!backBtn) return;

  // Remove any previous listeners you may have attached
  backBtn.replaceWith(backBtn.cloneNode(true));
  const freshBackBtn = modal.querySelector('.modal-header .back-btn');

  freshBackBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();   // <-- prevent other handlers from firing

    const repeatPage = modal.querySelector('.modal-page[data-page="repeat"]');
    const onRepeat   = repeatPage && repeatPage.classList.contains('is-active');

    if (onRepeat) {
      // go back to Page 2 (stay inside recurring)
      closeRepeatPicker();          // your function that switches repeat -> page 2
      return;
    }

    if (recurringPage === 2) {
      gotoRecurringPage(1);
      return;
    }

    // recurringPage is 1 (or anything else) → close
    closeRecurringModal();
  });
})();



// Ensure Page 2's "Repeat" row opens this picker


let recurringStart = '10:00 AM';
let recurringEnd   = '1:00 PM';

function parseTime(str){
  const s = (str||'').trim().toUpperCase();
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
  if(!m) return {h:10,m:0,p:'AM'};
  let h = Math.min(12, Math.max(1, parseInt(m[1],10)||10));
  let mm = Math.min(59, Math.max(0, parseInt(m[2]||'0',10)));
  const p = m[3]==='PM' ? 'PM' : 'AM';
  return {h, m:mm, p};
}
function fmtTime(t){ return `${t.h}:${String(t.m).padStart(2,'0')} ${t.p}`; }

function buildInlineTimeLists(prefix){
  // prefix = 'start' | 'end'
  const hourList   = document.getElementById(`${prefix}HourList`);
  const minuteList = document.getElementById(`${prefix}MinuteList`);
  const periodList = document.getElementById(`${prefix}PeriodList`);
  if (!hourList || hourList.dataset.built) return;

  // Hours
  for(let i=1;i<=12;i++){
    const el = document.createElement('div');
    el.className = 'picker-item';
    el.dataset.hour = i;
    el.textContent = i;
    el.addEventListener('click', () => selectHour(prefix, i));
    hourList.appendChild(el);
  }
  // Minutes 00..55 step 5
  for(let i=0;i<60;i+=5){
    const el = document.createElement('div');
    el.className = 'picker-item';
    el.dataset.minute = i;
    el.textContent = String(i).padStart(2,'0');
    el.addEventListener('click', () => selectMinute(prefix, i));
    minuteList.appendChild(el);
  }
  // Period
  ['AM','PM'].forEach(p=>{
    const el = document.createElement('div');
    el.className = 'picker-item';
    el.dataset.period = p;
    el.textContent = p;
    el.addEventListener('click', () => selectPeriod(prefix, p));
    periodList.appendChild(el);
  });

  hourList.dataset.built = minuteList.dataset.built = periodList.dataset.built = '1';
}

function markSelected(listEl, attr, val){
  listEl.querySelectorAll('.picker-item').forEach(i=>{
    i.classList.toggle('selected', String(i.dataset[attr])===String(val));
  });
}
function centerSelected(scrollEl, itemEl){
  if(!scrollEl || !itemEl) return;
  const top = itemEl.offsetTop - (scrollEl.clientHeight/2) + (itemEl.offsetHeight/2);
  scrollEl.scrollTop = top;
}
function snapBind(scrollEl, itemSelector, onSnap){
  if(!scrollEl) return;
  let t;
  scrollEl.addEventListener('scroll', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      const {top, height} = scrollEl.getBoundingClientRect();
      const centerY = top + height/2;
      const items = [...scrollEl.querySelectorAll(itemSelector)];
      let closest=null, best=1e9;
      for(const el of items){
        const r = el.getBoundingClientRect();
        const dy = Math.abs((r.top+r.height/2)-centerY);
        if(dy<best){best=dy; closest=el;}
      }
      if(closest){
        const targetTop = closest.offsetTop - (scrollEl.clientHeight/2) + (closest.offsetHeight/2);
        scrollEl.scrollTo({top: targetTop, behavior: 'smooth'});
        onSnap?.(closest);
      }
    }, 90);
  });
}

function openTimeAccordion(which){
  // which = 'start' | 'end'
  const acc = document.getElementById(which==='start' ? 'startTimeAcc' : 'endTimeAcc');
  const other = document.getElementById(which==='start' ? 'endTimeAcc' : 'startTimeAcc');

  // close the other if open
  if (other && !other.hidden) other.hidden = true;

  // build lists once
  buildInlineTimeLists(which);

  // sync current value → selection
  const t = parseTime(which==='start' ? recurringStart : recurringEnd);
  const hourList = document.getElementById(`${which}HourList`);
  const minuteList = document.getElementById(`${which}MinuteList`);
  const periodList = document.getElementById(`${which}PeriodList`);
  const hourScroll = document.getElementById(`${which}HourScroll`);
  const minuteScroll = document.getElementById(`${which}MinuteScroll`);
  const periodScroll = document.getElementById(`${which}PeriodScroll`);

  markSelected(hourList,'hour',t.h);
  markSelected(minuteList,'minute',t.m);
  markSelected(periodList,'period',t.p);

  // center selections
  queueMicrotask(()=>{
    centerSelected(hourScroll, hourList.querySelector(`[data-hour="${t.h}"]`));
    centerSelected(minuteScroll, minuteList.querySelector(`[data-minute="${t.m}"]`));
    centerSelected(periodScroll, periodList.querySelector(`[data-period="${t.p}"]`));
  });

  // snap on scroll stop
  snapBind(hourScroll,'.picker-item',(el)=>selectHour(which, +el.dataset.hour, false));
  snapBind(minuteScroll,'.picker-item',(el)=>selectMinute(which, +el.dataset.minute, false));
  snapBind(periodScroll,'.picker-item',(el)=>selectPeriod(which, el.dataset.period, false));

  // show/hide
  acc.hidden = !acc.hidden;
}

function selectHour(which, h, center=true){
  const list = document.getElementById(`${which}HourList`);
  const scroll = document.getElementById(`${which}HourScroll`);
  markSelected(list,'hour',h);
  if(center) centerSelected(scroll, list.querySelector(`[data-hour="${h}"]`));
  commitInlineTime(which);
}
function selectMinute(which, m, center=true){
  const list = document.getElementById(`${which}MinuteList`);
  const scroll = document.getElementById(`${which}MinuteScroll`);
  markSelected(list,'minute',m);
  if(center) centerSelected(scroll, list.querySelector(`[data-minute="${m}"]`));
  commitInlineTime(which);
}
function selectPeriod(which, p, center=true){
  const list = document.getElementById(`${which}PeriodList`);
  const scroll = document.getElementById(`${which}PeriodScroll`);
  markSelected(list,'period',p);
  if(center) centerSelected(scroll, list.querySelector(`[data-period="${p}"]`));
  commitInlineTime(which);
}

function commitInlineTime(which){
  const h = +document.querySelector(`#${which}HourList .picker-item.selected`)?.dataset.hour || 10;
  const m = +document.querySelector(`#${which}MinuteList .picker-item.selected`)?.dataset.minute || 0;
  const p = document.querySelector(`#${which}PeriodList .picker-item.selected`)?.dataset.period || 'AM';
  const val = fmtTime({h,m,p});
  if (which==='start') {
    recurringStart = val;
    const el = document.getElementById('recurringStartVal'); if (el) el.textContent = val;
  } else {
    recurringEnd = val;
    const el = document.getElementById('recurringEndVal'); if (el) el.textContent = val;
  }
}

// Save handler for Recurring Page 2
document.getElementById('recurringTaskForm')?.addEventListener('submit', (e) => {
  e.preventDefault();

  // Read Page 1 fields
  const room   = document.getElementById('recurringTaskRoom')?.value || '';
  const task   = document.getElementById('recurringTaskName')?.value || '';
  const notes  = document.getElementById('recurringTaskNotes')?.value || '';
  const effort = document.querySelector('#recurringEffortOptions .effort-option.selected')?.dataset.level || 'moderate';

  // Read Page 2 fields
  const notify = document.getElementById('recurringNotifyToggle')?.checked || false;

  // You already maintain these in state:
  // selectedNumber, selectedUnit, selectedRepeatDays (Set), recurringStart, recurringEnd
  const repeatSummary = summarizeRepeatDays(selectedRepeatDays); // "Weekdays", "On Monday", "Mon, Wed", etc.

  const payload = {
    type: 'recurring',
    room,
    task,
    notes,
    effort,
    every: { number: selectedNumber, unit: selectedUnit }, // e.g., {number: 2, unit: 'weeks'}
    repeat: {
      days: Array.from(selectedRepeatDays),                 // ['mon','wed','fri']
      summary: repeatSummary,
    },
    time: {
      start: recurringStart,                                // e.g., "10:00 AM"
      end:   recurringEnd,                                  // e.g., "1:00 PM"
    },
    notify
  };

  console.log('Save recurring task:', payload);

  // (Optional) quick UX touch: collapse any open inline pickers before close
  document.getElementById('startTimeAcc')?.setAttribute('hidden','');
  document.getElementById('endTimeAcc')?.setAttribute('hidden','');

  // Success feedback (replace with real persistence later)
  // alert('Recurring task saved!');

  // Close modal
  closeRecurringModal();
});


function wireRepeatTimeRows(){
  const repeatRow = document.querySelector('#recurringTaskModal .repeat-row');
  const startRow  = document.getElementById('recurringStartRow');
  const endRow    = document.getElementById('recurringEndRow');

  // Repeat row → open subpage
  if (repeatRow && !repeatRow.dataset.wired){
    repeatRow.addEventListener('click', (e)=>{
      e.preventDefault();
      e.stopPropagation();
      // collapse inline pickers so nothing blocks the tap
      document.getElementById('startTimeAcc')?.setAttribute('hidden','');
      document.getElementById('endTimeAcc')?.setAttribute('hidden','');
      openRepeatPicker();
    });
    repeatRow.dataset.wired = '1';
  }

  // Start/End inline accordions
  if (startRow && !startRow.dataset.wired){
    startRow.addEventListener('click', ()=>openTimeAccordion('start'));
    startRow.dataset.wired = '1';
  }
  if (endRow && !endRow.dataset.wired){
    endRow.addEventListener('click', ()=>openTimeAccordion('end'));
    endRow.dataset.wired = '1';
  }

  // Click-away (install once)
  if (!document.body.dataset.timeClickAway){
    document.addEventListener('click', (e)=>{
      const withinStart = e.target.closest('#startTimeAcc') || e.target.closest('#recurringStartRow');
      const withinEnd   = e.target.closest('#endTimeAcc')   || e.target.closest('#recurringEndRow');
      if (!withinStart) document.getElementById('startTimeAcc')?.setAttribute('hidden','');
      if (!withinEnd)   document.getElementById('endTimeAcc')?.setAttribute('hidden','');
    });
    document.body.dataset.timeClickAway = '1';
  }
}


// keep the row-values in sync when entering page 2
function gotoRecurringPage(n){
  recurringPage = n;
  const modal = document.getElementById('recurringTaskModal');
  modal.querySelectorAll('.modal-page').forEach(pg=>{
    pg.classList.toggle('is-active', pg.getAttribute('data-page')===String(n));
  });

  if (n === 2) {
    if (!recurringPickerBuilt) { initializeDualPicker(); recurringPickerBuilt = true; }
    wireRepeatTimeRows();  // ← required for Repeat + Start/End
    // keep values in sync:
    const sv = document.getElementById('recurringStartVal'); if (sv) sv.textContent = recurringStart;
    const ev = document.getElementById('recurringEndVal');   if (ev) ev.textContent = recurringEnd;
  }
  
}


// Convert the Set to a human summary like "Weekdays", "Weekends", "On Monday", "Mon, Wed, Fri"
function summarizeRepeatDays(set) {
  const arr = DOW_ORDER.filter(d => set.has(d));
  if (arr.length === 0) return 'Off';             // nothing selected
  if (equals(arr, ['mon','tue','wed','thu','fri'])) return 'Weekdays';
  if (equals(arr, ['sat','sun'])) return 'Weekends';
  if (arr.length === 1) return 'On ' + labelFor(arr[0]);
  return arr.map(labelForShort).join(', ');
}
function equals(a, b) { return a.length === b.length && a.every((v,i)=>v===b[i]); }
function labelFor(d) {
  return ({
    sun:'Sunday', mon:'Monday', tue:'Tuesday', wed:'Wednesday',
    thu:'Thursday', fri:'Friday', sat:'Saturday'
  })[d] || d;
}
function labelForShort(d) {
  return ({
    sun:'Sun', mon:'Mon', tue:'Tue', wed:'Wed',
    thu:'Thu', fri:'Fri', sat:'Sat'
  })[d] || d;
}

// If user already had a text summary (selectedRepeat), populate the Set accordingly
function hydrateDaysFromSummary() {
  const s = (selectedRepeat || '').toLowerCase().trim();
  if (!s) return;
  const map = { sunday:'sun', monday:'mon', tuesday:'tue', wednesday:'wed', thursday:'thu', friday:'fri', saturday:'sat' };
  if (s === 'weekdays') { ['mon','tue','wed','thu','fri'].forEach(d=>selectedRepeatDays.add(d)); return; }
  if (s === 'weekends') { ['sat','sun'].forEach(d=>selectedRepeatDays.add(d)); return; }
  // "On Monday"
  const m = s.match(/on\s+([a-z]+)/);
  if (m && map[m[1]]) { selectedRepeatDays.add(map[m[1]]); return; }
  // "Mon, Wed, Fri"
  s.split(',').map(x=>x.trim().slice(0,3).toLowerCase()).forEach(short=>{
    const key = ({sun:'sun', mon:'mon', tue:'tue', wed:'wed', thu:'thu', fri:'fri', sat:'sat'})[short];
    if (key) selectedRepeatDays.add(key);
  });
}



function daysAgoFromText(text) {
    const t = (text || '').toLowerCase().trim();
    if (!t) return 0;
    if (t.includes('this morning') || t.includes('today')) return 0;
    if (t.includes('yesterday')) return 1;
  
    const m = t.match(/(\d+)\s*(day|days|week|weeks|month|months)/);
    if (!m) return 0;
  
    const n = parseInt(m[1], 10);
    const unit = m[2];
    if (unit.startsWith('day')) return n;
    if (unit.startsWith('week')) return n * 7;
    if (unit.startsWith('month')) return n * 30; // simple approx
    return 0;
  }
  
  function intervalDaysFromFrequency(freq) {
    const f = (freq || '').toLowerCase();
  
    // Common patterns
    if (f.includes('daily')) return 1;
    if (f.includes('weekly') || f === 'every week') return 7;
    if (f.includes('monthly') || f === 'every month') return 30;
  
    // "Every 3 days", "Every 2 weeks", etc.
    const m = f.match(/every\s+(\d+)\s*(day|days|week|weeks|month|months)/);
    if (m) {
      const n = parseInt(m[1], 10);
      const unit = m[2];
      if (unit.startsWith('day')) return n;
      if (unit.startsWith('week')) return n * 7;
      if (unit.startsWith('month')) return n * 30;
    }
  
    return 7; // sensible default if unknown
  }
  
  function computeProgressPercent(lastCleanedText, frequencyText) {
    const interval = Math.max(1, intervalDaysFromFrequency(frequencyText)); // avoid /0
    const since = Math.max(0, daysAgoFromText(lastCleanedText));
    const remaining = Math.max(0, interval - since);
    // 100% right after cleaning -> counts down to 0% when due
    return Math.round((remaining / interval) * 100);
  }
  
  function progressColorClass(percent) {
    // Green when plenty of time left, then yellow, then red.
    if (percent > 66) return 'progress-green';
    if (percent > 33) return 'progress-yellow';
    return 'progress-red';
  }

  function statusFromPercent(pct){
    return (pct<=10)?'Overdue!':(pct<=33)?'Uh oh...':(pct<=66)?'Getting dusty...':'Looking good!';
  }

  function effortToCount(effort) {
    const e = (effort || 'moderate').toLowerCase();
    if (e === 'low') return 1;
    if (e === 'high') return 3;
    return 2; // moderate
  }
  function renderEffortDots(effort) {
    const n = effortToCount(effort);
    return `
      <span class="effort-dots" aria-label="Effort: ${effort || 'moderate'}">
        <span class="effort-dot ${n >= 1 ? 'filled' : ''}"></span>
        <span class="effort-dot ${n >= 2 ? 'filled' : ''}"></span>
        <span class="effort-dot ${n >= 3 ? 'filled' : ''}"></span>
      </span>
    `;
  }

  function updateTasksForDay(day) {
    const tasksContainer = document.getElementById('tasks-for-day');
    const dayTasks = taskData[day] || {};
  
    const sortTasksInRoom = (arr) => {
      const copy = arr.slice();
      if (currentSort === 'cleanliness') {
        copy.sort((a, b) => {
          const pa = computeProgressPercent(a.lastCleaned, a.frequency);
          const pb = computeProgressPercent(b.lastCleaned, b.frequency);
          return pa - pb; // due first
        });
        return copy;
      }
      // effort-asc only
      const EFFORT_ORDER = { low: 1, moderate: 2, high: 3 };
      copy.forEach(t => { if (!t.effort) t.effort = 'moderate'; });
      copy.sort((a, b) => (EFFORT_ORDER[a.effort] || 2) - (EFFORT_ORDER[b.effort] || 2));
      return copy;
    };
  
    const renderTask = (task, roomKey, dayKey)  => {
      const pctRaw = computeProgressPercent(task.lastCleaned, task.frequency);
      const pct = Math.max(0, Math.min(100, Number(pctRaw || 0)));
      const colorClass = progressColorClass(pct);   // 'progress-green' | 'progress-yellow' | 'progress-red'
      const status = statusFromPercent(pct);
    
      return `
      <div class="task-item"
        role="group" aria-expanded="false"
        data-room="${roomKey}"
        data-day="${dayKey}"
        data-name="${task.name}"
        data-effort="${task.effort || 'moderate'}"
        data-last="${task.lastCleaned || ''}"
        data-frequency="${task.frequency || ''}">
        
        <div class="task-main">
          <div class="tm-row">
            <div class="tm-text">
              <div class="tm-title">${task.name}</div>
              <div class="tm-sub">cleaned ${task.lastCleaned || '—'} ago</div>
            </div>
    
            <div class="tm-progress">
              <div class="tm-track ${colorClass}">
                <div class="tm-fill ${colorClass}" style="width:${pct}%;"></div>
              </div>
              <div class="tm-status">${status}</div>
              ${renderEffortDots(task.effort)}   <!-- ⬅️ dots now share the same container -->
            </div>
          </div>
    

        </div>
    
        <div class="task-actions" aria-hidden="true">
          <button class="ta-back"  aria-label="Back">‹</button>
          <button class="ta-done"  aria-label="Mark Done">✔<span>Mark Done!</span></button>
          <button class="ta-focus" aria-label="Focus">⌛<span>Focus</span></button>
          <button class="ta-edit"  aria-label="Edit">✎<span>Edit</span></button>
        </div>
      </div>`;
    };
    
    
    
  
    // ✅ rooms always alphabetical
    const roomsAZ = Object.keys(dayTasks).sort((a, b) => a.localeCompare(b));
  
    let html = '';
    roomsAZ.forEach(room => {
      const list = Array.isArray(dayTasks[room]) ? dayTasks[room] : [];
      const sorted = sortTasksInRoom(list);
    
      const pretty = room.charAt(0).toUpperCase() + room.slice(1);
      const collapsed = isCollapsed(day, room);
      const bodyId = `room-${day}-${room}`;
    
      html += `
        <section class="room ${collapsed ? 'is-collapsed' : ''}" data-room="${room}">
          <div class="room-row">
            <h2 class="room-title">${pretty}</h2>
            <button class="room-toggle"
        type="button"
        aria-expanded="${!collapsed}"
        aria-controls="${bodyId}"
        data-room="${room}"
        aria-label="${collapsed ? 'Expand' : 'Collapse'}">
  ${collapsed ? 'v' : '^'}
</button>

          </div>
          <div class="room-body" id="${bodyId}" ${collapsed ? 'hidden' : ''}>
          ${sorted.map(t => renderTask(t, room, day)).join('')}
          </div>
        </section>`;
    });
    
  
    tasksContainer.innerHTML = html || '<p style="text-align:center;color:#666;margin-top:40px;">No tasks scheduled for this day!</p>';

    tasksContainer.querySelectorAll('.task-item').forEach(c => {
      c.classList.remove('open');
      c.setAttribute('aria-expanded','false');
      c.querySelector('.task-actions')?.setAttribute('aria-hidden','true');
    });

    // after building each <section class="room ...">
// if (collapsed) {
//   // start collapsed
//   // body already has hidden; keep it consistent
// } else {
//   const body = document.getElementById(bodyId);
//   if (body) body.style.maxHeight = 'none';
// }

// Step 4: set initial styles so transitions behave
const sections = tasksContainer.querySelectorAll('.room');
sections.forEach(section => {
  const body = section.querySelector('.room-body');
  if (!body) return;

  if (section.classList.contains('is-collapsed')) {
    body.hidden = true;
    body.style.maxHeight = '0px';
    body.style.opacity = '0';
  } else {
    body.hidden = false;
    body.style.maxHeight = 'none';
    body.style.opacity = '1';
  }
});

  }
  
  


function showRoomTasks(room) {
    const roomTitle = document.getElementById('selected-room-title');
    const roomTasksContainer = document.getElementById('room-tasks');
    
    roomTitle.textContent = room.charAt(0).toUpperCase() + room.slice(1);
    
    // Get all tasks for this room across all days
    let allRoomTasks = [];
    Object.keys(taskData).forEach(day => {
        if (taskData[day][room]) {
            allRoomTasks = allRoomTasks.concat(taskData[day][room]);
        }
    });
    
    let html = '';
    allRoomTasks.forEach(task => {
        html += `
        <div class="task-item">
            <div class="task-header">
                <h3>${task.name}</h3>
            </div>
            <div class="task-info">
                <p>${task.lastCleaned}</p>
                <div class="progress-bar">
                    <div class="progress-fill progress-${task.progressType}"></div>
                </div>
                <p class="status-text">${task.status}</p>
            </div>
            <div class="task-frequency">
                <span>${task.frequency}</span>
            </div>
        </div>`;
    });
    
    if (html === '') {
        html = '<p style="text-align: center; color: #666; margin-top: 20px;">No tasks found for this room!</p>';
    }
    
    roomTasksContainer.innerHTML = html;
}

function sortRoomsGridAZ() {
  const grid = document.querySelector('.rooms-grid');
  if (!grid) return;

  const addCard = grid.querySelector('.add-room-card');
  const cards = Array.from(grid.querySelectorAll('.room-card'))
    .filter(c => !c.classList.contains('add-room-card'));

  cards.sort((a, b) => {
    const an = a.querySelector('.room-name')?.textContent?.trim().toLowerCase() || '';
    const bn = b.querySelector('.room-name')?.textContent?.trim().toLowerCase() || '';
    return an.localeCompare(bn);
  });

  // Reattach in sorted order; keep Add card at the front (or move to end if you prefer)
  grid.innerHTML = '';           // clear
  grid.appendChild(addCard);     // keep add card first; change position if desired
  cards.forEach(c => grid.appendChild(c));
}


// After you query .sort-btn:

document.addEventListener('DOMContentLoaded', () => {
    const sortBtn = document.querySelector('.sort-btn');
    const dropdown = document.querySelector('.dropdown');
    const menuItems = document.querySelectorAll('.dropdown-menu div');
  
    if (sortBtn && dropdown) {
      // Toggle menu open/close
      sortBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
      });
  
      // Click a menu item
      menuItems.forEach(item => {
        item.addEventListener('click', () => {
          currentSort = item.getAttribute('data-sort');
  
          // ✅ Button text always stays "Sort by ⌄"
          sortBtn.textContent = 'Sort by ⌄';
  
          updateTasksForDay(currentDay);
          dropdown.classList.remove('open');
        });
      });
  
      // Close dropdown if clicking outside
      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
          dropdown.classList.remove('open');
        }
      });
    }
    sortRoomsGridAZ();
  });

function closeRoomScreen() {
  // go back to rooms tab
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('rooms-content').classList.add('active');
}

// ===== ROOM SCREEN (with progress + sort + tasks near bottom) =====
let roomSort = 'urgency'; // default sort for the room screen

(function initRoomScreen() {
  const screenEl   = document.getElementById('room-screen');
  const titleEl    = document.getElementById('roomScreenTitle');
  const listEl = document.getElementById('roomScreenTasks');

  // Focus from a room task -> open Auto-Sanitize Review with THIS task
// Room screen: open/close the same action tray + Focus wiring
listEl.addEventListener('click', (e) => {
  const card = e.target.closest('.task-item');
  if (!card) return;

  // Action tray buttons
  if (e.target.closest('.ta-back'))  { closeCard(card); return; }
  if (e.target.closest('.ta-done'))  {
    // placeholder "done" feedback
    card.style.opacity = .6;
    setTimeout(()=>{ card.style.opacity = 1; }, 250);
    closeCard(card);
    return;
  }
  if (e.target.closest('.ta-edit'))  {
    alert('Edit coming soon ✏️');
    closeCard(card);
    return;
  }
  if (e.target.closest('.ta-focus')) {
    // Open Auto-Sanitize Review with THIS task
    const ds = card.dataset;
    const roomKey  = ds.room || '';
    const roomName = roomKey ? roomKey.charAt(0).toUpperCase() + roomKey.slice(1) : '';

    asOpen();
    AS.currentTask = {
      room: roomKey,
      roomName,
      task: {
        name: ds.name || '',
        lastCleaned: ds.last || '',
        frequency: ds.frequency || '',
        effort: ds.effort || 'moderate'
      }
    };
    asRenderStart();
    asShowReview();
    closeCard(card);
    return;
  }

  // Toggle open/close when clicking the card
  card.classList.contains('open') ? closeCard(card) : openCard(card);
});


  const backBtn    = document.getElementById('roomScreenBack');
  const progFill   = document.getElementById('roomProgressFill');
  const progPctEl  = document.getElementById('roomProgressPct');
  const progLabel  = document.getElementById('roomProgressLabel');

  const sortBtn    = document.getElementById('roomSortBtn');
  const sortMenu   = document.getElementById('roomSortMenu');
  const dropdown   = sortBtn?.closest('.dropdown');


  // wire: clicking room cards opens this screen
// ✅ ONE listener on the grid that works for all current/future cards
(function bindRoomsGridClicks() {
  const grid = document.querySelector('.rooms-grid');
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.room-card');
    if (!card || card.classList.contains('add-room-card')) return; // ignore the Add card

    const roomKey = card.getAttribute('data-room');
    if (roomKey && window.openRoomScreen) {
      window.openRoomScreen(roomKey);
    }
  });
})();


  // back to Rooms tab
  backBtn.addEventListener('click', () => {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('rooms-content').classList.add('active');
    // also set Rooms tab button active
    const roomsTabBtn = document.querySelector('.tab[data-tab="rooms"]');
    if (roomsTabBtn) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      roomsTabBtn.classList.add('active');
    }
  });

  // sort dropdown behavior (reuse your style)
  if (sortBtn && dropdown) {
    sortBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    sortMenu.querySelectorAll('div[data-sort]').forEach(item => {
      item.addEventListener('click', () => {
        roomSort = item.getAttribute('data-sort');
        sortBtn.textContent = 'Sort by ⌄'; // keep label
        dropdown.classList.remove('open');
        // re-render with new sort
        const currentRoom = screenEl.dataset.roomKey;
        if (currentRoom) renderRoomScreen(currentRoom);
      });
    });
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) dropdown.classList.remove('open');
    });
  }

  // expose open function (so you can call from elsewhere if needed)
  window.openRoomScreen = openRoomScreen;

  function openRoomScreen(roomKey) {
    screenEl.dataset.roomKey = roomKey;
    titleEl.textContent = roomKey.charAt(0).toUpperCase() + roomKey.slice(1);

      // 👉 Show the unique image (or placeholder)

    setRoomImage(roomKey);

    // switch tabs: show this screen
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    screenEl.classList.add('active');

    renderRoomScreen(roomKey);
  }

  function renderRoomScreen(roomKey) {
    const tasksForRoom = collectRoomTasks(roomKey);
  
    // average remaining% across tasks
    const pctArray = tasksForRoom.map(t => computeProgressPercent(t.lastCleaned, t.frequency));
    const avg = pctArray.length ? Math.round(pctArray.reduce((a,b)=>a+b,0)/pctArray.length) : 0;
    const colorClass = progressColorClass(avg); // 'progress-green' | 'progress-yellow' | 'progress-red'
  
    // fill progress UI (bar + fill use the same color class)
    const barEl = progFill.parentElement; // .progress-bar
    barEl.classList.remove('progress-green','progress-yellow','progress-red');
    barEl.classList.add(colorClass);
  
    progFill.classList.remove('progress-green','progress-yellow','progress-red');
    progFill.classList.add(colorClass);
    progFill.style.width = `${avg}%`;
  
    // hide/remove the text above the bar
    progPctEl.textContent = '';
    progLabel.textContent = '';
  
    // sort + render list
    const sorted = sortTasks(tasksForRoom, roomSort);
    listEl.innerHTML = renderTasks(sorted, roomKey);
    listEl.querySelectorAll('.task-item').forEach(c => {
      c.classList.remove('open');
      c.setAttribute('aria-expanded','false');
      c.querySelector('.task-actions')?.setAttribute('aria-hidden','true');
    });
    if (typeof closeCard === 'function' && typeof openCardRef !== 'undefined' && openCardRef) {
      closeCard(openCardRef);
    }
  }
  

  function collectRoomTasks(roomKey) {
    const tasks = [];
    Object.keys(taskData).forEach(dayKey => {
      const list = (taskData[dayKey] && taskData[dayKey][roomKey]) || [];
      list.forEach(t => tasks.push({ ...t, _day: dayKey.toUpperCase() }));
    });
    return tasks;
  }

  function sortTasks(arr, mode) {
    const EFFORT_ORDER = { low: 1, moderate: 2, high: 3 };
    const copy = arr.slice();

    if (mode === 'effort-asc' || mode === 'effort-desc') {
      copy.forEach(t => { if (!t.effort) t.effort = 'moderate'; });
      copy.sort((a,b) => {
        const av = EFFORT_ORDER[a.effort] || 2;
        const bv = EFFORT_ORDER[b.effort] || 2;
        return mode === 'effort-asc' ? av - bv : bv - av;
      });
      return copy;
    }

    // default: urgency (due first) -> smaller remaining% means more due
    copy.sort((a,b) => {
      const pa = computeProgressPercent(a.lastCleaned, a.frequency);
      const pb = computeProgressPercent(b.lastCleaned, b.frequency);
      return pa - pb;
    });
    return copy;
  }

  function renderTasks(tasks, roomKey) {
    if (!tasks.length) {
      return `<p style="color:#666;margin-top:8px;">No tasks found for this room.</p>`;
    }
  
    return tasks.map(t => {
      const pct = Math.max(0, Math.min(100, Number(computeProgressPercent(t.lastCleaned, t.frequency) || 0)));
      const colorClass = progressColorClass(pct);
      const status =
        pct <= 10 ? 'Overdue!' :
        pct <= 33 ? 'Uh oh...' :
        pct <= 66 ? 'Getting dusty...' :
        'Looking good!';
  
      // NOTE: same structure/classes as Tasks-by-day cards (task-main + task-actions overlay)
      return `
      <div class="task-item"
           role="group" aria-expanded="false"
           data-room="${roomKey || ''}"
           data-day="${t._day || ''}"
           data-name="${t.name || ''}"
           data-last="${t.lastCleaned || ''}"
           data-frequency="${t.frequency || ''}"
           data-effort="${t.effort || 'moderate'}">
  
        <div class="task-main">
          <div class="tm-row">
            <div class="tm-text">
              <div class="tm-title">${t.name}</div>
              <div class="tm-sub">cleaned ${t.lastCleaned || '—'} ago</div>
            </div>
  
            <div class="tm-progress">
            <div class="tm-track ${colorClass}">
              <div class="tm-fill ${colorClass}" style="width:${pct}%;"></div>
            </div>
            <div class="tm-status">${status}</div>
            ${renderEffortDots(t.effort)}   <!-- ⬅️ same container -->
          </div>
          
          </div>
  

        </div>
  
        <div class="task-actions" aria-hidden="true">
          <button class="ta-back"  aria-label="Back">‹</button>
          <button class="ta-done"  aria-label="Mark Done">✔<span>Mark Done!</span></button>
          <button class="ta-focus" aria-label="Focus">⌛<span>Focus</span></button>
          <button class="ta-edit"  aria-label="Edit">✎<span>Edit</span></button>
        </div>
      </div>`;
    }).join('');
  }
  
  
  
  
})();

function setRoomImage(roomKey) {
  const slot = document.getElementById('roomImageSlot');
  if (!slot) return;

  const src = ROOM_IMAGES[roomKey];
  const emoji = roomData?.[roomKey]?.emoji || '🏠';

  // Clear old content
  slot.innerHTML = '';

  if (!src) {
    // Fallback to emoji placeholder
    slot.innerHTML = `<div class="room-image-placeholder">${emoji}</div>`;
    return;
  }

  const img = new Image();
  img.alt = `${roomKey} image`;
  img.onload = () => {
    slot.innerHTML = '';
    slot.appendChild(img);
  };
  img.onerror = () => {
    slot.innerHTML = `<div class="room-image-placeholder">${emoji}</div>`;
  };
  img.src = src;
}

// const imageUrl = (prompt('Optional: Enter an image URL for this room') || '').trim();
// if (imageUrl) {
//   ROOM_IMAGES[key] = imageUrl;
// }

// ===== One-time Page 2 state =====
let oneTimePage2Built = false;
let oneTimeStartTime = '10AM';
let oneTimeEndTime   = '1PM';

function buildOneTimePage2Once() {
  if (oneTimePage2Built) return;
  oneTimePage2Built = true;

  const monthSel = document.getElementById('oneTimeDoMonth');
  const daySel   = document.getElementById('oneTimeDoDay');
  const yearSel  = document.getElementById('oneTimeDoYear');

  // Populate months
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  months.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = i + 1;
    opt.textContent = m;
    monthSel.appendChild(opt);
  });

  // Years (current → +3)
  const now = new Date();
  const yStart = now.getFullYear();
  for (let y = yStart; y <= yStart + 3; y++) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSel.appendChild(opt);
  }

  // Days (depends on month/year)
  function daysInMonth(y, mIndex1) {
    return new Date(y, mIndex1, 0).getDate(); // mIndex1 is 1-based
  }
  function fillDays() {
    const y = parseInt(yearSel.value || yStart, 10);
    const m = parseInt(monthSel.value || (now.getMonth()+1), 10);
    const n = daysInMonth(y, m);
    const prev = parseInt(daySel.value || 1, 10);

    daySel.innerHTML = '';
    for (let d = 1; d <= n; d++) {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = String(d).padStart(2, '0');
      daySel.appendChild(opt);
    }
    daySel.value = Math.min(prev, n);
  }

  // Defaults = today
  monthSel.value = (now.getMonth() + 1);
  yearSel.value  = now.getFullYear();
  fillDays();
  daySel.value = now.getDate();

  monthSel.addEventListener('change', fillDays);
  yearSel.addEventListener('change', fillDays);

  // All Day toggle wiring
  const allDay     = document.getElementById('oneTimeAllDay');
  const freeBlock  = document.getElementById('oneTimeFreeBlock');
  const startRow   = document.getElementById('oneTimeStartRow');
  const endRow     = document.getElementById('oneTimeEndRow');

  function updateTimeDisabledUI(disabled) {
    freeBlock.disabled = disabled;
    startRow.classList.toggle('disabled', disabled);
    endRow.classList.toggle('disabled', disabled);
  }
  allDay.addEventListener('change', () => updateTimeDisabledUI(allDay.checked));
  updateTimeDisabledUI(false); // initial

  // Simple time prompt pickers (swap later for a real picker if you want)
  function pickTime(initial) {
    const v = prompt('Enter time (e.g., 9:00 AM, 2:30 PM):', initial);
    return (v && v.trim()) ? v.trim().toUpperCase() : initial;
  }

  const startVal = document.getElementById('oneTimeStartVal');
  const endVal   = document.getElementById('oneTimeEndVal');

  startRow.addEventListener('click', () => {
    oneTimeStartTime = pickTime(oneTimeStartTime);
    startVal.textContent = oneTimeStartTime;
  });

  endRow.addEventListener('click', () => {
    oneTimeEndTime = pickTime(oneTimeEndTime);
    endVal.textContent = oneTimeEndTime;
  });

  // Footer buttons
  document.getElementById('oneTimePrevBtn')?.addEventListener('click', () => gotoOneTimePage(1));
  document.getElementById('oneTimeCreateBtn')?.addEventListener('click', () => {
    // Collect all Page 1 + Page 2 data (minimal example)
    const selectedEffort = document.querySelector('#oneTimeTaskModal .effort-option.selected')?.getAttribute('data-level') || 'low';
    const data = {
      room:  document.getElementById('oneTimeTaskRoom').value,
      task:  document.getElementById('oneTimeTaskName').value,
      notes: document.getElementById('oneTimeTaskNotes').value,
      effort: selectedEffort,
      date: {
        year:  parseInt(yearSel.value, 10),
        month: parseInt(monthSel.value, 10),
        day:   parseInt(daySel.value, 10),
      },
      time: {
        allDay: document.getElementById('oneTimeAllDay').checked,
        freeBlock: document.getElementById('oneTimeFreeBlock').value.trim(),
        start: oneTimeStartTime,
        end:   oneTimeEndTime
      }
    };
    console.log('Create one-time task:', data);
    alert('One-time task created!');
    closeOneTimeModal();
  });
}

// Hook into your existing pager so Page 2 builds when first shown
const _origGoto = gotoOneTimePage;
gotoOneTimePage = function(n) {
  _origGoto(n);
  if (n === 2) buildOneTimePage2Once();
};

let dayRangeExpanded = false; // false = 1 week, true = 3 weeks



function updateExpandIcon() {
  const expandBtn = document.querySelector('.expand-icon');
  if (!expandBtn) return;
  // your CSS sets ↕ by default; switch to ↔ in expanded if you like:
  expandBtn.textContent = dayRangeExpanded ? '↔' : '↕';
}

function renderDaySelector() {
  const container = document.querySelector('.day-selector');
  if (!container) return;

  // Preserve (or create) the expand button
  let expandBtn = container.querySelector('.expand-icon');
  if (!expandBtn) {
    expandBtn = document.createElement('button');
    expandBtn.className = 'expand-icon';
    expandBtn.type = 'button';
    expandBtn.setAttribute('aria-label', 'Expand/collapse day range');
  }

  // Build wrapper + days
  const wrapper = document.createElement('div');
  wrapper.className = 'days-wrapper';

  // Base date example (your prior anchor)
  const baseDate = new Date(2023, 11, 7); // Thu Dec 7, 2023
  const range = dayRangeExpanded ? 21 : 7;

  for (let i = 0; i < range; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);

    const dayAbbr = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const dayNum = d.getDate();

    const el = document.createElement('div');
    el.className = 'day-item';
    el.dataset.day = `${dayAbbr.toLowerCase()}-${dayNum}`;
    el.innerHTML = `
      <p class="day-abbr">${dayAbbr}</p>
      <p class="day-abbr">${String(dayNum).padStart(2,'0')}</p>
    `;
    wrapper.appendChild(el);
  }

  // Rebuild container contents
  container.innerHTML = '';
  container.appendChild(wrapper);
  container.appendChild(expandBtn);

  // CLICK: expand/collapse (bind to the live button we just appended)
  expandBtn.onclick = (ev) => {
    ev.preventDefault();
    ev.stopPropagation(); // avoid being eaten by parent listeners
    dayRangeExpanded = !dayRangeExpanded;
    renderDaySelector();  // rebuild with new range
  };

  // Apply collapsed/expanded classes for your CSS
  container.classList.toggle('expanded', dayRangeExpanded);
  container.classList.toggle('collapsed', !dayRangeExpanded);

  // Default select first day and load tasks
  const first = wrapper.querySelector('.day-item');
  if (first) {
    first.classList.add('active');
    currentDay = first.dataset.day;
    updateTasksForDay(currentDay);
  }

  updateExpandIcon();
}

document.addEventListener('DOMContentLoaded', () => {
  renderDaySelector();

  // Day click handling (delegated to wrapper)
  const sel = document.querySelector('.day-selector');
  sel?.addEventListener('click', (e) => {
    const item = e.target.closest('.day-item');
    if (item) {
      sel.querySelectorAll('.day-item').forEach(d => d.classList.remove('active'));
      item.classList.add('active');
      currentDay = item.dataset.day;
      updateTasksForDay(currentDay);
      return;
    }
    if (e.target.closest('.expand-icon')) {
      dayRangeExpanded = !dayRangeExpanded;
      renderDaySelector();
    }
  });
});




function activateTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-tab') === tabName);
  });
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.toggle('active', c.id === `${tabName}-content`);
  });
  currentTab = tabName;
}


// On load, respect hash (#rooms) or query (?tab=rooms)
const paramTab = new URLSearchParams(location.search).get('tab');
const hashTab = location.hash ? location.hash.slice(1) : '';
const initialTab = (paramTab === 'rooms' || hashTab === 'rooms') ? 'rooms' : 'tasks';
activateTab(initialTab);

// (Optional) react if hash changes later
window.addEventListener('hashchange', () => {
  const h = location.hash.slice(1);
  if (h === 'rooms' || h === 'tasks') activateTab(h);
});

// ===== AUTO-SANITIZE =====
const AS = {
  modal: null,
  page: 'start',
  timerSecs: 30 * 60, // default 30 min
  remaining: 30 * 60,
  interval: null,
  paused: false,
  currentTask: null,  // { room, task }
};

function asFormat(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function asGoto(page) {
  AS.page = page;
  AS.modal.querySelectorAll('.modal-page').forEach(pg => {
    pg.classList.toggle('is-active', pg.getAttribute('data-page') === page);
  });
}

function asOpen() {
  if (!AS.modal) AS.modal = document.getElementById('autoSanitizeModal');
  if (!AS.modal) return;

  // pick first low-effort task (prefer current day; fallback all days)
  AS.currentTask = asPickLowEffort();
  asRenderStart();
  AS.modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  asGoto('start');
}

function asClose() {
  if (!AS.modal) return;
  asStopTimer(true);
  AS.modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

function asRenderStart() {
  const title = document.getElementById('asTaskTitle');
  const meta  = document.getElementById('asTaskMeta');
  const begin = document.getElementById('asBeginBtn');

  if (!AS.currentTask) {
    title.textContent = 'No low-effort tasks found';
    meta.textContent = 'Try rescheduling overdue tasks instead.';
    begin.disabled = true;
  } else {
    title.textContent = `${AS.currentTask.task.name} — ${AS.currentTask.roomName}`;
    meta.textContent  = `${AS.currentTask.task.frequency || ''} • ${AS.currentTask.task.lastCleaned || ''}`;
    begin.disabled = false;
  }

  AS.timerSecs = 30*60;
  AS.remaining = AS.timerSecs;
  begin.textContent = `Begin`;
}

function asPickLowEffort() {
  const dayKey = currentDay || Object.keys(taskData)[0];
  const collect = (keys) => {
    const out = [];
    keys.forEach(k => {
      const rooms = taskData[k] || {};
      Object.keys(rooms).forEach(room => {
        (rooms[room]||[]).forEach(t => {
          const eff = (t.effort || 'moderate').toLowerCase();
          const pct = computeProgressPercent(t.lastCleaned, t.frequency);
          // treat "low" effort and due-ish tasks as quick wins
          if (eff === 'low' || pct <= 33) {
            out.push({ room, roomName: room.charAt(0).toUpperCase()+room.slice(1), task: t, day: k });
          }
        });
      });
    });
    return out;
  };

  function asPickLowEffortInRoom(roomKey) {
    const rows = [];
    Object.keys(taskData).forEach(dayKey => {
      const tasks = (taskData[dayKey] && taskData[dayKey][roomKey]) || [];
      tasks.forEach(t => {
        const eff = (t.effort || 'moderate').toLowerCase();
        const pct = computeProgressPercent(t.lastCleaned, t.frequency);
        if (eff === 'low' || pct <= 33) {
          rows.push({
            room: roomKey,
            roomName: roomKey.charAt(0).toUpperCase() + roomKey.slice(1),
            task: t,
            day: dayKey
          });
        }
      });
    });
    rows.sort((a, b) => {
      const pa = computeProgressPercent(a.task.lastCleaned, a.task.frequency);
      const pb = computeProgressPercent(b.task.lastCleaned, b.task.frequency);
      const ea = (a.task.effort || 'moderate') === 'low' ? 0 : 1;
      const eb = (b.task.effort || 'moderate') === 'low' ? 0 : 1;
      return (pa - pb) || (ea - eb);
    });
    return rows[0] || null;
  }
  

  // prefer current day; then all
  let list = collect([dayKey]);
  if (!list.length) list = collect(Object.keys(taskData));

  // sort by "due first", then low effort
  list.sort((a,b)=>{
    const pa = computeProgressPercent(a.task.lastCleaned, a.task.frequency);
    const pb = computeProgressPercent(b.task.lastCleaned, b.task.frequency);
    const ea = (a.task.effort||'moderate')==='low' ? 0:1;
    const eb = (b.task.effort||'moderate')==='low' ? 0:1;
    return (pa - pb) || (ea - eb);
  });

  return list[0] || null;
}

// ----- Time Picker (trio) -----
function asBuildTimeListsOnce() {
  const H = document.getElementById('asHourList');
  const M = document.getElementById('asMinuteList');
  const S = document.getElementById('asSecondList');
  if (!H || H.dataset.built) return;
  for (let i=0;i<=12;i++){ const el=document.createElement('div'); el.className='picker-item'; el.dataset.hour=i; el.textContent=String(i).padStart(2,'0'); H.appendChild(el); }
  for (let i=0;i<60;i++){ const el=document.createElement('div'); el.className='picker-item'; el.dataset.minute=i; el.textContent=String(i).padStart(2,'0'); M.appendChild(el); }
  for (let i=0;i<60;i++){ const el=document.createElement('div'); el.className='picker-item'; el.dataset.second=i; el.textContent=String(i).padStart(2,'0'); S.appendChild(el); }
  H.dataset.built = M.dataset.built = S.dataset.built = '1';

  // click to select + center
  function mark(listSel, attr, val){
    const list = document.querySelector(listSel);
    list.querySelectorAll('.picker-item').forEach(i=>i.classList.toggle('selected', String(i.dataset[attr])===String(val)));
  }
  function center(scrollSel, itemSel){
    const sc = document.querySelector(scrollSel), it = document.querySelector(itemSel);
    if(!sc||!it) return; sc.scrollTop = it.offsetTop - (sc.clientHeight/2) + (it.offsetHeight/2);
  }
  function snapInstall(scrollSel, itemSel, attr, on) {
    const sc = document.querySelector(scrollSel);
    let t; sc.addEventListener('scroll', ()=>{
      clearTimeout(t); t = setTimeout(()=>{
        const items = [...document.querySelectorAll(itemSel)];
        const mid = sc.getBoundingClientRect().top + sc.clientHeight/2;
        let best=null,bd=1e9;
        for(const it of items){ const r=it.getBoundingClientRect(); const d=Math.abs((r.top+r.height/2)-mid); if(d<bd){bd=d;best=it;} }
        if(best){
          sc.scrollTo({ top: best.offsetTop - (sc.clientHeight/2) + (best.offsetHeight/2), behavior:'smooth' });
          mark(itemSel, attr, best.dataset[attr]); on(parseInt(best.dataset[attr],10));
        }
      }, 90);
    });
  }

  // click handlers
  H.addEventListener('click', e=>{
    const it=e.target.closest('.picker-item'); if(!it) return;
    mark('#asHourList .picker-item','hour',it.dataset.hour);
    center('#asHourScroll', `#asHourList .picker-item[data-hour="${it.dataset.hour}"]`);
  });
  M.addEventListener('click', e=>{
    const it=e.target.closest('.picker-item'); if(!it) return;
    mark('#asMinuteList .picker-item','minute',it.dataset.minute);
    center('#asMinuteScroll', `#asMinuteList .picker-item[data-minute="${it.dataset.minute}"]`);
  });
  S.addEventListener('click', e=>{
    const it=e.target.closest('.picker-item'); if(!it) return;
    mark('#asSecondList .picker-item','second',it.dataset.second);
    center('#asSecondScroll', `#asSecondList .picker-item[data-second="${it.dataset.second}"]`);
  });

  // snap on scroll stop
  snapInstall('#asHourScroll',   '#asHourList .picker-item',   'hour',   v=>AS._h=v);
  snapInstall('#asMinuteScroll', '#asMinuteList .picker-item', 'minute', v=>AS._m=v);
  snapInstall('#asSecondScroll', '#asSecondList .picker-item', 'second', v=>AS._s=v);
}

function asOpenTimePicker(defaultSecs){
  AS._h = Math.floor(defaultSecs/3600);
  AS._m = Math.floor((defaultSecs%3600)/60);
  AS._s = defaultSecs%60;

  asBuildTimeListsOnce();

  // mark & center defaults
  ['hour','minute','second'].forEach(kind=>{
    const val = kind==='hour'?AS._h:kind==='minute'?AS._m:AS._s;
    const listSel = kind==='hour'?'#asHourList':'#asMinuteList';
    const scrollSel = kind==='hour'?'#asHourScroll':'#asMinuteScroll';
    const itemSel = kind==='hour'?`#asHourList .picker-item[data-hour="${val}"]`:
                    kind==='minute'?`#asMinuteList .picker-item[data-minute="${val}"]`:
                                     `#asSecondList .picker-item[data-second="${val}"]`;
    const attr = kind==='hour'?'hour':kind==='minute'?'minute':'second';
    document.querySelectorAll(`${listSel} .picker-item`).forEach(i=>i.classList.remove('selected'));
    const target = document.querySelector(itemSel);
    if (target) {
      target.classList.add('selected');
      const scSel = kind==='hour'?scrollSel:kind==='minute'?scrollSel:'#asSecondScroll';
      const sc = document.querySelector(scSel);
      sc.scrollTop = target.offsetTop - (sc.clientHeight/2) + (target.offsetHeight/2);
    }
  });

  asGoto('time');
}


function asStopTimer(hard){
  if (AS.interval) { clearInterval(AS.interval); AS.interval = null; }
  if (hard) { AS.remaining = AS.timerSecs; AS.paused = false; }
}



// ----- Overdue rescheduler -----
function asListOverdue() {
  const rows = [];
  Object.keys(taskData).forEach(day=>{
    Object.entries(taskData[day]||{}).forEach(([room, tasks])=>{
      (tasks||[]).forEach(t=>{
        const pct = computeProgressPercent(t.lastCleaned, t.frequency);
        if (pct <= 10) {
          rows.push({ day, room, roomName: room.charAt(0).toUpperCase()+room.slice(1), t });
        }
      });
    });
  });
  return rows;
}

function asRenderOverdue() {
  const host = document.getElementById('asOverdueList');
  host.innerHTML = '';
  const rows = asListOverdue();
  if (!rows.length) {
    host.innerHTML = '<p class="muted">No overdue tasks 🎉</p>';
    return;
  }

  rows.forEach((row, idx)=>{
    const wrap = document.createElement('div');
    wrap.className = 'overdue-item';
    wrap.innerHTML = `
      <button class="overdue-head" aria-expanded="false">
        <span>${row.t.name} — ${row.roomName}</span>
        <span class="muted">${row.t.lastCleaned || ''}</span>
      </button>
      <div class="overdue-body" hidden>
        <div class="date-grid" style="margin:8px 0;">
          <select class="dropdown-select as-month"></select>
          <select class="dropdown-select as-day"></select>
          <select class="dropdown-select as-year"></select>
        </div>
        <button class="row row-nav as-time-row">
          <span>Time</span>
          <span class="row-value as-time-val">10:00 AM</span>
        </button>
      </div>
    `;
    host.appendChild(wrap);

    // expand/collapse
    const head = wrap.querySelector('.overdue-head');
    const body = wrap.querySelector('.overdue-body');
    head.addEventListener('click', ()=>{
      const open = body.hasAttribute('hidden');
      body.toggleAttribute('hidden', !open);
      head.setAttribute('aria-expanded', String(open));
      if (open) asBuildDatePickers(wrap);
    });

    // simple time prompt (you can reuse your inline picker if you prefer)
    wrap.querySelector('.as-time-row').addEventListener('click', ()=>{
      const v = prompt('Pick a time (e.g., 2:30 PM)', wrap.querySelector('.as-time-val').textContent);
      if (v && v.trim()) wrap.querySelector('.as-time-val').textContent = v.trim().toUpperCase();
    });
  });
}

function asBuildDatePickers(scopeEl){
  const monthSel = scopeEl.querySelector('.as-month');
  const daySel   = scopeEl.querySelector('.as-day');
  const yearSel  = scopeEl.querySelector('.as-year');
  if (!monthSel || monthSel.options.length) return;

  const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  months.forEach((m,i)=>{ const o=document.createElement('option'); o.value=i+1;o.textContent=m; monthSel.appendChild(o); });

  const now = new Date();
  for(let y=now.getFullYear(); y<=now.getFullYear()+1; y++){
    const o = document.createElement('option'); o.value=y; o.textContent=y; yearSel.appendChild(o);
  }
  yearSel.value = String(now.getFullYear()); monthSel.value = String(now.getMonth()+1);

  function daysInMonth(y,m){ return new Date(y,m,0).getDate(); }
  function fillDays(){
    const y=parseInt(yearSel.value||now.getFullYear(),10);
    const m=parseInt(monthSel.value||now.getMonth()+1,10);
    const n=daysInMonth(y,m);
    daySel.innerHTML='';
    for(let d=1; d<=n; d++){
      const o=document.createElement('option'); o.value=d; o.textContent=String(d).padStart(2,'0'); daySel.appendChild(o);
    }
    daySel.value = String(Math.min(now.getDate(), n));
  }
  monthSel.addEventListener('change', fillDays);
  yearSel.addEventListener('change', fillDays);
  fillDays();
}

// Add to AS:
AS.mode = 'work';               // 'work' | 'break'
AS.workRemaining = 0;           // stores remaining secs when you start a break
AS.breakLengthSecs = 5 * 60;    // 5-minute default


// ----- Wire UI -----
document.addEventListener('DOMContentLoaded', () => {
  // Hook your existing "Shuffle" button to open Auto-Sanitize
  const shuffleBtn = document.querySelector('.shuffle-btn');
  if (shuffleBtn) {
    shuffleBtn.replaceWith(shuffleBtn.cloneNode(true));
  }
  const freshShuffle = document.querySelector('.shuffle-btn');
  if (freshShuffle) {
    freshShuffle.addEventListener('click', (e)=>{
      e.preventDefault();
      asOpen();
    });
  }

  // Modal buttons
  const modal = document.getElementById('autoSanitizeModal');
  if (!modal) return;

  // Close / Back
  document.getElementById('asCloseBtn')?.addEventListener('click', asClose);
  document.getElementById('asBackBtn')?.addEventListener('click', () => {
    if (AS.page === 'review') { asGoto('start'); return; }
    if (AS.page === 'timer')  { asGoto('start'); asStopTimer(true); return; }
    // keep your other cases (done/resched) as you already had
  });

// Start page -> Review (default to 30:00)
document.getElementById('asBeginBtn')?.addEventListener('click', () => {
  if (!AS.timerSecs) AS.timerSecs = 30 * 60; // default
  asShowReview();                              // <- activates review page
});

document.getElementById('asReviewEdit')?.addEventListener('click', () => {
  asOpenTimePopup(AS.timerSecs || 30*60);      // mini popup
});

document.getElementById('asReviewBegin')?.addEventListener('click', () => {
  AS.timerSecs = Math.max(5, AS.timerSecs || 30*60);
  asStartTimer(AS.timerSecs);                  // -> timer page
});

  // Mini popup: save/cancel/close
document.getElementById('asTimePopupSave')?.addEventListener('click', () => {
  const secs = Math.max(5, readPopupSecs() || 30*60);
  AS.timerSecs = secs;
  asCloseTimePopup();
  asShowReview(); // refresh labels (Begin (xx:yy), Timer set to xx:yy)
});

document.getElementById('asTimePopupCancel')?.addEventListener('click', asCloseTimePopup);
document.getElementById('asTimePopupClose')?.addEventListener('click', asCloseTimePopup);
document.getElementById('asTimePopup')?.addEventListener('click', (e) => {
  if (e.target.classList.contains('mini-backdrop')) asCloseTimePopup();
});

  document.getElementById('asTimeBack')?.addEventListener('click', () => {
    asGoto('start');
  });

  document.getElementById('asTimeBegin')?.addEventListener('click', () => {
    // Read the trio scroller selection; fall back to 30:00 if something’s unset
    const total =
      (Number(AS._h) || 0) * 3600 +
      (Number(AS._m) || 30) * 60 +
      (Number(AS._s) || 0);
  
    AS.timerSecs = Math.max(5, total);
    asStartTimer(AS.timerSecs);  // this will asGoto('timer')
  });

  const timeBeginBtn = document.getElementById('asTimeBegin');
const updateTimeBeginLabel = () => {
  const secs = (Number(AS._h)||0)*3600 + (Number(AS._m)||0)*60 + (Number(AS._s)||0);
  if (timeBeginBtn) timeBeginBtn.textContent = `Begin (${asFormat(secs || 1800)})`;
};
// Call updateTimeBeginLabel() after building the lists and inside your snap/click handlers for the trio


  document.getElementById('asGoToTime')?.addEventListener('click', () => {
    asOpenTimePicker(AS.timerSecs);   // builds lists & goes to data-page="time"
  });

  document.getElementById('asEditTimeBtn')?.addEventListener('click', ()=>{
    asOpenTimePicker(AS.timerSecs);
  });
  document.getElementById('asNoThanksBtn')?.addEventListener('click', ()=>{
    asRenderOverdue();
    asGoto('resched');
  });

  // Time page
  document.getElementById('asTimeCancel')?.addEventListener('click', ()=>asGoto('start'));
  document.getElementById('asTimeConfirm')?.addEventListener('click', ()=>{
    const total = (AS._h||0)*3600 + (AS._m||0)*60 + (AS._s||0);
    AS.timerSecs = Math.max(5, total || AS.timerSecs);
    asStartTimer(AS.timerSecs);
  });

  // Timer page
// When starting a timer, ensure not on break and label is reset

// Rebind break button cleanly to start a 5-min break
(function bindBreakButton() {
  const btn = document.getElementById('asBreakBtn');
  if (!btn) return;

  // Nuke any old listeners by cloning
  const fresh = btn.cloneNode(true);
  btn.replaceWith(fresh);

  fresh.addEventListener('click', () => {
    AS.workRemaining = AS.remaining || AS.timerSecs || 30*60;   // save current work time
    asStartTimer(AS.breakLengthSecs || 5*60, 'break');          // start the break NOW
  });
})();





// Take a break toggle (under the timer)

// Reset keeps you on the timer page and exits break mode
// document.getElementById('asResetBtn')?.addEventListener('click', () => {
//   AS.remaining = AS.timerSecs;
//   AS.paused = false;
//   const breakBtn = document.getElementById('asBreakBtn');
//   if (breakBtn) breakBtn.textContent = 'Take a break';
//   asTickRender();
// });

  document.getElementById('asFinishBtn')?.addEventListener('click', ()=>{
    asStopTimer(false);
    asGoto('done');
  });

  // Done page


  const celebrate = () => {
    AS.currentTask = asPickLowEffort();
    asRenderStart();
    asGoto('start');
  };
  
  document.getElementById('asCelebrateBtn')?.addEventListener('click', celebrate);
  
  // (Optional safety if any old markup still has asAnotherBtn)
  document.getElementById('asAnotherBtn')?.addEventListener('click', celebrate);
  

  // Rescheduler page
  document.getElementById('asReschedDone')?.addEventListener('click', ()=>{
    // (Here you'd persist date/time changes if storing)
    asClose();
    // ensure Tasks tab is visible
    const tasksTabBtn = document.querySelector('.tab[data-tab="tasks"]');
    if (tasksTabBtn) tasksTabBtn.click();
  });

  // Deep link: tasks.html#as=review or ?as=review
const wantsReview = location.hash.includes('as=review') ||
new URLSearchParams(location.search).get('as') === 'review';
if (wantsReview) {
activateTab('tasks');  // ensure Tasks tab is visible
asOpen();              // open Auto-Sanitize modal
asShowReview();        // go straight to Review
}


  
});

// document.addEventListener('DOMContentLoaded', () => {
//   const wantsReview = location.hash.includes('as=review') ||
//                       new URLSearchParams(location.search).get('as') === 'review';
//   if (wantsReview) {
//     activateTab('tasks');  // ensure Tasks tab is visible
//     asOpen();              // open Auto-Sanitize modal
//     asShowReview();        // go straight to the Review page
//   }
// });

document.addEventListener('DOMContentLoaded', () => {
  const pane = document.getElementById('tasks-for-day');
pane.addEventListener('click', (e) => {
  const card = e.target.closest('.task-item');
  if (!card) return;

  // tray buttons
  if (e.target.closest('.ta-back')) { closeCard(card); return; }
  if (e.target.closest('.ta-done')) { /* your done logic */ closeCard(card); return; }
  if (e.target.closest('.ta-focus')) {
    // Read details from the clicked card
    const ds = card.dataset;
    const roomKey  = ds.room || '';
    const roomName = roomKey ? roomKey.charAt(0).toUpperCase() + roomKey.slice(1) : '';
  
    // Open the modal, then override the picked task with THIS one
    asOpen();
    AS.currentTask = {
      room: roomKey,
      roomName,
      task: {
        name: ds.name || '',
        lastCleaned: ds.last || '',
        frequency: ds.frequency || '',
        effort: ds.effort || 'moderate'
      }
    };
  
    // Refresh UI and jump straight to Review
    asRenderStart();
    asShowReview();
  
    closeCard(card);
    return;
  }
  
  if (e.target.closest('.ta-edit'))  { /* edit logic */ closeCard(card); return; }

  // click the normal card to open/close
  if (card.classList.contains('open')) closeCard(card);
  else openCard(card);
});
  

  
});


function asStartTimer(totalSecs, mode = 'work', resumeRemaining = null) {
  if (!window.AS) window.AS = {};
  if (!AS.breakLengthSecs) AS.breakLengthSecs = 5 * 60;

  AS.mode = mode;
  AS.paused = false;

  if (AS.interval) { clearInterval(AS.interval); AS.interval = null; }

  if (mode === 'work') {
    AS.workRemaining = (typeof resumeRemaining === 'number')
      ? resumeRemaining
      : (totalSecs || AS.timerSecs || 30*60);
    AS.remaining = AS.workRemaining;
  } else {
    AS.remaining = AS.breakLengthSecs;
  }

  updateTimerUIForMode();
  asGoto('timer');

  // Initialize ring with the correct total for this mode
  const totalForRing = (mode === 'break') ? AS.breakLengthSecs : (AS.timerSecs || AS.workRemaining);
requestAnimationFrame(() => {
  asRingInit(totalForRing);
  bindPauseBtn();
  updatePauseBtnUI();        // ensure icon matches current pause state (running by default)
});

  asTickRender();  // paints the initial label & ring

  AS.interval = setInterval(() => {
    if (AS.paused) return;
    AS.remaining = Math.max(0, AS.remaining - 1);
    asTickRender();

    if (AS.remaining === 0) {
      clearInterval(AS.interval); AS.interval = null;
      if (AS.mode === 'work') asGoto('done');
      // break ends: wait for "I'm ready!" to resume work
    }
  }, 1000);
}


// ---- Review page helpers ----

function asShowReview() {
  const durEl = document.getElementById('asReviewDuration');
  if (durEl) durEl.textContent = asFormat(AS.timerSecs || 30*60);
  asGoto('review');                            // <- sets data-page="review" active
}


// ---- Mini popup time picker ----
let asPopupBuilt = false;
function asOpenTimePopup(defaultSecs) {
  const sheet = document.getElementById('asTimePopup');
  if (!sheet) return;
  // build lists once
  if (!asPopupBuilt) {
    const H = document.getElementById('asPHourList');
    const M = document.getElementById('asPMinuteList');
    const S = document.getElementById('asPSecondList');
    for (let i=0;i<=12;i++){ const el=document.createElement('div'); el.className='picker-item'; el.dataset.hour=i; el.textContent=String(i).padStart(2,'0'); H.appendChild(el); }
    for (let i=0;i<60;i++){ const el=document.createElement('div'); el.className='picker-item'; el.dataset.minute=i; el.textContent=String(i).padStart(2,'0'); M.appendChild(el); }
    for (let i=0;i<60;i++){ const el=document.createElement('div'); el.className='picker-item'; el.dataset.second=i; el.textContent=String(i).padStart(2,'0'); S.appendChild(el); }
    // click select
    H.addEventListener('click', e => { const it=e.target.closest('.picker-item'); if(!it) return; selectPopup('hour', +it.dataset.hour); });
    M.addEventListener('click', e => { const it=e.target.closest('.picker-item'); if(!it) return; selectPopup('minute', +it.dataset.minute); });
    S.addEventListener('click', e => { const it=e.target.closest('.picker-item'); if(!it) return; selectPopup('second', +it.dataset.second); });
    // snap-on-scroll (optional): keep simple for now
    asPopupBuilt = true;
  }
  // set initial selection
  const h = Math.floor(defaultSecs/3600);
  const m = Math.floor((defaultSecs%3600)/60);
  const s = defaultSecs%60;
  selectPopup('hour', h, true);
  selectPopup('minute', m, true);
  selectPopup('second', s, true);

  sheet.hidden = false;
  sheet.setAttribute('aria-hidden', 'false');
  document.getElementById('asTimePopupClose')?.focus();
}
function asCloseTimePopup() {
  const sheet = document.getElementById('asTimePopup');
  if (!sheet) return;
  sheet.hidden = true;
  sheet.setAttribute('aria-hidden', 'true');
}
function selectPopup(kind, val, center=false){
  const listId = kind==='hour' ? 'asPHourList' : kind==='minute' ? 'asPMinuteList' : 'asPSecondList';
  const scrollId = kind==='hour' ? 'asPHourScroll' : kind==='minute' ? 'asPMinuteScroll' : 'asPSecondScroll';
  const list = document.getElementById(listId);
  const scroll = document.getElementById(scrollId);
  list.querySelectorAll('.picker-item').forEach(i => i.classList.toggle('selected', +i.dataset[kind] === val));
  const it = list.querySelector(`.picker-item[data-${kind}="${val}"]`);
  if (center && it && scroll) {
    scroll.scrollTop = it.offsetTop - (scroll.clientHeight/2) + (it.offsetHeight/2);
  }
  // stash selection on AS
  if (kind==='hour') AS._ph = val;
  if (kind==='minute') AS._pm = val;
  if (kind==='second') AS._ps = val;
}
function readPopupSecs(){
  return (Number(AS._ph)||0)*3600 + (Number(AS._pm)||0)*60 + (Number(AS._ps)||0);
}

function updateTimerUIForMode() {
  const breakBtn  = document.getElementById('asBreakBtn');
  const finishBtn = document.getElementById('asFinishBtn');
  if (!finishBtn) return;

  if (AS.mode === 'work') {
    if (breakBtn) breakBtn.style.display = '';
    finishBtn.textContent = 'I finished!';
    finishBtn.onclick = finishWork;
  } else {
    if (breakBtn) breakBtn.style.display = 'none';
    finishBtn.textContent = "I'm ready!";
    finishBtn.onclick = resumeWork;
  }
}

function resumeWork() {
  const resume = Math.max(1, AS.workRemaining || AS.timerSecs || 30*60);
  asStartTimer(resume, 'work', resume);
}
function finishWork() {
  if (AS.interval) { clearInterval(AS.interval); AS.interval = null; }
  asGoto('done');
}

function asTickRender() {
  const cd = document.getElementById('asCountdown');
  if (cd) cd.textContent = asFormat(AS.remaining || 0);

  const totalForRing = (AS.mode === 'break')
    ? AS.breakLengthSecs
    : (AS.timerSecs || RING.total);

  asRingUpdate(AS.remaining || 0, totalForRing, AS.mode);
}




(function wireBreakButton() {
  const old = document.getElementById('asBreakBtn');
  if (!old) return;
  // Remove ALL previous listeners by cloning
  const fresh = old.cloneNode(true);
  old.replaceWith(fresh);

  fresh.addEventListener('click', () => {
    // Save remaining work time and start a 5-min break
    AS.workRemaining = AS.remaining || AS.timerSecs || 30*60;
    asStartTimer(AS.breakLengthSecs || 5*60, 'break');
  });
})();


// Resume from break: restore previous remaining work time
function resumeWork() {
  const resume = Math.max(1, AS.workRemaining || 1);
  asStartTimer(resume, 'work', resume);
}

// Finish work
function finishWork() {
  if (AS.interval) { clearInterval(AS.interval); AS.interval = null; }
  asGoto('done');
}

// (Optional) Reset still works if you kept the button
document.getElementById('asResetBtn')?.addEventListener('click', () => {
  AS.paused = false;
  if (AS.mode === 'work') {
    asStartTimer(AS.timerSecs || AS.workRemaining || 30*60, 'work');
  } else {
    asStartTimer(AS.breakLengthSecs, 'break');
  }
});

// === Progress ring helpers ===


function updatePauseBtnUI() {
  const btn = document.getElementById('asPauseBtn');
  if (!btn) return;
  btn.classList.toggle('is-paused', !!AS.paused);
  btn.setAttribute('aria-pressed', AS.paused ? 'true' : 'false');
  btn.setAttribute('aria-label', AS.paused ? 'Resume' : 'Pause');
}

function bindPauseBtn() {
  const old = document.getElementById('asPauseBtn');
  if (!old) return;
  const fresh = old.cloneNode(true);         // nuke any old listeners
  old.replaceWith(fresh);
  fresh.addEventListener('click', () => {
    AS.paused = !AS.paused;                  // toggle pause state
    updatePauseBtnUI();
  });
}

const RING = { fg: null, c: 0, total: 1 };

function asRingInit(totalSecs) {
  const fg = document.querySelector('#autoSanitizeModal .ring-fg');
  if (!fg) return;
  const r = parseFloat(fg.getAttribute('r')) || 54;
  const c = 2 * Math.PI * r;
  fg.style.strokeDasharray = `${c} ${c}`;
  RING.fg = fg; RING.c = c; RING.total = Math.max(1, totalSecs || 1);
  asRingUpdate(AS.remaining ?? RING.total, RING.total, AS.mode);
}
function asRingUpdate(remaining, totalSecs, mode) {
  if (!RING.fg || !RING.c) return;
  const total = Math.max(1, totalSecs || RING.total);
  const frac = Math.max(0, Math.min(1, remaining / total));
  RING.fg.style.strokeDashoffset = `${RING.c * (1 - frac)}`;
  RING.fg.style.stroke = (mode === 'break') ? '#4db6ac' : '#1976d2';
}



let openCardRef = null;

function openCard(card) {
  if (openCardRef && openCardRef !== card) closeCard(openCardRef);
  card.classList.add('open');
  card.setAttribute('aria-expanded', 'true');
  card.querySelector('.task-actions')?.setAttribute('aria-hidden', 'false');
  openCardRef = card;
}

function closeCard(card) {
  card.classList.remove('open');
  card.setAttribute('aria-expanded', 'false');
  card.querySelector('.task-actions')?.setAttribute('aria-hidden', 'true');
  if (openCardRef === card) openCardRef = null;
}
document.addEventListener('DOMContentLoaded', () => {
  const tasksPane = document.getElementById('tasks-for-day');
tasksPane?.addEventListener('click', (e) => {
  const btn = e.target.closest('.room-toggle');
  if (!btn) return;

  const section = btn.closest('.room');
  const body = section.querySelector('.room-body');
  const willCollapse = !section.classList.contains('is-collapsed');

  if (willCollapse) {
    // COLLAPSE smoothly
    body.hidden = false;                             // make measurable
    body.style.maxHeight = body.scrollHeight + 'px'; // lock current height
    body.style.opacity = '1';
    body.getBoundingClientRect();                    // <-- flush layout
    body.style.maxHeight = '0px';
    body.style.opacity = '0';

    body.addEventListener('transitionend', function onEnd() {
      body.hidden = true;                            // semantic hide AFTER anim
      section.classList.add('is-collapsed');
      body.removeEventListener('transitionend', onEnd);
    }, { once: true });

  } else {
    // EXPAND smoothly
    section.classList.remove('is-collapsed');        // stop forcing 0
    body.hidden = false;
    body.style.maxHeight = '0px';
    body.style.opacity = '0';
    body.getBoundingClientRect();                    // <-- flush layout
    body.style.maxHeight = body.scrollHeight + 'px';
    body.style.opacity = '1';

    body.addEventListener('transitionend', function onEnd() {
      body.style.maxHeight = 'none';                 // free growth
      body.removeEventListener('transitionend', onEnd);
    }, { once: true });
  }

  btn.setAttribute('aria-expanded', String(!willCollapse));
  btn.setAttribute('aria-label', willCollapse ? 'Expand' : 'Collapse');
  btn.textContent = willCollapse ? 'v' : '^';
  setCollapsed(currentDay, section.dataset.room, willCollapse);
});

});

function bindAllShuffleButtons() {
  document.querySelectorAll('.shuffle-btn').forEach(btn => {
    const fresh = btn.cloneNode(true);   // strip old listeners
    btn.replaceWith(fresh);

    fresh.addEventListener('click', (e) => {
      e.preventDefault();

      // Are we on the Room Details screen?
      const roomScreen = document.getElementById('room-screen');
      const onRoomScreen = roomScreen && roomScreen.classList.contains('active');
      const roomKey = onRoomScreen ? (roomScreen.dataset.roomKey || '') : '';

      // Open AS modal
      asOpen();

      // Pick a task with context (room-scoped if on room screen)
      let picked = roomKey ? asPickLowEffortInRoom(roomKey) : asPickLowEffort();
      if (!picked) picked = asPickLowEffort();  // fallback global

      if (picked) {
        AS.currentTask = picked;
        asRenderStart();
        asShowReview();      // jump straight to Review
      }
    });
  });
}

// Call it once after the DOM is ready
document.addEventListener('DOMContentLoaded', bindAllShuffleButtons);
