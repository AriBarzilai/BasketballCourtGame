class PlayerControls {
    constructor(basketballCourt, basketballData, hoopData, playerDirArrow, speed = 20) {
        this.basketballCourt = basketballCourt
        this.basketballData = basketballData;
        this.dirArrow = playerDirArrow; // VFX used to indicate direction and force of throw
        this.hoopData = hoopData
        this.speed = speed;
        this.keyStates = {
            ArrowUp: false,
            ArrowLeft: false,
            ArrowDown: false,
            ArrowRight: false,
        };

        this.dirArrow
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
        this.dirArrow.position.add(moveBy);

        this.dirArrow.setDirection(this.get_dir_to_hoop())
    }

    get_dir_to_hoop() {
        let curr_hoop = null
        // determines which half of the basketball court the basketball is in.
        curr_hoop = this.basketballData.object.position.x >= 0 ? this.hoopData.rightHoop : this.hoopData.leftHoop;
        const hoopWorldPos = new THREE.Vector3();
        curr_hoop.getObjectByName('hoop').getWorldPosition(hoopWorldPos);

        const ballWorldPos = new THREE.Vector3();
        this.basketballData.object.getWorldPosition(ballWorldPos);

        const direction = new THREE.Vector3();
        direction.subVectors(hoopWorldPos, ballWorldPos).normalize;
        direction.normalize()
        return direction
    }
}

export default PlayerControls;
