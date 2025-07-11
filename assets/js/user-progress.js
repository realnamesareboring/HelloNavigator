/**
 * User Progress System for Flight of the Navigator CTF
 * Handles user state, progress tracking, and persistence
 */

class UserProgressManager {
    constructor() {
        this.userId = this.generateUserId();
        this.progress = this.loadProgress();
        this.achievements = this.progress.achievements || [];
        this.currentSession = {
            startTime: Date.now(),
            challengesAttempted: 0,
            hintsUsed: 0
        };
        
        console.log('👤 User Progress Manager initialized');
    }

    // =============================================================================
    // USER IDENTIFICATION & SESSION
    // =============================================================================
    
    generateUserId() {
        let userId = localStorage.getItem('navigator-user-id');
        if (!userId) {
            userId = 'navigator-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('navigator-user-id', userId);
        }
        return userId;
    }

    // =============================================================================
    // PROGRESS MANAGEMENT
    // =============================================================================
    
    loadProgress() {
        try {
            const saved = localStorage.getItem('navigator-user-progress');
            if (saved) {
                const progress = JSON.parse(saved);
                console.log('📊 Loaded user progress:', progress);
                return progress;
            }
        } catch (error) {
            console.warn('⚠️ Could not load progress:', error);
        }
        
        // Default progress structure
        return {
            modules: {
                'identity-defense': { completed: false, progress: 0, total: 4, unlocked: true },
                'network-defense': { completed: false, progress: 0, total: 4, unlocked: false },
                'intelligence-hub': { completed: false, progress: 0, total: 4, unlocked: false },
                'cryptographic-core': { completed: false, progress: 0, total: 4, unlocked: false }
            },
            achievements: [],
            totalXP: 0,
            rank: 'Cadet Navigator',
            challengesCompleted: 0,
            lastActive: Date.now()
        };
    }

    saveProgress() {
        try {
            this.progress.lastActive = Date.now();
            localStorage.setItem('navigator-user-progress', JSON.stringify(this.progress));
            console.log('💾 Progress saved successfully');
        } catch (error) {
            console.error('❌ Could not save progress:', error);
        }
    }

    // =============================================================================
    // CHALLENGE COMPLETION
    // =============================================================================
    
    completeChallenge(moduleId, challengeId, xpReward = 100) {
        console.log(`🎉 Challenge completed: ${moduleId}/${challengeId}`);
        
        // Update module progress
        if (this.progress.modules[moduleId]) {
            this.progress.modules[moduleId].progress++;
            
            // Check if module is completed
            const module = this.progress.modules[moduleId];
            if (module.progress >= module.total) {
                this.completeModule(moduleId);
            }
        }
        
        // Award XP and update stats
        this.addXP(xpReward);
        this.progress.challengesCompleted++;
        this.currentSession.challengesAttempted++;
        
        this.saveProgress();
        this.updateDisplay();
        
        return true;
    }

    completeModule(moduleId) {
        console.log(`🌟 Module completed: ${moduleId}`);
        
        // Mark as completed
        this.progress.modules[moduleId].completed = true;
        
        // Unlock next module
        const moduleOrder = ['identity-defense', 'network-defense', 'intelligence-hub', 'cryptographic-core'];
        const currentIndex = moduleOrder.indexOf(moduleId);
        
        if (currentIndex >= 0 && currentIndex < moduleOrder.length - 1) {
            const nextModule = moduleOrder[currentIndex + 1];
            this.progress.modules[nextModule].unlocked = true;
            console.log(`🔓 Unlocked module: ${nextModule}`);
        }
        
        // Add achievement
        this.addAchievement(`${this.getModuleName(moduleId)} Master`);
        
        // Bonus XP for module completion
        this.addXP(500);
    }

    // =============================================================================
    // XP & ACHIEVEMENTS
    // =============================================================================
    
    addXP(amount) {
        this.progress.totalXP += amount;
        this.updateRank();
        console.log(`⭐ +${amount} XP! Total: ${this.progress.totalXP}`);
    }

    updateRank() {
        const xp = this.progress.totalXP;
        let newRank = 'Cadet Navigator';
        
        if (xp >= 5000) newRank = 'Master Navigator';
        else if (xp >= 3000) newRank = 'Senior Navigator';
        else if (xp >= 1500) newRank = 'Junior Navigator';
        else if (xp >= 500) newRank = 'Navigation Specialist';
        
        if (newRank !== this.progress.rank) {
            this.progress.rank = newRank;
            this.addAchievement(`Promoted to ${newRank}`);
        }
    }

    addAchievement(title) {
        const achievement = {
            id: this.achievements.length + 1,
            title: title,
            timestamp: Date.now(),
            date: new Date().toLocaleDateString()
        };
        
        this.achievements.push(achievement);
        this.progress.achievements = this.achievements;
        console.log(`🏆 Achievement unlocked: ${title}`);
    }

    // =============================================================================
    // DISPLAY UPDATES
    // =============================================================================
    
    updateDisplay() {
        // Update bridge controller if available
        if (window.bridgeController) {
            window.bridgeController.modules = this.progress.modules;
            window.bridgeController.updateAllDisplays();
        }
        
        // Update any progress indicators on page
        this.updateProgressIndicators();
    }

    updateProgressIndicators() {
        // Update overall progress if element exists
        const overallProgress = document.getElementById('overallProgress');
        const overallPercent = document.getElementById('overallPercent');
        
        if (overallProgress && overallPercent) {
            const totalModules = Object.keys(this.progress.modules).length;
            const completedModules = Object.values(this.progress.modules).filter(m => m.completed).length;
            const percentage = (completedModules / totalModules) * 100;
            
            overallProgress.style.width = percentage + '%';
            overallPercent.textContent = Math.round(percentage) + '%';
        }

        // Update rank display if element exists
        const rankDisplay = document.getElementById('userRank');
        if (rankDisplay) {
            rankDisplay.textContent = this.progress.rank;
        }

        // Update XP display if element exists
        const xpDisplay = document.getElementById('userXP');
        if (xpDisplay) {
            xpDisplay.textContent = this.progress.totalXP + ' XP';
        }
    }

    // =============================================================================
    // UTILITY METHODS
    // =============================================================================
    
    getModuleName(moduleId) {
        const names = {
            'identity-defense': 'Identity Defense Grid',
            'network-defense': 'Network Defense Array', 
            'intelligence-hub': 'Intelligence Gathering Hub',
            'cryptographic-core': 'Cryptographic Core'
        };
        return names[moduleId] || moduleId;
    }

    getProgress() {
        return this.progress;
    }

    resetProgress() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            localStorage.removeItem('navigator-user-progress');
            localStorage.removeItem('navigator-user-id');
            location.reload();
        }
    }

    // =============================================================================
    // RECOVERY & BACKUP
    // =============================================================================
    
    generateRecoveryCode() {
        const data = {
            progress: this.progress,
            userId: this.userId,
            timestamp: Date.now()
        };
        
        const encoded = btoa(JSON.stringify(data));
        return `NAV-${encoded.slice(0, 8)}-${encoded.slice(8, 16)}-${encoded.slice(16, 24)}`;
    }

    restoreFromCode(recoveryCode) {
        try {
            const cleanCode = recoveryCode.replace(/NAV-|-/g, '');
            const decoded = JSON.parse(atob(cleanCode));
            
            this.progress = decoded.progress;
            this.userId = decoded.userId;
            
            this.saveProgress();
            this.updateDisplay();
            
            console.log('✅ Progress restored from recovery code');
            return true;
        } catch (error) {
            console.error('❌ Invalid recovery code:', error);
            return false;
        }
    }
}

// Initialize global user progress manager
window.userProgressManager = new UserProgressManager();

// Auto-save progress every 30 seconds
setInterval(() => {
    if (window.userProgressManager) {
        window.userProgressManager.saveProgress();
    }
}, 30000);

console.log('✅ User Progress System loaded successfully');