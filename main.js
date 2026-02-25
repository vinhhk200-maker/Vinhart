document.addEventListener('DOMContentLoaded', () => {
    const userAgent = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const isiOSDevice = /iP(hone|od|ad)/.test(platform) || /iP(hone|od|ad)/.test(userAgent);
    const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(userAgent);
    if (isiOSDevice && isSafari) {
        setTimeout(() => {
            if (window.scrollY === 0) {
                window.scrollTo(0, 1);
            }
        }, 80);
    }
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

    if (document.getElementById('video-placeholder')) {
        document.getElementById('video-placeholder').addEventListener('click', function() {
            var iframe = document.getElementById('expertise-video');
            iframe.src += "&autoplay=1"; 
            this.style.display = 'none';
        });
    }

    // Video Gradient Overlay Logic
    const videoGradientOverlay = document.querySelector('.video-gradient-overlay');
    if (videoGradientOverlay) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 150) {
                videoGradientOverlay.classList.add('visible');
            } else {
                videoGradientOverlay.classList.remove('visible');
            }
        });
    }

    // Custom Smooth Scroll for Hero CTA
    const heroCta = document.querySelector('.hero-cta');
    if (heroCta) {
        heroCta.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Calculate target position: Center the iframe vertically if possible, or top of section
                // The user wants to "stop gently at iframe"
                // Let's find the iframe or the video container within the section
                const videoContainer = targetSection.querySelector('.impact-media-frame') || targetSection.querySelector('iframe') || targetSection;
                
                const targetPosition = videoContainer.getBoundingClientRect().top + window.scrollY;
                const startPosition = window.scrollY;
                
                // Calculate destination to center the video if possible, or give top breathing room
                // "Stop gently at iframe" -> aim for iframe top with some padding
                // Let's target the video container top minus a small offset (e.g., 60px for header)
                const offset = 60; 
                const distance = targetPosition - startPosition - offset;
                const finalDestination = startPosition + distance;
                
                const duration = 2500; // Increased to 2.5s for slower, more cinematic feel
                let start = null;

                function step(timestamp) {
                    if (!start) start = timestamp;
                    const elapsed = timestamp - start;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Custom Cubic Bezier-like easing for "Slow Start -> Fast Middle -> Slow End"
                    // easeInOutCubic: t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
                    const ease = progress < 0.5 
                        ? 4 * progress * progress * progress 
                        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                    
                    window.scrollTo(0, startPosition + distance * ease);

                    if (elapsed < duration) {
                        window.requestAnimationFrame(step);
                    }
                }

                window.requestAnimationFrame(step);
            }
        });
    }
});
