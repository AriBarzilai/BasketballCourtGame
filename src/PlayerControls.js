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

        this.BOUNCE_DAMPING = 0.7;        // How much energy is lost on each bounce (0.7 = loses 30%)
        this.MIN_BOUNCE_VELOCITY = 2;     // Minimum upward velocity to continue bouncing
        this.GROUND_FRICTION = 0.95;      // Friction when ball rolls on ground
        this.bounceCount = 0;   // Count how many times the ball has bounced

        this.currVelocity = new THREE.Vector3();

        this.pitch = 0;
        this.pitchSpeed = Math.PI / 3
        this.throwExtraForce = 25; // multiplied by (pitch / (Math.PI / 2)) - steeper angle increases force of throw

        this.dirArrow.setDirection(this.computeAimedDirection());
    }

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

    launchBall() {
        if (this.moveStates.throwedBall) return;
        console.log("BALL THROWN");
        
        // ✅ FIXED: Use correct property names
        this.moveStates = {
            ArrowUp: false,
            ArrowLeft: false,
            ArrowDown: false,
            ArrowRight: false,
            increasePower: false,
            decreasePower: false,
            throwedBall: true
        };
        this.bounceCount = 0; // Reset bounce counter
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
        this.bounceCount = 0; // Reset bounce counter

        // Optional: reset direction arrow's direction
        this.dirArrow.setDirection(this.computeAimedDirection());
        // this.dirArrow.setDirection(this.computeAimedDirection());
        // Sound effect for ball reset
        if (this.audioManager) {
            this.audioManager.playBallBounce();
        }
    }

    // handleBallLanding() {
    //     console.log("Ball landed - Stopping trail");
        
    //     // Stop ball movement
    //     this.currVelocity.set(0, 0, 0);
        
    //     // Position ball on ground
    //     this.basketballData.object.position.y = this.basketballData.baseHeight + this.basketballCourt.baseHeight;
        
    //     // STOP TRAIL EFFECT - Ball has landed
    //     this.basketballTrail.stopTrail();
        
    //     // Set ball back to player control after a short delay
    //     setTimeout(() => {
    //         this.moveStates.throwedBall = false;
    //         this.dirArrow.visible = true;
    //         this.dirArrow.position.copy(this.basketballData.object.position);
    //         this.dirArrow.setDirection(this.computeAimedDirection());
    //     }, 500); // Half second delay before player can control again
        
    //     // Play landing sound
    //     if (this.audioManager) {
    //         this.audioManager.playBallBounce();
    //     }
    // }
    handleBallLanding() {
        const groundLevel = this.basketballData.baseHeight + this.basketballCourt.baseHeight;
        
        // Ensure ball is exactly at ground level
        this.basketballData.object.position.y = groundLevel;
        
        // Get the bounce velocity (absolute value of downward velocity)
        const bounceVelocity = Math.abs(this.currVelocity.y);
        
        // ✅ BOUNCING PHYSICS: Check if ball should bounce
        if (bounceVelocity > this.MIN_BOUNCE_VELOCITY && this.bounceCount < 5) {
            console.log(`Ball bounced! Bounce #${this.bounceCount + 1}, velocity: ${bounceVelocity.toFixed(2)}`);
            
            // Reverse Y velocity and apply damping (bounce up)
            this.currVelocity.y = bounceVelocity * this.BOUNCE_DAMPING;
            
            // Apply ground friction to horizontal movement
            this.currVelocity.x *= this.GROUND_FRICTION;
            this.currVelocity.z *= this.GROUND_FRICTION;
            
            // Increment bounce counter
            this.bounceCount++;
            
            // Play bounce sound
            if (this.audioManager) {
                this.audioManager.playBallBounce();
            }
            
            // Ball continues flying - don't stop the trail
            return; // ✅ IMPORTANT: Return here to keep ball in "thrown" state
        }
        
        // ✅ BALL STOPS BOUNCING - Original landing logic
        console.log("Ball stopped bouncing - Coming to rest");
        
        // Stop all movement
        this.currVelocity.set(0, 0, 0);
        this.bounceCount = 0; // Reset bounce counter
        
        // Stop trail effect
        this.basketballTrail.stopTrail();
        
        // Return ball to player control after delay
        setTimeout(() => {
            this.moveStates.throwedBall = false;
            this.dirArrow.visible = true;
            this.dirArrow.position.copy(this.basketballData.object.position);
            this.dirArrow.setDirection(this.computeAimedDirection());
        }, 500);
        
        // Play final landing sound
        if (this.audioManager) {
            this.audioManager.playBallBounce();
        }
    }

}

export default PlayerControls;
