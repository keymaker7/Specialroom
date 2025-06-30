function initializeSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 기존 시트들 삭제 (첫 번째 시트 제외하고 모두 삭제)
  var sheets = ss.getSheets();
  for (var i = sheets.length - 1; i >= 0; i--) {
    if (sheets[i].getName() !== 'rooms') {
      ss.deleteSheet(sheets[i]);
    }
  }
  
  // rooms 시트 생성/설정 - 실제 효행초등학교 특별실
  var roomsSheet = ss.getSheetByName('rooms');
  if (!roomsSheet) {
    roomsSheet = ss.insertSheet('rooms');
  }
  roomsSheet.clear();
  
  var roomsData = [
    ['id', 'name', 'isActive', 'createdAt'],
    [1, '강당', true, '2024-01-01T09:00:00.000Z'],
    [2, '운동장', true, '2024-01-01T09:00:00.000Z'],
    [3, '풋살장', true, '2024-01-01T09:00:00.000Z'],
    [4, '놀이활동실1', true, '2024-01-01T09:00:00.000Z'],
    [5, '놀이활동실2', true, '2024-01-01T09:00:00.000Z'],
    [6, '표현무용실', true, '2024-01-01T09:00:00.000Z'],
    [7, '야외정원(4층)', true, '2024-01-01T09:00:00.000Z'],
    [8, '시청각실1', true, '2024-01-01T09:00:00.000Z'],
    [9, '시청각실2', true, '2024-01-01T09:00:00.000Z'],
    [10, '제 1 컴퓨터실', true, '2024-01-01T09:00:00.000Z'],
    [11, '제 2 컴퓨터실', true, '2024-01-01T09:00:00.000Z']
  ];
  
  roomsSheet.getRange(1, 1, roomsData.length, roomsData[0].length).setValues(roomsData);
  
  // classes 시트 생성 - 실제 효행초등학교 학급 구성
  var classesSheet = ss.insertSheet('classes');
  var classesData = [['id', 'name', 'grade', 'classNumber', 'createdAt']];
  
  // 실제 학급 구성
  var classConfig = {
    1: 6,  // 1학년 1-6반
    2: 8,  // 2학년 1-8반
    3: 9,  // 3학년 1-9반
    4: 11, // 4학년 1-11반
    5: 10, // 5학년 1-10반
    6: 10  // 6학년 1-10반
  };
  
  var currentId = 1;
  for (var grade = 1; grade <= 6; grade++) {
    var maxClass = classConfig[grade];
    for (var classNum = 1; classNum <= maxClass; classNum++) {
      classesData.push([
        currentId++,
        grade + '학년 ' + classNum + '반',
        grade,
        classNum,
        '2024-01-01T09:00:00.000Z'
      ]);
    }
  }
  
  // 특수학급 추가
  classesData.push([
    currentId++,
    '유치원',
    0,
    1,
    '2024-01-01T09:00:00.000Z'
  ]);
  classesData.push([
    currentId++,
    '복합특수',
    0,
    2,
    '2024-01-01T09:00:00.000Z'
  ]);
  
  classesSheet.getRange(1, 1, classesData.length, classesData[0].length).setValues(classesData);
  
  // reservations 시트 생성 - 실제 스키마에 맞춤
  var reservationsSheet = ss.insertSheet('reservations');
  var reservationsHeaders = [['id', 'roomId', 'classId', 'date', 'periods', 'purpose', 'notes', 'createdAt']];
  reservationsSheet.getRange(1, 1, 1, reservationsHeaders[0].length).setValues(reservationsHeaders);
  
  // 헤더 스타일링
  var allSheets = [roomsSheet, classesSheet, reservationsSheet];
  for (var i = 0; i < allSheets.length; i++) {
    var sheet = allSheets[i];
    var headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    headerRange.setBackground('#4285F4').setFontColor('white').setFontWeight('bold');
    
    // 자동 너비 조정
    sheet.autoResizeColumns(1, sheet.getLastColumn());
  }
  
  Logger.log('✅ 모든 시트가 실제 데이터로 성공적으로 초기화되었습니다!');
  Logger.log('📊 특별실: ' + (roomsData.length - 1) + '개');
  Logger.log('📚 학급: ' + (classesData.length - 1) + '개 (1학년 6반, 2학년 8반, 3학년 9반, 4학년 11반, 5학년 10반, 6학년 10반, 특수 2개)');
}

function doGet() {
  return ContentService.createTextOutput('특별실 예약 시스템 API가 정상적으로 작동합니다!');
}

function doPost(e) {
  try {
    var requestData = JSON.parse(e.postData.contents);
    var action = requestData.action;
    var data = requestData.data;
    
    var result;
    switch (action) {
      case 'getRooms':
        result = getRooms();
        break;
      case 'getClasses':
        result = getClasses();
        break;
      case 'getReservations':
        result = getReservations();
        break;
      case 'createReservation':
        result = createReservation(data);
        break;
      case 'updateReservation':
        result = updateReservation(data);
        break;
      case 'deleteReservation':
        result = deleteReservation(data);
        break;
      default:
        throw new Error('Unknown action: ' + action);
    }
    
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('API Error: ' + error.message);
    return ContentService.createTextOutput(JSON.stringify({ error: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getRooms() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('rooms');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rooms = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[2] === true) { // isActive가 true인 것만
      var room = {};
      for (var j = 0; j < headers.length; j++) {
        room[headers[j]] = row[j];
      }
      rooms.push(room);
    }
  }
  
  return rooms;
}

function getClasses() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('classes');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var classes = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var classItem = {};
    for (var j = 0; j < headers.length; j++) {
      classItem[headers[j]] = row[j];
    }
    classes.push(classItem);
  }
  
  return classes;
}

function getReservations() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('reservations');
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  var headers = data[0];
  var reservations = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var reservation = {};
    for (var j = 0; j < headers.length; j++) {
      reservation[headers[j]] = row[j];
    }
    
    // periods를 배열로 변환 (콤마로 구분된 문자열을 배열로)
    if (reservation.periods && typeof reservation.periods === 'string') {
      reservation.periods = reservation.periods.split(',');
    }
    
    reservations.push(reservation);
  }
  
  return reservations;
}

function createReservation(reservation) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('reservations');
  var lastRow = sheet.getLastRow();
  var newId = lastRow === 1 ? 1 : lastRow;
  
  // periods 배열을 문자열로 변환
  var periodsString = '';
  if (reservation.periods && Array.isArray(reservation.periods)) {
    periodsString = reservation.periods.join(',');
  } else if (reservation.periods) {
    periodsString = reservation.periods.toString();
  }
  
  var newRow = [
    newId,
    reservation.roomId,
    reservation.classId,
    reservation.date,
    periodsString,
    reservation.purpose || '특별실 이용',
    reservation.notes || '',
    new Date().toISOString()
  ];
  
  sheet.appendRow(newRow);
  
  var result = {
    id: newId,
    roomId: reservation.roomId,
    classId: reservation.classId,
    date: reservation.date,
    periods: reservation.periods,
    purpose: reservation.purpose || '특별실 이용',
    notes: reservation.notes || '',
    createdAt: new Date().toISOString()
  };
  
  return result;
}

function updateReservation(reservation) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('reservations');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == reservation.id) {
      // periods 배열을 문자열로 변환
      var periodsString = '';
      if (reservation.periods && Array.isArray(reservation.periods)) {
        periodsString = reservation.periods.join(',');
      } else if (reservation.periods) {
        periodsString = reservation.periods.toString();
      }
      
      var updatedRow = [
        reservation.id,
        reservation.roomId,
        reservation.classId,
        reservation.date,
        periodsString,
        reservation.purpose || '특별실 이용',
        reservation.notes || '',
        data[i][7] // keep original createdAt
      ];
      
      sheet.getRange(i + 1, 1, 1, updatedRow.length).setValues([updatedRow]);
      return reservation;
    }
  }
  
  throw new Error('Reservation not found');
}

function deleteReservation(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('reservations');
  var sheetData = sheet.getDataRange().getValues();
  
  for (var i = 1; i < sheetData.length; i++) {
    if (sheetData[i][0] == data.id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  
  throw new Error('Reservation not found');
}

// 충돌 검사 함수
function checkReservationConflict(roomId, date, periods, excludeId) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('reservations');
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var reservationId = row[0];
    var reservationRoomId = row[1];
    var reservationDate = row[3];
    var reservationPeriods = row[4];
    
    // 같은 예약은 제외
    if (excludeId && reservationId == excludeId) continue;
    
    // 같은 날짜, 같은 특별실 확인
    if (reservationRoomId == roomId && reservationDate === date) {
      // periods 문자열을 배열로 변환
      var existingPeriods = [];
      if (reservationPeriods) {
        existingPeriods = reservationPeriods.toString().split(',');
      }
      
      // 교시 충돌 확인
      for (var j = 0; j < periods.length; j++) {
        for (var k = 0; k < existingPeriods.length; k++) {
          if (periods[j] === existingPeriods[k]) {
            return true; // 충돌 발견
          }
        }
      }
    }
  }
  
  return false; // 충돌 없음
} 