import * as utils from '../utils.js'


// Create basketball court
function BasketballCourt() {
    ///////////////////////
    // LAYER 0
    ///////////////////////
    const courtThickness = 0.2 // thickness of the court surface
    const courtGeometry = new THREE.BoxGeometry(94, courtThickness, 50);
    const { width, height, depth } = courtGeometry.parameters;
    let layer = 0
    let layerHeight = utils.getLayerHeight(height, layer)

    const courtMaterial = utils.MATERIALS.COURT
    const court = new THREE.Mesh(courtGeometry, courtMaterial);
    court.receiveShadow = true;
    ///////////////////////
    // LAYER 1
    ///////////////////////
    layer += 1
    layerHeight = utils.getLayerHeight(height, layer)
    court.add(utils.Rectangle(0, layerHeight, 0, 94, 50)) // court border
    // left three-point line
    court.add(utils.Line(
        47, layerHeight, 22,
        33, layerHeight, 22))
    court.add(utils.Line(
        47, layerHeight, -22,
        33, layerHeight, -22))
    const mx1 = (47 + 33) / 2
    court.add(utils.Arc(
        33, layerHeight, 22,
        13.75, layerHeight, 0,
        33, layerHeight, -22
    ))
    // right three-point line
    court.add(utils.Line(
        -47, layerHeight, -22,
        -33, layerHeight, -22))
    court.add(utils.Line(
        -47, layerHeight, 22,
        -33, layerHeight, 22))
    const mx2 = (-47 - 33) / 2
    court.add(utils.Arc(
        -33, layerHeight, -22,
        -13.75, layerHeight, 0,
        -33, layerHeight, 22
    ))
    court.add(utils.Ring(0, layerHeight, 0, 6)) // center ring
    court.add(utils.Ring(28, layerHeight, 0, 6)) // right ring
    court.add(utils.Ring(-28, layerHeight, 0, 6)) // left ring
    court.add(utils.Rectangle(37.5, layerHeight, 0, 19, 12)) // right inner rectangle
    court.add(utils.Rectangle(-37.5, layerHeight, 0, 19, 12)) // left inner rectangle
    court.add(utils.Line( // center line
        0, layerHeight, 25,
        0, layerHeight, -25))
    ///////////////////////
    // COURT SURFACE Y VALUE
    ///////////////////////
    const baseFloorHeight = layerHeight // this is the "practical" Y=0 for the game
    ///////////////////////
    // LAYER NEG 1
    ///////////////////////
    layer = -1
    layerHeight = utils.getLayerHeight(height, layer)
    const courtSurroundingGeometry = new THREE.BoxGeometry(109, 0.1, 60);
    const courtSurroundingMaterial = utils.MATERIALS.COURT_SURROUNDINGS
    const courtSurrounding = new THREE.Mesh(courtSurroundingGeometry, courtSurroundingMaterial);
    courtSurrounding.position.set(0, -0.1 + layerHeight, 0)
    courtSurrounding.receiveShadow = true;

    court.add(courtSurrounding)
    court.add(createCourtLogo());

    return {
        object: court
        , baseHeight: baseFloorHeight
        , width: width
        , depth: depth
        , courtSurroundingWidth: courtSurroundingGeometry.parameters.width
        , courtSurroundingDepth: courtSurroundingGeometry.parameters.depth
    }
}

function createCourtLogo() {
    const textureLoader = new THREE.TextureLoader();

    const logoTexture = textureLoader.load('src/Scene/textures/logo.svg');
    // logoTexture.minFilter = THREE.NearestMipMapLinearFilter;
    logoTexture.minFilter = THREE.LinearFilter;
    const logoMaterial = new THREE.MeshPhongMaterial({
        map: logoTexture,
        transparent: true,
        alphaTest: 0.1,
        side: THREE.DoubleSide
    });

    const logoGeometry = new THREE.PlaneGeometry(14, 14);
    logoGeometry.rotateX(-Math.PI / 2);
    const logoMesh = new THREE.Mesh(logoGeometry, logoMaterial);
    logoMesh.position.set(0, 0.12, 0.5);
    logoMesh.receiveShadow = true
    return logoMesh;
}

export { BasketballCourt };