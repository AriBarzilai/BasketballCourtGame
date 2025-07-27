
const stats = {
    playerScore: 0,
    shotAttempts: 0,
    shotsMade: 0,
    powerLevel: 50,
    combo: 0
};

export default stats;

function createScoreContainer(document) {
    const container = document.createElement('div');
    container.id = 'score-container';
    container.className = 'score-container';

    // Create main title
    const mainTitle = document.createElement('h2');
    mainTitle.id = 'main-title';
    mainTitle.className = 'main-title';

    // Create the content area
    const horizontalContent = document.createElement('div');
    horizontalContent.id = 'horizontal-content';
    horizontalContent.className = 'horizontal-content';

    // LEFT SIDE: Player vs Player section (only for TWO_PLAYER mode)
    const vsSection = document.createElement('div');
    vsSection.id = 'vs-section';
    vsSection.className = 'vs-section';

    const vsDisplay = document.createElement('div');
    vsDisplay.id = 'vs-display';
    vsDisplay.className = 'vs-display';

    // RIGHT SIDE: Current player statistics
    const statisticsSection = document.createElement('div');
    statisticsSection.id = 'statistics-section';
    statisticsSection.className = 'statistics-section';

    const statisticsDisplay = document.createElement('div');
    statisticsDisplay.id = 'statistics-display';
    statisticsDisplay.className = 'statistics-display';

    // Assemble the sections
    vsSection.appendChild(vsDisplay);
    statisticsSection.appendChild(statisticsDisplay);

    horizontalContent.appendChild(vsSection);
    horizontalContent.appendChild(statisticsSection);

    container.appendChild(mainTitle);
    container.appendChild(horizontalContent);

    return container;
}

function updateScoreboardDisplay(container, gameModeManager = null) {
    const mainTitle = container.querySelector('#main-title');
    const horizontalContent = container.querySelector('#horizontal-content');
    const vsSection = container.querySelector('#vs-section');
    const vsDisplay = container.querySelector('#vs-display');
    const statisticsDisplay = container.querySelector('#statistics-display');

    // Get current mode info from GameModeManager
    const isTwoPlayerMode = gameModeManager && gameModeManager.getCurrentMode().isTwoPlayer;
    const currentMode = gameModeManager ? gameModeManager.getCurrentMode() : null;

    if (isTwoPlayerMode && gameModeManager) {
        // TWO_PLAYER mode - show separate stats for each player
        const twoPlayerStats = gameModeManager.twoPlayerStats;
        const currentPlayer = twoPlayerStats.currentPlayer;

        mainTitle.textContent = `${currentMode.name} - Player ${currentPlayer}'s Turn`;
        vsSection.style.display = 'block';

        // Restore the left border for statistics section
        statisticsDisplay.style.borderLeft = 'none';
        statisticsDisplay.style.paddingLeft = '0';

        // Reset justify content
        horizontalContent.style.justifyContent = 'space-between';

        // Calculate individual player accuracies
        const p1Accuracy = twoPlayerStats.player1.shotAttempts > 0
            ? Math.round((twoPlayerStats.player1.shotsMade / twoPlayerStats.player1.shotAttempts) * 100)
            : 0;
        const p2Accuracy = twoPlayerStats.player2.shotAttempts > 0
            ? Math.round((twoPlayerStats.player2.shotsMade / twoPlayerStats.player2.shotAttempts) * 100)
            : 0;

        // LEFT SIDE: Player 1's individual statistics
        vsDisplay.innerHTML = `
            <div class="player-stats-section ${currentPlayer === 1 ? 'active-player' : ''}">
                <h4 class="player-title">Player 1</h4>
                <div class="player-score">${twoPlayerStats.player1.score}</div>
                <div class="player-detailed-stats">
                    <div class="player-stat-item">
                        <span class="stat-label">Attempts:</span>
                        <span class="stat-value">${twoPlayerStats.player1.shotAttempts}</span>
                    </div>
                    <div class="player-stat-item">
                        <span class="stat-label">Made:</span>
                        <span class="stat-value">${twoPlayerStats.player1.shotsMade}</span>
                    </div>
                    <div class="player-stat-item">
                        <span class="stat-label">Accuracy:</span>
                        <span class="stat-value">${p1Accuracy}%</span>
                    </div>
                </div>
            </div>
        `;

        // Make both containers have identical styling for TWO_PLAYER mode
        vsDisplay.style.display = 'flex';
        vsDisplay.style.justifyContent = 'center';
        vsDisplay.style.alignItems = 'center';
        vsDisplay.style.width = '100%';

        statisticsDisplay.style.display = 'flex';
        statisticsDisplay.style.justifyContent = 'center';
        statisticsDisplay.style.alignItems = 'center';
        statisticsDisplay.style.width = '100%';

        // RIGHT SIDE: Player 2's individual statistics
        statisticsDisplay.innerHTML = `
            <div class="player-stats-section ${currentPlayer === 2 ? 'active-player' : ''}">
                <h4 class="player-title">Player 2</h4>
                <div class="player-score">${twoPlayerStats.player2.score}</div>
                <div class="player-detailed-stats">
                    <div class="player-stat-item">
                        <span class="stat-label">Attempts:</span>
                        <span class="stat-value">${twoPlayerStats.player2.shotAttempts}</span>
                    </div>
                    <div class="player-stat-item">
                        <span class="stat-label">Made:</span>
                        <span class="stat-value">${twoPlayerStats.player2.shotsMade}</span>
                    </div>
                    <div class="player-stat-item">
                        <span class="stat-label">Accuracy:</span>
                        <span class="stat-value">${p2Accuracy}%</span>
                    </div>
                </div>
            </div>
        `;

    } else {
        // All other modes (FREE_SHOOT, TIMED_CHALLENGE, SHOT_LIMIT) - show only statistics
        const modeTitle = currentMode ? currentMode.name : 'Player Statistics';
        mainTitle.textContent = modeTitle;
        vsSection.style.display = 'none';

        // Remove the left border from statistics section
        statisticsDisplay.style.borderLeft = 'none';
        statisticsDisplay.style.paddingLeft = '0';

        // Center the statistics
        horizontalContent.style.justifyContent = 'center';

        const accuracy = stats.shotAttempts > 0
            ? Math.round((stats.shotsMade / stats.shotAttempts) * 100)
            : 0;

        // Show mode-specific info if available
        let modeSpecificInfo = '';
        if (gameModeManager && gameModeManager.isGameActive) {
            const modeStats = gameModeManager.modeStats;
            const mode = gameModeManager.getCurrentMode();

            if (mode.hasTimer) {
                modeSpecificInfo = `
                    <div class="stat-row">
                        <div class="stat-item compact mode-info">
                            <span class="stat-label">⏰ Time Left:</span>
                            <span class="stat-value">${Math.ceil(modeStats.timeRemaining)}s</span>
                        </div>
                    </div>
                `;
            } else if (mode.hasShootLimit) {
                modeSpecificInfo = `
                    <div class="stat-row">
                        <div class="stat-item compact mode-info">
                            <span class="stat-label">🎯 Shots Left:</span>
                            <span class="stat-value">${modeStats.shotsRemaining}</span>
                        </div>
                        <div class="stat-item compact mode-info">
                            <span class="stat-label">Target:</span>
                            <span class="stat-value">${mode.targetScore}</span>
                        </div>
                    </div>
                `;
            }
        }

        statisticsDisplay.innerHTML = `
            ${modeSpecificInfo}
            <div class="stat-row">
                <div class="stat-item compact">
                    <span class="stat-label">Score:</span>
                    <span class="stat-value" id="total-score">${stats.playerScore}</span>
                </div>
                <div class="stat-item compact">
                    <span class="stat-label">Attempts:</span>
                    <span class="stat-value" id="shot-attempts">${stats.shotAttempts}</span>
                </div>
            </div>
            <div class="stat-row">
                <div class="stat-item compact">
                    <span class="stat-label">Made:</span>
                    <span class="stat-value" id="shots-made">${stats.shotsMade}</span>
                </div>
                <div class="stat-item compact">
                    <span class="stat-label">Accuracy:</span>
                    <span class="stat-value" id="shooting-percentage">${accuracy}%</span>
                </div>
            </div>
            <div class="stat-row">
                <div class="stat-item compact">
                    <span class="stat-label">Combo:</span>
                    <span class="stat-value" id="combo-value">${stats.combo}</span>
                </div>
            </div>
        `;
    }
}

function updateStatistics(gameModeManager = null) {
    const container = document.getElementById('score-container');
    if (container) {
        updateScoreboardDisplay(container, gameModeManager);
    }
}

// Reset statistics
function resetStatistics() {
    stats.playerScore = 0;
    stats.shotAttempts = 0;
    stats.shotsMade = 0;

    updateStatistics();
}

function createEnhancedControlsContainer(document) {
    const container = document.createElement('div');
    container.id = 'enhanced-controls-container';
    container.className = 'enhanced-controls-container';

    const controlsTitle = document.createElement('h3');
    controlsTitle.textContent = 'Game Controls';
    controlsTitle.className = 'enhanced-controls-title';

    const controlsList = document.createElement('div');
    controlsList.id = 'enhanced-controls-list';
    controlsList.className = 'enhanced-controls-list';

    container.appendChild(controlsTitle);
    container.appendChild(controlsList);

    return container;
}

function createCreditsContainer(document) {
    const container = document.createElement('div');
    container.id = 'credits-container';
    container.className = 'credits-container';
    container.innerHTML = `
        <div style="text-align: center; font-size: 0.7em; color: #999;">
            Game created by<br/>
            <span style="color: #4CAF50; font-weight: bold;">Ari Barzilai and Netta Yaniv</span>
        </div>
    `;
    return container;
}

function createDiagnosticsInfoContainer(document) {
    const container = document.createElement('div');
    container.id = 'camera-info-container';
    container.className = 'camera-info-container';
    container.style.position = 'absolute';
    container.style.top = '20px';
    container.style.left = '20px';
    container.style.background = 'rgba(0,0,0,0.7)';
    container.style.color = 'white';
    container.style.padding = '10px';
    container.style.borderRadius = '8px';
    container.style.fontFamily = 'monospace';
    container.style.fontSize = '0.95em';
    container.style.zIndex = '2000';
    container.style.pointerEvents = 'auto';
    container.innerText = 'Camera Info';
    container.style.display = 'none';
    return container;
}

// Updates the enhanced controls display based on current state
function updateEnhancedControlsDisplay(controlsContainer, isOrbitEnabled, isDiagnosticsEnabled, gameModeManager = null) {
    const controlsList = controlsContainer.querySelector('#enhanced-controls-list');

    const currentControls = `
        <div class="control-section current-controls">
            <h4>Display Controls:</h4>
            <div class="control-item">
                <span class="control-key">H</span>
                <span class="control-desc">Toggle GUI</span>
            </div>
            <div class="control-item">
                <span class="control-key">~</span>
                <span class="control-desc">Toggle Diagnostics ${isDiagnosticsEnabled ? '(Enabled)' : '(Disabled)'}</span>
            </div>
            <div class="control-item">
                <span class="control-key">O</span>
                <span class="control-desc">Toggle orbit camera ${isOrbitEnabled ? '(Enabled)' : '(Disabled)'}</span>
            </div>
            <div class="control-item">
                <span class="control-key">C</span>
                <span class="control-desc">Cycle preset camera positions</span>
            </div>
            <div class="control-item">
                <span class="control-key">Mouse Wheel</span>
                <span class="control-desc">Zoom in/out ${isOrbitEnabled ? '(Available)' : '(Disabled)'}</span>
            </div>
            <div class="control-item">
                <span class="control-key">L</span>
                <span class="control-desc">View Leaderboard</span>
            </div>
        </div>
    `;

    // Game mode controls
    const gameModeControls = `
        <div class="control-section current-controls">
            <h4>Game Mode:</h4>
            <div class="control-item">
                <span class="control-key">M</span>
                <span class="control-desc">Change Game Mode</span>
            </div>
            ${gameModeManager ? `
            <div class="control-item">
                <span class="mode-indicator">${gameModeManager.getCurrentMode().icon} ${gameModeManager.getCurrentMode().name}</span>
            </div>` : ''}
        </div>
    `;

    // Play controls - different for two-player mode
    const isTwoPlayerMode = gameModeManager && gameModeManager.getCurrentMode().isTwoPlayer;
    const isGameActive = gameModeManager && gameModeManager.isGameActive;
    const isInFreeMode = gameModeManager && gameModeManager.isInFreeMode();

    let playControls = `
        <div class="control-section current-controls">
            <h4>Ball Controls:</h4>
            <div class="control-item">
                <span class="control-key">Arrow Keys</span>
                <span class="control-desc">Move ball</span>
            </div>
            <div class="control-item">
                <span class="control-key">W/S</span>
                <span class="control-desc">Increase/Decrease shot power</span>
            </div>
            <div class="control-item">
                <span class="control-key">Space</span>
                <span class="control-desc">Launch ball toward hoop</span>
            </div>
    `;

    // Reset control - available in free mode, challenge modes, or when game is not active
    const currentMode = gameModeManager ? gameModeManager.getCurrentMode() : null;
    const isResetAllowed = isInFreeMode ||
        !isGameActive ||
        (currentMode && (currentMode.name === 'Timed Challenge' || currentMode.name === 'Shot Limit'));

    if (isResetAllowed) {
        playControls += `
            <div class="control-item">
                <span class="control-key">R</span>
                <span class="control-desc">Reset ball to center</span>
            </div>
        `;
    } else if (isTwoPlayerMode) {
        playControls += `
            <div class="control-item">
                <span class="control-note">Ball resets automatically after each turn</span>
            </div>
        `;
    }

    playControls += `</div>`;

    controlsList.innerHTML = currentControls + gameModeControls + playControls;
}

// Display diagnostics such as camera position/direction, ball position, etc.
function updateDiagnosticsInfo(diagnosticsInfoContainer, camera, basketball, playerControls, isUIVisible, isDiagnosticsEnabled, gameModeManager = null) {
    // Camera position
    const cameraPos = camera.position;
    // Camera facing direction (normalized vector)
    const cameraFacing = new THREE.Vector3();
    const basketballPos = basketball.object.position;
    camera.getWorldDirection(cameraFacing);
    const basketBallSpeed = playerControls.getBallSpeed()

    // Format numbers to 2 decimals
    function fmt(v) { return v.toFixed(2); }

    const gameMode = gameModeManager ? gameModeManager.getCurrentMode().name : 'Unknown';
    const isGameActive = gameModeManager ? gameModeManager.isGameActive : false;

    diagnosticsInfoContainer.innerHTML =
        `<b>Game Mode:</b> ${gameMode}<br/>` +
        `<b>Game Active:</b> ${isGameActive}<br/>` +
        `<b>Camera Position:</b> (${fmt(cameraPos.x)}, ${fmt(cameraPos.y)}, ${fmt(cameraPos.z)})<br/>` +
        `<b>Camera Facing:</b> (${fmt(cameraFacing.x)}, ${fmt(cameraFacing.y)}, ${fmt(cameraFacing.z)})<br/>` +
        `<b>Basketball Position:</b> (${fmt(basketballPos.x)}, ${fmt(basketballPos.y)}, ${fmt(basketballPos.z)})<br/>` +
        `<b>Basketball Speed:</b> (${fmt(basketBallSpeed)}})`
    diagnosticsInfoContainer.style.display =
        (isDiagnosticsEnabled && isUIVisible) ? 'block' : 'none';
}

function createPowerBarContainer(document) {
    const container = document.createElement('div');
    container.id = 'power-bar-container';
    container.className = 'power-bar-container';

    const title = document.createElement('div');
    title.className = 'power-bar-title';
    title.textContent = 'SHOT POWER';

    const barBackground = document.createElement('div');
    barBackground.className = 'power-bar-background';

    const barFill = document.createElement('div');
    barFill.id = 'power-bar-fill';
    barFill.className = 'power-bar-fill';

    const valueDisplay = document.createElement('div');
    valueDisplay.id = 'power-bar-value';
    valueDisplay.className = 'power-bar-value';
    valueDisplay.textContent = `${0}%`;

    barBackground.appendChild(barFill);
    container.appendChild(title);
    container.appendChild(barBackground);
    container.appendChild(valueDisplay);

    barFill.style.height = `${0}%`;
    valueDisplay.textContent = `${0}%`;

    return container;
}

function updatePowerBarDisplay(pitch) {
    const power = Math.floor((pitch / (Math.PI / 2)) * 100)
    const barFill = document.getElementById('power-bar-fill');
    const valueDisplay = document.getElementById('power-bar-value');

    if (barFill && valueDisplay) {
        barFill.style.height = `${power}%`;
        valueDisplay.textContent = `${power}%`;
    }
}

// Create the complete UI framework
function createCompleteUIFramework(document) {
    // Add CSS styles
    addUIFrameworkStyles(document);

    const mainContainer = document.createElement('div');
    mainContainer.id = 'main-ui-container';
    mainContainer.className = 'main-ui-container';

    const scoreContainer = createScoreContainer(document);
    const controlsContainer = createEnhancedControlsContainer(document);
    const diagnosticsInfoContainer = createDiagnosticsInfoContainer(document);
    const creditsContainer = createCreditsContainer(document);
    const powerBarContainer = createPowerBarContainer(document);

    mainContainer.appendChild(scoreContainer);
    mainContainer.appendChild(controlsContainer);
    mainContainer.appendChild(diagnosticsInfoContainer);
    mainContainer.appendChild(creditsContainer);
    mainContainer.appendChild(powerBarContainer);

    return {
        mainContainer: mainContainer,
        scoreContainer: scoreContainer,
        controlsContainer: controlsContainer,
        diagnosticsInfoContainer: diagnosticsInfoContainer,
        creditsContainer: creditsContainer,
        powerBarContainer: powerBarContainer
    };
}

function addUIFrameworkStyles(document) {
    const style = document.createElement('style');
    style.id = 'hw05-ui-styles';
    style.textContent = `
        /* Main UI Container */
        .main-ui-container {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 1000;
            font-family: 'Arial', sans-serif;
        }
        
        /* NEW HORIZONTAL SCORE CONTAINER */
        .score-container {
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            border: 2px solid #444;
            backdrop-filter: blur(8px);
            pointer-events: auto;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            /* Make it wide but short */
            min-width: 500px;
            max-width: 700px;
            height: auto;
        }

        /* Main title across the top */
        .main-title {
            margin: 0 0 8px 0;
            font-size: 0.9em;
            color: #ff6b35;
            text-align: center;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
            border-bottom: 1px solid #444;
            padding-bottom: 4px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* Horizontal content container */
        .horizontal-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
        }

        /* LEFT SIDE: VS Section (TWO_PLAYER mode only) */
        .vs-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            max-width: 50%;
        }

        .vs-display {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
        }

        .team-score {
            display: flex;
            flex-direction: column;
            align-items: center;
            transition: all 0.3s ease;
        }

        .team-score.active-player {
            transform: scale(1.1);
        }

        .team-score.active-player .team-name {
            color: #4CAF50;
            font-weight: bold;
        }

        .team-score.active-player .score-value {
            color: #4CAF50;
            text-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
        }

        .team-name {
            font-size: 0.65em;
            margin-bottom: 2px;
            color: #bbb;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .score-value {
            font-size: 1.4em;
            font-weight: bold;
            color: #4CAF50;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }

        .score-separator {
            font-size: 1.2em;
            font-weight: bold;
            color: #666;
        }

        /* RIGHT SIDE: Statistics Section */
        .statistics-section {
            flex: 1;
            max-width: 50%;
        }

        .current-player-title {
            margin: 0 0 8px 0;
            font-size: 0.8em;
            color: #4CAF50;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: bold;
        }

        .statistics-display {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        /* Statistics in 2x2 grid format */
        .stat-row {
            display: flex;
            gap: 12px;
        }

        .stat-item.compact {
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2px 6px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
            border-left: 2px solid #4CAF50;
            min-width: 80px;
        }

        .stat-item.compact.mode-info {
            border-left: 2px solid #ff9800;
            background: rgba(255, 152, 0, 0.1);
        }

        .stat-label {
            font-size: 0.65em;
            color: #ccc;
            font-weight: 500;
        }

        .stat-value {
            font-size: 0.7em;
            font-weight: bold;
            color: #fff;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
        }

        /* Special styling for accuracy percentage */
        .stat-item.compact:last-child .stat-value {
            color: #ff9800;
        }

        /* Player Stats Section for TWO_PLAYER mode */
        .player-stats-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 10px;
            border-radius: 8px;
            transition: all 0.3s ease;
            background: rgba(255, 255, 255, 0.02);
            border: 2px solid transparent;
        }

        .player-stats-section.active-player {
            background: rgba(76, 175, 80, 0.1);
            border: 2px solid #4CAF50;
            transform: scale(1.02);
        }

        .player-title {
            margin: 0 0 8px 0;
            font-size: 0.9em;
            color: #bbb;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: bold;
        }

        .player-stats-section.active-player .player-title {
            color: #4CAF50;
        }

        .player-score {
            font-size: 2em;
            font-weight: bold;
            color: #4CAF50;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            margin-bottom: 10px;
        }

        .player-stats-section.active-player .player-score {
            color: #4CAF50;
            text-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
        }

        .player-detailed-stats {
            display: flex;
            flex-direction: column;
            gap: 4px;
            width: 100%;
        }

        .player-stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 3px 8px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 4px;
            border-left: 2px solid #666;
        }

        .player-stats-section.active-player .player-stat-item {
            border-left: 2px solid #4CAF50;
            background: rgba(76, 175, 80, 0.1);
        }

        .player-stat-item .stat-label {
            font-size: 0.7em;
            color: #ccc;
            font-weight: 500;
        }

        .player-stat-item .stat-value {
            font-size: 0.8em;
            font-weight: bold;
            color: #fff;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
        }
        
        /* Enhanced Controls Container */
        .enhanced-controls-container {
            position: absolute;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 12px;
            border-radius: 8px;
            border: 2px solid #444;
            backdrop-filter: blur(8px);
            pointer-events: auto;
            max-width: 200px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            font-size: 0.8em;
        }
        
        .enhanced-controls-title {
            margin: 0 0 10px 0;
            font-size: 1.1em;
            color: #ff6b35;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
            border-bottom: 1px solid #444;
            padding-bottom: 6px;
        }
        
        .control-section {
            margin-bottom: 12px;
        }
        
        .control-section:last-child {
            margin-bottom: 0;
        }
        
        .control-section h4 {
            margin: 0 0 8px 0;
            font-size: 0.9em;
            color: #4CAF50;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: bold;
        }
        
        .current-controls h4 {
            color: #4CAF50;
        }
        
        .control-item {
            display: flex;
            align-items: center;
            margin-bottom: 4px;
            padding: 3px;
            border-radius: 4px;
            transition: background-color 0.3s ease;
        }
        
        .control-item:hover: {
            background-color: rgba(255, 255, 255, 0.1);
        }
        
        .control-key {
            background: linear-gradient(145deg, #333, #222);
            color: #fff;
            padding: 3px 6px;
            border-radius: 4px;
            font-family: monospace;
            font-weight: bold;
            margin-right: 8px;
            min-width: 40px;
            text-align: center;
            border: 1px solid #555;
            font-size: 0.75em;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .control-desc {
            flex: 1;
            font-size: 0.8em;
            line-height: 1.2;
        }

        .control-note {
            flex: 1;
            font-size: 0.7em;
            line-height: 1.2;
            color: #999;
            font-style: italic;
        }

        .mode-indicator {
            flex: 1;
            font-size: 0.8em;
            color: #4CAF50;
            font-weight: bold;
        }

        /* Credits Container */
        .credits-container {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #444;
            backdrop-filter: blur(5px);
            pointer-events: auto;
            font-size: 0.75em;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            max-width: 150px;
            z-index: 1000;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .score-container {
                left: 10px;
                right: 10px;
                transform: none;
                min-width: auto;
                max-width: none;
                padding: 6px 12px;
            }
            
            .horizontal-content {
                gap: 15px;
            }
            
            .statistics-display {
                padding-left: 15px;
            }
            
            .main-title {
                font-size: 0.8em;
            }
            
            .enhanced-controls-container {
                bottom: 10px;
                left: 10px;
                right: 10px;
                max-width: none;
            }

            .credits-container {
                bottom: 10px;
                right: 10px;
                font-size: 0.65em;
                padding: 6px 8px;
            }
        }

        @media (max-width: 600px) {
            .horizontal-content {
                flex-direction: column;
                gap: 8px;
            }
            
            .statistics-display {
                border-left: none;
                border-top: 1px solid #444;
                padding-left: 0;
                padding-top: 8px;
            }
            
            .score-container {
                min-width: auto;
            }

            .credits-container {
                position: relative;
                bottom: auto;
                right: auto;
                margin: 10px auto 0 auto;
                text-align: center;
            }
        }
        
        @media (max-height: 600px) {
            .enhanced-controls-container {
                max-height: 200px;
                overflow-y: auto;
            }
        }
                    .power-bar-container {
            position: fixed;
            right: 20px;
            bottom: 100px;
            width: 40px;
            height: 150px;
            background: rgba(0, 0, 0, 0.7);
            border-radius: 8px;
            border: 2px solid #444;
            padding: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            pointer-events: auto;
            z-index: 1000;
        }
        
        .power-bar-title {
            font-size: 0.6em;
            color: #ccc;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-align: center;
        }
        
        .power-bar-background {
            width: 20px;
            height: 100px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            position: relative;
            overflow: hidden;
        }
        
        .power-bar-fill {
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 50%;
            background: linear-gradient(to top, #4CAF50, #8BC34A);
            border-radius: 10px;
            transition: height 0.1s ease-out;
        }
        
        .power-bar-value {
            font-size: 0.7em;
            color: white;
            margin-top: 8px;
            font-weight: bold;
        }
    `;

    document.head.appendChild(style);
}

// ===== EXPORTS =====
export {
    createCompleteUIFramework,
    updateEnhancedControlsDisplay,
    updateDiagnosticsInfo,
    updateStatistics,
    resetStatistics,
    updatePowerBarDisplay
}
