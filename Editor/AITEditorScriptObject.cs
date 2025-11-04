using UnityEngine;

namespace AppsInToss
{
    /// <summary>
    /// Apps in Toss Editor 설정 오브젝트
    /// </summary>
    [System.Serializable]
    public class AITEditorScriptObject : ScriptableObject
    {
        [Header("앱 기본 정보")]
        public string appName = "my-unity-game";
        public string displayName = "my-unity-game";
        public string version = "1.0.0";
        public string description = "Apps in Toss 미니앱 게임";

        [Header("브랜드 설정")]
        public string primaryColor = "#3182F6";
        public string iconUrl = "";

        [Header("개발 서버 설정")]
        public int localPort = 5173;

        [Header("빌드 설정")]
        public bool isProduction = false;
        public bool enableOptimization = true;
        public bool enableCompression = false;

        [Header("토스페이 설정")]
        public string tossPayMerchantId = "";
        public string tossPayClientKey = "";

        [Header("광고 설정")]
        public bool enableAdvertisement = false;
        public string interstitialAdGroupId = "ait-ad-test-interstitial-id";
        public string rewardedAdGroupId = "ait-ad-test-rewarded-id";

        [Header("배포 설정")]
        public string deploymentKey = "";

        [Header("권한 설정")]
        public string[] permissions = new string[] { "userInfo", "location", "camera" };

        [Header("플러그인 설정")]
        public string[] plugins = new string[] { };
    }
}
