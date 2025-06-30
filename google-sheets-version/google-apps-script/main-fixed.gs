function initializeSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 기존 시트들 삭제 (Sheet1 제외하고 모두 삭제)
  var sheets = ss.getSheets();
  for (var i = sheets.length - 1; i >= 0; i--) {
    if (sheets[i].getName() !== 'rooms') {
      ss.deleteSheet(sheets[i]);
    }
  }
  
  // rooms 시트 생성/설정
  var roomsSheet = ss.getSheetByName('rooms');
  if (!roomsSheet) {
    roomsSheet = ss.insertSheet('rooms');
  }
  roomsSheet.clear();
  
  var roomsData = [
    ['id', 'name', 'description', 'usage_notes', 'conflict_warnings', 'recommended_grades', 'is_active', 'created_at'],
    [1, '표현무용실', '표현활동과 무용 수업용', '실내화 착용 필수, 매트 사용', '행사 시 사용 불가', '전학년', true, '2024-01-01T09:00:00.000Z'],
    [2, '놀이활동실1', '놀이 및 체육 활동용', '안전 장비 착용, 정리정돈 필수', '우천 시 집중 사용', '1,2학년', true, '2024-01-01T09:00:00.000Z'],
    [3, '놀이활동실2', '놀이 및 체육 활동용', '안전 장비 착용, 정리정돈 필수', '우천 시 집중 사용', '1,2학년', true, '2024-01-01T09:00:00.000Z'],
    [4, '운동장', '야외 체육 활동 및 행사용', '날씨 확인 필수, 안전사고 주의', '우천 시 사용 불가', '전학년', true, '2024-01-01T09:00:00.000Z'],
    [5, '풋살장', '축구 및 풋살 활동용', '축구화 착용 권장, 안전 수칙 준수', '우천 시 집중 사용', '3,4,5,6학년', true, '2024-01-01T09:00:00.000Z'],
    [6, '제1컴퓨터실', '컴퓨터 수업 및 정보 활용', '개인 USB 준비, 조용히 수업', '시험 기간 사용 제한', '전학년', true, '2024-01-01T09:00:00.000Z'],
    [7, '제2컴퓨터실', '컴퓨터 수업 및 정보 활용', '개인 USB 준비, 조용히 수업', '시험 기간 사용 제한', '전학년', true, '2024-01-01T09:00:00.000Z'],
    [8, '야외정원', '자연 관찰 및 야외 수업용', '날씨 확인 필수, 벌레 주의', '우천 시 사용 불가', '전학년', true, '2024-01-01T09:00:00.000Z'],
    [9, '시청각실', '영상 시청 및 발표용', '조용히 사용, 장비 사용법 숙지', '행사 시 사용 불가', '전학년', true, '2024-01-01T09:00:00.000Z'],
    [10, '강당', '대규모 행사 및 전교생 집회', '정리정돈 철저, 마이크 사용법 숙지', '체육대회 등 행사 우선', '전학년', true, '2024-01-01T09:00:00.000Z']
  ];
  
  roomsSheet.getRange(1, 1, roomsData.length, roomsData[0].length).setValues(roomsData);
  
  // classes 시트 생성
  var classesSheet = ss.insertSheet('classes');
  var classesData = [['id', 'name', 'grade', 'class_number', 'teacher_name', 'student_count', 'created_at']];
  
  var teachers = ['김영희', '이철수', '박민수', '정수정', '한민정', '송기현'];
  
  for (var grade = 1; grade <= 6; grade++) {
    for (var classNum = 1; classNum <= 6; classNum++) {
      var id = (grade - 1) * 6 + classNum;
      var teacherName = teachers[classNum - 1];
      var studentCount = 24 + Math.floor(Math.random() * 3);
      
      classesData.push([
        id,
        grade + '학년' + classNum + '반',
        grade,
        classNum,
        teacherName,
        studentCount,
        '2024-01-01T09:00:00.000Z'
      ]);
    }
  }
  
  classesSheet.getRange(1, 1, classesData.length, classesData[0].length).setValues(classesData);
  
  // reservations 시트 생성
  var reservationsSheet = ss.insertSheet('reservations');
  var reservationsHeaders = [['id', 'room_id', 'class_id', 'date', 'time_slot', 'teacher_name', 'purpose', 'status', 'created_at', 'updated_at']];
  reservationsSheet.getRange(1, 1, 1, reservationsHeaders[0].length).setValues(reservationsHeaders);
  
  // 헤더 스타일링
  var allSheets = [roomsSheet, classesSheet, reservationsSheet];
  for (var i = 0; i < allSheets.length; i++) {
    var sheet = allSheets[i];
    var headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    headerRange.setBackground('#4285F4').setFontColor('white').setFontWeight('bold');
  }
  
  Logger.log('✅ 모든 시트가 성공적으로 초기화되었습니다!');
}

function doGet() {
  return ContentService.createTextOutput('API가 정상적으로 작동합니다!');
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
    var room = {};
    for (var j = 0; j < headers.length; j++) {
      room[headers[j]] = row[j];
    }
    rooms.push(room);
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
    reservations.push(reservation);
  }
  
  return reservations;
}

function createReservation(reservation) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('reservations');
  var lastRow = sheet.getLastRow();
  var newId = lastRow === 1 ? 1 : lastRow;
  
  var newRow = [
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
  ];
  
  sheet.appendRow(newRow);
  
  var result = {
    id: newId,
    room_id: reservation.room_id,
    class_id: reservation.class_id,
    date: reservation.date,
    time_slot: reservation.time_slot,
    teacher_name: reservation.teacher_name,
    purpose: reservation.purpose,
    status: reservation.status || 'confirmed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  return result;
}

function updateReservation(reservation) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('reservations');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == reservation.id) {
      var updatedRow = [
        reservation.id,
        reservation.room_id,
        reservation.class_id,
        reservation.date,
        reservation.time_slot,
        reservation.teacher_name,
        reservation.purpose,
        reservation.status,
        data[i][8], // keep original created_at
        new Date().toISOString()
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