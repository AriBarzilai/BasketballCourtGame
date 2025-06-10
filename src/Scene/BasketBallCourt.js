//import * as THREE from 'three'

const LINE_WIDTH = 0.5

// Create basketball court
function BasketballCourt() {
    const courtGeometry = new THREE.BoxGeometry(94, 0.2, 50);
    const courtMaterial = new THREE.MeshPhongMaterial({
        color: 0xc68642,  // Brown wood color
        shininess: 50
    });
    const court = new THREE.Mesh(courtGeometry, courtMaterial);
    court.receiveShadow = true;
    court.add(centerRing(court))
    return court
}

function centerRing(court) {
    const { width, height } = court.geometry.parameters;
    const radius = 6
    const geometry = new THREE.RingGeometry(radius - LINE_WIDTH / 2, radius + LINE_WIDTH / 2, 32);
    geometry.rotateX(-Math.PI / 2)
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const circle = new THREE.Mesh(geometry, material);
    circle.position.set(0, height / 2 + 0.001, 0);
    return circle
}

export { BasketballCourt };