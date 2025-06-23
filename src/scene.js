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
directionalLight.castShadow = true;

// Create all elements
const courtData = BasketballCourt();
scene.add(courtData.object);

const basketballData = Basketball();
basketballData.object.position.y = courtData.baseHeight + basketballData.baseHeight;
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

// Instructions display
const uiFramework = gui.createCompleteUIFramework(document);
document.body.appendChild(uiFramework.mainContainer);

// Initialize the enhanced controls display
gui.updateEnhancedControlsDisplay(uiFramework.controlsContainer, isOrbitEnabled);

let isUIVisible = true;

// Handle key events
function handleKeyDown(e) {
  if (e.key === "h" || e.key === "H") {
    // Toggle UI visibility
    isUIVisible = !isUIVisible;
    if (isUIVisible) {
      uiFramework.mainContainer.style.display = 'block';
    } 
    else {
      uiFramework.mainContainer.style.display = 'none';
    }
  }
  
  if (e.key === "o" || e.key === "O") {
      // Toggle orbit controls
      isOrbitEnabled = !isOrbitEnabled;
      gui.updateEnhancedControlsDisplay(uiFramework.controlsContainer, isOrbitEnabled);
  }
}

document.addEventListener('keydown', handleKeyDown);

function update() {
  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();
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
update();
draw();