window.taskData = window.taskData || {};

  // Add your very overdue room
// data.js — single, consistent dataset for both pages

window.taskData = {
    "thu-7": {
      bedroom: [
        { name: "Vacuum Floor",        lastCleaned: "2 days ago",  frequency: "Weekly",        effort: "moderate" }, // green (~71%)
        { name: "Organize Closet",     lastCleaned: "2 weeks ago", frequency: "Monthly",       effort: "moderate" }, // yellow (~53%)
        { name: "Change Sheets",       lastCleaned: "5 days ago",  frequency: "Weekly",        effort: "moderate" }, // red (~29%)
        { type: "one-time", name: "Bag Clothes for Donation", lastCleaned: "—", frequency: "One-time", effort: "low" }
      ],
      kitchen: [
        { name: "Clean Countertops",   lastCleaned: "1 day ago",   frequency: "Every 3 days",  effort: "low" },      // green (~67%)
        { name: "Wash Dishes",         lastCleaned: "today",       frequency: "Daily",         effort: "low" },      // green (100%)
        { name: "Clean Stove",         lastCleaned: "5 days ago",  frequency: "Weekly",        effort: "moderate" }, // red (~29%)
        { name: "Take Out Trash",      lastCleaned: "today",       frequency: "Daily",         effort: "low" },      // green (100%)
        { type: "one-time", name: "Descale Kettle", lastCleaned: "—", frequency: "One-time", effort: "low" }
      ],
      bathroom: [
        { name: "Clean Mirror",        lastCleaned: "3 days ago",  frequency: "Weekly",        effort: "low" },      // yellow (~57%)
        { name: "Scrub Shower",        lastCleaned: "1 week ago",  frequency: "Biweekly",      effort: "high" },     // yellow (50%)
        { type: "one-time", name: "Replace Shower Curtain Liner", lastCleaned: "—", frequency: "One-time", effort: "low" }
      ],
      living: [
        { name: "Dust TV Stand",       lastCleaned: "6 days ago",  frequency: "Weekly",        effort: "low" },      // red (~14%)
        { name: "Vacuum Rug",          lastCleaned: "yesterday",   frequency: "Weekly",        effort: "moderate" }, // green (~86%)
        { type: "one-time", name: "Hang Picture Frame", lastCleaned: "—", frequency: "One-time", effort: "low" }
      ],
      dining: [
        { name: "Wipe Dining Table", lastCleaned: "yesterday",  frequency: "Daily",        effort: "low" },     // green
        { name: "Clean Chairs",      lastCleaned: "4 days ago", frequency: "Weekly",       effort: "low" }      // yellow
      ]

    },
  
    "fri-8": {
      bedroom: [
        { name: "Make Bed",            lastCleaned: "today",       frequency: "Daily",         effort: "low" },      // green
        { type: "one-time", name: "Swap Summer/Winter Bedding", lastCleaned: "—", frequency: "One-time", effort: "moderate" }
      ],
      kitchen: [
        { name: "Wash Dishes",         lastCleaned: "this morning",frequency: "Daily",         effort: "low" },      // green
        { name: "Clean Stove",         lastCleaned: "6 days ago",  frequency: "Weekly",        effort: "moderate" }, // red (~14%)
        { type: "one-time", name: "Wipe Fridge Gasket", lastCleaned: "—", frequency: "One-time", effort: "low" }
      ],
      living: [
        { type: "one-time", name: "Spot Clean Couch", lastCleaned: "—", frequency: "One-time", effort: "low" }
      ]
    },
  
    "sat-9": {
      bedroom: [
        { name: "Change Sheets",       lastCleaned: "1 day ago",   frequency: "Every 2 weeks", effort: "moderate" }, // green (~93%)
        { type: "one-time", name: "Assemble Nightstand", lastCleaned: "—", frequency: "One-time", effort: "moderate" }
      ],
      kitchen: [
        { name: "Deep Clean Fridge",   lastCleaned: "2 weeks ago", frequency: "Monthly",       effort: "high" }      // yellow (~53%)
      ],
      bathroom: [
        { name: "Replace Towels",      lastCleaned: "yesterday",   frequency: "Weekly",        effort: "low" }       // green (~86%)
      ]
    },
  
    "sun-10": {
      garage: [
        { name: "Sweep Floor",         lastCleaned: "5 days ago",  frequency: "Every 2 weeks", effort: "low" },      // yellow (~64%)
        { name: "Organize Tools",      lastCleaned: "3 weeks ago", frequency: "Monthly",       effort: "moderate" }  // red (~30%)
      ],
      living: [
        { name: "Water Plants",        lastCleaned: "2 days ago",  frequency: "Weekly",        effort: "low" }       // green (~71%)
      ],
      dining: [
        { name: "Mop Dining Floor",  lastCleaned: "10 days ago", frequency: "Every 2 weeks", effort: "moderate" }, // yellow
        { type: "one-time", name: "Polish Wood Table", lastCleaned: "—", frequency: "One-time", effort: "low" }
      ]
    },
  
    "mon-11": {
      kitchen: [
        { name: "Wipe Counters",       lastCleaned: "today",       frequency: "Daily",         effort: "low" },      // green
        { name: "Mop Floor",           lastCleaned: "3 days ago",  frequency: "Weekly",        effort: "moderate" }  // yellow (~57%)
      ],
      bathroom: [
        { name: "Clean Sink",          lastCleaned: "today",       frequency: "Daily",         effort: "low" },      // green
        { name: "Scrub Shower",        lastCleaned: "4 days ago",  frequency: "Weekly",        effort: "high" }      // yellow (~43%)
      ],
      bedroom: [
        { name: "Tidy Nightstand",     lastCleaned: "2 days ago",  frequency: "Weekly",        effort: "low" }       // green (~71%)
      ]
    },
  
    "tue-12": {
      living: [
        { name: "Vacuum Carpet",       lastCleaned: "0 days ago",  frequency: "Weekly",        effort: "moderate" }, // green (100%)
        { name: "Dust Shelves",        lastCleaned: "3 days ago",  frequency: "Weekly",        effort: "low" }       // yellow (~57%)
      ],
      bedroom: [
        { name: "Change Sheets",       lastCleaned: "2 days ago",  frequency: "Weekly",        effort: "low" }       // green (~71%)
      ],
      kitchen: [
        { name: "Empty Dishwasher",    lastCleaned: "yesterday",   frequency: "Every 2 days",  effort: "low" }       // green (~50%? actually 1/2=50 yellow) -> change to "today"?
      ]
    },
  
    "wed-13": {
      office: [
        { name: "Wipe Desk",           lastCleaned: "2 days ago",  frequency: "Weekly",        effort: "low" },      // green (~71%)
        { name: "Empty Trash",         lastCleaned: "yesterday",   frequency: "Weekly",        effort: "low" }       // green (~86%)
      ],
      laundry: [
        { name: "Run Laundry",         lastCleaned: "6 days ago",  frequency: "Weekly",        effort: "moderate" }, // red (~14%)
        { name: "Clean Lint Trap",     lastCleaned: "3 days ago",  frequency: "Weekly",        effort: "low" }       // yellow (~57%)
      ]
    }
  };
  
  
  // Optional: room meta (used for emoji / fallbacks)
  window.roomData = {
    bedroom:  { emoji: "🛏️", tasks: 2 },
    kitchen:  { emoji: "🍳", tasks: 1 },
    bathroom: { emoji: "🚿", tasks: 3 },
    living:   { emoji: "🛋️", tasks: 1 },
    garage:   { emoji: "🚗", tasks: 0 },  // added so Room screen has an emoji fallback
    dining: { emoji: "🍽️", tasks: 0 },
  };
  
  // Room images (unknown rooms will fall back to emoji placeholder)
  window.ROOM_IMAGES = {
    kitchen:  'images/rooms/kitchen.jpg',
    bedroom:  'images/rooms/bedroom.jpg',
    bathroom: 'images/rooms/bathroom.jpg',
    living:   'images/rooms/living.jpg',
    dining: "images/rooms/dining.jpg"
  };
  
  // (Optional convenience)
  window.APP_DATA = { taskData: window.taskData, roomData: window.roomData, ROOM_IMAGES: window.ROOM_IMAGES };
  
  
  // Optional emoji mapping (used if you want pretty icons)
  window.roomData = {
    kitchen: { emoji: "🍽️" },
    bathroom: { emoji: "🚿" },
    living: { emoji: "🛋️" },
    bedroom: { emoji: "🛏️" },
    garage: { emoji: "🛠️" }
  };

  // Let the app know data is ready (see #3)
  document.dispatchEvent(new Event("taskdata:ready"));

  function updateCrushedStats(completedCount, timeMinutes) {
    const tasksEl = document.getElementById('tasksCompleted');
    const timeEl = document.getElementById('timeSpent');
    if (tasksEl) tasksEl.textContent = completedCount;
    if (timeEl) {
      const hours = Math.floor(timeMinutes / 60);
      const mins = timeMinutes % 60;
      timeEl.textContent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }
  }
  
  // Example usage:
  updateCrushedStats(14, 320); // 14 tasks, 320 minutes (~5h 20m)
  

  function buildCrushedRooms(rooms) {
    const container = document.getElementById('crushedRooms');
    if (!container) return;
  
    container.innerHTML = '';
    rooms.forEach(room => {
      const card = document.createElement('div');
      card.className = 'crushed-room-card';
      card.innerHTML = `
        <span class="room-emoji">${room.emoji || '✨'}</span>
        <p>The ${room.name} is sparkling ✨</p>
      `;
      container.appendChild(card);
    });
  }
  
  // Example usage:
  buildCrushedRooms([
    { name: 'living room', emoji: '🛋️' },
    { name: 'kitchen', emoji: '🍽️' }
  ]);
  