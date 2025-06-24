import * as utils from './utils.js'
import * as gui from './Gui.js'
import { OrbitControls } from './OrbitControls.js'
import { BasketballCourt } from './Scene/BasketBallCourt.js'
import { Basketball } from './Scene/Basketball.js';
import { BasketballHoops } from './Scene/Hoop.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
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
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.far = 100;


// Create all elements
const courtData = BasketballCourt();
scene.add(courtData.object);

const basketballData = Basketball();
basketballData.object.position.y = courtData.baseHeight + basketballData.baseHeight;
basketballData.object.position.x = 0;
scene.add(basketballData.object);

const hoopData = BasketballHoops();
hoopData.object.position.y = courtData.baseHeight;
scene.add(hoopData.object);

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
  if (e.key === "h" || e.key === "H") {
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

  if (e.key === "o" || e.key === "O") {
    // Toggle orbit controls
    isOrbitEnabled = !isOrbitEnabled;
    gui.updateEnhancedControlsDisplay(uiFramework.controlsContainer, isOrbitEnabled, isDiagnosticsEnabled);
  }

  if (e.key === "c" || e.key === "C") {
    controls.setPresetCamera()
  }

  if (e.key === '`' || e.key === '~') {
    // Toggle diagnostics display
    isDiagnosticsEnabled = !isDiagnosticsEnabled;
    uiFramework.diagnosticsInfoContainer.style.display = (isDiagnosticsEnabled && isUIVisible) ? 'block' : 'none';
  }
}

document.addEventListener('keydown', handleKeyDown);

// Display diagnostics such as camera position/direction, ball position, etc.
function updateDiagnosticsInfo(camera) {
  // Camera position
  const pos = camera.position;
  // Camera facing direction (normalized vector)
  const target = new THREE.Vector3();
  camera.getWorldDirection(target);

  // Format numbers to 2 decimals
  function fmt(v) { return v.toFixed(2); }

  uiFramework.diagnosticsInfoContainer.innerHTML =
    `<b>Camera Position:</b> (${fmt(pos.x)}, ${fmt(pos.y)}, ${fmt(pos.z)})<br>` +
    `<b>Camera Facing:</b> (${fmt(target.x)}, ${fmt(target.y)}, ${fmt(target.z)})`
  uiFramework.diagnosticsInfoContainer.style.display =
    (isDiagnosticsEnabled && isUIVisible) ? 'block' : 'none';
}

function update() {
  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();
  // Update camera diagnostics
  gui.updateDiagnosticsInfo(uiFramework.diagnosticsInfoContainer, camera, isUIVisible, isDiagnosticsEnabled);
  gui.updateEnhancedControlsDisplay(uiFramework.controlsContainer, isOrbitEnabled, isDiagnosticsEnabled)
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

// Start the application
draw();