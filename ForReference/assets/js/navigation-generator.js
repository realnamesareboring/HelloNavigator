// =============================================================================
// Dynamic Navigation Generator - JSON-Driven Sidebar + Overview Stats System
// =============================================================================

class NavigationGenerator {
    constructor() {
        this.navigationConfig = null;
        this.challengeCache = new Map(); // Cache for challenge metadata
    }

    // =============================================================================
    // Main Navigation Generation
    // =============================================================================

    async generateDynamicNavigation() {
        try {
            console.log('🔄 Generating dynamic navigation...');
            
            // Load navigation configuration
            this.navigationConfig = await window.dataLoader.loadNavigationConfig();
            if (!this.navigationConfig) {
                throw new Error('Failed to load navigation configuration');
            }

            // Find the sidebar container
            const sidebar = document.querySelector('.sidebar');
            if (!sidebar) {
                throw new Error('Sidebar container not found');
            }

            // Generate navigation HTML
            const navigationHTML = await this.createNavigationHTML();
            
            // Replace static content with dynamic content
            this.replaceStaticNavigation(sidebar, navigationHTML);
            
            console.log('✅ Dynamic navigation generated successfully');
            
        } catch (error) {
            console.error('❌ Failed to generate dynamic navigation:', error);
            console.log('🔄 Falling back to static navigation');
        }
    }

    async createNavigationHTML() {
        const platforms = this.navigationConfig.platforms;
        const platformsHTML = [];

        // Sort platforms by order
        const sortedPlatforms = Object.entries(platforms).sort((a, b) => {
            return (a[1].order || 999) - (b[1].order || 999);
        });

        for (const [platformId, platform] of sortedPlatforms) {
            const platformHTML = await this.createPlatformSection(platformId, platform);
            platformsHTML.push(platformHTML);
        }

        return platformsHTML.join('');
    }

    async createPlatformSection(platformId, platform) {
        // Sort challenges by order
        const sortedChallenges = (platform.challenges || []).sort((a, b) => {
            return (a.order || 999) - (b.order || 999);
        });

        // Generate challenges HTML
        const challengesHTML = [];
        for (const challenge of sortedChallenges) {
            const challengeHTML = await this.createChallengeHTML(challenge);
            challengesHTML.push(challengeHTML);
        }

        return `
            <div class="platform-section">
                <div class="platform-header" onclick="togglePlatform('${platformId}')">
                    <span>
                        <span class="platform-icon">${platform.icon}</span>
                        ${platform.name}
                    </span>
                    <span class="expand-icon" id="expand-${platformId}">▼</span>
                </div>
                <div class="attack-paths" id="paths-${platformId}">
                    ${challengesHTML.join('')}
                </div>
            </div>
        `;
    }

    async createChallengeHTML(challenge) {
        // Get challenge metadata (cached for performance)
        const challengeData = await this.getChallengeMetadata(challenge.id);
        
        // Determine classes and attributes
        const difficultyClass = `difficulty-${challengeData.difficulty || 'beginner'}`;
        const statusClasses = this.getStatusClasses(challenge);
        const clickHandler = challenge.status === 'available' ? 
            `onclick="selectScenario('${challenge.id}')"` : '';

        // Build challenge HTML
        return `
            <div class="attack-path ${statusClasses}" ${clickHandler}>
                <span class="attack-path-title">${challengeData.title}</span>
                <div class="challenge-badges">
                    ${this.createDifficultyBadge(challengeData.difficulty)}
                    ${this.createStatusBadges(challenge)}
                </div>
            </div>
        `;
    }

    async getChallengeMetadata(challengeId) {
        // Check cache first
        if (this.challengeCache.has(challengeId)) {
            return this.challengeCache.get(challengeId);
        }

        try {
            // Load individual challenge data for metadata
            const challengeData = await window.dataLoader.loadIndividualChallenge(challengeId);
            
            // Cache the metadata
            const metadata = {
                title: challengeData.title,
                difficulty: challengeData.difficulty,
                estimatedTime: challengeData.estimatedTime,
                xpReward: challengeData.xpReward
            };
            
            this.challengeCache.set(challengeId, metadata);
            return metadata;
            
        } catch (error) {
            console.warn(`⚠️ Could not load metadata for ${challengeId}, using defaults`);
            
            // Return default metadata
            const defaultMetadata = {
                title: this.formatChallengeTitle(challengeId),
                difficulty: 'beginner',
                estimatedTime: 'Unknown',
                xpReward: 0
            };
            
            this.challengeCache.set(challengeId, defaultMetadata);
            return defaultMetadata;
        }
    }

    formatChallengeTitle(challengeId) {
        // Convert kebab-case to Title Case
        return challengeId
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    getStatusClasses(challenge) {
        const classes = [];
        
        if (challenge.status === 'coming-soon') {
            classes.push('challenge-coming-soon');
        }
        
        if (challenge.isNew) {
            classes.push('challenge-new');
        }
        
        if (challenge.featured) {
            classes.push('challenge-featured');
        }
        
        return classes.join(' ');
    }

    createDifficultyBadge(difficulty) {
        const difficultyInfo = this.navigationConfig.difficultyLevels[difficulty] || {
            name: 'Unknown',
            color: '#666'
        };
        
        return `
            <span class="difficulty-badge difficulty-${difficulty}" style="background-color: ${difficultyInfo.color}">
                ${difficultyInfo.name}
            </span>
        `;
    }

    createStatusBadges(challenge) {
        const badges = [];
        
        // Status badge
        if (challenge.status !== 'available') {
            const statusInfo = this.navigationConfig.statusTypes[challenge.status] || {
                name: challenge.status,
                icon: '❓'
            };
            
            badges.push(`
                <span class="status-badge status-${challenge.status}">
                    ${statusInfo.icon} ${statusInfo.name}
                </span>
            `);
        }
        
        // New badge
        if (challenge.isNew) {
            badges.push(`
                <span class="status-badge status-new">
                    ✨ NEW
                </span>
            `);
        }
        
        // Featured badge
        if (challenge.featured) {
            badges.push(`
                <span class="status-badge status-featured">
                    ⭐ Featured
                </span>
            `);
        }
        
        return badges.join('');
    }

    replaceStaticNavigation(sidebar, dynamicHTML) {
        // Find existing platform sections
        const existingSections = sidebar.querySelectorAll('.platform-section');
        
        if (existingSections.length > 0) {
            // Replace existing sections
            const firstSection = existingSections[0];
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = dynamicHTML;
            
            // Remove old sections
            existingSections.forEach(section => section.remove());
            
            // Insert new sections
            const sidebarHeader = sidebar.querySelector('.sidebar-header');
            if (sidebarHeader) {
                sidebarHeader.insertAdjacentHTML('afterend', dynamicHTML);
            } else {
                sidebar.innerHTML = dynamicHTML;
            }
        } else {
            // No existing sections, append after header
            const sidebarHeader = sidebar.querySelector('.sidebar-header');
            if (sidebarHeader) {
                sidebarHeader.insertAdjacentHTML('afterend', dynamicHTML);
            } else {
                sidebar.innerHTML = `
                    <div class="sidebar-header">
                        <div class="sidebar-title">Training Modules</div>
                        <div class="sidebar-subtitle">Choose your learning path</div>
                    </div>
                    ${dynamicHTML}
                `;
            }
        }
    }

    // =============================================================================
    // Utility Functions
    // =============================================================================

    async updateChallengeStatus(challengeId, newStatus) {
        // Update the navigation config
        for (const platform of Object.values(this.navigationConfig.platforms)) {
            const challenge = platform.challenges.find(c => c.id === challengeId);
            if (challenge) {
                challenge.status = newStatus;
                break;
            }
        }
        
        // Re-generate navigation
        await this.generateDynamicNavigation();
    }

    async addNewChallenge(platformId, challengeData) {
        // Add to navigation config
        const platform = this.navigationConfig.platforms[platformId];
        if (platform) {
            platform.challenges.push({
                id: challengeData.id,
                status: challengeData.status || 'coming-soon',
                order: challengeData.order || (platform.challenges.length + 1),
                isNew: true,
                featured: challengeData.featured || false
            });
            
            // Re-generate navigation
            await this.generateDynamicNavigation();
        }
    }

    getAvailableChallenges() {
        const available = [];
        for (const platform of Object.values(this.navigationConfig.platforms)) {
            for (const challenge of platform.challenges) {
                if (challenge.status === 'available') {
                    available.push({
                        platformId: platform.id,
                        platformName: platform.name,
                        challengeId: challenge.id,
                        ...challenge
                    });
                }
            }
        }
        return available;
    }

    getTotalChallengeStats() {
        let total = 0;
        let available = 0;
        let comingSoon = 0;
        
        for (const platform of Object.values(this.navigationConfig.platforms)) {
            for (const challenge of platform.challenges) {
                total++;
                if (challenge.status === 'available') {
                    available++;
                } else if (challenge.status === 'coming-soon') {
                    comingSoon++;
                }
            }
        }
        
        return { total, available, comingSoon };
    }
}

// =============================================================================
// Dynamic Overview Panel Stats System
// =============================================================================

async function updateOverviewStats() {
    // 🛑 CRITICAL FIX: Prevent infinite loops
    if (window.statsUpdateInProgress) {
        console.log('⚠️ Stats update already in progress, skipping...');
        return;
    }
    
    window.statsUpdateInProgress = true;

    try {
        console.log('🔄 Updating overview panel stats...');
        
        // Get platform and challenge stats
        const platformStats = window.navigationGenerator.getTotalChallengeStats();
        const platformCount = Object.keys(window.navigationGenerator.navigationConfig?.platforms || {}).length;
        
        // Get user progress stats
        const userCompleted = window.userManager ? window.userManager.getCompletedScenarios().length : 0;
        const userXP = window.userManager ? window.userManager.getUserXP() : 0;
        
        // Update stat cards
        const statCards = document.querySelectorAll('.stat-card .stat-number');
        if (statCards.length >= 4) {
            // Animate the number changes
            animateStatNumber(statCards[0], platformStats.total);
            animateStatNumber(statCards[1], platformCount);
            animateStatNumber(statCards[2], userCompleted);
            animateStatNumber(statCards[3], userXP);
        }
        
        // Update platform cards with dynamic descriptions
        await updatePlatformCards();
        
        console.log('✅ Overview stats updated:', {
            totalScenarios: platformStats.total,
            platforms: platformCount,
            completed: userCompleted,
            xp: userXP
        });
        
    } catch (error) {
        console.warn('⚠️ Could not update overview stats:', error);
    } finally {
    // 🛑 CRITICAL: Always clear the flag
    window.statsUpdateInProgress = false;
    }
}

function animateStatNumber(element, targetNumber) {
    const currentNumber = parseInt(element.textContent) || 0;
    const increment = targetNumber > currentNumber ? 1 : -1;
    const duration = Math.min(Math.abs(targetNumber - currentNumber) * 50, 1000); // Max 1 second
    const steps = Math.abs(targetNumber - currentNumber);
    const stepTime = steps > 0 ? duration / steps : 0;
    
    if (currentNumber === targetNumber) return;
    
    let current = currentNumber;
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current;
        
        if (current === targetNumber) {
            clearInterval(timer);
            // Add a subtle highlight effect
            element.parentElement.style.transform = 'scale(1.05)';
            element.parentElement.style.transition = 'transform 0.2s ease';
            setTimeout(() => {
                element.parentElement.style.transform = 'scale(1)';
            }, 200);
        }
    }, stepTime);
}

async function updatePlatformCards() {
    try {
        const platforms = window.navigationGenerator.navigationConfig?.platforms;
        if (!platforms) return;
        
        const platformCards = document.querySelectorAll('.platform-card');
        
        Object.entries(platforms).forEach(([platformId, platform], index) => {
            if (platformCards[index]) {
                const card = platformCards[index];
                
                // Update description with stats
                const availableChallenges = platform.challenges.filter(c => c.status === 'available').length;
                const totalChallenges = platform.challenges.length;
                
                const descElement = card.querySelector('.platform-card-desc');
                if (descElement) {
                    descElement.innerHTML = `
                        ${platform.description}
                        <br><br>
                        <strong>📊 ${availableChallenges}/${totalChallenges} challenges available</strong>
                    `;
                }
                
                // Add progress indicator
                if (!card.querySelector('.platform-progress-bar')) {
                    const progressBar = document.createElement('div');
                    progressBar.className = 'platform-progress-bar';
                    progressBar.innerHTML = `
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${(availableChallenges / totalChallenges) * 100}%"></div>
                        </div>
                        <div class="progress-text">${availableChallenges}/${totalChallenges} Ready</div>
                    `;
                    card.appendChild(progressBar);
                }
            }
        });
        
    } catch (error) {
        console.warn('⚠️ Could not update platform cards:', error);
    }
}

// Enhanced stats getter with more details
function getDetailedStats() {
    try {
        const platformStats = window.navigationGenerator.getTotalChallengeStats();
        const platforms = window.navigationGenerator.navigationConfig?.platforms || {};
        
        const detailedStats = {
            platforms: {
                total: Object.keys(platforms).length,
                breakdown: Object.entries(platforms).map(([id, platform]) => ({
                    id,
                    name: platform.name,
                    icon: platform.icon,
                    total: platform.challenges.length,
                    available: platform.challenges.filter(c => c.status === 'available').length,
                    comingSoon: platform.challenges.filter(c => c.status === 'coming-soon').length,
                    featured: platform.challenges.filter(c => c.featured).length
                }))
            },
            challenges: platformStats,
            user: {
                completed: window.userManager ? window.userManager.getCompletedScenarios().length : 0,
                xp: window.userManager ? window.userManager.getUserXP() : 0,
                rank: window.userManager ? window.userManager.getCurrentRank(window.userManager.getUserXP()) : null
            }
        };
        
        return detailedStats;
    } catch (error) {
        console.error('❌ Failed to get detailed stats:', error);
        return null;
    }
}

// Function to refresh stats when user completes challenges
function refreshOverviewStats() {
    setTimeout(() => {
        updateOverviewStats();
    }, 100); // Small delay to ensure user manager is updated
}

// =============================================================================
// Enhanced Functions for Backward Compatibility
// =============================================================================

// Global navigation generator instance
window.navigationGenerator = new NavigationGenerator();

// Enhanced functions that work with dynamic navigation
function expandPlatform(platformId) {
    toggleSidebar();
    setTimeout(() => {
        if (!expandedPlatforms.has(platformId)) {
            togglePlatform(platformId);
        }
    }, 300);
}

// =============================================================================
// Enhanced Initialization with Stats Integration
// =============================================================================

// Auto-generate navigation when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initializing dynamic navigation system...');
    
    try {
        // Generate dynamic navigation
        await window.navigationGenerator.generateDynamicNavigation();
        
        // Wait for user manager to initialize
        setTimeout(async () => {
            // Update overview stats with real data
            await updateOverviewStats();
            
            // Make refresh function globally available
            window.refreshOverviewStats = refreshOverviewStats;
            
            console.log('✅ Dynamic navigation system initialized with stats integration');
        }, 300); // Small delay to ensure user manager is ready
        
    } catch (error) {
        console.error('❌ Failed to initialize dynamic navigation:', error);
        console.log('🔄 Static navigation will be used as fallback');
        
        // Even if navigation fails, try to update stats
        setTimeout(() => {
            updateOverviewStats();
        }, 500);
    }
});

// Enhanced stats refresh that can be called from anywhere
window.addEventListener('userProgressUpdated', function() {
    console.log('👤 User progress updated, refreshing overview stats...');
    refreshOverviewStats();
});

// Optional: Refresh stats periodically (every 30 seconds)
setInterval(() => {
    if (window.navigationGenerator && window.navigationGenerator.navigationConfig) {
        updateOverviewStats();
    }
}, 30000);