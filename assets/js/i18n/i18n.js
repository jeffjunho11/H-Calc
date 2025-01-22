

class I18n {
    constructor() {
        this.defaultLocale = 'en';
        this.supportedLocales = ['ar', 'de', 'en', 'es', 'fr', 'ja', 'ko', 'pt', 'ru', 'zh'];
        this.translations = new Map();
        this.currentLocale = this.defaultLocale;
    }

    async init() {
        // 브라우저 언어 감지
        const browserLang = navigator.language.split('-')[0];
        this.currentLocale = this.supportedLocales.includes(browserLang) 
            ? browserLang 
            : this.defaultLocale;

        // RTL 언어 처리 (아랍어)
        if (this.currentLocale === 'ar') {
            document.dir = 'rtl';
        }

        // 언어 리소스 로드
        await this.loadTranslations(this.currentLocale);
        this.updateContent();
    }

    async loadTranslations(locale) {
        try {
            const [common, calculators] = await Promise.all([
                fetch(`/locales/${locale}/common.json`),
                fetch(`/locales/${locale}/calculators.json`)
            ]);
            
            this.translations.set(locale, {
                common: await common.json(),
                calculators: await calculators.json()
            });
        } catch (error) {
            console.error(`Failed to load translations for ${locale}:`, error);
        }
    }

    setLanguage(locale) {
        if (!this.supportedLocales.includes(locale)) {
            console.error(`Unsupported locale: ${locale}`);
            return;
        }

        this.currentLocale = locale;
        document.documentElement.lang = locale;
        document.dir = locale === 'ar' ? 'rtl' : 'ltr';
        
        this.updateContent();
        this.updateURL(locale);
    }

    updateURL(locale) {
        const currentPath = window.location.pathname.split('/').slice(2).join('/');
        const newPath = `/${locale}/${currentPath}`;
        window.history.pushState({}, '', newPath);
    }

    updateContent() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        // placeholder 등 속성 업데이트
        document.querySelectorAll('[data-i18n-attr]').forEach(element => {
            const attrs = JSON.parse(element.getAttribute('data-i18n-attr'));
            Object.entries(attrs).forEach(([attr, key]) => {
                element.setAttribute(attr, this.t(key));
            });
        });
    }

    t(key) {
        const translation = this.translations.get(this.currentLocale);
        return key.split('.').reduce((obj, i) => obj?.[i], translation) || key;
    }
}