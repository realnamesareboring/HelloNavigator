        // Unscrambling title effect with alien symbols
        function scrambleTitle() {
            const title = document.getElementById('scrambleTitle');
            const originalText = 'THE NAVIGATOR\'S CODEBOOK';
            const alienChars = ['◊', '◈', '◇', '◉', '◎', '●', '◐', '◑', '◒', '◓', '◔', '◕', '◖', '◗', '◘', '◙', '◚', '◛', '◜', '◝', '◞', '◟', '◠', '◡', '⬟', '⬠', '⬡', '⬢', '⬣', '⬤', '⬥', '⬦'];
            
            title.innerHTML = '';
            
            // First show alien symbols
            for (let i = 0; i < originalText.length; i++) {
                const span = document.createElement('span');
                span.className = 'scramble-char';
                span.style.animationDelay = `${i * 0.15}s`;
                
                if (originalText[i] === ' ') {
                    span.innerHTML = '&nbsp;';
                } else {
                    // Start with alien symbol
                    let alienChar = alienChars[Math.floor(Math.random() * alienChars.length)];
                    span.textContent = alienChar;
                    
                    // Multiple transformation stages
                    setTimeout(() => {
                        span.textContent = alienChars[Math.floor(Math.random() * alienChars.length)];
                    }, 500 + (i * 50));
                    
                    setTimeout(() => {
                        span.textContent = alienChars[Math.floor(Math.random() * alienChars.length)];
                    }, 1000 + (i * 50));
                    
                    setTimeout(() => {
                        span.textContent = alienChars[Math.floor(Math.random() * alienChars.length)];
                    }, 1500 + (i * 50));
                    
                    // Final reveal to English
                    setTimeout(() => {
                        span.textContent = originalText[i];
                        span.classList.add('deciphered');
                        
                        // Add a brief flash effect
                        span.style.textShadow = '0 0 5px #fff, 0 0 10px #ff8000';
                        setTimeout(() => {
                            span.style.textShadow = '0 0 2px #ff8000, 0 0 5px #ff8000';
                        }, 200);
                    }, 2000 + (i * 100));
                }
                
                title.appendChild(span);
            }
            
            // Add completion effect
            setTimeout(() => {
                title.style.animation = 'pulse 2s ease-in-out';
                setTimeout(() => {
                    title.style.animation = 'none';
                }, 2000);
            }, 4000);
        }
        
        // Show disclaimer immediately on page load
        window.addEventListener('load', () => {
            // Show the disclaimer modal immediately
            showDisclaimer();
        });
        
        function showDisclaimer() {
            const modal = document.getElementById('disclaimerModal');
            modal.classList.add('show');
        }
        
        function acceptDisclaimer() {
            const modal = document.getElementById('disclaimerModal');
            const mainContent = document.getElementById('mainContent');
            
            // Fade out modal and enable content
            modal.style.animation = 'fadeOut 0.3s ease-out forwards';
            
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.remove('show');
                mainContent.classList.remove('content-blurred');
                mainContent.style.filter = 'none';
                mainContent.style.pointerEvents = 'auto';
                
                // Now start the title unscrambling effect after systems come online
                setTimeout(() => {
                    scrambleTitle();
                }, 500);
            }, 300);
        }
        
        function declineDisclaimer() {
            // Show decline message and redirect
            alert('🛸 Mission aborted. X.I.S. understands your decision.\n\nRedirecting to safe coordinates...');
            
            // Optional: redirect to a different page or close window
            // window.location.href = 'https://example.com';
            // Or just reload the page to start over
            window.location.reload();
        }
        
        function startMission() {
            // Add retro computer startup effect
            const button = document.querySelector('.start-button');
            button.textContent = 'INITIALIZING...';
            button.style.background = 'linear-gradient(45deg, #ff8000, #ff0080)';
            
            setTimeout(() => {
                button.textContent = 'SYSTEMS ONLINE';
                button.style.background = 'linear-gradient(45deg, #00ff00, #00ffff)';
                
                setTimeout(() => {
                    alert('🚀 TRANSMISSION RECEIVED\n\nWelcome aboard, Navigator! Your cybersecurity training adventure begins now.\n\nX.I.S. awaits your assistance in restoring all ship systems.\n\nPrepare to become a true cyber guardian!');
                    
                    button.textContent = 'Initialize Navigation Systems';
                    button.style.background = 'linear-gradient(45deg, #ff0080, #00ffff)';
                }, 1000);
            }, 1500);
        }
        
        // Close modal when clicking outside of it
        document.addEventListener('click', function(event) {
            const modal = document.getElementById('disclaimerModal');
            const modalContent = document.querySelector('.modal-content');
            
            if (event.target === modal && !modalContent.contains(event.target)) {
                modal.classList.remove('show');
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                const modal = document.getElementById('disclaimerModal');
                modal.classList.remove('show');
            }
        });
        
        // Add pulse animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
        `;
        document.head.appendChild(style);
        
        // Add some dynamic effects to module cards
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('.module-card').forEach(card => {
                card.addEventListener('mouseenter', () => {
                    card.style.borderColor = '#ff8000';
                });
                
                card.addEventListener('mouseleave', () => {
                    card.style.borderColor = '#00ffff';
                });
            });
        });