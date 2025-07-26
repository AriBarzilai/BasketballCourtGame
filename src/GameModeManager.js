
// GameModeManager.js - Enhanced version with separate player statistics
class GameModeManager {
    constructor(audioManager, onResetStats, onResetBall, onHideUI, onShowUI) {
        this.audioManager = audioManager;
        this.onResetStats = onResetStats;  // Callback to reset game stats
        this.onResetBall = onResetBall;    // Callback to reset ball position
        this.onHideUI = onHideUI;          // Callback to hide game UI
        this.onShowUI = onShowUI;          // Callback to show game UI
        
        // Available game modes
        this.modes = {
            FREE_SHOOT: {
                name: "Free Shoot",
                description: "Unlimited shots, practice your skills!",
                icon: "🏀",
                hasTimer: false,
                hasShootLimit: false,
                targetScore: null
            },
            TIMED_CHALLENGE: {
                name: "Timed Challenge",
                description: "Score as many points as possible in 60 seconds!",
                icon: "⏰",
                hasTimer: true,
                timerDuration: 60, // seconds
                hasShootLimit: false,
                targetScore: null
            },
            SHOT_LIMIT: {
                name: "Shot Limit",
                description: "Make 10 shots with only 15 attempts!",
                icon: "🎯",
                hasTimer: false,
                hasShootLimit: true,
                shotLimit: 15,
                targetScore: 10 // successful shots needed
            },
            TWO_PLAYER: {
                name: "2 Player Mode",
                description: "Take turns! First player to score 3 baskets wins!",
                icon: "👥",
                hasTimer: false,
                hasShootLimit: false,
                targetScore: 3,
                isTwoPlayer: true
            }
        };
        
        // Current game state
        this.currentMode = 'FREE_SHOOT';
        this.isGameActive = false;
        this.timer = 0;
        this.gameStartTime = 0;
        
        // Mode-specific tracking
        this.modeStats = {
            shotsRemaining: 0,
            currentStreak: 0,
            bestStreak: 0,
            timeRemaining: 0,
            gameComplete: false,
            gameWon: false
        };
        
        // Enhanced two-player mode tracking with separate statistics
        this.twoPlayerStats = {
            currentPlayer: 1, // 1 or 2
            waitingForTurn: false,
            player1: {
                score: 0,
                shotAttempts: 0,
                shotsMade: 0
            },
            player2: {
                score: 0,
                shotAttempts: 0,
                shotsMade: 0
            }
        };
        
        // Track previous global stats to detect changes
        this.previousGlobalStats = {
            shotAttempts: 0,
            shotsMade: 0
        };
        
        // UI Elements
        this.gameUI = null;
        this.modeSelector = null;
        
        this.createGameModeUI();
        this.initializeMode(this.currentMode);
        
        console.log("GameModeManager: Game modes system initialized");
    }

    // Create the game mode UI
    createGameModeUI() {
        // Mode selector (initially visible)
        this.modeSelector = document.createElement('div');
        this.modeSelector.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 30px;
            border-radius: 15px;
            font-family: Arial, sans-serif;
            text-align: center;
            z-index: 2000;
            border: 3px solid #4CAF50;
            max-width: 600px;
            backdrop-filter: blur(10px);
        `;
        this.modeSelector.innerHTML = this.createModeSelectorHTML();
        document.body.appendChild(this.modeSelector);

        // Game status UI (hidden initially)
        this.gameUI = document.createElement('div');
        this.gameUI.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            font-size: 16px;
            z-index: 1500;
            border: 2px solid #4CAF50;
            display: none;
            min-width: 200px;
        `;
        document.body.appendChild(this.gameUI);

        this.attachEventListeners();
    }

    createModeSelectorHTML() {
        let html = `
            <h2 style="margin: 0 0 20px 0; color: #4CAF50;">🏀 Choose Game Mode</h2>
            <div style="display: grid; grid-template-columns: 1fr; gap: 15px; margin-bottom: 20px;">
        `;
        
        Object.keys(this.modes).forEach(modeKey => {
            const mode = this.modes[modeKey];
            const isSelected = modeKey === this.currentMode ? 'background: #4CAF50; transform: scale(1.02);' : '';
            html += `
                <div class="mode-option" data-mode="${modeKey}" style="
                    cursor: pointer;
                    padding: 15px;
                    border: 2px solid #666;
                    border-radius: 10px;
                    transition: all 0.3s ease;
                    ${isSelected}
                " onmouseover="this.style.borderColor='#4CAF50'; this.style.transform='scale(1.02)'"
                   onmouseout="this.style.borderColor='#666'; this.style.transform='scale(1)'"
                   onclick="window.gameModeManager.selectMode('${modeKey}')">
                    <div style="font-size: 24px; margin-bottom: 5px;">${mode.icon}</div>
                    <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">${mode.name}</div>
                    <div style="font-size: 14px; color: #ccc;">${mode.description}</div>
                </div>
            `;
        });
        
        html += `
            </div>
            <button onclick="window.gameModeManager.startSelectedMode()" style="
                background: #4CAF50;
                color: white;
                border: none;
                padding: 15px 30px;
                font-size: 18px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                transition: background 0.3s ease;
            " onmouseover="this.style.background='#45a049'"
               onmouseout="this.style.background='#4CAF50'">
                START GAME 🚀
            </button>
            <div style="margin-top: 15px; font-size: 12px; color: #999;">
                Press 'M' during game to change modes
            </div>
        `;
        
        return html;
    }

    attachEventListeners() {
        // Make GameModeManager globally accessible for onclick events
        window.gameModeManager = this;
    }

    selectMode(modeKey) {
        this.currentMode = modeKey;
        // Update visual selection
        this.modeSelector.innerHTML = this.createModeSelectorHTML();
        console.log(`GameModeManager: Selected mode - ${this.modes[modeKey].name}`);
    }

    startSelectedMode() {
        // Hide the mode selector
        this.modeSelector.style.display = 'none';
        this.gameUI.style.display = 'block';
        
        // Show game UI elements (scoreboard, controls) when game starts
        if (this.onShowUI) {
            this.onShowUI();
        }
        
        // Reset all game stats when starting new mode
        if (this.onResetStats) {
            this.onResetStats();
        }
        
        // Reset ball to center when starting new mode
        if (this.onResetBall) {
            this.onResetBall();
        }
        
        this.initializeMode(this.currentMode);
        this.startGame();
        console.log(`GameModeManager: Starting ${this.modes[this.currentMode].name}`);
    }

    initializeMode(modeKey) {
        const mode = this.modes[modeKey];
        this.currentMode = modeKey;
        
        // Reset mode-specific stats
        this.modeStats = {
            shotsRemaining: mode.shotLimit || Infinity,
            currentStreak: 0,
            bestStreak: 0,
            timeRemaining: mode.timerDuration || 0,
            gameComplete: false,
            gameWon: false
        };
        
        // Reset two-player stats with separate statistics
        this.twoPlayerStats = {
            currentPlayer: 1,
            waitingForTurn: false,
            player1: {
                score: 0,
                shotAttempts: 0,
                shotsMade: 0
            },
            player2: {
                score: 0,
                shotAttempts: 0,
                shotsMade: 0
            }
        };
        
        // Reset previous stats tracking
        this.previousGlobalStats = {
            shotAttempts: 0,
            shotsMade: 0
        };
        
        this.timer = 0;
        this.isGameActive = false;
        
        console.log(`GameModeManager: Initialized ${mode.name} mode`);
    }

    startGame() {
        this.isGameActive = true;
        this.gameStartTime = Date.now();
        
        const mode = this.modes[this.currentMode];
        if (mode.hasTimer && !mode.isSpeedMode) {
            this.timer = mode.timerDuration;
        }
        
        this.updateGameUI();
        console.log(`GameModeManager: Game started - ${mode.name}`);
        
        // Play start sound
        if (this.audioManager && this.audioManager.playScoreSound) {
            this.audioManager.playScoreSound();
        }
    }

    update(deltaTime, gameStats) {
        if (!this.isGameActive || this.modeStats.gameComplete) return;
        
        const mode = this.modes[this.currentMode];
        
        // Update timer
        if (mode.hasTimer && !mode.isSpeedMode) {
            this.timer -= deltaTime;
            this.modeStats.timeRemaining = Math.max(0, this.timer);
            
            if (this.timer <= 0) {
                this.endGame(false); // Time's up
                return;
            }
        }

        // Handle TWO_PLAYER mode stat tracking
        if (mode.isTwoPlayer) {
            this.updateTwoPlayerStats(gameStats);
        }
        
        // Check win conditions
        this.checkWinConditions(gameStats);
        
        // Update UI
        this.updateGameUI();
    }

    // Update individual player statistics in TWO_PLAYER mode
    updateTwoPlayerStats(gameStats) {
        const currentPlayerStats = this.twoPlayerStats.currentPlayer === 1 
            ? this.twoPlayerStats.player1 
            : this.twoPlayerStats.player2;

        // Detect new attempts for current player
        if (gameStats.shotAttempts > this.previousGlobalStats.shotAttempts) {
            const newAttempts = gameStats.shotAttempts - this.previousGlobalStats.shotAttempts;
            currentPlayerStats.shotAttempts += newAttempts;
            console.log(`Player ${this.twoPlayerStats.currentPlayer} attempted ${newAttempts} shot(s). Total: ${currentPlayerStats.shotAttempts}`);
        }

        // Detect new made shots for current player
        if (gameStats.shotsMade > this.previousGlobalStats.shotsMade) {
            const newMadeShots = gameStats.shotsMade - this.previousGlobalStats.shotsMade;
            currentPlayerStats.shotsMade += newMadeShots;
            currentPlayerStats.score += newMadeShots * 2; // 2 points per basket
            console.log(`Player ${this.twoPlayerStats.currentPlayer} made ${newMadeShots} shot(s). Total: ${currentPlayerStats.shotsMade}`);
        }

        // Update previous stats for next frame
        this.previousGlobalStats = {
            shotAttempts: gameStats.shotAttempts,
            shotsMade: gameStats.shotsMade
        };
    }

    checkWinConditions(gameStats) {
        const mode = this.modes[this.currentMode];
        
        switch (this.currentMode) {
            case 'SHOT_LIMIT':
                // Check if out of shots
                this.modeStats.shotsRemaining = mode.shotLimit - gameStats.shotAttempts;
                if (this.modeStats.shotsRemaining <= 0) {
                    const won = gameStats.shotsMade >= mode.targetScore;
                    this.endGame(won);
                }
                break;
                
            case 'TWO_PLAYER':
                // Handle two-player win condition
                if (this.twoPlayerStats.player1.shotsMade >= mode.targetScore) {
                    this.endGame(true, "Player 1 Wins!");
                } else if (this.twoPlayerStats.player2.shotsMade >= mode.targetScore) {
                    this.endGame(true, "Player 2 Wins!");
                }
                break;
        }
    }

    // endGame(won, customMessage = null) {
    //     this.isGameActive = false;
    //     this.modeStats.gameComplete = true;
    //     this.modeStats.gameWon = won;
        
    //     const mode = this.modes[this.currentMode];
    //     const gameTime = (Date.now() - this.gameStartTime) / 1000;
        
    //     this.showGameEndScreen(won, gameTime, customMessage);
    //     console.log(`GameModeManager: Game ended - ${won ? 'WON' : 'LOST'} in ${gameTime.toFixed(1)}s`);
    // }
    endGame(won, customMessage = null) {
        this.isGameActive = false;
        this.modeStats.gameComplete = true;
        this.modeStats.gameWon = won;
        
        const mode = this.modes[this.currentMode];
        const gameTime = (Date.now() - this.gameStartTime) / 1000;
        
        // Check for high score and get stats
        let finalScore, finalAttempts, finalMade, finalAccuracy;
        
        if (mode.isTwoPlayer) {
            // For two-player mode, use the winning player's stats
            const winningPlayer = this.twoPlayerStats.player1.shotsMade >= mode.targetScore ? 
                this.twoPlayerStats.player1 : this.twoPlayerStats.player2;
            finalScore = winningPlayer.score;
            finalAttempts = winningPlayer.shotAttempts;
            finalMade = winningPlayer.shotsMade;
            finalAccuracy = finalAttempts > 0 ? Math.round((finalMade / finalAttempts) * 100) : 0;
        } else {
            // For single player modes, use global stats
            finalScore = this.getCurrentStats().playerScore;
            finalAttempts = this.getCurrentStats().shotAttempts;
            finalMade = this.getCurrentStats().shotsMade;
            finalAccuracy = finalAttempts > 0 ? Math.round((finalMade / finalAttempts) * 100) : 0;
        }
        
        // Check if it's a high score (only for won games or completed challenges)
        if ((won || mode.hasTimer || mode.hasShootLimit) && window.leaderboardManager) {
            if (window.leaderboardManager.isHighScore(mode.name, finalScore)) {
                // Show high score dialog first, then show game end screen
                window.leaderboardManager.showHighScoreDialog(
                    mode.name, finalScore, finalAttempts, finalMade, finalAccuracy,
                    () => this.showGameEndScreen(won, gameTime, customMessage)
                );
                return; // Don't show game end screen immediately
            }
        }
        
        this.showGameEndScreen(won, gameTime, customMessage);
        console.log(`GameModeManager: Game ended - ${won ? 'WON' : 'LOST'} in ${gameTime.toFixed(1)}s`);
    }
//********************************************************** */
    getCurrentStats() {
        // You'll need to pass the main stats object to GameModeManager
        // For now, we'll access it globally - you can improve this later
        return window.gameStats || { playerScore: 0, shotAttempts: 0, shotsMade: 0 };
    }

    showGameEndScreen(won, gameTime, customMessage = null) {
        const mode = this.modes[this.currentMode];
        
        const endScreen = document.createElement('div');
        endScreen.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 30px;
            border-radius: 15px;
            font-family: Arial, sans-serif;
            text-align: center;
            z-index: 2500;
            border: 3px solid ${won ? '#4CAF50' : '#f44336'};
            backdrop-filter: blur(10px);
        `;
        
        let resultText = customMessage || (won ? '🎉 VICTORY! 🎉' : '😞 GAME OVER 😞');
        let timeText = mode.hasTimer ? `Time: ${gameTime.toFixed(1)}s` : '';
        
        // Add final stats for TWO_PLAYER mode
        let finalStatsText = '';
        if (mode.isTwoPlayer) {
            const p1Accuracy = this.twoPlayerStats.player1.shotAttempts > 0 
                ? Math.round((this.twoPlayerStats.player1.shotsMade / this.twoPlayerStats.player1.shotAttempts) * 100) 
                : 0;
            const p2Accuracy = this.twoPlayerStats.player2.shotAttempts > 0 
                ? Math.round((this.twoPlayerStats.player2.shotsMade / this.twoPlayerStats.player2.shotAttempts) * 100) 
                : 0;
            
            finalStatsText = `
                <div style="margin: 20px 0; text-align: left; max-width: 300px;">
                    <h4 style="color: #4CAF50; margin-bottom: 10px;">Final Statistics:</h4>
                    <div style="margin-bottom: 10px;">
                        <strong>Player 1:</strong> ${this.twoPlayerStats.player1.shotsMade}/${this.twoPlayerStats.player1.shotAttempts} (${p1Accuracy}%)
                    </div>
                    <div>
                        <strong>Player 2:</strong> ${this.twoPlayerStats.player2.shotsMade}/${this.twoPlayerStats.player2.shotAttempts} (${p2Accuracy}%)
                    </div>
                </div>
            `;
        }
        
        endScreen.innerHTML = `
            <h2 style="margin: 0 0 20px 0; color: ${won ? '#4CAF50' : '#f44336'};">${resultText}</h2>
            <div style="font-size: 18px; margin-bottom: 20px;">${mode.name} Complete!</div>
            ${timeText ? `<div style="font-size: 16px; margin-bottom: 15px;">${timeText}</div>` : ''}
            ${finalStatsText}
            <div style="margin-bottom: 20px;">
                <button onclick="window.gameModeManager.restartGame()" style="
                    background: #4CAF50; color: white; border: none; padding: 10px 20px;
                    margin: 5px; border-radius: 5px; cursor: pointer; font-size: 16px;">
                    PLAY AGAIN
                </button>
                <button onclick="window.gameModeManager.showModeSelector()" style="
                    background: #2196F3; color: white; border: none; padding: 10px 20px;
                    margin: 5px; border-radius: 5px; cursor: pointer; font-size: 16px;">
                    CHANGE MODE
                </button>
            </div>
        `;
        
        document.body.appendChild(endScreen);
        
        // Auto-remove after 15 seconds
        setTimeout(() => {
            if (endScreen.parentNode) {
                endScreen.parentNode.removeChild(endScreen);
            }
        }, 15000);
    }

    updateGameUI() {
        if (!this.gameUI || !this.isGameActive) return;
        
        const mode = this.modes[this.currentMode];
        let html = `
            <div style="font-weight: bold; color: #4CAF50; margin-bottom: 10px;">
                ${mode.icon} ${mode.name}
            </div>
        `;
        
        // Mode-specific UI
        switch (this.currentMode) {
            case 'TIMED_CHALLENGE':
                html += `<div>⏰ Time: ${Math.ceil(this.modeStats.timeRemaining)}s</div>`;
                break;
                
            case 'SHOT_LIMIT':
                html += `
                    <div>🎯 Target: ${mode.targetScore} shots</div>
                    <div>📊 Remaining: ${this.modeStats.shotsRemaining} attempts</div>
                `;
                break;
                
            case 'TWO_PLAYER':
                const currentPlayerStyle = this.twoPlayerStats.waitingForTurn ? 'color: #999;' : 'color: #4CAF50; font-weight: bold;';
                html += `
                    <div style="${this.twoPlayerStats.currentPlayer === 1 ? currentPlayerStyle : ''}">
                        👤 Player 1: ${this.twoPlayerStats.player1.shotsMade}/${mode.targetScore}
                    </div>
                    <div style="${this.twoPlayerStats.currentPlayer === 2 ? currentPlayerStyle : ''}">
                        👤 Player 2: ${this.twoPlayerStats.player2.shotsMade}/${mode.targetScore}
                    </div>
                    <div style="margin-top: 5px; font-size: 14px;">
                        ${this.twoPlayerStats.waitingForTurn ? 
                            '⏳ Waiting for ball to stop...' : 
                            `🎯 Player ${this.twoPlayerStats.currentPlayer}'s Turn`}
                    </div>
                `;
                break;
        }
        
        html += `<div style="margin-top: 10px; font-size: 12px; color: #999;">Press 'M' for modes</div>`;
        
        this.gameUI.innerHTML = html;
    }

    // Called when shot is attempted (for turn switching in 2-player mode)
    onShotAttempted() {
        if (!this.isGameActive) return;
        
        const mode = this.modes[this.currentMode];
        
        // Handle two-player mode - just mark that we're waiting for ball to stop
        if (mode.isTwoPlayer && !this.twoPlayerStats.waitingForTurn) {
            this.twoPlayerStats.waitingForTurn = true;
            console.log(`GameModeManager: Waiting for ball to stop before switching turns...`);
        }
        
        console.log("GameModeManager: Shot attempted");
    }

    // Called when shot is made
    onShotMade() {
        if (!this.isGameActive) return;
        
        console.log("GameModeManager: Shot made");
    }

    // Called when ball has stopped moving (for 2-player turn switching)
    onBallStopped() {
        if (!this.isGameActive) return;
        
        const mode = this.modes[this.currentMode];
        
        // Handle two-player mode turn switching when ball stops
        if (mode.isTwoPlayer && this.twoPlayerStats.waitingForTurn) {
            // Switch turns now that ball has stopped
            this.twoPlayerStats.currentPlayer = this.twoPlayerStats.currentPlayer === 1 ? 2 : 1;
            this.twoPlayerStats.waitingForTurn = false;
            
            // Reset ball to center for next player's turn
            if (this.onResetBall) {
                this.onResetBall();
            }
            
            console.log(`GameModeManager: Ball stopped. Now Player ${this.twoPlayerStats.currentPlayer}'s turn`);
        }
    }

    // Toggle mode selector visibility
    showModeSelector() {
        this.isGameActive = false;
        this.modeSelector.style.display = 'block';
        this.gameUI.style.display = 'none';
        
        // Hide game UI elements (scoreboard, controls) when in mode selection
        if (this.onHideUI) {
            this.onHideUI();
        }
        
        // Clear any end screens
        const endScreens = document.querySelectorAll('[style*="z-index: 2500"]');
        endScreens.forEach(screen => screen.remove());
    }

    restartGame() {
        // Clear any end screens
        const endScreens = document.querySelectorAll('[style*="z-index: 2500"]');
        endScreens.forEach(screen => screen.remove());
        
        // Reset stats when restarting
        if (this.onResetStats) {
            this.onResetStats();
        }
        
        // Reset ball to center when restarting
        if (this.onResetBall) {
            this.onResetBall();
        }
        
        this.initializeMode(this.currentMode);
        this.startGame();
    }

    // Get current mode info
    getCurrentMode() {
        return this.modes[this.currentMode];
    }

    isInFreeMode() {
        return this.currentMode === 'FREE_SHOOT';
    }

    // Handle key press (call this from your main game loop)
    handleKeyPress(key) {
        if (key.toLowerCase() === 'm') {
            this.showModeSelector();
            return true; // Indicate key was handled
        }
        return false;
    }

    // Cleanup
    dispose() {
        if (this.modeSelector && this.modeSelector.parentNode) {
            this.modeSelector.parentNode.removeChild(this.modeSelector);
        }
        if (this.gameUI && this.gameUI.parentNode) {
            this.gameUI.parentNode.removeChild(this.gameUI);
        }
        console.log("GameModeManager: Disposed");
    }
}

export default GameModeManager;