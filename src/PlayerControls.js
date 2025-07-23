class PlayerControls {
    constructor(basketballCourt, basketballData, hoopData, playerDirArrow, controlMoveSpeed = 20) {
        this.basketballCourt = basketballCourt
        this.basketballData = basketballData;
        this.dirArrow = playerDirArrow; // VFX used to indicate direction and force of throw
        this.hoopData = hoopData
        this.controlMoveSpeed = controlMoveSpeed;
        this.throwForce = 43;
        this.moveStates = {
            ArrowUp: false,
            ArrowLeft: false,
            ArrowDown: false,
            ArrowRight: false,
            throwedBall: false,
            increasePower: false,
            decreasePower: false,
        }

        this.GRAVITY = -19.6 // gravity but scaled
        this.FRICTION_COEFF = 0.99
        this.currVelocity = new THREE.Vector3();

        this.pitch = 0;
        this.pitchSpeed = Math.PI / 3
        this.throwExtraForce = 25; // multiplied by (pitch / (Math.PI / 2)) - steeper angle increases force of throw

        this.dirArrow.setDirection(this.computeAimedDirection());
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
            console.log(this.moveStates)
            if (this.moveStates.increasePower) this.pitch += this.pitchSpeed * deltaTime;
            if (this.moveStates.decreasePower) this.pitch -= this.pitchSpeed * deltaTime;
            this.pitch = THREE.MathUtils.clamp(this.pitch, 0, Math.PI / 2);
        }
        if (moveBy.lengthSq() <= 0 && !(this.moveStates.increasePower || this.moveStates.decreasePower || this.throwedBall)) return;
        if (!this.moveStates.throwedBall) {
            moveBy.normalize().multiplyScalar(deltaTime * this.controlMoveSpeed);
        }
        // out of bounds check
        this.basketballData.object.position.add(moveBy);
        this.dirArrow.position.add(moveBy);

        this.dirArrow.setDirection(this.computeAimedDirection())

        if (this.basketballData.object.position.y < -5) {
            this.resetBall();
        }
    }

    launchBall() {
        if (this.moveStates.throwedBall) return;
        console.log("BALL THROWN");
        this.moveStates = {
            moveUp: false,
            moveLeft: false,
            moveDown: false,
            moveRight: false,
            increasePower: false,
            decreasePower: false,
            throwedBall: true
        };
        this.currVelocity.copy(this.computeAimedDirection().clone().multiplyScalar(this.throwForce + this.throwExtraForce * (this.pitch / (Math.PI) / 2)));
        this.dirArrow.visible = false;
    }

    getDirToHoop() {
        let curr_hoop = null
        // determines which half of the basketball court the basketball is in.
        curr_hoop = this.basketballData.object.position.x >= 0 ? this.hoopData.rightHoop : this.hoopData.leftHoop;
        const hoopWorldPos = new THREE.Vector3();
        curr_hoop.getObjectByName('hoop').getObjectByName('rim').getWorldPosition(hoopWorldPos);

        const ballWorldPos = new THREE.Vector3();
        this.basketballData.object.getWorldPosition(ballWorldPos);

        const direction = new THREE.Vector3();
        direction.subVectors(hoopWorldPos, ballWorldPos)
        direction.y = this.basketballData.object.position.y + this.basketballCourt.baseHeight
        direction.normalize();
        return direction;
    }

    computeAimedDirection() { // takes into accout both direction of hoop and pitch of throw
        // base horizontal dir to hoop
        const flat = this.getDirToHoop().clone();
        console.log(flat)
        flat.y = 0;
        flat.normalize();

        const aimed = flat.clone();
        aimed.y = Math.tan(this.pitch);
        aimed.normalize();
        console.log(this.pitch)
        console.log(aimed)
        return aimed;
    }

    resetBall() {
        console.log('BALL RESET')
        this.moveStates = {
            ArrowUp: false,
            ArrowLeft: false,
            ArrowDown: false,
            ArrowRight: false,
            throwedBall: false,
        }
        this.basketballData.object.position.set(0, this.basketballData.baseHeight + this.basketballCourt.baseHeight, 0)
        this.currVelocity.set(0, 0, 0)
        this.dirArrow.position.copy(this.basketballData.object.position);
        this.dirArrow.visible = true;

        // Optional: reset direction arrow's direction
        this.dirArrow.setDirection(this.computeAimedDirection());
        // this.dirArrow.setDirection(this.computeAimedDirection());
    }
}

export default PlayerControls;
