
// a dictionary mapping to indices of each <p> element in the ControlsText
const INDEX = {
    "gui": 0
    , "camera": 1
    , "zoomInOut": 2
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
    <p>Mouse Wheel - Zoom in/out</p>
    `;
    updateInstructions(instructionsElement, cameraIsEnabled)
    document.body.appendChild(instructionsElement);
    return instructionsElement
}

function _updateOrbitControlText(instructionsElement, isEnabled) {
    if (!instructionsElement) return;
    const pTags = instructionsElement.getElementsByTagName('p');
    if (isEnabled) {
        pTags[INDEX['camera']].textContent = "O - Lock orbit camera"
        if (pTags.length <= 2) {
            const zoomP = document.createElement('p');
            zoomP.textContent = 'Mouse Wheel - Zoom in/out';
            instructionsElement.appendChild(zoomP);
        }
    } else {
        pTags[INDEX['camera']].textContent = "O - Unlock orbit camera"
        pTags[INDEX['zoomInOut']].remove()
    }
}

function updateInstructions(instructionsElement, cameraIsEnabled) {
    _updateOrbitControlText(instructionsElement, cameraIsEnabled)
}


export { createControlsText, updateInstructions }