import * as utils from '../utils.js'


// Create basketball court
function BasketballCourt() {
    // LAYER 0
    const courtGeometry = new THREE.BoxGeometry(94, 0.2, 50);
    const { width, height } = courtGeometry.parameters;
    const courtMaterial = new THREE.MeshPhongMaterial({
        color: utils.COLORS.BROWN,  // Brown wood color
        shininess: 50
    });
    const court = new THREE.Mesh(courtGeometry, courtMaterial);
    court.receiveShadow = true;
    // LAYER 1
    let layerHeight = utils.getLayerHeight(height, 1)
    court.add(utils.Rectangle(0, layerHeight, 0, 94, 50)) // court border
    court.add(utils.Ring(0, layerHeight, 0, 6)) // center ring
    court.add(utils.Ring(28, layerHeight, 0, 6)) // right ring
    court.add(utils.Ring(-28, layerHeight, 0, 6)) // left ring
    court.add(utils.Rectangle(37.5, layerHeight, 0, 19, 12)) // right inner rectangle
    court.add(utils.Rectangle(-37.5, layerHeight, 0, 19, 12)) // left inner rectangle
    court.add(utils.Line( // center line
        0, layerHeight, 25,
        0, layerHeight, -25))
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
    //court.add(utils.Line(-47, layerHeight, 22, 33, layerHeight, 22))
    //court.add(utils.Line(-47, layerHeight, -22, 33, layerHeight, -22))
    return court
}
//function CenterLine()

export { BasketballCourt };