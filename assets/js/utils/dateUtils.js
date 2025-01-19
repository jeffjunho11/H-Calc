/**
 * Date Utility Functions for H-Calculator
 */

class DateUtils {
    /**
     * 공휴일 데이터
     * @type {Object<string, Array<Object>>}
     */
    static holidays = {
        'ko': [
            { month: 1, day: 1, name: '신정' },
            { month: 3, day: 1, name: '삼일절' },
            { month: 5, day: 5, name: '어린이날' },
            { month: 6, day: 6, name: '현충일' },
            { month: 8, day: 15, name: '광복절' },
            { month: 10, day: 3, name: '개천절' },
            { month: 10, day: 9, name: '한글날' },
            { month: 12, day: 25, name: '성탄절' }
        ]
    };

    /**
     * 날짜 포맷팅
     * @param {Date} date - 날짜 객체
     * @param {string} format - 포맷 문자열
     * @param {string} locale - 로케일
     * @returns {string} 포맷된 날짜 문자열
     */
    static formatDate(date, format = 'YYYY-MM-DD', locale = 'ko') {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('YY', String(year).slice(-2))
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }

    /**
     * 두 날짜 간의 차이 계산
     * @param {Date} date1 - 첫 번째 날짜
     * @param {Date} date2 - 두 번째 날짜
     * @param {string} unit - 반환 단위 ('days', 'months', 'years')
     * @returns {number} 날짜 차이
     */
    static dateDiff(date1, date2, unit = 'days') {
        const diffTime = Math.abs(date2 - date1);
        switch (unit) {
            case 'days':
                return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            case 'months':
                return (
                    (date2.getFullYear() - date1.getFullYear()) * 12 +
                    date2.getMonth() - date1.getMonth()
                );
            case 'years':
                return date2.getFullYear() - date1.getFullYear();
            default:
                throw new Error('Invalid unit for date difference calculation');
        }
    }

    /**
     * 날짜 더하기
     * @param {Date} date - 기준 날짜
     * @param {number} amount - 더할 값
     * @param {string} unit - 단위 ('days', 'months', 'years')
     * @returns {Date} 계산된 새 날짜
     */
    static addToDate(date, amount, unit = 'days') {
        const newDate = new Date(date);
        switch (unit) {
            case 'days':
                newDate.setDate(newDate.getDate() + amount);
                break;
            case 'months':
                newDate.setMonth(newDate.getMonth() + amount);
                break;
            case 'years':
                newDate.setFullYear(newDate.getFullYear() + amount);
                break;
            default:
                throw new Error('Invalid unit for date addition');
        }
        return newDate;
    }

    /**
     * 영업일 계산
     * @param {Date} startDate - 시작일
     * @param {Date} endDate - 종료일
     * @param {string} locale - 로케일
     * @returns {number} 영업일수
     */
    static getBusinessDays(startDate, endDate, locale = 'ko') {
        let count = 0;
        const currentDate = new Date(startDate);
        const end = new Date(endDate);

        while (currentDate <= end) {
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6 && !this.isHoliday(currentDate, locale)) {
                count++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return count;
    }

    /**
     * 공휴일 여부 확인
     * @param {Date} date - 확인할 날짜
     * @param {string} locale - 로케일
     * @returns {boolean} 공휴일 여부
     */
    static isHoliday(date, locale = 'ko') {
        const month = date.getMonth() + 1;
        const day = date.getDate();

        return this.holidays[locale]?.some(
            holiday => holiday.month === month && holiday.day === day
        ) || false;
    }

    /**
     * 만 나이 계산
     * @param {Date} birthDate - 생년월일
     * @param {Date} baseDate - 기준일 (기본값: 현재)
     * @returns {number} 만 나이
     */
    static getKoreanAge(birthDate, baseDate = new Date()) {
        let age = baseDate.getFullYear() - birthDate.getFullYear();
        const monthDiff = baseDate.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && baseDate.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    /**
     * D-day 계산
     * @param {Date} targetDate - 목표 날짜
     * @returns {number} D-day (음수: 남은 일수, 양수: 지난 일수)
     */
    static getDDay(targetDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);
        
        const diffTime = today - targetDate;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}

export default DateUtils;