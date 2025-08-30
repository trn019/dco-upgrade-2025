document.querySelectorAll('.day-item').forEach(day => {
    day.addEventListener('click', () => {
        // Remove active class from all day items
        document.querySelectorAll('.day-item').forEach(d => d.classList.remove('active'));
        // Add active class to clicked day
        day.classList.add('active');
    });
});

// Tab functionality
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault();
        // Remove active class from all tabs
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');
    });
});

// Random task shuffle with animation
document.addEventListener('DOMContentLoaded', () => {
    const shuffleBtn = document.querySelector('.shuffle-btn');
    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', () => {
            shuffleBtn.style.transform = 'rotate(180deg)';
            setTimeout(() => {
                shuffleBtn.style.transform = 'rotate(0deg)';
            }, 300);
        });
    }
});

// FAB button with animation
document.addEventListener('DOMContentLoaded', () => {
    const fab = document.querySelector('.fab');
    if (fab) {
        fab.addEventListener('click', () => {
            fab.style.transform = 'scale(0.9) rotate(45deg)';
            setTimeout(() => {
                fab.style.transform = 'scale(1) rotate(0deg)';
            }, 150);
        });
    }
});

// Carousel navigation functionality
document.addEventListener('DOMContentLoaded', () => {
    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            dots[currentSlide].classList.remove('active');
            currentSlide = currentSlide > 0 ? currentSlide - 1 : dots.length - 1;
            dots[currentSlide].classList.add('active');
        });

        nextBtn.addEventListener('click', () => {
            dots[currentSlide].classList.remove('active');
            currentSlide = currentSlide < dots.length - 1 ? currentSlide + 1 : 0;
            dots[currentSlide].classList.add('active');
        });

        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                dots[currentSlide].classList.remove('active');
                currentSlide = index;
                dots[currentSlide].classList.add('active');
            });
        });
    }
});

// Task button functionality
document.addEventListener('DOMContentLoaded', () => {
    const completeBtn = document.querySelector('.btn-complete');
    const focusBtn = document.querySelector('.btn-focus-mode');

    if (completeBtn) {
        completeBtn.addEventListener('click', () => {
            completeBtn.textContent = 'Completed!';
            completeBtn.style.background = '#4caf50';
            setTimeout(() => {
                completeBtn.textContent = 'Mark Completed';
                completeBtn.style.background = '#4caf50';
            }, 2000);
        });
    }

    if (focusBtn) {
        focusBtn.addEventListener('click', () => {
            focusBtn.textContent = 'Focus Mode Active';
            focusBtn.style.background = '#f44336';
            setTimeout(() => {
                focusBtn.textContent = 'Begin Focus Mode';
                focusBtn.style.background = '#ff9800';
            }, 3000);
        });
    }
});