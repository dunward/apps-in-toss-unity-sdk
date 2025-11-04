/**
 * Apps in Toss Core Plugin for Unity WebGL
 * 핵심 SDK 기능 (인증, 스토리지, 공유, UI 등)
 */

var AppsInTossCorePlugin = {
    // 초기화
    aitInit: function(gameObjectPtr, callbackPtr) {
        var gameObject = UTF8ToString(gameObjectPtr);
        var callback = UTF8ToString(callbackPtr);

        console.log('[AIT Core] Initializing SDK...', { gameObject, callback });

        // SDK 초기화 완료 후 콜백 호출
        if (typeof SendMessage !== 'undefined' && callback) {
            var result = JSON.stringify({
                success: true,
                message: 'SDK initialized',
                sdkVersion: '1.0.0',
                platformVersion: '1.0.0'
            });

            SendMessage(gameObject, 'OnAITCallback', JSON.stringify({
                callbackName: callback,
                result: result
            }));
        }
    },

    // 로그인
    aitLogin: function(optionsPtr) {
        var optionsStr = UTF8ToString(optionsPtr);
        console.log('[AIT Core] Login requested:', optionsStr);

        try {
            var options = JSON.parse(optionsStr);
            var gameObject = options.gameObject;
            var successCallback = options.successCallback;

            // 모의 로그인 성공
            if (typeof SendMessage !== 'undefined' && gameObject && successCallback) {
                var result = JSON.stringify({
                    success: true,
                    userId: 'user_' + Date.now(),
                    nickname: 'Test User',
                    email: 'test@appsintoss.com'
                });

                SendMessage(gameObject, 'OnAITCallback', JSON.stringify({
                    callbackName: successCallback,
                    result: result
                }));
            }
        } catch (e) {
            console.error('[AIT Core] Login error:', e);
        }
    },

    // 로그아웃
    aitLogout: function(gameObjectPtr, callbackPtr) {
        var gameObject = UTF8ToString(gameObjectPtr);
        var callback = UTF8ToString(callbackPtr);

        console.log('[AIT Core] Logout requested');

        if (typeof SendMessage !== 'undefined' && callback) {
            var result = JSON.stringify({
                success: true,
                message: 'Logged out successfully'
            });

            SendMessage(gameObject, 'OnAITCallback', JSON.stringify({
                callbackName: callback,
                result: result
            }));
        }
    },

    // 사용자 정보 가져오기
    aitGetUserInfo: function(gameObjectPtr, callbackPtr) {
        var gameObject = UTF8ToString(gameObjectPtr);
        var callback = UTF8ToString(callbackPtr);

        console.log('[AIT Core] Getting user info...');

        if (typeof SendMessage !== 'undefined' && callback) {
            var result = JSON.stringify({
                success: true,
                userId: 'user_123',
                nickname: 'Test User',
                email: 'test@appsintoss.com'
            });

            SendMessage(gameObject, 'OnAITCallback', JSON.stringify({
                callbackName: callback,
                result: result
            }));
        }
    },

    // 스토리지: 데이터 저장
    aitSetStorageData: function(keyPtr, valuePtr, gameObjectPtr, callbackPtr) {
        var key = UTF8ToString(keyPtr);
        var value = UTF8ToString(valuePtr);
        var gameObject = UTF8ToString(gameObjectPtr);
        var callback = UTF8ToString(callbackPtr);

        console.log('[AIT Core] Setting storage data:', key);

        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem('ait_' + key, value);

                if (typeof SendMessage !== 'undefined' && callback) {
                    var result = JSON.stringify({
                        success: true,
                        message: 'Data saved'
                    });

                    SendMessage(gameObject, 'OnAITCallback', JSON.stringify({
                        callbackName: callback,
                        result: result
                    }));
                }
            } catch (e) {
                console.error('[AIT Core] Storage set error:', e);
            }
        }
    },

    // 스토리지: 데이터 가져오기
    aitGetStorageData: function(keyPtr, gameObjectPtr, callbackPtr) {
        var key = UTF8ToString(keyPtr);
        var gameObject = UTF8ToString(gameObjectPtr);
        var callback = UTF8ToString(callbackPtr);

        console.log('[AIT Core] Getting storage data:', key);

        if (typeof localStorage !== 'undefined') {
            try {
                var value = localStorage.getItem('ait_' + key) || '';

                if (typeof SendMessage !== 'undefined' && callback) {
                    var result = JSON.stringify({
                        success: true,
                        key: key,
                        value: value
                    });

                    SendMessage(gameObject, 'OnAITCallback', JSON.stringify({
                        callbackName: callback,
                        result: result
                    }));
                }
            } catch (e) {
                console.error('[AIT Core] Storage get error:', e);
            }
        }
    },

    // 스토리지: 데이터 삭제
    aitRemoveStorageData: function(keyPtr, gameObjectPtr, callbackPtr) {
        var key = UTF8ToString(keyPtr);
        var gameObject = UTF8ToString(gameObjectPtr);
        var callback = UTF8ToString(callbackPtr);

        console.log('[AIT Core] Removing storage data:', key);

        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.removeItem('ait_' + key);

                if (typeof SendMessage !== 'undefined' && callback) {
                    var result = JSON.stringify({
                        success: true,
                        message: 'Data removed'
                    });

                    SendMessage(gameObject, 'OnAITCallback', JSON.stringify({
                        callbackName: callback,
                        result: result
                    }));
                }
            } catch (e) {
                console.error('[AIT Core] Storage remove error:', e);
            }
        }
    },

    // 텍스트 공유
    aitShareText: function(optionsPtr) {
        var optionsStr = UTF8ToString(optionsPtr);
        console.log('[AIT Core] Share text:', optionsStr);

        try {
            var options = JSON.parse(optionsStr);

            if (typeof navigator !== 'undefined' && navigator.share) {
                navigator.share({
                    title: options.title || '',
                    text: options.text || ''
                }).then(function() {
                    console.log('[AIT Core] Share successful');
                }).catch(function(error) {
                    console.log('[AIT Core] Share failed:', error);
                });
            } else {
                console.log('[AIT Core] Share API not available');
            }
        } catch (e) {
            console.error('[AIT Core] Share text error:', e);
        }
    },

    // 링크 공유
    aitShareLink: function(optionsPtr) {
        var optionsStr = UTF8ToString(optionsPtr);
        console.log('[AIT Core] Share link:', optionsStr);

        try {
            var options = JSON.parse(optionsStr);

            if (typeof navigator !== 'undefined' && navigator.share) {
                navigator.share({
                    title: options.title || '',
                    text: options.description || '',
                    url: options.url || ''
                }).then(function() {
                    console.log('[AIT Core] Share successful');
                }).catch(function(error) {
                    console.log('[AIT Core] Share failed:', error);
                });
            }
        } catch (e) {
            console.error('[AIT Core] Share link error:', e);
        }
    },

    // 이미지 공유
    aitShareImage: function(optionsPtr) {
        var optionsStr = UTF8ToString(optionsPtr);
        console.log('[AIT Core] Share image:', optionsStr);
        // 이미지 공유 구현
    },

    // 진동
    aitVibrate: function(type) {
        console.log('[AIT Core] Vibrate:', type);

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            var duration = type === 0 ? 10 : type === 1 ? 50 : 100;
            navigator.vibrate(duration);
        }
    },

    // 토스트 메시지
    aitShowToast: function(optionsPtr) {
        var optionsStr = UTF8ToString(optionsPtr);
        console.log('[AIT Core] Show toast:', optionsStr);

        try {
            var options = JSON.parse(optionsStr);
            console.log('[Toast]', options.message);
        } catch (e) {
            console.error('[AIT Core] Toast error:', e);
        }
    },

    // 다이얼로그
    aitShowDialog: function(optionsPtr) {
        var optionsStr = UTF8ToString(optionsPtr);
        console.log('[AIT Core] Show dialog:', optionsStr);

        try {
            var options = JSON.parse(optionsStr);

            if (typeof window !== 'undefined' && window.confirm) {
                var result = window.confirm(options.title + '\n' + options.message);

                if (typeof SendMessage !== 'undefined' && options.gameObject) {
                    var callback = result ? options.confirmCallback : options.cancelCallback;
                    if (callback) {
                        SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                            callbackName: callback,
                            result: '{}'
                        }));
                    }
                }
            }
        } catch (e) {
            console.error('[AIT Core] Dialog error:', e);
        }
    },

    // 네트워크 타입
    aitGetNetworkType: function(gameObjectPtr, callbackPtr) {
        var gameObject = UTF8ToString(gameObjectPtr);
        var callback = UTF8ToString(callbackPtr);

        console.log('[AIT Core] Getting network type...');

        if (typeof SendMessage !== 'undefined' && callback) {
            var result = JSON.stringify({
                success: true,
                networkType: 2, // Wifi
                isConnected: true
            });

            SendMessage(gameObject, 'OnAITCallback', JSON.stringify({
                callbackName: callback,
                result: result
            }));
        }
    },

    // 디바이스 정보
    aitGetDeviceInfo: function(gameObjectPtr, callbackPtr) {
        var gameObject = UTF8ToString(gameObjectPtr);
        var callback = UTF8ToString(callbackPtr);

        console.log('[AIT Core] Getting device info...');

        if (typeof SendMessage !== 'undefined' && callback) {
            var result = JSON.stringify({
                success: true,
                model: 'WebGL',
                brand: 'Browser',
                system: typeof navigator !== 'undefined' ? navigator.platform : 'Unknown',
                version: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
                platform: 'web',
                language: typeof navigator !== 'undefined' ? navigator.language : 'en',
                screenWidth: typeof screen !== 'undefined' ? screen.width : 1920,
                screenHeight: typeof screen !== 'undefined' ? screen.height : 1080,
                pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1
            });

            SendMessage(gameObject, 'OnAITCallback', JSON.stringify({
                callbackName: callback,
                result: result
            }));
        }
    },

    // 위치 정보
    aitGetLocation: function(optionsPtr) {
        var optionsStr = UTF8ToString(optionsPtr);
        console.log('[AIT Core] Get location:', optionsStr);
        // 위치 정보 구현
    },

    // 사진 촬영
    aitTakePhoto: function(optionsPtr) {
        var optionsStr = UTF8ToString(optionsPtr);
        console.log('[AIT Core] Take photo:', optionsStr);
        // 사진 촬영 구현
    },

    // 이미지 선택
    aitChooseImage: function(optionsPtr) {
        var optionsStr = UTF8ToString(optionsPtr);
        console.log('[AIT Core] Choose image:', optionsStr);
        // 이미지 선택 구현
    },

    // 클립보드 텍스트 설정
    aitSetClipboardText: function(textPtr, gameObjectPtr, callbackPtr) {
        var text = UTF8ToString(textPtr);
        var gameObject = UTF8ToString(gameObjectPtr);
        var callback = UTF8ToString(callbackPtr);

        console.log('[AIT Core] Set clipboard text:', text);

        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                if (typeof SendMessage !== 'undefined' && callback) {
                    var result = JSON.stringify({
                        success: true,
                        message: 'Text copied to clipboard'
                    });

                    SendMessage(gameObject, 'OnAITCallback', JSON.stringify({
                        callbackName: callback,
                        result: result
                    }));
                }
            }).catch(function(error) {
                console.error('[AIT Core] Clipboard error:', error);
            });
        }
    },

    // 클립보드 텍스트 가져오기
    aitGetClipboardText: function(gameObjectPtr, callbackPtr) {
        var gameObject = UTF8ToString(gameObjectPtr);
        var callback = UTF8ToString(callbackPtr);

        console.log('[AIT Core] Get clipboard text');

        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText().then(function(text) {
                if (typeof SendMessage !== 'undefined' && callback) {
                    var result = JSON.stringify({
                        success: true,
                        text: text
                    });

                    SendMessage(gameObject, 'OnAITCallback', JSON.stringify({
                        callbackName: callback,
                        result: result
                    }));
                }
            }).catch(function(error) {
                console.error('[AIT Core] Clipboard error:', error);
            });
        }
    },

    // 이벤트 추적
    aitTrackEvent: function(eventNamePtr, parametersPtr) {
        var eventName = UTF8ToString(eventNamePtr);
        var parameters = UTF8ToString(parametersPtr);
        console.log('[AIT Core] Track event:', eventName, parameters);
    },

    // 사용자 속성 설정
    aitSetUserProperties: function(propertiesPtr) {
        var properties = UTF8ToString(propertiesPtr);
        console.log('[AIT Core] Set user properties:', properties);
    },

    // 앱 리뷰 요청
    aitRequestAppReview: function(gameObjectPtr, callbackPtr) {
        var gameObject = UTF8ToString(gameObjectPtr);
        var callback = UTF8ToString(callbackPtr);

        console.log('[AIT Core] Request app review');

        if (typeof SendMessage !== 'undefined' && callback) {
            var result = JSON.stringify({
                success: true,
                message: 'App review requested'
            });

            SendMessage(gameObject, 'OnAITCallback', JSON.stringify({
                callbackName: callback,
                result: result
            }));
        }
    },

    // URL 열기
    aitOpenURL: function(urlPtr, gameObjectPtr, callbackPtr) {
        var url = UTF8ToString(urlPtr);
        var gameObject = UTF8ToString(gameObjectPtr);
        var callback = UTF8ToString(callbackPtr);

        console.log('[AIT Core] Open URL:', url);

        if (typeof window !== 'undefined') {
            window.open(url, '_blank');
        }

        if (typeof SendMessage !== 'undefined' && callback) {
            var result = JSON.stringify({
                success: true,
                message: 'URL opened'
            });

            SendMessage(gameObject, 'OnAITCallback', JSON.stringify({
                callbackName: callback,
                result: result
            }));
        }
    },

    // 앱 버전 확인
    aitCheckAppVersion: function(gameObjectPtr, callbackPtr) {
        var gameObject = UTF8ToString(gameObjectPtr);
        var callback = UTF8ToString(callbackPtr);

        console.log('[AIT Core] Check app version');

        if (typeof SendMessage !== 'undefined' && callback) {
            var result = JSON.stringify({
                success: true,
                currentVersion: '1.0.0',
                latestVersion: '1.0.0',
                updateAvailable: false,
                forceUpdate: false,
                updateUrl: ''
            });

            SendMessage(gameObject, 'OnAITCallback', JSON.stringify({
                callbackName: callback,
                result: result
            }));
        }
    },

    // 권한 요청
    aitRequestPermission: function(permissionPtr, gameObjectPtr, callbackPtr) {
        var permission = UTF8ToString(permissionPtr);
        var gameObject = UTF8ToString(gameObjectPtr);
        var callback = UTF8ToString(callbackPtr);

        console.log('[AIT Core] Request permission:', permission);

        if (typeof SendMessage !== 'undefined' && callback) {
            var result = JSON.stringify({
                success: true,
                granted: true,
                permission: permission
            });

            SendMessage(gameObject, 'OnAITCallback', JSON.stringify({
                callbackName: callback,
                result: result
            }));
        }
    },

    // 배너 광고 숨기기
    aitHideBannerAd: function() {
        console.log('[AIT Core] Hide banner ad');
        // Advertisement.jslib에서 구현됨
    },

    // 결제 요청
    aitRequestPayment: function(optionsPtr) {
        var optionsStr = UTF8ToString(optionsPtr);
        console.log('[AIT Core] Request payment:', optionsStr);
        // Payment.jslib에서 구현됨
    }
};

// Unity에서 사용할 수 있도록 함수들을 전역에 등록
mergeInto(LibraryManager.library, AppsInTossCorePlugin);
