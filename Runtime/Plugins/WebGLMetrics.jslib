/**
 * WebGL Performance Metrics Plugin
 * 브라우저 메모리 및 성능 정보 수집
 */

var WebGLMetricsPlugin = {
    /**
     * WebGL 메모리 정보를 JSON으로 반환
     */
    GetWebGLMemoryInfoJSON: function() {
        var memInfo = {
            usedJSHeapSize: 0,
            totalJSHeapSize: 0,
            jsHeapSizeLimit: 0
        };

        // Chrome/Edge에서 사용 가능한 performance.memory API
        if (performance && performance.memory) {
            memInfo.usedJSHeapSize = performance.memory.usedJSHeapSize || 0;
            memInfo.totalJSHeapSize = performance.memory.totalJSHeapSize || 0;
            memInfo.jsHeapSizeLimit = performance.memory.jsHeapSizeLimit || 0;
        }

        var json = JSON.stringify(memInfo);
        var bufferSize = lengthBytesUTF8(json) + 1;
        var buffer = _malloc(bufferSize);
        stringToUTF8(json, buffer, bufferSize);
        return buffer;
    },

    /**
     * 브라우저 정보 가져오기
     */
    GetBrowserInfo: function() {
        var info = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            hardwareConcurrency: navigator.hardwareConcurrency || 0,
            deviceMemory: navigator.deviceMemory || 0, // GB 단위
            connection: {
                effectiveType: '',
                downlink: 0,
                rtt: 0
            }
        };

        // Network Information API
        if (navigator.connection) {
            info.connection.effectiveType = navigator.connection.effectiveType || '';
            info.connection.downlink = navigator.connection.downlink || 0;
            info.connection.rtt = navigator.connection.rtt || 0;
        }

        var json = JSON.stringify(info);
        var bufferSize = lengthBytesUTF8(json) + 1;
        var buffer = _malloc(bufferSize);
        stringToUTF8(json, buffer, bufferSize);
        return buffer;
    },

    /**
     * 현재 성능 메트릭 가져오기
     */
    GetPerformanceMetrics: function() {
        var metrics = {
            fps: 0,
            frameTime: 0,
            totalFrames: 0,
            loadTime: 0,
            uptime: 0
        };

        // 로드 시간
        if (performance && performance.timing) {
            var timing = performance.timing;
            metrics.loadTime = timing.loadEventEnd - timing.navigationStart;
        }

        // 업타임
        if (performance && performance.now) {
            metrics.uptime = performance.now();
        }

        var json = JSON.stringify(metrics);
        var bufferSize = lengthBytesUTF8(json) + 1;
        var buffer = _malloc(bufferSize);
        stringToUTF8(json, buffer, bufferSize);
        return buffer;
    },

    /**
     * 콘솔에 메트릭 로그
     */
    LogMetricsToConsole: function() {
        if (performance && performance.memory) {
            var usedMB = (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2);
            var totalMB = (performance.memory.totalJSHeapSize / (1024 * 1024)).toFixed(2);
            var limitMB = (performance.memory.jsHeapSizeLimit / (1024 * 1024)).toFixed(2);

            console.log('[WebGL Metrics] Memory:', {
                used: usedMB + ' MB',
                total: totalMB + ' MB',
                limit: limitMB + ' MB',
                usage: ((performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100).toFixed(1) + '%'
            });
        }

        if (navigator.deviceMemory) {
            console.log('[WebGL Metrics] Device Memory:', navigator.deviceMemory + ' GB');
        }

        if (navigator.hardwareConcurrency) {
            console.log('[WebGL Metrics] CPU Cores:', navigator.hardwareConcurrency);
        }

        if (navigator.connection) {
            console.log('[WebGL Metrics] Network:', {
                type: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink + ' Mbps',
                rtt: navigator.connection.rtt + ' ms'
            });
        }
    }
};

// Unity에서 사용할 수 있도록 함수들을 전역에 등록
mergeInto(LibraryManager.library, WebGLMetricsPlugin);
