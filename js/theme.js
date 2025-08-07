document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Function to apply the theme based on preference
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
    };

    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // Default to light mode if no saved theme
        applyTheme('light');
    }

    // Save theme preference on click
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            applyTheme('light');
            localStorage.setItem('theme', 'light');
        } else {
            applyTheme('dark');
            localStorage.setItem('theme', 'dark');
        }
    });
});