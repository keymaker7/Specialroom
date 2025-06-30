# 📊 Google Sheets 버전 배포 가이드

## 🎯 개요

이 가이드는 **Google Sheets를 데이터베이스로 사용**하는 특별실 예약 시스템을 배포하는 방법을 설명합니다.

### ✨ 주요 장점
- 🆓 **완전 무료**: 영원히 비용 없음
- 📝 **관리 편함**: Google Sheets에서 직접 데이터 편집
- 👥 **협업 가능**: 여러 선생님이 동시 편집
- 🔄 **실시간 동기화**: 변경 사항 즉시 반영
- 📱 **모바일 최적화**: 스마트폰에서도 관리 가능

---

## 🚀 1단계: Google Sheets 생성

### 1.1 새 스프레드시트 생성
1. [Google Sheets](https://sheets.google.com) 접속
2. **빈 스프레드시트** 생성
3. 이름: `특별실예약시스템DB` (원하는 이름으로 변경 가능)

### 1.2 시트 구성
기본 Sheet1을 다음과 같이 변경:

1. **Sheet1** → **rooms** (특별실 목록)
2. **Sheet2 추가** → **classes** (학급 목록)
3. **Sheet3 추가** → **reservations** (예약 목록)

### 1.3 시트 헤더 설정

#### **rooms 시트**
```
A1: id    B1: name        C1: description                    D1: usage_notes                           E1: conflict_warnings    F1: recommended_grades  G1: is_active  H1: created_at
A2: 1     B2: 표현무용실      C2: 표현활동과 무용 수업용         D2: 실내화 착용 필수, 매트 사용          E2: 행사 시 사용 불가    F2: 전학년               G2: TRUE      H2: 2024-01-01T09:00:00.000Z
A3: 2     B3: 놀이활동실1     C3: 놀이 및 체육 활동용            D3: 안전 장비 착용, 정리정돈 필수        E3: 우천 시 집중 사용    F3: 1,2학년             G3: TRUE      H3: 2024-01-01T09:00:00.000Z
A4: 3     B4: 놀이활동실2     C4: 놀이 및 체육 활동용            D4: 안전 장비 착용, 정리정돈 필수        E4: 우천 시 집중 사용    F4: 1,2학년             G4: TRUE      H4: 2024-01-01T09:00:00.000Z
A5: 4     B5: 운동장          C5: 야외 체육 활동 및 행사용       D5: 날씨 확인 필수, 안전사고 주의        E5: 우천 시 사용 불가    F5: 전학년               G5: TRUE      H5: 2024-01-01T09:00:00.000Z
A6: 5     B6: 풋살장          C6: 축구 및 풋살 활동용            D6: 축구화 착용 권장, 안전 수칙 준수     E6: 우천 시 사용 불가    F6: 3,4,5,6학년         G6: TRUE      H6: 2024-01-01T09:00:00.000Z
A7: 6     B7: 제1컴퓨터실     C7: 컴퓨터 수업 및 정보 활용       D7: 개인 USB 준비, 조용히 수업          E7: 시험 기간 사용 제한  F7: 전학년               G7: TRUE      H7: 2024-01-01T09:00:00.000Z
A8: 7     B8: 제2컴퓨터실     C8: 컴퓨터 수업 및 정보 활용       D8: 개인 USB 준비, 조용히 수업          E8: 시험 기간 사용 제한  F8: 전학년               G8: TRUE      H8: 2024-01-01T09:00:00.000Z
A9: 8     B9: 야외정원        C9: 자연 관찰 및 야외 수업용       D9: 날씨 확인 필수, 벌레 주의           E9: 우천 시 사용 불가    F9: 전학년               G9: TRUE      H9: 2024-01-01T09:00:00.000Z
A10: 9  B10: 시청각실       C10: 영상 시청 및 발표용           D10: 조용히 사용, 장비 사용법 숙지      E10: 행사 시 사용 불가   F10: 전학년              G10: TRUE     H10: 2024-01-01T09:00:00.000Z
```

#### **classes 시트**
```
A1: id   B1: name      C1: grade   D1: class_number   E1: teacher_name   F1: student_count   G1: created_at
A2: 1    B2: 1학년1반   C2: 1       D2: 1              E2: 김영희          F2: 25             G2: 2024-01-01T09:00:00.000Z
A3: 2    B3: 1학년2반   C3: 1       D3: 2              E3: 이철수          F3: 24             G3: 2024-01-01T09:00:00.000Z
A4: 3    B4: 1학년3반   C4: 1       D4: 3              E4: 박민수          F4: 26             G4: 2024-01-01T09:00:00.000Z
A5: 4    B5: 1학년4반   C5: 1       D5: 4              E5: 정수정          F5: 25             G5: 2024-01-01T09:00:00.000Z
A6: 5    B6: 1학년5반   C6: 1       D6: 5              E6: 한민정          F6: 24             G6: 2024-01-01T09:00:00.000Z
A7: 6    B7: 1학년6반   C7: 1       D7: 6              E7: 송기현          F7: 25             G7: 2024-01-01T09:00:00.000Z
```

#### **reservations 시트**
```
A1: id   B1: room_id   C1: class_id   D1: date       E1: periods   F1: purpose      G1: notes   H1: status   I1: created_at   J1: updated_at
A2: (예약 데이터는 웹사이트에서 자동 추가됩니다)
```

---

## 🔧 2단계: Google Apps Script API 생성

### 2.1 Apps Script 열기
1. Google Sheets에서 **확장 프로그램** → **Apps Script** 클릭
2. 새 프로젝트가 열림
3. 프로젝트 이름: `특별실예약API` (원하는 이름으로 변경 가능)

### 2.2 코드 복사
1. 기본 `function myFunction()` 코드 삭제
2. `/google-apps-script/main.gs` 파일의 모든 내용 복사 붙여넣기
3. **Ctrl+S**로 저장

### 2.3 초기 설정 실행
1. **함수 선택** 드롭다운에서 `initializeSheets` 선택
2. **실행** 버튼 클릭
3. 권한 요청 시 **검토** → **고급** → **프로젝트 이름으로 이동** → **허용**
4. 실행 완료 후 Google Sheets로 돌아가서 데이터가 추가되었는지 확인

### 2.4 웹 앱으로 배포
1. Apps Script에서 **배포** → **새 배포** 클릭
2. **유형**: 웹 앱 선택
3. **설명**: `특별실 예약 API v1.0`
4. **실행 대상**: 나
5. **액세스 권한**: 모든 사용자 (로그인 불필요)
6. **배포** 클릭
7. **웹 앱 URL** 복사 (나중에 사용)

> ⚠️ **중요**: 웹 앱 URL을 안전한 곳에 저장하세요!

---

## 🌐 3단계: Vercel 프론트엔드 배포

### 3.1 GitHub 저장소 생성
1. GitHub에서 새 저장소 생성
2. `google-sheets-version` 폴더의 모든 파일 업로드
3. 커밋 & 푸시

### 3.2 Vercel 배포
1. [Vercel](https://vercel.com) 로그인 (GitHub 계정 사용)
2. **Add New** → **Project** 클릭
3. GitHub 저장소 선택
4. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./google-sheets-version` (또는 저장소 루트)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 환경변수 설정
1. Vercel 프로젝트 **Settings** → **Environment Variables**
2. 다음 변수 추가:
   ```
   Name: VITE_GOOGLE_SCRIPT_URL
   Value: [2.4단계에서 복사한 웹 앱 URL]
   ```
3. **Save** 클릭

### 3.4 재배포
1. **Deployments** 탭으로 이동
2. 최신 배포에서 **... (점 3개)** → **Redeploy** 클릭
3. 배포 완료 후 사이트 접속하여 테스트

---

## 🎉 4단계: 완료 및 테스트

### 4.1 기능 테스트
1. 웹사이트 접속
2. 대시보드에서 데이터 확인
3. 새 예약 생성 테스트
4. Google Sheets에서 데이터 변경 후 웹사이트 새로고침

### 4.2 Google Sheets에서 직접 관리
1. **특별실 추가**: rooms 시트에 새 행 추가
2. **학급 추가**: classes 시트에 새 행 추가
3. **예약 관리**: reservations 시트에서 직접 편집/삭제

---

## 🔧 고급 설정

### 권한 관리
1. Google Sheets **공유** 클릭
2. 관리할 선생님들 이메일 추가
3. **편집자** 권한 부여

### 백업 설정
- Google Drive에서 자동 백업됨
- 버전 기록으로 변경 이력 추적 가능

### 모바일 접근
- Google Sheets 앱에서 언제든 관리 가능
- 웹사이트는 모바일 친화적 디자인

---

## 🆘 문제 해결

### API가 작동하지 않는 경우
1. Apps Script 배포 URL 확인
2. 환경변수 `VITE_GOOGLE_SCRIPT_URL` 올바른지 확인
3. Apps Script 권한 재설정

### 데이터가 표시되지 않는 경우
1. Google Sheets 시트 이름 확인 (rooms, classes, reservations)
2. 헤더 행이 올바른지 확인
3. 브라우저 개발자 도구에서 오류 확인

### 예약이 추가되지 않는 경우
1. Apps Script 실행 권한 확인
2. Google Sheets 편집 권한 확인
3. 네트워크 연결 상태 확인

---

## 📞 지원

문제가 발생하면:
1. 브라우저 개발자 도구 (F12) 에서 오류 메시지 확인
2. Google Apps Script 로그 확인
3. GitHub Issues에 문의

## 🎊 축하합니다!

Google Sheets 기반 특별실 예약 시스템이 성공적으로 배포되었습니다! 

이제 **완전 무료**로 **실시간 협업**이 가능한 시스템을 사용할 수 있습니다! 🎉 