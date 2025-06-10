
const INDEX = {
    "gui": 0
    , "camera": 1
}

function createControlsText(document, cameraIsEnabled = true) {
    const instructionsElement = document.createElement('div');
    instructionsElement.style.position = 'absolute';
    instructionsElement.style.bottom = '20px';
    instructionsElement.style.left = '20px';
    instructionsElement.style.color = 'white';
    instructionsElement.style.fontSize = '16px';
    instructionsElement.style.fontFamily = 'Arial, sans-serif';
    instructionsElement.style.textAlign = 'left';
    instructionsElement.innerHTML = `
    <h3>Controls:</h3>
    <p>H - Hide GUI</p>
    <p>O - Lock orbit camera</p>
    `;
    updateInstructions(instructionsElement, cameraIsEnabled)
    document.body.appendChild(instructionsElement);
    return instructionsElement
}

function _updateOrbitControlText(instructionsElement, isEnabled) {
    if (!instructionsElement) return;
    const pTags = instructionsElement.getElementsByTagName('p');
    if (pTags.length >= 2) {
        pTags[INDEX['camera']].textContent = isEnabled ? "O - Lock orbit camera" : "O - Unlock orbit camera";
    }
}

function updateInstructions(instructionsElement, cameraIsEnabled) {
    _updateOrbitControlText(instructionsElement, cameraIsEnabled)
}


export { createControlsText, updateInstructions }