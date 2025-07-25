class PlayerControls {
    constructor(basketballCourt, basketballData, hoopData, playerDirArrow, audioManager, basketballTrail, controlMoveSpeed = 20) {
        this.basketballCourt = basketballCourt
        this.basketballData = basketballData;
        this.dirArrow = playerDirArrow; // VFX used to indicate direction and force of throw
        this.hoopData = hoopData
        this.controlMoveSpeed = controlMoveSpeed;
        this.audioManager = audioManager; // AudioManager instance for sound effects
        this.basketballTrail = basketballTrail;
        this.moveStates = {
            ArrowUp: false,
            ArrowLeft: false,
            ArrowDown: false,
            ArrowRight: false,
            throwedBall: false,
            increasePower: false,
            decreasePower: false,
        }


        ////////////////////
        // AIM BALL
        ////////////////////
        this.pitch = 0;
        this.pitchSpeed = Math.PI / 3
        this.throwExtraForce = 25; // multiplied by (pitch / (Math.PI / 2)) - steeper angle increases force of throw
        this.throwForce = 43;

        ////////////////////
        // BALL PHYSICS
        ////////////////////
        this.GRAVITY = -19.6 // gravity but scaled
        this.FRICTION_COEFF = 0.99
        this.currVelocity = new THREE.Vector3();
        this.RESTITUTION = 0.7 // 1 = perfectly elastic, 0 = perfectly bouncy
        this.MIN_BOUNCE_SPEED = 2;   // below this vertical speed, do NOT bounce
        this.ROLL_DAMP = 0.96;  // extra horizontal damping when resting on floor
        this.SLEEP_SPEED = 1;  // below this overall speed, stop completely


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
            if (this.moveStates.increasePower) this.pitch += this.pitchSpeed * deltaTime;
            if (this.moveStates.decreasePower) this.pitch -= this.pitchSpeed * deltaTime;
            this.pitch = THREE.MathUtils.clamp(this.pitch, 0, Math.PI / 2);
        }
        if (moveBy.lengthSq() <= 0 && !(this.moveStates.increasePower || this.moveStates.decreasePower || this.moveStates.throwedBall)) return;
        if (!this.moveStates.throwedBall) {
            moveBy.normalize().multiplyScalar(deltaTime * this.controlMoveSpeed);
        }
        // out of bounds check
        this.basketballData.object.position.add(moveBy);
        this.dirArrow.position.add(moveBy);
        if (this.moveStates.throwedBall) {
            this.handleCollisions();
        }
        this.dirArrow.setDirection(this.computeAimedDirection())

        if (this.basketballData.object.position.y < -5) {
            this.resetBall();
        } else if (this.currVelocity.lengthSq() < 0.05 && this.basketballData.object.position.y <= 1) {
            this.currVelocity.roundToZero()
            this.moveStates.throwedBall = false
            this.updateDirArrow();
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
        if (this.currVelocity.y > 0) {
            this.basketballTrail.startTrail();
        }
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
        flat.y = 0;
        flat.normalize();

        const aimed = flat.clone();
        aimed.y = Math.tan(this.pitch);
        aimed.normalize();
        return aimed;
    }

    handleCollisions() {
        // Convenient shorthands
        const pos = this.basketballData.object.position;
        const vel = this.currVelocity;

        // Court extents minus ball radius
        const halfW = this.basketballCourt.width * 0.5 - this.basketballData.baseHeight;
        const halfD = this.basketballCourt.depth * 0.5 - this.basketballData.baseHeight;
        const floorY = this.basketballCourt.baseHeight + this.basketballData.baseHeight;

        // ── FLOOR ────────────────────────────────────────────────
        if (pos.y < floorY) {
            pos.y = floorY;

            if (Math.abs(vel.y) > this.MIN_BOUNCE_SPEED) {
                // big enough hit → bounce
                vel.y = -vel.y * this.RESTITUTION;
            } else {
                // Stop trail effect
                this.basketballTrail.stopTrail();

                // too small → stick to floor, start rolling / stopping
                vel.y = 0;
                // extra damping to make it gently roll/stop
                vel.x *= this.ROLL_DAMP;
                vel.z *= this.ROLL_DAMP;
                // If we've basically stopped, sleep it
                if (vel.lengthSq() < this.SLEEP_SPEED * this.SLEEP_SPEED && vel.y <= 1) {
                    console.log(vel)
                    vel.set(0, 0, 0);
                    this.moveStates.throwedBall = false;
                }
            }
        }

        // kill negligible bounce so ball finally rests
        if (Math.abs(vel.y) < 0.2) vel.y = 0;
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
        this.updateDirArrow();
    }

    updateDirArrow() {
        this.dirArrow.position.copy(this.basketballData.object.position);
        this.dirArrow.visible = true;
        this.dirArrow.setDirection(this.computeAimedDirection());
    }


    getBallSpeed() {
        return this.currVelocity ? this.currVelocity.lengthSq() : 0
    }
}

export default PlayerControls;
