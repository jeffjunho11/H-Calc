/**
 * Header Component for H-Calculator
 */

class Header {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.init();
    }

    init() {
        this.render();
        this.initEventListeners();
    }

    render() {
        const html = `
            <header class="h-header">
                <div class="h-header-container">
                    <a href="/" class="h-logo">
                        <img src="/assets/images/logo/h-calculator-logo.svg" 
                             alt="H-Calculator" 
                             width="40" 
                             height="40" 
                             class="h-logo-img">
                        <span class="h-logo-text" data-i18n="site.name">H-Calculator</span>
                    </a>

                    <nav class="h-nav">
                        <ul class="h-nav-list">
                            <li>
                                <a href="/life" class="h-nav-link" data-i18n="navigation.life">생활</a>
                            </li>
                            <li>
                                <a href="/health" class="h-nav-link" data-i18n="navigation.health">건강</a>
                            </li>
                            <li>
                                <a href="/finance" class="h-nav-link" data-i18n="navigation.finance">금융</a>
                            </li>
                            <li>
                                <a href="/math" class="h-nav-link" data-i18n="navigation.math">수학</a>
                            </li>
                            <li>
                                <a href="/etc" class="h-nav-link" data-i18n="navigation.etc">기타</a>
                            </li>
                        </ul>
                    </nav>

                    <div class="h-header-actions">
                        <!-- Theme Toggle -->
                        <button class="h-theme-toggle" aria-label="Toggle theme">
                            <svg class="h-icon h-icon-sun">
                                <use xlink:href="/assets/images/icons/sprite.svg#sun"/>
                            </svg>
                            <svg class="h-icon h-icon-moon">
                                <use xlink:href="/assets/images/icons/sprite.svg#moon"/>
                            </svg>
                        </button>

                        <!-- Language Selector -->
                        <div class="h-lang-selector">
                            <button class="h-lang-btn" aria-haspopup="true" aria-expanded="false">
                                <img src="/assets/images/flags/ko.svg" 
                                     alt="" 
                                     class="h-lang-flag"
                                     width="20" 
                                     height="20">
                                <span class="h-lang-name" data-i18n="languages.ko">한국어</span>
                                <svg class="h-icon h-icon-chevron">
                                    <use xlink:href="/assets/images/icons/sprite.svg#chevron-down"/>
                                </svg>
                            </button>

                            <div class="h-lang-dropdown" role="menu"></div>
                        </div>

                        <!-- Mobile Menu Button -->
                        <button class="h-mobile-menu-btn" aria-label="Toggle menu">
                            <span class="h-hamburger"></span>
                        </button>
                    </div>
                </div>

                <!-- Mobile Navigation -->
                <div class="h-mobile-nav">
                    <nav class="h-mobile-nav-content"></nav>
                </div>
            </header>
        `;

        this.container.innerHTML = html;
        this.initializeComponents();
    }

    initializeComponents() {
        // Language selector dropdown content
        this.renderLanguageDropdown();
        
        // Mobile navigation content
        this.renderMobileNav();
        
        // Highlight current page in navigation
        this.highlightCurrentPage();
    }

    renderLanguageDropdown() {
        const dropdown = this.container.querySelector('.h-lang-dropdown');
        const languages = [
            { code: 'ar', name: 'العربية' },
            { code: 'de', name: 'Deutsch' },
            { code: 'en', name: 'English' },
            { code: 'es', name: 'Español' },
            { code: 'fr', name: 'Français' },
            { code: 'ja', name: '日本語' },
            { code: 'ko', name: '한국어' },
            { code: 'pt', name: 'Português' },
            { code: 'ru', name: 'Русский' },
            { code: 'zh', name: '中文' }
        ];

        const html = languages.map(lang => `
            <a href="/${lang.code}${window.location.pathname}" 
               class="h-lang-option" 
               role="menuitem"
               data-lang="${lang.code}">
                <img src="/assets/images/flags/${lang.code}.svg" 
                     alt="" 
                     width="20" 
                     height="20">
                <span data-i18n="languages.${lang.code}">${lang.name}</span>
            </a>
        `).join('');

        dropdown.innerHTML = html;
    }

    renderMobileNav() {
        const mobileNav = this.container.querySelector('.h-mobile-nav-content');
        const mainNav = this.container.querySelector('.h-nav-list');
        mobileNav.innerHTML = mainNav.innerHTML;
    }

    highlightCurrentPage() {
        const currentPath = window.location.pathname;
        const navLinks = this.container.querySelectorAll('.h-nav-link');
        
        navLinks.forEach(link => {
            if (currentPath.startsWith(link.getAttribute('href'))) {
                link.classList.add('active');
            }
        });
    }

    initEventListeners() {
        // Language selector toggle
        const langBtn = this.container.querySelector('.h-lang-btn');
        const langDropdown = this.container.querySelector('.h-lang-dropdown');

        langBtn.addEventListener('click', () => {
            langDropdown.classList.toggle('active');
            langBtn.setAttribute('aria-expanded', 
                langBtn.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
            );
        });

        // Close language dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!langBtn.contains(e.target) && !langDropdown.contains(e.target)) {
                langDropdown.classList.remove('active');
                langBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Mobile menu toggle
        const menuBtn = this.container.querySelector('.h-mobile-menu-btn');
        const mobileNav = this.container.querySelector('.h-mobile-nav');

        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            mobileNav.classList.toggle('active');
        });

        // Theme toggle
        const themeBtn = this.container.querySelector('.h-theme-toggle');
        themeBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark-theme');
        });
    }
}

export default Header;