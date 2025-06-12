import * as utils from '../utils.js'


// Create basketball court
function BasketballCourt() {
    ///////////////////////
    // LAYER 0
    ///////////////////////
    const courtThickness = 0.2 // thickness of the court surface
    const courtGeometry = new THREE.BoxGeometry(94, courtThickness, 50);
    const { width, height } = courtGeometry.parameters;
    let layer = 0
    let layerHeight = utils.getLayerHeight(height, layer)

    const courtMaterial = new THREE.MeshPhongMaterial({
        color: utils.COLORS.BROWN,
        shininess: 50
    });
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
    const courtSurroundingMaterial = new THREE.MeshPhongMaterial({
        color: utils.COLORS.GREEN,
        shininess: 30
    });
    const courtSurrounding = new THREE.Mesh(courtSurroundingGeometry, courtSurroundingMaterial);
    courtSurrounding.position.set(0, -0.1 + layerHeight, 0)
    courtSurrounding.receiveShadow = true;

    court.add(courtSurrounding)

    return {
        object: court
        , baseHeight: baseFloorHeight
    }
}

export { BasketballCourt };