const taskData = {
    thu: {
      bedroom: [
        { name: "Vacuum Floor", lastCleaned: "3 weeks ago", progress: 85, status: "Uh oh...", frequency: "Every week", progressType: "red", effort: "high" },
        { name: "Organize Closet", lastCleaned: "3 weeks ago", progress: 60, status: "Getting dusty...", frequency: "Every month", progressType: "yellow", effort: "moderate" }
      ],
      kitchen: [
        { name: "Clean Countertops", lastCleaned: "2 days ago", progress: 20, status: "Looking good!", frequency: "Every 3 days", progressType: "green", effort: "low" }
      ]
    },
    fri: {
      bedroom: [
        { name: "Make Bed", lastCleaned: "yesterday", progress: 30, status: "All good!", frequency: "Daily", progressType: "green", effort: "low" }
      ],
      kitchen: [
        { name: "Wash Dishes", lastCleaned: "this morning", progress: 10, status: "Fresh!", frequency: "Daily", progressType: "green", effort: "low" },
        { name: "Clean Stove", lastCleaned: "1 week ago", progress: 70, status: "Needs attention", frequency: "Weekly", progressType: "yellow", effort: "moderate" }
      ]
    },
    sat: {
      bedroom: [
        { name: "Change Sheets", lastCleaned: "2 weeks ago", progress: 80, status: "Time to wash!", frequency: "Every 2 weeks", progressType: "red", effort: "moderate" }
      ],
      kitchen: [
        { name: "Deep Clean Fridge", lastCleaned: "1 month ago", progress: 90, status: "Overdue!", frequency: "Monthly", progressType: "red", effort: "high" }
      ]
    }
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

let currentDay = 'thu';
let currentTab = 'tasks';
let floatingButtonsVisible = false;

// Recurring task state
let selectedNumber = 7; // Default to 7
let selectedUnit = 'days'; // Default to days
let selectedRepeat = 'On Monday';
let selectedTime = 'Time';

document.addEventListener('DOMContentLoaded', () => {
    // Tab functionality
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Tab clicked:', tab.getAttribute('data-tab'));
            
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show selected tab content
            const tabName = tab.getAttribute('data-tab');
            const targetContent = document.getElementById(tabName + '-content');
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            currentTab = tabName;
        });
    });

    // Day item functionality
    document.querySelectorAll('.day-item').forEach(day => {
        day.addEventListener('click', () => {
            console.log('Day clicked:', day.getAttribute('data-day'));
            
            // Remove active class from all day items
            document.querySelectorAll('.day-item').forEach(d => d.classList.remove('active'));
            // Add active class to clicked day
            day.classList.add('active');
            
            // Update tasks for selected day
            const selectedDay = day.getAttribute('data-day');
            currentDay = selectedDay;
            updateTasksForDay(selectedDay);
        });
    });

    // Room card functionality (for Rooms tab)
    document.querySelectorAll('.room-card-tab').forEach(roomCard => {
        roomCard.addEventListener('click', () => {
            console.log('Room clicked:', roomCard.getAttribute('data-room'));
            
            // Remove active class from all room cards
            document.querySelectorAll('.room-card-tab').forEach(r => r.classList.remove('active'));
            // Add active class to clicked room
            roomCard.classList.add('active');
            
            // Show tasks for selected room
            const selectedRoom = roomCard.getAttribute('data-room');
            showRoomTasks(selectedRoom);
        });
    });

    // Shuffle button functionality
    const shuffleBtn = document.querySelector('.shuffle-btn');
    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', () => {
            console.log('Shuffle clicked');
            shuffleBtn.style.transform = 'rotate(180deg)';
            setTimeout(() => {
                shuffleBtn.style.transform = 'rotate(0deg)';
            }, 300);
            
            // Show random task alert
            alert('Random task: Clean the bathroom mirror!');
        });
    }

    // Add task button with floating options
    const addTaskBtn = document.querySelector('.add-task');
    const taskOptions = document.getElementById('taskOptions');
    
    if (addTaskBtn && taskOptions) {
        addTaskBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Add task clicked');
            
            floatingButtonsVisible = !floatingButtonsVisible;
            
            if (floatingButtonsVisible) {
                // Show floating buttons
                taskOptions.classList.add('active');
                addTaskBtn.classList.add('expanded');
            } else {
                // Hide floating buttons
                taskOptions.classList.remove('active');
                addTaskBtn.classList.remove('expanded');
            }
        });
    }

    // Handle clicks on floating task option buttons
    document.querySelectorAll('.task-option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskType = btn.getAttribute('data-type');
            console.log('Task option clicked:', taskType);
            
            // Hide floating buttons
            taskOptions.classList.remove('active');
            addTaskBtn.classList.remove('expanded');
            floatingButtonsVisible = false;
            
            // Show appropriate modal
            if (taskType === 'one-time') {
                showOneTimeTaskModal();
            } else if (taskType === 'recurring') {
                showRecurringTaskModal();
            }
        });
    });

    // Close floating buttons when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (floatingButtonsVisible && !e.target.closest('.add-task') && !e.target.closest('.task-options')) {
            taskOptions.classList.remove('active');
            addTaskBtn.classList.remove('expanded');
            floatingButtonsVisible = false;
        }
    });

    // Initialize with current day's tasks
    updateTasksForDay(currentDay);
    
    // Setup modal event listeners
    setupModalEventListeners();
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
  
    const renderTask = (task) => {
      const pctRaw = computeProgressPercent(task.lastCleaned, task.frequency);
      const pct = Math.max(0, Math.min(100, Number(pctRaw || 0)));
      const colorClass = progressColorClass(pct);
      const status = statusFromPercent(pct);
      return `
        <div class="task-item">
          <div class="task-top">
            <div class="task-left">
              <p class="task-name">${task.name}</p>
              <p class="task-last">${task.lastCleaned||''}</p>
            </div>
            <div class="task-right">
              <p class="status-text">${status}</p>
              <div class="progress-bar ${colorClass}">
  <div class="progress-fill ${colorClass}" style="width:${pct}%"></div>
</div>
              ${renderEffortDots(task.effort)}
            </div>
          </div>
          <div class="task-frequency"><span>${task.frequency}</span></div>
        </div>`;
    };
  
    // ✅ rooms always alphabetical
    const roomsAZ = Object.keys(dayTasks).sort((a, b) => a.localeCompare(b));
  
    let html = '';
    roomsAZ.forEach(room => {
      const list = Array.isArray(dayTasks[room]) ? dayTasks[room] : [];
      const sorted = sortTasksInRoom(list);
      html += `<section class="room">
        <h2>${room.charAt(0).toUpperCase() + room.slice(1)}</h2>
        ${sorted.map(renderTask).join('')}
      </section>`;
    });
  
    tasksContainer.innerHTML = html || '<p style="text-align:center;color:#666;margin-top:40px;">No tasks scheduled for this day!</p>';
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
  const listEl     = document.getElementById('roomScreenTasks');
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
    listEl.innerHTML = renderTasks(sorted);
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

  function renderTasks(tasks) {
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
  
      return `
    <div class="room-task-card">
      <div class="task-top">
        <div class="task-left">
          <p class="room-task-name">${t.name}</p>
          <p class="task-last">${t.lastCleaned || ''}</p>
        </div>
        <div class="task-right">
          <p class="status-text">${status}</p>
          <div class="progress-bar ${colorClass}">
    <div class="progress-fill ${colorClass}" style="width:${pct}%"></div>
  </div>
          ${renderEffortDots(t.effort)}
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:12px;color:#666;">
        <span>${t.frequency || ''}</span>
        <span>${(t._day || '').toUpperCase()}</span>
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

const expandBtn = document.querySelector('.expand-icon');
expandBtn?.addEventListener('click', () => {
  dayRangeExpanded = !dayRangeExpanded;
  renderDaySelector(); // redraw the day items
  updateExpandIcon();  // flip the icon
});

function updateExpandIcon() {
  const expandBtn = document.querySelector('.expand-icon');
  if (!expandBtn) return;
  expandBtn.textContent = dayRangeExpanded ? '↔' : '↕'; 
}

function renderDaySelector() {
  const container = document.querySelector('.day-selector');
  if (!container) return;

  // Ensure structure: days-wrapper + expand button
  let daysWrapper = container.querySelector('.days-wrapper');
  const expandBtn = container.querySelector('.expand-icon');
  if (!daysWrapper) {
    daysWrapper = document.createElement('div');
    daysWrapper.className = 'days-wrapper';
    container.innerHTML = '';          // clear old content
    container.appendChild(daysWrapper);
    container.appendChild(expandBtn);  // button always at the right
  } else {
    daysWrapper.innerHTML = '';
  }

  const today = new Date();
  const range = dayRangeExpanded ? 21 : 7;

  for (let i = 0; i < range; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayAbbr = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const dayNum = d.getDate();

    const el = document.createElement('div');
    el.className = 'day-item';
    el.dataset.day = dayAbbr.toLowerCase();
    el.innerHTML = `
      <p class="day-abbr">${dayAbbr}</p>
      <p class="day-abbr">${dayNum}</p>
    `;
    daysWrapper.appendChild(el);
  }

  container.classList.toggle('expanded', dayRangeExpanded);
  container.classList.toggle('collapsed', !dayRangeExpanded);

  updateExpandIcon();
}


// Run once after DOMContentLoaded
const daySelector = document.querySelector('.day-selector');
daySelector.addEventListener('click', (e) => {
  const day = e.target.closest('.day-item');
  if (!day) return; // ignore clicks outside
  console.log('Day clicked:', day.getAttribute('data-day'));

  document.querySelectorAll('.day-item').forEach(d => d.classList.remove('active'));
  day.classList.add('active');
  const selectedDay = day.getAttribute('data-day');
  currentDay = selectedDay;
  updateTasksForDay(selectedDay);
});
