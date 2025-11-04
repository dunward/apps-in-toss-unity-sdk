/**
 * HTML Debug Console for WebGL
 * 브라우저 DOM에 실제 div로 디버그 콘솔 표시
 */

var DebugConsolePlugin = {
    $DebugConsoleState: {
        isInitialized: false,
        consoleElement: null,
        metricsElement: null,
        logsElement: null,
        maxLogs: 30,
        isVisible: true
    },

    /**
     * 디버그 콘솔 초기화
     */
    InitDebugConsole: function() {
        if (DebugConsoleState.isInitialized) {
            return;
        }

        console.log('[Debug Console] Initializing HTML debug console...');

        // CSS 스타일 추가
        var style = document.createElement('style');
        var cssText = '';
        cssText += '#unity-debug-console {';
        cssText += 'position: fixed;';
        cssText += 'top: 0;';
        cssText += 'left: 0;';
        cssText += 'width: 100%;';
        cssText += 'height: 40%;';
        cssText += 'background: rgba(0, 0, 0, 0.9);';
        cssText += 'color: white;';
        cssText += 'font-family: "Courier New", monospace;';
        cssText += 'font-size: 12px;';
        cssText += 'z-index: 99999;';
        cssText += 'display: flex;';
        cssText += 'flex-direction: column;';
        cssText += 'pointer-events: auto;';
        cssText += 'overflow: hidden;';
        cssText += '}';

        cssText += '#unity-debug-console.hidden {';
        cssText += 'display: none;';
        cssText += '}';

        cssText += '#unity-debug-console-header {';
        cssText += 'background: rgba(50, 50, 50, 0.95);';
        cssText += 'padding: 8px 12px;';
        cssText += 'border-bottom: 1px solid #555;';
        cssText += 'display: flex;';
        cssText += 'justify-content: space-between;';
        cssText += 'align-items: center;';
        cssText += '}';

        cssText += '#unity-debug-console-title {';
        cssText += 'font-weight: bold;';
        cssText += 'color: #00ff00;';
        cssText += '}';

        cssText += '#unity-debug-console-controls {';
        cssText += 'display: flex;';
        cssText += 'gap: 10px;';
        cssText += '}';

        cssText += '#unity-debug-console-controls button {';
        cssText += 'background: #444;';
        cssText += 'border: 1px solid #666;';
        cssText += 'color: white;';
        cssText += 'padding: 4px 12px;';
        cssText += 'cursor: pointer;';
        cssText += 'border-radius: 3px;';
        cssText += 'font-size: 11px;';
        cssText += '}';

        cssText += '#unity-debug-console-controls button:hover {';
        cssText += 'background: #555;';
        cssText += '}';

        cssText += '#unity-debug-console-metrics {';
        cssText += 'background: rgba(30, 30, 30, 0.95);';
        cssText += 'padding: 8px 12px;';
        cssText += 'border-bottom: 1px solid #444;';
        cssText += 'line-height: 1.6;';
        cssText += '}';

        cssText += '#unity-debug-console-metrics .metric {';
        cssText += 'color: #00ff88;';
        cssText += 'margin-right: 20px;';
        cssText += 'display: inline-block;';
        cssText += '}';

        cssText += '#unity-debug-console-logs {';
        cssText += 'flex: 1;';
        cssText += 'overflow-y: auto;';
        cssText += 'padding: 8px 12px;';
        cssText += '}';

        cssText += '#unity-debug-console-logs::-webkit-scrollbar {';
        cssText += 'width: 8px;';
        cssText += '}';

        cssText += '#unity-debug-console-logs::-webkit-scrollbar-track {';
        cssText += 'background: #222;';
        cssText += '}';

        cssText += '#unity-debug-console-logs::-webkit-scrollbar-thumb {';
        cssText += 'background: #555;';
        cssText += 'border-radius: 4px;';
        cssText += '}';

        cssText += '.debug-log-entry {';
        cssText += 'padding: 3px 0;';
        cssText += 'border-bottom: 1px solid #333;';
        cssText += '}';

        cssText += '.debug-log-entry.log {';
        cssText += 'color: #fff;';
        cssText += '}';

        cssText += '.debug-log-entry.warning {';
        cssText += 'color: #ffcc00;';
        cssText += '}';

        cssText += '.debug-log-entry.error {';
        cssText += 'color: #ff4444;';
        cssText += 'font-weight: bold;';
        cssText += '}';

        cssText += '.debug-log-timestamp {';
        cssText += 'color: #888;';
        cssText += 'margin-right: 8px;';
        cssText += '}';

        style.textContent = cssText;
        document.head.appendChild(style);

        // 콘솔 컨테이너 생성
        var consoleDiv = document.createElement('div');
        consoleDiv.id = 'unity-debug-console';

        // 헤더
        var header = document.createElement('div');
        header.id = 'unity-debug-console-header';
        var headerHTML = '';
        headerHTML += '<div id="unity-debug-console-title">🎮 Unity Debug Console (Press ` to toggle)</div>';
        headerHTML += '<div id="unity-debug-console-controls">';
        headerHTML += '<button onclick="window.DebugConsole_Copy()">📋 Copy Logs</button>';
        headerHTML += '<button onclick="window.DebugConsole_Clear()">Clear</button>';
        headerHTML += '<button onclick="window.DebugConsole_Toggle()">Hide</button>';
        headerHTML += '</div>';
        header.innerHTML = headerHTML;

        // 메트릭
        var metrics = document.createElement('div');
        metrics.id = 'unity-debug-console-metrics';
        metrics.innerHTML = '<div class="metric">Initializing...</div>';

        // 로그
        var logs = document.createElement('div');
        logs.id = 'unity-debug-console-logs';

        consoleDiv.appendChild(header);
        consoleDiv.appendChild(metrics);
        consoleDiv.appendChild(logs);
        document.body.appendChild(consoleDiv);

        DebugConsoleState.consoleElement = consoleDiv;
        DebugConsoleState.metricsElement = metrics;
        DebugConsoleState.logsElement = logs;
        DebugConsoleState.isInitialized = true;

        // 전역 함수 등록
        window.DebugConsole_Copy = function() {
            var logs = DebugConsoleState.logsElement.innerText;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(logs).then(function() {
                    console.log('[Debug Console] Logs copied to clipboard');
                    alert('📋 로그가 클립보드에 복사되었습니다!');
                }).catch(function(err) {
                    console.error('[Debug Console] Failed to copy:', err);
                    alert('복사 실패: ' + err.message);
                });
            } else {
                // Fallback for older browsers
                var textArea = document.createElement('textarea');
                textArea.value = logs;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    console.log('[Debug Console] Logs copied (fallback)');
                    alert('📋 로그가 클립보드에 복사되었습니다!');
                } catch (err) {
                    console.error('[Debug Console] Failed to copy:', err);
                    alert('복사 실패: ' + err.message);
                }
                document.body.removeChild(textArea);
            }
        };

        window.DebugConsole_Clear = function() {
            DebugConsoleState.logsElement.innerHTML = '';
        };

        window.DebugConsole_Toggle = function() {
            if (DebugConsoleState.isVisible) {
                DebugConsoleState.consoleElement.classList.add('hidden');
                DebugConsoleState.isVisible = false;
            } else {
                DebugConsoleState.consoleElement.classList.remove('hidden');
                DebugConsoleState.isVisible = true;
            }
        };

        // 키보드 단축키 (백틱)
        document.addEventListener('keydown', function(e) {
            if (e.key === '`' || e.keyCode === 192) {
                window.DebugConsole_Toggle();
                e.preventDefault();
            }
        });

        console.log('[Debug Console] ✓ HTML debug console initialized');
    },

    /**
     * 로그 추가
     */
    AddDebugLog: function(messagePtr, typePtr) {
        if (!DebugConsoleState.isInitialized) {
            return;
        }

        var message = UTF8ToString(messagePtr);
        var type = UTF8ToString(typePtr); // "log", "warning", "error"

        var now = new Date();
        var timestamp = now.getHours().toString().padStart(2, '0') + ':' +
                       now.getMinutes().toString().padStart(2, '0') + ':' +
                       now.getSeconds().toString().padStart(2, '0');

        var entry = document.createElement('div');
        entry.className = 'debug-log-entry ' + type;
        entry.innerHTML = '<span class="debug-log-timestamp">[' + timestamp + ']</span>' +
                         '<span class="debug-log-message">' + message + '</span>';

        DebugConsoleState.logsElement.appendChild(entry);

        // 최대 로그 수 유지
        var logs = DebugConsoleState.logsElement.children;
        if (logs.length > DebugConsoleState.maxLogs) {
            DebugConsoleState.logsElement.removeChild(logs[0]);
        }

        // 자동 스크롤
        DebugConsoleState.logsElement.scrollTop = DebugConsoleState.logsElement.scrollHeight;
    },

    /**
     * 메트릭 업데이트
     */
    UpdateDebugMetrics: function(fpsPtr, memoryUsedPtr, memoryTotalPtr, resolutionPtr) {
        if (!DebugConsoleState.isInitialized) {
            return;
        }

        var fps = UTF8ToString(fpsPtr);
        var memoryUsed = UTF8ToString(memoryUsedPtr);
        var memoryTotal = UTF8ToString(memoryTotalPtr);
        var resolution = UTF8ToString(resolutionPtr);

        var html = '';
        html += '<span class="metric">FPS: ' + fps + '</span>';
        html += '<span class="metric">Memory: ' + memoryUsed + ' / ' + memoryTotal + ' MB</span>';
        html += '<span class="metric">Resolution: ' + resolution + '</span>';

        // 브라우저 정보
        if (performance && performance.memory) {
            var heapUsed = (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1);
            var heapTotal = (performance.memory.totalJSHeapSize / (1024 * 1024)).toFixed(1);
            html += '<span class="metric">JS Heap: ' + heapUsed + ' / ' + heapTotal + ' MB</span>';
        }

        if (navigator.deviceMemory) {
            html += '<span class="metric">Device Memory: ' + navigator.deviceMemory + ' GB</span>';
        }

        if (navigator.hardwareConcurrency) {
            html += '<span class="metric">CPU Cores: ' + navigator.hardwareConcurrency + '</span>';
        }

        DebugConsoleState.metricsElement.innerHTML = html;
    },

    /**
     * 콘솔 표시/숨김
     */
    SetDebugConsoleVisible: function(visible) {
        if (!DebugConsoleState.isInitialized) {
            return;
        }

        if (visible) {
            DebugConsoleState.consoleElement.classList.remove('hidden');
            DebugConsoleState.isVisible = true;
        } else {
            DebugConsoleState.consoleElement.classList.add('hidden');
            DebugConsoleState.isVisible = false;
        }
    },

    /**
     * 콘솔 초기화
     */
    ClearDebugConsole: function() {
        if (!DebugConsoleState.isInitialized) {
            return;
        }

        DebugConsoleState.logsElement.innerHTML = '';
    }
};

// Unity에서 사용할 수 있도록 함수들을 전역에 등록
autoAddDeps(DebugConsolePlugin, '$DebugConsoleState');
mergeInto(LibraryManager.library, DebugConsolePlugin);
