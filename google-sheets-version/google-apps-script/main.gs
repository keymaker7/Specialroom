/**
 * 📊 Google Sheets 기반 특별실 예약 시스템 API
 * 
 * 이 Google Apps Script는 Google Sheets를 데이터베이스로 사용하여
 * 특별실 예약 시스템의 백엔드 API 역할을 합니다.
 */

// 📋 시트 이름 설정
const SHEETS = {
  ROOMS: 'rooms',
  CLASSES: 'classes', 
  RESERVATIONS: 'reservations',
  PLANNED_SCHEDULE: 'planned_schedule'
};

/**
 * 🌐 GET 요청 처리 (API 엔드포인트)
 * URL: https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=get&sheet=rooms
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    const sheetName = e.parameter.sheet;
    
    // CORS 헤더 설정
    const response = ContentService.createTextOutput();
    
    switch(action) {
      case 'get':
        if (!sheetName) {
          return createErrorResponse('시트 이름이 필요합니다');
        }
        return getSheetData(sheetName);
        
      case 'health':
        return createSuccessResponse({ status: 'ok', timestamp: new Date().toISOString() });
        
      default:
        return createErrorResponse('잘못된 액션입니다');
    }
  } catch (error) {
    console.error('GET 요청 처리 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다: ' + error.message);
  }
}

/**
 * 📤 POST 요청 처리 (데이터 추가/수정)
 * 요청 본문에 JSON 데이터를 포함해야 합니다
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    const sheetName = postData.sheet;
    const data = postData.data;
    
    switch(action) {
      case 'add':
        return addDataToSheet(sheetName, data);
        
      case 'update':
        return updateDataInSheet(sheetName, data);
        
      case 'delete':
        return deleteDataFromSheet(sheetName, data.id);
        
      default:
        return createErrorResponse('잘못된 액션입니다');
    }
  } catch (error) {
    console.error('POST 요청 처리 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다: ' + error.message);
  }
}

/**
 * 📊 시트에서 데이터 가져오기
 */
function getSheetData(sheetName) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    
    if (!sheet) {
      return createErrorResponse(`시트 '${sheetName}'을 찾을 수 없습니다`);
    }
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length === 0) {
      return createSuccessResponse([]);
    }
    
    // 첫 번째 행을 헤더로 사용
    const headers = values[0];
    const data = values.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        let value = row[index];
        
        // 특별 처리: periods 필드는 배열로 변환
        if (header === 'periods' && typeof value === 'string') {
          value = value.split(',').map(p => p.trim()).filter(p => p);
        }
        
        // 빈 값 처리
        if (value === '') {
          value = null;
        }
        
        obj[header] = value;
      });
      return obj;
    });
    
    return createSuccessResponse(data);
  } catch (error) {
    console.error('데이터 가져오기 오류:', error);
    return createErrorResponse('데이터를 가져오는데 실패했습니다: ' + error.message);
  }
}

/**
 * ➕ 시트에 데이터 추가
 */
function addDataToSheet(sheetName, data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    
    if (!sheet) {
      return createErrorResponse(`시트 '${sheetName}'을 찾을 수 없습니다`);
    }
    
    // 헤더 가져오기
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // 새 ID 생성 (기존 ID의 최대값 + 1)
    const lastRow = sheet.getLastRow();
    let newId = 1;
    
    if (lastRow > 1) {
      const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
      newId = Math.max(...ids.filter(id => typeof id === 'number')) + 1;
    }
    
    // 데이터 행 생성
    const newRow = headers.map(header => {
      if (header === 'id') {
        return newId;
      } else if (header === 'created_at') {
        return new Date().toISOString();
      } else if (header === 'periods' && Array.isArray(data[header])) {
        return data[header].join(',');
      } else {
        return data[header] || '';
      }
    });
    
    // 시트에 추가
    sheet.appendRow(newRow);
    
    // 추가된 데이터 반환
    const result = {};
    headers.forEach((header, index) => {
      result[header] = newRow[index];
    });
    
    return createSuccessResponse(result);
  } catch (error) {
    console.error('데이터 추가 오류:', error);
    return createErrorResponse('데이터 추가에 실패했습니다: ' + error.message);
  }
}

/**
 * ✏️ 시트의 데이터 수정
 */
function updateDataInSheet(sheetName, data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    
    if (!sheet) {
      return createErrorResponse(`시트 '${sheetName}'을 찾을 수 없습니다`);
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const idColumn = headers.indexOf('id') + 1;
    
    if (idColumn === 0) {
      return createErrorResponse('ID 열을 찾을 수 없습니다');
    }
    
    // ID로 행 찾기
    const lastRow = sheet.getLastRow();
    const ids = sheet.getRange(2, idColumn, lastRow - 1, 1).getValues().flat();
    const rowIndex = ids.indexOf(data.id) + 2; // +2 because 1-indexed and header row
    
    if (rowIndex < 2) {
      return createErrorResponse('해당 ID의 데이터를 찾을 수 없습니다');
    }
    
    // 데이터 업데이트
    headers.forEach((header, index) => {
      if (header !== 'id' && header !== 'created_at' && data.hasOwnProperty(header)) {
        let value = data[header];
        
        // periods 배열 처리
        if (header === 'periods' && Array.isArray(value)) {
          value = value.join(',');
        }
        
        sheet.getRange(rowIndex, index + 1).setValue(value);
      }
    });
    
    return createSuccessResponse({ message: '데이터가 성공적으로 수정되었습니다' });
  } catch (error) {
    console.error('데이터 수정 오류:', error);
    return createErrorResponse('데이터 수정에 실패했습니다: ' + error.message);
  }
}

/**
 * 🗑️ 시트에서 데이터 삭제
 */
function deleteDataFromSheet(sheetName, id) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    
    if (!sheet) {
      return createErrorResponse(`시트 '${sheetName}'을 찾을 수 없습니다`);
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const idColumn = headers.indexOf('id') + 1;
    
    if (idColumn === 0) {
      return createErrorResponse('ID 열을 찾을 수 없습니다');
    }
    
    // ID로 행 찾기
    const lastRow = sheet.getLastRow();
    const ids = sheet.getRange(2, idColumn, lastRow - 1, 1).getValues().flat();
    const rowIndex = ids.indexOf(id) + 2;
    
    if (rowIndex < 2) {
      return createErrorResponse('해당 ID의 데이터를 찾을 수 없습니다');
    }
    
    // 행 삭제
    sheet.deleteRow(rowIndex);
    
    return createSuccessResponse({ message: '데이터가 성공적으로 삭제되었습니다' });
  } catch (error) {
    console.error('데이터 삭제 오류:', error);
    return createErrorResponse('데이터 삭제에 실패했습니다: ' + error.message);
  }
}

/**
 * ✅ 성공 응답 생성
 */
function createSuccessResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

/**
 * ❌ 오류 응답 생성
 */
function createErrorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({ error: message }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

/**
 * 🔧 시트 초기화 함수 (수동 실행용)
 * Google Apps Script 에디터에서 이 함수를 실행하여 초기 데이터를 설정합니다
 */
function initializeSheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // rooms 시트 생성
  createRoomsSheet(spreadsheet);
  
  // classes 시트 생성  
  createClassesSheet(spreadsheet);
  
  // reservations 시트 생성
  createReservationsSheet(spreadsheet);
  
  // planned_schedule 시트 생성 (기존 시간표 참고용)
  createPlannedScheduleSheet(spreadsheet);
  
  console.log('✅ 모든 시트가 성공적으로 초기화되었습니다!');
}

function createRoomsSheet(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(SHEETS.ROOMS);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEETS.ROOMS);
  }
  
  // 헤더 설정
  const headers = ['id', 'name', 'description', 'usage_notes', 'conflict_warnings', 'recommended_grades', 'is_active', 'created_at'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // 실제 특별실 데이터 (기존 roomGuidelines.ts 기반)
  const realRoomData = [
    [1, '표현무용실', '3,4학년 체육 수업 전용', '3,4학년 체육 수업 전용 공간;표현 및 무용 활동에 최적화', '3,4학년 정규 체육 시간과 중복 불가;방과후 수업 시간 확인 필요', '3,4', true, new Date().toISOString()],
    [2, '놀이활동실1', '1,2학년 놀이체육 전용', '1,2학년 놀이체육 전용;유치원 및 복합특수 학급 이용;늘봄 프로그램 운영', '1,2학년 정규 놀이체육 시간 확인;유치원 및 복합특수 시간 피해야 함;늘봄 프로그램과 중복 불가', '1,2', true, new Date().toISOString()],
    [3, '놀이활동실2', '3-6학년 활동 및 특별 프로그램', '3-6학년 다양한 활동 공간;학년별 시간대 배정됨', '학년별 정규 이용 시간 확인;기존 배정 시간과 중복 불가', '3,4,5,6', true, new Date().toISOString()],
    [4, '운동장', '야외 체육 활동 및 놀이', '학년별 이용 시간 배정;날씨에 따른 사용 제한', '학년별 정규 이용 시간 확인;우천 시 실내 대체 공간 필요', '1,2,3,4,5,6', true, new Date().toISOString()],
    [5, '풋살장', '축구 및 구기 활동', '학년별 이용 시간 배정;와우중학교 이용 시간 있음;복합특수 학급 이용', '와우중학교 이용 시간 피해야 함;복합특수 시간 확인 필요;학년별 정규 시간과 중복 불가', '1,2,3,4,5,6', true, new Date().toISOString()],
    [6, '제1컴퓨터실', '1학년 컴퓨터 수업 전용', '1학년 전용 컴퓨터실;학년별 사전 조정 후 사용;방과후 수업 운영', '1학년 정규 컴퓨터 수업과 중복 불가;방과후 수업 시간 확인', '1', true, new Date().toISOString()],
    [7, '제2컴퓨터실', '2학년 컴퓨터 수업 및 연수', '2학년 전용 컴퓨터실;소프트웨어 연수 및 학생동아리 활동;학년별 사전 조정 후 사용', '2학년 정규 컴퓨터 수업과 중복 불가;소프트웨어 연수 일정 확인', '2', true, new Date().toISOString()],
    [8, '야외정원(4층)', '야외 활동 및 휴식 공간', '4층 야외 공간;날씨 조건 확인 필요;안전 수칙 준수 필수', '우천 시 사용 불가;안전 관리자 동행 권장', '1,2,3,4,5,6', true, new Date().toISOString()],
    [9, '시청각실', '영상 시청 및 발표 활동', '프로젝터 및 음향 시설 완비;좌석 수 제한 있음;사전 장비 점검 권장', '장비 사용법 숙지 필요;정원 초과 시 사용 제한', '1,2,3,4,5,6', true, new Date().toISOString()]
  ];
  
  if (sheet.getLastRow() === 1) {
    sheet.getRange(2, 1, realRoomData.length, headers.length).setValues(realRoomData);
  }
  
  // 헤더 스타일링
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
}

function createPlannedScheduleSheet(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(SHEETS.PLANNED_SCHEDULE);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEETS.PLANNED_SCHEDULE);
  }
  
  // 헤더 설정
  const headers = ['id', 'room', 'time_slot', 'day', 'grades', 'notes', 'created_at'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // 기존 시간표 데이터 일부 샘플 (scheduleData.ts 기반)
  const sampleScheduleData = [
    [1, '강당', '09:00-09:40', '월', '체(4-5),체(5-1)', '4,5학년 체육 시간', new Date().toISOString()],
    [2, '강당', '09:00-09:40', '화', '체(4-10),체(5-6)', '4,5학년 체육 시간', new Date().toISOString()],
    [3, '강당', '09:00-09:40', '수', '체(3-7),체(6-1)', '3,6학년 체육 시간', new Date().toISOString()],
    [4, '놀이활동실1', '09:00-09:40', '월', '1학년', '1학년 놀이체육', new Date().toISOString()],
    [5, '놀이활동실1', '09:00-09:40', '화', '5학년', '5학년 활동', new Date().toISOString()],
    [6, '놀이활동실1', '09:00-09:40', '수', '2학년', '2학년 놀이체육', new Date().toISOString()],
    [7, '놀이활동실1', '09:00-09:40', '목', '유치원', '유치원 활동', new Date().toISOString()],
    [8, '놀이활동실2', '09:00-09:40', '월', '6학년', '6학년 활동', new Date().toISOString()],
    [9, '놀이활동실2', '09:00-09:40', '화', '6학년', '6학년 활동', new Date().toISOString()],
    [10, '표현무용실', '09:00-09:40', '월', '체(3-8)', '3학년 체육', new Date().toISOString()],
    [11, '표현무용실', '09:00-09:40', '화', '체(3-4)', '3학년 체육', new Date().toISOString()],
    [12, '운동장', '09:00-09:40', '월', '4학년', '4학년 야외활동', new Date().toISOString()],
    [13, '풋살장', '09:00-09:40', '월', '4학년', '4학년 축구활동', new Date().toISOString()]
  ];
  
  if (sheet.getLastRow() === 1) {
    sheet.getRange(2, 1, sampleScheduleData.length, headers.length).setValues(sampleScheduleData);
  }
  
  // 헤더 스타일링
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#ff9800');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  
  // 설명 추가
  sheet.getRange('A1').addNote(`
이 시트는 기존 계획된 시간표를 참고용으로 보여줍니다.
- 새로운 예약을 만들 때 기존 계획과 충돌하지 않도록 확인하세요
- grades 열에는 해당 시간에 이용하는 학급/학년이 표시됩니다
- 예약 시스템에서 충돌 검사 시 이 데이터를 참고합니다
  `);
}

function createClassesSheet(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(SHEETS.CLASSES);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEETS.CLASSES);
  }
  
  // 헤더 설정
  const headers = ['id', 'name', 'grade', 'class_number', 'created_at'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // 실제 학급 데이터 (scheduleData.ts에서 파악된 실제 학급들)
  const realClassData = [
    // 1학년 (1-1부터 1-6까지)
    [1, '1학년 1반', 1, 1, new Date().toISOString()],
    [2, '1학년 2반', 1, 2, new Date().toISOString()],
    [3, '1학년 3반', 1, 3, new Date().toISOString()],
    [4, '1학년 4반', 1, 4, new Date().toISOString()],
    [5, '1학년 5반', 1, 5, new Date().toISOString()],
    [6, '1학년 6반', 1, 6, new Date().toISOString()],
    
    // 2학년 (2-1부터 2-8까지)
    [7, '2학년 1반', 2, 1, new Date().toISOString()],
    [8, '2학년 2반', 2, 2, new Date().toISOString()],
    [9, '2학년 3반', 2, 3, new Date().toISOString()],
    [10, '2학년 4반', 2, 4, new Date().toISOString()],
    [11, '2학년 5반', 2, 5, new Date().toISOString()],
    [12, '2학년 6반', 2, 6, new Date().toISOString()],
    [13, '2학년 7반', 2, 7, new Date().toISOString()],
    [14, '2학년 8반', 2, 8, new Date().toISOString()],
    
    // 3학년 (3-1부터 3-9까지)
    [15, '3학년 1반', 3, 1, new Date().toISOString()],
    [16, '3학년 2반', 3, 2, new Date().toISOString()],
    [17, '3학년 3반', 3, 3, new Date().toISOString()],
    [18, '3학년 4반', 3, 4, new Date().toISOString()],
    [19, '3학년 5반', 3, 5, new Date().toISOString()],
    [20, '3학년 6반', 3, 6, new Date().toISOString()],
    [21, '3학년 7반', 3, 7, new Date().toISOString()],
    [22, '3학년 8반', 3, 8, new Date().toISOString()],
    [23, '3학년 9반', 3, 9, new Date().toISOString()],
    
    // 4학년 (4-1부터 4-11까지)
    [24, '4학년 1반', 4, 1, new Date().toISOString()],
    [25, '4학년 2반', 4, 2, new Date().toISOString()],
    [26, '4학년 3반', 4, 3, new Date().toISOString()],
    [27, '4학년 4반', 4, 4, new Date().toISOString()],
    [28, '4학년 5반', 4, 5, new Date().toISOString()],
    [29, '4학년 6반', 4, 6, new Date().toISOString()],
    [30, '4학년 7반', 4, 7, new Date().toISOString()],
    [31, '4학년 8반', 4, 8, new Date().toISOString()],
    [32, '4학년 9반', 4, 9, new Date().toISOString()],
    [33, '4학년 10반', 4, 10, new Date().toISOString()],
    [34, '4학년 11반', 4, 11, new Date().toISOString()],
    
    // 5학년 (5-1부터 5-10까지)
    [35, '5학년 1반', 5, 1, new Date().toISOString()],
    [36, '5학년 2반', 5, 2, new Date().toISOString()],
    [37, '5학년 3반', 5, 3, new Date().toISOString()],
    [38, '5학년 4반', 5, 4, new Date().toISOString()],
    [39, '5학년 5반', 5, 5, new Date().toISOString()],
    [40, '5학년 6반', 5, 6, new Date().toISOString()],
    [41, '5학년 7반', 5, 7, new Date().toISOString()],
    [42, '5학년 8반', 5, 8, new Date().toISOString()],
    [43, '5학년 9반', 5, 9, new Date().toISOString()],
    [44, '5학년 10반', 5, 10, new Date().toISOString()],
    
    // 6학년 (6-1부터 6-10까지)
    [45, '6학년 1반', 6, 1, new Date().toISOString()],
    [46, '6학년 2반', 6, 2, new Date().toISOString()],
    [47, '6학년 3반', 6, 3, new Date().toISOString()],
    [48, '6학년 4반', 6, 4, new Date().toISOString()],
    [49, '6학년 5반', 6, 5, new Date().toISOString()],
    [50, '6학년 6반', 6, 6, new Date().toISOString()],
    [51, '6학년 7반', 6, 7, new Date().toISOString()],
    [52, '6학년 8반', 6, 8, new Date().toISOString()],
    [53, '6학년 9반', 6, 9, new Date().toISOString()],
    [54, '6학년 10반', 6, 10, new Date().toISOString()],
    
    // 특수 학급들
    [55, '유치원', 0, 1, new Date().toISOString()],
    [56, '복합특수', 0, 2, new Date().toISOString()],
    [57, '늘봄프로그램', 0, 3, new Date().toISOString()]
  ];
  
  if (sheet.getLastRow() === 1) {
    sheet.getRange(2, 1, realClassData.length, headers.length).setValues(realClassData);
  }
  
  // 헤더 스타일링
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
}

function createReservationsSheet(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(SHEETS.RESERVATIONS);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEETS.RESERVATIONS);
  }
  
  // 헤더 설정
  const headers = ['id', 'room_id', 'class_id', 'date', 'periods', 'purpose', 'notes', 'created_at'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // 헤더 스타일링
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
} 