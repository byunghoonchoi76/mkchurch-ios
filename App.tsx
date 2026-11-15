import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';

// React 19 타입과 react-native-webview 14(클래스 컴포넌트)의 JSX 타입이 충돌해서
// 생기는 타입 전용 경고를 피하기 위한 별칭입니다. (런타임 동작에는 영향 없음)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RNWebView = WebView as any;

/** 로드할 PWA 주소 (GitHub Pages에 배포된 '목양교회 기도' 웹앱) */
const APP_URL = 'https://byunghoonchoi76.github.io/mkchurch-prayer/';
const APP_HOST = 'byunghoonchoi76.github.io';
const BG = '#104C6E';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const webRef = useRef<WebView | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  // 첫 화면이 그려지면 스플래시를 내립니다.
  const onLoadEnd = useCallback(() => {
    setLoading(false);
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // 같은 도메인(목양교회 기도)은 앱 안에서 열고, 외부 링크(유튜브·전화·메일 등)는 시스템 브라우저로.
  const onShouldStartLoad = useCallback((req: WebViewNavigation) => {
    const url = req.url;
    if (url.startsWith('about:') || url.startsWith('data:')) return true;
    try {
      const host = new URL(url).host;
      if (host === APP_HOST) return true;
    } catch {
      return true; // 파싱 실패 시 그냥 허용
    }
    // 외부 링크는 밖에서
    Linking.openURL(url).catch(() => {});
    return false;
  }, []);

  const reload = useCallback(() => {
    setFailed(false);
    setLoading(true);
    webRef.current?.reload();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        {failed ? (
          <View style={styles.center}>
            <Text style={styles.msg}>인터넷 연결을 확인해 주세요.</Text>
            <Pressable style={styles.btn} onPress={reload}>
              <Text style={styles.btnText}>다시 시도</Text>
            </Pressable>
          </View>
        ) : (
          <RNWebView
            ref={webRef}
            source={{ uri: APP_URL }}
            style={styles.web}
            onLoadEnd={onLoadEnd}
            onError={() => setFailed(true)}
            onHttpError={() => {}}
            onShouldStartLoadWithRequest={onShouldStartLoad}
            allowsBackForwardNavigationGestures
            pullToRefreshEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            originWhitelist={['https://*', 'about:*', 'data:*']}
            decelerationRate="normal"
            overScrollMode="never"
            setSupportMultipleWindows={false}
          />
        )}

        {loading && !failed ? (
          <View style={styles.loader} pointerEvents="none">
            <ActivityIndicator size="large" color="#F2C14E" />
          </View>
        ) : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  web: { flex: 1, backgroundColor: BG },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BG,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, padding: 24, backgroundColor: BG },
  msg: { color: '#fff', fontSize: 17, fontWeight: '600', textAlign: 'center' },
  btn: { backgroundColor: '#F2C14E', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24 },
  btnText: { color: '#0b2435', fontSize: 16, fontWeight: '800' },
});
