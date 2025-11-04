/**
 * Apps in Toss Advertisement Plugin for Unity WebGL
 * 광고 시스템 (전면, 보상형) - loadAppsInTossAdMob / showAppsInTossAdMob API 사용
 *
 * 주의: getLoadedAds() 함수는 appsintoss-unity-bridge.js에서 전역으로 정의됨
 */

var AppsInTossAdPlugin = {
    // 전면 광고 로드
    aitLoadInterstitialAd: function(optionsPtr) {
        var optionsStr = UTF8ToString(optionsPtr);
        var options = JSON.parse(optionsStr);

        console.log('[AIT Ad] ========================================');
        console.log('[AIT Ad] 📥 LoadInterstitialAd 호출');
        console.log('[AIT Ad] ========================================');
        console.log('[AIT Ad] 📋 C#에서 받은 JSON:');
        console.log(optionsStr);
        console.log('[AIT Ad] 📋 파싱된 필드:');
        console.log('[AIT Ad]   → adGroupId: "' + (options.adGroupId || '(빈 문자열)') + '"');
        console.log('[AIT Ad]   → gameObject: "' + options.gameObject + '"');
        console.log('[AIT Ad] 🔍 환경 체크:');
        console.log('[AIT Ad]   → GoogleAdMob 존재: ' + (typeof GoogleAdMob !== 'undefined' ? 'YES' : 'NO'));
        console.log('[AIT Ad]   → GoogleAdMob.loadAppsInTossAdMob 존재: ' + (typeof GoogleAdMob !== 'undefined' && typeof GoogleAdMob.loadAppsInTossAdMob === 'function' ? 'YES' : 'NO'));
        console.log('[AIT Ad] ========================================');

        // Check if GoogleAdMob is available (Apps in Toss environment)
        if (typeof GoogleAdMob !== 'undefined' && GoogleAdMob.loadAppsInTossAdMob) {
            // isSupported 체크
            if (GoogleAdMob.loadAppsInTossAdMob.isSupported &&
                GoogleAdMob.loadAppsInTossAdMob.isSupported() === false) {
                console.warn('[AIT Ad] 광고가 지원되지 않는 환경입니다.');
                if (options.failedCallback && options.gameObject) {
                    SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                        callbackName: options.failedCallback,
                        result: JSON.stringify({ success: false, message: 'Ad not supported' })
                    }));
                }
                return;
            }

            var adGroupId = options.adGroupId;

            console.log('[AIT Ad] Using adGroupId:', adGroupId);

            GoogleAdMob.loadAppsInTossAdMob({
                options: {
                    adGroupId: adGroupId,
                    adType: 'interstitial'  // 전면 광고 타입
                },
                onEvent: function(event) {
                    console.log('[AIT Ad] [Interstitial] Event:', event.type);

                    switch (event.type) {
                        case 'loaded':
                            console.log('[AIT Ad] ✓ Interstitial ad loaded successfully');
                            if (event.data) {
                                console.log('[AIT Ad] Load data:', event.data);
                            }
                            window.getLoadedAds()['interstitial'] = adGroupId;
                            if (options.loadedCallback && options.gameObject) {
                                SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                                    callbackName: options.loadedCallback,
                                    result: JSON.stringify({ success: true, message: 'Interstitial ad loaded' })
                                }));
                            }
                            break;
                        case 'failedToLoad':
                            if (options.failedCallback && options.gameObject) {
                                SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                                    callbackName: options.failedCallback,
                                    result: JSON.stringify({ success: false, message: 'Failed to load ad' })
                                }));
                            }
                            break;
                    }
                },
                onError: function(error) {
                    console.error('[AIT Ad] loadAppsInTossAdMob error:', error);
                    if (options.failedCallback && options.gameObject) {
                        SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                            callbackName: options.failedCallback,
                            result: JSON.stringify({ success: false, message: error.message || 'Load error' })
                        }));
                    }
                }
            });
        } else {
            // Mock implementation for testing
            console.log('[AIT Ad] GoogleAdMob.loadAppsInTossAdMob not available, using mock');
            window.getLoadedAds()['interstitial'] = 'mock-id';
            if (options.loadedCallback && options.gameObject) {
                setTimeout(function() {
                    SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                        callbackName: options.loadedCallback,
                        result: JSON.stringify({ success: true, message: 'Mock ad loaded' })
                    }));
                }, 500);
            }
        }
    },

    // 전면 광고 표시
    aitShowInterstitialAd: function(optionsPtr) {
        var optionsStr = UTF8ToString(optionsPtr);
        var options = JSON.parse(optionsStr);

        console.log('[AIT Ad] ========================================');
        console.log('[AIT Ad] 📺 ShowInterstitialAd 호출');
        console.log('[AIT Ad] ========================================');
        console.log('[AIT Ad] 📋 C#에서 받은 JSON:');
        console.log(optionsStr);
        console.log('[AIT Ad] 📋 파싱된 필드:');
        console.log('[AIT Ad]   → adGroupId: "' + (options.adGroupId || '(빈 문자열)') + '"');
        console.log('[AIT Ad] ========================================');
        var adGroupId = options.adGroupId;

        // Check if GoogleAdMob is available (Apps in Toss environment)
        if (typeof GoogleAdMob !== 'undefined' && GoogleAdMob.showAppsInTossAdMob) {
            // isSupported 체크
            if (GoogleAdMob.showAppsInTossAdMob.isSupported &&
                GoogleAdMob.showAppsInTossAdMob.isSupported() === false) {
                console.warn('[AIT Ad] 광고 표시가 지원되지 않는 환경입니다.');
                return;
            }

            var adGroupId = options.adGroupId;
            console.log('[AIT Ad] Showing interstitial with adGroupId:', adGroupId);

            GoogleAdMob.showAppsInTossAdMob({
                options: {
                    adGroupId: adGroupId
                },
                onEvent: function(event) {
                    console.log('[AIT Ad] [Interstitial Show] Event:', event.type);

                    switch (event.type) {
                        case 'show':
                            if (options.shownCallback && options.gameObject) {
                                SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                                    callbackName: options.shownCallback,
                                    result: JSON.stringify({ shown: true })
                                }));
                            }
                            break;
                        case 'dismissed':
                            if (options.closedCallback && options.gameObject) {
                                SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                                    callbackName: options.closedCallback,
                                    result: JSON.stringify({ closed: true })
                                }));
                            }
                            break;
                        case 'clicked':
                            if (options.clickedCallback && options.gameObject) {
                                SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                                    callbackName: options.clickedCallback,
                                    result: JSON.stringify({ clicked: true })
                                }));
                            }
                            break;
                        case 'impression':
                            console.log('[AIT Ad] Interstitial ad impression recorded');
                            break;
                        case 'failedToShow':
                            console.error('[AIT Ad] Failed to show interstitial ad');
                            break;
                    }
                },
                onError: function(error) {
                    console.error('[AIT Ad] showAppsInTossAdMob error:', error);
                }
            });
            return;
        }

        // Mock: 개발 환경
        console.log('[AIT Ad] [MOCK] Interstitial ad would be shown here');

        if (options.shownCallback && options.gameObject) {
            setTimeout(function() {
                SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                    callbackName: options.shownCallback,
                    result: JSON.stringify({ shown: true, mock: true })
                }));
            }, 100);
        }

        if (options.closedCallback && options.gameObject) {
            setTimeout(function() {
                SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                    callbackName: options.closedCallback,
                    result: JSON.stringify({ closed: true, mock: true })
                }));
            }, 2000);
        }
    },

    // 보상형 광고 로드
    aitLoadRewardedAd: function(optionsPtr) {
        var optionsStr = UTF8ToString(optionsPtr);
        var options = JSON.parse(optionsStr);

        console.log('[AIT Ad] ========================================');
        console.log('[AIT Ad] 📥 LoadRewardedAd 호출');
        console.log('[AIT Ad] ========================================');
        console.log('[AIT Ad] 📋 C#에서 받은 JSON:');
        console.log(optionsStr);
        console.log('[AIT Ad] 📋 파싱된 필드:');
        console.log('[AIT Ad]   → adGroupId: "' + (options.adGroupId || '(빈 문자열)') + '"');
        console.log('[AIT Ad]   → gameObject: "' + options.gameObject + '"');
        console.log('[AIT Ad] 🔍 환경 체크:');
        console.log('[AIT Ad]   → GoogleAdMob 존재: ' + (typeof GoogleAdMob !== 'undefined' ? 'YES' : 'NO'));
        console.log('[AIT Ad]   → GoogleAdMob.loadAppsInTossAdMob 존재: ' + (typeof GoogleAdMob !== 'undefined' && typeof GoogleAdMob.loadAppsInTossAdMob === 'function' ? 'YES' : 'NO'));
        console.log('[AIT Ad] ========================================');

        // Check if GoogleAdMob is available (Apps in Toss environment)
        if (typeof GoogleAdMob !== 'undefined' && GoogleAdMob.loadAppsInTossAdMob) {
            // isSupported 체크
            if (GoogleAdMob.loadAppsInTossAdMob.isSupported &&
                GoogleAdMob.loadAppsInTossAdMob.isSupported() === false) {
                console.warn('[AIT Ad] 광고가 지원되지 않는 환경입니다.');
                if (options.failedCallback && options.gameObject) {
                    SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                        callbackName: options.failedCallback,
                        result: JSON.stringify({ success: false, message: 'Ad not supported' })
                    }));
                }
                return;
            }

            var adGroupId = options.adGroupId;

            GoogleAdMob.loadAppsInTossAdMob({
                options: {
                    adGroupId: adGroupId,
                    adType: 'rewarded'  // 보상형 광고 타입
                },
                onEvent: function(event) {
                    console.log('[AIT Ad] [Rewarded] Event:', event.type);

                    switch (event.type) {
                        case 'loaded':
                            console.log('[AIT Ad] ✓ Rewarded ad loaded successfully');
                            if (event.data) {
                                console.log('[AIT Ad] Load data:', event.data);
                            }
                            window.getLoadedAds()['rewarded'] = adGroupId;
                            if (options.loadedCallback && options.gameObject) {
                                SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                                    callbackName: options.loadedCallback,
                                    result: JSON.stringify({ success: true, message: 'Rewarded ad loaded' })
                                }));
                            }
                            break;
                        case 'failedToLoad':
                            if (options.failedCallback && options.gameObject) {
                                SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                                    callbackName: options.failedCallback,
                                    result: JSON.stringify({ success: false, message: 'Failed to load ad' })
                                }));
                            }
                            break;
                    }
                },
                onError: function(error) {
                    console.error('[AIT Ad] loadAppsInTossAdMob rewarded error:', error);
                    if (options.failedCallback && options.gameObject) {
                        SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                            callbackName: options.failedCallback,
                            result: JSON.stringify({ success: false, message: error.message || 'Load error' })
                        }));
                    }
                }
            });
        } else {
            // Mock implementation for testing
            console.log('[AIT Ad] GoogleAdMob.loadAppsInTossAdMob not available, using mock for rewarded ad');
            window.getLoadedAds()['rewarded'] = 'mock-id';
            if (options.loadedCallback && options.gameObject) {
                setTimeout(function() {
                    SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                        callbackName: options.loadedCallback,
                        result: JSON.stringify({ success: true, message: 'Mock rewarded ad loaded' })
                    }));
                }, 500);
            }
        }
    },

    // 보상형 광고 표시
    aitShowRewardedAd: function(optionsPtr) {
        var optionsStr = UTF8ToString(optionsPtr);
        var options = JSON.parse(optionsStr);

        console.log('[AIT Ad] ========================================');
        console.log('[AIT Ad] 📺 ShowRewardedAd 호출');
        console.log('[AIT Ad] ========================================');
        console.log('[AIT Ad] 📋 C#에서 받은 JSON:');
        console.log(optionsStr);
        console.log('[AIT Ad] 📋 파싱된 필드:');
        console.log('[AIT Ad]   → adGroupId: "' + (options.adGroupId || '(빈 문자열)') + '"');
        console.log('[AIT Ad] ========================================');
        var adGroupId = options.adGroupId;

        // Check if GoogleAdMob is available (Apps in Toss environment)
        if (typeof GoogleAdMob !== 'undefined' && GoogleAdMob.showAppsInTossAdMob) {
            // isSupported 체크
            if (GoogleAdMob.showAppsInTossAdMob.isSupported &&
                GoogleAdMob.showAppsInTossAdMob.isSupported() === false) {
                console.warn('[AIT Ad] 광고 표시가 지원되지 않는 환경입니다.');
                return;
            }

            var adGroupId = options.adGroupId;
            console.log('[AIT Ad] Showing rewarded ad with adGroupId:', adGroupId);

            GoogleAdMob.showAppsInTossAdMob({
                options: {
                    adGroupId: adGroupId
                },
                onEvent: function(event) {
                    console.log('[AIT Ad] [Rewarded Show] Event:', event.type);

                    switch (event.type) {
                        case 'show':
                            if (options.shownCallback && options.gameObject) {
                                SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                                    callbackName: options.shownCallback,
                                    result: JSON.stringify({ shown: true })
                                }));
                            }
                            break;
                        case 'userEarnedReward':
                            if (options.rewardedCallback && options.gameObject) {
                                // React 가이드에 따라 event.data에서 정보 추출
                                var rewardResult = {
                                    success: true,
                                    rewardType: (event.data && event.data.unitType) || 'coins',
                                    rewardAmount: (event.data && event.data.unitAmount) || 100
                                };
                                console.log('[AIT Ad] User earned reward:', rewardResult);
                                SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                                    callbackName: options.rewardedCallback,
                                    result: JSON.stringify(rewardResult)
                                }));
                            }
                            break;
                        case 'dismissed':
                            if (options.closedCallback && options.gameObject) {
                                SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                                    callbackName: options.closedCallback,
                                    result: JSON.stringify({ closed: true })
                                }));
                            }
                            break;
                        case 'clicked':
                            console.log('[AIT Ad] Rewarded ad clicked');
                            break;
                        case 'impression':
                            console.log('[AIT Ad] Rewarded ad impression recorded');
                            break;
                        case 'failedToShow':
                            console.error('[AIT Ad] Failed to show rewarded ad');
                            break;
                    }
                },
                onError: function(error) {
                    console.error('[AIT Ad] showAppsInTossAdMob rewarded error:', error);
                }
            });
            return;
        }

        // Mock: 개발 환경
        console.log('[AIT Ad] [MOCK] Rewarded ad would be shown here');

        if (options.shownCallback && options.gameObject) {
            setTimeout(function() {
                SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                    callbackName: options.shownCallback,
                    result: JSON.stringify({ shown: true, mock: true })
                }));
            }, 100);
        }

        if (options.rewardedCallback && options.gameObject) {
            setTimeout(function() {
                var rewardResult = { success: true, rewardType: 'coins', rewardAmount: 100, mock: true };
                SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                    callbackName: options.rewardedCallback,
                    result: JSON.stringify(rewardResult)
                }));
            }, 2000);
        }

        if (options.closedCallback && options.gameObject) {
            setTimeout(function() {
                SendMessage(options.gameObject, 'OnAITCallback', JSON.stringify({
                    callbackName: options.closedCallback,
                    result: JSON.stringify({ closed: true, mock: true })
                }));
            }, 2500);
        }
    },

    // 광고 가용성 확인
    aitIsAdAvailable: function(adTypePtr) {
        var adType = UTF8ToString(adTypePtr);
        console.log('[AIT Ad] Checking ad availability for:', adType);

        // GoogleAdMob API가 있는지 확인
        if (typeof GoogleAdMob !== 'undefined' && GoogleAdMob.loadAppsInTossAdMob) {
            if (GoogleAdMob.loadAppsInTossAdMob.isSupported) {
                return GoogleAdMob.loadAppsInTossAdMob.isSupported() ? 1 : 0;
            }
            return 1; // isSupported 함수가 없으면 사용 가능하다고 가정
        }

        // 개발 환경에서는 항상 사용 가능
        return 1;
    },

    // 광고 로딩 상태 확인
    aitGetAdLoadingState: function(adTypePtr) {
        var adType = UTF8ToString(adTypePtr);
        console.log('[AIT Ad] Getting ad loading state for:', adType);

        // 로드된 광고가 있는지 확인
        var loadedAds = window.getLoadedAds();
        if (loadedAds[adType]) {
            return 1; // 1 = loaded
        }

        return 0; // 0 = not loaded
    }
};

// Unity에서 사용할 수 있도록 함수들을 전역에 등록
mergeInto(LibraryManager.library, AppsInTossAdPlugin);
