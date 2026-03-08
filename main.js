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

    // ---------------------------------------------------------
    // Sticky Tabs & Header Divider Logic
    // ---------------------------------------------------------
    const tabsBleed = document.querySelector('.case-tabs-bleed');
    const headerDivider = document.querySelector('.header-divider');
    const header = document.querySelector('.header');

    if (tabsBleed && header) {
        // Sticky logic DISABLED for future use
        /*
        const checkSticky = () => {
            const rect = tabsBleed.getBoundingClientRect();
            const headerHeight = header.offsetHeight || 55;
            
            // If top of tabs is <= header bottom + buffer, it is pinned
            if (rect.top <= headerHeight + 1) {
                tabsBleed.classList.add('is-pinned');
                if (headerDivider) headerDivider.style.display = 'none';
            } else {
                tabsBleed.classList.remove('is-pinned');
                if (headerDivider) headerDivider.style.display = 'block';
            }
        };

        window.addEventListener('scroll', checkSticky, { passive: true });
        // Initial check
        setTimeout(checkSticky, 100); 
        */
    }

    // ---------------------------------------------------------
    // Dynamic Header Title (H2 Out of View, Section Logic)
    // ---------------------------------------------------------
    const caseStudyH2 = document.querySelector('.impact-case .section-title');
    const caseStudySection = document.querySelector('.impact-case');
    const headerTitleContainer = document.querySelector('.header-title');
    const headerTitleSpan = headerTitleContainer ? headerTitleContainer.querySelector('span') : null;
    
    if (caseStudyH2 && caseStudySection && headerTitleSpan) {
        // Store original title if not already stored (to avoid overwriting if reload)
        if (!headerTitleSpan.dataset.original) {
            headerTitleSpan.dataset.original = headerTitleSpan.textContent;
        }
        const originalTitle = headerTitleSpan.dataset.original;
        const newTitle = "Case Study (Portfolio)";
        
        const updateTitle = () => {
            const h2Rect = caseStudyH2.getBoundingClientRect();
            const sectionRect = caseStudySection.getBoundingClientRect();
            
            // Show new title ONLY if:
            // 1. H2 has scrolled past the top (h2Rect.top < 0)
            // 2. We are still inside the section (sectionRect.bottom > 60 approx header height)
            if (h2Rect.top < 0 && sectionRect.bottom > 60) {
                 headerTitleSpan.textContent = newTitle;
            } else {
                 headerTitleSpan.textContent = originalTitle;
            }
        };

        const observerCallback = () => {
            // Use requestAnimationFrame to debounce slightly and ensure layout is ready
            requestAnimationFrame(updateTitle);
        };

        const h2Observer = new IntersectionObserver(observerCallback, { threshold: [0, 1] });
        const sectionObserver = new IntersectionObserver(observerCallback, { threshold: [0] });
        
        h2Observer.observe(caseStudyH2);
        sectionObserver.observe(caseStudySection);
    }
    // Video Placeholder Logic
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
    const carousels = document.querySelectorAll('.impact-hero-carousel');
    carousels.forEach(carousel => {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const dots = carousel.querySelectorAll('.carousel-dot');
        let currentSlide = 0;
        const totalSlides = slides.length;
        const intervalTime = 3000; // 3 seconds for images
        let slideTimeout;
        let currentVideo = null;
        let isHovering = false;

        // Schedule next slide based on content
        function scheduleNextSlide() {
            if (slideTimeout) clearTimeout(slideTimeout);
            if (currentVideo) {
                currentVideo.onended = null;
                currentVideo = null;
            }

            const activeSlide = slides[currentSlide];
            const video = activeSlide.querySelector('video');

            if (video) {
                currentVideo = video;
                video.currentTime = 0;
                video.play().catch(e => console.log('Autoplay prevented', e));
                video.onended = function() {
                    goToSlide(currentSlide + 1);
                };
            } else {
                // Image
                slideTimeout = setTimeout(() => {
                    goToSlide(currentSlide + 1);
                }, intervalTime);
            }
        }

        // Function to move to specific slide
        function goToSlide(index) {
            if (slideTimeout) clearTimeout(slideTimeout);
            if (currentVideo) {
                currentVideo.onended = null;
                currentVideo = null;
            }

            // Pause previous video
            const prevVideo = slides[currentSlide].querySelector('video');
            if (prevVideo) {
                prevVideo.pause();
                prevVideo.currentTime = 0;
            }

            slides[currentSlide].classList.remove('active');
            dots[currentSlide].classList.remove('active');
            
            currentSlide = (index + totalSlides) % totalSlides;
            
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');

            if (!isHovering) {
                scheduleNextSlide();
            }
        }

        // Auto play function
        function startSlideShow() {
            if (!isHovering) {
                scheduleNextSlide();
            }
        }

        // Stop auto play
        function stopSlideShow() {
            if (slideTimeout) clearTimeout(slideTimeout);
            if (currentVideo) currentVideo.onended = null;
        }

        // Event listeners for dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                stopSlideShow(); 
                goToSlide(index);
            });
        });

        // Initialize
        if (totalSlides > 0) {
            scheduleNextSlide();

            // Pause on hover
            carousel.addEventListener('mouseenter', () => {
                isHovering = true;
                stopSlideShow();
            });
            carousel.addEventListener('mouseleave', () => {
                isHovering = false;
                startSlideShow();
            });

            // Swipe Support for Mobile & Desktop (Mouse Drag)
            let touchStartX = 0;
            let touchStartY = 0;
            let isDragging = false;

            // Touch Events
            carousel.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                stopSlideShow(); // Stop auto play on touch start
            }, { passive: true });

            carousel.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
                startSlideShow(); // Restart auto play
            }, { passive: true });

            // Mouse Events for Desktop Dragging
            carousel.addEventListener('mousedown', (e) => {
                isDragging = true;
                touchStartX = e.clientX;
                touchStartY = e.clientY;
                stopSlideShow();
                carousel.style.cursor = 'grabbing';
                e.preventDefault(); // Prevent image drag default behavior
            });

            carousel.addEventListener('mouseup', (e) => {
                if (!isDragging) return;
                isDragging = false;
                const touchEndX = e.clientX;
                const touchEndY = e.clientY;
                handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
                startSlideShow();
                carousel.style.cursor = 'grab';
            });

            carousel.addEventListener('mouseleave', (e) => {
                if (isDragging) {
                    isDragging = false;
                    startSlideShow();
                    carousel.style.cursor = 'grab';
                }
            });

            // Unified Swipe Handler
            function handleSwipe(startX, startY, endX, endY) {
                const diffX = startX - endX;
                const diffY = startY - endY;

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
            }
            
            // Set initial cursor style
            carousel.style.cursor = 'grab';
        }
    });

    // Video Slider Logic (Applies to all video sliders)
    const videoTracks = document.querySelectorAll('.video-slider-track');
    videoTracks.forEach(track => {
        const slides = track.querySelectorAll('.video-slide');
        const videos = track.querySelectorAll('video');
        // Find dots container within the same .impact-media-frame parent
        const mediaContainer = track.closest('.impact-media-frame');
        const dots = mediaContainer ? mediaContainer.querySelectorAll('.carousel-dot') : [];
        
        let currentIndex = 0;
        let isSliding = false;

        // Function to go to specific slide
        function goToVideoSlide(index) {
            if (isSliding) return;
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;

            isSliding = true;
            currentIndex = index;

            // Update dots
            dots.forEach((dot, i) => {
                if (i === currentIndex) dot.classList.add('active');
                else dot.classList.remove('active');
            });

            // Pause all videos first
            videos.forEach(v => v.pause());

            // Slide track
            track.style.transform = `translateX(-${currentIndex * 100}%)`;

            // Play new video after transition (or immediately if preferred)
            setTimeout(() => {
                const currentVideo = videos[currentIndex];
                if (currentVideo) {
                    currentVideo.currentTime = 0;
                    currentVideo.play().catch(e => console.log('Auto-play failed:', e));
                }
                isSliding = false;
            }, 500); // Match CSS transition time
        }

        // Click events for dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToVideoSlide(index);
            });
        });

        // Auto-slide when video ends
        videos.forEach((video, index) => {
            video.addEventListener('ended', () => {
                goToVideoSlide(index + 1);
            });
        });

        // Initial Play
        if (videos.length > 0) {
            videos[0].play().catch(e => console.log('Initial Auto-play failed:', e));
        }

        // Touch Swipe Logic
        let vTouchStartX = 0;
        let vTouchStartY = 0;
        let vIsDragging = false;

        // Touch events for mobile
        track.addEventListener('touchstart', (e) => {
            vTouchStartX = e.touches[0].clientX;
            vTouchStartY = e.touches[0].clientY;
            // Stop current video if playing to allow smooth swipe interaction
            const currentVideo = videos[currentIndex];
            if (currentVideo && !currentVideo.paused) {
                currentVideo.pause();
            }
        }, { passive: true });

        track.addEventListener('touchmove', (e) => {
            // Optional: Add visual feedback during drag if needed
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            const vTouchEndX = e.changedTouches[0].clientX;
            const vTouchEndY = e.changedTouches[0].clientY;
            handleVideoSwipe(vTouchStartX, vTouchStartY, vTouchEndX, vTouchEndY);
            
            // Resume playing if no swipe occurred or swipe finished
            const currentVideo = videos[currentIndex];
            if (currentVideo && currentVideo.paused && !isSliding) {
                currentVideo.play().catch(e => console.log('Resume failed:', e));
            }
        }, { passive: true });

        // Mouse events for desktop dragging
        track.addEventListener('mousedown', (e) => {
            vIsDragging = true;
            vTouchStartX = e.clientX;
            vTouchStartY = e.clientY;
            track.style.cursor = 'grabbing';
            e.preventDefault();
        });

        track.addEventListener('mouseup', (e) => {
            if (!vIsDragging) return;
            vIsDragging = false;
            const vTouchEndX = e.clientX;
            const vTouchEndY = e.clientY;
            handleVideoSwipe(vTouchStartX, vTouchStartY, vTouchEndX, vTouchEndY);
            track.style.cursor = 'grab';
        });

        track.addEventListener('mouseleave', () => {
            if (vIsDragging) {
                vIsDragging = false;
                track.style.cursor = 'grab';
            }
        });

        // Unified Swipe Handler
        function handleVideoSwipe(startX, startY, endX, endY) {
            const diffX = startX - endX;
            const diffY = startY - endY;

            // Horizontal swipe detection
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe Left -> Next
                    goToVideoSlide(currentIndex + 1);
                } else {
                    // Swipe Right -> Prev
                    goToVideoSlide(currentIndex - 1);
                }
            } else {
                // Not a swipe, resume playback
                const currentVideo = videos[currentIndex];
                if (currentVideo && currentVideo.paused && !isSliding) {
                    currentVideo.play().catch(e => console.log('Resume failed:', e));
                }
            }
        }
        
        // Initial cursor
        track.style.cursor = 'grab';
    });

    // ---------------------------------------------------------
    // Bottom Gradient Overlay Logic (Dark Mode on Dark Sections)
    // ---------------------------------------------------------
    const bottomGradient = document.querySelector('.bottom-gradient-overlay');
    if (bottomGradient) {
        // Dark sections: video wrapper, caption container, and impact case (case study)
        const darkSections = document.querySelectorAll('.video-wrapper, .video-caption-container, .impact-case');
        
        const checkBottomGradient = () => {
            const viewHeight = window.innerHeight;
            let shouldBeDark = false;
            
            darkSections.forEach(section => {
                if (!section) return;
                const rect = section.getBoundingClientRect();
                // Check if the section covers the bottom 54px area
                // rect.top < viewHeight AND rect.bottom > viewHeight - 54
                if (rect.top < viewHeight && rect.bottom > (viewHeight - 54)) {
                    shouldBeDark = true;
                }
            });
            
            if (shouldBeDark) {
                bottomGradient.classList.add('bottom-gradient--dark');
            } else {
                bottomGradient.classList.remove('bottom-gradient--dark');
            }
        };
        
        // Check on scroll and resize
        window.addEventListener('scroll', checkBottomGradient, { passive: true });
        window.addEventListener('resize', checkBottomGradient, { passive: true });
        
        // Initial check
        checkBottomGradient();
    }
});
