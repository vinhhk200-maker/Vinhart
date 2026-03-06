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

    /* =========================================
       PROJECT CAROUSEL LOGIC
       ========================================= */
    const carousel = document.querySelector('.impact-hero-carousel');
    if (carousel) {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const dots = carousel.querySelectorAll('.carousel-dot');
        let currentSlide = 0;
        const totalSlides = slides.length;
        const intervalTime = 3000; // 3 seconds
        let slideInterval;

        // Function to move to specific slide
        function goToSlide(index) {
            // Remove active class from current
            slides[currentSlide].classList.remove('active');
            dots[currentSlide].classList.remove('active');
            
            // Update current index
            currentSlide = (index + totalSlides) % totalSlides;
            
            // Add active class to new
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        }

        // Auto play function
        function startSlideShow() {
            slideInterval = setInterval(() => {
                goToSlide(currentSlide + 1);
            }, intervalTime);
        }

        // Stop auto play
        function stopSlideShow() {
            clearInterval(slideInterval);
        }

        // Event listeners for dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                stopSlideShow(); // Stop auto play on interaction
                goToSlide(index);
                startSlideShow(); // Restart auto play
            });
        });

        // Initialize
        startSlideShow();

        // Optional: Pause on hover
        carousel.addEventListener('mouseenter', stopSlideShow);
        carousel.addEventListener('mouseleave', startSlideShow);

        // Swipe Support for Mobile
        let touchStartX = 0;
        let touchStartY = 0;

        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            stopSlideShow(); // Stop auto play on touch start
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;

            // Check if swipe is horizontal and significant enough
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swiped Left -> Next Slide
                    goToSlide(currentSlide + 1);
                } else {
                    // Swiped Right -> Previous Slide
                    goToSlide(currentSlide - 1);
                }
            }
            
            startSlideShow(); // Restart auto play
        }, { passive: true });
    }

    // Savills Video Slider Logic
    const savillsTrack = document.getElementById('savills-video-track');
    if (savillsTrack) {
        const slides = savillsTrack.querySelectorAll('.video-slide');
        const videos = savillsTrack.querySelectorAll('video');
        let currentIndex = 0;
        let isSliding = false;

        // Function to go to specific slide
        function goToVideoSlide(index) {
            if (isSliding) return;
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;

            isSliding = true;
            currentIndex = index;

            // Pause all videos first
            videos.forEach(v => v.pause());

            // Slide track
            savillsTrack.style.transform = `translateX(-${currentIndex * 100}%)`;

            // Play new video after transition (or immediately if preferred)
            setTimeout(() => {
                const currentVideo = videos[currentIndex];
                currentVideo.currentTime = 0;
                currentVideo.play().catch(e => console.log('Auto-play failed:', e));
                isSliding = false;
            }, 500); // Match CSS transition time
        }

        // Auto-slide when video ends
        videos.forEach((video, index) => {
            video.addEventListener('ended', () => {
                goToVideoSlide(index + 1);
            });
        });

        // Initial Play
        // Play the first video immediately on load (if policy allows)
        videos[0].play().catch(e => console.log('Initial Auto-play failed:', e));
        
        // Ensure all videos have loop attribute removed if we want sequential play
        // But user asked for "auto play continuously" which implies:
        // Video 1 ends -> Slide to 2 -> Video 2 plays -> Ends -> Slide to 3...
        // The existing 'ended' event handler already does this.
        // We just need to make sure the first one starts.

        // Touch Swipe Logic
        let vTouchStartX = 0;
        let vTouchStartY = 0;

        savillsTrack.addEventListener('touchstart', (e) => {
            vTouchStartX = e.touches[0].clientX;
            vTouchStartY = e.touches[0].clientY;
        }, { passive: true });

        savillsTrack.addEventListener('touchend', (e) => {
            const vTouchEndX = e.changedTouches[0].clientX;
            const vTouchEndY = e.changedTouches[0].clientY;
            
            const diffX = vTouchStartX - vTouchEndX;
            const diffY = vTouchStartY - vTouchEndY;

            // Horizontal swipe detection
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe Left -> Next
                    goToVideoSlide(currentIndex + 1);
                } else {
                    // Swipe Right -> Prev
                    goToVideoSlide(currentIndex - 1);
                }
            }
        }, { passive: true });
    }
});
