function initPlayerDirectionArrow(basketballData) {
    const dir = new THREE.Vector3(1, 2, 0);
    const origin = basketballData.object.position;
    const length = 3.5;
    const hex = 0x8B0000;

    //normalize the direction vector (convert to vector of length 1)
    dir.normalize();

    const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
    return arrowHelper
}

export { initPlayerDirectionArrow }