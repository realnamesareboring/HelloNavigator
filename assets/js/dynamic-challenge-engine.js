// =============================================================================
// DYNAMIC CHALLENGE ENGINE - Modular, JSON-Driven Challenge System
// Replaces ALL hardcoded challenge-specific JavaScript files
// =============================================================================

class DynamicChallengeEngine {
    constructor() {
        this.challengeData = null;
        this.evidenceFiles = new Map();
        this.loadedEvidence = new Set();
        this.challengeState = {
            objectivesCompleted: new Set(),
            hintsRevealed: 0,
            flagSubmitted: false,
            startTime: Date.now()
        };
        
        console.log('🎯 Dynamic Challenge Engine initializing...');
        this.init();
    }
    
    // =============================================================================
    // INITIALIZATION & CONFIGURATION LOADING
    // =============================================================================
    
    async init() {
        try {
            // Extract challenge ID from current page
            const challengeId = this.extractChallengeId();
            console.log(`🎯 Detected challenge: ${challengeId}`);
            
            // Load challenge configuration from JSON
            await this.loadChallengeConfig(challengeId);
            
            // Wait for core framework to be ready
            await this.waitForFramework();
            
            // Setup all systems based on JSON config
            await this.setupSystemsFromConfig();
            
            // Make globally accessible
            window.dynamicChallengeEngine = this;
            
            console.log(`✅ Dynamic Challenge Engine ready for: ${this.challengeData.title}`);
            
        } catch (error) {
            console.error('❌ Dynamic Challenge Engine failed to initialize:', error);
            this.setupFallback();
        }
    }
    
    extractChallengeId() {
        // Try multiple methods to extract challenge ID
        
        // Method 1: HTML data attribute
        const bodyDataset = document.body.dataset.challengeId;
        if (bodyDataset) return bodyDataset;
        
        // Method 2: URL path extraction
        const path = window.location.pathname;
        const urlMatch = path.match(/\/modules\/(.+)\.html/);
        if (urlMatch) return urlMatch[1];
        
        // Method 3: Meta tag
        const metaTag = document.querySelector('meta[name="challenge-id"]');
        if (metaTag) return metaTag.content;
        
        // Method 4: Page title extraction (fallback)
        const titleMatch = document.title.match(/(\w+-\w+-\w+)/);
        if (titleMatch) return titleMatch[1];
        
        // Default fallback
        return 'space-pirate-password-breach';
    }
    
    getBasePath() {
        // Get the correct base path for asset loading
        // This handles cases where the site is in a subdirectory
        const pathname = window.location.pathname;
        
        // If we're in a subdirectory like /navigator-codebook/, extract it
        const pathParts = pathname.split('/');
        
        // Find the base directory (usually the second part after the domain)
        // e.g., /navigator-codebook/modules/challenge.html -> /navigator-codebook/
        if (pathParts.length > 2 && pathParts[1]) {
            return `/${pathParts[1]}/`;
        }
        
        // If no subdirectory, use root
        return '/';
    }
    
    async loadChallengeConfig(challengeId) {
        console.log(`📋 Loading challenge configuration: ${challengeId}`);
        
        try {
            // Get the correct base path from the current URL
            const basePath = this.getBasePath();
            const configUrl = `${basePath}assets/data/scenarios/${challengeId}/${challengeId}.json`;
            
            console.log(`🔗 Fetching config from: ${configUrl}`);
            const response = await fetch(configUrl);
            
            if (!response.ok) {
                throw new Error(`Challenge config not found: ${response.status}`);
            }
            
            this.challengeData = await response.json();
            console.log(`✅ Challenge config loaded: ${this.challengeData.title}`);
            
            // Pre-load evidence files
            await this.preloadEvidenceFiles();
            
        } catch (error) {
            console.error(`❌ Failed to load challenge config for '${challengeId}':`, error);
            throw error;
        }
    }
    
    async preloadEvidenceFiles() {
        if (!this.challengeData.evidenceFiles) return;
        
        const basePath = this.getBasePath();
        
        for (const evidenceFile of this.challengeData.evidenceFiles) {
            try {
                const evidenceUrl = `${basePath}assets/data/scenarios/${this.challengeData.challengeId}/${evidenceFile.filename}`;
                console.log(`🔗 Fetching evidence from: ${evidenceUrl}`);
                
                const response = await fetch(evidenceUrl);
                if (response.ok) {
                    const content = await response.text();
                    this.evidenceFiles.set(evidenceFile.filename, content);
                    console.log(`📄 Preloaded evidence: ${evidenceFile.filename}`);
                }
            } catch (error) {
                console.warn(`⚠️ Failed to preload ${evidenceFile.filename}:`, error);
            }
        }
    }
    
    async waitForFramework() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 100; // 5 seconds max
            
            const checkFramework = () => {
                const hasTerminal = window.terminalEngine && window.terminalEngine.commands;
                const hasController = window.challengeController;
                
                if (hasTerminal && hasController) {
                    console.log('✅ Core framework ready');
                    resolve();
                } else if (attempts++ < maxAttempts) {
                    setTimeout(checkFramework, 50);
                } else {
                    reject(new Error('Core framework not ready after 5 seconds'));
                }
            };
            
            checkFramework();
        });
    }
    
    // =============================================================================
    // SYSTEM SETUP FROM JSON CONFIGURATION
    // =============================================================================
    
    async setupSystemsFromConfig() {
        console.log('🔧 Setting up systems from JSON configuration...');
        
        // Setup terminal commands based on config
        this.setupTerminalCommands();
        
        // Setup evidence download system
        this.setupEvidenceSystem();
        
        // Update hint system with challenge-specific hints
        this.updateHintSystem();
        
        // Update challenge controller with objectives
        this.updateChallengeController();
        
        // Populate dynamic content in HTML
        this.populateDynamicContent();
        
        console.log('✅ All systems configured from JSON');
    }
    
    setupTerminalCommands() {
        const terminal = window.terminalEngine;
        if (!terminal || !this.challengeData.terminalCommands) {
            console.warn('⚠️ Terminal not ready or no commands configured');
            return;
        }
        
        console.log('🖥️ Setting up terminal commands from config...');
        
        // Add commands dynamically based on JSON config
        Object.entries(this.challengeData.terminalCommands).forEach(([command, config]) => {
            terminal.commands.set(command, (args) => {
                return this.executeCommand(command, args, config);
            });
            console.log(`✅ Registered command: ${command}`);
        });
        
        // Enhanced help command that shows available commands
        terminal.commands.set('help', () => {
            return this.generateHelpText();
        });
    }
    
    setupEvidenceSystem() {
        console.log('📁 Setting up evidence download system...');
        
        // Replace global download function with config-driven version
        window.downloadEvidenceFile = (filename) => {
            console.log(`📁 Downloading evidence: ${filename}`);
            
            const evidenceFile = this.challengeData.evidenceFiles?.find(f => f.filename === filename);
            if (!evidenceFile) {
                console.error('❌ Evidence file not found in config');
                return;
            }
            
            const content = this.evidenceFiles.get(filename);
            if (!content) {
                console.error('❌ Evidence content not loaded');
                return;
            }
            
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
            
            // Mark as loaded and update objectives
            this.loadedEvidence.add(filename);
            this.completeObjective(1, 'evidence_downloaded');
            
            // Update terminal
            if (window.terminalEngine) {
                window.terminalEngine.addOutput(`[INFO] Evidence file ${filename} loaded successfully.`);
                window.terminalEngine.addOutput('[INFO] Use terminal commands to examine the data.');
            }
        };
    }
    
    updateHintSystem() {
        if (window.hintSystem && this.challengeData.progressiveHints) {
            console.log('💡 Updating hint system with challenge-specific hints...');
            window.hintSystem.updateHints(this.challengeData.progressiveHints);
        }
    }
    
    updateChallengeController() {
        if (window.challengeController && this.challengeData.objectives) {
            console.log('🎯 Updating challenge controller with objectives...');
            // Update objectives in the UI
            this.renderObjectives();
        }
    }
    
    populateDynamicContent() {
        console.log('📝 Populating dynamic content in HTML...');
        
        // Update XIS message
        const xisElement = document.querySelector('.xis-message, #xisMessage');
        if (xisElement && this.challengeData.xisMessage) {
            xisElement.textContent = this.challengeData.xisMessage;
        }
        
        // Update mission brief  
        const briefElement = document.querySelector('.mission-brief, #missionBrief');
        if (briefElement && this.challengeData.missionBrief) {
            briefElement.innerHTML = this.challengeData.missionBrief.content || this.challengeData.missionBrief;
        }
        
        // Update challenge title
        const titleElement = document.querySelector('#challengeTitle, .challenge-title');
        if (titleElement && this.challengeData.title) {
            titleElement.textContent = `🚨 ${this.challengeData.title}`;
        }
        
        // Create evidence buttons
        this.createEvidenceButtons();
        
        // Create objectives list
        this.createObjectivesList();
    }
    
    // =============================================================================
    // COMMAND EXECUTION SYSTEM
    // =============================================================================
    
    executeCommand(command, args, config) {
        console.log(`🖥️ Executing command: ${command} ${args.join(' ')}`);
        
        // Check if command requires evidence
        if (config.requiresEvidence && !this.hasAnyEvidenceLoaded()) {
            return '[ERROR] No evidence files loaded. Download evidence files first using the buttons in the left panel.';
        }
        
        // Route to specific command handlers
        switch (command) {
            case 'cat':
                return this.handleCatCommand(args);
            case 'grep':
                return this.handleGrepCommand(args);
            case 'analyze':
                return this.handleAnalyzeCommand(args);
            case 'submit':
                return this.handleSubmitCommand(args);
            default:
                return `[ERROR] Command '${command}' not implemented`;
        }
    }
    
    handleCatCommand(args) {
        if (args.length === 0) {
            return '[ERROR] Usage: cat <filename>';
        }
        
        const filename = args[0];
        
        if (!this.loadedEvidence.has(filename)) {
            return `[ERROR] File '${filename}' not found. Download the evidence file first.`;
        }
        
        const content = this.evidenceFiles.get(filename);
        if (!content) {
            return `[ERROR] Unable to read '${filename}'`;
        }
        
        // Mark objective as completed
        this.completeObjective(2, 'file_examined');
        
        return content + '\n\n[INFO] Use "grep <pattern> ' + filename + '" to search for specific patterns.';
    }
    
    handleGrepCommand(args) {
        if (args.length < 2) {
            const examples = this.challengeData.terminalCommands?.grep?.examples || [];
            return `[ERROR] Usage: grep <pattern> <filename>\n\nExamples:\n${examples.map(ex => `  ${ex}`).join('\n')}`;
        }
        
        const pattern = args[0];
        const filename = args[1];
        
        if (!this.loadedEvidence.has(filename)) {
            return `[ERROR] File '${filename}' not found. Download the evidence file first.`;
        }
        
        const content = this.evidenceFiles.get(filename);
        const lines = content.split('\n');
        const matches = lines.filter(line => 
            line.toLowerCase().includes(pattern.toLowerCase())
        );
        
        if (matches.length === 0) {
            return `[INFO] No matches found for '${pattern}' in ${filename}`;
        }
        
        // Auto-complete objectives based on search patterns
        this.trackSearchProgress(pattern);
        
        return `[INFO] Found ${matches.length} matches for '${pattern}':\n\n${matches.join('\n')}`;
    }
    
    handleAnalyzeCommand(args) {
        if (args.length === 0) {
            return '[ERROR] Usage: analyze <filename>';
        }
        
        const filename = args[0];
        
        if (!this.loadedEvidence.has(filename)) {
            return '[ERROR] File not found.';
        }
        
        // Mark analysis objective complete
        this.completeObjective(2, 'pattern_searched');
        
        // Return analysis from challenge config
        if (this.challengeData.analysisResults) {
            return this.generateAnalysisReport();
        }
        
        return '[INFO] Analysis complete. Review the file manually for patterns.';
    }
    
    handleSubmitCommand(args) {
        if (args.length === 0) {
            const format = this.challengeData.validation?.flagFormat || 'FLAG{...}';
            return `[ERROR] Usage: submit <flag>\n\nExample:\n  submit ${format}`;
        }
        
        const submittedFlag = args.join(' ');
        
        if (submittedFlag === this.challengeData.validation?.correctFlag) {
            this.completeObjective(5, 'flag_submitted');
            this.challengeState.flagSubmitted = true;
            
            // Trigger success modal if available
            if (window.challengeController?.showSuccessModal) {
                setTimeout(() => window.challengeController.showSuccessModal(), 1000);
            }
            
            return `[SUCCESS] ${this.challengeData.validation.successMessage}`;
        } else {
            return `[ERROR] ${this.challengeData.validation.failureMessage}`;
        }
    }
    
    // =============================================================================
    // HELPER METHODS
    // =============================================================================
    
    hasAnyEvidenceLoaded() {
        return this.loadedEvidence.size > 0;
    }
    
    trackSearchProgress(pattern) {
        const lowerPattern = pattern.toLowerCase();
        
        // Track admin account searches
        if (lowerPattern.includes('admin')) {
            this.completeObjective(3, 'admin_searched');
        }
        
        // Track flag discovery
        if (lowerPattern.includes('navigator')) {
            this.completeObjective(4, 'flag_found');
        }
    }
    
    generateAnalysisReport() {
        const results = this.challengeData.analysisResults;
        let report = '[SECURITY ANALYSIS REPORT]\n\n';
        
        if (results.weakPatterns) {
            report += '🚨 WEAK PASSWORD PATTERNS DETECTED:\n';
            results.weakPatterns.forEach(pattern => {
                report += `• ${pattern}\n`;
            });
            report += '\n';
        }
        
        if (results.adminVulnerabilities) {
            report += '⚠️ ADMIN ACCOUNT VULNERABILITIES:\n';
            results.adminVulnerabilities.forEach(vuln => {
                report += `• ${vuln}\n`;
            });
            report += '\n';
        }
        
        if (results.securityInsights) {
            report += '📊 SECURITY INSIGHTS:\n';
            report += results.securityInsights;
        }
        
        return report;
    }
    
    generateHelpText() {
        let help = 'Available commands:\n\n';
        
        // Add commands from config
        Object.entries(this.challengeData.terminalCommands || {}).forEach(([cmd, config]) => {
            help += `${cmd.padEnd(20)} - ${config.description}\n`;
        });
        
        help += '\nCHALLENGE-SPECIFIC EXAMPLES:\n';
        Object.entries(this.challengeData.terminalCommands || {}).forEach(([cmd, config]) => {
            if (config.examples) {
                config.examples.forEach(example => {
                    help += `  ${example}\n`;
                });
            }
        });
        
        return help;
    }
    
    completeObjective(objectiveId, triggerEvent = null) {
        if (this.challengeState.objectivesCompleted.has(objectiveId)) return;
        
        this.challengeState.objectivesCompleted.add(objectiveId);
        
        // Update challenge controller
        if (window.challengeController?.completeObjective) {
            window.challengeController.completeObjective(objectiveId);
        }
        
        // Update UI
        this.updateObjectiveStatus(objectiveId);
        
        console.log(`✅ Objective ${objectiveId} completed (${triggerEvent})`);
    }
    
    updateObjectiveStatus(objectiveId) {
        const objectiveElement = document.querySelector(`[data-objective-id="${objectiveId}"]`);
        if (objectiveElement) {
            objectiveElement.classList.add('completed');
        }
    }
    
    createEvidenceButtons() {
        const evidenceContainer = document.querySelector('#evidenceButtons, .evidence-buttons');
        if (!evidenceContainer || !this.challengeData.evidenceFiles) return;
        
        evidenceContainer.innerHTML = '';
        
        this.challengeData.evidenceFiles.forEach(file => {
            const button = document.createElement('button');
            button.className = 'download-btn';
            button.onclick = () => downloadEvidenceFile(file.filename);
            button.innerHTML = `
                ${file.displayName}
                <span class="file-size">${file.fileSize}</span>
            `;
            evidenceContainer.appendChild(button);
        });
    }
    
    createObjectivesList() {
        const objectivesList = document.querySelector('#objectivesList, .objectives-list');
        if (!objectivesList || !this.challengeData.objectives) return;
        
        objectivesList.innerHTML = '';
        
        this.challengeData.objectives.forEach((objective, index) => {
            const li = document.createElement('li');
            li.setAttribute('data-objective-id', objective.id);
            li.innerHTML = `<strong>Step ${index + 1}:</strong> ${objective.description}`;
            objectivesList.appendChild(li);
        });
    }
    
    renderObjectives() {
        // Render objectives in the challenge UI
        this.createObjectivesList();
    }
    
    setupFallback() {
        console.log('🔄 Setting up fallback challenge system...');
        
        // Minimal fallback if dynamic loading fails
        window.downloadEvidenceFile = (filename) => {
            console.log(`📁 Fallback evidence download: ${filename}`);
            alert('Challenge system not fully loaded. Please refresh the page.');
        };
    }
    
    // =============================================================================
    // PUBLIC API FOR DEBUGGING
    // =============================================================================
    
    getState() {
        return {
            challengeData: this.challengeData,
            evidenceFiles: Array.from(this.evidenceFiles.keys()),
            loadedEvidence: Array.from(this.loadedEvidence),
            challengeState: this.challengeState
        };
    }
    
    resetChallenge() {
        this.challengeState.objectivesCompleted.clear();
        this.loadedEvidence.clear();
        this.challengeState.hintsRevealed = 0;
        this.challengeState.flagSubmitted = false;
        console.log('🔄 Challenge state reset');
    }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize with a short delay to ensure all scripts are loaded
    setTimeout(() => {
        try {
            window.dynamicChallengeEngine = new DynamicChallengeEngine();
            console.log('🎯 Dynamic Challenge Engine initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Dynamic Challenge Engine:', error);
        }
    }, 300);
});

// Global function for backward compatibility
window.initializeDynamicChallenge = function() {
    if (!window.dynamicChallengeEngine) {
        window.dynamicChallengeEngine = new DynamicChallengeEngine();
    }
};

console.log('🎯 Dynamic Challenge Engine script loaded');