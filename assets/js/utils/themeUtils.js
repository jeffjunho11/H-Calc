/**
 * Theme Utility Functions for H-Calculator
 */

class ThemeUtils {
    /**
     * 테마 설정
     */
    static themes = {
        light: {
            id: 'light',
            name: '라이트 모드',
            colors: {
                primary: '#2E5CFF',
                primaryLight: '#E6ECFF',
                primaryDark: '#1E3DB7',
                background: '#F8F9FC',
                surface: '#FFFFFF',
                text: '#1A1A1A',
                textSecondary: '#666666',
                border: '#E6E6E6'
            }
        },
        dark: {
            id: 'dark',
            name: '다크 모드',
            colors: {
                primary: '#4B7BFF',
                primaryLight: '#1E3DB7',
                primaryDark: '#E6ECFF',
                background: '#121212',
                surface: '#1E1E1E',
                text: '#FFFFFF',
                textSecondary: '#B3B3B3',
                border: '#333333'
            }
        }
    };

    /**
     * 현재 테마
     * @private
     */
    static currentTheme = null;

    /**
     * 초기화
     */
    static init() {
        this.loadTheme();
        this.setupThemeDetection();
        this.applyTheme(this.currentTheme);
    }

    /**
     * 테마 로드
     * @private
     */
    static loadTheme() {
        // 저장된 테마 확인
        const savedTheme = localStorage.getItem('h_calculator_theme');
        if (savedTheme && this.themes[savedTheme]) {
            this.currentTheme = savedTheme;
            return;
        }

        // 시스템 테마 확인
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.currentTheme = 'dark';
        } else {
            this.currentTheme = 'light';
        }
    }

    /**
     * 시스템 테마 변경 감지
     * @private
     */
    static setupThemeDetection() {
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', e => {
                // 사용자가 수동으로 테마를 설정하지 않은 경우에만 적용
                if (!localStorage.getItem('h_calculator_theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
    }

    /**
     * 테마 적용
     * @param {string} themeId - 테마 ID
     */
    static applyTheme(themeId) {
        const theme = this.themes[themeId];
        if (!theme) return;

        // CSS 변수 적용
        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--h-${key}`, value);
        });

        // data-theme 속성 설정
        root.setAttribute('data-theme', themeId);

        // 메타 태그 업데이트
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme.colors.background);
        }

        // 테마 변경 이벤트 발생
        this.dispatchThemeChangeEvent(themeId);
    }

    /**
     * 테마 설정
     * @param {string} themeId - 테마 ID
     */
    static setTheme(themeId) {
        if (!this.themes[themeId]) return;

        this.currentTheme = themeId;
        localStorage.setItem('h_calculator_theme', themeId);
        this.applyTheme(themeId);
    }

    /**
     * 테마 토글
     */
    static toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    /**
     * 현재 테마 가져오기
     * @returns {string} 현재 테마 ID
     */
    static getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * 테마 변경 이벤트 발생
     * @private
     * @param {string} themeId - 테마 ID
     */
    static dispatchThemeChangeEvent(themeId) {
        const event = new CustomEvent('themechange', {
            detail: {
                theme: themeId,
                colors: this.themes[themeId].colors
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * 테마 변경 이벤트 리스너 등록
     * @param {Function} callback - 콜백 함수
     */
    static onThemeChange(callback) {
        document.addEventListener('themechange', callback);
    }

    /**
     * 사용자 정의 테마 추가
     * @param {string} id - 테마 ID
     * @param {Object} theme - 테마 설정
     */
    static addCustomTheme(id, theme) {
        if (this.themes[id]) {
            console.warn(`Theme '${id}' already exists.`);
            return;
        }

        this.themes[id] = {
            id,
            name: theme.name || id,
            colors: {
                ...this.themes.light.colors,
                ...theme.colors
            }
        };
    }
}

export default ThemeUtils;