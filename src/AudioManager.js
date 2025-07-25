
class AudioManager {
    constructor() {
        // Audio objects for different sounds
        this.sounds = {
            backgroundMusic: null,
            netSwish: null,
            ballBounce: null,
            backboardHit: null
        };
        
        // Fixed volume levels (no user controls)
        this.sfxVolume = 0.7;      // Sound effects volume
        this.musicVolume = 0.15;   // Background music volume (low but audible)
        
        this.init();
    }

    // Initialize and load all audio files
    init() {
        try {
            // Background ambient sounds (basketball game atmosphere)
            this.sounds.backgroundMusic = new Audio('./sounds/backgroundVoices.mp3');
            this.sounds.backgroundMusic.loop = true;  // Loop continuously
            this.sounds.backgroundMusic.volume = this.musicVolume;
            
            // Net swish sound (for successful shots)
            this.sounds.netSwish = new Audio('./sounds/shorsSwishNetSound.mov');
            this.sounds.netSwish.volume = this.sfxVolume;
            
            // Ball bounce sound
            this.sounds.ballBounce = new Audio('./sounds/shortBallBounce.mov');
            this.sounds.ballBounce.volume = this.sfxVolume;
            
            // Backboard hit sound
            this.sounds.backboardHit = new Audio('./sounds/basketball-backboard-35568.mp3');
            this.sounds.backboardHit.volume = this.sfxVolume;
            
            console.log("AudioManager: All sounds loaded successfully");
            
        } catch (error) {
            console.error("AudioManager: Error loading sounds:", error);
        }
    }

    // Start background music when game begins
    startBackgroundMusic() {
        if (this.sounds.backgroundMusic) {
            this.sounds.backgroundMusic.play().catch(error => {
                console.warn("AudioManager: Could not start background music:", error);
            });
            console.log("AudioManager: Background music started");
        }
    }

    // Play net swish sound (when ball goes through hoop)
    playNetSwish() {
        this.playSound('netSwish');
    }

    // Play ball bounce sound (when ball hits ground or bounces)
    playBallBounce() {
        this.playSound('ballBounce');
    }

    // Play backboard hit sound (when ball hits backboard)
    playBackboardHit() {
        this.playSound('backboardHit');
    }

    // Generic method to play any sound effect
    playSound(soundName) {
        const sound = this.sounds[soundName];
        if (sound) {
            // Reset sound to beginning if it's already playing
            sound.currentTime = 0;
            sound.play().catch(error => {
                console.warn(`AudioManager: Could not play ${soundName}:`, error);
            });
        }
    }

    // Preload all sounds (call this when game starts)
    preloadSounds() {
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.load();
            }
        });
        console.log("AudioManager: All sounds preloaded");
    }

    // Clean up audio resources (call when game ends)
    cleanup() {
        if (this.sounds.backgroundMusic) {
            this.sounds.backgroundMusic.pause();
        }
        console.log("AudioManager: Audio cleanup completed");
    }
}

export default AudioManager;