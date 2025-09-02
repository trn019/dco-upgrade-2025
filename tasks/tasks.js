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

let currentSort = 'room'; // 'room' | 'effort-asc' | 'effort-desc'

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

function setupModalEventListeners() {
    // One-time task modal
    const oneTimeModal = document.getElementById('oneTimeTaskModal');
    const oneTimeForm = document.getElementById('oneTimeTaskForm');
    const oneTimeCloseBtn = oneTimeModal.querySelector('.close-modal');
    
    // Recurring task modal
    const recurringModal = document.getElementById('recurringTaskModal');
    const recurringForm = document.getElementById('recurringTaskForm');
    const recurringCloseBtn = recurringModal.querySelector('.close-modal');
    
    // Close button events
    oneTimeCloseBtn.addEventListener('click', () => closeOneTimeModal());
    recurringCloseBtn.addEventListener('click', () => closeRecurringModal());
    
    // Close when clicking outside
    oneTimeModal.addEventListener('click', (e) => {
        if (e.target === oneTimeModal) {
            closeOneTimeModal();
        }
    });
    
    recurringModal.addEventListener('click', (e) => {
        if (e.target === recurringModal) {
            closeRecurringModal();
        }
    });
    
    // One-time task form submission
    oneTimeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedEffort = oneTimeModal.querySelector('.effort-option.selected')?.getAttribute('data-level') || 'low';
        
        const formData = {
            room: document.getElementById('oneTimeTaskRoom').value,
            task: document.getElementById('oneTimeTaskName').value,
            notes: document.getElementById('oneTimeTaskNotes').value,
            effort: selectedEffort
        };
        
        console.log('One-time task saved:', formData);
        alert('One-time task created successfully!');
        closeOneTimeModal();
    });
    
    // Recurring task form submission
    recurringForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            room: document.getElementById('recurringTaskRoom').value,
            task: document.getElementById('recurringTaskName').value,
            notes: document.getElementById('recurringTaskNotes').value,
            number: selectedNumber,
            unit: selectedUnit,
            repeat: selectedRepeat,
            time: selectedTime,
            notify: document.getElementById('recurringNotifyToggle').checked
        };
        
        console.log('Recurring task saved:', formData);
        alert(`Recurring task created!\nRoom: ${formData.room}\nTask: ${formData.task}\nFrequency: Every ${formData.number} ${formData.unit}\nNotifications: ${formData.notify ? 'Enabled' : 'Disabled'}`);
        closeRecurringModal();
    });
    
    // Effort level selection for one-time modal
    oneTimeModal.querySelectorAll('.effort-option').forEach(option => {
        option.addEventListener('click', () => {
            oneTimeModal.querySelectorAll('.effort-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
    
    // Repeat option click
    const repeatRow = recurringModal.querySelector('.repeat-row');
    if (repeatRow) {
        repeatRow.addEventListener('click', showRepeatOptions);
    }
    
    // Time option click
    const timeRow = recurringModal.querySelector('.time-row');
    if (timeRow) {
        timeRow.addEventListener('click', showTimeOptions);
    }

    // Initialize dual picker
    initializeDualPicker();
}

function initializeDualPicker() {
    // Initialize number picker (1-30)
    const numberPickerList = document.getElementById('numberPickerList');
    const numberPickerScroll = document.getElementById('numberPickerScroll');
    
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
    
    // Initialize unit picker
    const unitPickerList = document.getElementById('unitPickerList');
    const unitPickerScroll = document.getElementById('unitPickerScroll');
    const units = ['days', 'weeks', 'months', 'years'];
    
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

function showOneTimeTaskModal() {
    const modal = document.getElementById('oneTimeTaskModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeOneTimeModal() {
    const modal = document.getElementById('oneTimeTaskModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form
    document.getElementById('oneTimeTaskForm').reset();
    
    // Reset effort level selection
    modal.querySelectorAll('.effort-option').forEach(opt => opt.classList.remove('selected'));
}

function showRecurringTaskModal() {
    const modal = document.getElementById('recurringTaskModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeRecurringModal() {
    const modal = document.getElementById('recurringTaskModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form
    document.getElementById('recurringTaskForm').reset();
    
    // Reset picker selections to defaults
    document.querySelectorAll('#numberPickerList .picker-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelectorAll('#unitPickerList .picker-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Set defaults
    document.querySelector('[data-number="7"]').classList.add('selected');
    document.querySelector('[data-unit="days"]').classList.add('selected');
    selectedNumber = 7;
    selectedUnit = 'days';
    
    // Reset repeat and time values
    selectedRepeat = 'On Monday';
    selectedTime = 'Time';
    document.getElementById('repeatValue').textContent = 'On Monday ›';
    document.getElementById('timeValue').textContent = 'Time ›';
}

function showRepeatOptions() {
    const options = ['On Monday', 'On Tuesday', 'On Wednesday', 'On Thursday', 'On Friday', 'On Saturday', 'On Sunday', 'Weekdays', 'Weekends'];
    const choice = prompt('Choose repeat option:\n' + options.map((opt, i) => `${i + 1}. ${opt}`).join('\n'));
    
    if (choice && choice >= 1 && choice <= options.length) {
        selectedRepeat = options[choice - 1];
        document.getElementById('repeatValue').textContent = selectedRepeat + ' ›';
    }
}

function showTimeOptions() {
    const time = prompt('Enter time (e.g., 9:00 AM, 2:30 PM):');
    if (time && time.trim()) {
        selectedTime = time.trim();
        document.getElementById('timeValue').textContent = selectedTime + ' ›';
    }
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

  function updateTasksForDay(day) {
    const tasksContainer = document.getElementById('tasks-for-day');
    const dayTasks = taskData[day] || {};
  
    const renderTask = (task, roomLabel) => {
      const pct = computeProgressPercent(task.lastCleaned, task.frequency);
      const colorClass = progressColorClass(pct);
  
      return `
        <div class="task-item">
          <div class="task-header">
            <h3>${task.name}</h3>
            ${task.effort ? `<span class="effort-chip">${task.effort.charAt(0).toUpperCase() + task.effort.slice(1)}</span>` : ''}
          </div>
          <div class="task-info">
            <p>${task.lastCleaned}</p>
            <div class="progress-bar">
              <div class="progress-fill ${colorClass}" style="width:${pct}%;"></div>
            </div>
            <p class="status-text">${
              pct <= 10 ? 'Overdue!' :
              pct <= 33 ? 'Uh oh...' :
              pct <= 66 ? 'Getting dusty...' :
              'Looking good!'
            }</p>
          </div>
          <div class="task-frequency">
            <span>${task.frequency}</span>
            ${roomLabel ? `<span style="margin-left:8px; font-size:11px; color:#999;">• ${roomLabel}</span>` : ''}
          </div>
        </div>
      `;
    };
  
    if (currentSort === 'room') {
      let html = '';
      Object.keys(dayTasks).forEach(room => {
        html += `<section class="room">
          <h2>${room.charAt(0).toUpperCase() + room.slice(1)}</h2>`;
        dayTasks[room].forEach(task => {
          html += renderTask(task, null);
        });
        html += `</section>`;
      });
      tasksContainer.innerHTML = html || '<p style="text-align:center;color:#666;margin-top:40px;">No tasks scheduled for this day!</p>';
      return;
    }
  
    // Effort sort (flatten + sort)
    let allTasks = [];
    Object.keys(dayTasks).forEach(room => {
      (dayTasks[room] || []).forEach(task => allTasks.push({ ...task, _room: room }));
    });
  
    if (allTasks.length === 0) {
      tasksContainer.innerHTML = '<p style="text-align:center;color:#666;margin-top:40px;">No tasks scheduled for this day!</p>';
      return;
    }
  
    const EFFORT_ORDER = { low: 1, moderate: 2, high: 3 };
    allTasks.forEach(t => { if (!t.effort) t.effort = 'moderate'; });
  
    allTasks.sort((a, b) => {
      const aVal = EFFORT_ORDER[a.effort] || 2;
      const bVal = EFFORT_ORDER[b.effort] || 2;
      return currentSort === 'effort-asc' ? aVal - bVal : bVal - aVal;
    });
  
    let html = `<section class="room"><h2>Tasks (Sorted by Effort)</h2>`;
    allTasks.forEach(task => {
      const roomLabel = task._room.charAt(0).toUpperCase() + task._room.slice(1);
      html += renderTask(task, roomLabel);
    });
    html += `</section>`;
    tasksContainer.innerHTML = html;
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
  });
