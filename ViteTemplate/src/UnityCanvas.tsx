import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    createUnityInstance: any;
  }
}

const UnityCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const unityInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Unity loader 스크립트 동적 로드
    const script = document.createElement('script');
    script.src = '/unity/Build/__UNITY_BUILD_NAME__.loader.js';

    script.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.id = 'unity-canvas';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';

      const container = containerRef.current;
      if (!container) return;
      container.appendChild(canvas);

      // Unity 인스턴스 생성
      window.createUnityInstance(canvas, {
        dataUrl: '/unity/Build/__UNITY_BUILD_NAME__.data',
        frameworkUrl: '/unity/Build/__UNITY_BUILD_NAME__.framework.js',
        codeUrl: '/unity/Build/__UNITY_BUILD_NAME__.wasm',
        streamingAssetsUrl: '/unity/StreamingAssets',
        companyName: '__COMPANY_NAME__',
        productName: '__PRODUCT_NAME__',
        productVersion: '__PRODUCT_VERSION__',
      }).then((instance: any) => {
        unityInstanceRef.current = instance;
        console.log('[AIT] Unity 인스턴스 로드 완료');
      }).catch((err: any) => {
        console.error('[AIT] Unity 인스턴스 생성 실패:', err);
      });
    };

    script.onerror = () => {
      console.error('[AIT] Unity loader 스크립트 로드 실패');
    };

    document.body.appendChild(script);

    return () => {
      // 클린업
      if (script.parentNode) {
        document.body.removeChild(script);
      }
      if (unityInstanceRef.current && unityInstanceRef.current.Quit) {
        unityInstanceRef.current.Quit();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="unity-container"
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    />
  );
};

export default UnityCanvas;
