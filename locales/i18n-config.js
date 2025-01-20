// assets/js/i18n/i18n-config.js

// 지원하는 언어 목록
export const SUPPORTED_LANGUAGES = {
    ko: {
        name: '한국어',
        code: 'ko',
        flag: '🇰🇷'
    },
    en: {
        name: 'English',
        code: 'en',
        flag: '🇺🇸'
    }
};

// 기본 설정
export const DEFAULT_LANGUAGE = 'en';

// 사용자 언어 감지
export function detectUserLanguage() {
    // 1. 저장된 언어 설정 확인
    const savedLang = localStorage.getItem('h-calculator-lang');
    if (savedLang && SUPPORTED_LANGUAGES[savedLang]) {
        console.log('Using saved language:', savedLang);
        return savedLang;
    }

    // 2. 브라우저 언어 설정 확인
    const userLanguages = navigator.languages || [navigator.language || navigator.userLanguage];
    const primaryLanguage = userLanguages[0].split('-')[0];
    
    console.log('Browser language:', primaryLanguage);

    // 3. 지원하는 언어인지 확인
    if (SUPPORTED_LANGUAGES[primaryLanguage]) {
        // 감지된 언어를 저장
        localStorage.setItem('h-calculator-lang', primaryLanguage);
        return primaryLanguage;
    }

    // 4. 지원하지 않는 경우 기본값 사용
    console.log('Using default language:', DEFAULT_LANGUAGE);
    return DEFAULT_LANGUAGE;
}

// i18n 초기화
export async function initializeI18n() {
    const userLang = detectUserLanguage();
    
    try {
        // 번역 파일 로드
        const response = await fetch(`/locales/${userLang}/translation.json`);
        const translations = await response.json();

        // i18n 초기화
        await i18n.init({
            lng: userLang,
            resources: {
                [userLang]: {
                    translation: translations
                }
            },
            fallbackLng: DEFAULT_LANGUAGE
        });

        // 언어 선택기 UI 업데이트
        updateLanguageUI(userLang);

        return userLang;
    } catch (error) {
        console.error('Failed to initialize i18n:', error);
        // 오류 발생 시 기본 언어로 fallback
        return initializeFallbackLanguage();
    }
}

// 언어 변경
export async function changeLanguage(langCode) {
    if (!SUPPORTED_LANGUAGES[langCode]) {
        console.error('Unsupported language:', langCode);
        return false;
    }

    try {
        // 번역 파일 로드
        const response = await fetch(`/locales/${langCode}/translation.json`);
        const translations = await response.json();

        // i18n 언어 변경
        await i18n.changeLanguage(langCode);
        i18n.addResourceBundle(langCode, 'translation', translations);

        // 선택한 언어 저장
        localStorage.setItem('h-calculator-lang', langCode);

        // UI 업데이트
        updateLanguageUI(langCode);

        return true;
    } catch (error) {
        console.error('Failed to change language:', error);
        return false;
    }
}

// UI 업데이트
function updateLanguageUI(langCode) {
    // HTML lang 속성 업데이트
    document.documentElement.lang = langCode;

    // 언어 선택기 업데이트
    const selector = document.getElementById('langSelector');
    if (selector) {
        selector.value = langCode;
    }

    // 페이지의 모든 번역 요소 업데이트
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key.startsWith('[html]')) {
            element.innerHTML = i18n.t(key.substring(6));
        } else {
            element.textContent = i18n.t(key);
        }
    });

    // placeholder 번역 적용
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = i18n.t(key);
    });
}

// 언어 선택기 UI 생성
export function createLanguageSelector() {
    const container = document.createElement('div');
    container.className = 'h-lang-selector';
    
    const select = document.createElement('select');
    select.id = 'langSelector';
    select.className = 'h-input';
    
    Object.entries(SUPPORTED_LANGUAGES).forEach(([code, lang]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${lang.flag} ${lang.name}`;
        select.appendChild(option);
    });
    
    // 현재 언어로 선택 상태 설정
    select.value = detectUserLanguage();
    
    // 언어 변경 이벤트 처리
    select.addEventListener('change', (e) => {
        changeLanguage(e.target.value);
    });
    
    container.appendChild(select);
    return container;
}

// fallback 언어 초기화
async function initializeFallbackLanguage() {
    try {
        const response = await fetch(`/locales/${DEFAULT_LANGUAGE}/translation.json`);
        const translations = await response.json();

        await i18n.init({
            lng: DEFAULT_LANGUAGE,
            resources: {
                [DEFAULT_LANGUAGE]: {
                    translation: translations
                }
            }
        });

        updateLanguageUI(DEFAULT_LANGUAGE);
        return DEFAULT_LANGUAGE;
    } catch (error) {
        console.error('Failed to initialize fallback language:', error);
        return DEFAULT_LANGUAGE;
    }
}