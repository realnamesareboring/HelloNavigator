// =============================================================================
// BRIDGE CONTROLLER - Main dashboard functionality
// =============================================================================

class BridgeController {
    constructor() {
        this.modules = {
            'identity-defense': { unlocked: true, progress: 0, total: 4 },
            'network-defense': { unlocked: false, progress: 0, total: 4 },
            'intelligence-hub': { unlocked: false, progress: 0, total: 4 },
            'cryptographic-core': { unlocked: false, progress: 0, total: 4 }
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
            
            // Add achievement and log entry
            this.addAchievement(`Module Completed: ${this.getModuleName(moduleId)}`);
            this.addLogEntry(`${this.getModuleName(nextModule)} systems unlocked`);
        }
        
        // Check if all modules completed
        if (moduleOrder.every(id => this.modules[id].completed)) {
            this.completeAllModules();
        }
    }

    // =============================================================================
    // DISPLAY UPDATES
    // =============================================================================

    updateAllDisplays() {
        this.updateModuleDisplays();
        this.updateOverallProgress();
        this.updateXISMessage();
    }

    updateModuleDisplays() {
        Object.keys(this.modules).forEach(moduleId => {
            const module = this.modules[moduleId];
            const statusEl = document.getElementById(`status-${moduleId.split('-')[0]}`);
            const progressEl = document.getElementById(`progress-${moduleId.split('-')[0]}`);
            const textEl = document.getElementById(`text-${moduleId.split('-')[0]}`);
            
            if (statusEl && progressEl && textEl) {
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

    // =============================================================================
    // NAVIGATION & ACTIONS
    // =============================================================================

    enterModule(moduleId) {
        if (!this.modules[moduleId]?.unlocked) {
            this.showRequirements(moduleId);
            return;
        }
        
        this.addLogEntry(`Entering ${this.getModuleName(moduleId)}`);
        window.location.href = `modules/${moduleId}.html`;
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

    viewRequirements(moduleId) {
        this.showRequirements(moduleId);
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
                'Configure two-factor authentication systems',
                'Defend against social engineering attacks',
                'Establish password security policies'
            ],
            'network-defense': [
                'Configure firewall protection systems',
                'Analyze network traffic patterns',
                'Secure wireless communication channels',
                'Implement intrusion detection systems'
            ],
            'intelligence-hub': [
                'Master reconnaissance techniques',
                'Learn information gathering methods',
                'Understand digital footprint analysis',
                'Practice ethical penetration testing'
            ],
            'cryptographic-core': [
                'Implement encryption protocols',
                'Master cipher analysis techniques',
                'Configure secure key exchange',
                'Restore quantum-safe communications'
            ]
        };
        return objectives[moduleId] || [];
    }

    addLogEntry(text) {
        const timestamp = new Date().toISOString().split('T')[1].substring(0, 5);
        const stardate = new Date().toISOString().split('T')[0].replace(/-/g, '.').substring(2);
        
        this.missionLog.unshift({
            time: `${stardate}.${timestamp.replace(':', '')}`,
            text: text,
            timestamp: Date.now()
        });
        
        // Keep only last 10 entries
        if (this.missionLog.length > 10) {
            this.missionLog = this.missionLog.slice(0, 10);
        }
        
        this.updateMissionLogDisplay();
        this.saveProgress();
    }

    updateMissionLogDisplay() {
        const logContainer = document.getElementById('missionLog');
        if (!logContainer) return;
        
        logContainer.innerHTML = this.missionLog.map(entry => `
            <div class="log-entry">
                <span class="log-time">${entry.time}</span>
                <span class="log-text">${entry.text}</span>
            </div>
        `).join('');
    }

    typewriterEffect(element, text, speed = 50) {
        element.textContent = '';
        let i = 0;
        const timer = setInterval(() => {
            element.textContent += text.charAt(i);
            i++;
            if (i >= text.length) {
                clearInterval(timer);
            }
        }, speed);
    }

    updateSystemTime() {
        const timeEl = document.getElementById('systemTime');
        if (timeEl) {
            const now = new Date();
            const stardate = now.toISOString().split('T')[0].replace(/-/g, '.').substring(2);
            const time = now.toTimeString().substring(0, 8);
            timeEl.textContent = `STARDATE: ${stardate} | ${time}`;
        }
    }

    startBridgeAnimations() {
        // Pulsing alert light
        const alertLight = document.getElementById('alertLight');
        if (alertLight) {
            setInterval(() => {
                alertLight.style.opacity = alertLight.style.opacity === '0.3' ? '1' : '0.3';
            }, 1000);
        }
    }

    closeModal() {
        document.getElementById('moduleModal').style.display = 'none';
        document.getElementById('modalAction').style.display = 'block';
    }

    // Quick Actions
    returnToLanding() {
        window.location.href = 'index.html';
    }

    emergencyProtocol() {
        window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    }
}

// =============================================================================
// X.I.S. CHARACTER CONTROLLER
// =============================================================================

class XISController {
    constructor() {
        this.mood = 'helpful'; // helpful, excited, concerned, proud
        this.responses = {
            greetings: [
                "Greetings, Navigator! How may I assist you today?",
                "Welcome back to the bridge! Ready for another challenge?",
                "Navigator on deck! All systems report ready for your commands."
            ],
            hints: [
                "Remember, every cybersecurity challenge teaches real-world skills!",
                "Take your time - understanding is more important than speed.",
                "Each module builds on the previous one. Master the basics first!"
            ],
            encouragement: [
                "You're doing excellent work, Navigator!",
                "The crew's safety depends on your cybersecurity skills!",
                "Each challenge completed brings us closer to home!"
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
// INITIALIZATION
// =============================================================================

let bridgeController;
let xisController;

document.addEventListener('DOMContentLoaded', function() {
    bridgeController = new BridgeController();
    xisController = new XISController();
    
    console.log('🛸 Bridge systems fully operational');
});