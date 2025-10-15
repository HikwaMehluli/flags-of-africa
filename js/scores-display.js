document.addEventListener('DOMContentLoaded', () => {
    // Get references to the high scores list and the container for the "no scores" message
    const highScoresList = document.getElementById('high-scores-list');
    const noScoresContainer = document.getElementById('no-scores-container');

    // This script should only run on the scores page, so check if the necessary elements exist
    if (highScoresList && noScoresContainer) {
        // Retrieve high scores from local storage; if none exist, use an empty array
        const highScores = JSON.parse(localStorage.getItem('highScores')) || [];

        // Check if there are any scores to display
        if (highScores.length > 0) {
            // Create a map to convert region codes (e.g., 'southern') to more readable names (e.g., 'Southern Africa')
            const regionMap = {
                africa: 'Entire Africa',
                southern: 'Southern Africa',
                north: 'North Africa',
                east: 'East Africa',
                west: 'West Africa',
                central: 'Central Africa'
            };

            // Make the high scores list visible and hide the "no scores" message
            highScoresList.style.display = 'block';
            noScoresContainer.style.display = 'none';

            // Generate and inject the HTML for the list of high scores
            highScoresList.innerHTML = highScores.map(score => {
                // Find the full region name from the map, defaulting to the original code if not found
                const regionName = regionMap[score.region] || score.region;
                // Create the HTML list item for the current score
                return `<li>
                    <span class="player-name">${score.name}</span>
                    <span class="score-details">
                        ${score.moves} moves - ${score.time}
                    </span>
                    <span class="game-level">
                        ${score.difficulty} - ${regionName}
                    </span>
                </li>`;
            }).join('');
        } else {
            // If there are no scores, hide the list and show the "no scores" message
            highScoresList.style.display = 'none';
            noScoresContainer.style.display = 'block';
        }
    }
});