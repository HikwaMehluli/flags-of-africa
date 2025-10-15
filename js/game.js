class FlagsofWorld { // Renamed from FlagsOfAfrica
    constructor() {
        // --- Game State ---
        // Stores the cards for the current game
        this.cards = [];
        // Temporarily stores the two cards that are flipped over
        this.flippedCards = [];
        // Counts the number of correctly matched pairs
        this.matchedPairs = 0;
        // Counts the number of moves (a move is flipping two cards)
        this.moves = 0;
        // Timestamp for when the game starts, used for the timer
        this.startTime = null;
        // Holds the interval ID for the game timer
        this.timer = null;
        // Flag to check if the game has started (first card flipped)
        this.gameStarted = false;

        // --- UI Elements ---
        // The main container for the game cards
        this.gameBoard = document.getElementById('game-board');
        // Displays the number of moves
        this.movesElement = document.getElementById('moves');
        // Displays the elapsed time
        this.timeElement = document.getElementById('time');
        // Modal for entering player name after winning
        this.nameModal = document.getElementById('name-modal');
        // Form inside the name modal
        this.nameForm = document.getElementById('name-form');
        // Input field for player's name
        this.playerNameInput = document.getElementById('player-name');
        // Displays final moves in the modal
        this.modalFinalMoves = document.getElementById('modal-final-moves');
        // Displays final time in the modal
        this.modalFinalTime = document.getElementById('modal-final-time');
        // Button to close the name modal
        this.closeModalButton = document.querySelector('.close-modal');

        // --- Game Settings ---
        // Default continent
        this.continent = 'africa';
        // Default difficulty
        this.difficulty = 'easy';
        // Default region (all regions of the selected continent)
        this.region = 'all';

        // --- Setup ---
        // Initialize event listeners for selectors (continent, difficulty, etc.)
        this.initializeSelectors();
        // Update the region selector based on the default continent and start a new game
        this.updateRegionSelector().then(() => {
            this.startNewGame();
        });
    }

    /**
     * Initializes the event listeners for the game's control selectors
     * (continent, difficulty, region) and buttons (new game, restart).
     */
    initializeSelectors() {
        const continentSelect = document.getElementById('continent-select');
        const difficultySelect = document.getElementById('difficulty-select');
        const regionSelect = document.getElementById('region-select');
        const newGameBtn = document.getElementById('new-game-btn');
        const restartBtn = document.getElementById('restart-btn');

        // Event listener for continent selection change
        continentSelect.addEventListener('change', async (e) => {
            this.continent = e.target.value;
            await this.updateRegionSelector();
            this.startNewGame();
        });

        // Event listener for difficulty selection change
        difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.startNewGame();
        });

        // Event listener for region selection change
        regionSelect.addEventListener('change', (e) => {
            this.region = e.target.value;
            this.startNewGame();
        });

        // Event listeners for new game and restart buttons
        newGameBtn.addEventListener('click', () => this.startNewGame());
        restartBtn.addEventListener('click', () => this.restartGame());

        // Event listener for the name submission form
        if (this.nameForm) {
            this.nameForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const playerName = this.playerNameInput.value.trim();
                if (playerName) {
                    this.saveScore(playerName, this.moves, this.timeElement.textContent, this.difficulty, this.region);
                    this.nameModal.style.display = 'none';
                    this.playerNameInput.value = '';
                }
            });
        }

        // Event listener for closing the modal
        if (this.closeModalButton) {
            this.closeModalButton.addEventListener('click', () => {
                this.nameModal.style.display = 'none';
            });
        }

        // Allows closing the modal by clicking outside of it
        if (this.nameModal) {
            this.nameModal.addEventListener('click', (event) => {
                if (event.target === this.nameModal) {
                    this.nameModal.style.display = 'none';
                }
            });
        }
    }

    /**
     * Dynamically updates the region selector based on the selected continent.
     * Fetches region data from the corresponding JSON file.
     */
    async updateRegionSelector() {
        const regionSelect = document.getElementById('region-select');
        const regionGroup = regionSelect.parentElement;
        const regionTitle = regionGroup.querySelector('.selector-title');
        const gameTitle = document.querySelector('.game-title');
        regionSelect.innerHTML = ''; // Clear existing options

        // Capitalize continent name for display
        const continentName = this.continent.charAt(0).toUpperCase() + this.continent.slice(1);
        regionTitle.textContent = `Select Region`;
        gameTitle.textContent = `Flags of ${continentName}`;

        // Map continents to their flag data files
        const flagFiles = {
            africa: 'dist/flags_africa.json',
            europe: 'dist/flags_europe.json'
        };
        const fileName = flagFiles[this.continent];
        if (!fileName) {
            regionGroup.style.display = 'none'; // Hide region selector if no data file
            return;
        }
        regionGroup.style.display = 'block';

        try {
            const response = await fetch(fileName);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const flagsData = await response.json();

            // Add 'All' option to the selector
            const allOption = document.createElement('option');
            allOption.value = 'all';
            allOption.textContent = `All of ${continentName}`;
            regionSelect.appendChild(allOption);

            // Populate selector with regions from the fetched data
            for (const regionKey in flagsData) {
                const option = document.createElement('option');
                option.value = regionKey;
                option.textContent = regionKey;
                regionSelect.appendChild(option);
            }

            // Reset to 'all' when continent changes
            this.region = 'all';
            regionSelect.value = 'all';
        } catch (error) {
            console.error(`Error loading regions for ${this.continent}:`, error);
            regionGroup.style.display = 'none';
        }
    }

    /**
     * Fetches the flag data for the selected continent and region.
     * @returns {Promise<Array>} A promise that resolves to an array of flag objects.
     */
    async getFlags() {
        const flagFiles = {
            africa: 'dist/flags_africa.json',
            europe: 'dist/flags_europe.json'
        };
        const fileName = flagFiles[this.continent];
        if (!fileName) return [];

        try {
            const response = await fetch(fileName);
            const flags = await response.json();

            // If 'all' regions are selected, flatten all flags into a single array
            if (this.region === 'all') {
                return Object.values(flags).flat();
            }
            // Otherwise, return flags for the specific region
            return flags[this.region] || [];
        } catch (error) {
            console.error('Error loading flag data:', error);
            return [];
        }
    }

    /**
     * Returns the game board dimensions based on the selected difficulty.
     * @returns {{rows: number, cols: number, pairs: number}}
     */
    getDifficultySettings() {
        const settings = {
            easy: { rows: 3, cols: 4, pairs: 6 },
            medium: { rows: 4, cols: 4, pairs: 8 },
            hard: { rows: 5, cols: 4, pairs: 10 }
        };
        return settings[this.difficulty];
    }

    /**
     * Generates the set of cards for the game by selecting random flags,
     * duplicating them to create pairs, and shuffling them.
     * @returns {Promise<Array>} A promise that resolves to the shuffled array of cards.
     */
    async generateCards() {
        const { pairs } = this.getDifficultySettings();
        let availableFlags = await this.getFlags();
        availableFlags = this.shuffleArray(availableFlags);

        const cardPairs = [];
        const flagsToUse = availableFlags.slice(0, pairs);
        for (let i = 0; i < pairs && i < flagsToUse.length; i++) {
            const flag = flagsToUse[i];
            cardPairs.push(flag, flag); // Create pairs
        }
        return this.shuffleArray(cardPairs);
    }

    /**
     * Shuffles an array using the Fisher-Yates algorithm.
     * @param {Array} array The array to shuffle.
     * @returns {Array} The shuffled array.
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Creates the game board by generating and rendering the cards.
     */
    async createGameBoard() {
        this.cards = await this.generateCards();
        this.renderGameBoard();
    }

    /**
     * Renders the game board in the DOM, creating the card elements.
     */
    renderGameBoard() {
        const { rows, cols } = this.getDifficultySettings();
        this.gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        this.gameBoard.innerHTML = ''; // Clear previous board

        this.cards.forEach((flagData, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.index = index;
            card.innerHTML = `
                <div class="card-back">?</div>
                <div class="card-front" data-tippy-content="${flagData.country}">
                    ${flagData.flag}
                </div>
            `;
            card.addEventListener('click', () => this.flipCard(card, index));
            this.gameBoard.appendChild(card);
        });
        this.initializeTooltips(); // Re-initialize tooltips for new cards
    }

    /**
     * Initializes Tippy.js tooltips for elements with the 'data-tippy-content' attribute.
     */
    initializeTooltips() {
        tippy('[data-tippy-content]', {
            followCursor: true,
        });
    }

    /**
     * Handles the logic for flipping a card.
     * @param {HTMLElement} cardElement The card element that was clicked.
     * @param {number} index The index of the card in the `this.cards` array.
     */
    flipCard(cardElement, index) {
        // Prevent flipping more than two cards, or flipping already matched/flipped cards
        if (this.flippedCards.length >= 2 || cardElement.classList.contains('flipped') || cardElement.classList.contains('matched')) {
            return;
        }

        // Start the timer on the first card flip
        if (!this.gameStarted) {
            this.startTimer();
            this.gameStarted = true;
        }

        cardElement.classList.add('flipped');
        this.flippedCards.push({ element: cardElement, country: this.cards[index].country, index });

        // If two cards are flipped, increment moves and check for a match
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.movesElement.textContent = this.moves;
            setTimeout(() => this.checkMatch(), 1000); // Wait a moment before checking
        }
    }

    /**
     * Checks if the two currently flipped cards are a match.
     */
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        if (card1.country === card2.country) {
            // It's a match
            card1.element.classList.add('matched');
            card2.element.classList.add('matched');
            this.matchedPairs++;
            // Check if all pairs have been found
            if (this.matchedPairs === this.getDifficultySettings().pairs) {
                this.gameWon();
            }
        } else {
            // Not a match, flip them back
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');
        }
        this.flippedCards = []; // Reset flipped cards array
    }

    /**
     * Starts the game timer and updates the display every second.
     */
    startTimer() {
        this.startTime = Date.now();
        this.timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            this.timeElement.textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    /**
     * Stops the game timer.
     */
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    /**
     * Called when the game is won. Stops the timer and shows the name input modal.
     */
    gameWon() {
        this.stopTimer();
        const finalTime = this.timeElement.textContent;
        if (this.nameModal) {
            this.modalFinalMoves.textContent = this.moves;
            this.modalFinalTime.textContent = finalTime;
            this.nameModal.style.display = 'block';
        }
    }

    /**
     * Saves the player's score to local storage.
     * @param {string} name Player's name.
     * @param {number} moves Number of moves taken.
     * @param {string} time Final time.
     * @param {string} difficulty Game difficulty.
     * @param {string} region Game region.
     */
    saveScore(name, moves, time, difficulty, region) {
        const newScore = { name, moves, time, difficulty, region: `${this.continent} - ${region}` };
        const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
        highScores.push(newScore);
        // Sort scores by moves, then by time
        highScores.sort((a, b) => a.moves - b.moves || a.time.localeCompare(b.time));
        highScores.splice(10); // Keep only top 10
        localStorage.setItem('highScores', JSON.stringify(highScores));
    }

    /**
     * Resets the game state to its initial values.
     */
    resetGame() {
        this.stopTimer();
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameStarted = false;
        this.movesElement.textContent = '0';
        this.timeElement.textContent = '00:00';
        if (this.nameModal) {
            this.nameModal.style.display = 'none';
        }
    }

    /**
     * Starts a completely new game with a new set of cards.
     */
    startNewGame() {
        this.resetGame();
        this.createGameBoard();
    }

    /**
     * Restarts the current game with the same cards, but reshuffled.
     */
    async restartGame() {
        this.resetGame();
        this.cards = this.shuffleArray([...this.cards]);
        await this.createGameBoard();
    }
}

// Initialize the game once the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    new FlagsofWorld(); // Renamed from FlagsOfAfrica
});