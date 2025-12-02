# Apps in Toss Unity SDK

Apps in Toss 플랫폼을 위한 Unity/Tuanjie 엔진 SDK입니다.

## 설치 가이드

Unity 엔진 또는 [Tuanjie 엔진](https://unity.cn/tuanjie/tuanjieyinqing)으로 게임 프로젝트를 생성/열기한 후,
Unity Editor 메뉴바에서 `Window` - `Package Manager` - `오른쪽 상단 + 버튼` - `Add package from git URL...`을 클릭하여 본 저장소 Git 리소스 주소를 입력하면 됩니다.

## 지원 Unity 버전

- **최소 버전**: Unity 2021.3 LTS
- **권장 버전**: Unity 2022.3 LTS 이상
- Tuanjie Engine 지원

## 주요 기능

### 플랫폼 연동
- **WebGL 최적화**: Apps in Toss 환경에 최적화된 WebGL 빌드
- **자동 변환**: Unity 프로젝트를 Apps in Toss 미니앱으로 자동 변환
- **성능 최적화**: 모바일 환경에 최적화된 성능 튜닝

### API 기능
- **결제**: 토스페이 결제 연동 (`CheckoutPayment`)
- **사용자 인증**: 앱 로그인 및 사용자 정보 (`AppLogin`, `GetUserKeyForGame`)
- **기기 정보**: 기기 ID, 플랫폼, 네트워크 상태 조회
- **권한 관리**: 카메라, 연락처 등 권한 요청 및 확인
- **위치 서비스**: 현재 위치 조회
- **피드백**: 햅틱 피드백, 클립보드 접근
- **공유**: 컨텐츠 공유 기능

## 시작하기

### 1. SDK 설치

Package Manager에서 Git URL로 설치하거나, Packages/manifest.json에 직접 추가:

```json
{
  "dependencies": {
    "com.toss.appsintoss": "https://github.toss.bz/toss/apps-in-toss-unity-sdk.git"
  }
}
```

### 2. 기본 설정

Unity Editor에서 `Apps in Toss > Build & Deploy Window` 메뉴를 클릭하여 설정 패널을 열고:
- 앱 ID 입력
- 아이콘 URL 입력 (필수)
- 빌드 설정 구성

### 3. SDK 사용 예제

```csharp
using AppsInToss;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    void Start()
    {
        // 기기 ID 조회
        string deviceId = AIT.GetDeviceId();
        Debug.Log($"Device ID: {deviceId}");

        // 플랫폼 OS 조회
        AIT.GetPlatformOS((os) => {
            Debug.Log($"Platform: {os}");
        });

        // 네트워크 상태 확인
        AIT.GetNetworkStatus((status) => {
            Debug.Log($"Network: {status}");
        });
    }

    // 결제 요청 예제
    public void RequestPayment()
    {
        var options = new CheckoutPaymentOptions {
            // 결제 옵션 설정
        };

        AIT.CheckoutPayment(options, (result) => {
            Debug.Log($"Payment result: {result}");
        });
    }

    // 햅틱 피드백 예제
    public void VibrateDevice()
    {
        var options = new HapticFeedbackOptions {
            // 피드백 옵션 설정
        };

        AIT.GenerateHapticFeedback(options, () => {
            Debug.Log("Haptic feedback generated");
        });
    }
}
```

### 4. 빌드 및 배포

1. `Apps in Toss > Build & Deploy Window` 메뉴 클릭
2. 설정 확인 후 "🚀 Build & Package" 클릭
3. 빌드 완료 후 `ait-build/dist/` 폴더에서 결과물 확인
4. `npm run deploy`로 Apps in Toss 플랫폼에 배포

## 자주 묻는 질문

### Q1. 빌드 시 Node.js가 없다는 오류가 발생합니다

SDK는 시스템에 Node.js가 설치되어 있지 않아도 자동으로 내장 Node.js를 다운로드합니다.
다운로드 다이얼로그가 표시되면 "다운로드"를 선택하세요.

### Q2. 아이콘 URL을 입력하라는 오류가 발생합니다

Build & Deploy Window에서 앱 아이콘 URL을 반드시 입력해야 합니다.
이 URL은 Apps in Toss 앱에서 미니앱 아이콘으로 표시됩니다.

### Q3. Unity Editor에서 API 호출 시 Mock 로그만 출력됩니다

SDK API는 WebGL 빌드에서만 실제로 동작합니다.
Unity Editor에서는 Mock 구현이 호출되어 테스트 로그만 출력됩니다.
실제 동작은 WebGL로 빌드 후 Apps in Toss 앱에서 확인하세요.

## 테스트 전략

본 SDK는 2단계 검증 시스템을 사용합니다:

### 1. SDK Generator 문법 검증 (빠름, ~10초)
**위치**: `sdk-runtime-generator~/tests/unit/`

**검증 항목**:
- ✅ C# 코드 컴파일 가능 여부 (Roslyn/Mono)
- ✅ JavaScript 문법 오류 검사 (TypeScript Compiler API)
- ✅ jslib mergeInto 패턴 정합성

**실행 방법**:
```bash
cd sdk-runtime-generator~
pnpm install
pnpm test
```

**언제 실행?**
- SDK Generator 코드 수정 후
- `pnpm generate` 실행 후
- Pull Request 생성 전

---

### 2. SDK Runtime E2E 테스트 (느림, ~30분)
**위치**: `Tests~/E2E/tests/e2e-full-pipeline.test.js`

**Test 7: Runtime API Tests**가 SDK의 실제 동작을 검증합니다.

**검증 항목**:
- ✅ C# API → jslib 함수 호출 성공
- ✅ 콜백 기반 비동기 처리 동작
- ✅ 타입 마샬링 (C# string/double/bool ↔ JavaScript)
- ✅ 브라우저 WebGL 환경 실행
- ✅ 성능 벤치마크 (빌드 크기, 로딩 시간, FPS)

**실행 방법**:
```bash
# 전체 E2E 테스트 (Unity 빌드 포함)
./run-local-tests.sh --all

# E2E 테스트만 (기존 빌드 사용)
./run-local-tests.sh --e2e

# 특정 Unity 버전 지정
./run-local-tests.sh --all --unity-version 2022.3
```

**결과 확인**:
```bash
cat Tests~/E2E/tests/e2e-test-results.json
```

**언제 실행?**
- Pull Request 머지 전 최종 검증
- CI/CD 파이프라인 (GitHub Actions)
- 릴리스 전 품질 보증

---

### 테스트 결과 리포트

E2E 테스트 완료 후 `e2e-test-results.json`에서 다음 정보를 확인할 수 있습니다:

```json
{
  "tests": {
    "7_runtime_api": {
      "successRate": 95.5,
      "runtimeValidation": {
        "csharpJslibMatching": {
          "matched": 42,
          "unmatched": 2
        },
        "typeMarshalling": {
          "stringPassed": 15,
          "numberPassed": 8,
          "booleanPassed": 5,
          "objectPassed": 12
        }
      }
    }
  }
}
```

**주요 메트릭**:
- **C# ↔ jslib Matching**: C# API가 올바른 jslib 함수를 호출하는지 검증
- **Type Marshalling**: C#과 JavaScript 간 타입 변환 성공 여부
- **Success Rate**: 전체 API 호출 성공률 (최소 80% 요구)
