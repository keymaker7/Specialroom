# ⚡ 30초 만에 완성하는 Google Sheets 설정

## 🚀 **가장 빠른 방법 (30초!)**

### **1단계: Google Sheets 만들기** (10초)
1. [sheets.google.com](https://sheets.google.com) 접속
2. **빈 스프레드시트** 클릭
3. 제목을 **"특별실예약시스템"**으로 변경

### **2단계: Apps Script 열기** (5초)
1. **확장 프로그램** → **Apps Script** 클릭

### **3단계: 코드 붙여넣기** (10초)
1. 기존 코드 모두 삭제
2. 아래 코드 **전체 복사** → **붙여넣기**

```javascript
function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 기존 시트들 삭제
  const sheets = ss.getSheets();
  sheets.forEach(sheet => {
    if (sheet.getName() !== 'rooms') ss.deleteSheet(sheet);
  });
  
  // rooms 시트 생성/설정
  let roomsSheet = ss.getSheetByName('rooms') || ss.insertSheet('rooms');
  roomsSheet.clear();
  roomsSheet.getRange('A1:H11').setValues([
    ['id', 'name', 'description', 'usage_notes', 'conflict_warnings', 'recommended_grades', 'is_active', 'created_at'],
    [1, '표현무용실', '표현활동과 무용 수업용', '실내화 착용 필수, 매트 사용', '행사 시 사용 불가', '전학년', true, '2024-01-01T09:00:00.000Z'],
    [2, '놀이활동실1', '놀이 및 체육 활동용', '안전 장비 착용, 정리정돈 필수', '우천 시 집중 사용', '1,2학년', true, '2024-01-01T09:00:00.000Z'],
    [3, '놀이활동실2', '놀이 및 체육 활동용', '안전 장비 착용, 정리정돈 필수', '우천 시 집중 사용', '1,2학년', true, '2024-01-01T09:00:00.000Z'],
    [4, '운동장', '야외 체육 활동 및 행사용', '날씨 확인 필수, 안전사고 주의', '우천 시 사용 불가', '전학년', true, '2024-01-01T09:00:00.000Z'],
    [5, '풋살장', '축구 및 풋살 활동용', '축구화 착용 권장, 안전 수칙 준수', '우천 시 사용 불가', '3,4,5,6학년', true, '2024-01-01T09:00:00.000Z'],
    [6, '제1컴퓨터실', '컴퓨터 수업 및 정보 활용', '개인 USB 준비, 조용히 수업', '시험 기간 사용 제한', '전학년', true, '2024-01-01T09:00:00.000Z'],
    [7, '제2컴퓨터실', '컴퓨터 수업 및 정보 활용', '개인 USB 준비, 조용히 수업', '시험 기간 사용 제한', '전학년', true, '2024-01-01T09:00:00.000Z'],
    [8, '야외정원', '자연 관찰 및 야외 수업용', '날씨 확인 필수, 벌레 주의', '우천 시 사용 불가', '전학년', true, '2024-01-01T09:00:00.000Z'],
    [9, '시청각실', '영상 시청 및 발표용', '조용히 사용, 장비 사용법 숙지', '행사 시 사용 불가', '전학년', true, '2024-01-01T09:00:00.000Z'],
    [10, '강당', '대규모 행사 및 전교생 집회', '정리정돈 철저, 마이크 사용법 숙지', '체육대회 등 행사 우선', '전학년', true, '2024-01-01T09:00:00.000Z']
  ]);
  
  // classes 시트 생성
  let classesSheet = ss.insertSheet('classes');
  const classesData = [['id', 'name', 'grade', 'class_number', 'teacher_name', 'student_count', 'created_at']];
  for (let grade = 1; grade <= 6; grade++) {
    for (let classNum = 1; classNum <= 6; classNum++) {
      const id = (grade - 1) * 6 + classNum;
      const teachers = ['김영희', '이철수', '박민수', '정수정', '한민정', '송기현'];
      classesData.push([
        id,
        `${grade}학년${classNum}반`,
        grade,
        classNum,
        teachers[classNum - 1],
        24 + Math.floor(Math.random() * 3),
        '2024-01-01T09:00:00.000Z'
      ]);
    }
  }
  classesSheet.getRange(1, 1, classesData.length, 7).setValues(classesData);
  
  // reservations 시트 생성
  let reservationsSheet = ss.insertSheet('reservations');
  reservationsSheet.getRange('A1:J1').setValues([
    ['id', 'room_id', 'class_id', 'date', 'time_slot', 'teacher_name', 'purpose', 'status', 'created_at', 'updated_at']
  ]);
  
  // 헤더 스타일링
  [roomsSheet, classesSheet, reservationsSheet].forEach(sheet => {
    const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    headerRange.setBackground('#4285F4').setFontColor('white').setFontWeight('bold');
  });
  
  console.log('✅ 모든 시트가 성공적으로 초기화되었습니다!');
}

function doGet() {
  return ContentService.createTextOutput('API가 정상적으로 작동합니다!');
}

function doPost(e) {
  try {
    const { action, data } = JSON.parse(e.postData.contents);
    
    switch (action) {
      case 'getRooms':
        return ContentService.createTextOutput(JSON.stringify(getRooms())).setMimeType(ContentService.MimeType.JSON);
      case 'getClasses':
        return ContentService.createTextOutput(JSON.stringify(getClasses())).setMimeType(ContentService.MimeType.JSON);
      case 'getReservations':
        return ContentService.createTextOutput(JSON.stringify(getReservations())).setMimeType(ContentService.MimeType.JSON);
      case 'createReservation':
        return ContentService.createTextOutput(JSON.stringify(createReservation(data))).setMimeType(ContentService.MimeType.JSON);
      default:
        throw new Error('Unknown action');
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getRooms() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('rooms');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

function getClasses() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('classes');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

function getReservations() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('reservations');
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

function createReservation(reservation) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('reservations');
  const lastRow = sheet.getLastRow();
  const newId = lastRow === 1 ? 1 : lastRow;
  
  sheet.appendRow([
    newId,
    reservation.room_id,
    reservation.class_id,
    reservation.date,
    reservation.time_slot,
    reservation.teacher_name,
    reservation.purpose,
    reservation.status || 'confirmed',
    new Date().toISOString(),
    new Date().toISOString()
  ]);
  
  return { id: newId, ...reservation };
}
```

### **4단계: 함수 실행** (5초)
1. **함수 선택** 드롭다운에서 **`initializeSheets`** 선택
2. **실행** 버튼 클릭
3. 권한 허용 (처음만)

### **5단계: 완료!** ✅
- **rooms 시트**: 10개 특별실 자동 생성 ✅
- **classes 시트**: 36개 학급 자동 생성 ✅  
- **reservations 시트**: 예약 테이블 준비 ✅
- **API 기능**: 웹사이트 연결 준비 완료 ✅

---

## 🎯 **대안 방법들**

### **💾 방법 2: CSV 복사 (1분)**
```
1. 아래 데이터를 Ctrl+C로 복사
2. Google Sheets A1에 Ctrl+V로 붙여넣기

특별실 데이터:
id	name	description
1	표현무용실	표현활동과 무용 수업용
2	놀이활동실1	놀이 및 체육 활동용
3	놀이활동실2	놀이 및 체육 활동용
...
```

### **📤 방법 3: CSV 파일 업로드 (2분)**
```
1. sheets-data/rooms.csv 다운로드
2. Google Sheets → 파일 → 가져오기
3. CSV 파일 업로드
```

---

## 🔥 **왜 Apps Script가 가장 효율적인가?**

✅ **설치 없음** - Node.js, npm 불필요  
✅ **완전 자동** - 클릭 한 번으로 모든 데이터 생성  
✅ **API 포함** - 웹사이트 연결 코드까지 한번에  
✅ **에러 없음** - 데이터 타입, 형식 자동 처리  
✅ **즉시 사용** - 바로 웹사이트와 연결 가능  

---

## 🚀 **지금 바로 시작하세요!**

**단 30초면 완성됩니다!** ⚡

1. **Google Sheets 열기**
2. **Apps Script 실행** 
3. **코드 붙여넣기**
4. **initializeSheets 실행**
5. **완료!** 🎉 