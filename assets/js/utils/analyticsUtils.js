/**
 * Analytics Utility Functions for H-Calculator
 */

class AnalyticsUtils {
    /**
     * 기본 설정
     */
    static config = {
        enabled: true,
        debugMode: false,
        sessionTimeout: 30 * 60 * 1000, // 30분
        storageKey: 'h_calculator_analytics'
    };

    /**
     * 세션 데이터
     */
    static sessionData = {
        sessionId: null,
        startTime: null,
        lastActivity: null,
        pageViews: 0,
        events: []
    };

    /**
     * 초기화
     */
    static init() {
        if (!this.config.enabled) return;

        // 세션 초기화
        this.initSession();

        // 페이지 뷰 이벤트 등록
        this.trackPageView();

        // 활동 감지
        this.setupActivityTracking();
    }

    /**
     * 세션 초기화
     * @private
     */
    static initSession() {
        const existingSession = this.loadSession();
        const currentTime = Date.now();

        if (existingSession && 
            (currentTime - existingSession.lastActivity) < this.config.sessionTimeout) {
            this.sessionData = existingSession;
            this.sessionData.lastActivity = currentTime;
        } else {
            this.sessionData = {
                sessionId: this.generateSessionId(),
                startTime: currentTime,
                lastActivity: currentTime,
                pageViews: 0,
                events: []
            };
        }

        this.saveSession();
    }

    /**
     * 세션 ID 생성
     * @private
     * @returns {string} 세션 ID
     */
    static generateSessionId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * 페이지 조회 추적
     */
    static trackPageView() {
        if (!this.config.enabled) return;

        this.sessionData.pageViews++;
        this.sessionData.lastActivity = Date.now();

        this.trackEvent('page_view', {
            path: window.location.pathname,
            title: document.title
        });

        this.saveSession();
    }

    /**
     * 이벤트 추적
     * @param {string} eventName - 이벤트 이름
     * @param {Object} eventData - 이벤트 데이터
     */
    static trackEvent(eventName, eventData = {}) {
        if (!this.config.enabled) return;

        const event = {
            name: eventName,
            timestamp: Date.now(),
            data: eventData
        };

        this.sessionData.events.push(event);
        this.sessionData.lastActivity = Date.now();

        if (this.config.debugMode) {
            console.log('Analytics Event:', event);
        }

        this.saveSession();
    }

    /**
     * 계산기 사용 추적
     * @param {string} calculatorId - 계산기 ID
     * @param {Object} inputData - 입력 데이터
     */
    static trackCalculation(calculatorId, inputData) {
        this.trackEvent('calculation', {
            calculatorId,
            inputData,
            timestamp: Date.now()
        });
    }

    /**
     * 에러 추적
     * @param {Error} error - 에러 객체
     * @param {Object} context - 추가 컨텍스트
     */
    static trackError(error, context = {}) {
        this.trackEvent('error', {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: Date.now()
        });
    }

    /**
     * 사용자 활동 감지 설정
     * @private
     */
    static setupActivityTracking() {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        const updateActivity = () => {
            this.sessionData.lastActivity = Date.now();
            this.saveSession();
        };

        events.forEach(eventType => {
            document.addEventListener(eventType, updateActivity, { passive: true });
        });
    }

    /**
     * 세션 저장
     * @private
     */
    static saveSession() {
        try {
            localStorage.setItem(
                this.config.storageKey,
                JSON.stringify(this.sessionData)
            );
        } catch (error) {
            console.error('Failed to save analytics session:', error);
        }
    }

    /**
     * 세션 불러오기
     * @private
     * @returns {Object|null} 세션 데이터
     */
    static loadSession() {
        try {
            const data = localStorage.getItem(this.config.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load analytics session:', error);
            return null;
        }
    }

    /**
     * 통계 데이터 가져오기
     * @returns {Object} 통계 데이터
     */
    static getStatistics() {
        const stats = {
            sessionDuration: Date.now() - this.sessionData.startTime,
            pageViews: this.sessionData.pageViews,
            totalEvents: this.sessionData.events.length,
            eventsByType: {},
            mostUsedCalculators: {},
            averageCalculationTime: 0
        };

        // 이벤트 타입별 집계
        this.sessionData.events.forEach(event => {
            stats.eventsByType[event.name] = (stats.eventsByType[event.name] || 0) + 1;
        });

        // 계산기 사용 통계
        const calculations = this.sessionData.events.filter(e => e.name === 'calculation');
        calculations.forEach(calc => {
            const id = calc.data.calculatorId;
            stats.mostUsedCalculators[id] = (stats.mostUsedCalculators[id] || 0) + 1;
        });

        return stats;
    }

    /**
     * 세션 초기화
     */
    static clearSession() {
        localStorage.removeItem(this.config.storageKey);
        this.initSession();
    }
}

export default AnalyticsUtils;