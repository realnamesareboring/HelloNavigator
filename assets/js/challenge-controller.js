// REPLACE the entire challenge-controller.js file with this clean version:

// =============================================================================
// CHALLENGE CONTROLLER - Coordinates challenge components
// =============================================================================

class ChallengeController {
    constructor() {
        this.challengeData = null;
        this.startTime = Date.now();
        this.objectives = [];
        this.isCompleted = false;
        this.timerInterval = null;
        
        this.init();
    }

    init() {
        console.log('🎯 Challenge Controller initializing...');
        this.startTimer();
        this.loadObjectives();
        console.log('✅ Challenge Controller ready');
    }

    // =============================================================================
    // IMPROVED TIMER SYSTEM
    // =============================================================================

    startTimer() {
        console.log('⏱️ Initializing challenge timer...');
        
        // Function to find or create timer element
        const ensureTimerElement = () => {
            let timerEl = document.getElementById('challengeTimer');
            
            if (!timerEl) {
                console.log('🔍 Timer element not found, searching for alternatives...');
                
                // Try to find timer in different locations
                timerEl = document.querySelector('.timer-display');
                if (!timerEl) {
                    timerEl = document.querySelector('[id*="timer"]');
                }
                if (!timerEl) {
                    timerEl = document.querySelector('.challenge-header .timer-text');
                }
                
                // If still not found, create it
                if (!timerEl) {
                    console.log('🔧 Creating timer element...');
                    const header = document.querySelector('.challenge-header .challenge-status');
                    if (header) {
                        const timerDiv = document.createElement('div');
                        timerDiv.className = 'timer-display';
                        timerDiv.id = 'challengeTimer';
                        timerDiv.innerHTML = `
                            <span class="timer-icon">⏱️</span>
                            <span class="timer-text">00:00</span>
                        `;
                        header.appendChild(timerDiv);
                        timerEl = timerDiv;
                    }
                }
            }
            
            return timerEl;
        };
        
        // Wait for timer element to be available
        const waitForTimer = () => {
            return new Promise((resolve) => {
                let attempts = 0;
                const checkForTimer = () => {
                    const timerEl = ensureTimerElement();
                    attempts++;
                    
                    if (timerEl) {
                        console.log(`✅ Timer element found after ${attempts} attempts`);
                        resolve(timerEl);
                    } else if (attempts < 50) {
                        setTimeout(checkForTimer, 100);
                    } else {
                        console.warn('⚠️ Timer element not found after 5 seconds');
                        resolve(null);
                    }
                };
                checkForTimer();
            });
        };
        
        // Start timer once element is ready
        waitForTimer().then((timerEl) => {
            if (!timerEl) {
                console.error('❌ Could not initialize timer - element not found');
                return;
            }
            
            console.log('🚀 Starting challenge timer...');
            
            // Store timer interval ID for cleanup
            this.timerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                
                // Re-check timer element each time (in case of DOM changes)
                const currentTimerEl = document.getElementById('challengeTimer') || timerEl;
                
                if (currentTimerEl) {
                    let timeText = currentTimerEl.querySelector('.timer-text');
                    
                    // If timer-text span doesn't exist, create it
                    if (!timeText) {
                        timeText = document.createElement('span');
                        timeText.className = 'timer-text';
                        currentTimerEl.appendChild(timeText);
                    }
                    
                    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    timeText.textContent = timeString;
                    
                    // Debug log every 30 seconds
                    if (elapsed % 30 === 0 && elapsed > 0) {
                        console.log(`⏱️ Timer update: ${timeString} (${elapsed}s elapsed)`);
                    }
                } else {
                    console.warn('⚠️ Timer element disappeared, attempting to re-find...');
                    clearInterval(this.timerInterval);
                    this.startTimer(); // Restart timer detection
                }
            }, 1000);
            
            console.log('✅ Timer started successfully');
        });
    }

    cleanup() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            console.log('🛑 Timer stopped');
        }
    }

    // =============================================================================
    // OBJECTIVES MANAGEMENT
    // =============================================================================

    loadObjectives() {
        const objectiveItems = document.querySelectorAll('.objective-item');
        this.objectives = Array.from(objectiveItems).map((item, index) => ({
            id: index + 1,
            text: item.querySelector('.objective-text').textContent,
            completed: false,
            element: item
        }));
        
        console.log(`📋 Loaded ${this.objectives.length} objectives`);
    }

    completeObjective(objectiveId) {
        const objective = this.objectives.find(obj => obj.id === objectiveId);
        if (objective && !objective.completed) {
            objective.completed = true;
            objective.element.classList.add('completed');
            objective.element.querySelector('.objective-status').textContent = '✅';
            
            console.log(`✅ Objective ${objectiveId} completed`);
            
            // Check if all objectives completed
            if (this.objectives.every(obj => obj.completed)) {
                this.completeChallenge();
            }
        }
    }

    // =============================================================================
    // CHALLENGE COMPLETION
    // =============================================================================

    submitSolution() {
        console.log('🚀 Solution submitted');
        this.completeObjective(1); // For testing, complete first objective
        
        // For testing purposes, show success after 2 seconds
        setTimeout(() => {
            if (!this.isCompleted) {
                this.completeChallenge();
            }
        }, 2000);
    }

    completeChallenge() {
        if (this.isCompleted) return;
        
        this.isCompleted = true;
        console.log('🎉 Challenge completed!');
        
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.style.display = 'flex';
            this.showSuccessStats();
        }
    }

    showSuccessStats() {
        const statsEl = document.getElementById('successStats');
        const rewardsEl = document.getElementById('successRewards');
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        if (statsEl) {
            statsEl.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Time Taken:</span>
                        <span class="stat-value">${minutes}:${seconds.toString().padStart(2, '0')}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Objectives:</span>
                        <span class="stat-value">${this.objectives.filter(o => o.completed).length}/${this.objectives.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Hints Used:</span>
                        <span class="stat-value">0</span>
                    </div>
                </div>
            `;
        }
        
        if (rewardsEl) {
            rewardsEl.innerHTML = `
                <div class="rewards-list">
                    <div class="reward-item">
                        <span class="reward-icon">⭐</span>
                        <span class="reward-text">100 XP Earned</span>
                    </div>
                    <div class="reward-item">
                        <span class="reward-icon">🏆</span>
                        <span class="reward-text">Challenge Badge Unlocked</span>
                    </div>
                </div>
            `;
        }
    }

    returnToBridge() {
        window.location.href = 'bridge.html';
    }

    reviewSolution() {
        console.log('📋 Reviewing solution...');
        document.getElementById('successModal').style.display = 'none';
    }

    continueToNext() {
        console.log('➡️ Continuing to next challenge...');
        this.returnToBridge();
    }
}

// =============================================================================
// IMPROVED INITIALIZATION (NO DUPLICATE HINTSYSTEM)
// =============================================================================

let challengeController;

// Better initialization that waits for all elements to be ready
function initializeChallengeController() {
    console.log('🔄 Initializing challenge controller...');
    
    // Wait for critical elements to exist
    const waitForElements = () => {
        return new Promise((resolve) => {
            let attempts = 0;
            const checkElements = () => {
                attempts++;
                
                // Check for critical elements
                const hasTimer = document.querySelector('.timer-display, #challengeTimer, [class*="timer"]');
                const hasObjectives = document.querySelector('.objective-item');
                const hasWorkspace = document.getElementById('challengeWorkspace');
                
                if (hasTimer && hasObjectives && hasWorkspace) {
                    console.log(`✅ All elements ready after ${attempts} attempts`);
                    resolve(true);
                } else if (attempts < 100) { // Wait up to 10 seconds
                    setTimeout(checkElements, 100);
                } else {
                    console.warn('⚠️ Some elements still missing, proceeding anyway...');
                    resolve(false);
                }
            };
            checkElements();
        });
    };
    
    // Initialize once elements are ready
    waitForElements().then(() => {
        try {
            challengeController = new ChallengeController();
            
            // Make globally accessible for debugging
            window.challengeController = challengeController;
            
            console.log('🎯 Challenge Controller initialized successfully');
            
            // Verify timer is working after a short delay
            setTimeout(() => {
                const timerEl = document.getElementById('challengeTimer');
                if (timerEl && timerEl.querySelector('.timer-text')) {
                    console.log('✅ Timer verification successful');
                } else {
                    console.warn('⚠️ Timer verification failed - may need manual restart');
                }
            }, 2000);
            
        } catch (error) {
            console.error('❌ Failed to initialize challenge controller:', error);
        }
    });
}

// Multiple initialization triggers to ensure it works
document.addEventListener('DOMContentLoaded', initializeChallengeController);

// Fallback initialization for slower-loading pages
window.addEventListener('load', () => {
    if (!challengeController) {
        console.log('🔄 Fallback controller initialization triggered');
        initializeChallengeController();
    }
});

// Emergency manual initialization function
window.restartChallengeTimer = function() {
    if (challengeController) {
        console.log('🔄 Manually restarting timer...');
        challengeController.cleanup();
        challengeController.startTimer();
    } else {
        console.log('🔄 Manually initializing challenge controller...');
        initializeChallengeController();
    }
};

console.log('🎯 Challenge Controller script loaded');