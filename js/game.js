class FlagsOfAfrica {
    // --- Initialization ---
    constructor() {
        // Game state variables
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.startTime = null;
        this.timer = null;
        this.gameStarted = false;

        // UI Elements
        this.gameBoard = document.getElementById('game-board');
        this.movesElement = document.getElementById('moves');
        this.timeElement = document.getElementById('time');
        this.confettiElement = document.querySelector('.confetti');

        // --- Modal UI Elements ---
        this.nameModal = document.getElementById('name-modal');
        this.nameForm = document.getElementById('name-form');
        this.playerNameInput = document.getElementById('player-name');
        this.modalFinalMoves = document.getElementById('modal-final-moves');
        this.modalFinalTime = document.getElementById('modal-final-time');
        this.closeModalButton = document.querySelector('.close-modal');

        // Game Settings (from selectors)
        this.difficulty = 'easy';
        this.region = 'africa'; // Default region - "southern", 'north", "east", "west", "central", "africa = (Entire Africa)"

        // Setup game
        this.initializeSelectors();
        this.startNewGame(); // Start initial game
    }

    // Setup event listeners for difficulty and region selectors
    initializeSelectors() {
        const difficultySelect = document.getElementById('difficulty-select');
        const regionSelect = document.getElementById('region-select');
        const newGameBtn = document.getElementById('new-game-btn');
        const restartBtn = document.getElementById('restart-btn');

        difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.startNewGame(); // Restart game on change
        });
        regionSelect.addEventListener('change', (e) => {
            this.region = e.target.value;
            this.startNewGame(); // Restart game on change
        });
        newGameBtn.addEventListener('click', () => this.startNewGame());
        restartBtn.addEventListener('click', () => this.restartGame());

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

        if (this.closeModalButton) {
            this.closeModalButton.addEventListener('click', () => {
                this.nameModal.style.display = 'none';
            });
        }

        if (this.nameModal) {
            this.nameModal.addEventListener('click', (event) => {
                if (event.target === this.nameModal) {
                    this.nameModal.style.display = 'none';
                }
            });
        }
    }

    // Get list of flags based on selected region
    async getAfricanFlags() {
        try {
            const response = await fetch('dist/flags.json');
            const flags = await response.json();

            if (this.region === 'africa') {
                return [...flags.north, ...flags.southern, ...flags.east, ...flags.west, ...flags.central];
            }
            return flags[this.region] || flags.southern;
        } catch (error) {
            console.error('Error loading flag data:', error);
            return []; // Return empty array on error
        }
    }

    // Get game settings (rows, cols, pairs) based on difficulty
    getDifficultySettings() {
        const settings = {
            easy: { rows: 3, cols: 4, pairs: 6 },
            medium: { rows: 4, cols: 4, pairs: 8 },
            hard: { rows: 5, cols: 4, pairs: 10 }
        };
        return settings[this.difficulty];
    }

    // Create the array of card pairs from available flags
    async generateCards() {
        const { pairs } = this.getDifficultySettings();
        let availableFlags = await this.getAfricanFlags(); // Await the async method

        // Shuffle the available flags first
        availableFlags = this.shuffleArray(availableFlags);

        const cardPairs = [];

        // Use the first 'pairs' number of flags, duplicating each for matching
        const flagsToUse = availableFlags.slice(0, pairs);
        for (let i = 0; i < pairs && i < flagsToUse.length; i++) {
            const flag = flagsToUse[i];
            cardPairs.push(flag, flag);
        }

        // Shuffle the final card pairs array to randomize board layout
        return this.shuffleArray(cardPairs);
    }

    // Fisher-Yates shuffle algorithm
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // --- Game Logic ---
    // Create the HTML game board based on current settings
    async createGameBoard() {
        this.cards = await this.generateCards(); // Await the promise
        this.renderGameBoard();
    }

    // Render the game board with the current set of cards
    renderGameBoard() {
        const { rows, cols } = this.getDifficultySettings();

        // Configure grid layout
        this.gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        this.gameBoard.innerHTML = ''; // Clear existing board

        // Display cards
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

        this.initializeTooltips();
    }

    initializeTooltips() {
        tippy('[data-tippy-content]', {
            // animation: 'fade',
            // arrow: true,
            // duration: [300, 250],
            // trigger: 'mouseenter focus',
            followCursor: true,
        });
    }

    // Handle card click event
    flipCard(cardElement, index) {
        // Prevent flipping if two cards are already up, or if card is already flipped/matched
        if (this.flippedCards.length >= 2 ||
            cardElement.classList.contains('flipped') ||
            cardElement.classList.contains('matched')) {
            return;
        }

        // Start timer on the first valid card flip
        if (!this.gameStarted) {
            this.startTimer();
            this.gameStarted = true;
        }

        // Flip the card and add to the list of flipped cards
        cardElement.classList.add('flipped');
        this.flippedCards.push({ element: cardElement, country: this.cards[index].country, index });

        // Check for a match after the second card is flipped
        if (this.flippedCards.length === 2) {
            this.moves++; // Increment move counter
            this.movesElement.textContent = this.moves; // Update UI
            setTimeout(() => this.checkMatch(), 1000); // Delay match check for visibility
        }
    }

    // Check if the two flipped cards match
    checkMatch() {
        const [card1, card2] = this.flippedCards;

        if (card1.country === card2.country) {

            // Match found
            card1.element.classList.add('matched');
            card2.element.classList.add('matched');
            this.matchedPairs++;

            // Check for game win
            if (this.matchedPairs === this.getDifficultySettings().pairs) {
                this.gameWon();
            }

        } else {
            // No match, flip cards back
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');
        }
        // Reset flipped cards list
        this.flippedCards = [];
    }

    // --- Timer Management ---
    // Start the game timer
    startTimer() {
        this.startTime = Date.now();
        this.timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            this.timeElement.textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    // Stop the game timer
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    // --- Game Flow ---
    // Handle game win condition
    gameWon() {
        this.stopTimer();
        const finalTime = this.timeElement.textContent;

        if (this.confettiElement) {
            this.confettiElement.classList.add('show');
        }

        if (this.nameModal) {
            this.modalFinalMoves.textContent = this.moves;
            this.modalFinalTime.textContent = finalTime;
            this.nameModal.style.display = 'block';
        }
    }

    saveScore(name, moves, time, difficulty, region) {
        const newScore = { name, moves, time, difficulty, region };
        const highScores = JSON.parse(localStorage.getItem('highScores')) || [];

        highScores.push(newScore);
        highScores.sort((a, b) => a.moves - b.moves || a.time.localeCompare(b.time));
        highScores.splice(10);

        localStorage.setItem('highScores', JSON.stringify(highScores));
    }

    // Reset game state variables and UI elements
    resetGame() {
        this.stopTimer(); // Stop any running timer
        this.flippedCards = []; // Clear flipped cards
        this.matchedPairs = 0; // Reset matched pairs
        this.moves = 0; // Reset move counter
        this.gameStarted = false; // Reset game start flag

        // Reset UI text
        this.movesElement.textContent = '0';
        this.timeElement.textContent = '00:00';

        if (this.confettiElement) {
            this.confettiElement.classList.remove('show');
        }
        if (this.nameModal) {
            this.nameModal.style.display = 'none';
        }
    }

    // Start a completely new game (reset + create new board)
    startNewGame() {
        this.resetGame();
        this.createGameBoard();
    }

    // Restart the current game (reset + reshuffle same cards)
    async restartGame() {
        this.resetGame();
        // Shuffling existing cards, no need to fetch again
        this.cards = this.shuffleArray([...this.cards]); 
        await this.createGameBoard(); // Recreate board with shuffled cards
    }
}

// --- Global Functions ---
// Initialize the game instance
let game;
function startNewGame() {
    if (game) {
        game.startNewGame();
    }
}
function restartGame() {
    if (game) {
        game.restartGame();
    }
}

// Start the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    game = new FlagsOfAfrica();
});