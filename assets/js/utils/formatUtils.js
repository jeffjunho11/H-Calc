/**
 * Formatting Utility Functions for H-Calculator
 */

class FormatUtils {
    /**
     * 화폐 단위 정의
     */
    static CURRENCY_FORMATS = {
        KRW: {
            locale: 'ko-KR',
            currency: 'KRW',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        },
        USD: {
            locale: 'en-US',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        },
        EUR: {
            locale: 'de-DE',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        },
        JPY: {
            locale: 'ja-JP',
            currency: 'JPY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        },
        CNY: {
            locale: 'zh-CN',
            currency: 'CNY',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    };

    /**
     * 화폐 단위 포맷팅
     * @param {number} amount - 금액
     * @param {string} currencyCode - 통화 코드
     * @returns {string} 포맷된 화폐 문자열
     */
    static formatCurrency(amount, currencyCode = 'KRW') {
        const format = this.CURRENCY_FORMATS[currencyCode];
        if (!format) {
            throw new Error(`Unsupported currency code: ${currencyCode}`);
        }

        try {
            return new Intl.NumberFormat(format.locale, {
                style: 'currency',
                currency: format.currency,
                minimumFractionDigits: format.minimumFractionDigits,
                maximumFractionDigits: format.maximumFractionDigits
            }).format(amount);
        } catch (error) {
            console.error('Currency formatting error:', error);
            return `${amount.toLocaleString()} ${currencyCode}`;
        }
    }

    /**
     * 큰 숫자 단위 포맷팅 (예: 1백만, 1천만)
     * @param {number} number - 숫자
     * @param {string} locale - 로케일
     * @returns {string} 포맷된 문자열
     */
    static formatLargeNumber(number, locale = 'ko') {
        const units = {
            ko: [
                { value: 1e12, symbol: '조' },
                { value: 1e8, symbol: '억' },
                { value: 1e4, symbol: '만' }
            ],
            en: [
                { value: 1e12, symbol: 'T' },
                { value: 1e9, symbol: 'B' },
                { value: 1e6, symbol: 'M' },
                { value: 1e3, symbol: 'K' }
            ]
        };

        const localeUnits = units[locale] || units.en;
        
        for (const unit of localeUnits) {
            if (Math.abs(number) >= unit.value) {
                return (number / unit.value).toFixed(1) + unit.symbol;
            }
        }

        return number.toString();
    }

    /**
     * 파일 크기 포맷팅
     * @param {number} bytes - 바이트 크기
     * @returns {string} 포맷된 파일 크기
     */
    static formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }

    /**
     * 시간 포맷팅
     * @param {number} seconds - 초 단위 시간
     * @param {boolean} showSeconds - 초 표시 여부
     * @returns {string} 포맷된 시간 문자열
     */
    static formatDuration(seconds, showSeconds = true) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const parts = [];
        if (hours > 0) parts.push(`${hours}시간`);
        if (minutes > 0) parts.push(`${minutes}분`);
        if (showSeconds && remainingSeconds > 0) parts.push(`${remainingSeconds}초`);

        return parts.join(' ') || '0초';
    }

    /**
     * 전화번호 포맷팅
     * @param {string} phoneNumber - 전화번호
     * @param {string} locale - 로케일
     * @returns {string} 포맷된 전화번호
     */
    static formatPhoneNumber(phoneNumber, locale = 'ko') {
        // 숫자만 추출
        const cleaned = phoneNumber.replace(/\D/g, '');

        const formats = {
            ko: (num) => {
                if (num.length === 11) {
                    return `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7)}`;
                } else if (num.length === 10) {
                    return `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6)}`;
                }
                return num;
            },
            en: (num) => {
                if (num.length === 10) {
                    return `(${num.slice(0, 3)}) ${num.slice(3, 6)}-${num.slice(6)}`;
                }
                return num;
            }
        };

        const formatter = formats[locale] || formats.ko;
        return formatter(cleaned);
    }

    /**
     * 주민등록번호 마스킹
     * @param {string} rrn - 주민등록번호
     * @returns {string} 마스킹된 주민등록번호
     */
    static maskRRN(rrn) {
        const cleaned = rrn.replace(/[^0-9]/g, '');
        if (cleaned.length !== 13) return rrn;
        return cleaned.slice(0, 6) + '-' + '*'.repeat(7);
    }

    /**
     * 이메일 마스킹
     * @param {string} email - 이메일 주소
     * @returns {string} 마스킹된 이메일
     */
    static maskEmail(email) {
        const [username, domain] = email.split('@');
        const maskedUsername = username.slice(0, 3) + '*'.repeat(username.length - 3);
        return `${maskedUsername}@${domain}`;
    }
}

export default FormatUtils;