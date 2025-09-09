import "./navigation.js";
import "./game.js";
import "./theme.js";

document.addEventListener('DOMContentLoaded', () => {
    const highScoresList = document.getElementById('high-scores-list');
    const noScoresContainer = document.getElementById('no-scores-container');

    if (highScoresList && noScoresContainer) { // Check if we are on the scores page
        const highScores = JSON.parse(localStorage.getItem('highScores')) || [];

        if (highScores.length > 0) {
            highScoresList.style.display = 'block';
            noScoresContainer.style.display = 'none';
            highScoresList.innerHTML = highScores.map(score => `
                <li>
                    <span class="player-name">${score.name}</span>
                    <span class="score-details">
                        ${score.moves} moves - ${score.time}
                    </span>
                    <span class="game-level">
                        ${score.difficulty} - ${score.region}
                    </span>
                </li>
            `).join('');
        } else {
            highScoresList.style.display = 'none';
            noScoresContainer.style.display = 'block';
        }
    }
});