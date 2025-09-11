window.taskData = window.taskData || {};

  // Add your very overdue room
  window.taskData["mon-09"] = {
    kitchen: [
      { name: "Wipe counters", lastCleaned: "2 days ago", progress: 100, status: "Done", frequency: "Daily", effort: "low" },
      { name: "Mop floor", lastCleaned: "5 days ago", progress: 80, status: "Done", frequency: "Weekly", effort: "moderate" }
    ],
    bathroom: [
      { name: "Clean sink", lastCleaned: "1 day ago", progress: 100, status: "Done", frequency: "Daily", effort: "low" },
      { name: "Scrub shower", lastCleaned: "6 days ago", progress: 90, status: "Done", frequency: "Weekly", effort: "high" }
    ]
  };
  
  window.taskData["tue-10"] = {
    livingroom: [
      { name: "Vacuum carpet", lastCleaned: "0 days ago", progress: 100, status: "Done", frequency: "Weekly", effort: "moderate" },
      { name: "Dust shelves", lastCleaned: "3 days ago", progress: 85, status: "Done", frequency: "Weekly", effort: "low" }
    ],
    bedroom: [
      { name: "Change sheets", lastCleaned: "2 days ago", progress: 100, status: "Done", frequency: "Weekly", effort: "low" }
    ]
  };
  
  window.taskData["sun-08"] = {
    garage: [
      { name: "Sweep floor", lastCleaned: "4 weeks ago", progress: 90, status: "Overdue!", frequency: "Monthly", effort: "low" },
      { name: "Organize tools", lastCleaned: "1 month ago", progress: 95, status: "Overdue!", frequency: "Monthly", effort: "moderate" }
    ]
  };
  
  // Optional emoji mapping (used if you want pretty icons)
  window.roomData = {
    kitchen: { emoji: "🍽️" },
    bathroom: { emoji: "🚿" },
    livingroom: { emoji: "🛋️" },
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
  