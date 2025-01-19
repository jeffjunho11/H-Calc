/**
 * Footer Component for H-Calculator
 */

class Footer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.init();
    }

    init() {
        this.render();
        this.updateYear();
    }

    render() {
        const html = `
            <footer class="h-footer">
                <div class="h-footer-container">
                    <div class="h-footer-content">
                        <div class="h-footer-section">
                            <div class="h-footer-logo">
                                <img src="/assets/images/logo/h-calculator-logo.svg" 
                                     alt="H-Calculator" 
                                     width="32" 
                                     height="32">
                                <span class="h-footer-brand">H-Calculator</span>
                            </div>
                            <p class="h-footer-description" data-i18n="footer.description">
                                스마트한 계산의 시작, 당신의 모든 계산을 위한 최적의 솔루션
                            </p>
                        </div>

                        <div class="h-footer-section">
                            <h3 class="h-footer-title" data-i18n="footer.categories">카테고리</h3>
                            <ul class="h-footer-list">
                                <li><a href="/life" data-i18n="navigation.life">생활</a></li>
                                <li><a href="/health" data-i18n="navigation.health">건강</a></li>
                                <li><a href="/finance" data-i18n="navigation.finance">금융</a></li>
                                <li><a href="/math" data-i18n="navigation.math">수학</a></li>
                                <li><a href="/etc" data-i18n="navigation.etc">기타</a></li>
                            </ul>
                        </div>

                        <div class="h-footer-section">
                            <h3 class="h-footer-title" data-i18n="footer.support">지원</h3>
                            <ul class="h-footer-list">
                                <li><a href="/about" data-i18n="footer.about">소개</a></li>
                                <li><a href="/contact" data-i18n="footer.contact">문의하기</a></li>
                                <li><a href="/privacy" data-i18n="footer.privacy">개인정보처리방침</a></li>
                                <li><a href="/terms" data-i18n="footer.terms">이용약관</a></li>
                            </ul>
                        </div>

                        <div class="h-footer-section">
                            <h3 class="h-footer-title" data-i18n="footer.connect">팔로우</h3>
                            <div class="h-social-links">
                                <a href="https://github.com/h-calculator" 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   aria-label="GitHub">
                                    <svg class="h-icon">
                                        <use xlink:href="/assets/images/icons/sprite.svg#github"/>
                                    </svg>
                                </a>
                                <a href="https://twitter.com/h_calculator" 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   aria-label="Twitter">
                                    <svg class="h-icon">
                                        <use xlink:href="/assets/images/icons/sprite.svg#twitter"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div class="h-footer-bottom">
                        <div class="h-footer-lang">
                            <select class="h-lang-select" onchange="window.location.href=this.value">
                                <option value="/ar" data-i18n="languages.ar">العربية</option>
                                <option value="/de" data-i18n="languages.de">Deutsch</option>
                                <option value="/en" data-i18n="languages.en">English</option>
                                <option value="/es" data-i18n="languages.es">Español</option>
                                <option value="/fr" data-i18n="languages.fr">Français</option>
                                <option value="/ja" data-i18n="languages.ja">日本語</option>
                                <option value="/ko" data-i18n="languages.ko">한국어</option>
                                <option value="/pt" data-i18n="languages.pt">Português</option>
                                <option value="/ru" data-i18n="languages.ru">Русский</option>
                                <option value="/zh" data-i18n="languages.zh">中文</option>
                            </select>
                        </div>

                        <div class="h-copyright">
                            <p>© <span id="current-year">2024</span> H-Calculator. 
                               <span data-i18n="footer.rights">All rights reserved.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        `;

        this.container.innerHTML = html;
    }

    updateYear() {
        const yearElement = this.container.querySelector('#current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
}

export default Footer;