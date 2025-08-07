const menuIcon = document.getElementById('menu-icon');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const gameContainer = document.querySelector('.game-container');

menuIcon.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
    gameContainer.classList.toggle('blur');
});

overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    gameContainer.classList.remove('blur');
});
