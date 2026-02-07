document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. COUNTDOWN LOGIC
    // =========================================================================
    const countdownElement = document.getElementById('countdown-days');
    if (countdownElement) {
        // Set target date: 7 days from Feb 7, 2026 => Feb 14, 2026
        const targetDate = new Date('2026-02-14T00:00:00'); 
        const now = new Date();
        const diffTime = targetDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Ensure non-negative
        countdownElement.textContent = diffDays > 0 ? diffDays : 0;
    }

    // =========================================================================
    // 2. BUBBLE INITIALIZATION
    // =========================================================================
    let bubbleContainer = document.querySelector('.hero');
    
    // If no hero section (subpages), create a fixed background container
    if (!bubbleContainer) {
        bubbleContainer = document.createElement('div');
        bubbleContainer.classList.add('bubble-container');
        bubbleContainer.style.position = 'fixed';
        bubbleContainer.style.top = '0';
        bubbleContainer.style.left = '0';
        bubbleContainer.style.width = '100%';
        bubbleContainer.style.height = '100%';
        bubbleContainer.style.zIndex = '-1'; // Behind content
        bubbleContainer.style.overflow = 'hidden';
        bubbleContainer.style.pointerEvents = 'none'; // Allow clicks to pass through to body (but bubbles need events)
        // Wait, if pointerEvents is none, bubbles won't receive clicks.
        // We need the container to pass events but bubbles to capture them.
        // Or just make container pointer-events: none and bubbles pointer-events: auto.
        document.body.prepend(bubbleContainer);
    }

    const bubbleGradients = [
        ['rgba(255, 212, 6, 0.6)', 'rgba(255, 212, 6, 0)'],
        ['rgba(12, 184, 255, 0.6)', 'rgba(12, 184, 255, 0)'],
        ['rgba(41, 224, 178, 0.6)', 'rgba(41, 224, 178, 0)']
    ];

    const configs = [
        { size: 120, left: 5, top: 20, speedY: 0.15 },
        { size: 140, left: 90, top: 70, speedY: 0.35 },
        { size: 80, left: 25, top: 45, speedY: 0.08 },
        { size: 50, left: 70, top: 35, speedY: 0.05 },
        { size: 40, left: 55, top: 60, speedY: 0.12 },
        { size: 90, left: 15, top: 80, speedY: 0.25 },
        { size: 60, left: 85, top: 15, speedY: 0.18 }
    ];

    configs.forEach((conf) => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('slogan-bubble-wrapper');
        // Ensure wrapper allows interaction if container is pointer-events: none
        if (bubbleContainer.classList.contains('bubble-container')) {
             wrapper.style.pointerEvents = 'auto'; 
        }

        const bubble = document.createElement('div');
        bubble.classList.add('slogan-bubble');
        bubble.classList.add('animate-wiggle');

        const gradientPair = bubbleGradients[Math.floor(Math.random() * bubbleGradients.length)];

        bubble.style.width = `${conf.size}px`;
        bubble.style.height = `${conf.size}px`;
        bubble.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), ${gradientPair[0]} 60%, ${gradientPair[1]} 80%)`;

        const wiggleDuration = 5 + Math.random() * 5; 
        const wiggleDelay = 2.1 + Math.random() * 3;
        
        const r = () => (Math.random() - 0.5) * 40;
        const rot = () => (Math.random() - 0.5) * 20;

        bubble.style.setProperty('--wx1', `${r()}px`);
        bubble.style.setProperty('--wy1', `${r()}px`);
        bubble.style.setProperty('--wr1', `${rot()}deg`);
        bubble.style.setProperty('--wx2', `${r()}px`);
        bubble.style.setProperty('--wy2', `${r()}px`);
        bubble.style.setProperty('--wr2', `${rot()}deg`);

        bubble.style.animationDuration = `1.5s, ${wiggleDuration}s`;
        bubble.style.animationDelay = `2.1s, ${wiggleDelay}s`;

        wrapper.style.left = `${conf.left}%`;
        wrapper.style.top = `${conf.top}%`;

        wrapper.appendChild(bubble);
        bubbleContainer.appendChild(wrapper);
    });

    // =========================================================================
    // 3. INTERACTION LOGIC (Copied & Adapted from main.js)
    // =========================================================================
    
    // Global counter for bubble clicks
    let totalBubbleClicks = 0;
    
    // Create Message Bubble Element
    const messageBubble = document.createElement('div');
    messageBubble.classList.add('interaction-message-bubble');
    // Default message since we might not have the global variable
    const messageText = "I hope the upcoming content intrigues you more. Let's keep exploring!";
    messageBubble.innerText = messageText;
    document.body.appendChild(messageBubble);

    // Smooth Scroll Function
    function smoothScrollTo(targetPosition, duration) {
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t * t + b;
            t -= 2;
            return c / 2 * (t * t * t + 2) + b;
        }

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    // Event Delegation for Bubbles
    document.addEventListener('click', (e) => {
        const clickedBubble = e.target.closest('.slogan-bubble');
        if (!clickedBubble) return;
        
        // Increment global click counter
        totalBubbleClicks++;
        
        // Check for 4th click (Message + Scroll)
        if (totalBubbleClicks === 4) {
            messageBubble.classList.add('visible');
            
            // Wait 2 seconds then scroll
            setTimeout(() => {
                const targetScroll = window.innerHeight;
                // Only scroll if we can
                if (document.body.scrollHeight > window.innerHeight) {
                    smoothScrollTo(targetScroll, 3000);
                }
                
                setTimeout(() => {
                    messageBubble.classList.remove('visible');
                }, 1000);
            }, 2000);
        }

        // Check for 6th click (4 + 2) -> Bubbles fade out
        if (totalBubbleClicks === 6) {
            // On subpages, we might not have slogan-inner. 
            // If we do, fade it out.
            const sloganInner = document.querySelector('.slogan-inner');
            if (sloganInner) {
                sloganInner.style.transition = 'opacity 0.8s ease';
                sloganInner.style.opacity = '0';
                
                // ... replacement logic omitted for subpages as it's specific to index.html slogan
            }

            // REMOVE Bubbles
            document.querySelectorAll('.slogan-bubble-wrapper').forEach(wrapper => {
                // Fade out then remove
                wrapper.style.transition = 'opacity 1s ease';
                wrapper.style.opacity = '0';
                setTimeout(() => {
                    if (wrapper.parentNode) {
                        wrapper.parentNode.removeChild(wrapper);
                    }
                }, 1000);
            });
        }

        // IMMEDIATE ACTION: Gentle Move
        const wrapper = clickedBubble.closest('.slogan-bubble-wrapper');
        if (wrapper) {
            const newLeft = 10 + Math.random() * 80;
            const newTop = 15 + Math.random() * 70;
            
            wrapper.style.left = `${newLeft}%`;
            wrapper.style.top = `${newTop}%`;
        }
    });
});
