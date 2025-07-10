// =============================================================================
// HINT SYSTEM - Manages progressive hints and walkthroughs
// =============================================================================

class HintSystemMain {
    constructor() {
        this.hintsUsed = 0;
        this.availableHints = 3;
        this.hints = [
            {
                level: 1,
                title: "💡 Getting Started",
                content: "Begin by exploring the available commands. Type 'help' to see what tools are available.",
                example: "help"
            },
            {
                level: 2,
                title: "🔍 Investigation Techniques",
                content: "Use basic file operations to examine the evidence. Try listing and reading files.",
                example: "ls && cat filename"
            },
            {
                level: 3,
                title: "🎯 Pattern Recognition",
                content: "Look for patterns and anomalies in the data. Use search commands to find specific information.",
                example: "grep pattern filename"
            }
        ];
    }

    requestHint() {
        if (this.hintsUsed >= this.availableHints) {
            this.showNoMoreHints();
            return;
        }

        const hint = this.hints[this.hintsUsed] || this.hints[this.hints.length - 1];
        this.showHint(hint);
        this.hintsUsed++;
        this.updateHintCounter();
    }

    showHint(hint) {
        const modal = document.getElementById('hintModal');
        const content = document.getElementById('hintContent');
        
        if (content) {
            content.innerHTML = `
                <div class="hint-display">
                    <div class="xis-hint-header">
                        <div class="xis-avatar-hint">🤖</div>
                        <div class="xis-speech">
                            <h4>${hint.title}</h4>
                            <p>${hint.content}</p>
                            ${hint.example ? `<div class="hint-example"><strong>Try this:</strong> <code>${hint.example}</code></div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (modal) {
            modal.style.display = 'flex';
            
            // Remove any X buttons that might exist
            const closeButtons = modal.querySelectorAll('.modal-close');
            closeButtons.forEach(btn => btn.remove());
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
                            <h4>🚀 You're On Your Own Now</h4>
                            <p>I've provided all the guidance I can, Navigator. You have the tools and knowledge needed to complete this challenge!</p>
                            <p><em>Remember: The best way to learn cybersecurity is by doing. Trust your instincts!</em></p>
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
                            <strong>Step 1:</strong> Start by downloading and examining the evidence file
                        </div>
                        <div class="step">
                            <strong>Step 2:</strong> Use the 'cat' command to view file contents
                        </div>
                        <div class="step">
                            <strong>Step 3:</strong> Search for patterns using 'grep' command
                        </div>
                        <div class="step">
                            <strong>Step 4:</strong> Analyze the data to find security vulnerabilities
                        </div>
                        <div class="step">
                            <strong>Step 5:</strong> Submit the discovered flag
                        </div>
                    </div>
                    <div class="walkthrough-note">
                        <p><strong>Educational Goal:</strong> Learn to analyze security data systematically and identify attack patterns.</p>
                    </div>
                </div>
            `;
        }
        
        if (modal) {
            modal.style.display = 'flex';
            
            // Remove any X buttons that might exist
            const closeButtons = modal.querySelectorAll('.modal-close');
            closeButtons.forEach(btn => btn.remove());
        }
    }

    closeHint() {
        const modal = document.getElementById('hintModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    closeWalkthrough() {
        const modal = document.getElementById('walkthroughModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    nextHint() {
        this.closeHint();
        setTimeout(() => this.requestHint(), 300);
    }

    implementSolution() {
        this.closeWalkthrough();
        // Auto-complete the challenge for walkthrough users
        if (typeof challengeController !== 'undefined') {
            challengeController.completeChallenge();
        }
    }

    // Method to update hints for specific challenges
    updateHints(newHints) {
        if (Array.isArray(newHints)) {
            this.hints = newHints;
            this.availableHints = newHints.length;
            this.hintsUsed = 0;
            console.log(`🔄 Updated hints: ${newHints.length} hints available`);
        }
    }
}

// Initialize hint system
window.hintSystem = new HintSystemMain();
console.log('💡 Hint System initialized');