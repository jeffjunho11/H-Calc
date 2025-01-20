/**
 * Network Utility Functions for H-Calculator
 */

class NetworkUtils {
    /**
     * 기본 설정
     */
    static defaultOptions = {
        timeout: 30000, // 30초
        retries: 3,
        retryDelay: 1000,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    /**
     * HTTP 요청 전송
     * @param {string} url - 요청 URL
     * @param {Object} options - 요청 옵션
     * @returns {Promise} 응답 Promise
     */
    static async request(url, options = {}) {
        const finalOptions = {
            ...this.defaultOptions,
            ...options,
            headers: {
                ...this.defaultOptions.headers,
                ...options.headers
            }
        };

        let lastError;
        for (let attempt = 0; attempt < finalOptions.retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout);

                const response = await fetch(url, {
                    ...finalOptions,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                lastError = error;
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout');
                }
                if (attempt < finalOptions.retries - 1) {
                    await this.delay(finalOptions.retryDelay);
                }
            }
        }

        throw lastError;
    }

    /**
     * GET 요청
     * @param {string} url - 요청 URL
     * @param {Object} options - 요청 옵션
     * @returns {Promise} 응답 Promise
     */
    static async get(url, options = {}) {
        return this.request(url, {
            ...options,
            method: 'GET'
        });
    }

    /**
     * POST 요청
     * @param {string} url - 요청 URL
     * @param {Object} data - 요청 데이터
     * @param {Object} options - 요청 옵션
     * @returns {Promise} 응답 Promise
     */
    static async post(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT 요청
     * @param {string} url - 요청 URL
     * @param {Object} data - 요청 데이터
     * @param {Object} options - 요청 옵션
     * @returns {Promise} 응답 Promise
     */
    static async put(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE 요청
     * @param {string} url - 요청 URL
     * @param {Object} options - 요청 옵션
     * @returns {Promise} 응답 Promise
     */
    static async delete(url, options = {}) {
        return this.request(url, {
            ...options,
            method: 'DELETE'
        });
    }

    /**
     * 지연 함수
     * @private
     * @param {number} ms - 지연 시간 (ms)
     * @returns {Promise} 지연 Promise
     */
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 온라인 상태 체크
     * @returns {boolean} 온라인 상태 여부
     */
    static isOnline() {
        return navigator.onLine;
    }

    /**
     * 네트워크 상태 모니터링
     * @param {Function} onOnline - 온라인 시 콜백
     * @param {Function} onOffline - 오프라인 시 콜백
     * @returns {Object} 이벤트 리스너 제거 함수
     */
    static monitorNetworkStatus(onOnline, onOffline) {
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);

        return {
            remove: () => {
                window.removeEventListener('online', onOnline);
                window.removeEventListener('offline', onOffline);
            }
        };
    }

    /**
     * 네트워크 속도 측정
     * @returns {Promise<number>} 다운로드 속도 (Mbps)
     */
    static async measureNetworkSpeed() {
        const startTime = performance.now();
        const response = await fetch('https://www.google.com/favicon.ico');
        const endTime = performance.now();
        const duration = (endTime - startTime) / 1000; // 초 단위

        const size = (await response.blob()).size;
        const speedBps = (size * 8) / duration;
        const speedMbps = speedBps / 1000000;

        return speedMbps;
    }

    /**
     * URL 파라미터 생성
     * @param {Object} params - 파라미터 객체
     * @returns {string} URL 파라미터 문자열
     */
    static buildQueryString(params) {
        return Object.entries(params)
            .filter(([_, value]) => value !== null && value !== undefined)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
    }

    /**
     * URL 파라미터 파싱
     * @param {string} url - URL 문자열
     * @returns {Object} 파싱된 파라미터 객체
     */
    static parseQueryString(url) {
        const params = {};
        const searchParams = new URLSearchParams(new URL(url).search);
        for (const [key, value] of searchParams) {
            params[key] = value;
        }
        return params;
    }
}

export default NetworkUtils;