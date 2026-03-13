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
        const totalSlides = slides.length;
        let isActive = false;
        let initialized = false;
        let dots = [];
        let currentSlide = 0;
        const intervalTime = 3000;
        let slideTimeout;
        let currentVideo = null;
        let isHovering = false;

        function setup() {
            if (initialized) return;
            initialized = true;

            const nav = carousel.querySelector('.carousel-nav');
            if (nav && slides.length > 0) {
                nav.innerHTML = '';
                slides.forEach((slide, index) => {
                    const btn = document.createElement('div');
                    btn.className = 'carousel-thumbnail-item';
                    if (index === 0) btn.classList.add('active');

                    const video = slide.querySelector('video');
                    const img = slide.querySelector('img');

                    if (video) {
                        const source = video.querySelector('source');
                        if (source) {
                            const thumbVideo = document.createElement('video');
                            thumbVideo.muted = true;
                            thumbVideo.playsInline = true;
                            thumbVideo.preload = 'metadata';
                            const newSource = document.createElement('source');
                            newSource.src = source.src + '#t=0.001';
                            newSource.type = source.type;
                            thumbVideo.appendChild(newSource);
                            thumbVideo.addEventListener('loadedmetadata', () => {
                                try { thumbVideo.currentTime = 0.001; } catch (e) {}
                            }, { passive: true });
                            thumbVideo.addEventListener('seeked', () => {
                                try { thumbVideo.pause(); } catch (e) {}
                            }, { passive: true });
                            try { thumbVideo.load(); } catch (e) {}
                            btn.appendChild(thumbVideo);
                        }
                    } else if (img) {
                        const thumbImg = document.createElement('img');
                        thumbImg.src = img.src;
                        thumbImg.alt = img.alt || `Slide ${index + 1}`;
                        btn.appendChild(thumbImg);
                    }

                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        stopSlideShow();
                        activate();
                        goToSlide(index);
                    });

                    nav.appendChild(btn);
                    dots.push(btn);
                });
            }
            
            if (totalSlides > 0) {
                carousel.addEventListener('mouseenter', () => {
                    isHovering = true;
                    stopSlideShow();
                });
                carousel.addEventListener('mouseleave', () => {
                    isHovering = false;
                    startSlideShow();
                });

                let touchStartX = 0;
                let touchStartY = 0;
                let isDragging = false;

                carousel.addEventListener('touchstart', (e) => {
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                    stopSlideShow();
                }, { passive: true });

                carousel.addEventListener('touchend', (e) => {
                    const touchEndX = e.changedTouches[0].clientX;
                    const touchEndY = e.changedTouches[0].clientY;
                    handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
                    startSlideShow();
                }, { passive: true });

                carousel.addEventListener('mousedown', (e) => {
                    isDragging = true;
                    touchStartX = e.clientX;
                    touchStartY = e.clientY;
                    stopSlideShow();
                    carousel.style.cursor = 'grabbing';
                    e.preventDefault();
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

                function handleSwipe(startX, startY, endX, endY) {
                    const diffX = startX - endX;
                    const diffY = startY - endY;

                    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                        if (diffX > 0) {
                            goToSlide(currentSlide + 1);
                        } else {
                            goToSlide(currentSlide - 1);
                        }
                    }
                }

                carousel.style.cursor = 'grab';
            }
        }

        // Schedule next slide based on content
        function scheduleNextSlide() {
            if (!isActive) return;
            if (slideTimeout) clearTimeout(slideTimeout);
            if (currentVideo) {
                currentVideo.onended = null;
                currentVideo = null;
                currentVideo = null;
            }

            const activeSlide = slides[currentSlide];
            const video = activeSlide.querySelector('video');

            if (video) {
                currentVideo = video;
                video.currentTime = 0;
                video.play().catch(() => {});
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
            if (!isActive) return;
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
            if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
            
            currentSlide = (index + totalSlides) % totalSlides;
            
            slides[currentSlide].classList.add('active');
            if (dots[currentSlide]) dots[currentSlide].classList.add('active');

            if (!isHovering) {
                scheduleNextSlide();
            }
        }

        // Auto play function
        function startSlideShow() {
            if (!isActive) return;
            if (!isHovering) {
                scheduleNextSlide();
            }
        }

        // Stop auto play
        function stopSlideShow() {
            if (slideTimeout) clearTimeout(slideTimeout);
            if (currentVideo) currentVideo.onended = null;
        }

        function deactivate() {
            if (!initialized) return;
            if (!isActive) return;
            isActive = false;
            stopSlideShow();
            if (currentVideo) {
                currentVideo.pause();
                currentVideo.currentTime = 0;
            } else {
                const v = slides[currentSlide] ? slides[currentSlide].querySelector('video') : null;
                if (v) {
                    v.pause();
                    v.currentTime = 0;
                }
            }
        }
        
        function activate() {
            setup();
            if (isActive) return;
            isActive = true;
            startSlideShow();
        }

        if (totalSlides > 0 && 'IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) activate();
                    else deactivate();
                });
            }, { threshold: 0.15, rootMargin: '200px 0px' });
            io.observe(carousel);
        } else if (totalSlides > 0) {
            activate();
        }
    });

    // Video Slider Logic (Applies to all video sliders)
    const videoTracks = document.querySelectorAll('.video-slider-track');
    videoTracks.forEach(track => {
        // Skip if this track uses manual fade transition (handled by changeVideoSlide in index.html)
        if (track.querySelector('.fade-transition')) return;

        // --- OLD LOGIC REMOVED TO PREVENT CONFLICTS ---
        // We only keep this block for NON-FADE sliders (if any exist).
        // Since the user requested cleaning up interactions like swipe, autoplay, loop,
        // we will simplify this significantly or ensure it doesn't touch the fade tracks.
        
        // If there are no other video sliders, this block is effectively empty for the target tracks.
        // For safety, we keep the basic structure but ensure no interference.

        const slides = track.querySelectorAll('.video-slide');
        const videos = track.querySelectorAll('video');
        // ... rest of logic for non-fade sliders ...
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

    const wrappers = Array.from(document.querySelectorAll('.impact-content-wrapper'));
    const headerEl = document.querySelector('.header');
    const stickyGroups = [];

    wrappers.forEach(wrapper => {
        const media = wrapper.querySelector('.impact-media');
        if (!media) return;
        if (media.dataset.stickyPrepared === '1') return;

        const inner = document.createElement('div');
        inner.className = 'impact-media-sticky';
        while (media.firstChild) inner.appendChild(media.firstChild);
        media.appendChild(inner);
        media.dataset.stickyPrepared = '1';
        stickyGroups.push({ wrapper, media, inner });
    });

    function getStickyTop() {
        if (!headerEl) return 24;
        const rect = headerEl.getBoundingClientRect();
        const visible = rect.bottom > 0 && rect.top >= -1;
        const h = visible ? rect.height : 0;
        return Math.max(16, Math.round(h + 24));
    }

    function isTwoColumn(wrapper) {
        const style = window.getComputedStyle(wrapper);
        return style.display.includes('flex') && style.flexDirection !== 'column';
    }

    function updateStickyMedia() {
        const scrollY = window.scrollY;
        const topOffset = getStickyTop();

        stickyGroups.forEach(group => {
            const wrapper = group.wrapper;
            const inner = group.inner;

            const slide = wrapper.closest('.case-slide');
            if (slide && !slide.classList.contains('active')) {
                inner.style.transform = '';
                inner.style.willChange = '';
                return;
            }
            if (!wrapper.isConnected || wrapper.offsetParent === null) {
                inner.style.transform = '';
                inner.style.willChange = '';
                return;
            }
            if (!isTwoColumn(wrapper)) {
                inner.style.transform = '';
                inner.style.willChange = '';
                return;
            }

            const wrapperTop = wrapper.getBoundingClientRect().top + scrollY;
            const wrapperHeight = wrapper.offsetHeight;
            const innerHeight = inner.offsetHeight;
            const maxTranslate = Math.max(0, wrapperHeight - innerHeight);
            const desired = scrollY - wrapperTop + topOffset;
            const translate = Math.min(Math.max(desired, 0), maxTranslate);

            inner.style.willChange = 'transform';
            inner.style.transform = `translate3d(0, ${Math.round(translate)}px, 0)`;
        });
    }

    let stickyTicking = false;
    function onStickyTick() {
        if (stickyTicking) return;
        stickyTicking = true;
        requestAnimationFrame(() => {
            updateStickyMedia();
            stickyTicking = false;
        });
    }
    window.addEventListener('scroll', onStickyTick, { passive: true });
    window.addEventListener('resize', onStickyTick, { passive: true });
    updateStickyMedia();
});
