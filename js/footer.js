const FooterComponent = {
    html: `
    <footer class="site-footer">
        <div class="container footer-inner">
            <div class="footer-left">
                <div class="footer-brand">V I N H</div>
                <p class="footer-tagline">Art Director — Visual · Interface · Motion · Identity</p>
            </div>
            <div class="footer-right">
                <nav class="footer-nav">
                    <a href="portfolio.html" class="footer-link">Archive</a>
                    <a href="knowledge-sharing.html" class="footer-link">The Lab</a>
                    <a href="say-hi.html" class="footer-link">Connect</a>
                </nav>
                <div class="footer-contact">
                    <div class="footer-contact-item">
                        <img src="icons/phone.svg" alt="Phone">
                        <a href="tel:+84988641499" class="footer-contact-link">(+84) 988 641 499</a>
                    </div>
                    <div class="footer-contact-item">
                        <img src="icons/mail.svg" alt="Email">
                        <a href="mailto:hello@vinhhk.com" class="footer-contact-link">hello@vinhhk.com</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <div class="container footer-bottom-inner">
                <span class="footer-meta">© ${new Date().getFullYear()} Huynh Khac Vinh. All rights reserved.</span>
                <span class="footer-meta">Original design & layout. Unauthorized copying/commercial use prohibited.</span>
                <span class="footer-meta">Report infringement: <a class="footer-contact-link" href="mailto:hello@vinhhk.com">hello@vinhhk.com</a></span>
                <span class="footer-meta">Based in Ho Chi Minh City, Vietnam</span>
            </div>
        </div>
    </footer>
    `,

    init: function() {
        const existingFooter = document.querySelector('.site-footer');
        if (existingFooter) existingFooter.remove();

        document.body.insertAdjacentHTML('beforeend', this.html);
    }
};

FooterComponent.init();
