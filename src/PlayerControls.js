class PlayerControls {
    constructor(basketballCourt, basketballData, speed = 20) {
        this.basketballCourt = basketballCourt
        this.basketballData = basketballData;
        this.speed = speed;
        this.keyStates = {
            ArrowUp: false,
            ArrowLeft: false,
            ArrowDown: false,
            ArrowRight: false,
        };
    }

    update(deltaTime) {
        const moveBy = new THREE.Vector3();
        // Forward/backward (z axis)
        if (this.keyStates.ArrowUp) {
            if (moveBy.x + this.basketballData.object.position.x < this.basketballCourt.width / 2) moveBy.x += 1;
        }
        if (this.keyStates.ArrowDown) {
            if (moveBy.x + this.basketballData.object.position.x > -1 * this.basketballCourt.width / 2) moveBy.x -= 1;
        }
        // Left/right (x axis)
        if (this.keyStates.ArrowLeft) {
            if (moveBy.z + this.basketballData.object.position.z > -1 * this.basketballCourt.depth / 2) moveBy.z -= 1;
        }
        if (this.keyStates.ArrowRight) {
            if (moveBy.z + this.basketballData.object.position.z < this.basketballCourt.depth / 2) moveBy.z += 1;
        }
        if (moveBy.lengthSq() <= 0) return;
        moveBy.normalize().multiplyScalar(deltaTime * this.speed);
        // out of bounds check
        this.basketballData.object.position.add(moveBy);
    }
}

export default PlayerControls;
