import * as utils from './utils.js'
import * as gui from './Gui.js'
import { OrbitControls } from './OrbitControls.js'
import { BasketballCourt } from './Scene/BasketBallCourt.js'
import { Basketball } from './Scene/Basketball.js';
import { BasketballHoops } from './Scene/Hoop.js';
import PlayerControls from './PlayerControls.js'
import { initPlayerDirectionArrow } from './Scene/playerVFX.js';
import AudioManager from './AudioManager.js'
import BasketballTrailEffect from './BasketballTrailEffect.js'

const CLOCK = new THREE.Clock()

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

///////////////////////////////////////////////
// AUDIO SOUNDS /
///////////////////////////////////////////////

const audioManager = new AudioManager();
let audioInitialized = false;

// Function to initialize audio on first user interaction
function initializeAudioOnFirstInteraction() {
  if (!audioInitialized) {
    audioManager.preloadSounds();
    audioManager.startBackgroundMusic();
    audioInitialized = true;
    console.log("🎵 Audio system initialized - background music and sounds active!");
  }
}

///////////////////////////////////
// SCENE OBJECTS
///////////////////////////////////

// Set background color
scene.background = new THREE.Color(utils.COLORS.BLACK);

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(utils.COLORS.WHITE, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(utils.COLORS.WHITE, 0.8);
directionalLight.position.set(10, 20, 15);

scene.add(directionalLight);

// Enable shadows
renderer.shadowMap.enabled = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.castShadow = true;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.far = 100;


// Create all elements
const courtData = BasketballCourt();
scene.add(courtData.object);

const basketballData = Basketball();
basketballData.object.position.y = courtData.baseHeight + basketballData.baseHeight;
basketballData.object.position.x = 0;
scene.add(basketballData.object);

const basketballTrail = new BasketballTrailEffect(scene, basketballData);

const hoopData = BasketballHoops();
hoopData.leftHoop.position.y = courtData.baseHeight;
scene.add(hoopData.leftHoop);
hoopData.rightHoop.position.y = courtData.baseHeight;
scene.add(hoopData.rightHoop);

const playerDirArrow = initPlayerDirectionArrow(basketballData)
scene.add(playerDirArrow)

///////////////////////////////////////////////
// CAMERA / CONTROLS / UI
///////////////////////////////////////////////

// Add player controls for basketball
const playerControls = new PlayerControls(courtData, basketballData, hoopData, playerDirArrow, audioManager, basketballTrail);

// Set camera position for better view
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 30, 60);
camera.applyMatrix4(cameraTranslate);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;
let isDiagnosticsEnabled = false;

// Instructions display
const uiFramework = gui.createCompleteUIFramework(document);
document.body.appendChild(uiFramework.mainContainer);

// Initialize the enhanced controls display
gui.updateEnhancedControlsDisplay(uiFramework.controlsContainer, isOrbitEnabled);

// Add camera info container to DOM (top left)
document.body.appendChild(uiFramework.diagnosticsInfoContainer);


let isUIVisible = true;
// Handle key events
function handleKeyDown(e) {
  initializeAudioOnFirstInteraction();
  const key = e.key.toLowerCase();
  if (key === "h") {
    // Toggle UI visibility
    isUIVisible = !isUIVisible;
    if (isUIVisible) {
      uiFramework.mainContainer.style.display = 'block';
      uiFramework.diagnosticsInfoContainer.style.display = isDiagnosticsEnabled ? 'block' : 'block';
    }
    else {
      uiFramework.mainContainer.style.display = 'none';
      uiFramework.diagnosticsInfoContainer.style.display = 'none';
    }
  }

  if (key === "o") {
    // Toggle orbit controls
    isOrbitEnabled = !isOrbitEnabled;
    gui.updateEnhancedControlsDisplay(uiFramework.controlsContainer, isOrbitEnabled, isDiagnosticsEnabled);
  }

  if (key === "c") {
    controls.setPresetCamera()
  }

  if (key === '`') {
    // Toggle diagnostics display
    isDiagnosticsEnabled = !isDiagnosticsEnabled;
    uiFramework.diagnosticsInfoContainer.style.display = (isDiagnosticsEnabled && isUIVisible) ? 'block' : 'none';
  }

  if (key === 'r') {
    playerControls.resetBall();

  }

  if (['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(e.key)) {
    playerControls.moveStates[e.key] = true;
  }

  if (key === ' ') {
    playerControls.launchBall();
  }

  if (key === 'w') {
    playerControls.moveStates.increasePower = true;
    playerControls.moveStates.decreasePower = false;
  } else if (key == 's') {
    playerControls.moveStates.decreasePower = true;
    playerControls.moveStates.increasePower = false;
  }
}

function handleKeyUp(e) {
  const key = e.key.toLowerCase();
  if (['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(e.key)) {
    playerControls.moveStates[e.key] = false;
  }
  if (key === 'w') {
    playerControls.moveStates.increasePower = false;
  } else if (key == 's') {
    playerControls.moveStates.decreasePower = false;
  }
}


document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

function update() {
  const deltaTime = CLOCK.getDelta();
  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();
  // Update player controls
  playerControls.update(deltaTime);
  // Update trail effect
  if (playerControls.moveStates.throwedBall) {
    basketballTrail.update();
  }
  // Update camera diagnostics
  gui.updateDiagnosticsInfo(uiFramework.diagnosticsInfoContainer, camera, basketballData, playerControls, isUIVisible, isDiagnosticsEnabled);
  gui.updateEnhancedControlsDisplay(uiFramework.controlsContainer, isOrbitEnabled, isDiagnosticsEnabled)
  gui.updateStatistics()
}

// Animation function
function draw() {
  update();
  requestAnimationFrame(draw);
  renderer.render(scene, camera);
}

// Handle window resize
function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', handleResize);

// Cleanup on unload
window.addEventListener('beforeunload', () => {
  audioManager.cleanup();
});

// Start the application
console.log("GAME START")
draw();