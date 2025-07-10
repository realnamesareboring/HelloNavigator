// =============================================================================
// CHALLENGE LOADER - Handles challenge initialization and setup
// =============================================================================

class ChallengeLoader {
    constructor() {
        this.challengeData = null;
        this.isLoaded = false;
    }

    async loadChallenge(challengeId) {
        try {
            console.log(`🔄 Loading challenge: ${challengeId}`);
            
            // For now, return basic challenge data
            // This can be expanded later to load from JSON files
            this.challengeData = {
                id: challengeId,
                title: this.formatTitle(challengeId),
                loaded: true
            };
            
            this.isLoaded = true;
            console.log(`✅ Challenge loaded: ${challengeId}`);
            return this.challengeData;
            
        } catch (error) {
            console.error(`❌ Failed to load challenge ${challengeId}:`, error);
            return null;
        }
    }

    formatTitle(challengeId) {
        return challengeId
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    getChallengeData() {
        return this.challengeData;
    }

    isReady() {
        return this.isLoaded;
    }
}

// Initialize challenge loader
window.challengeLoader = new ChallengeLoader();
console.log('📁 Challenge Loader initialized');