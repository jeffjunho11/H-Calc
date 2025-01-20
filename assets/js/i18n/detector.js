/**
 * Language detector utility for H-Calculator
 * Detects user's preferred language and provides language switching functionality
 */

// Supported languages configuration
const SUPPORTED_LANGUAGES = {
    ar: 'العربية',      // Arabic
    de: 'Deutsch',      // German
    en: 'English',      // English
    es: 'Español',      // Spanish
    fr: 'Français',     // French
    ja: '日本語',       // Japanese
    ko: '한국어',       // Korean
    pt: 'Português',    // Portuguese
    ru: 'Русский',      // Russian
    zh: '中文'          // Chinese
};

// Default language fallback
const DEFAULT_LANGUAGE = 'en';

// Language mapping for similar locales
const LANGUAGE_MAPPING = {
    'en-US': 'en',
    'en-GB': 'en',
    'zh-CN': 'zh',
    'zh-TW': 'zh',
    'zh-HK': 'zh',
    'pt-BR': 'pt',
    'pt-PT': 'pt',
    'es-ES': 'es',
    'es-MX': 'es',
    'fr-FR': 'fr',
    'fr-CA': 'fr',
    'de-DE': 'de',
    'de-AT': 'de',
    'de-CH': 'de',
    'ar-SA': 'ar',
    'ar-AE': 'ar',
    'ja-JP': 'ja',
    'ko-KR': 'ko',
    'ru-RU': 'ru'
};

class LanguageDetector {
    constructor() {
        this.currentLanguage = this.detectLanguage();
    }

    /**
     * Detects the user's preferred language
     * @returns {string} The detected language code
     */
    detectLanguage() {
        // Check localStorage first
        const savedLanguage = localStorage.getItem('h-calculator-language');
        if (savedLanguage && this.isLanguageSupported(savedLanguage)) {
            return savedLanguage;
        }

        // Check navigator languages
        const browserLanguages = this.getBrowserLanguages();
        for (const language of browserLanguages) {
            const mappedLanguage = this.mapLanguage(language);
            if (this.isLanguageSupported(mappedLanguage)) {
                return mappedLanguage;
            }
        }

        // Fallback to default language
        return DEFAULT_LANGUAGE;
    }

    /**
     * Gets browser's language preferences
     * @returns {string[]} Array of language codes
     */
    getBrowserLanguages() {
        return navigator.languages || 
               [navigator.language || 
                navigator.userLanguage || 
                navigator.browserLanguage || 
                navigator.systemLanguage ||
                DEFAULT_LANGUAGE];
    }

    /**
     * Maps a language code to supported language
     * @param {string} language - The language code to map
     * @returns {string} Mapped language code
     */
    mapLanguage(language) {
        const baseLanguage = language.toLowerCase().split('-')[0];
        return LANGUAGE_MAPPING[language] || baseLanguage;
    }

    /**
     * Checks if a language is supported
     * @param {string} language - The language code to check
     * @returns {boolean} Whether the language is supported
     */
    isLanguageSupported(language) {
        return Object.keys(SUPPORTED_LANGUAGES).includes(language);
    }

    /**
     * Sets the current language
     * @param {string} language - The language code to set
     * @returns {boolean} Whether the language was successfully set
     */
    setLanguage(language) {
        if (this.isLanguageSupported(language)) {
            this.currentLanguage = language;
            localStorage.setItem('h-calculator-language', language);
            this.notifyLanguageChange(language);
            return true;
        }
        return false;
    }

    /**
     * Gets the current language
     * @returns {string} The current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Gets all supported languages
     * @returns {Object} Object containing supported languages
     */
    getSupportedLanguages() {
        return SUPPORTED_LANGUAGES;
    }

    /**
     * Notifies language change to all listeners
     * @param {string} language - The new language code
     * @private
     */
    notifyLanguageChange(language) {
        // Create and dispatch a custom event
        const event = new CustomEvent('languageChange', {
            detail: { language },
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    /**
     * Adds a language change listener
     * @param {Function} callback - The callback function
     */
    onLanguageChange(callback) {
        document.addEventListener('languageChange', (event) => {
            callback(event.detail.language);
        });
    }

    /**
     * Gets the display name of a language
     * @param {string} language - The language code
     * @returns {string} The display name of the language
     */
    getLanguageDisplayName(language) {
        return SUPPORTED_LANGUAGES[language] || language;
    }

    /**
     * Gets the text direction for a language
     * @param {string} language - The language code
     * @returns {string} 'rtl' for right-to-left languages, 'ltr' otherwise
     */
    getTextDirection(language) {
        return language === 'ar' ? 'rtl' : 'ltr';
    }
}

// Create and export singleton instance
const languageDetector = new LanguageDetector();
export default languageDetector;