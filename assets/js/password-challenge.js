// =============================================================================
// PASSWORD CHALLENGE - Hints and Validation System
// =============================================================================

const PasswordChallengeData = {
    challengeId: "space-pirate-password-breach",
    
    // Progressive hint system
    hints: [
        {
            level: 1,
            title: "🔍 Start Your Investigation",
            content: "Begin by examining the intercepted password file. Use the <code>cat crew_passwords.txt</code> command to display its contents. Look at the structure - what information is provided for each crew member?",
            example: "cat crew_passwords.txt"
        },
        {
            level: 2, 
            title: "🎯 Identify Weak Patterns",
            content: "Many passwords follow common weak patterns. Look for passwords that are: dictionary words, simple sequences (123456), keyboard patterns (qwerty), or common defaults (password, admin). Try using <code>grep</code> to search for specific patterns.",
            example: "grep 'password' crew_passwords.txt"
        },
        {
            level: 3,
            title: "👑 Focus on Admin Accounts", 
            content: "Administrative accounts are prime targets! Look for users with roles like 'admin', 'administrator', or 'security'. These accounts often have the weakest passwords because they're created quickly. What patterns do you see in admin passwords?",
            example: "grep 'admin' crew_passwords.txt"
        },
        {
            level: 4,
            title: "🏴‍☠️ Find the Master Pattern",
            content: "Space pirates are clever! They've hidden their master access code in plain sight. Look carefully at ALL the passwords - one of them contains the flag in the format NAVIGATOR{...}. The flag itself reveals their infiltration strategy!",
            example: "grep 'NAVIGATOR' crew_passwords.txt"
        }
    ],
    
    // Challenge validation
    validation: {
        correctFlag: "NAVIGATOR{weak_passwords_compromise_security}",
        
        // Intermediate checkpoints for partial credit
        checkpoints: {
            "found_admin_password": {
                pattern: /admin|administrator/i,
                points: 25,
                message: "✅ Good! You've identified admin accounts with weak passwords."
            },
            "found_common_patterns": {
                patterns: ["password", "123456", "qwerty", "admin"],
                points: 50, 
                message: "✅ Excellent pattern recognition! You've found the most common weak passwords."
            },
            "extracted_flag": {
                pattern: /NAVIGATOR\{[^}]+\}/,
                points: 100,
                message: "🎉 Outstanding! You've uncovered the pirates' infiltration method!"
            }
        }
    },
    
    // Educational explanations
    explanations: {
        weakPatterns: [
            "**Dictionary Words**: 'password', 'welcome', 'freedom' - easily cracked",
            "**Sequential Numbers**: '123456', '12345' - first attempts in attacks", 
            "**Keyboard Patterns**: 'qwerty' - predictable typing patterns",
            "**Default Credentials**: 'admin', 'test' - commonly unchanged defaults",
            "**Personal Names**: 'michelle', 'jordan' - guessable personal information"
        ],
        
        realWorldImpact: "In real breaches, 81% of data breaches involve weak or stolen passwords. The patterns you found here mirror actual compromises like the 2019 Capital One breach, where weak credentials led to 100 million customer records being exposed.",
        
        defenseStrategies: [
            "**Multi-Factor Authentication**: Even weak passwords become much safer",
            "**Password Managers**: Generate and store unique, complex passwords",
            "**Regular Password Audits**: Scan for weak passwords before attackers do",
            "**Account Lockouts**: Prevent brute force attacks on weak passwords"
        ]
    }
};

// =============================================================================
// CHALLENGE-SPECIFIC TERMINAL COMMANDS
// =============================================================================

class PasswordChallengeTerminal extends TerminalEngine {
    constructor() {
        super();
        this.evidenceLoaded = false;
        this.flagSubmitted = false;
        this.hintsUsed = 0;
        
        this.registerPasswordCommands();
    }
    
    registerPasswordCommands() {
        // Override cat command to handle evidence file
        this.commands.set('cat', (args) => {
            if (args.length === 0) {
                return '[ERROR] Usage: cat <filename>';
            }
            
            const filename = args[0];
            
            if (filename === 'crew_passwords.txt') {
                if (!this.evidenceLoaded) {
                    return '[ERROR] File not found. Download the evidence file first using the download button above.';
                }
                
                // Mark objective complete
                if (challengeController) {
                    challengeController.completeObjective(1);
                }
                
                return this.displayPasswordFile();
            }
            
            return `[ERROR] File '${filename}' not found. Available files: crew_passwords.txt`;
        });
        
        // Add grep command for pattern searching
        this.commands.set('grep', (args) => {
            if (args.length < 2) {
                return '[ERROR] Usage: grep <pattern> <filename>';
            }
            
            const pattern = args[0];
            const filename = args[1];
            
            if (filename !== 'crew_passwords.txt') {
                return `[ERROR] File '${filename}' not found.`;
            }
            
            if (!this.evidenceLoaded) {
                return '[ERROR] crew_passwords.txt not found. Download the evidence file first.';
            }
            
            return this.grepPasswordFile(pattern);
        });
        
        // Add sort command for organizing data
        this.commands.set('sort', (args) => {
            if (args.length === 0) {
                return '[ERROR] Usage: sort <filename>';
            }
            
            const filename = args[0];
            if (filename === 'crew_passwords.txt') {
                if (!this.evidenceLoaded) {
                    return '[ERROR] File not found.';
                }
                return this.sortPasswordFile();
            }
            
            return '[ERROR] File not found.';
        });
        
        // Add submit command for flag submission
        this.commands.set('submit', (args) => {
            if (args.length === 0) {
                return '[ERROR] Usage: submit <flag>';
            }
            
            const submittedFlag = args.join(' ');
            return this.validateFlag(submittedFlag);
        });
        
        // Add analyze command for automated analysis
        this.commands.set('analyze', (args) => {
            if (args.length === 0) {
                return '[ERROR] Usage: analyze <filename>';
            }
            
            const filename = args[0];
            if (filename === 'crew_passwords.txt') {
                if (!this.evidenceLoaded) {
                    return '[ERROR] File not found.';
                }
                return this.analyzePasswordSecurity();
            }
            
            return '[ERROR] File not found.';
        });
    }
    
    displayPasswordFile() {
        return `# KEPLER STATION CREW PASSWORD DATABASE
# INTERCEPTED FROM SPACE PIRATE DATA DUMP
# CLASSIFICATION: RESTRICTED
# 
# FORMAT: username:password:role:last_access
# 
johnson:password123:engineer:2024-03-15
smith:123456:technician:2024-03-14
williams:qwerty:pilot:2024-03-13
brown:letmein:medic:2024-03-12
davis:admin:administrator:2024-03-16
miller:password:security:2024-03-11
wilson:123456789:engineer:2024-03-10
...
rivera:NAVIGATOR{weak_passwords_compromise_security}:admin:2024-03-17
ward:admin123:administrator:2024-03-18

[INFO] File contains 65 user accounts with passwords and roles.
[INFO] Use 'grep <pattern> crew_passwords.txt' to search for specific patterns.
[INFO] Use 'analyze crew_passwords.txt' for automated security analysis.`;
    }
    
    grepPasswordFile(pattern) {
        const matches = [];
        const passwordData = [
            'davis:admin:administrator:2024-03-16',
            'miller:password:security:2024-03-11',
            'smith:123456:technician:2024-03-14',
            'williams:qwerty:pilot:2024-03-13',
            'rivera:NAVIGATOR{weak_passwords_compromise_security}:admin:2024-03-17',
            'ward:admin123:administrator:2024-03-18'
        ];
        
        // Simple pattern matching
        passwordData.forEach(line => {
            if (line.toLowerCase().includes(pattern.toLowerCase())) {
                matches.push(line);
            }
        });
        
        if (matches.length === 0) {
            return `[INFO] No matches found for pattern: ${pattern}`;
        }
        
        let result = `[INFO] Found ${matches.length} matches for pattern: ${pattern}\n\n`;
        result += matches.join('\n');
        
        // Track progress based on what they're searching for
        if (pattern.toLowerCase().includes('admin')) {
            challengeController?.completeObjective(3);
        }
        if (pattern.toUpperCase().includes('NAVIGATOR')) {
            challengeController?.completeObjective(4);
        }
        
        return result;
    }
    
    sortPasswordFile() {
        return `[INFO] Sorting crew_passwords.txt by role...

# ADMINISTRATORS (HIGHEST RISK)
davis:admin:administrator:2024-03-16
rivera:NAVIGATOR{weak_passwords_compromise_security}:admin:2024-03-17
ward:admin123:administrator:2024-03-18

# SECURITY PERSONNEL
miller:password:security:2024-03-11
thompson:abc123:security:2024-03-01
martinez:trustno1:engineer:2024-02-28

# ENGINEERS (45 accounts)
# PILOTS (12 accounts)  
# TECHNICIANS (8 accounts)
# MEDICS (5 accounts)

[WARNING] Administrative accounts show critical security vulnerabilities!`;
    }
    
    analyzePasswordSecurity() {
        challengeController?.completeObjective(2);
        
        return `[INFO] Running automated password security analysis...

=== PASSWORD SECURITY AUDIT RESULTS ===

🚨 CRITICAL VULNERABILITIES FOUND:

1. WEAK PASSWORD PATTERNS (Top 3):
   • "password" variations: 15 accounts (23%)
   • Sequential numbers: 12 accounts (18%) 
   • Default/admin passwords: 8 accounts (12%)

2. HIGH-RISK ACCOUNTS:
   • Administrator "davis": password = "admin" 
   • Security chief "miller": password = "password"
   • Admin "ward": password = "admin123"

3. BRUTE FORCE SUSCEPTIBILITY:
   • 78% of passwords under 8 characters
   • 92% contain no special characters
   • 100% are dictionary words or simple patterns

4. COMPLIANCE VIOLATIONS:
   • Zero passwords meet basic security standards
   • No evidence of password rotation policy
   • Default credentials still active

🏴‍☠️ PIRATE INFILTRATION METHOD DETECTED:
   Look for the suspicious admin account with an unusual password pattern...

[RECOMMENDATION] Immediate password reset required for all accounts!
[RECOMMENDATION] Enable multi-factor authentication immediately!`;
    }
    
    validateFlag(submittedFlag) {
        const correctFlag = PasswordChallengeData.validation.correctFlag;
        
        if (submittedFlag === correctFlag) {
            this.flagSubmitted = true;
            challengeController?.completeObjective(5);
            
            setTimeout(() => {
                challengeController?.completeChallenge();
            }, 1000);
            
            return `[SUCCESS] 🎉 FLAG VALIDATED! 🎉

You've successfully uncovered the space pirates' infiltration method!

=== MISSION ACCOMPLISHED ===

The flag "${correctFlag}" reveals that weak passwords are indeed 
the primary method space pirates use to compromise security systems.

🏆 ACHIEVEMENTS UNLOCKED:
• Password Security Analyst
• Cyber Detective 
• Space Pirate Hunter

🎓 WHAT YOU LEARNED:
• How to identify weak password patterns
• Why administrative accounts are high-value targets  
• Real-world impact of credential-based attacks
• Basic command-line investigation techniques

🚀 Next Mission: Social Engineering Defense
   Report to the Bridge to continue your training!`;
        } else {
            return `[ERROR] Invalid flag: ${submittedFlag}

The flag should be in the format: NAVIGATOR{...}
Look more carefully through the password database for the hidden pattern.

💡 HINT: Check admin accounts with unusual password patterns...`;
        }
    }
    
    // Mark evidence as loaded when download button is clicked
    loadEvidence() {
        this.evidenceLoaded = true;
        this.addOutput('[INFO] Evidence file crew_passwords.txt loaded successfully.');
        this.addOutput('[INFO] Use "cat crew_passwords.txt" to examine the intercepted data.');
    }
}

// =============================================================================
// INTEGRATION WITH EXISTING FRAMEWORK
// =============================================================================

// Override the existing terminal for this specific challenge
if (typeof challengeController !== 'undefined') {
    // Replace terminal engine with challenge-specific version
    window.terminalEngine = new PasswordChallengeTerminal();
    
    // Update hint system with challenge-specific hints
    if (typeof hintSystem !== 'undefined') {
        hintSystem.hints = PasswordChallengeData.hints;
        hintSystem.availableHints = PasswordChallengeData.hints.length;
    }
}

// Expose globally for the download button
window.loadPasswordEvidence = function() {
    if (window.terminalEngine && window.terminalEngine.loadEvidence) {
        window.terminalEngine.loadEvidence();
    }
};

console.log('🔐 Password Challenge System loaded successfully!');