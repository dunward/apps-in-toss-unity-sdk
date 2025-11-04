#if UNITY_WEBGL || APPSINTOSS_MINIAPP || UNITY_EDITOR
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using UnityEngine;

namespace AppsInToss
{
    /// <summary>
    /// Apps in Toss SDK 기본 클래스
    /// JavaScript와의 상호작용을 위한 기본 기능 제공
    /// </summary>
    public class AITBase
    {
        // JavaScript 플러그인 함수들
        [DllImport("__Internal")]
        internal static extern void aitInit(string gameObject, string callback);

        [DllImport("__Internal")]
        internal static extern void aitLogin(string options);

        [DllImport("__Internal")]
        internal static extern void aitLogout(string gameObject, string callback);

        [DllImport("__Internal")]
        internal static extern void aitGetUserInfo(string gameObject, string callback);

        [DllImport("__Internal")]
        internal static extern void aitRequestPayment(string options);

        [DllImport("__Internal")]
        internal static extern void aitLoadInterstitialAd(string options);

        [DllImport("__Internal")]
        internal static extern void aitShowInterstitialAd(string options);

        [DllImport("__Internal")]
        internal static extern void aitLoadRewardedAd(string options);

        [DllImport("__Internal")]
        internal static extern void aitShowRewardedAd(string options);

        [DllImport("__Internal")]
        internal static extern void aitSetStorageData(string key, string value, string gameObject, string callback);

        [DllImport("__Internal")]
        internal static extern void aitGetStorageData(string key, string gameObject, string callback);

        [DllImport("__Internal")]
        internal static extern void aitRemoveStorageData(string key, string gameObject, string callback);

        [DllImport("__Internal")]
        internal static extern void aitShareText(string options);

        [DllImport("__Internal")]
        internal static extern void aitShareLink(string options);

        [DllImport("__Internal")]
        internal static extern void aitShareImage(string options);

        [DllImport("__Internal")]
        internal static extern void aitVibrate(int type);

        [DllImport("__Internal")]
        internal static extern void aitShowToast(string options);

        [DllImport("__Internal")]
        internal static extern void aitShowDialog(string options);

        [DllImport("__Internal")]
        internal static extern void aitGetNetworkType(string gameObject, string callback);

        [DllImport("__Internal")]
        internal static extern void aitGetDeviceInfo(string gameObject, string callback);

        [DllImport("__Internal")]
        internal static extern void aitGetLocation(string options);

        [DllImport("__Internal")]
        internal static extern void aitTakePhoto(string options);

        [DllImport("__Internal")]
        internal static extern void aitChooseImage(string options);

        [DllImport("__Internal")]
        internal static extern void aitSetClipboardText(string text, string gameObject, string callback);

        [DllImport("__Internal")]
        internal static extern void aitGetClipboardText(string gameObject, string callback);

        [DllImport("__Internal")]
        internal static extern void aitTrackEvent(string eventName, string parameters);

        [DllImport("__Internal")]
        internal static extern void aitSetUserProperties(string properties);

        [DllImport("__Internal")]
        internal static extern void aitRequestAppReview(string gameObject, string callback);

        [DllImport("__Internal")]
        internal static extern void aitOpenURL(string url, string gameObject, string callback);

        [DllImport("__Internal")]
        internal static extern void aitCheckAppVersion(string gameObject, string callback);

        [DllImport("__Internal")]
        internal static extern void aitRequestPermission(string permission, string gameObject, string callback);

        /// <summary>
        /// JavaScript 객체를 JSON 문자열로 변환
        /// </summary>
        protected static string ToJson(object obj)
        {
            return JsonUtility.ToJson(obj);
        }

        /// <summary>
        /// JSON 문자열을 객체로 변환
        /// </summary>
        public static T FromJson<T>(string json)
        {
            try
            {
                return JsonUtility.FromJson<T>(json);
            }
            catch (Exception e)
            {
                Debug.LogError($"JSON 파싱 오류: {e.Message}, JSON: {json}");
                return default(T);
            }
        }

        /// <summary>
        /// Dictionary를 JSON 문자열로 변환
        /// </summary>
        public static string DictionaryToJson(Dictionary<string, object> dict)
        {
            if (dict == null || dict.Count == 0)
                return "{}";

            var pairs = new List<string>();
            foreach (var kvp in dict)
            {
                string value;
                if (kvp.Value == null)
                {
                    value = "null";
                }
                else if (kvp.Value is string)
                {
                    value = $"\"{kvp.Value}\"";
                }
                else if (kvp.Value is bool)
                {
                    value = kvp.Value.ToString().ToLower();
                }
                else
                {
                    value = kvp.Value.ToString();
                }
                pairs.Add($"\"{kvp.Key}\":{value}");
            }

            return "{" + string.Join(",", pairs) + "}";
        }

        /// <summary>
        /// 에러 메시지 생성
        /// </summary>
        protected static BaseResult CreateErrorResult(string message, int errorCode = -1)
        {
            return new BaseResult
            {
                success = false,
                message = message,
                errorCode = errorCode
            };
        }

        /// <summary>
        /// 성공 결과 생성
        /// </summary>
        public static BaseResult CreateSuccessResult(string message = "Success")
        {
            return new BaseResult
            {
                success = true,
                message = message,
                errorCode = 0
            };
        }
    }

    /// <summary>
    /// Apps in Toss SDK 매니저 핸들러
    /// 모든 API 호출을 관리하고 콜백을 처리
    /// </summary>
    public class AITSDKManagerHandler : MonoBehaviour
    {
        private static AITSDKManagerHandler _instance;
        
        public static AITSDKManagerHandler Instance
        {
            get
            {
                if (_instance == null)
                {
                    GameObject go = new GameObject("AITSDKManager");
                    _instance = go.AddComponent<AITSDKManagerHandler>();
                    DontDestroyOnLoad(go);
                }
                return _instance;
            }
        }

        private Dictionary<string, System.Delegate> callbacks = new Dictionary<string, System.Delegate>();
        private int callbackId = 0;

        private void Awake()
        {
            if (_instance == null)
            {
                _instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else if (_instance != this)
            {
                Destroy(gameObject);
            }
        }

        #region Public API Methods

        public void Init(Action<InitResult> callback = null)
        {
            string callbackName = RegisterCallback(callback);
#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitInit(gameObject.name, callbackName);
#else
            // Editor에서는 가짜 응답
            if (callback != null)
            {
                var result = new InitResult
                {
                    success = true,
                    message = "SDK initialized (Editor mode)",
                    sdkVersion = "1.0.0",
                    platformVersion = "1.0.0"
                };
                callback(result);
            }
#endif
        }

        public void CheckLoginStatus(Action<LoginStatusResult> callback = null)
        {
            string callbackName = RegisterCallback(callback);
#if UNITY_WEBGL && !UNITY_EDITOR
            // JavaScript에서 로그인 상태 확인 로직 실행
            Application.ExternalEval($"aitCheckLoginStatus('{gameObject.name}', '{callbackName}');");
#else
            if (callback != null)
            {
                var result = new LoginStatusResult
                {
                    success = true,
                    isLoggedIn = false,
                    userId = ""
                };
                callback(result);
            }
#endif
        }

        public void Login(LoginOptions options)
        {
            string optionsJson = JsonUtility.ToJson(new
            {
                requestUserInfo = options.requestUserInfo,
                gameObject = gameObject.name,
                successCallback = RegisterCallback(options.onSuccess),
                failureCallback = RegisterCallback(options.onFailure)
            });

#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitLogin(optionsJson);
#else
            // Editor에서는 가짜 응답
            if (options.onSuccess != null)
            {
                var result = new UserInfoResult
                {
                    success = true,
                    userId = "editor_user_123",
                    nickname = "Editor User",
                    email = "editor@appsintoss.com"
                };
                options.onSuccess(result);
            }
#endif
        }

        public void Logout(Action<BaseResult> callback = null)
        {
            string callbackName = RegisterCallback(callback);
#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitLogout(gameObject.name, callbackName);
#else
            if (callback != null)
            {
                callback(AITBase.CreateSuccessResult("Logout success (Editor mode)"));
            }
#endif
        }

        public void GetUserInfo(Action<UserInfoResult> callback)
        {
            string callbackName = RegisterCallback(callback);
#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitGetUserInfo(gameObject.name, callbackName);
#else
            if (callback != null)
            {
                var result = new UserInfoResult
                {
                    success = true,
                    userId = "editor_user_123",
                    nickname = "Editor User",
                    email = "editor@appsintoss.com"
                };
                callback(result);
            }
#endif
        }

        public void RequestPayment(PaymentOptions options)
        {
            string optionsJson = JsonUtility.ToJson(new
            {
                amount = options.amount,
                productName = options.productName,
                productId = options.productId,
                orderId = options.orderId,
                customerKey = options.customerKey,
                gameObject = gameObject.name,
                successCallback = RegisterCallback(options.onSuccess),
                failureCallback = RegisterCallback(options.onFailure),
                cancelCallback = RegisterCallback(options.onCancel)
            });

#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitRequestPayment(optionsJson);
#else
            // Editor에서는 가짜 성공 응답
            if (options.onSuccess != null)
            {
                var result = new PaymentResult
                {
                    success = true,
                    paymentKey = "test_payment_key_123",
                    orderId = options.orderId,
                    amount = options.amount,
                    status = "DONE",
                    approvedAt = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                };
                options.onSuccess(result);
            }
#endif
        }

        public void LoadInterstitialAd(InterstitialAdOptions options)
        {
            var jsOptions = new JSAdOptions
            {
                adGroupId = options.adGroupId,
                gameObject = gameObject.name,
                loadedCallback = RegisterCallback(options.onLoaded),
                failedCallback = RegisterCallback(options.onFailedToLoad)
            };
            string optionsJson = JsonUtility.ToJson(jsOptions);
            Debug.Log($"[AIT Unity] LoadInterstitialAd JSON: {optionsJson}");

#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitLoadInterstitialAd(optionsJson);
#else
            // Editor에서는 가짜 응답
            if (options.onLoaded != null)
            {
                options.onLoaded(AITBase.CreateSuccessResult("Interstitial ad loaded (Editor mode)"));
            }
#endif
        }

        public void ShowInterstitialAd(InterstitialAdOptions options)
        {
            var jsOptions = new JSAdOptions
            {
                adGroupId = options.adGroupId,
                gameObject = gameObject.name,
                shownCallback = RegisterCallback(options.onShown),
                closedCallback = RegisterCallback(options.onClosed),
                clickedCallback = RegisterCallback(options.onClicked)
            };
            string optionsJson = JsonUtility.ToJson(jsOptions);
            Debug.Log($"[AIT Unity] ShowInterstitialAd JSON: {optionsJson}");

#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitShowInterstitialAd(optionsJson);
#else
            // Editor에서는 가짜 응답
            if (options.onShown != null)
            {
                options.onShown();
            }
            if (options.onClosed != null)
            {
                options.onClosed();
            }
#endif
        }

        public void LoadRewardedAd(RewardedAdOptions options)
        {
            var jsOptions = new JSAdOptions
            {
                adGroupId = options.adGroupId,
                gameObject = gameObject.name,
                loadedCallback = RegisterCallback(options.onLoaded),
                failedCallback = RegisterCallback(options.onFailedToLoad)
            };
            string optionsJson = JsonUtility.ToJson(jsOptions);
            Debug.Log($"[AIT Unity] LoadRewardedAd JSON: {optionsJson}");

#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitLoadRewardedAd(optionsJson);
#else
            // Editor에서는 가짜 응답
            if (options.onLoaded != null)
            {
                options.onLoaded(AITBase.CreateSuccessResult("Rewarded ad loaded (Editor mode)"));
            }
#endif
        }

        public void ShowRewardedAd(RewardedAdOptions options)
        {
            var jsOptions = new JSAdOptions
            {
                adGroupId = options.adGroupId,
                gameObject = gameObject.name,
                shownCallback = RegisterCallback(options.onShown),
                rewardedCallback = RegisterCallback(options.onRewarded),
                closedCallback = RegisterCallback(options.onClosed)
            };
            string optionsJson = JsonUtility.ToJson(jsOptions);
            Debug.Log($"[AIT Unity] ShowRewardedAd JSON: {optionsJson}");

#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitShowRewardedAd(optionsJson);
#else
            // Editor에서는 가짜 보상 지급
            if (options.onShown != null)
            {
                options.onShown();
            }
            if (options.onRewarded != null)
            {
                var result = new RewardResult
                {
                    success = true,
                    rewardType = "coins",
                    rewardAmount = 100
                };
                options.onRewarded(result);
            }
            if (options.onClosed != null)
            {
                options.onClosed();
            }
#endif
        }

        public void SetStorageData(string key, string value, Action<BaseResult> callback = null)
        {
            string callbackName = RegisterCallback(callback);
#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitSetStorageData(key, value, gameObject.name, callbackName);
#else
            // Editor에서는 PlayerPrefs 사용
            PlayerPrefs.SetString(key, value);
            PlayerPrefs.Save();
            if (callback != null)
            {
                callback(AITBase.CreateSuccessResult("Data saved (Editor mode)"));
            }
#endif
        }

        public void GetStorageData(string key, Action<StorageDataResult> callback)
        {
            string callbackName = RegisterCallback(callback);
#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitGetStorageData(key, gameObject.name, callbackName);
#else
            // Editor에서는 PlayerPrefs 사용
            if (callback != null)
            {
                var result = new StorageDataResult
                {
                    success = true,
                    key = key,
                    value = PlayerPrefs.GetString(key, "")
                };
                callback(result);
            }
#endif
        }

        public void RemoveStorageData(string key, Action<BaseResult> callback = null)
        {
            string callbackName = RegisterCallback(callback);
#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitRemoveStorageData(key, gameObject.name, callbackName);
#else
            // Editor에서는 PlayerPrefs 사용
            PlayerPrefs.DeleteKey(key);
            PlayerPrefs.Save();
            if (callback != null)
            {
                callback(AITBase.CreateSuccessResult("Data removed (Editor mode)"));
            }
#endif
        }

        public void ShareText(ShareTextOptions options)
        {
            string optionsJson = JsonUtility.ToJson(new
            {
                text = options.text,
                title = options.title,
                gameObject = gameObject.name,
                completeCallback = RegisterCallback(options.onComplete),
                cancelCallback = RegisterCallback(options.onCancel)
            });

#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitShareText(optionsJson);
#else
            Debug.Log($"Share text (Editor mode): {options.text}");
            if (options.onComplete != null)
            {
                options.onComplete(AITBase.CreateSuccessResult("Text shared (Editor mode)"));
            }
#endif
        }

        public void ShareLink(ShareLinkOptions options)
        {
            string optionsJson = JsonUtility.ToJson(new
            {
                url = options.url,
                title = options.title,
                description = options.description,
                imageUrl = options.imageUrl,
                gameObject = gameObject.name,
                completeCallback = RegisterCallback(options.onComplete),
                cancelCallback = RegisterCallback(options.onCancel)
            });

#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitShareLink(optionsJson);
#else
            Debug.Log($"Share link (Editor mode): {options.url}");
            if (options.onComplete != null)
            {
                options.onComplete(AITBase.CreateSuccessResult("Link shared (Editor mode)"));
            }
#endif
        }

        public void ShareImage(ShareImageOptions options)
        {
            string optionsJson = JsonUtility.ToJson(new
            {
                imageUrl = options.imageUrl,
                title = options.title,
                description = options.description,
                gameObject = gameObject.name,
                completeCallback = RegisterCallback(options.onComplete),
                cancelCallback = RegisterCallback(options.onCancel)
            });

#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitShareImage(optionsJson);
#else
            Debug.Log($"Share image (Editor mode): {options.imageUrl}");
            if (options.onComplete != null)
            {
                options.onComplete(AITBase.CreateSuccessResult("Image shared (Editor mode)"));
            }
#endif
        }

        public void Vibrate(VibrationType type = VibrationType.Light)
        {
#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitVibrate((int)type);
#else
            Debug.Log($"Vibrate (Editor mode): {type}");
#endif
        }

        public void ShowToast(ToastOptions options)
        {
            string optionsJson = JsonUtility.ToJson(options);
#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitShowToast(optionsJson);
#else
            Debug.Log($"Toast (Editor mode): {options.message}");
#endif
        }

        public void ShowDialog(DialogOptions options)
        {
            string optionsJson = JsonUtility.ToJson(new
            {
                title = options.title,
                message = options.message,
                confirmText = options.confirmText,
                cancelText = options.cancelText,
                showCancel = options.showCancel,
                gameObject = gameObject.name,
                confirmCallback = RegisterCallback(options.onConfirm),
                cancelCallback = RegisterCallback(options.onCancel)
            });

#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitShowDialog(optionsJson);
#else
            Debug.Log($"Dialog (Editor mode): {options.title} - {options.message}");
            if (options.onConfirm != null)
            {
                options.onConfirm();
            }
#endif
        }

        public void GetNetworkType(Action<NetworkTypeResult> callback)
        {
            string callbackName = RegisterCallback(callback);
#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitGetNetworkType(gameObject.name, callbackName);
#else
            if (callback != null)
            {
                var result = new NetworkTypeResult
                {
                    success = true,
                    networkType = NetworkType.Wifi,
                    isConnected = Application.internetReachability != NetworkReachability.NotReachable
                };
                callback(result);
            }
#endif
        }

        public void GetDeviceInfo(Action<DeviceInfoResult> callback)
        {
            string callbackName = RegisterCallback(callback);
#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitGetDeviceInfo(gameObject.name, callbackName);
#else
            if (callback != null)
            {
                var result = new DeviceInfoResult
                {
                    success = true,
                    model = SystemInfo.deviceModel,
                    brand = "Unity",
                    system = SystemInfo.operatingSystem,
                    version = SystemInfo.operatingSystem,
                    platform = "Editor",
                    language = Application.systemLanguage.ToString(),
                    screenWidth = Screen.width,
                    screenHeight = Screen.height,
                    pixelRatio = Screen.dpi / 96f
                };
                callback(result);
            }
#endif
        }

        public void GetLocation(LocationOptions options)
        {
            string optionsJson = JsonUtility.ToJson(new
            {
                accuracy = options.accuracy.ToString(),
                timeout = options.timeout,
                gameObject = gameObject.name,
                successCallback = RegisterCallback(options.onSuccess),
                failureCallback = RegisterCallback(options.onFailure)
            });

#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitGetLocation(optionsJson);
#else
            // Editor에서는 가짜 위치
            if (options.onSuccess != null)
            {
                var result = new LocationResult
                {
                    success = true,
                    latitude = 37.5665,
                    longitude = 126.9780,
                    accuracy = 10f,
                    altitude = 0,
                    speed = 0,
                    timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                };
                options.onSuccess(result);
            }
#endif
        }

        public void TakePhoto(CameraOptions options)
        {
            string optionsJson = JsonUtility.ToJson(new
            {
                source = options.source.ToString(),
                quality = options.quality.ToString(),
                allowEdit = options.allowEdit,
                gameObject = gameObject.name,
                successCallback = RegisterCallback(options.onSuccess),
                failureCallback = RegisterCallback(options.onFailure),
                cancelCallback = RegisterCallback(options.onCancel)
            });

#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitTakePhoto(optionsJson);
#else
            // Editor에서는 가짜 이미지
            if (options.onSuccess != null)
            {
                var result = new ImageResult
                {
                    success = true,
                    path = "editor_image.jpg",
                    base64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
                    width = 800,
                    height = 600,
                    size = 50000
                };
                options.onSuccess(result);
            }
#endif
        }

        public void ChooseImage(ChooseImageOptions options)
        {
            string optionsJson = JsonUtility.ToJson(new
            {
                count = options.count,
                quality = options.quality.ToString(),
                gameObject = gameObject.name,
                successCallback = RegisterCallback(options.onSuccess),
                failureCallback = RegisterCallback(options.onFailure),
                cancelCallback = RegisterCallback(options.onCancel)
            });

#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitChooseImage(optionsJson);
#else
            // Editor에서는 가짜 이미지 리스트
            if (options.onSuccess != null)
            {
                var result = new ImageListResult
                {
                    success = true,
                    images = new ImageResult[]
                    {
                        new ImageResult
                        {
                            success = true,
                            path = "editor_image1.jpg",
                            base64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
                            width = 800,
                            height = 600,
                            size = 50000
                        }
                    }
                };
                options.onSuccess(result);
            }
#endif
        }

        public void SetClipboardText(string text, Action<BaseResult> callback = null)
        {
            string callbackName = RegisterCallback(callback);
#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitSetClipboardText(text, gameObject.name, callbackName);
#else
            GUIUtility.systemCopyBuffer = text;
            if (callback != null)
            {
                callback(AITBase.CreateSuccessResult("Text copied to clipboard (Editor mode)"));
            }
#endif
        }

        public void GetClipboardText(Action<ClipboardTextResult> callback)
        {
            string callbackName = RegisterCallback(callback);
#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitGetClipboardText(gameObject.name, callbackName);
#else
            if (callback != null)
            {
                var result = new ClipboardTextResult
                {
                    success = true,
                    text = GUIUtility.systemCopyBuffer ?? ""
                };
                callback(result);
            }
#endif
        }

        public void TrackEvent(string eventName, Dictionary<string, object> parameters = null)
        {
            string parametersJson = AITBase.DictionaryToJson(parameters);
#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitTrackEvent(eventName, parametersJson);
#else
            Debug.Log($"Track event (Editor mode): {eventName}, Parameters: {parametersJson}");
#endif
        }

        public void SetUserProperties(Dictionary<string, object> properties)
        {
            string propertiesJson = AITBase.DictionaryToJson(properties);
#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitSetUserProperties(propertiesJson);
#else
            Debug.Log($"Set user properties (Editor mode): {propertiesJson}");
#endif
        }

        public void RequestAppReview(Action<BaseResult> callback = null)
        {
            string callbackName = RegisterCallback(callback);
#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitRequestAppReview(gameObject.name, callbackName);
#else
            if (callback != null)
            {
                callback(AITBase.CreateSuccessResult("App review requested (Editor mode)"));
            }
#endif
        }

        public void OpenURL(string url, Action<BaseResult> callback = null)
        {
            string callbackName = RegisterCallback(callback);
#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitOpenURL(url, gameObject.name, callbackName);
#else
            Debug.Log($"Open URL (Editor mode): {url}");
            if (callback != null)
            {
                callback(AITBase.CreateSuccessResult("URL opened (Editor mode)"));
            }
#endif
        }

        public void CheckAppVersion(Action<AppVersionResult> callback)
        {
            string callbackName = RegisterCallback(callback);
#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitCheckAppVersion(gameObject.name, callbackName);
#else
            if (callback != null)
            {
                var result = new AppVersionResult
                {
                    success = true,
                    currentVersion = Application.version,
                    latestVersion = Application.version,
                    updateAvailable = false,
                    forceUpdate = false,
                    updateUrl = ""
                };
                callback(result);
            }
#endif
        }

        public void RequestNotificationPermission(Action<PermissionResult> callback)
        {
            RequestPermission("notification", callback);
        }

        public void RequestContactsPermission(Action<PermissionResult> callback)
        {
            RequestPermission("contacts", callback);
        }

        public void RequestLocationPermission(Action<PermissionResult> callback)
        {
            RequestPermission("location", callback);
        }

        public void RequestCameraPermission(Action<PermissionResult> callback)
        {
            RequestPermission("camera", callback);
        }

        private void RequestPermission(string permission, Action<PermissionResult> callback)
        {
            string callbackName = RegisterCallback(callback);
#if UNITY_WEBGL && !UNITY_EDITOR
            AITBase.aitRequestPermission(permission, gameObject.name, callbackName);
#else
            if (callback != null)
            {
                var result = new PermissionResult
                {
                    success = true,
                    granted = true,
                    permission = permission
                };
                callback(result);
            }
#endif
        }

        // Audio System APIs
        public int CreateAudioContext(AudioContextOptions options) { Debug.Log("CreateAudioContext (Editor mode)"); return 0; }
        public void SetAudioSource(int audioId, string src) { Debug.Log($"SetAudioSource (Editor mode): {audioId}, {src}"); }
        public void PlayAudio(int audioId) { Debug.Log($"PlayAudio (Editor mode): {audioId}"); }
        public void PauseAudio(int audioId) { Debug.Log($"PauseAudio (Editor mode): {audioId}"); }
        public void StopAudio(int audioId) { Debug.Log($"StopAudio (Editor mode): {audioId}"); }
        public void SetAudioVolume(int audioId, float volume) { Debug.Log($"SetAudioVolume (Editor mode): {audioId}, {volume}"); }
        public void SetAudioLoop(int audioId, bool loop) { Debug.Log($"SetAudioLoop (Editor mode): {audioId}, {loop}"); }
        public void DestroyAudio(int audioId) { Debug.Log($"DestroyAudio (Editor mode): {audioId}"); }
        public void PlayBackgroundMusic(BackgroundMusicOptions options) { Debug.Log($"PlayBackgroundMusic (Editor mode): {options.src}"); }
        public void PauseBackgroundMusic() { Debug.Log("PauseBackgroundMusic (Editor mode)"); }
        public void ResumeBackgroundMusic() { Debug.Log("ResumeBackgroundMusic (Editor mode)"); }
        public void StopBackgroundMusic() { Debug.Log("StopBackgroundMusic (Editor mode)"); }
        public void SetBackgroundMusicVolume(float volume) { Debug.Log($"SetBackgroundMusicVolume (Editor mode): {volume}"); }

        // File System APIs
        public void InitFileSystem(FileSystemOptions options) { Debug.Log("InitFileSystem (Editor mode)"); }
        public void WriteFile(WriteFileOptions options) { Debug.Log($"WriteFile (Editor mode): {options.filePath}"); }
        public void ReadFile(ReadFileOptions options) { Debug.Log($"ReadFile (Editor mode): {options.filePath}"); }
        public void UnlinkFile(UnlinkFileOptions options) { Debug.Log($"UnlinkFile (Editor mode): {options.filePath}"); }
        public void CopyFile(CopyFileOptions options) { Debug.Log($"CopyFile (Editor mode): {options.srcPath} -> {options.destPath}"); }
        public void GetFileStats(FileStatsOptions options) { Debug.Log($"GetFileStats (Editor mode): {options.filePath}"); }
        public void MkDir(MkDirOptions options) { Debug.Log($"MkDir (Editor mode): {options.dirPath}"); }
        public void ReadDir(ReadDirOptions options) { Debug.Log($"ReadDir (Editor mode): {options.dirPath}"); }
        public void GetStorageInfo(StorageInfoOptions options) { Debug.Log("GetStorageInfo (Editor mode)"); }
        public void ClearCache(ClearCacheOptions options) { Debug.Log("ClearCache (Editor mode)"); }

        // Sensors APIs
        public void StartAccelerometer(AccelerometerOptions options) { Debug.Log("StartAccelerometer (Editor mode)"); }
        public void StopAccelerometer() { Debug.Log("StopAccelerometer (Editor mode)"); }
        public void StartGyroscope(GyroscopeOptions options) { Debug.Log("StartGyroscope (Editor mode)"); }
        public void StopGyroscope() { Debug.Log("StopGyroscope (Editor mode)"); }
        public void StartCompass(CompassOptions options) { Debug.Log("StartCompass (Editor mode)"); }
        public void StopCompass() { Debug.Log("StopCompass (Editor mode)"); }
        public void StartDeviceMotion(DeviceMotionOptions options) { Debug.Log("StartDeviceMotion (Editor mode)"); }
        public void StopDeviceMotion() { Debug.Log("StopDeviceMotion (Editor mode)"); }
        public void OnSensorChange(SensorCallbackOptions options) { Debug.Log($"OnSensorChange (Editor mode): {options.sensorType}"); }
        public void OffSensorChange(SensorCallbackOptions options) { Debug.Log($"OffSensorChange (Editor mode): {options.sensorType}"); }
        public void CheckSensorPermissions(SensorPermissionOptions options) { Debug.Log("CheckSensorPermissions (Editor mode)"); }
        public void StopAllSensors() { Debug.Log("StopAllSensors (Editor mode)"); }

        // Performance APIs
        public void StartPerformanceMonitoring(PerformanceMonitorOptions options) { Debug.Log("StartPerformanceMonitoring (Editor mode)"); }
        public void StopPerformanceMonitoring() { Debug.Log("StopPerformanceMonitoring (Editor mode)"); }
        public void GetPerformanceReport(PerformanceReportOptions options) { Debug.Log("GetPerformanceReport (Editor mode)"); }
        public void ReportCustomMetric(CustomMetricOptions options) { Debug.Log($"ReportCustomMetric (Editor mode): {options.name} = {options.value}"); }
        public void OnMemoryWarning(MemoryWarningOptions options) { Debug.Log("OnMemoryWarning (Editor mode)"); }
        public void OnPerformanceEvent(PerformanceEventOptions options) { Debug.Log($"OnPerformanceEvent (Editor mode): {options.eventType}"); }

        #endregion

        #region Callback Management

        private string RegisterCallback(System.Delegate callback)
        {
            if (callback == null) return "";
            
            string callbackName = $"aitCallback_{callbackId++}";
            callbacks[callbackName] = callback;
            return callbackName;
        }

        // JavaScript에서 호출되는 콜백 메서드들
        public void OnAITCallback(string callbackData)
        {
            try
            {
                var data = JsonUtility.FromJson<CallbackData>(callbackData);
                if (callbacks.ContainsKey(data.callbackName))
                {
                    var callback = callbacks[data.callbackName];
                    
                    // 콜백 타입에 따라 적절한 파라미터로 호출
                    if (callback is Action<BaseResult>)
                    {
                        var result = AITBase.FromJson<BaseResult>(data.result);
                        ((Action<BaseResult>)callback)(result);
                    }
                    else if (callback is Action<UserInfoResult>)
                    {
                        var result = AITBase.FromJson<UserInfoResult>(data.result);
                        ((Action<UserInfoResult>)callback)(result);
                    }
                    else if (callback is Action<PaymentResult>)
                    {
                        var result = AITBase.FromJson<PaymentResult>(data.result);
                        ((Action<PaymentResult>)callback)(result);
                    }
                    else if (callback is Action<RewardResult>)
                    {
                        var result = AITBase.FromJson<RewardResult>(data.result);
                        ((Action<RewardResult>)callback)(result);
                    }
                    else if (callback is Action<StorageDataResult>)
                    {
                        var result = AITBase.FromJson<StorageDataResult>(data.result);
                        ((Action<StorageDataResult>)callback)(result);
                    }
                    else if (callback is Action<NetworkTypeResult>)
                    {
                        var result = AITBase.FromJson<NetworkTypeResult>(data.result);
                        ((Action<NetworkTypeResult>)callback)(result);
                    }
                    else if (callback is Action<DeviceInfoResult>)
                    {
                        var result = AITBase.FromJson<DeviceInfoResult>(data.result);
                        ((Action<DeviceInfoResult>)callback)(result);
                    }
                    else if (callback is Action<LocationResult>)
                    {
                        var result = AITBase.FromJson<LocationResult>(data.result);
                        ((Action<LocationResult>)callback)(result);
                    }
                    else if (callback is Action<ImageResult>)
                    {
                        var result = AITBase.FromJson<ImageResult>(data.result);
                        ((Action<ImageResult>)callback)(result);
                    }
                    else if (callback is Action<ImageListResult>)
                    {
                        var result = AITBase.FromJson<ImageListResult>(data.result);
                        ((Action<ImageListResult>)callback)(result);
                    }
                    else if (callback is Action<ClipboardTextResult>)
                    {
                        var result = AITBase.FromJson<ClipboardTextResult>(data.result);
                        ((Action<ClipboardTextResult>)callback)(result);
                    }
                    else if (callback is Action<AppVersionResult>)
                    {
                        var result = AITBase.FromJson<AppVersionResult>(data.result);
                        ((Action<AppVersionResult>)callback)(result);
                    }
                    else if (callback is Action<PermissionResult>)
                    {
                        var result = AITBase.FromJson<PermissionResult>(data.result);
                        ((Action<PermissionResult>)callback)(result);
                    }
                    else if (callback is Action<LoginStatusResult>)
                    {
                        var result = AITBase.FromJson<LoginStatusResult>(data.result);
                        ((Action<LoginStatusResult>)callback)(result);
                    }
                    else if (callback is Action<InitResult>)
                    {
                        var result = AITBase.FromJson<InitResult>(data.result);
                        ((Action<InitResult>)callback)(result);
                    }
                    else if (callback is Action)
                    {
                        ((Action)callback)();
                    }
                    
                    // 사용된 콜백 제거
                    callbacks.Remove(data.callbackName);
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"콜백 처리 중 오류 발생: {e.Message}");
            }
        }

        #endregion

        [System.Serializable]
        private class CallbackData
        {
            public string callbackName;
            public string result;
        }

        [System.Serializable]
        private class JSAdOptions
        {
            public string adGroupId;
            public string gameObject;
            public string loadedCallback;
            public string failedCallback;
            public string shownCallback;
            public string closedCallback;
            public string clickedCallback;
            public string rewardedCallback;
        }
    }
}
#endif