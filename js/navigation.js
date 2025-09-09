document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.getElementById('menu-icon');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const gameContainer = document.querySelector('.game-container');

    if (menuIcon) {
        menuIcon.addEventListener('click', () => {
            menuIcon.classList.toggle('open');
            sidebar.classList.toggle('open');
            overlay.classList.toggle('open');
            
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            menuIcon.classList.remove('open');
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
            if (gameContainer) {
                gameContainer.classList.remove('blur');
            }
        });
    }
});