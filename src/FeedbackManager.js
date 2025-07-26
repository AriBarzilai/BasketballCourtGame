// FeedbackManager.js
class FeedbackManager {
    constructor() {
        // Shot tracking state
        this.shotState = {
            hasGivenFeedback: false,
            ballReachedHoopArea: false,
            ballPassedOverHoop: false,
            hitBackboard: false
        };
        
        // Feedback display element
        this.feedbackElement = null;
        
        // Initialize the feedback display
        this.createFeedbackDisplay();
        
        console.log("FeedbackManager: Shot feedback system initialized");
    }

    // Create the visual feedback display element
    createFeedbackDisplay() {
        this.feedbackElement = document.createElement('div');
        this.feedbackElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px 40px;
            border-radius: 15px;
            font-size: 28px;
            font-weight: bold;
            font-family: 'Arial', sans-serif;
            text-align: center;
            z-index: 1000;
            display: none;
            border: 4px solid #fff;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
            animation: fadeIn 0.3s ease-in;
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(this.feedbackElement);
    }

    // Reset tracking for a new shot
    startNewShot() {
        this.shotState = {
            hasGivenFeedback: false,
            ballReachedHoopArea: false,
            ballPassedOverHoop: false,
            hitBackboard: false
        };
        console.log("FeedbackManager: New shot started - tracking reset");
    }

    // Mark that ball reached the hoop area
    markBallReachedHoop() {
        this.shotState.ballReachedHoopArea = true;
        console.log("FeedbackManager: Ball reached hoop area");
    }

    // Mark that ball passed over the hoop (too strong)
    markBallPassedOverHoop() {
        if (!this.shotState.ballPassedOverHoop) {
            this.shotState.ballPassedOverHoop = true;
            console.log("FeedbackManager: Ball passed over hoop");
        }
    }

    // Mark that ball hit the backboard (immediate "too strong" feedback)
    markBackboardHit() {
        this.shotState.hitBackboard = true;
        this.showFeedback("TOO STRONG! 💪", "#ff6b6b");
        console.log("FeedbackManager: Ball hit backboard - too strong");
    }

    // Mark that ball hit pole/support (immediate "too weak" feedback)
    markPoleHit() {
        this.showFeedback("TOO WEAK! 😔", "#4ecdc4");
        console.log("FeedbackManager: Ball hit pole/support - too weak");
    }

    // Show successful shot feedback
    showSuccessfulShot() {
        this.showFeedback("VERY GOOD! 🏀✨", "#4CAF50");
    }

    // Show feedback based on shot analysis (only for cases without immediate feedback)
    analyzeShotResult() {
        if (this.shotState.hasGivenFeedback) return;
        
        console.log("FeedbackManager: Analyzing shot result...", this.shotState);
        
        if (this.shotState.ballPassedOverHoop) {
            this.showFeedback("TOO STRONG! 💪", "#ff6b6b");
        } else if (!this.shotState.ballReachedHoopArea) {
            this.showFeedback("TOO WEAK! 😔", "#4ecdc4");
        } else {
            // Ball reached hoop area but didn't score and didn't hit anything
            this.showFeedback("CLOSE! Try again! 🎯", "#feca57");
        }
    }

    // Generic method to show feedback with custom message and color
    showFeedback(message, color = '#ffffff') {
        if (this.shotState.hasGivenFeedback) return; // Prevent multiple feedbacks per shot
        
        this.feedbackElement.innerHTML = message;
        this.feedbackElement.style.color = color;
        this.feedbackElement.style.borderColor = color;
        this.feedbackElement.style.display = 'block';
        this.feedbackElement.style.animation = 'fadeIn 0.3s ease-in';
        
        // Hide feedback after 2.5 seconds with fade out animation
        setTimeout(() => {
            this.feedbackElement.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                this.feedbackElement.style.display = 'none';
            }, 300);
        }, 2500);
        
        this.shotState.hasGivenFeedback = true;
        console.log(`FeedbackManager: Displayed feedback - ${message}`);
    }

    // Check if ball is near hoop (call this from PlayerControls)
    checkIfNearHoop(ballPosition, hoop) {
        if (this.shotState.ballReachedHoopArea) return; // Already marked
        
        const hoopPos = new THREE.Vector3();
        hoop.getObjectByName('hoop').getObjectByName('rim').getWorldPosition(hoopPos);
        
        const distance = ballPosition.distanceTo(hoopPos);
        if (distance < 8) { // Within 8 units of the hoop
            this.markBallReachedHoop();
        }
    }

    // Check if ball passed over hoop (call this from PlayerControls)
    checkIfPassedOverHoop(ballPosition, hoop) {
        if (this.shotState.ballPassedOverHoop) return; // Already marked
        
        const hoopPos = new THREE.Vector3();
        hoop.getObjectByName('hoop').getObjectByName('rim').getWorldPosition(hoopPos);
        
        const horizontalDistance = Math.sqrt(
            Math.pow(ballPosition.x - hoopPos.x, 2) + 
            Math.pow(ballPosition.z - hoopPos.z, 2)
        );
        
        // If ball is close horizontally but much higher than rim
        if (horizontalDistance < 3 && ballPosition.y > hoopPos.y + 5) {
            this.markBallPassedOverHoop();
        }
    }

    // Update method to call during ball flight
    updateDuringShot(ballPosition, hoop) {
        if (this.shotState.hasGivenFeedback) return;
        
        this.checkIfNearHoop(ballPosition, hoop);
        this.checkIfPassedOverHoop(ballPosition, hoop);
    }

    // Check if feedback has been given for current shot
    hasFeedbackBeenGiven() {
        return this.shotState.hasGivenFeedback;
    }

    // Get current shot state (for debugging)
    getShotState() {
        return { ...this.shotState };
    }

    // Cleanup method
    dispose() {
        if (this.feedbackElement && this.feedbackElement.parentNode) {
            this.feedbackElement.parentNode.removeChild(this.feedbackElement);
        }
        console.log("FeedbackManager: Disposed");
    }
}

export default FeedbackManager;