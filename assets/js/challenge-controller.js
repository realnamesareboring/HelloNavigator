// =============================================================================
// CHALLENGE CONTROLLER - Coordinates challenge components
// =============================================================================

class ChallengeController {
    constructor() {
        this.challengeData = null;
        this.startTime = Date.now();
        this.objectives = [];
        this.isCompleted = false;
        
        this.init();
    }

    init() {
        console.log('🎯 Challenge Controller initializing...');
        this.startTimer();
        this.loadObjectives();
        console.log('✅ Challenge Controller ready');
    }

    startTimer() {
        setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            
            const timerEl = document.getElementById('challengeTimer');
            if (timerEl) {
                const timeText = timerEl.querySelector('.timer-text');
                if (timeText) {
                    timeText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
            }
        }, 1000);
    }

    loadObjectives() {
        const objectiveItems = document.querySelectorAll('.objective-item');
        this.objectives = Array.from(objectiveItems).map((item, index) => ({
            id: index + 1,
            text: item.querySelector('.objective-text').textContent,
            completed: false,
            element: item
        }));
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

    submitSolution() {
        // This would normally validate the solution
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
        // Close success modal and show solution review
        document.getElementById('successModal').style.display = 'none';
    }

    continueToNext() {
        console.log('➡️ Continuing to next challenge...');
        // For now, just return to bridge
        this.returnToBridge();
    }
}

// =============================================================================
// HINT SYSTEM (Basic Implementation)
// =============================================================================

class HintSystem {
    constructor() {
        this.hintsUsed = 0;
        this.availableHints = 3;
        this.hints = [
            "Try using the 'help' command to see available tools.",
            "Use 'ls' to list files in the current directory.",
            "The 'cat' command can help you read file contents."
        ];
    }

    requestHint() {
        if (this.hintsUsed >= this.availableHints) {
            this.showNoMoreHints();
            return;
        }

        const hint = this.hints[this.hintsUsed];
        this.showHint(hint);
        this.hintsUsed++;
        this.updateHintCounter();
    }

    showHint(hintText) {
        const modal = document.getElementById('hintModal');
        const content = document.getElementById('hintContent');
        
        if (content) {
            content.innerHTML = `
                <div class="hint-display">
                    <div class="xis-hint-header">
                        <div class="xis-avatar-hint">🤖</div>
                        <div class="xis-speech">
                            <p><strong>X.I.S. Guidance:</strong></p>
                            <p>${hintText}</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    showNoMoreHints() {
        const modal = document.getElementById('hintModal');
        const content = document.getElementById('hintContent');
        
        if (content) {
            content.innerHTML = `
                <div class="hint-display">
                    <div class="xis-hint-header">
                        <div class="xis-avatar-hint">🤖</div>
                        <div class="xis-speech">
                            <p><strong>X.I.S. Response:</strong></p>
                            <p>I've provided all the guidance I can, Navigator. You have the tools and knowledge needed to complete this challenge!</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    updateHintCounter() {
        const hintCount = document.getElementById('hintCount');
        if (hintCount) {
            const remaining = this.availableHints - this.hintsUsed;
            hintCount.textContent = `(${remaining} available)`;
        }
    }

    showWalkthrough() {
        const modal = document.getElementById('walkthroughModal');
        const content = document.getElementById('walkthroughContent');
        
        if (content) {
            content.innerHTML = `
                <div class="walkthrough-display">
                    <h3>🧠 Complete Solution Walkthrough</h3>
                    <div class="walkthrough-steps">
                        <div class="step">
                            <strong>Step 1:</strong> Use the 'help' command to see available tools
                        </div>
                        <div class="step">
                            <strong>Step 2:</strong> Explore the file system with 'ls' and 'cd'
                        </div>
                        <div class="step">
                            <strong>Step 3:</strong> Use appropriate tools to complete the challenge
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeHint() {
        document.getElementById('hintModal').style.display = 'none';
    }

    closeWalkthrough() {
        document.getElementById('walkthroughModal').style.display = 'none';
    }

    nextHint() {
        this.closeHint();
        setTimeout(() => this.requestHint(), 300);
    }

    implementSolution() {
        this.closeWalkthrough();
        // Auto-complete the challenge for walkthrough users
        challengeController.completeChallenge();
    }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

let challengeController;
let hintSystem;

document.addEventListener('DOMContentLoaded', function() {
    challengeController = new ChallengeController();
    hintSystem = new HintSystem();
    
    console.log('🎯 Challenge framework fully operational');
});