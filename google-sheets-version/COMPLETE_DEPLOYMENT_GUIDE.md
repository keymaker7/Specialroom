# 🎯 **Replit과 100% 동일한 UI - Google Sheets 버전 배포 가이드**

> **✅ 완성!** 이 버전은 Replit 원본과 **UI가 완전히 동일**합니다!

## 🔥 **이 버전의 특징**

### ✨ **Replit 원본과 100% 동일**
- ✅ **모든 페이지**: 주간 현황, 캘린더, 예약 관리, 대시보드, 통계, 특별실 관리, 설정
- ✅ **모든 컴포넌트**: 사이드바, 헤더, 모달, 폼 등 모든 UI 요소
- ✅ **모든 기능**: 예약 생성/수정/삭제, 통계, 필터링, 검색 등
- ✅ **동일한 디자인**: Tailwind CSS, 애니메이션, 반응형 디자인

### 🚀 **Google Sheets의 추가 장점**
- 📊 **관리자 친화적**: Google Sheets에서 직접 데이터 편집
- 👥 **실시간 협업**: 여러 선생님이 동시에 Google Sheets 편집
- 📱 **모바일 앱**: Google Sheets 앱으로 언제든지 확인/수정
- 🔄 **자동 백업**: Google Drive 자동 백업
- 💰 **완전 무료**: 영원히 비용 없음

---

## 📋 **배포 단계 (약 30분)**

### **1단계: Google Sheets 생성 (5분)**

1. **[Google Sheets](https://sheets.google.com)** 접속 → 새 스프레드시트 생성

2. **시트 이름 변경**:
   - `Sheet1` → `rooms` (특별실)
   - 하단 `+` 버튼으로 시트 추가:
     - `classes` (학급)
     - `reservations` (예약)

3. **각 시트 헤더 설정**:

**rooms 시트 (A1~E1)**:
```
id	name	description	capacity	isActive
```

**classes 시트 (A1~D1)**:
```
id	name	grade	section
```

**reservations 시트 (A1~H1)**:
```
id	roomId	classId	date	timeSlot	teacherName	purpose	createdAt
```

4. **기본 데이터 입력**:

**rooms 시트에 기본 특별실 입력**:
```
1	강당	체육 활동용	200	TRUE
2	놀이활동실1	1,2학년 놀이활동	30	TRUE
3	놀이활동실2	3-6학년 활동	30	TRUE
4	표현무용실	무용, 표현활동	25	TRUE
5	운동장	야외 체육활동	300	TRUE
6	풋살장	풋살, 소규모 체육	20	TRUE
7	컴퓨터실1	ICT 교육	28	TRUE
8	컴퓨터실2	ICT 교육	28	TRUE
9	과학실1	과학 실험	24	TRUE
10	과학실2	과학 실험	24	TRUE
11	음악실1	음악 수업	30	TRUE
12	음악실2	음악 수업	30	TRUE
13	미술실1	미술 활동	28	TRUE
14	미술실2	미술 활동	28	TRUE
15	영어체험실	영어 회화	20	TRUE
16	도서실	독서, 자습	50	TRUE
```

**classes 시트에 학급 입력**:
```
1-1	1학년 1반	1	1
1-2	1학년 2반	1	2
... (1-8반까지)
2-1	2학년 1반	2	1
... (2-8반까지)
3-1	3학년 1반	3	1
... (3-11반까지)
4-1	4학년 1반	4	1
... (4-11반까지)
5-1	5학년 1반	5	1
... (5-10반까지)
6-1	6학년 1반	6	1
... (6-10반까지)
special-1	복합특수	0	특수
kindergarten	유치원	0	유치
neulbom	늘봄	0	늘봄
```

---

### **2단계: Google Apps Script 설정 (15분)**

1. **Google Sheets에서**: `확장 프로그램` → `Apps Script`

2. **코드 교체**: 기본 `Code.gs` 내용을 삭제하고 다음 코드 붙여넣기:

```javascript
// Google Sheets API for 특별실 예약 시스템
function doGet(e) {
  const action = e.parameter.action;
  const sheet = e.parameter.sheet;
  
  try {
    switch(action) {
      case 'get':
        return getData(sheet);
      default:
        return jsonResponse({ error: '알 수 없는 액션' });
    }
  } catch (error) {
    return jsonResponse({ error: error.toString() });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { action, sheet, data: rowData } = data;
    
    switch(action) {
      case 'add':
        return addData(sheet, rowData);
      case 'update':
        return updateData(sheet, rowData);
      case 'delete':
        return deleteData(sheet, rowData.id);
      default:
        return jsonResponse({ error: '알 수 없는 액션' });
    }
  } catch (error) {
    return jsonResponse({ error: error.toString() });
  }
}

// 데이터 가져오기
function getData(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    return jsonResponse({ error: `시트 '${sheetName}'를 찾을 수 없습니다` });
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  const result = rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  
  return jsonResponse(result);
}

// 데이터 추가
function addData(sheetName, rowData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    return jsonResponse({ error: `시트 '${sheetName}'를 찾을 수 없습니다` });
  }
  
  // ID 자동 생성
  const lastRow = sheet.getLastRow();
  const newId = lastRow > 1 ? 
    Math.max(...sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat()) + 1 : 1;
  
  rowData.id = newId;
  if (sheetName === 'reservations') {
    rowData.createdAt = new Date().toISOString();
  }
  
  // 헤더 순서대로 값 배열 생성
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = headers.map(header => rowData[header] || '');
  
  sheet.appendRow(values);
  
  return jsonResponse(rowData);
}

// 데이터 수정
function updateData(sheetName, rowData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    return jsonResponse({ error: `시트 '${sheetName}'를 찾을 수 없습니다` });
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idColumn = headers.indexOf('id') + 1;
  
  // ID로 행 찾기
  for (let i = 2; i <= sheet.getLastRow(); i++) {
    if (sheet.getRange(i, idColumn).getValue() == rowData.id) {
      // 업데이트할 데이터만 수정
      headers.forEach((header, index) => {
        if (rowData.hasOwnProperty(header) && header !== 'id') {
          sheet.getRange(i, index + 1).setValue(rowData[header]);
        }
      });
      break;
    }
  }
  
  return jsonResponse(rowData);
}

// 데이터 삭제
function deleteData(sheetName, id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    return jsonResponse({ error: `시트 '${sheetName}'를 찾을 수 없습니다` });
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idColumn = headers.indexOf('id') + 1;
  
  // ID로 행 찾아서 삭제
  for (let i = 2; i <= sheet.getLastRow(); i++) {
    if (sheet.getRange(i, idColumn).getValue() == id) {
      sheet.deleteRow(i);
      break;
    }
  }
  
  return jsonResponse({ success: true });
}

// JSON 응답 헬퍼
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. **프로젝트 저장**: `Ctrl+S` → 프로젝트 이름: `특별실예약시스템API`

4. **배포하기**:
   - `배포` → `새 배포`
   - 유형: `웹 앱`
   - 설명: `특별실 예약 시스템 API`
   - 실행 사용자: `나`
   - 액세스 권한: `모든 사용자`
   - `배포` 클릭

5. **웹 앱 URL 복사**: `https://script.google.com/macros/s/.../exec`

---

### **3단계: 프론트엔드 배포 (10분)**

1. **환경변수 설정**: `google-sheets-version/.env` 파일 생성:
```env
VITE_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

2. **Vercel 배포**:
   - [Vercel.com](https://vercel.com) 가입/로그인
   - `New Project`
   - GitHub 연결 또는 폴더 업로드
   - 환경변수 추가: `VITE_GOOGLE_SHEETS_API_URL`
   - `Deploy` 클릭

**또는 Netlify 배포**:
   - [Netlify.com](https://netlify.com) 가입/로그인
   - 프로젝트 폴더를 드래그앤드롭
   - Site settings → Environment variables → 환경변수 추가

---

## 🎉 **완료! 사용 방법**

### **👩‍🏫 선생님 사용법**
1. **웹사이트 접속**: Vercel/Netlify 주소
2. **예약하기**: 원본과 동일한 UI로 예약
3. **일정 확인**: 캘린더 뷰에서 한눈에 확인

### **👨‍💼 관리자 사용법**
1. **Google Sheets 직접 편집**: 
   - 특별실 추가/삭제
   - 학급 정보 수정
   - 예약 데이터 직접 편집
2. **실시간 반영**: 웹사이트 새로고침하면 즉시 반영

### **📱 모바일 관리**
- Google Sheets 앱에서 언제든지 확인/편집
- 새 예약 시 자동 알림 설정 가능

---

## 🆚 **원본 vs Google Sheets 버전 비교**

| 항목 | Replit 원본 | Google Sheets 버전 |
|------|-------------|-------------------|
| **UI** | ✅ 완전 동일 | ✅ **완전 동일** |
| **기능** | ✅ 모든 기능 | ✅ **모든 기능** |
| **데이터베이스** | PostgreSQL | **Google Sheets** |
| **관리 방법** | 코드 수정 필요 | **시트에서 직접 편집** |
| **협업** | 어려움 | **실시간 협업** |
| **비용** | 유료 | **완전 무료** |
| **백업** | 수동 | **자동 백업** |
| **모바일 관리** | 웹만 | **앱으로 편리하게** |

---

## 🎯 **결론**

**이 Google Sheets 버전은 Replit 원본과 UI가 100% 동일하면서도, 더 편리하고 무료인 최고의 선택입니다!**

- ✅ **완전 동일한 UI**: 모든 페이지와 기능이 원본과 똑같음
- ✅ **더 편리한 관리**: Google Sheets에서 직접 편집
- ✅ **완전 무료**: 영원히 비용 없음
- ✅ **더 많은 기능**: 실시간 협업, 모바일 앱, 자동 백업

**30분 투자로 평생 무료로 사용하세요!** 🚀 