// =============================================================================
// TERMINAL ENGINE - Interactive Cybersecurity Terminal Simulation
// Enhanced with dynamic sizing and improved scroll behavior
// =============================================================================

class TerminalEngine {
    constructor() {
        this.commands = new Map();
        this.history = [];
        this.historyIndex = -1;
        this.currentDirectory = '/home/navigator';
        this.environment = {};
        this.isLocked = false;
        this.outputBuffer = [];
        this.challengeData = null;
        this.userScrolling = false;
        this.userInteracting = false;
        
        // NEW: Dynamic sizing properties
        this.commandCount = 0;
        this.startHeight = 300;
        
        this.init();
    }

    init() {
        console.log('🖥️ Terminal Engine initializing...');
        
        // Register default commands
        this.registerDefaultCommands();
        
        // Setup terminal interface
        this.setupTerminalInterface();
        
        console.log('✅ Terminal Engine ready');
    }

    // =============================================================================
    // TERMINAL INTERFACE SETUP
    // =============================================================================

    setupTerminalInterface() {
        const workspace = document.getElementById('challengeWorkspace');
        if (!workspace) return;

        // Clean terminal interface without hardcoded header buttons
        workspace.innerHTML = `
            <div class="terminal-container">
                <div class="terminal-body">
                    <div class="terminal-output" id="terminalOutput">
                        <div class="terminal-line welcome">
                            <span class="success-text">Navigator Terminal v2.1.0</span>
                        </div>
                        <div class="terminal-line">
                            <span class="info-text">Cybersecurity Challenge Environment</span>
                        </div>
                        <div class="terminal-line">
                            <span class="info-text">Type <code>help</code> for available commands.</span>
                        </div>
                    </div>
                    <div class="terminal-input-container">
                        <span class="terminal-prompt" id="terminalPrompt">navigator@ctf:~$</span>
                        <input type="text" id="terminalInput" class="terminal-input" 
                               placeholder="Enter command..." autocomplete="off" spellcheck="false">
                    </div>
                </div>
            </div>
        `;

        this.setupInputHandlers();
        this.setupScrollBehavior();
    }

    setupInputHandlers() {
        const input = document.getElementById('terminalInput');
        if (!input) return;

        // Handle command submission
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const command = input.value.trim();
                if (command) {
                    this.processCommand(command);
                    input.value = '';
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory(1);
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.handleTabCompletion(input);
            }
        });

        // Focus management
        this.focusTerminal();
        
        // Auto-focus when clicking on terminal
        document.getElementById('terminalOutput')?.addEventListener('click', () => {
            this.focusTerminal();
        });
    }

    // ENHANCED: Better scroll behavior
    setupScrollBehavior() {
        const output = document.getElementById('terminalOutput');
        if (!output) return;

        let scrollTimeout;
        const updateInteractionState = (state) => {
            this.userInteracting = state;
            clearTimeout(scrollTimeout);
            if (state) scrollTimeout = setTimeout(() => this.userInteracting = false, 2000);
        };

        output.addEventListener('scroll', () => updateInteractionState(true));
        output.addEventListener('click', () => this.focusTerminal());
    }

    // NEW: Dynamic terminal sizing
    updateTerminalHeight() {
        const container = document.querySelector('.terminal-container');
        if (!container) return;
        
        const newHeight = Math.min(this.startHeight + (this.commandCount * 20), 500);
        container.style.height = `${newHeight}px`;
        container.style.transition = 'height 0.3s ease';
    }

    // =============================================================================
    // COMMAND PROCESSING
    // =============================================================================

    processCommand(commandLine) {
        if (!commandLine) return;
        if (this.isLocked) {
            this.addOutput('[ERROR] Terminal is locked', 'error');
            return;
        }

        // NEW: Track usage for dynamic sizing
        this.commandCount++;
        this.updateTerminalHeight();

        // Add to history
        this.history.unshift(commandLine);
        if (this.history.length > 100) this.history.pop();
        this.historyIndex = -1;

        // Parse command
        const parts = commandLine.trim().split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Display command in output
        this.addOutput(`${this.getPrompt()}${commandLine}`, 'command');

        // Check if command exists
        if (this.commands.has(command)) {
            try {
                const result = this.commands.get(command)(args, commandLine);
                if (result && typeof result === 'string') {
                    this.addOutput(result);
                }
            } catch (error) {
                this.addOutput(`[ERROR] Command execution failed: ${error.message}`, 'error');
                console.error('Command execution error:', error);
            }
        } else {
            this.addOutput(`bash: ${command}: command not found\nType 'help' for available commands.`, 'error');
        }

        this.scrollToBottom();
    }

    navigateHistory(direction) {
        const input = document.getElementById('terminalInput');
        if (!input || this.history.length === 0) return;

        this.historyIndex += direction;
        
        if (this.historyIndex < 0) {
            this.historyIndex = -1;
            input.value = '';
        } else if (this.historyIndex >= this.history.length) {
            this.historyIndex = this.history.length - 1;
            input.value = this.history[this.historyIndex];
        } else {
            input.value = this.history[this.historyIndex];
        }
    }

    handleTabCompletion(input) {
        const currentValue = input.value;
        const parts = currentValue.split(' ');
        const lastPart = parts[parts.length - 1];
        
        // Get available commands that start with the current input
        const matches = Array.from(this.commands.keys()).filter(cmd => 
            cmd.startsWith(lastPart.toLowerCase())
        );
        
        if (matches.length === 1) {
            // Single match - complete it
            parts[parts.length - 1] = matches[0];
            input.value = parts.join(' ') + ' ';
        } else if (matches.length > 1) {
            // Multiple matches - show them
            this.addOutput(`Available completions: ${matches.join(', ')}`);
        }
    }

    // =============================================================================
    // DEFAULT COMMANDS
    // =============================================================================

    registerDefaultCommands() {
        // Help command - shows all available commands
        this.commands.set('help', () => {
            const availableCommands = Array.from(this.commands.keys()).sort();
            let output = 'Available commands:\n\n';
            
            availableCommands.forEach(cmd => {
                const description = this.getCommandDescription(cmd);
                output += `  ${cmd.padEnd(15)} - ${description}\n`;
            });
            
            output += '\nType `man <command>` for detailed information about a specific command.';
            output += '\nChallenge-specific commands will be available after loading evidence files.';
            return output;
        });

        // History command - shows recent command history
        this.commands.set('history', (args) => {
            if (this.history.length === 0) {
                return 'No commands in history.';
            }
            
            // Show last 50 commands (or all if fewer than 50)
            const maxHistory = 50;
            const startIndex = Math.max(0, this.history.length - maxHistory);
            const recentHistory = this.history.slice(startIndex).reverse();
            
            let output = 'Command History:\n\n';
            recentHistory.forEach((cmd, index) => {
                const lineNumber = (this.history.length - recentHistory.length + index + 1);
                output += `${String(lineNumber).padStart(4, ' ')}  ${cmd}\n`;
            });
            
            if (this.history.length > maxHistory) {
                output += `\n... showing last ${maxHistory} commands (${this.history.length} total)`;
            }
            
            return output;
        });

        // Clear command
        this.commands.set('clear', () => {
            this.clearTerminal();
            return '';
        });

        // List files/directories
        this.commands.set('ls', (args) => {
            const files = this.getCurrentDirectoryFiles();
            if (files.length === 0) {
                return 'Directory is empty.';
            }
            
            let output = '';
            files.forEach(file => {
                const icon = file.type === 'directory' ? '📁' : '📄';
                const permissions = file.permissions || '-rw-r--r--';
                const size = file.size || '1024';
                output += `${permissions} ${icon} ${file.name.padEnd(20)} ${size}\n`;
            });
            
            return output;
        });

        // Change directory
        this.commands.set('cd', (args) => {
            if (args.length === 0) {
                this.currentDirectory = '/home/navigator';
                this.updatePrompt();
                return '';
            }
            
            const target = args[0];
            if (target === '..') {
                const parts = this.currentDirectory.split('/');
                if (parts.length > 2) {
                    parts.pop();
                    this.currentDirectory = parts.join('/') || '/';
                }
            } else if (target.startsWith('/')) {
                this.currentDirectory = target;
            } else {
                this.currentDirectory += `/${target}`;
            }
            
            // Clean up path
            this.currentDirectory = this.currentDirectory.replace(/\/+/g, '/');
            this.updatePrompt();
            return '';
        });

        // Print working directory
        this.commands.set('pwd', () => {
            return this.currentDirectory;
        });

        // Display current user
        this.commands.set('whoami', () => {
            return 'navigator';
        });

        // Display date
        this.commands.set('date', () => {
            return new Date().toISOString();
        });

        // Display environment variables
        this.commands.set('env', () => {
            let output = 'Environment Variables:\n\n';
            output += `USER=navigator\n`;
            output += `HOME=/home/navigator\n`;
            output += `PWD=${this.currentDirectory}\n`;
            output += `PATH=/usr/local/bin:/usr/bin:/bin\n`;
            output += `TERM=xterm-256color\n`;
            output += `SHELL=/bin/bash\n`;
            
            Object.entries(this.environment).forEach(([key, value]) => {
                output += `${key}=${value}\n`;
            });
            
            return output;
        });

        // Echo command
        this.commands.set('echo', (args) => {
            return args.join(' ');
        });

        // Manual pages
        this.commands.set('man', (args) => {
            if (args.length === 0) {
                return '[ERROR] Usage: man <command>\n\nExample: man ls';
            }
            
            const command = args[0];
            const manPage = this.getManPage(command);
            return manPage || `[ERROR] No manual entry for ${command}`;
        });

        // Display file contents (generic version - challenge-specific files handled by dynamic engine)
        this.commands.set('cat', (args) => {
            if (args.length === 0) {
                return '[ERROR] Usage: cat <filename>';
            }
            
            const filename = args[0];
            const file = this.findFile(filename);
            
            if (!file) {
                return `[ERROR] File '${filename}' not found`;
            }
            
            if (file.type === 'directory') {
                return `[ERROR] '${filename}' is a directory`;
            }
            
            return file.content || `[INFO] ${filename} is a binary file`;
        });

        // Network mapping tool (simulated)
        this.commands.set('nmap', (args) => {
            if (args.length === 0) {
                return '[ERROR] Usage: nmap <target>\n\nExample: nmap 192.168.1.1';
            }
            
            const target = args[0];
            return `[INFO] Starting Nmap scan on ${target}...\n\nNmap scan report for ${target}\nHost is up (0.001s latency).\nPORT     STATE SERVICE\n22/tcp   open  ssh\n80/tcp   open  http\n443/tcp  open  https\n\nNmap done: 1 IP address scanned`;
        });
    }

    // =============================================================================
    // OUTPUT AND DISPLAY
    // =============================================================================

    addOutput(text, type = 'output') {
        const output = document.getElementById('terminalOutput');
        if (!output) return;

        const line = document.createElement('div');
        line.className = `terminal-line ${type}`;
        line.innerHTML = this.formatOutput(text);
        
        output.appendChild(line);
        this.scrollToBottom();
    }

    formatOutput(text) {
        if (!text) return '';
        
        // Format special characters and colors
        return text
            .replace(/\[SUCCESS\]/g, '<span class="success-text">[SUCCESS]</span>')
            .replace(/\[ERROR\]/g, '<span class="error-text">[ERROR]</span>')
            .replace(/\[WARNING\]/g, '<span class="warning-text">[WARNING]</span>')
            .replace(/\[INFO\]/g, '<span class="info-text">[INFO]</span>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    clearTerminal() {
        const output = document.getElementById('terminalOutput');
        if (output) {
            output.innerHTML = `
                <div class="terminal-line welcome">
                    <span class="success-text">Navigator Terminal v2.1.0</span>
                </div>
                <div class="terminal-line">
                    <span class="info-text">Terminal cleared. Type <code>help</code> for available commands.</span>
                </div>
            `;
        }
    }

    // ENHANCED: Better scroll behavior
    scrollToBottom() {
        if (!this.userInteracting) {
            const output = document.getElementById('terminalOutput');
            if (output) {
                requestAnimationFrame(() => {
                    output.scrollTop = output.scrollHeight;
                });
            }
        }
    }

    // =============================================================================
    // TERMINAL STATE MANAGEMENT
    // =============================================================================

    getPrompt() {
        const shortPath = this.currentDirectory.replace('/home/navigator', '~');
        return `navigator@ctf:${shortPath}$ `;
    }

    updatePrompt() {
        const promptElements = document.querySelectorAll('.terminal-prompt');
        const promptText = this.getPrompt().slice(0, -2); // Remove "$ "
        
        promptElements.forEach(el => {
            el.textContent = promptText;
        });
    }

    focusTerminal() {
        const input = document.getElementById('terminalInput');
        if (input && !this.isLocked) {
            setTimeout(() => input.focus(), 100);
        }
    }

    lockTerminal() {
        this.isLocked = true;
        const input = document.getElementById('terminalInput');
        if (input) {
            input.disabled = true;
            input.placeholder = 'Terminal locked';
        }
    }

    unlockTerminal() {
        this.isLocked = false;
        const input = document.getElementById('terminalInput');
        if (input) {
            input.disabled = false;
            input.placeholder = 'Enter command...';
            this.focusTerminal();
        }
    }

    resetChallenge() {
        this.clearTerminal();
        this.history = [];
        this.historyIndex = -1;
        this.currentDirectory = '/home/navigator';
        this.environment = {};
        this.updatePrompt();
        
        this.addOutput('[INFO] Challenge environment reset. Ready for new commands.');
    }

    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================

    getCurrentDirectoryFiles() {
        // Simulated file system
        const filesystem = {
            '/home/navigator': [
                { name: 'documents', type: 'directory', permissions: 'drwxr-xr-x', size: '4096' },
                { name: 'tools', type: 'directory', permissions: 'drwxr-xr-x', size: '4096' },
                { name: 'readme.txt', type: 'file', permissions: '-rw-r--r--', size: '1024', 
                  content: 'Welcome to the Navigator Terminal!\nUse this environment to complete cybersecurity challenges.\n\nType "help" to see available commands.' }
            ],
            '/home/navigator/documents': [
                { name: 'notes.txt', type: 'file', permissions: '-rw-r--r--', size: '512',
                  content: 'Investigation Notes:\n- Always examine evidence files carefully\n- Use grep to search for patterns\n- Look for anomalies in logs' }
            ],
            '/home/navigator/tools': [
                { name: 'hashcat', type: 'file', permissions: '-rwxr-xr-x', size: '2048' },
                { name: 'nmap', type: 'file', permissions: '-rwxr-xr-x', size: '1536' },
                { name: 'wireshark', type: 'file', permissions: '-rwxr-xr-x', size: '4096' }
            ]
        };

        return filesystem[this.currentDirectory] || [];
    }

    findFile(filename) {
        const files = this.getCurrentDirectoryFiles();
        return files.find(file => file.name === filename);
    }

    getCommandDescription(command) {
        const descriptions = {
            'help': 'Show available commands',
            'history': 'Show command history',
            'clear': 'Clear the terminal screen',
            'ls': 'List directory contents',
            'cd': 'Change directory',
            'pwd': 'Print working directory',
            'cat': 'Display file contents',
            'grep': 'Search for patterns in files',
            'analyze': 'Run security analysis on files',
            'submit': 'Submit discovered flags',
            'nmap': 'Network discovery and security auditing',
            'man': 'Display manual page for command',
            'echo': 'Display text',
            'env': 'Show environment variables',
            'whoami': 'Print current user',
            'date': 'Show current date and time'
        };

        return descriptions[command] || 'No description available';
    }

    getManPage(command) {
        const manPages = {
            'ls': `NAME
       ls - list directory contents

SYNOPSIS
       ls [options] [directory]

DESCRIPTION
       List information about files and directories.

OPTIONS
       No options supported in this simulation.`,

            'cat': `NAME
       cat - concatenate files and print on standard output

SYNOPSIS
       cat [file]

DESCRIPTION
       Display the contents of a file.`,

            'grep': `NAME
       grep - search text patterns in files

SYNOPSIS
       grep [pattern] [file]

DESCRIPTION
       Search for a pattern in a file and display matching lines.`,

            'nmap': `NAME
       nmap - Network discovery and security auditing tool

SYNOPSIS
       nmap [options] <target>

DESCRIPTION
       Nmap is used to discover hosts and services on a network.`,

            'history': `NAME
       history - show command history

SYNOPSIS
       history

DESCRIPTION
       Display the list of previously executed commands.`
        };

        return manPages[command];
    }

    // =============================================================================
    // PUBLIC API FOR DYNAMIC CHALLENGE ENGINE
    // =============================================================================

    // Method for dynamic challenge engine to add commands
    addCommand(name, handler) {
        this.commands.set(name, handler);
        console.log(`✅ Added command: ${name}`);
    }

    // Method for dynamic challenge engine to remove commands
    removeCommand(name) {
        if (this.commands.has(name)) {
            this.commands.delete(name);
            console.log(`🗑️ Removed command: ${name}`);
        }
    }

    // Method to get current command list
    getCommands() {
        return Array.from(this.commands.keys());
    }

    // Method for challenges to set environment variables
    setEnvironment(key, value) {
        this.environment[key] = value;
    }

    // Method to simulate typing (for tutorials)
    simulateTyping(text, callback) {
        const input = document.getElementById('terminalInput');
        if (!input) return;

        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                input.value += text.charAt(i);
                i++;
            } else {
                clearInterval(interval);
                if (callback) callback();
            }
        }, 100);
    }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Initialize terminal engine when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure all elements are ready
    setTimeout(() => {
        if (!window.terminalEngine) {
            window.terminalEngine = new TerminalEngine();
            console.log('🖥️ Terminal Engine initialized and ready for dynamic commands');
        }
    }, 100);
});

// Make TerminalEngine available globally for debugging
window.TerminalEngine = TerminalEngine;

console.log('🖥️ Terminal Engine script loaded');