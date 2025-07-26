// BasketballTrailEffect.js

class BasketballTrailEffect {
    constructor(scene, basketball) {
        this.scene = scene;
        this.basketball = basketball;
        
        // Trail configuration
        this.maxTrailPoints = 60;        // Optimal length for throws
        this.trailPositions = [];        // Array to store trail positions
        this.isActive = false;           // Whether trail is currently active
        
        // Trail visual properties
        this.trailColor = 0xff6600;      // Orange color for basketball trail
        this.trailOpacity = 0.9;         // Strong visibility during throws
        this.trailWidth = 3;             // Thicker trail for throws
        
        // Three.js objects
        this.trailGeometry = null;
        this.trailMaterial = null;
        this.trailMesh = null;
        
        this.initializeTrail();
    }
    
    initializeTrail() {
        // Create trail material with transparency
        this.trailMaterial = new THREE.LineBasicMaterial({
            color: this.trailColor,
            transparent: true,
            opacity: this.trailOpacity,
            linewidth: this.trailWidth
        });
        
        // Create empty geometry for the trail
        this.trailGeometry = new THREE.BufferGeometry();
        
        // Initialize with empty positions
        const positions = new Float32Array(this.maxTrailPoints * 3);
        this.trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Create the trail mesh
        this.trailMesh = new THREE.Line(this.trailGeometry, this.trailMaterial);
        this.trailMesh.visible = false; // Hidden by default
        
        // Add to scene
        this.scene.add(this.trailMesh);
        
        console.log("Basketball throw trail effect initialized");
    }
    
    startTrail() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.trailPositions = [];
        this.trailMesh.visible = true;
        
        // Add initial position (where throw starts)
        const ballPos = this.basketball.object.position.clone();
        this.trailPositions.push(ballPos);
        
        console.log("Ball trail started - throw in progress");
    }
    
    stopTrail() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.trailMesh.visible = false;
        this.trailPositions = [];
        
        // Clear the trail geometry
        this.clearTrailGeometry();
        
        console.log("Ball trail stopped - throw ended");
    }
    
    update() {
        // Only update trail during active throws
        if (!this.isActive) return;
        
        // Get current ball position
        const currentPos = this.basketball.object.position.clone();
        
        // Add current position to trail
        this.trailPositions.push(currentPos);
        
        // Limit trail length for optimal performance and visual effect
        if (this.trailPositions.length > this.maxTrailPoints) {
            this.trailPositions.shift(); // Remove oldest position
        }
        
        // Update trail geometry
        this.updateTrailGeometry();
    }
    
    updateTrailGeometry() {
        if (this.trailPositions.length < 2) return;
        
        // Update geometry with current positions
        const positionAttribute = this.trailGeometry.getAttribute('position');
        
        // Fill positions array
        for (let i = 0; i < this.maxTrailPoints; i++) {
            const index = i * 3;
            if (i < this.trailPositions.length) {
                const pos = this.trailPositions[i];
                positionAttribute.array[index] = pos.x;
                positionAttribute.array[index + 1] = pos.y;
                positionAttribute.array[index + 2] = pos.z;
            } else {
                // Use last position for remaining points (smoother trail end)
                const lastPos = this.trailPositions[this.trailPositions.length - 1];
                positionAttribute.array[index] = lastPos.x;
                positionAttribute.array[index + 1] = lastPos.y;
                positionAttribute.array[index + 2] = lastPos.z;
            }
        }
        
        // Update the geometry
        positionAttribute.needsUpdate = true;
        this.trailGeometry.setDrawRange(0, this.trailPositions.length);
    }
    
    clearTrailGeometry() {
        // Clear all positions
        const positionAttribute = this.trailGeometry.getAttribute('position');
        for (let i = 0; i < positionAttribute.array.length; i++) {
            positionAttribute.array[i] = 0;
        }
        positionAttribute.needsUpdate = true;
        this.trailGeometry.setDrawRange(0, 0);
    }
    
    // Check if trail should be active (for debugging)
    isTrailActive() {
        return this.isActive && this.trailMesh.visible;
    }
    
    // Get trail length (for debugging)
    getTrailLength() {
        return this.trailPositions.length;
    }
    
    // Cleanup method
    dispose() {
        this.stopTrail();
        
        if (this.trailMesh) {
            this.scene.remove(this.trailMesh);
        }
        if (this.trailGeometry) {
            this.trailGeometry.dispose();
        }
        if (this.trailMaterial) {
            this.trailMaterial.dispose();
        }
        
        console.log("Basketball trail effect disposed");
    }
}

export default BasketballTrailEffect;