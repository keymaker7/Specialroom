# 특별실 예약 시스템 - 정적 HTML 버전

## 🎯 특징

- ✅ **완전 무료**: 빌드 과정 없음, 정적 파일만 사용
- ✅ **즉시 배포**: Vercel에 바로 업로드 가능
- ✅ **Google Sheets 연동**: 실시간 데이터베이스
- ✅ **반응형 디자인**: 모바일/태블릿/데스크톱 지원
- ✅ **테스트 데이터 포함**: API 없이도 즉시 테스트 가능

## 🚀 배포 방법

### 1. Vercel에 새 프로젝트 생성
1. [Vercel](https://vercel.com)에 로그인
2. **"New Project"** 클릭
3. GitHub 저장소 선택: `keymaker7/Specialroom`
4. **Root Directory**: `static-html-version`
5. **Framework Preset**: Other

### 2. 환경변수 설정 (선택사항)
```
VITE_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### 3. 배포 완료!
- 빌드 과정 없이 즉시 배포됩니다
- 테스트 데이터로 바로 동작 확인 가능

## 🔧 Google Sheets 연동 (선택사항)

### 1. Google Sheets 생성
- 새 스프레드시트 생성: "특별실예약시스템"
- 시트: `rooms`, `classes`, `reservations`

### 2. Apps Script 설정
```javascript
// 이미 준비된 코드를 google-apps-script/main-correct.gs에서 복사
```

### 3. 웹 앱 배포
- **배포** → **새 배포** → **웹 앱**
- **액세스**: 모든 사용자
- URL 복사 후 Vercel 환경변수에 추가

## 📁 파일 구조

```
static-html-version/
├── index.html          # 메인 HTML 파일
├── app.js             # JavaScript 애플리케이션
├── vercel.json        # Vercel 배포 설정
└── README.md          # 이 파일
```

## 🎮 기능

### 📊 대시보드
- 실시간 통계 (특별실, 예약, 학급)
- 최근 예약 목록
- 시각적 요약 정보

### 📅 주간 현황
- 7일간 예약 캘린더
- 일별 예약 현황 한눈에 보기

### 📋 예약 관리
- 새 예약 생성
- 예약 목록 조회
- 필터링 (날짜, 특별실)
- 예약 삭제

### 🏢 특별실 관리
- 11개 특별실 목록
- 특별실별 예약 통계

### 📈 통계
- 특별실별 이용률 차트
- 학급별 예약 현황 차트

## 🔗 실시간 연동 후 기능

Google Sheets API 연동 완료 시:
- ✅ 실시간 데이터 동기화
- ✅ 예약 생성/삭제
- ✅ 다중 사용자 동시 접근
- ✅ 자동 백업 (Google Drive)

## 🛠️ 개발자 도구

브라우저 콘솔에서 사용 가능:

```javascript
// API URL 설정
window.specialRoomSystem.setApiUrl('https://your-script-url');

// 현재 상태 확인
window.specialRoomSystem.getState();

// 데이터 다시 로드
window.specialRoomSystem.loadData();

// 테스트 데이터 정보 보기
window.specialRoomSystem.showTestData();
```

## 📱 브라우저 지원

- ✅ Chrome, Firefox, Safari, Edge (최신 버전)
- ✅ 모바일 브라우저
- ✅ 태블릿

## 🆘 문제 해결

### Q: 테스트 데이터만 보여요
A: Google Apps Script URL을 설정하지 않으면 테스트 데이터가 표시됩니다. 실제 데이터를 사용하려면 환경변수를 설정하세요.

### Q: 예약이 저장되지 않아요
A: 브라우저 콘솔에서 `window.specialRoomSystem.setApiUrl('실제URL')`을 실행하거나 Vercel 환경변수를 확인하세요.

### Q: 모바일에서 화면이 깨져요
A: Tailwind CSS가 자동으로 반응형을 처리합니다. 캐시를 삭제해보세요.

## 📞 지원

- 이슈가 있으면 GitHub Issues에 등록해주세요
- 기능 추가 요청도 환영합니다!

---

**💡 팁**: API 연동 없이도 모든 기능을 테스트할 수 있습니다! 