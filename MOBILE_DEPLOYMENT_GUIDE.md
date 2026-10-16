# 📱 Android vs iOS 배포 및 운영 가이드 비교

블루 가디언즈(Capacitor 기반 크로스 플랫폼 앱)의 **Google Play Store(Android)** 와 **Apple App Store(iOS)** 배포 및 운영 차이점을 정리한 가이드 문서입니다.

---

## 1. 📊 핵심 차이점 요약 비교표

| 비교 항목 | 🤖 Google Play Store (Android) | 🍎 Apple App Store (iOS) |
| :--- | :--- | :--- |
| **필수 빌드 장비** | **Windows, Mac, Linux 모두 가능** | **반드시 Mac(macOS 기기) 필수** |
| **개발 도구** | Android Studio | Xcode |
| **개발자 계정 비용** | **$25 (최초 1회 결제, 평생 유지)** | **$99 / 매년 (연간 구독형)** |
| **최종 빌드 산출물** | `.aab` (Android App Bundle) | `.ipa` / Xcode Archive 업로드 |
| **앱 서명(Signing) 방식** | Keystore (`.jks` 파일) 직접 생성 및 관리 | Apple 인증서(Certificates) + 프로비저닝 프로파일 |
| **베타 테스트 플랫폼** | Google Play 콘솔 (내부/비공개/공개 테스트) | **TestFlight** (간편하고 강력함) |
| **개인 개발자 심사 요건** | **2023.11 이후 생성된 개인 계정: 20명 14일 비공개 테스트 필수** | 별도 테스터 수 요건 없음 (바로 심사 제출 가능) |
| **평균 심사 소요 시간** | 첫 출시: 1~3일 / 업데이트: 수 시간~1일 | 첫 출시: 24~48시간 / 업데이트: 12~24시간 |

---

## 2. 💻 개발 및 빌드 환경 차이

### 🤖 Android
- **운영체제 제약 없음**: 현재 사용 중인 Windows 환경에서 즉시 빌드 및 출시 가능.
- **실행 명령어**:
  ```bash
  npm run build
  npx cap sync android
  npm run cap:android   # Android Studio 자동 실행
  ```
- **빌드 메뉴**: `Build` → `Generate Signed Bundle / APK...` → `Android App Bundle`
- **업로드 키(Upload Key)**: `C:\Users\USER\keystores\blueoceanguardians\upload-keystore.jks` (alias `upload`, 비밀번호는 같은 폴더 `keystore-info.txt`). 모든 업데이트는 이 키로 서명해야 하므로 폴더째 안전한 곳에 백업.
- **산출물 위치**: `android/app/build/outputs/bundle/release/app-release.aab`
- **업데이트 시**: `android/app/build.gradle`의 `versionCode`를 직전 업로드보다 크게 올린 뒤 빌드. 한 번 업로드한 번호는 출시하지 않았어도 재사용 불가 (첫 심사는 versionCode 2로 제출됨).
- **R8 코드 최적화(필수)**: `android/app/build.gradle`의 `buildTypes.release`에 `minifyEnabled true`, `shrinkResources true`, `proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'`. 끄면 Play Console에 "DEX 코드 최적화가 기준점 미만"(난독화 비율 25% 미만) 경고가 뜸. Capacitor와 플러그인(@CapacitorPlugin, @PluginMethod)은 Capacitor의 보호 규칙으로 유지되며, 난독화 매핑 파일은 AAB(`BUNDLE-METADATA/.../proguard.map`)에 자동 포함됨. 설정을 바꾸면 출시용 APK(`assembleRelease`)를 에뮬레이터에 설치해 실행·로그인·키보드·생체인증을 확인할 것.
- **Gradle JDK는 21 사용**: Android Studio의 Gradle JDK는 `temurin-21`로 설정되어 있음(`Settings → Build, Execution, Deployment → Build Tools → Gradle → Gradle JDK`). 명령줄로 `gradlew`를 실행할 때는 `JAVA_HOME`을 JDK 21로 지정해야 함. Android Studio 내장 JDK(Java 25)로는 Gradle 8.14.3이 `Unsupported class file major version 69`로 실패.
- **네이티브 권한 설정** (`android/`, `ios/`는 git 미포함이므로 `npx cap add`로 다시 만들면 재적용 필요):
  - `android/app/src/main/AndroidManifest.xml`: `<uses-permission android:name="android.permission.USE_BIOMETRIC" />` (`USE_FINGERPRINT`는 androidx.biometric이 자동 병합하므로 추가하지 않음. 파일 첨부는 `capture` 없는 시스템 파일 선택기라 카메라·저장소 권한 불필요)
  - `ios/App/App/Info.plist` (없으면 해당 기능 사용 시 앱 종료):
    - `NSFaceIDUsageDescription`: Face ID 간편 로그인
    - `NSCameraUsageDescription`: 파일 첨부(`accept="image/*,video/*"`)의 "사진 또는 비디오 찍기"
    - `NSMicrophoneUsageDescription`: 같은 메뉴의 동영상 촬영(소리 녹음)
- **Gradle `PKIX path building failed` 오류**: Norton 백신의 HTTPS 검사(Web/Mail Shield)가 인증서를 자체 루트(`Norton Web/Mail Shield Root`)로 재서명하는데, Android Studio 내장 JDK(JBR)는 이 루트를 신뢰하지 않아 발생. **관리자 권한 PowerShell**에서 아래를 실행해 JBR에 등록 (Android Studio 업데이트 후 재실행 필요):
  ```powershell
  Get-ChildItem Cert:\LocalMachine\Root | Where-Object Subject -like '*Norton Web/Mail Shield Root*' | Select-Object -First 1 | Export-Certificate -FilePath "$env:TEMP\norton-root.cer"
  & "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -importcert -noprompt -alias norton-web-mail-shield -file "$env:TEMP\norton-root.cer" -cacerts -storepass changeit
  ```

### 🍎 iOS
- **Mac 필수**: Windows PC에서는 iOS 앱 컴파일 및 `.ipa` 생성이 기술적으로 불가능합니다 (Macbook, Mac mini 또는 클라우드 Mac 인스턴스 필요).
- **실행 명령어 (Mac 환경에서)**:
  ```bash
  npm run build
  npx cap sync ios
  npm run cap:ios       # Xcode 자동 실행
  ```
- **빌드 메뉴**: Xcode 상단 `Product` → `Archive` → `Distribute App` (App Store Connect 직접 전송)

---

## 3. ⚖️ 스토어 심사 정책 및 필수 준수 사항

### ① 회원 탈퇴(계정 삭제) 기능 제공
- **Android**: 권장 및 점진적 의무화
- **iOS**: **엄격한 필수 (App Store Review Guideline 5.1.1(v))**
  - 앱 내에서 회원가입이 가능한 경우, 앱 내에서 즉시 탈퇴(데이터 영구 삭제)할 수 있는 UI를 제공해야 합니다.
  - ✅ **현재 프로젝트 반영 여부**: `MyPage.tsx` 내 `authService.deleteAccount` 구현 완료

### ② 개인정보처리방침 (Privacy Policy)
- **공통 필수**: 두 스토어 모두 작동하는 웹 URL 입력이 필수입니다.
- ✅ **현재 프로젝트 반영 여부**: `/privacy` 단독 페이지 생성 완료 (`https://[배포도메인]/privacy`)

### ③ 단순 웹뷰 래핑 거절 방지 (Guideline 4.2 Minimum Functionality)
- 웹사이트를 그대로 웹뷰로 감싸기만 한 앱은 Apple에서 심사 거절될 수 있습니다.
- ✅ **현재 프로젝트 대비책**:
  - 네이티브 바텀 탭바(`BottomTabBar.tsx`) 내장
  - 모바일 웹뷰 터치 튕김, 드래그 방지, Safe-Area 대응 완료 (`index.css`)

---

## 4. 🎨 스토어 등록용 그래픽 에셋 규격 비교

| 에셋 종류 | 🤖 Google Play Store | 🍎 Apple App Store |
| :--- | :--- | :--- |
| **앱 아이콘** | **512 x 512 px** (PNG, 32비트) | **1024 x 1024 px** (PNG, 알파 채널 없음) |
| **대표 그래픽 이미지** | **1024 x 500 px** (필수) | 필수 아님 (프로모션 배너 별도) |
| **스크린샷 규격** | 최소 2장 이상 (모바일 비율) | **6.7형(iPhone Pro Max용) / 6.5형** 등 기기별 규격 필수 (최소 1세트) |

---

## 5. 🔄 출시 후 수정사항(업데이트) 배포 방법 비교

### 🤖 Android 업데이트
1. `android/app/build.gradle`에서 `versionCode`를 1 올림 (예: 1 → 2)
2. `npm run cap:sync` 후 Android Studio에서 새 `.aab` 생성
3. Play Console `프로덕션` → `새 버전 만들기`에 업로드 후 제출

### 🍎 iOS 업데이트
1. Xcode 프로젝트 설정(General)에서 `Build` 번호를 1 올림 (예: 1 → 2)
2. `npm run cap:sync` 후 Xcode에서 `Product` → `Archive` 실행
3. App Store Connect에 업로드 후 새 버전 심사 제출

---

## 💡 추천 전략 요약

1. **1단계 (현재 Windows PC)**:
   - 웹(Amplify) 배포 진행 → 개인정보처리방침 URL 확보
   - Android Studio로 Google Play Console에 AAB 빌드 및 먼저 배포
2. **2단계 (Mac 환경 확보 시)**:
   - 동일한 소스 코드를 Mac으로 가져가 `npm run cap:ios` 실행
   - Apple 개발자 계정($99/년) 가입 후 App Store Connect에 TestFlight / App Store 배포
