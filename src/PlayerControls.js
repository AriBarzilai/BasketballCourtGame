class PlayerControls {
    constructor(basketballCourt, basketballData, speed = 5) {
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
            moveBy.x += 1;
        }
        if (this.keyStates.ArrowDown) {
            moveBy.x -= 1;
        }
        // Left/right (x axis)
        if (this.keyStates.ArrowLeft) {
            moveBy.z -= 1;
        }
        if (this.keyStates.ArrowRight) {
            moveBy.z += 1;
        }
        if (moveBy.lengthSq() <= 0) return;
        moveBy.normalize().multiplyScalar(deltaTime * this.speed);
        // fix out of bounds check
        // if (moveBy.z + this.basketball.object.position < -1 * this.basketballCourt.object.parameters.width / 2) return;
        this.basketballData.object.position.add(moveBy);
    }
}

export default PlayerControls;
