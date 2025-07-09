// =============================================================================
// MAIN.JS - Landing Page Functionality for Navigator's Codebook
// =============================================================================

class NavigatorLanding {
    constructor() {
        this.disclaimerAccepted = false;
        this.scrambleInterval = null;
        this.init();
    }

    init() {
        console.log('🛸 Initializing Navigator\'s Codebook...');
        
        // Show disclaimer on load
        this.showDisclaimer();
        
        // Initialize title scramble effect
        this.initializeTitleScramble();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Navigator landing page initialized');
    }

    // =============================================================================
    // DISCLAIMER MODAL
    // =============================================================================

    showDisclaimer() {
        const modal = document.getElementById('disclaimerModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    hideDisclaimer() {
        const modal = document.getElementById('disclaimerModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    acceptDisclaimer() {
        console.log('✅ Mission parameters accepted');
        this.disclaimerAccepted = true;
        this.hideDisclaimer();
        this.activateSystemsSequence();
    }

declineDisclaimer() {
    console.log('❌ Mission declined - X.I.S. is not happy about this...');
    
    const modal = document.getElementById('disclaimerModal');
    const modalContent = modal.querySelector('.modal-content');
    
    // Dramatic abort sequence with sound effects (if you want)
    modalContent.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <h2 style="color: #ff0000; font-family: 'Orbitron', sans-serif; margin-bottom: 1rem; animation: pulse 0.5s infinite;">
                🚨 EMERGENCY PROTOCOL ACTIVATED 🚨
            </h2>
            <p style="color: #00ffff; font-size: 1.2rem; margin-bottom: 1rem;">
                X.I.S. RESPONSE: "Never gonna give you up..."
            </p>
            <p style="color: #ff8000; font-size: 0.9rem; margin-bottom: 1rem;">
                Activating emergency entertainment protocol...
            </p>
            <div style="margin-top: 1rem;">
                <div class="loading-bar" style="width: 100%; height: 15px; background: #002233; border: 2px solid #00ffff; border-radius: 10px; overflow: hidden;">
                    <div id="loadingProgress" style="height: 100%; background: linear-gradient(90deg, #ff0000, #ff8000, #00ffff); width: 0%; transition: width 0.15s; border-radius: 8px;"></div>
                </div>
                <p style="color: #00ffff; font-size: 0.8rem; margin-top: 0.5rem;">
                    Transmission in progress... 🎵
                </p>
            </div>
        </div>
        
        <style>
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
        </style>
    `;
    
    // Animate loading bar with variable speed for dramatic effect
    let progress = 0;
    const loadingBar = document.getElementById('loadingProgress');
    const loadingInterval = setInterval(() => {
        // Variable speed - starts slow, speeds up
        const speed = Math.max(1, Math.floor(progress / 20) + 1);
        progress += speed;
        loadingBar.style.width = Math.min(100, progress) + '%';
        
        if (progress >= 100) {
            clearInterval(loadingInterval);
            // THE RICK ROLL! 🎵
            window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        }
    }, 150);
}

    // =============================================================================
    // TITLE SCRAMBLE EFFECT
    // =============================================================================

    initializeTitleScramble() {
        const titleElement = document.getElementById('scrambleTitle');
        if (!titleElement) return;

        const originalText = "THE NAVIGATOR'S CODEBOOK";
        const alienSymbols = "ᚨᛒᚲᛞᛖᚠᚷᚺᛁᛃᛚᛗᚾᛟᛈᛋᛏᚢᚹᛃ⟨⟩◊◈◉☉⚡⚢⚣⚤⚦⚧⚪⚫";
        
        // Start with scrambled text
        this.scrambleText(titleElement, alienSymbols, originalText.length);
        
        // After disclaimer is accepted, unscramble
        this.waitForDisclaimer().then(() => {
            setTimeout(() => {
                this.unscrambleText(titleElement, originalText, alienSymbols);
            }, 1000);
        });
    }

    scrambleText(element, symbols, length) {
        let scrambledText = '';
        for (let i = 0; i < length; i++) {
            scrambledText += symbols[Math.floor(Math.random() * symbols.length)];
        }
        element.textContent = scrambledText;
    }

    async unscrambleText(element, targetText, symbols) {
        const steps = 30;
        const stepDelay = 100;
        
        for (let step = 0; step <= steps; step++) {
            let currentText = '';
            
            for (let i = 0; i < targetText.length; i++) {
                const progress = step / steps;
                const charProgress = Math.max(0, (progress - (i / targetText.length)) * 2);
                
                if (charProgress >= 1) {
                    currentText += targetText[i];
                } else if (charProgress > 0.5) {
                    // Occasionally show the correct character
                    currentText += Math.random() > 0.3 ? targetText[i] : symbols[Math.floor(Math.random() * symbols.length)];
                } else {
                    currentText += symbols[Math.floor(Math.random() * symbols.length)];
                }
            }
            
            element.textContent = currentText;
            await this.delay(stepDelay);
        }
        
        element.textContent = targetText;
        console.log('🔤 Title unscrambled - Systems online');
    }

    async waitForDisclaimer() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (this.disclaimerAccepted) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // =============================================================================
    // SYSTEM ACTIVATION SEQUENCE
    // =============================================================================

    async activateSystemsSequence() {
        console.log('🚀 Activating ship systems...');
        
        // Remove blur from main content
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.classList.remove('content-blurred');
        }
        
        // Add system activation effects
        this.showSystemMessages();
    }

    async showSystemMessages() {
        const messages = [
            'X.I.S. AUTHENTICATION: VERIFIED',
            'NAVIGATOR CREDENTIALS: ACCEPTED',
            'SHIP SYSTEMS: INITIALIZING...',
            'MISSION PARAMETERS: LOADED',
            'CYBERSECURITY PROTOCOLS: ACTIVE',
            'READY FOR ADVENTURE'
        ];

        // Create temporary message container
        const messageContainer = this.createSystemMessageContainer();
        
        for (let i = 0; i < messages.length; i++) {
            await this.delay(500);
            this.addSystemMessage(messageContainer, messages[i]);
        }
        
        // Remove message container after delay
        setTimeout(() => {
            messageContainer.remove();
        }, 3000);
    }

    createSystemMessageContainer() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 20, 40, 0.9);
            border: 2px solid #00ffff;
            padding: 1rem;
            max-width: 300px;
            font-family: 'Share Tech Mono', monospace;
            font-size: 0.8rem;
            color: #00ffff;
            z-index: 3000;
            backdrop-filter: blur(10px);
        `;
        document.body.appendChild(container);
        return container;
    }

    addSystemMessage(container, message) {
        const messageElement = document.createElement('div');
        messageElement.textContent = `> ${message}`;
        messageElement.style.cssText = `
            margin-bottom: 0.5rem;
            opacity: 0;
            transform: translateX(20px);
            transition: all 0.3s ease;
        `;
        
        container.appendChild(messageElement);
        
        // Animate in
        setTimeout(() => {
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateX(0)';
        }, 50);
    }

    // =============================================================================
    // NAVIGATION FUNCTIONS
    // =============================================================================

    navigateToModule(moduleId) {
        console.log(`🎯 Navigating to module: ${moduleId}`);
        window.location.href = `modules/${moduleId}.html`;
    }

    startMission() {
        console.log('🚀 Starting mission - Navigating to bridge');
        window.location.href = 'bridge.html';
    }

    // =============================================================================
    // EVENT LISTENERS
    // =============================================================================

    setupEventListeners() {
        // Global navigation functions
        window.navigateToModule = (moduleId) => this.navigateToModule(moduleId);
        window.startMission = () => this.startMission();
        window.acceptDisclaimer = () => this.acceptDisclaimer();
        window.declineDisclaimer = () => this.declineDisclaimer();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                // Close any open modals
                const modals = document.querySelectorAll('.modal-overlay');
                modals.forEach(modal => {
                    if (modal.style.display === 'flex') {
                        modal.style.display = 'none';
                    }
                });
            }
        });
        
        // Prevent right-click context menu for immersion
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.navigatorLanding = new NavigatorLanding();
});

// Also export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigatorLanding;
}