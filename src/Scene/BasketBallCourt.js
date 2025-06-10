//import * as THREE from 'three'

const LINE_WIDTH = 0.5

// Create basketball court
function BasketballCourt() {
    const courtGeometry = new THREE.BoxGeometry(94, 0.2, 50);
    const { width, height } = courtGeometry.parameters;
    const courtMaterial = new THREE.MeshPhongMaterial({
        color: 0xc68642,  // Brown wood color
        shininess: 50
    });
    const court = new THREE.Mesh(courtGeometry, courtMaterial);
    court.receiveShadow = true;
    court.add(Ring(0, height / 2 + 0.001, 0, 6)) // center ring
    //court.add(Ring(0, height / 2 + 0.001, 0, 6)) // right ring
    return court
}

function Ring(x_offset, y_offset, z_offset, radius) {
    const geometry = new THREE.RingGeometry(radius - LINE_WIDTH / 2, radius + LINE_WIDTH / 2, 32);
    geometry.rotateX(-Math.PI / 2)
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const circle = new THREE.Mesh(geometry, material);
    circle.position.set(x_offset, y_offset, z_offset);
    return circle
}

export { BasketballCourt };