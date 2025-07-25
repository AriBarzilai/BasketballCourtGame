class PlayerControls {
    constructor(basketballCourt, basketballData, hoopData, playerDirArrow, audioManager,basketballTrail, controlMoveSpeed = 20) {
        this.basketballCourt = basketballCourt
        this.basketballData = basketballData;
        this.dirArrow = playerDirArrow; // VFX used to indicate direction and force of throw
        this.hoopData = hoopData
        this.audioManager = audioManager; // AudioManager instance for sound effects
        this.basketballTrail = basketballTrail;
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

    // update(deltaTime) {
    //     let moveBy;
    //     if (this.moveStates.throwedBall) { // if object is in throwing  mode
    //         moveBy = this.currVelocity.clone()
    //         moveBy.multiplyScalar(deltaTime)
    //         this.currVelocity.y += this.GRAVITY * deltaTime
    //         this.currVelocity.multiplyScalar(this.FRICTION_COEFF)
    //     } else { // else if object is in playerControl mode
    //         moveBy = new THREE.Vector3();
    //         // Forward/backward (z axis)
    //         if (this.moveStates.ArrowUp) {
    //             if (moveBy.x + this.basketballData.object.position.x < this.basketballCourt.width / 2 - this.basketballData.baseHeight) moveBy.x += 1;
    //         }
    //         if (this.moveStates.ArrowDown) {
    //             if (moveBy.x + this.basketballData.object.position.x > -1 * (this.basketballCourt.width / 2 - this.basketballData.baseHeight)) moveBy.x -= 1;
    //         }
    //         // Left/right (x axis)
    //         if (this.moveStates.ArrowLeft) {
    //             if (moveBy.z + this.basketballData.object.position.z > -1 * (this.basketballCourt.depth / 2 - this.basketballData.baseHeight)) moveBy.z -= 1;
    //         }
    //         if (this.moveStates.ArrowRight) {
    //             if (moveBy.z + this.basketballData.object.position.z < this.basketballCourt.depth / 2 - this.basketballData.baseHeight) moveBy.z += 1;
    //         }
    //         console.log(this.moveStates)
    //         if (this.moveStates.increasePower) this.pitch += this.pitchSpeed * deltaTime;
    //         if (this.moveStates.decreasePower) this.pitch -= this.pitchSpeed * deltaTime;
    //         this.pitch = THREE.MathUtils.clamp(this.pitch, 0, Math.PI / 2);
    //     }
    //     if (moveBy.lengthSq() <= 0 && !(this.moveStates.increasePower || this.moveStates.decreasePower || this.throwedBall)) return;
    //     if (!this.moveStates.throwedBall) {
    //         moveBy.normalize().multiplyScalar(deltaTime * this.controlMoveSpeed);
    //     }
    //     // out of bounds check
    //     this.basketballData.object.position.add(moveBy);
    //     this.dirArrow.position.add(moveBy);

    //     this.dirArrow.setDirection(this.computeAimedDirection())

    //     if (this.basketballData.object.position.y < -5) {
    //         this.resetBall();
    //     }
    // }

    update(deltaTime) {
        let moveBy = new THREE.Vector3();
        
        if (this.moveStates.throwedBall) { 
            // Handle thrown ball physics
            moveBy = this.currVelocity.clone();
            moveBy.multiplyScalar(deltaTime);
            this.currVelocity.y += this.GRAVITY * deltaTime;
            this.currVelocity.multiplyScalar(this.FRICTION_COEFF);
            
            // Check if ball has hit the ground ONLY when ball is thrown AND falling
            const groundLevel = this.basketballData.baseHeight + this.basketballCourt.baseHeight;
            if (this.basketballData.object.position.y <= groundLevel && this.currVelocity.y <= 0) {
                this.handleBallLanding();
                return;
            }
        } else {
            // Player control mode - ball is on ground and player can move it
            moveBy = new THREE.Vector3();
            
            // Forward/backward movement (x axis)
            if (this.moveStates.ArrowUp) {
                if (this.basketballData.object.position.x < this.basketballCourt.width / 2 - this.basketballData.baseHeight) {
                    moveBy.x += 1;
                }
            }
            if (this.moveStates.ArrowDown) {
                if (this.basketballData.object.position.x > -1 * (this.basketballCourt.width / 2 - this.basketballData.baseHeight)) {
                    moveBy.x -= 1;
                }
            }
            
            // Left/right movement (z axis)
            if (this.moveStates.ArrowLeft) {
                if (this.basketballData.object.position.z > -1 * (this.basketballCourt.depth / 2 - this.basketballData.baseHeight)) {
                    moveBy.z -= 1;
                }
            }
            if (this.moveStates.ArrowRight) {
                if (this.basketballData.object.position.z < this.basketballCourt.depth / 2 - this.basketballData.baseHeight) {
                    moveBy.z += 1;
                }
            }
            
            // Power adjustment
            if (this.moveStates.increasePower) {
                this.pitch += this.pitchSpeed * deltaTime;
            }
            if (this.moveStates.decreasePower) {
                this.pitch -= this.pitchSpeed * deltaTime;
            }
            this.pitch = THREE.MathUtils.clamp(this.pitch, 0, Math.PI / 2);
            
            // Scale movement for player control
            if (moveBy.lengthSq() > 0) {
                moveBy.normalize().multiplyScalar(deltaTime * this.controlMoveSpeed);
            }
        }
        
        // Apply movement (for both thrown ball and player control)
        if (moveBy.lengthSq() > 0 || this.moveStates.increasePower || this.moveStates.decreasePower) {
            this.basketballData.object.position.add(moveBy);
            
            // Update direction arrow position (only when not thrown)
            if (!this.moveStates.throwedBall) {
                this.dirArrow.position.copy(this.basketballData.object.position);
                this.dirArrow.setDirection(this.computeAimedDirection());
            }
        }
        
        // Safety check - reset if ball falls below court
        if (this.basketballData.object.position.y < -5) {
            this.resetBall();
        }
    }

    // launchBall() {
    //     if (this.moveStates.throwedBall) return;
    //     console.log("BALL THROWN");
    //     this.moveStates = {
    //         moveUp: false,
    //         moveLeft: false,
    //         moveDown: false,
    //         moveRight: false,
    //         increasePower: false,
    //         decreasePower: false,
    //         throwedBall: true
    //     };
    //     this.basketballTrail.startTrail();
    //     this.currVelocity.copy(this.computeAimedDirection().clone().multiplyScalar(this.throwForce + this.throwExtraForce * (this.pitch / (Math.PI) / 2)));
    //     this.dirArrow.visible = false;
    // }
    launchBall() {
        if (this.moveStates.throwedBall) return;
        console.log("BALL THROWN");
        
        // ✅ FIXED: Use correct property names
        this.moveStates = {
            ArrowUp: false,       // ✅ Correct arrow key names
            ArrowLeft: false,     // ✅ Correct arrow key names
            ArrowDown: false,     // ✅ Correct arrow key names
            ArrowRight: false,    // ✅ Correct arrow key names
            increasePower: false,
            decreasePower: false,
            throwedBall: true
        };
        
        // Calculate throw direction and velocity
        const throwDirection = this.computeAimedDirection().clone();
        const totalThrowForce = this.throwForce + this.throwExtraForce * (this.pitch / (Math.PI / 2));
        this.currVelocity.copy(throwDirection.multiplyScalar(totalThrowForce));
        
        // Ensure minimum upward velocity for realistic throws
        if (this.currVelocity.y < 5) {
            this.currVelocity.y = Math.max(this.currVelocity.y, 5);
        }
        
        // Lift ball slightly off ground to avoid immediate collision
        const groundLevel = this.basketballData.baseHeight + this.basketballCourt.baseHeight;
        this.basketballData.object.position.y = groundLevel + 0.1;
        
        this.dirArrow.visible = false;
        
        // Start the basketball trail effect
        this.basketballTrail.startTrail();
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
        // console.log(flat)
        flat.y = 0;
        flat.normalize();

        const aimed = flat.clone();
        aimed.y = Math.tan(this.pitch);
        aimed.normalize();
        // console.log(this.pitch)
        // console.log(aimed)
        return aimed;
    }

    resetBall() {
        console.log('BALL RESET')
        this.moveStates = {
            ArrowUp: false,
            ArrowLeft: false,
            ArrowDown: false,
            ArrowRight: false,
            increasePower: false,
            decreasePower: false,
            throwedBall: false,
        }
        this.basketballTrail.stopTrail();
        this.basketballData.object.position.set(0, this.basketballData.baseHeight + this.basketballCourt.baseHeight, 0)
        this.currVelocity.set(0, 0, 0)
        this.dirArrow.position.copy(this.basketballData.object.position);
        this.dirArrow.visible = true;

        // Optional: reset direction arrow's direction
        this.dirArrow.setDirection(this.computeAimedDirection());
        // this.dirArrow.setDirection(this.computeAimedDirection());
        // Sound effect for ball reset
        if (this.audioManager) {
            this.audioManager.playBallBounce();
        }
    }

    handleBallLanding() {
        console.log("Ball landed - Stopping trail");
        
        // Stop ball movement
        this.currVelocity.set(0, 0, 0);
        
        // Position ball on ground
        this.basketballData.object.position.y = this.basketballData.baseHeight + this.basketballCourt.baseHeight;
        
        // STOP TRAIL EFFECT - Ball has landed
        this.basketballTrail.stopTrail();
        
        // Set ball back to player control after a short delay
        setTimeout(() => {
            this.moveStates.throwedBall = false;
            this.dirArrow.visible = true;
            this.dirArrow.position.copy(this.basketballData.object.position);
            this.dirArrow.setDirection(this.computeAimedDirection());
        }, 500); // Half second delay before player can control again
        
        // Play landing sound
        if (this.audioManager) {
            this.audioManager.playBallBounce();
        }
    }
}

export default PlayerControls;
