// =============================================================================
// TERMINAL ENGINE - Interactive Cybersecurity Terminal Simulation
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
        
        this.init();
    }

    init() {
        console.log('🖥️ Terminal Engine initializing...');
        
        // Register default commands
        this.registerDefaultCommands();
        
        // Setup terminal interface
        this.setupTerminalInterface();
        
        // Load challenge-specific commands
        this.loadChallengeCommands();
        
        console.log('✅ Terminal Engine ready');
    }

    // =============================================================================
    // TERMINAL INTERFACE SETUP
    // =============================================================================

    setupTerminalInterface() {
        const workspace = document.getElementById('challengeWorkspace');
        if (!workspace) return;

        workspace.innerHTML = `
            <div class="terminal-container">
                <div class="terminal-header">
                    <div class="terminal-title">
                        <span class="terminal-icon">⚡</span>
                        <span>Navigator Terminal v2.4.1</span>
                    </div>
                    <div class="terminal-controls">
                        <button class="terminal-btn minimize">−</button>
                        <button class="terminal-btn maximize">□</button>
                        <button class="terminal-btn close">✕</button>
                    </div>
                </div>
                
                <div class="terminal-body">
                    <div class="terminal-output" id="terminalOutput">
                        <div class="boot-sequence">
                            <div class="boot-line">Navigator OS v2.4.1 - Cybersecurity Terminal</div>
                            <div class="boot-line">Initializing secure connection...</div>
                            <div class="boot-line">Loading challenge environment...</div>
                            <div class="boot-line">Ready for commands.</div>
                            <div class="boot-line">&nbsp;</div>
                            <div class="boot-line">Type 'help' for available commands.</div>
                            <div class="boot-line">&nbsp;</div>
                        </div>
                    </div>
                    
                    <div class="terminal-input-container">
                        <span class="terminal-prompt" id="terminalPrompt">navigator@uss-navigator:~$ </span>
                        <input type="text" class="terminal-input" id="terminalInput" 
                               placeholder="Enter command..." autocomplete="off">
                    </div>
                </div>
            </div>
        `;

        this.setupInputHandlers();
        this.focusTerminal();
    }

    setupInputHandlers() {
        const input = document.getElementById('terminalInput');
        if (!input) return;

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.processCommand(input.value.trim());
                input.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory('up');
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory('down');
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.autoComplete(input.value);
            }
        });

        // Click to focus
        document.addEventListener('click', (e) => {
            if (e.target.closest('.terminal-container')) {
                this.focusTerminal();
            }
        });
    }

    // =============================================================================
    // COMMAND PROCESSING
    // =============================================================================

    processCommand(commandLine) {
        if (!commandLine) return;

        // Add to history
        this.history.unshift(commandLine);
        if (this.history.length > 100) this.history.pop();
        this.historyIndex = -1;

        // Parse command
        const parts = commandLine.split(' ');
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
                this.addOutput(`Error: ${error.message}`, 'error');
                console.error('Command execution error:', error);
            }
        } else {
            this.addOutput(`Command not found: ${command}. Type 'help' for available commands.`, 'error');
        }

        this.scrollToBottom();
    }

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
        // Format special characters and colors
        return text
            .replace(/\[SUCCESS\]/g, '<span class="success-text">[SUCCESS]</span>')
            .replace(/\[ERROR\]/g, '<span class="error-text">[ERROR]</span>')
            .replace(/\[WARNING\]/g, '<span class="warning-text">[WARNING]</span>')
            .replace(/\[INFO\]/g, '<span class="info-text">[INFO]</span>')
            .replace(/`([^`]+)`/g, '<code>$1</code>');
    }

    // =============================================================================
    // DEFAULT COMMANDS
    // =============================================================================

    registerDefaultCommands() {
        // Help command
        this.commands.set('help', () => {
            const availableCommands = Array.from(this.commands.keys()).sort();
            let output = 'Available commands:\n\n';
            
            availableCommands.forEach(cmd => {
                const description = this.getCommandDescription(cmd);
                output += `  ${cmd.padEnd(15)} - ${description}\n`;
            });
            
            output += '\nType `man <command>` for detailed information about a specific command.';
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
                const permissions = file.permissions || 'rwxr-xr-x';
                const size = file.size || '1024';
                output += `${permissions} ${icon} ${file.name.padEnd(20)} ${size}\n`;
            });
            
            return output;
        });

        // Change directory
        this.commands.set('cd', (args) => {
            if (args.length === 0) {
                this.currentDirectory = '/home/navigator';
                return '';
            }
            
            const target = args[0];
            if (target === '..') {
                const parts = this.currentDirectory.split('/');
                if (parts.length > 2) {
                    parts.pop();
                    this.currentDirectory = parts.join('/');
                }
            } else if (target.startsWith('/')) {
                this.currentDirectory = target;
            } else {
                this.currentDirectory += `/${target}`;
            }
            
            this.updatePrompt();
            return '';
        });

        // Print working directory
        this.commands.set('pwd', () => {
            return this.currentDirectory;
        });

        // Display file contents
        this.commands.set('cat', (args) => {
            if (args.length === 0) {
                return '[ERROR] Usage: cat <filename>';
            }
            
            const filename = args[0];
            const file = this.findFile(filename);
            
            if (!file) {
                return `[ERROR] File not found: ${filename}`;
            }
            
            return file.content || '[INFO] Binary file - content not displayable';
        });

        // Network scanning (basic)
        this.commands.set('nmap', (args) => {
            if (args.length === 0) {
                return '[ERROR] Usage: nmap <target>';
            }
            
            const target = args[0];
            return this.simulateNmapScan(target);
        });

        // Manual pages
        this.commands.set('man', (args) => {
            if (args.length === 0) {
                return '[ERROR] Usage: man <command>';
            }
            
            const command = args[0];
            return this.getManPage(command);
        });

        // Echo command
        this.commands.set('echo', (args) => {
            return args.join(' ');
        });

        // Environment variables
        this.commands.set('env', () => {
            let output = 'Environment variables:\n\n';
            for (const [key, value] of Object.entries(this.environment)) {
                output += `${key}=${value}\n`;
            }
            return output;
        });
    }

    // =============================================================================
    // CHALLENGE-SPECIFIC COMMANDS
    // =============================================================================

    loadChallengeCommands() {
        // This will be overridden by specific challenges
        console.log('Loading challenge-specific commands...');
    }

    registerCommand(name, handler, description = '') {
        this.commands.set(name.toLowerCase(), handler);
        if (description) {
            this.commandDescriptions = this.commandDescriptions || {};
            this.commandDescriptions[name.toLowerCase()] = description;
        }
    }

    // =============================================================================
    // SIMULATION HELPERS
    // =============================================================================

    simulateNmapScan(target) {
        const ports = [
            { port: 22, service: 'ssh', state: 'open' },
            { port: 80, service: 'http', state: 'open' },
            { port: 443, service: 'https', state: 'open' },
            { port: 3389, service: 'rdp', state: 'filtered' },
            { port: 1433, service: 'mssql', state: 'closed' }
        ];

        let output = `Starting Nmap scan on ${target}\n\n`;
        output += 'PORT     STATE    SERVICE\n';
        
        ports.forEach(port => {
            const state = port.state.toUpperCase().padEnd(8);
            output += `${port.port}/tcp  ${state} ${port.service}\n`;
        });
        
        output += '\nNmap scan completed.';
        return output;
    }

    simulateProgress(operation, duration = 3000) {
        const steps = [
            '[INFO] Initializing...',
            '[INFO] Connecting to target...',
            '[INFO] Analyzing response...',
            '[INFO] Processing results...',
            '[SUCCESS] Operation completed.'
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                this.addOutput(steps[currentStep]);
                currentStep++;
            } else {
                clearInterval(interval);
            }
        }, duration / steps.length);
    }

    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================

    getCurrentDirectoryFiles() {
        // Return simulated file system based on current directory
        const filesystem = {
            '/home/navigator': [
                { name: 'documents', type: 'directory', permissions: 'drwxr-xr-x', size: '4096' },
                { name: 'tools', type: 'directory', permissions: 'drwxr-xr-x', size: '4096' },
                { name: 'readme.txt', type: 'file', permissions: '-rw-r--r--', size: '1024', content: 'Welcome to the Navigator Terminal!\nUse this environment to complete cybersecurity challenges.' }
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
            'clear': 'Clear the terminal screen',
            'ls': 'List directory contents',
            'cd': 'Change directory',
            'pwd': 'Print working directory',
            'cat': 'Display file contents',
            'nmap': 'Network discovery and security auditing',
            'man': 'Display manual page for command',
            'echo': 'Display text',
            'env': 'Show environment variables'
        };

        return descriptions[command] || 'No description available';
    }

    getManPage(command) {
        const manPages = {
            'nmap': `NAME
        nmap - Network discovery and security auditing tool

SYNOPSIS
        nmap [options] <target>

DESCRIPTION
        Nmap is a network scanning tool used to discover hosts and services on a network.
        
OPTIONS
        -sS     TCP SYN scan (default)
        -sU     UDP scan
        -p      Specify port range
        
EXAMPLES
        nmap 192.168.1.1
        nmap -p 80,443 target.com`,

            'ls': `NAME
        ls - list directory contents
        
SYNOPSIS
        ls [options] [directory]
        
DESCRIPTION
        List information about files and directories.`,
        };

        return manPages[command] || `No manual entry for ${command}`;
    }

    navigateHistory(direction) {
        const input = document.getElementById('terminalInput');
        if (!input) return;

        if (direction === 'up') {
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                input.value = this.history[this.historyIndex];
            }
        } else if (direction === 'down') {
            if (this.historyIndex > 0) {
                this.historyIndex--;
                input.value = this.history[this.historyIndex];
            } else if (this.historyIndex === 0) {
                this.historyIndex = -1;
                input.value = '';
            }
        }
    }

    autoComplete(partial) {
        const availableCommands = Array.from(this.commands.keys());
        const matches = availableCommands.filter(cmd => cmd.startsWith(partial.toLowerCase()));
        
        if (matches.length === 1) {
            const input = document.getElementById('terminalInput');
            if (input) {
                input.value = matches[0];
            }
        } else if (matches.length > 1) {
            this.addOutput(`Available completions: ${matches.join(', ')}`);
        }
    }

    getPrompt() {
        const user = 'navigator';
        const host = 'uss-navigator';
        const dir = this.currentDirectory.split('/').pop() || this.currentDirectory;
        return `${user}@${host}:${dir}$ `;
    }

    updatePrompt() {
        const promptElement = document.getElementById('terminalPrompt');
        if (promptElement) {
            promptElement.textContent = this.getPrompt();
        }
    }

    focusTerminal() {
        const input = document.getElementById('terminalInput');
        if (input && !this.isLocked) {
            input.focus();
        }
    }

    clearTerminal() {
        const output = document.getElementById('terminalOutput');
        if (output) {
            output.innerHTML = '';
        }
    }

    scrollToBottom() {
        const output = document.getElementById('terminalOutput');
        if (output) {
            output.scrollTop = output.scrollHeight;
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
        
        // Re-display boot sequence
        this.addOutput('Terminal reset. Ready for commands.');
        this.updatePrompt();
    }

    toggleFullscreen() {
        const container = document.querySelector('.terminal-container');
        if (container) {
            container.classList.toggle('fullscreen');
        }
    }

    // =============================================================================
    // TOOL LOADING
    // =============================================================================

    loadTool(toolId) {
        const tools = {
            'hashcat': () => {
                this.addOutput('[INFO] Loading Hashcat - Advanced password recovery utility');
                this.registerCommand('hashcat', (args) => {
                    return this.simulateHashcat(args);
                }, 'Advanced password recovery utility');
            },
            'wireshark': () => {
                this.addOutput('[INFO] Loading Wireshark - Network protocol analyzer');
                this.registerCommand('tshark', (args) => {
                    return this.simulateWireshark(args);
                }, 'Network packet analyzer');
            },
            'john': () => {
                this.addOutput('[INFO] Loading John the Ripper - Password cracker');
                this.registerCommand('john', (args) => {
                    return this.simulateJohn(args);
                }, 'Password cracking tool');
            }
        };

        if (tools[toolId]) {
            tools[toolId]();
        } else {
            this.addOutput(`[ERROR] Unknown tool: ${toolId}`);
        }
    }

    simulateHashcat(args) {
        if (args.length === 0) {
            return `[INFO] Hashcat v6.2.6
Usage: hashcat [options] hashfile [dictionary]

Options:
  -m    Hash type (0=MD5, 100=SHA1, 1000=NTLM)
  -a    Attack mode (0=straight, 3=brute-force)
  -o    Output file`;
        }

        // Simulate password cracking
        setTimeout(() => {
            this.addOutput('[INFO] Cracking in progress...');
            setTimeout(() => {
                this.addOutput('[SUCCESS] Password found: password123');
            }, 2000);
        }, 1000);

        return '[INFO] Starting hashcat attack...';
    }

    simulateWireshark(args) {
        return `[INFO] Wireshark packet capture analysis
Packets captured: 1,337
Protocols detected: HTTP, HTTPS, DNS, TCP, UDP
Suspicious traffic: 3 connections to unknown hosts`;
    }

    simulateJohn(args) {
        return `[INFO] John the Ripper password cracker
Loaded 1 password hash
Trying dictionary attack...
Password cracked: admin123`;
    }
}

// =============================================================================
// GLOBAL INSTANCE
// =============================================================================

window.terminalEngine = new TerminalEngine();