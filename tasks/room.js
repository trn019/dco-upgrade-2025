document.addEventListener('DOMContentLoaded', () => {
    // Shuffle button functionality
    const shuffleBtn = document.querySelector('.shuffle-btn');
    shuffleBtn.addEventListener('click', () => {
        shuffleBtn.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            shuffleBtn.style.transform = 'rotate(0deg)';
        }, 300);

        // Show random task alert
        alert('Random task: Organize Closet!');
    });

    // Tab functionality (though not switching views in this version)
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
        });
    });

    // Add task button functionality
    const addTaskBtn = document.querySelector('.add-task');
    addTaskBtn.addEventListener('click', () => {
        addTaskBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            addTaskBtn.style.transform = 'scale(1)';
        }, 150);

        alert('Add new task to Bedroom');
    });

    // Task item click functionality
    document.querySelectorAll('.task-item').forEach(task => {
        task.addEventListener('click', () => {
            const taskName = task.querySelector('.task-name').textContent;
            alert(`Task: ${taskName}`);
        });
    });
});