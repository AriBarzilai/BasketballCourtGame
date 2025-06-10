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
    court.add(utils.Ring(0, height / 2 + utils.LAYER_OFFSET, 0, 6)) // center ring
    court.add(utils.Ring(28, height / 2 + utils.LAYER_OFFSET, 0, 6)) // right ring
    court.add(utils.Ring(-28, height / 2 + utils.LAYER_OFFSET, 0, 6)) // left ring
    court.add(utils.Rectangle(37.5, height / 2 + utils.LAYER_OFFSET, 0, 19, 12)) // right inner rectangle
    court.add(utils.Rectangle(-37.5, height / 2 + utils.LAYER_OFFSET, 0, 19, 12)) // left inner rectangle

    return court
}



//function CenterLine()

export { BasketballCourt };