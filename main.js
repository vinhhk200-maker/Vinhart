// Sticky Label Detection for Glass Effect - DISABLED per user request
document.addEventListener('DOMContentLoaded', () => {
    /*
    const stickyLabels = document.querySelectorAll('.section-label, .recent-companies-label');
    
    if (stickyLabels.length > 0) {
        const observerOptions = {
            threshold: [1],
            // Adjust rootMargin to match the sticky top offset (80px)
            // We check when the sentinel hits the top-81px line
            rootMargin: '-81px 0px 0px 0px' 
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const label = entry.target.nextElementSibling;
                if (label) {
                    // Check relative position
                    // If sentinel is NOT intersecting and its bounding box top is negative (above viewport),
                    // it means we've scrolled past it -> sticky state active
                    const isStuck = !entry.isIntersecting && entry.boundingClientRect.top < 80;
                    
                    if (isStuck) {
                        label.classList.add('is-stuck');
                    } else {
                        label.classList.remove('is-stuck');
                    }
                }
            });
        }, observerOptions);

        stickyLabels.forEach(label => {
            // Create sentinel
            const sentinel = document.createElement('div');
            sentinel.classList.add('sticky-sentinel');
            // Style sentinel to be invisible and 1px height
            sentinel.style.height = '1px';
            sentinel.style.width = '100%';
            // Use relative positioning (default) so it stays in flow
            // Use negative margin to avoid layout shift
            sentinel.style.marginBottom = '-1px'; 
            sentinel.style.pointerEvents = 'none';
            sentinel.style.visibility = 'hidden';
            
            // Insert before label
            label.parentNode.insertBefore(sentinel, label);
            
            observer.observe(sentinel);
        });
    }
    */

    // =========================================================================
    // BUBBLE INTERACTION LOGIC (Explode & Move)
    // =========================================================================
    
    // Global counter for bubble clicks
    let totalBubbleClicks = 0;
    
    // Create Message Bubble Element
    const messageBubble = document.createElement('div');
    messageBubble.classList.add('interaction-message-bubble');
    // Use global config if available, otherwise fallback to default
    const messageText = (typeof INTERACTION_MESSAGE_TEXT !== 'undefined') 
        ? INTERACTION_MESSAGE_TEXT 
        : "I hope the upcoming content intrigues you more. Let's keep exploring!";
    messageBubble.innerText = messageText;
    document.body.appendChild(messageBubble);

    // Custom Smooth Scroll Function (Moved from index.html/inline script to be accessible)
    function smoothScrollTo(targetPosition, duration) {
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        let startTime = null;

        // Easing function (easeInOutCubic)
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

    // =========================================================================
    // DRAG & DROP LOGIC FOR BUBBLES
    // =========================================================================
    let isDragging = false;
    let dragItem = null;
    let dragWrapper = null;
    let dragStart = { x: 0, y: 0 };
    let initialPos = { left: 0, top: 0 };
    let wasDragging = false;

    // Helper to get client coordinates
    const getClientPos = (e) => {
        return e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
    };

    const startDrag = (e) => {
        const bubble = e.target.closest('.slogan-bubble');
        if (!bubble) return;
        
        dragItem = bubble;
        dragWrapper = bubble.closest('.slogan-bubble-wrapper');
        if (!dragWrapper) return;

        const pos = getClientPos(e);
        dragStart = pos;
        
        // Get initial position in px
        initialPos = {
            left: dragWrapper.offsetLeft,
            top: dragWrapper.offsetTop
        };
        
        // Disable transition for direct control
        dragWrapper.style.transition = 'none';
        isDragging = false;
        wasDragging = false;
    };

    const moveDrag = (e) => {
        if (!dragWrapper) return;

        const pos = getClientPos(e);
        const dx = pos.x - dragStart.x;
        const dy = pos.y - dragStart.y;

        // Check threshold to consider it a drag
        if (!isDragging && Math.hypot(dx, dy) > 5) {
            isDragging = true;
            wasDragging = true;
        }

        if (isDragging) {
            if (e.cancelable) e.preventDefault(); // Stop scrolling/selection
            
            const parent = dragWrapper.offsetParent;
            if (!parent) return;

            const newLeftPx = initialPos.left + dx;
            const newTopPx = initialPos.top + dy;

            // Convert to %
            const leftPercent = (newLeftPx / parent.offsetWidth) * 100;
            const topPercent = (newTopPx / parent.offsetHeight) * 100;

            dragWrapper.style.left = `${leftPercent}%`;
            dragWrapper.style.top = `${topPercent}%`;
        }
    };

    const endDrag = (e) => {
        if (!dragWrapper) return;

        // Restore transition (stylesheet default)
        dragWrapper.style.transition = ''; 

        dragItem = null;
        dragWrapper = null;
        isDragging = false;
        
        // Keep wasDragging true briefly for the click handler
        setTimeout(() => { wasDragging = false; }, 50);
    };

    document.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', endDrag);

    document.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', moveDrag, { passive: false });
    document.addEventListener('touchend', endDrag);

    // Intercept click if dragged (Capture phase)
    document.addEventListener('click', (e) => {
        if (wasDragging) {
            e.stopImmediatePropagation();
            e.preventDefault();
        }
    }, true);

    // Event Delegation for Bubbles
    document.addEventListener('click', (e) => {
        const clickedBubble = e.target.closest('.slogan-bubble');
        if (!clickedBubble) return;
        
        // Increment global click counter
        totalBubbleClicks++;
        
        // Check for 6th click (Message + Scroll)
        if (totalBubbleClicks === 6) {
            messageBubble.classList.add('visible');
            
            // Wait 2 seconds then scroll
            setTimeout(() => {
                const targetScroll = window.innerHeight;
                smoothScrollTo(targetScroll, 3000);
                
                setTimeout(() => {
                    messageBubble.classList.remove('visible');
                }, 1000);
            }, 2000);
        }

        // Check for 10th click (6 + 4) -> Slogan fade out & Bubbles fly up
        if (totalBubbleClicks === 10) {
            const sloganInner = document.querySelector('.slogan-inner');
            if (sloganInner) {
                // Fade out Slogan
                sloganInner.style.transition = 'opacity 0.8s ease';
                sloganInner.style.opacity = '0';
                
                setTimeout(() => {
                    // Replace content with new dialog
                    sloganInner.innerHTML = `
                        <div class="slogan-replacement">
                            <p class="slogan-new-text">
                                Thank you for visiting.<br>Don't forget to reach out if you see the potential I can bring to your company.
                            </p>
                            <div class="slogan-contact-info">
                                <a href="tel:+84988641499" class="contact-item">
                                    <img src="icons/phone.svg" alt="Phone">
                                    <span>(+84) 988 641 499</span>
                                </a>
                                <a href="mailto:Vinhhk200@gmail.com" class="contact-item">
                                    <img src="icons/mail.svg" alt="Gmail">
                                    <span>Vinhhk200@gmail.com</span>
                                </a>
                            </div>
                        </div>
                    `;
                    // Fade in new dialog
                    sloganInner.style.transition = 'opacity 2.5s ease-out'; // Slower, gentler fade
                    sloganInner.style.opacity = '1';
                    
                    // REMOVE Bubbles instead of Flying Up
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

                    // Trigger Background Marquee
                    const bgMarquee = document.querySelector('.bg-marquee-container');
                    if (bgMarquee) {
                        bgMarquee.classList.add('visible');
                    }

                }, 800);
            }
        }

        // IMMEDIATE ACTION: Gentle Move (No explode state)
        const wrapper = clickedBubble.closest('.slogan-bubble-wrapper');
        if (wrapper) {
            // Generate new random position (keep within 10-90% range to stay visible)
            const newLeft = 10 + Math.random() * 80;
            const newTop = 15 + Math.random() * 70; // Avoid very bottom
            
            wrapper.style.left = `${newLeft}%`;
            wrapper.style.top = `${newTop}%`;
        }
    });
});


