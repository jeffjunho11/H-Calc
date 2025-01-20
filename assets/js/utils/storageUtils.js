/**
 * Storage Utility Functions for H-Calculator
 */

class StorageUtils {
    /**
     * 로컬 스토리지 키 접두사
     * @private
     */
    static prefix = 'h_calc_';

    /**
     * 스토리지 유효성 검사
     * @private
     * @returns {boolean} 스토리지 사용 가능 여부
     */
    static isStorageAvailable() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 데이터 저장
     * @param {string} key - 저장 키
     * @param {any} value - 저장할 값
     * @param {Object} options - 저장 옵션
     * @returns {boolean} 저장 성공 여부
     */
    static set(key, value, options = {}) {
        if (!this.isStorageAvailable()) {
            console.warn('Local storage is not available');
            return false;
        }

        const {
            expires = null, // 만료 시간 (밀리초)
            encrypt = false // 암호화 여부
        } = options;

        try {
            const data = {
                value: encrypt ? this.encrypt(JSON.stringify(value)) : value,
                encrypted: encrypt,
                timestamp: Date.now(),
                expires: expires ? Date.now() + expires : null
            };

            localStorage.setItem(this.prefix + key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage save error:', error);
            return false;
        }
    }

    /**
     * 데이터 조회
     * @param {string} key - 조회 키
     * @returns {any} 저장된 값
     */
    static get(key) {
        if (!this.isStorageAvailable()) {
            console.warn('Local storage is not available');
            return null;
        }

        try {
            const data = JSON.parse(localStorage.getItem(this.prefix + key));
            
            if (!data) return null;

            // 만료 체크
            if (data.expires && Date.now() > data.expires) {
                this.remove(key);
                return null;
            }

            // 암호화된 데이터 복호화
            if (data.encrypted) {
                return JSON.parse(this.decrypt(data.value));
            }

            return data.value;
        } catch (error) {
            console.error('Storage read error:', error);
            return null;
        }
    }

    /**
     * 데이터 삭제
     * @param {string} key - 삭제할 키
     * @returns {boolean} 삭제 성공 여부
     */
    static remove(key) {
        if (!this.isStorageAvailable()) return false;

        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }

    /**
     * 모든 데이터 삭제
     * @returns {boolean} 삭제 성공 여부
     */
    static clear() {
        if (!this.isStorageAvailable()) return false;

        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }

    /**
     * 저장소 크기 확인
     * @returns {Object} 저장소 사용 정보
     */
    static getStorageInfo() {
        if (!this.isStorageAvailable()) return null;

        try {
            let totalSize = 0;
            let itemCount = 0;

            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    totalSize += localStorage.getItem(key).length * 2; // UTF-16 문자열
                    itemCount++;
                }
            });

            return {
                totalSize: totalSize,
                formattedSize: this.formatSize(totalSize),
                itemCount: itemCount,
                remainingSpace: this.getRemainingSpace()
            };
        } catch (error) {
            console.error('Storage info error:', error);
            return null;
        }
    }

    /**
     * 남은 저장 공간 계산
     * @private
     * @returns {number} 남은 공간 (바이트)
     */
    static getRemainingSpace() {
        try {
            let total = '';
            const testKey = 'size_test_';
            let i = 0;

            while (true) {
                try {
                    localStorage.setItem(testKey + i, 'X'.repeat(1024 * 1024)); // 1MB씩 테스트
                    total += 'X'.repeat(1024 * 1024);
                    i++;
                } catch (e) {
                    localStorage.removeItem(testKey + i);
                    break;
                }
            }

            // 테스트 데이터 정리
            for (let j = 0; j < i; j++) {
                localStorage.removeItem(testKey + j);
            }

            return total.length;
        } catch (error) {
            console.error('Storage space check error:', error);
            return 0;
        }
    }

    /**
     * 용량 포맷팅
     * @private
     * @param {number} bytes - 바이트 크기
     * @returns {string} 포맷된 크기
     */
    static formatSize(bytes) {
        const units = ['B', 'KB', 'MB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }

    /**
     * 간단한 암호화 (실제 보안이 필요한 경우 더 강력한 암호화 사용 필요)
     * @private
     * @param {string} text - 암호화할 텍스트
     * @returns {string} 암호화된 텍스트
     */
    static encrypt(text) {
        return btoa(text);
    }

    /**
     * 복호화
     * @private
     * @param {string} encoded - 복호화할 텍스트
     * @returns {string} 복호화된 텍스트
     */
    static decrypt(encoded) {
        return atob(encoded);
    }
}

export default StorageUtils;