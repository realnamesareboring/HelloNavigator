// =============================================================================
// BRIDGE CONTROLLER - Updated for Real CTF Challenges
// =============================================================================

class BridgeController {
    constructor() {
        this.modules = {
            'identity-defense': { unlocked: true, progress: 0, total: 4, completed: false },
            'network-defense': { unlocked: false, progress: 0, total: 4, completed: false },
            'intelligence-hub': { unlocked: false, progress: 0, total: 4, completed: false },
            'cryptographic-core': { unlocked: false, progress: 0, total: 4, completed: false }
        };
        
        this.achievements = [];
        this.missionLog = [];
        
        this.init();
    }

    init() {
        console.log('🛸 Bridge systems initializing...');
        
        // Load user progress
        this.loadProgress();
        
        // Update displays
        this.updateAllDisplays();
        
        // Start bridge animations
        this.startBridgeAnimations();
        
        // Update system time
        this.updateSystemTime();
        setInterval(() => this.updateSystemTime(), 1000);
        
        console.log('✅ Bridge systems online');
    }

    // =============================================================================
    // PROGRESS MANAGEMENT
    // =============================================================================

    loadProgress() {
        try {
            const saved = localStorage.getItem('navigator-progress');
            if (saved) {
                const progress = JSON.parse(saved);
                this.modules = { ...this.modules, ...progress.modules };
                this.achievements = progress.achievements || [];
                this.missionLog = progress.missionLog || [];
            }
        } catch (error) {
            console.warn('Could not load progress:', error);
        }
    }

    saveProgress() {
        try {
            const progress = {
                modules: this.modules,
                achievements: this.achievements,
                missionLog: this.missionLog,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem('navigator-progress', JSON.stringify(progress));
        } catch (error) {
            console.warn('Could not save progress:', error);
        }
    }

    updateModuleProgress(moduleId, completed, total) {
        if (this.modules[moduleId]) {
            this.modules[moduleId].progress = completed;
            this.modules[moduleId].total = total;
            
            // Check if module is completed
            if (completed >= total) {
                this.completeModule(moduleId);
            }
            
            this.updateAllDisplays();
            this.saveProgress();
        }
    }

    completeModule(moduleId) {
        // Mark as completed
        this.modules[moduleId].completed = true;
        
        // Unlock next module
        const moduleOrder = ['identity-defense', 'network-defense', 'intelligence-hub', 'cryptographic-core'];
        const currentIndex = moduleOrder.indexOf(moduleId);
        if (currentIndex >= 0 && currentIndex < moduleOrder.length - 1) {
            const nextModule = moduleOrder[currentIndex + 1];
            this.modules[nextModule].unlocked = true;
        }
        
        // Add achievement
        this.addAchievement(`${this.getModuleName(moduleId)} Restored`);
        
        // Log completion
        this.addLogEntry(`✅ ${this.getModuleName(moduleId)} systems restored`);
        
        // Update displays
        this.updateAllDisplays();
        this.saveProgress();
    }

    // =============================================================================
    // DISPLAY UPDATES
    // =============================================================================

    updateAllDisplays() {
        this.updateModuleProgress();
        this.updateOverallProgress();
        this.updateXISMessage();
        this.updateMissionLog();
    }

    updateModuleProgress() {
        Object.keys(this.modules).forEach(moduleId => {
            const module = this.modules[moduleId];
            const card = document.querySelector(`[data-module="${moduleId}"]`);
            
            if (card) {
                const statusEl = card.querySelector('.module-status');
                const progressEl = card.querySelector('.progress-fill');
                const textEl = card.querySelector('.progress-text');
                
                // Update status
                if (module.completed) {
                    statusEl.textContent = 'ONLINE';
                    statusEl.className = 'module-status online';
                } else if (module.unlocked) {
                    statusEl.textContent = 'OFFLINE';
                    statusEl.className = 'module-status offline';
                } else {
                    statusEl.textContent = 'LOCKED';
                    statusEl.className = 'module-status locked';
                }
                
                // Update progress bar
                const percentage = (module.progress / module.total) * 100;
                progressEl.style.width = percentage + '%';
                
                // Update text
                if (module.unlocked) {
                    textEl.textContent = `${module.progress}/${module.total} Protocols Secured`;
                } else {
                    const requirements = this.getModuleRequirements(moduleId);
                    textEl.textContent = requirements;
                }
            }
        });
    }

    updateOverallProgress() {
        const totalModules = Object.keys(this.modules).length;
        const completedModules = Object.values(this.modules).filter(m => m.completed).length;
        const percentage = (completedModules / totalModules) * 100;
        
        const overallEl = document.getElementById('overallProgress');
        const percentEl = document.getElementById('overallPercent');
        
        if (overallEl) overallEl.style.width = percentage + '%';
        if (percentEl) percentEl.textContent = Math.round(percentage) + '%';
    }

    updateXISMessage() {
        const xisEl = document.getElementById('xisMessage');
        if (!xisEl) return;
        
        const completedCount = Object.values(this.modules).filter(m => m.completed).length;
        let message = '';
        
        switch (completedCount) {
            case 0:
                message = "Welcome back, Navigator! The Identity Defense Grid is our first priority. These systems protect the crew's digital identities from space pirates.";
                break;
            case 1:
                message = "Excellent work on the Identity Defense Grid! The Network Defense Array is now accessible. We need to secure our communications.";
                break;
            case 2:
                message = "Outstanding progress! The Intelligence Gathering Hub is online. Now we can scout for threats before they reach us.";
                break;
            case 3:
                message = "Incredible! Only the Cryptographic Core remains. Once we secure our encryption systems, we can begin the journey home.";
                break;
            case 4:
                message = "ALL SYSTEMS RESTORED! Navigator, you've saved us all. Plotting course for home... Thank you for this incredible journey!";
                break;
        }
        
        this.typewriterEffect(xisEl, message);
    }

    updateMissionLog() {
        const logEl = document.getElementById('missionLog');
        if (!logEl) return;
        
        // Show last 5 entries
        const recentEntries = this.missionLog.slice(-5);
        logEl.innerHTML = recentEntries.map(entry => `
            <div class="log-entry">
                <span class="log-time">${entry.time}</span>
                <span class="log-text">${entry.message}</span>
            </div>
        `).join('');
    }

    // =============================================================================
    // NAVIGATION & ACTIONS
    // =============================================================================

    enterModule(moduleId) {
        if (!this.modules[moduleId]?.unlocked) {
            this.showRequirements(moduleId);
            return;
        }
        
        this.addLogEntry(`Entering ${this.getModuleName(moduleId)}`);
        
        // Navigate to the appropriate module page
        const modulePages = {
            'identity-defense': 'modules/identity-defense.html',
            'network-defense': 'modules/network-defense.html',
            'intelligence-hub': 'modules/intelligence-hub.html',
            'cryptographic-core': 'modules/cryptographic-core.html'
        };
        
        const page = modulePages[moduleId];
        if (page) {
            window.location.href = page;
        } else {
            console.error('Module page not found:', moduleId);
            this.addLogEntry(`❌ Error: Module ${moduleId} not available`);
        }
    }

    viewProgress(moduleId) {
        const module = this.modules[moduleId];
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const modalAction = document.getElementById('modalAction');
        
        modalTitle.textContent = this.getModuleName(moduleId) + ' - Progress';
        modalBody.innerHTML = `
            <div class="progress-details">
                <h3>System Status: ${module.completed ? 'ONLINE' : module.unlocked ? 'OFFLINE' : 'LOCKED'}</h3>
                <div class="progress-breakdown">
                    <p><strong>Completed Protocols:</strong> ${module.progress}/${module.total}</p>
                    <p><strong>Security Level:</strong> ${this.getSecurityLevel(module.progress, module.total)}</p>
                    <p><strong>Next Challenge:</strong> ${this.getNextChallenge(moduleId, module.progress)}</p>
                </div>
                <div class="module-details">
                    <h4>Mission Objectives:</h4>
                    <ul>
                        ${this.getModuleObjectives(moduleId).map(obj => `<li>${obj}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        modalAction.textContent = module.unlocked ? 'Enter Module' : 'View Requirements';
        modalAction.onclick = () => {
            this.closeModal();
            if (module.unlocked) {
                this.enterModule(moduleId);
            } else {
                this.showRequirements(moduleId);
            }
        };
        
        document.getElementById('moduleModal').style.display = 'flex';
    }

    // =============================================================================
    // CHALLENGE COMPLETION HANDLERS
    // =============================================================================

    onChallengeCompleted(moduleId, challengeId, xpEarned) {
        console.log(`🎉 Challenge completed: ${challengeId} in ${moduleId}`);
        
        // Update module progress
        const module = this.modules[moduleId];
        if (module) {
            module.progress = Math.min(module.progress + 1, module.total);
            
            // Log completion
            this.addLogEntry(`✅ Completed: ${challengeId} (+${xpEarned} XP)`);
            
            // Check if module is complete
            if (module.progress >= module.total) {
                this.completeModule(moduleId);
            }
            
            this.updateAllDisplays();
            this.saveProgress();
        }
    }

    // =============================================================================
    // UTILITY FUNCTIONS
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

    getModuleRequirements(moduleId) {
        const requirements = {
            'identity-defense': 'Available',
            'network-defense': 'Requires Identity Defense',
            'intelligence-hub': 'Requires Network Defense',
            'cryptographic-core': 'Requires Intelligence Hub'
        };
        return requirements[moduleId] || 'Unknown requirements';
    }

    getModuleObjectives(moduleId) {
        const objectives = {
            'identity-defense': [
                'Implement secure authentication protocols',
                'Detect social engineering attempts',
                'Configure multi-factor authentication',
                'Investigate compromised accounts'
            ],
            'network-defense': [
                'Analyze network traffic patterns',
                'Configure firewall rules',
                'Secure wireless communications',
                'Monitor for intrusions'
            ],
            'intelligence-hub': [
                'Gather threat intelligence',
                'Perform reconnaissance analysis',
                'Map attack vectors',
                'Assess security posture'
            ],
            'cryptographic-core': [
                'Implement encryption protocols',
                'Manage cryptographic keys',
                'Analyze cipher systems',
                'Secure data transmission'
            ]
        };
        return objectives[moduleId] || ['Objectives not defined'];
    }

    getSecurityLevel(progress, total) {
        const percentage = (progress / total) * 100;
        if (percentage === 0) return 'CRITICAL';
        if (percentage < 50) return 'VULNERABLE';
        if (percentage < 100) return 'IMPROVING';
        return 'SECURE';
    }

    getNextChallenge(moduleId, progress) {
        const challenges = {
            'identity-defense': [
                'Password Security Analysis',
                'Social Engineering Detection',
                'Multi-Factor Authentication',
                'Account Forensics'
            ],
            'network-defense': [
                'Traffic Analysis',
                'Firewall Configuration',
                'Wireless Security',
                'Intrusion Detection'
            ],
            'intelligence-hub': [
                'Threat Intelligence',
                'Reconnaissance Analysis',
                'Attack Vector Mapping',
                'Security Assessment'
            ],
            'cryptographic-core': [
                'Encryption Implementation',
                'Key Management',
                'Cipher Analysis',
                'Secure Communications'
            ]
        };
        
        const moduleChallenges = challenges[moduleId] || [];
        return moduleChallenges[progress] || 'Module Complete';
    }

    // =============================================================================
    // HELPER METHODS
    // =============================================================================

    addLogEntry(message) {
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const stardate = `2024.${String(new Date().getDate()).padStart(3, '0')}.${String(new Date().getHours()).padStart(2, '0')}${String(new Date().getMinutes()).padStart(2, '0')}`;
        
        this.missionLog.push({
            time: stardate,
            message: message,
            timestamp: timestamp
        });
        
        // Keep only last 20 entries
        if (this.missionLog.length > 20) {
            this.missionLog = this.missionLog.slice(-20);
        }
        
        this.updateMissionLog();
    }

    addAchievement(achievement) {
        if (!this.achievements.includes(achievement)) {
            this.achievements.push(achievement);
            this.addLogEntry(`🏆 Achievement unlocked: ${achievement}`);
        }
    }

    typewriterEffect(element, text) {
        element.textContent = '';
        let i = 0;
        const timer = setInterval(() => {
            element.textContent += text.charAt(i);
            i++;
            if (i >= text.length) {
                clearInterval(timer);
            }
        }, 30);
    }

    // UI Event Handlers
    closeModal() {
        document.getElementById('moduleModal').style.display = 'none';
    }

    showRequirements(moduleId) {
        const requirements = this.getModuleRequirements(moduleId);
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Access Requirements';
        modalBody.innerHTML = `
            <div class="requirements-info">
                <h3>🔒 ${this.getModuleName(moduleId)} - LOCKED</h3>
                <p><strong>Requirements:</strong> ${requirements}</p>
                <p>Complete the prerequisite modules to unlock this system.</p>
                <div class="unlock-path">
                    <h4>Unlock Path:</h4>
                    ${this.getUnlockPath(moduleId)}
                </div>
            </div>
        `;
        
        document.getElementById('modalAction').style.display = 'none';
        document.getElementById('moduleModal').style.display = 'flex';
    }

    getUnlockPath(moduleId) {
        const paths = {
            'network-defense': '<ol><li>Complete Identity Defense Grid</li></ol>',
            'intelligence-hub': '<ol><li>Complete Identity Defense Grid</li><li>Complete Network Defense Array</li></ol>',
            'cryptographic-core': '<ol><li>Complete Identity Defense Grid</li><li>Complete Network Defense Array</li><li>Complete Intelligence Gathering Hub</li></ol>'
        };
        return paths[moduleId] || '<p>Path unknown</p>';
    }

    // Additional UI methods
    updateSystemTime() {
        const timeEl = document.getElementById('systemTime');
        if (timeEl) {
            const now = new Date();
            const stardate = `STARDATE: 2024.${String(now.getDate()).padStart(3, '0')}.${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
            timeEl.textContent = stardate;
        }
    }

    startBridgeAnimations() {
        // Add subtle bridge animations here
        const avatar = document.getElementById('xisAvatar');
        if (avatar) {
            avatar.style.animation = 'pulse 3s ease-in-out infinite';
        }
    }

    // Navigation methods for other UI elements
    returnToLanding() {
        window.location.href = 'index.html';
    }

    viewAchievements() {
        alert(`Achievements: ${this.achievements.join(', ') || 'None yet'}`);
    }

    viewStatistics() {
        const totalCompleted = Object.values(this.modules).reduce((sum, m) => sum + m.progress, 0);
        const totalChallenges = Object.values(this.modules).reduce((sum, m) => sum + m.total, 0);
        alert(`Progress: ${totalCompleted}/${totalChallenges} challenges completed`);
    }
}

// =============================================================================
// X.I.S. CHARACTER CONTROLLER
// =============================================================================

class XISController {
    constructor() {
        this.responses = {
            greetings: [
                "Navigator! Your expertise in cybersecurity continues to amaze me.",
                "Welcome back to the bridge! The ship's systems are responding well to your repairs.",
                "Excellent timing, Navigator. I've been monitoring new security threats that require your attention.",
                "The crew speaks highly of your cybersecurity skills. They feel much safer with you aboard!",
                "Greetings! I've compiled new intelligence reports while you were away. Ready for another mission?"
            ],
            hints: [
                "Remember, every cybersecurity challenge teaches real-world skills!",
                "Take your time - understanding is more important than speed.",
                "Each module builds on the previous one. Master the basics first!",
                "Don't hesitate to use the hint system - even experts need guidance sometimes.",
                "The most valuable skill is learning to think like both an attacker and defender."
            ],
            encouragement: [
                "You're doing excellent work, Navigator!",
                "The crew's safety depends on your cybersecurity skills!",
                "Each challenge completed brings us closer to home!",
                "Your skills are growing stronger with each challenge!",
                "The space pirates don't stand a chance against your expertise!"
            ]
        };
    }

    speakToXIS() {
        const messages = this.responses.greetings;
        const message = messages[Math.floor(Math.random() * messages.length)];
        this.displayXISResponse(message);
    }

    requestHint() {
        const messages = this.responses.hints;
        const message = messages[Math.floor(Math.random() * messages.length)];
        this.displayXISResponse(message);
    }

    displayXISResponse(message) {
        const xisEl = document.getElementById('xisMessage');
        if (xisEl) {
            xisEl.style.opacity = '0.5';
            setTimeout(() => {
                bridgeController.typewriterEffect(xisEl, message);
                xisEl.style.opacity = '1';
            }, 300);
        }
    }
}

// =============================================================================
// GLOBAL API FOR CHALLENGE COMPLETION
// =============================================================================

// This function can be called from challenges to update bridge progress
window.notifyBridgeOfCompletion = function(moduleId, challengeId, xpEarned = 100) {
    if (typeof bridgeController !== 'undefined') {
        bridgeController.onChallengeCompleted(moduleId, challengeId, xpEarned);
    }
};

// =============================================================================
// INITIALIZATION
// =============================================================================

let bridgeController;
let xisController;

document.addEventListener('DOMContentLoaded', function() {
    bridgeController = new BridgeController();
    xisController = new XISController();
    
    console.log('🛸 Bridge systems fully operational - Ready for real CTF challenges!');
});