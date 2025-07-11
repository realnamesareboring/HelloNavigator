/**
 * Module Controller for Flight of the Navigator CTF
 * Handles individual challenge modules and their interactions
 */

class ModuleController {
    constructor() {
        this.currentModule = null;
        this.currentChallenge = null;
        this.challengeData = null;
        this.terminalEngine = null;
        this.evidenceFiles = new Map();
        
        console.log('🎮 Module Controller initialized');
        this.initialize();
    }

    // =============================================================================
    // INITIALIZATION
    // =============================================================================
    
    initialize() {
        // Initialize terminal if on challenge page
        if (document.querySelector('.terminal-container')) {
            this.initializeTerminal();
        }
        
        // Initialize evidence system
        this.initializeEvidenceSystem();
        
        // Set up challenge-specific functionality
        this.detectCurrentModule();
        
        // Set up event listeners
        this.setupEventListeners();
    }

    detectCurrentModule() {
        // Detect module from URL or page class
        const path = window.location.pathname;
        const bodyClass = document.body.className;
        
        if (path.includes('identity-defense') || bodyClass.includes('identity')) {
            this.currentModule = 'identity-defense';
        } else if (path.includes('network-defense') || bodyClass.includes('network')) {
            this.currentModule = 'network-defense';
        } else if (path.includes('intelligence-hub') || bodyClass.includes('intelligence')) {
            this.currentModule = 'intelligence-hub';
        } else if (path.includes('cryptographic-core') || bodyClass.includes('crypto')) {
            this.currentModule = 'cryptographic-core';
        }
        
        if (this.currentModule) {
            console.log(`🎯 Current module detected: ${this.currentModule}`);
            this.loadModuleData();
        }
    }

    // =============================================================================
    // CHALLENGE LOADING
    // =============================================================================
    
    async loadModuleData() {
        try {
            // Load challenge configuration based on current module
            const challengeConfig = await this.loadChallengeConfig(this.currentModule);
            this.challengeData = challengeConfig;
            
            // Load evidence files if specified
            if (challengeConfig && challengeConfig.evidenceFiles) {
                await this.loadEvidenceFiles(challengeConfig.evidenceFiles);
            }
            
            // Initialize challenge-specific features
            this.initializeChallengeFeatures();
            
        } catch (error) {
            console.error('❌ Error loading module data:', error);
        }
    }

    async loadChallengeConfig(moduleId) {
        // Map modules to their first challenge for now
        const challengeMap = {
            'identity-defense': 'space-pirate-password-breach',
            'network-defense': 'network-intrusion-analysis',
            'intelligence-hub': 'data-exfiltration-detection', 
            'cryptographic-core': 'encryption-bypass-attempt'
        };
        
        const challengeId = challengeMap[moduleId];
        if (!challengeId) return null;
        
        try {
            const response = await fetch(`/assets/data/challenges/${challengeId}.json`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn(`⚠️ Could not load challenge config for ${challengeId}:`, error);
        }
        
        return null;
    }

    async loadEvidenceFiles(evidenceFileList) {
        for (const fileConfig of evidenceFileList) {
            try {
                const response = await fetch(`/assets/data/evidence/${fileConfig.filename}`);
                if (response.ok) {
                    const content = await response.text();
                    this.evidenceFiles.set(fileConfig.filename, content);
                    console.log(`📁 Loaded evidence file: ${fileConfig.filename}`);
                }
            } catch (error) {
                console.warn(`⚠️ Could not load evidence file ${fileConfig.filename}:`, error);
            }
        }
    }

    // =============================================================================
    // TERMINAL INTEGRATION
    // =============================================================================
    
    initializeTerminal() {
        if (window.TerminalEngine) {
            this.terminalEngine = new window.TerminalEngine();
            console.log('💻 Terminal engine initialized for module');
        }
    }

    setupTerminalCommands() {
        if (!this.terminalEngine) return;
        
        // Add module-specific commands
        this.terminalEngine.commands.set('status', () => {
            return this.getModuleStatus();
        });
        
        this.terminalEngine.commands.set('objective', () => {
            return this.getCurrentObjective();
        });
        
        this.terminalEngine.commands.set('hint', () => {
            return this.getContextualHint();
        });
        
        this.terminalEngine.commands.set('progress', () => {
            return this.getProgressSummary();
        });
    }

    // =============================================================================
    // EVIDENCE SYSTEM
    // =============================================================================
    
    initializeEvidenceSystem() {
        // Set up global evidence download function
        window.downloadEvidenceFile = (filename) => {
            this.downloadEvidence(filename);
        };
        
        // Enhance existing evidence links
        this.enhanceEvidenceLinks();
    }

    enhanceEvidenceLinks() {
        const evidenceLinks = document.querySelectorAll('.resource-link[href="#"]');
        
        evidenceLinks.forEach(link => {
            const text = link.textContent;
            
            // Extract filename from link text
            const filenameMatch = text.match(/([^\/\s]+\.(txt|csv|log|json|xml))/i);
            if (filenameMatch) {
                const filename = filenameMatch[1];
                
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.downloadEvidence(filename);
                });
                
                // Add download indicator
                link.style.position = 'relative';
                if (!link.querySelector('.download-indicator')) {
                    const indicator = document.createElement('span');
                    indicator.className = 'download-indicator';
                    indicator.textContent = ' ⬇️';
                    indicator.style.opacity = '0.7';
                    link.appendChild(indicator);
                }
            }
        });
    }

    downloadEvidence(filename) {
        console.log(`📁 Downloading evidence: ${filename}`);
        
        // Check if we have the file content
        const content = this.evidenceFiles.get(filename);
        
        if (content) {
            // Create and trigger download
            const blob = new Blob([content], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            // Update terminal
            if (this.terminalEngine) {
                this.terminalEngine.addOutput(`[INFO] Evidence file ${filename} downloaded successfully.`);
                this.terminalEngine.addOutput('[INFO] Use terminal commands to examine the data.');
                this.terminalEngine.addOutput(`[TIP] Try: cat ${filename} | head -10`);
            }
            
            // Mark objective as completed
            this.completeObjective('evidence_downloaded');
            
        } else {
            // Fallback: generate sample evidence
            console.warn(`⚠️ Evidence file ${filename} not found, generating sample`);
            this.generateSampleEvidence(filename);
        }
    }

    generateSampleEvidence(filename) {
        let content = '';
        
        if (filename.includes('password')) {
            content = this.generateSamplePasswordFile();
        } else if (filename.includes('log')) {
            content = this.generateSampleLogFile();
        } else {
            content = `# Sample Evidence File: ${filename}\n# Generated for training purposes\n\nThis is sample evidence data for the ${this.currentModule} module.\nAnalyze this data to complete your mission objectives.`;
        }
        
        // Store and download
        this.evidenceFiles.set(filename, content);
        this.downloadEvidence(filename);
    }

    generateSamplePasswordFile() {
        return `# Space Pirates Crew Password Database
# Intercepted from Kepler Station breach
# Classification: EVIDENCE

admin:spacepirate123
captain_hook:password1
blackbeard:123456
navigator:admin
first_mate:qwerty
quartermaster:letmein
gunner:password
cook:12345
lookout:abc123
engineer:password123
medic:welcome
communications:space123
pilot:flyaway
security:guard123
maintenance:fixit
`
    }

    generateSampleLogFile() {
        const now = new Date();
        const logs = [];
        
        for (let i = 0; i < 50; i++) {
            const timestamp = new Date(now.getTime() - (i * 60000)).toISOString();
            const user = ['admin', 'user1', 'user2', 'service_account'][Math.floor(Math.random() * 4)];
            const ip = `192.168.1.${Math.floor(Math.random() * 254) + 1}`;
            const action = ['login', 'logout', 'file_access', 'command_exec'][Math.floor(Math.random() * 4)];
            
            logs.push(`${timestamp} ${user} ${ip} ${action}`);
        }
        
        return logs.join('\n');
    }

    // =============================================================================
    // OBJECTIVE TRACKING
    // =============================================================================
    
    completeObjective(objectiveId) {
        const objective = document.querySelector(`[data-objective-id="${objectiveId}"]`);
        if (objective) {
            objective.classList.add('completed');
            objective.style.textDecoration = 'line-through';
            objective.style.opacity = '0.7';
            
            // Add checkmark
            if (!objective.querySelector('.objective-check')) {
                const check = document.createElement('span');
                check.className = 'objective-check';
                check.textContent = ' ✅';
                check.style.color = '#00ff00';
                objective.appendChild(check);
            }
        }
        
        // Update progress with user progress manager
        if (window.userProgressManager) {
            // This would normally come from challenge config
            window.userProgressManager.completeChallenge(this.currentModule, objectiveId, 50);
        }
        
        console.log(`✅ Objective completed: ${objectiveId}`);
    }

    // =============================================================================
    // STATUS & INFORMATION
    // =============================================================================
    
    getModuleStatus() {
        if (!this.currentModule) return 'No module loaded';
        
        const moduleName = this.getModuleName(this.currentModule);
        const progress = window.userProgressManager?.getProgress();
        const moduleProgress = progress?.modules?.[this.currentModule];
        
        if (moduleProgress) {
            return `${moduleName}\nStatus: ${moduleProgress.completed ? 'COMPLETED' : 'IN PROGRESS'}\nProgress: ${moduleProgress.progress}/${moduleProgress.total}`;
        }
        
        return `${moduleName}\nStatus: ACTIVE`;
    }

    getCurrentObjective() {
        const objectives = document.querySelectorAll('.objectives-list li');
        const incomplete = Array.from(objectives).find(obj => !obj.classList.contains('completed'));
        
        if (incomplete) {
            return `Current Objective:\n${incomplete.textContent.replace('✅', '').trim()}`;
        }
        
        return 'All objectives completed! 🎉';
    }

    getContextualHint() {
        // This would normally come from challenge configuration
        const hints = [
            'Use terminal commands to examine the evidence files.',
            'Look for patterns in the data that indicate security breaches.',
            'Pay attention to unusual login times or locations.',
            'Check for weak passwords or repeated login attempts.'
        ];
        
        const randomHint = hints[Math.floor(Math.random() * hints.length)];
        return `💡 Hint: ${randomHint}`;
    }

    getProgressSummary() {
        const progress = window.userProgressManager?.getProgress();
        if (!progress) return 'Progress tracking not available';
        
        const moduleProgress = progress.modules[this.currentModule];
        if (!moduleProgress) return 'Module progress not available';
        
        return `Mission Progress Summary:
Module: ${this.getModuleName(this.currentModule)}
Completed: ${moduleProgress.progress}/${moduleProgress.total} challenges
Status: ${moduleProgress.completed ? 'COMPLETE' : 'IN PROGRESS'}
Total XP: ${progress.totalXP}
Rank: ${progress.rank}`;
    }

    getModuleName(moduleId) {
        const names = {
            'identity-defense': 'Identity Defense Grid',
            'network-defense': 'Network Defense Array',
            'intelligence-hub': 'Intelligence Gathering Hub', 
            'cryptographic-core': 'Cryptographic Core'
        };
        return names[moduleId] || moduleId;
    }

    // =============================================================================
    // EVENT HANDLING
    // =============================================================================
    
    setupEventListeners() {
        // Handle navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('.return-to-bridge')) {
                this.returnToBridge();
            }
        });
        
        // Handle challenge completion
        document.addEventListener('challengeCompleted', (e) => {
            this.handleChallengeCompletion(e.detail);
        });
        
        // Auto-save progress
        window.addEventListener('beforeunload', () => {
            if (window.userProgressManager) {
                window.userProgressManager.saveProgress();
            }
        });
    }

    returnToBridge() {
        window.location.href = '/bridge.html';
    }

    handleChallengeCompletion(challengeData) {
        console.log('🎉 Challenge completed:', challengeData);
        
        // Award points and update progress
        if (window.userProgressManager) {
            window.userProgressManager.completeChallenge(
                this.currentModule, 
                challengeData.challengeId, 
                challengeData.xpReward || 100
            );
        }
        
        // Show completion message
        this.showCompletionMessage(challengeData);
    }

    showCompletionMessage(challengeData) {
        // Create completion modal or notification
        const message = `
🎉 Challenge Completed!

${challengeData.title || 'Challenge'}
XP Awarded: ${challengeData.xpReward || 100}

Great work, Navigator! Continue to the next challenge.
        `;
        
        if (window.showNotification) {
            window.showNotification(message, 'success');
        } else {
            alert(message);
        }
    }

    // =============================================================================
    // CHALLENGE FEATURES
    // =============================================================================
    
    initializeChallengeFeatures() {
        // Set up hint system
        this.initializeHintSystem();
        
        // Set up progress tracking
        this.initializeProgressTracking();
        
        // Set up terminal commands if terminal exists
        if (this.terminalEngine) {
            this.setupTerminalCommands();
        }
    }

    initializeHintSystem() {
        const hintButtons = document.querySelectorAll('.hint-btn, .get-hint');
        hintButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.showHint();
            });
        });
    }

    showHint() {
        // Simple hint system - would be enhanced with challenge-specific hints
        const hint = this.getContextualHint();
        
        if (this.terminalEngine) {
            this.terminalEngine.addOutput(hint);
        } else {
            alert(hint);
        }
    }

    initializeProgressTracking() {
        // Track user actions for analytics
        this.trackModuleEntry();
    }

    trackModuleEntry() {
        if (window.userProgressManager) {
            const progress = window.userProgressManager.getProgress();
            console.log(`📊 Module entry tracked: ${this.currentModule}`);
        }
    }
}

// Initialize module controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (!window.moduleController) {
        window.moduleController = new ModuleController();
    }
});

console.log('✅ Module Controller loaded successfully');