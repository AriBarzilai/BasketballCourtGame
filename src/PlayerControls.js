import stats from "/src/Gui.js";
import FeedbackManager from './FeedbackManager.js';

class PlayerControls {
    constructor(basketballCourt, basketballData, hoopData, playerDirArrow, audioManager, basketballTrail, controlMoveSpeed = 20) {
        this.basketballCourt = basketballCourt
        this.basketballData = basketballData;
        this.dirArrow = playerDirArrow; // VFX used to indicate direction and force of throw
        this.hoopData = hoopData
        this.controlMoveSpeed = controlMoveSpeed;
        this.audioManager = audioManager; // AudioManager instance for sound effects
        this.basketballTrail = basketballTrail;
        this.feedbackManager = new FeedbackManager();
        this.currHoop = null
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

        this.hasScoredThisThrow = false; // prevents tallying ball through hoop multiple times
        this.dirArrow.setDirection(this.computeAimedDirection());
    }

    update(deltaTime) {
        let moveDelta;
        if (this.moveStates.throwedBall) { // if object is in throwing  mode
            moveDelta = this.currVelocity.clone()
            moveDelta.multiplyScalar(deltaTime)
            this.currVelocity.y += this.GRAVITY * deltaTime
            this.currVelocity.multiplyScalar(this.FRICTION_COEFF)
            // Add feedback during shot
            if (!this.feedbackManager.hasFeedbackBeenGiven()) {
                this.feedbackManager.checkIfPassedOverHoop(this.basketballData.object.position, this.currHoop);
                this.feedbackManager.checkIfNearHoop(this.basketballData.object.position, this.currHoop);
            }

        } else { // else if object is in playerControl mode
            moveDelta = new THREE.Vector3();
            // Forward/backward (z axis)
            if (this.moveStates.ArrowUp) {
                if (moveDelta.x + this.basketballData.object.position.x < this.basketballCourt.width / 2 - this.basketballData.baseHeight) moveDelta.x += 1;
            }
            if (this.moveStates.ArrowDown) {
                if (moveDelta.x + this.basketballData.object.position.x > -1 * (this.basketballCourt.width / 2 - this.basketballData.baseHeight)) moveDelta.x -= 1;
            }
            // Left/right (x axis)
            if (this.moveStates.ArrowLeft) {
                if (moveDelta.z + this.basketballData.object.position.z > -1 * (this.basketballCourt.depth / 2 - this.basketballData.baseHeight)) moveDelta.z -= 1;
            }
            if (this.moveStates.ArrowRight) {
                if (moveDelta.z + this.basketballData.object.position.z < this.basketballCourt.depth / 2 - this.basketballData.baseHeight) moveDelta.z += 1;
            }
            if (this.moveStates.increasePower) this.pitch += this.pitchSpeed * deltaTime;
            if (this.moveStates.decreasePower) this.pitch -= this.pitchSpeed * deltaTime;
            this.pitch = THREE.MathUtils.clamp(this.pitch, 0, Math.PI / 2);
        }
        if (moveDelta.lengthSq() <= 0 && !(this.moveStates.increasePower || this.moveStates.decreasePower || this.moveStates.throwedBall)) return;
        if (!this.moveStates.throwedBall) {
            moveDelta.normalize().multiplyScalar(deltaTime * this.controlMoveSpeed);
        }
        this.applyRollingRotation(moveDelta)
        this.basketballData.object.position.add(moveDelta);
        this.dirArrow.position.add(moveDelta);
        if (this.moveStates.throwedBall) {
            this.handleCollisions(deltaTime);
        }
        this.dirArrow.setDirection(this.computeAimedDirection())

        if (this.basketballData.object.position.y < -5) {
            this.resetBall();
            // too strong, overshot the hoop, like backboard hit
            this.feedbackManager.markBackboardHit();
        } else if (this.currVelocity.lengthSq() < this.SLEEP_SPEED * this.SLEEP_SPEED && this.basketballData.object.position.y <= 1) {
            const wasThrown = this.moveStates.throwedBall;

            if (wasThrown && !this.feedbackManager.hasFeedbackBeenGiven()) {
                this.feedbackManager.analyzeShotResult();
            }
            if (!this.isWithinCourtBounds()) {
                this.resetBall()
            } else {
                this.updateDirArrow();
            }
        }
    }


    launchBall() {
        if (this.moveStates.throwedBall) return;
        this.hasScoredThisThrow = false;
        this.feedbackManager.startNewShot();

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
        stats.shotAttempts += 1
    }

    getDirToHoop() {
        // determines which half of the basketball court the basketball is in.
        this.currHoop = this.basketballData.object.position.x >= 0 ? this.hoopData.rightHoop : this.hoopData.leftHoop;
        const hoopWorldPos = new THREE.Vector3();
        this.currHoop.getObjectByName('hoop').getObjectByName('rim').getWorldPosition(hoopWorldPos);

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

    handleCollisions(deltaTime) {
        // Convenient shorthands
        const vel = this.currVelocity;

        if (!this.isWithinWorldBounds()) {
            // Only apply gravity when out of bounds
            vel.y += this.GRAVITY * deltaTime;
            return;
        }

        this.handleCourtCollision();
        this.handleHoopCollision();

        // kill negligible bounce so ball finally rests
        // if (Math.abs(vel.y) < 0.2) vel.y = 0;
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

        this.feedbackManager.startNewShot();
        this.updateDirArrow();
        this.basketballTrail.clearTrailGeometry();
        this.basketballTrail.stopTrail();

        if (this.audioManager) {
            this.audioManager.playBallBounce();
        }
    }

    updateDirArrow() {
        this.dirArrow.position.copy(this.basketballData.object.position);
        this.dirArrow.visible = true;
        this.dirArrow.setDirection(this.computeAimedDirection());
    }


    getBallSpeed() {
        return this.currVelocity ? this.currVelocity.lengthSq() : 0
    }

    isWithinWorldBounds() {
        if (this.basketballData.object.position.x >= this.basketballCourt.courtSurroundingWidth / 2) return false;
        if (this.basketballData.object.position.x <= -1 * (this.basketballCourt.courtSurroundingWidth / 2)) return false;
        if (this.basketballData.object.position.z <= -1 * (this.basketballCourt.courtSurroundingDepth / 2)) return false;
        if (this.basketballData.object.position.z >= this.basketballCourt.courtSurroundingDepth / 2) return false;
        return true;
    }

    isWithinCourtBounds() {
        if (this.basketballData.object.position.x >= this.basketballCourt.width / 2) return false;
        if (this.basketballData.object.position.x <= -1 * (this.basketballCourt.width / 2)) return false;
        if (this.basketballData.object.position.z <= -1 * (this.basketballCourt.depth / 2)) return false;
        if (this.basketballData.object.position.z >= this.basketballCourt.depth / 2) return false;
        return true;
    }

    handleHoopCollision() {
        const ballPos = this.basketballData.object.position;
        const ballRadius = this.basketballData.baseHeight;

        const tempBox = new THREE.Box3();      // reused box

        for (const part of this.currHoop.collidableParts) {
            tempBox.setFromObject(part);

            // Broad‑phase: cheap overlap test
            if (!tempBox.intersectsSphere(new THREE.Sphere(ballPos, ballRadius))) continue;
            if (part.name === 'rim') {
                // check if inside hoop or not
                const rimCenter = part.getWorldPosition(new THREE.Vector3());

                const dx = ballPos.x - rimCenter.x;
                const dz = ballPos.z - rimCenter.z;
                const horizDist = Math.hypot(dx, dz);

                const RIM_RADIUS = part.geometry.parameters.radius;
                const overlap = (RIM_RADIUS + ballRadius) - horizDist;
                if (horizDist < RIM_RADIUS - ballRadius) {
                    if (!this.hasScoredThisThrow && this.currVelocity.y < 0) {
                        stats.shotsMade += 1;
                        stats.playerScore += 100;
                        this.hasScoredThisThrow = true;

                        this.feedbackManager.showSuccessfulShot();
                        // Play net sound
                        this.audioManager.playNetSwish();
                        // Play score sound
                        this.audioManager.playScoreSound();
                    } else {
                        if (ballPos.y <= rimCenter.y) {
                            this.feedbackManager.markPoleHit()
                        } else {
                            this.feedbackManager.showFeedback("CLOSE! Try again! 🎯", "#feca57")
                        }
                    }
                    return;
                } else if (overlap > 0) {
                    const normal = new THREE.Vector3(dx, 0, dz).normalize();
                    ballPos.addScaledVector(normal, overlap + 1e-3);   // positional correction
                    this.currVelocity.reflect(normal).multiplyScalar(this.RESTITUTION);
                    if (this.audioManager) {
                        this.audioManager.playBackboardHit();
                    }
                    return;
                }

            }

            // Narrow‑phase: closest point on the box
            const closest = tempBox.clampPoint(ballPos.clone(), new THREE.Vector3());

            const normalVec = ballPos.clone().sub(closest);
            const dist = normalVec.length();

            // If the ball centre lies exactly on a box face corner/edge
            const normal = dist === 0
                ? new THREE.Vector3(0, 1, 0)
                : normalVec.divideScalar(dist);    // true surface normal

            const penetration = ballRadius - dist;
            if (penetration > 0) {
                // 1) positional correction
                ballPos.addScaledVector(normal, penetration + 1e-3);

                // 2) reflect velocity
                this.currVelocity.reflect(normal)
                    .multiplyScalar(this.RESTITUTION);

                // 3) mark backboard hit for feedback
                if (part.name === 'backboard') {
                    // Ball hit backboard = too strong
                    this.feedbackManager.markBackboardHit();
                } else if (part.name === 'pole' || part.name === 'support' || part.name === 'basketballNet' || part.name.includes('pole') || part.name.includes('support') || part.name.includes('basketballNet')) {
                    // Check if ball is above rim height
                    const rim = this.currHoop.getObjectByName('hoop').getObjectByName('rim');
                    const rimWorldPos = new THREE.Vector3();
                    rim.getWorldPosition(rimWorldPos);
                    if (ballPos.y > rimWorldPos.y) {
                        // Ball hit pole/support above rim = too strong (like backboard)
                        this.feedbackManager.markBackboardHit();
                    } else {
                        // Ball hit pole/support below rim = too weak (ball was too low)
                        this.feedbackManager.markPoleHit();
                    }
                } else {
                    // Other hoop parts - default to backboard logic
                    this.feedbackManager.markBackboardHit();
                }

                // 4) apply audio 
                this.audioManager.playBackboardHit();
            }
            return;   // one contact per frame is enough
        }
    }


    handleCourtCollision() {
        const floorY = this.basketballCourt.baseHeight + this.basketballData.baseHeight;
        if (this.basketballData.object.position.y < floorY) {
            this.basketballData.object.position.y = floorY;

            if (Math.abs(this.currVelocity.y) > this.MIN_BOUNCE_SPEED) {
                // big enough hit → bounce
                this.currVelocity.y = -this.currVelocity.y * this.RESTITUTION;
                if (this.audioManager) {
                    this.audioManager.playBallBounce();
                }
            } else {
                // Stop trail effect
                this.basketballTrail.stopTrail();

                // too small → stick to floor, start rolling / stopping
                this.currVelocity.y = 0;
                // extra damping to make it gently roll/stop
                this.currVelocity.x *= this.ROLL_DAMP;
                this.currVelocity.z *= this.ROLL_DAMP;
                // If we've basically stopped, sleep it
                if (this.currVelocity.lengthSq() < this.SLEEP_SPEED * this.SLEEP_SPEED && this.currVelocity.y <= 1) {
                    console.log(this.currVelocity)
                    this.moveStates.throwedBall = false;
                    if (!this.feedbackManager.hasFeedbackBeenGiven()) {
                        this.feedbackManager.checkIfPassedOverHoop(this.basketballData.object.position, this.currHoop);
                        this.feedbackManager.checkIfNearHoop(this.basketballData.object.position, this.currHoop);
                    }
                }
            }
        }
    }

    applyRollingRotation(moveDelta) {
        // rotates the ball in a realistic manner to simulate rolling
        // moveDelta: actual position change this frame (THREE.Vector3)
        const dist = moveDelta.length();
        const r = this.basketballData.baseHeight; // radius already available

        if (dist < 1e-6 || !r) return;

        // Axis perpendicular to motion and world up (0,1,0)
        const up = new THREE.Vector3(0, 1, 0);
        const axis = new THREE.Vector3().crossVectors(up, moveDelta);

        if (axis.lengthSq() < 1e-10) return;

        const angle = dist / r;
        this.basketballData.object.rotateOnWorldAxis(axis.normalize(), angle);
    }
}

export default PlayerControls;
