class PlayerControls {
    constructor(basketballCourt, basketballData, hoopData, playerDirArrow, controlMoveSpeed = 20) {
        this.basketballCourt = basketballCourt
        this.basketballData = basketballData;
        this.dirArrow = playerDirArrow; // VFX used to indicate direction and force of throw
        this.hoopData = hoopData
        this.controlMoveSpeed = controlMoveSpeed;
        this.throwForce = 50;
        this.moveStates = {
            ArrowUp: false,
            ArrowLeft: false,
            ArrowDown: false,
            ArrowRight: false,
            throwedBall: false,
        }

        this.GRAVITY = -9.8 * 0.5 // gravity but scaled
        this.FRICTION_COEFF = 0.99
        this.currVelocity = new THREE.Vector3();
    }

    update(deltaTime) {
        let moveBy;
        if (this.moveStates.throwedBall) { // if object is in throwing  mode
            moveBy = this.currVelocity.clone()
            moveBy.multiplyScalar(deltaTime)
            this.currVelocity.y += this.GRAVITY * deltaTime
            this.currVelocity.multiplyScalar(this.FRICTION_COEFF)
        } else { // else if object is in playerControl mode
            moveBy = new THREE.Vector3();
            // Forward/backward (z axis)
            if (this.moveStates.ArrowUp) {
                if (moveBy.x + this.basketballData.object.position.x < this.basketballCourt.width / 2 - this.basketballData.baseHeight) moveBy.x += 1;
            }
            if (this.moveStates.ArrowDown) {
                if (moveBy.x + this.basketballData.object.position.x > -1 * (this.basketballCourt.width / 2 - this.basketballData.baseHeight)) moveBy.x -= 1;
            }
            // Left/right (x axis)
            if (this.moveStates.ArrowLeft) {
                if (moveBy.z + this.basketballData.object.position.z > -1 * (this.basketballCourt.depth / 2 - this.basketballData.baseHeight)) moveBy.z -= 1;
            }
            if (this.moveStates.ArrowRight) {
                if (moveBy.z + this.basketballData.object.position.z < this.basketballCourt.depth / 2 - this.basketballData.baseHeight) moveBy.z += 1;
            }
        }
        if (moveBy.lengthSq() <= 0) return;
        if (!this.moveStates.throwedBall) {
            moveBy.normalize().multiplyScalar(deltaTime * this.controlMoveSpeed);
        }
        // out of bounds check
        this.basketballData.object.position.add(moveBy);
        this.dirArrow.position.add(moveBy);

        this.dirArrow.setDirection(this.get_dir_to_hoop())
    }

    launchBall() {
        console.log("BALL THROWN");
        this.moveStates = {
            moveUp: false,
            moveLeft: false,
            moveDown: false,
            moveRight: false,
            throwedBall: true
        };
        this.currVelocity.copy(this.get_dir_to_hoop().clone().multiplyScalar(this.throwForce));
    }

    get_dir_to_hoop() {
        let curr_hoop = null
        // determines which half of the basketball court the basketball is in.
        curr_hoop = this.basketballData.object.position.x >= 0 ? this.hoopData.rightHoop : this.hoopData.leftHoop;
        const hoopWorldPos = new THREE.Vector3();
        curr_hoop.getObjectByName('hoop').getObjectByName('rim').getWorldPosition(hoopWorldPos);

        const ballWorldPos = new THREE.Vector3();
        this.basketballData.object.getWorldPosition(ballWorldPos);

        const direction = new THREE.Vector3();
        direction.subVectors(hoopWorldPos, ballWorldPos).normalize();
        return direction;
        return direction
    }
}

export default PlayerControls;
