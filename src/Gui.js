function createScoreContainer(document) {
    const container = document.createElement('div');
    container.id = 'score-container';
    container.className = 'score-container';

    // Create score title
    const scoreTitle = document.createElement('h2');
    scoreTitle.textContent = 'Score Board';
    scoreTitle.className = 'score-title';

    // Create score display area
    const scoreDisplay = document.createElement('div');
    scoreDisplay.id = 'score-display';
    scoreDisplay.className = 'score-display';
    scoreDisplay.innerHTML = `
        <div class="team-score">
            <span class="team-name">Player</span>
            <span class="score-value" id="player-score">0</span>
        </div>
        <div class="score-separator">-</div>
        <div class="team-score">
            <span class="team-name">Computer</span>
            <span class="score-value" id="computer-score">0</span>
        </div>
    `;

    container.appendChild(scoreTitle);
    container.appendChild(scoreDisplay);

    return container;
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
function updateEnhancedControlsDisplay(controlsContainer, isOrbitEnabled, isDiagnosticsEnabled) {
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
        </div>
    `;

    // Play controls
    const playControls = `
        <div class="control-section future-controls">
            <h4>Ball Controls:</h4>
            <div class="control-item disabled">
                <span class="control-key">Arrow Keys</span>
                <span class="control-desc">Move ball</span>
            </div>
            <div class="control-item disabled">
                <span class="control-key">W/S</span>
                <span class="control-desc">Increase/Decrease shot power</span>
            </div>
            <div class="control-item disabled">
                <span class="control-key">Space</span>
                <span class="control-desc">Launch ball toward hoop</span>
            </div>
            <div class="control-item disabled">
                <span class="control-key">R</span>
                <span class="control-desc">Reset ball to center</span>
            </div>
        </div>
    `;
    controlsList.innerHTML = currentControls + playControls;
}

// Display diagnostics such as camera position/direction, ball position, etc.
function updateDiagnosticsInfo(diagnosticsInfoContainer, camera, basketball, isUIVisible, isDiagnosticsEnabled) {
    // Camera position
    const cameraPos = camera.position;
    // Camera facing direction (normalized vector)
    const cameraFacing = new THREE.Vector3();
    const basketballPos = basketball.object.position;
    camera.getWorldDirection(cameraFacing);

    // Format numbers to 2 decimals
    function fmt(v) { return v.toFixed(2); }

    diagnosticsInfoContainer.innerHTML =
        `<b>Camera Position:</b> (${fmt(cameraPos.x)}, ${fmt(cameraPos.y)}, ${fmt(cameraPos.z)})<br>` +
        `<b>Camera Facing:</b> (${fmt(cameraFacing.x)}, ${fmt(cameraFacing.y)}, ${fmt(cameraFacing.z)})<br>` +
        `<b>Basketball Position:</b> (${fmt(basketballPos.x)}, ${fmt(basketballPos.y)}, ${fmt(basketballPos.z)})`
    diagnosticsInfoContainer.style.display =
        (isDiagnosticsEnabled && isUIVisible) ? 'block' : 'none';
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

    mainContainer.appendChild(scoreContainer);
    mainContainer.appendChild(controlsContainer);
    mainContainer.appendChild(diagnosticsInfoContainer);


    return {
        mainContainer: mainContainer
        , scoreContainer: scoreContainer
        , controlsContainer: controlsContainer
        , diagnosticsInfoContainer: diagnosticsInfoContainer
    };
}


// Add comprehensive CSS styles for the UI framework
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
        
        /* Score Container Styles */
        .score-container {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 12px;
            border-radius: 12px;
            border: 2px solid #444;
            backdrop-filter: blur(8px);
            pointer-events: auto;
            min-width: 150px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .score-title {
            margin: 0 0 10px 0;
            font-size: 1.1em;
            color: #ff6b35;
            text-align: center;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
            border-bottom: 1px solid #444;
            padding-bottom: 8px;
        }
        
        .score-display {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        
        .team-score {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
        }
        
        .team-name {
            font-size: 0.85em;
            margin-bottom: 4px;
            color: #bbb;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .score-value {
            font-size: 1.4em;
            font-weight: bold;
            color: #4CAF50;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        
        .score-separator {
            font-size: 1.5em;
            font-weight: bold;
            margin: 0 15px;
            color: #666;
        }
        
        .score-note {
            font-size: 0.75em;
            color: #888;
            text-align: center;
            margin: 8px 0 0 0;
            font-style: italic;
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
        
        .future-controls {
            border-top: 1px solid #444;
            padding-top: 10px;
            opacity: 0.7;
        }
        
        .future-controls h4 {
            color: #ff9800;
        }
        
        .control-item {
            display: flex;
            align-items: center;
            margin-bottom: 4px;
            padding: 3px;
            border-radius: 4px;
            transition: background-color 0.3s ease;
        }
        
        .control-item:hover:not(.disabled) {
            background-color: rgba(255, 255, 255, 0.1);
        }
        
        .control-item.disabled {
            opacity: 0.5;
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
        
        .disabled .control-key {
            background: linear-gradient(145deg, #444, #333);
            color: #888;
            border-color: #666;
        }
        
        .control-desc {
            flex: 1;
            font-size: 0.8em;
            line-height: 1.2;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .score-container {
                top: 10px;
                left: 10px;
                right: 10px;
                transform: none;
                min-width: auto;
            }
            
            .enhanced-controls-container {
                bottom: 10px;
                left: 10px;
                right: 10px;
                max-width: none;
            }
        }
        
        @media (max-height: 600px) {
            .enhanced-controls-container {
                max-height: 200px;
                overflow-y: auto;
            }
        }
    `;

    document.head.appendChild(style);
}

// ===== EXPORTS =====
export {
    createCompleteUIFramework,
    updateEnhancedControlsDisplay,
    updateDiagnosticsInfo,
}
