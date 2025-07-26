// LeaderboardManager.js
class LeaderboardManager {
    constructor() {
        this.scores = {
            'Free Shoot': [],
            'Timed Challenge': [],
            'Shot Limit': [],
            '2 Player Mode': []
        };
        
        this.maxScoresPerMode = 10; // Top 10 for each mode
        this.loadScores();
        
        console.log("LeaderboardManager: Initialized with high score tracking");
    }

    // Load scores from localStorage
    loadScores() {
        try {
            const savedScores = localStorage.getItem('basketballLeaderboard');
            if (savedScores) {
                this.scores = JSON.parse(savedScores);
            }
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        }
    }

    // Save scores to localStorage
    saveScores() {
        try {
            localStorage.setItem('basketballLeaderboard', JSON.stringify(this.scores));
            console.log('Leaderboard saved to localStorage');
        } catch (error) {
            console.error('Failed to save leaderboard:', error);
        }
    }

    // Check if a score qualifies for the leaderboard
    isHighScore(mode, score) {
        const modeScores = this.scores[mode] || [];
        
        // If we have less than max scores, any score qualifies
        if (modeScores.length < this.maxScoresPerMode) {
            return true;
        }
        
        // Check if score is higher than the lowest score
        const lowestScore = Math.min(...modeScores.map(s => s.score));
        return score > lowestScore;
    }

    // Add a new score to the leaderboard
    addScore(mode, playerName, score, attempts, made, accuracy) {
        const newScore = {
            name: playerName,
            score: score,
            attempts: attempts,
            made: made,
            accuracy: accuracy,
            date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
        };

        // Add to the appropriate mode
        if (!this.scores[mode]) {
            this.scores[mode] = [];
        }
        
        this.scores[mode].push(newScore);
        
        // Sort by score (descending) and keep only top scores
        this.scores[mode].sort((a, b) => b.score - a.score);
        this.scores[mode] = this.scores[mode].slice(0, this.maxScoresPerMode);
        
        this.saveScores();
        
        console.log(`New high score added for ${mode}: ${playerName} - ${score} points`);
        return newScore;
    }

    // Get top scores for a specific mode
    getTopScores(mode, limit = 10) {
        return (this.scores[mode] || []).slice(0, limit);
    }

    // Get all scores across all modes
    getAllScores() {
        return this.scores;
    }

    // Show name input dialog for high score
    showHighScoreDialog(mode, score, attempts, made, accuracy, onSubmit) {
        // Remove any existing dialogs
        const existingDialog = document.getElementById('high-score-dialog');
        if (existingDialog) {
            existingDialog.remove();
        }

        const dialog = document.createElement('div');
        dialog.id = 'high-score-dialog';
        dialog.style.cssText = `
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
            z-index: 3000;
            border: 3px solid #4CAF50;
            backdrop-filter: blur(10px);
            max-width: 400px;
        `;

        dialog.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h2 style="color: #4CAF50; margin: 0 0 10px 0;">🎉 HIGH SCORE! 🎉</h2>
                <div style="color: #ccc; margin-bottom: 15px;">${mode}</div>
                <div style="font-size: 24px; color: #ff6b35; margin-bottom: 10px;">${score} Points</div>
                <div style="font-size: 14px; color: #999;">
                    ${made}/${attempts} shots (${accuracy}% accuracy)
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 10px; color: #ccc;">Enter your name:</label>
                <input type="text" id="player-name-input" maxlength="20" 
                       style="padding: 10px; border-radius: 5px; border: 2px solid #444; 
                              background: rgba(255,255,255,0.1); color: white; 
                              text-align: center; font-size: 16px; width: 200px;"
                       placeholder="Your Name" />
            </div>
            
            <div>
                <button id="submit-score-btn" style="
                    background: #4CAF50; color: white; border: none; 
                    padding: 10px 20px; margin: 5px; border-radius: 5px; 
                    cursor: pointer; font-size: 16px;">
                    SAVE SCORE
                </button>
                <button id="skip-score-btn" style="
                    background: #666; color: white; border: none; 
                    padding: 10px 20px; margin: 5px; border-radius: 5px; 
                    cursor: pointer; font-size: 16px;">
                    SKIP
                </button>
            </div>
        `;

        document.body.appendChild(dialog);

        const nameInput = document.getElementById('player-name-input');
        const submitBtn = document.getElementById('submit-score-btn');
        const skipBtn = document.getElementById('skip-score-btn');

        // Focus the input
        nameInput.focus();

        // Handle submit
        const handleSubmit = () => {
            const playerName = nameInput.value.trim() || 'Anonymous';
            this.addScore(mode, playerName, score, attempts, made, accuracy);
            dialog.remove();
            if (onSubmit) onSubmit();
        };

        // Handle skip
        const handleSkip = () => {
            dialog.remove();
            if (onSubmit) onSubmit();
        };

        // Event listeners
        submitBtn.addEventListener('click', handleSubmit);
        skipBtn.addEventListener('click', handleSkip);
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSubmit();
        });

        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (dialog.parentNode) {
                handleSkip();
            }
        }, 30000);
    }

    // Show the leaderboard UI
    showLeaderboard() {
        // Remove any existing leaderboard
        const existingBoard = document.getElementById('leaderboard-display');
        if (existingBoard) {
            existingBoard.remove();
        }

        const leaderboard = document.createElement('div');
        leaderboard.id = 'leaderboard-display';
        leaderboard.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 30px;
            border-radius: 15px;
            font-family: Arial, sans-serif;
            z-index: 2500;
            border: 3px solid #4CAF50;
            backdrop-filter: blur(10px);
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
        `;

        let html = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #4CAF50; margin: 0 0 10px 0;">🏆 LEADERBOARD 🏆</h2>
                <button id="close-leaderboard" style="
                    position: absolute; top: 15px; right: 15px;
                    background: #f44336; color: white; border: none;
                    width: 30px; height: 30px; border-radius: 50%;
                    cursor: pointer; font-size: 16px;">×</button>
            </div>
        `;

        // Create tabs for each mode
        const modes = Object.keys(this.scores);
        html += `
            <div style="display: flex; justify-content: center; margin-bottom: 20px; flex-wrap: wrap;">
                ${modes.map((mode, index) => `
                    <button class="leaderboard-tab" data-mode="${mode}" style="
                        background: ${index === 0 ? '#4CAF50' : '#666'}; 
                        color: white; border: none; padding: 8px 15px; 
                        margin: 2px; border-radius: 5px; cursor: pointer; 
                        font-size: 12px; transition: background 0.3s;">
                        ${mode}
                    </button>
                `).join('')}
            </div>
        `;

        // Leaderboard content area
        html += `<div id="leaderboard-content"></div>`;

        leaderboard.innerHTML = html;
        document.body.appendChild(leaderboard);

        // Show first mode by default
        this.showModeLeaderboard(modes[0]);

        // Tab switching
        leaderboard.querySelectorAll('.leaderboard-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Update tab styles
                leaderboard.querySelectorAll('.leaderboard-tab').forEach(t => 
                    t.style.background = '#666'
                );
                e.target.style.background = '#4CAF50';
                
                // Show content for selected mode
                this.showModeLeaderboard(e.target.dataset.mode);
            });
        });

        // Close button
        document.getElementById('close-leaderboard').addEventListener('click', () => {
            leaderboard.remove();
        });

        // Auto-close after 60 seconds
        setTimeout(() => {
            if (leaderboard.parentNode) {
                leaderboard.remove();
            }
        }, 60000);
    }

    // Show leaderboard for a specific mode
    showModeLeaderboard(mode) {
        const content = document.getElementById('leaderboard-content');
        const scores = this.getTopScores(mode);

        if (scores.length === 0) {
            content.innerHTML = `
                <div style="text-align: center; color: #999; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🎯</div>
                    <div>No scores yet for ${mode}</div>
                    <div style="font-size: 14px; margin-top: 10px;">Be the first to set a high score!</div>
                </div>
            `;
            return;
        }

        let html = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: #ff6b35; margin: 0;">${mode}</h3>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid #444;">
                        <th style="padding: 10px; text-align: left; color: #4CAF50;">Rank</th>
                        <th style="padding: 10px; text-align: left; color: #4CAF50;">Name</th>
                        <th style="padding: 10px; text-align: center; color: #4CAF50;">Score</th>
                        <th style="padding: 10px; text-align: center; color: #4CAF50;">Accuracy</th>
                        <th style="padding: 10px; text-align: center; color: #4CAF50;">Date</th>
                    </tr>
                </thead>
                <tbody>
        `;

        scores.forEach((score, index) => {
            const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            html += `
                <tr style="border-bottom: 1px solid #333;">
                    <td style="padding: 8px; font-size: 18px;">${rankEmoji}</td>
                    <td style="padding: 8px; max-width: 150px; overflow: hidden; text-overflow: ellipsis;">${score.name}</td>
                    <td style="padding: 8px; text-align: center; font-weight: bold; color: #ff6b35;">${score.score}</td>
                    <td style="padding: 8px; text-align: center;">${score.made}/${score.attempts} (${score.accuracy}%)</td>
                    <td style="padding: 8px; text-align: center; color: #999; font-size: 12px;">${score.date}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        content.innerHTML = html;
    }

    // Clear all scores (for testing/reset)
    clearAllScores() {
        this.scores = {
            'Free Shoot': [],
            'Timed Challenge': [],
            'Shot Limit': [],
            '2 Player Mode': []
        };
        this.saveScores();
        console.log("All leaderboard scores cleared");
    }

    // Get player's best score for a mode
    getPlayerBest(mode, playerName) {
        const modeScores = this.scores[mode] || [];
        const playerScores = modeScores.filter(s => s.name === playerName);
        if (playerScores.length === 0) return null;
        
        return playerScores.reduce((best, current) => 
            current.score > best.score ? current : best
        );
    }

    // Dispose method for cleanup
    dispose() {
        const dialog = document.getElementById('high-score-dialog');
        const leaderboard = document.getElementById('leaderboard-display');
        
        if (dialog) dialog.remove();
        if (leaderboard) leaderboard.remove();
        
        console.log("LeaderboardManager: Disposed");
    }
}

export default LeaderboardManager;