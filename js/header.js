
const HeaderComponent = {
    html: `
    <!-- Background Marquee (Global) -->
    <div class="bg-marquee-container">
        <!-- Row 1: Creativity connects (Reverse) -->
        <div class="bg-marquee-row reverse">
            <div class="bg-marquee-content">
                <span class="bg-marquee-text">Creativity connects&nbsp;</span>
                <span class="bg-marquee-text">Creativity connects&nbsp;</span>
                <span class="bg-marquee-text">Creativity connects&nbsp;</span>
                <span class="bg-marquee-text">Creativity connects&nbsp;</span>
                <span class="bg-marquee-text">Creativity connects&nbsp;</span>
                <span class="bg-marquee-text">Creativity connects&nbsp;</span>
            </div>
        </div>
        
        <!-- Row 2: Compelling narratives... (Normal) -->
        <div class="bg-marquee-row normal">
            <div class="bg-marquee-content">
                <span class="bg-marquee-text">Compelling narratives meet strategic goals&nbsp;</span>
                <span class="bg-marquee-text">Compelling narratives meet strategic goals&nbsp;</span>
                <span class="bg-marquee-text">Compelling narratives meet strategic goals&nbsp;</span>
                <span class="bg-marquee-text">Compelling narratives meet strategic goals&nbsp;</span>
            </div>
        </div>
    </div>

    <!-- Header -->
    <header class="header">
        <div class="header-gradient-bar"></div>
        <div class="marquee-track">
            <div class="marquee-content"></div>
        </div>
        <div class="header-container">
            <a href="index.html" class="header-logo">
                <span class="header-name">V I N H</span>
                <span class="header-divider">|</span>
                <div class="header-title">
                    <span>Art Creative Director</span>
                </div>
            </a>
            
            <button class="hamburger-btn" aria-label="Menu">
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
            </button>
        </div>
    </header>

    <!-- Menu Overlay -->
    <div class="menu-overlay">
        <button class="menu-close-btn" aria-label="Close Menu">×</button>
        <ul class="menu-list">
            <li class="menu-item" id="cv-menu-item" style="display: none;"><a href="cv.html" class="menu-link">CV</a></li>
            <li class="menu-item"><a href="knowledge-sharing.html" class="menu-link">The Lab</a></li>
            <li class="menu-item"><a href="say-hi.html" class="menu-link">Connect</a></li>
        </ul>
    </div>
    `,

    init: function() {
        // Inject HTML
        // Use a designated placeholder or prepend to body
        // We'll check for a script tag with id="header-script" to insert before, or just body
        
        // Remove existing elements if they exist (to avoid duplicates during dev)
        const existingHeader = document.querySelector('.header');
        const existingOverlay = document.querySelector('.menu-overlay');
        const existingMarquee = document.querySelector('.bg-marquee-container');
        
        if (existingHeader) existingHeader.remove();
        if (existingOverlay) existingOverlay.remove();
        if (existingMarquee) existingMarquee.remove();

        document.body.insertAdjacentHTML('afterbegin', this.html);

        // Check if SHOW_CV_MENU is defined and true
        if (typeof SHOW_CV_MENU !== 'undefined' && SHOW_CV_MENU) {
            const cvItem = document.getElementById('cv-menu-item');
            if (cvItem) cvItem.style.display = 'block';
        }

        // Initialize Logic
        this.initHeaderToggles();
        this.initMenu();
        this.initScroll();
        
        const headerName = document.querySelector('.header-name');
        if (headerName) {
            headerName.addEventListener('click', function(e){
                e.preventDefault();
                e.stopPropagation();
                window.location.replace('https://vinhhk.com/');
            });
        }
        const headerLogo = document.querySelector('.header-logo');
        if (headerLogo) {
            headerLogo.addEventListener('click', function(e){
                e.preventDefault();
                e.stopPropagation();
                window.location.replace('https://vinhhk.com/');
            }, true);
        }
    },

    initHeaderToggles: function() {
        const gradientBar = document.querySelector('.header-gradient-bar');
        const marqueeTrack = document.querySelector('.marquee-track');
        const marqueeContent = document.querySelector('.marquee-content');

        if (typeof SHOW_HEADER_GRADIENT_BAR !== 'undefined' && !SHOW_HEADER_GRADIENT_BAR) {
            if (gradientBar) gradientBar.style.display = 'none';
        }

        if (!marqueeTrack || !marqueeContent) return;

        if (typeof SHOW_HEADER_MARQUEE !== 'undefined' && !SHOW_HEADER_MARQUEE) {
            marqueeTrack.style.display = 'none';
            return;
        }

        const gradientText = typeof HEADER_MARQUEE_GRADIENT_TEXT === 'string' ? HEADER_MARQUEE_GRADIENT_TEXT : '';
        const plainText = typeof HEADER_MARQUEE_PLAIN_TEXT === 'string' ? HEADER_MARQUEE_PLAIN_TEXT : '';
        const suffixText = typeof HEADER_MARQUEE_SUFFIX_TEXT === 'string' ? HEADER_MARQUEE_SUFFIX_TEXT : '';
        const linkUrl = typeof HEADER_MARQUEE_LINK_URL === 'string' ? HEADER_MARQUEE_LINK_URL : '';
        const linkLabel = typeof HEADER_MARQUEE_LINK_LABEL === 'string' ? HEADER_MARQUEE_LINK_LABEL : '';

        const hasLink = linkUrl.trim().length > 0 && linkLabel.trim().length > 0;

        const baseHtml = `
            <span class="marquee-item">
                <strong class="text-gradient">${gradientText}</strong>
                <span class="text-thin-black"> </span>
                <span class="text-thin-black">${plainText}</span>
                <span class="text-thin-black"> </span>
                <span class="text-thin-black">${suffixText}</span>
                ${hasLink ? `<span class="text-thin-black"> </span><a href="${linkUrl}" class="marquee-link" target="_blank" rel="noopener noreferrer">${linkLabel}</a>` : ''}
            </span>
        `;

        const items = [];
        for (let i = 0; i < 12; i++) {
            items.push(baseHtml);
        }
        marqueeContent.innerHTML = items.join('');
    },

    initMenu: function() {
        const hamburgerBtn = document.querySelector('.hamburger-btn');
        const menuOverlay = document.querySelector('.menu-overlay');
        const menuCloseBtn = document.querySelector('.menu-close-btn');
        const body = document.body;
        const menuLinks = document.querySelectorAll('.menu-link');

        if (!hamburgerBtn) console.error('HeaderComponent: Hamburger button NOT found');
        if (!menuOverlay) console.error('HeaderComponent: Menu overlay NOT found');

        if (!hamburgerBtn || !menuOverlay) return;

        function toggleMenu(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation(); // Ngăn chặn sự kiện lan truyền lên các element cha có thể chặn click
            }
            
            const isCurrentlyActive = menuOverlay.classList.contains('active');

            hamburgerBtn.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            
            if (menuOverlay.classList.contains('active')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        }

        // Sử dụng capture phase để đảm bảo nhận được sự kiện trước các script khác
        hamburgerBtn.addEventListener('click', toggleMenu, true);

        if (menuCloseBtn) menuCloseBtn.addEventListener('click', toggleMenu);
        
        // Get current page filename
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';

        menuLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            
            // Highlight current page
            if (linkPath === currentPath) {
                link.closest('.menu-item').classList.add('current-page');
            }

            link.addEventListener('click', () => {
                toggleMenu();
            });
        });
    },

    initScroll: function() {
        const header = document.querySelector('.header');
        if (!header) return;

        // Check if current page is Home (by class or filename)
        const isHomePage = document.body.classList.contains('page-home') || 
                          window.location.pathname.endsWith('index.html') || 
                          window.location.pathname.endsWith('/');
        
        if (!isHomePage) {
            header.classList.add('visible');
            return; // Exit, do not add scroll listener
        }

        let ticking = false;
        let lastScrollY = window.scrollY || 0;
        
        const updateHeader = () => {
            const scrollY = window.scrollY;
            const triggerPoint = 700; // Header appearance threshold
            
            // Header Visibility Logic
            const isScrollingUp = scrollY < lastScrollY;
            if (scrollY >= triggerPoint && !isScrollingUp) {
                header.classList.add('visible');
            } else if (scrollY < triggerPoint) {
                header.classList.remove('visible');
            } else if (isScrollingUp) {
                 header.classList.add('visible');
            }

            // Title Swap Logic
            const headerTitleSpan = document.querySelector('.header-title span');
            const originalHeaderTitle = "Art Creative Director";
            const newHeaderTitle = "Case Study (Portfolio)";
            const impactCaseSection = document.getElementById('highlights-video'); // The parent section
            const caseStudyTitleH2 = document.querySelector('.section-title.text-gradient'); // The H2 title inside section

            if (headerTitleSpan && impactCaseSection) {
                const sectionRect = impactCaseSection.getBoundingClientRect();
                const headerHeight = 60;
                
                // Logic:
                // 1. Default: "Art Creative Director"
                // 2. Switch to "Case Study (Portfolio)" ONLY when the H2 title has scrolled OUT of view (top < headerHeight).
                // 3. Switch back to "Art Creative Director" when scrolling out of the section completely.

                let shouldShowCaseTitle = false;

                // Check if we are inside the section vertically
                if (sectionRect.top <= headerHeight && sectionRect.bottom >= headerHeight) {
                    // We are inside the section.
                    // Now check if the H2 title has scrolled past the header.
                    if (caseStudyTitleH2) {
                        const h2Rect = caseStudyTitleH2.getBoundingClientRect();
                        // If H2 bottom is above the header bottom (meaning it's scrolled up and hidden behind/above header)
                        if (h2Rect.bottom < headerHeight) {
                            shouldShowCaseTitle = true;
                        }
                    } else {
                         // Fallback if H2 not found: just use section top
                         shouldShowCaseTitle = true;
                    }
                }

                // Helper function for smooth transition
                const updateTitleSmoothly = (newText) => {
                    if (headerTitleSpan.textContent === newText) return;
                    if (headerTitleSpan.dataset.isTransitioning === 'true') return; // Prevent multiple triggers

                    headerTitleSpan.dataset.isTransitioning = 'true';
                    
                    // 1. Exit Animation (Fade Out & Slide Up)
                    headerTitleSpan.classList.add('is-exiting');

                    // Wait for exit animation to finish (300ms)
                    setTimeout(() => {
                        // 2. Change Text
                        headerTitleSpan.textContent = newText;
                        
                        // 3. Prepare Entry (Jump to bottom, Opacity 0)
                        headerTitleSpan.classList.remove('is-exiting');
                        headerTitleSpan.classList.add('is-entering');

                        // Force Reflow to ensure 'is-entering' style is applied before removing it
                        void headerTitleSpan.offsetWidth;

                        // 4. Enter Animation (Fade In & Slide Up to Normal)
                        requestAnimationFrame(() => {
                             headerTitleSpan.classList.remove('is-entering');
                             // The removal triggers transition back to default state (opacity 1, transform 0)
                        });
                        
                        // Reset flag after entry animation completes (another 300ms)
                        setTimeout(() => {
                             headerTitleSpan.dataset.isTransitioning = 'false';
                             // Re-check state in case scroll happened during transition
                             requestAnimationFrame(updateHeader);
                        }, 300);

                    }, 300); 
                };

                if (shouldShowCaseTitle) {
                    updateTitleSmoothly(newHeaderTitle);
                } else {
                    updateTitleSmoothly(originalHeaderTitle);
                }
            }

            lastScrollY = scrollY;
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateHeader);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll);
        // Init state
        updateHeader();
    }
};

// Run immediately to ensure HTML is available for other scripts
HeaderComponent.init();
