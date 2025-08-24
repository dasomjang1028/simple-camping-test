// Google Apps Script 코드 - MBTI 기반 캠핑 스타일 테스트용

/**
 * MBTI 기반 캠핑 스타일 테스트 결과 및 쿠폰 발급을 처리하는 스크립트
 */

// 스프레드시트 ID (실제 스프레드시트 생성 후 URL에서 복사해서 여기에 입력)
// 예: https://docs.google.com/spreadsheets/d/1ABC123...XYZ/edit 에서 1ABC123...XYZ 부분
const SPREADSHEET_ID = '1H0GELHx8VWmXwBzlb-G-24_J4HpROIqDI1vDo_rRo-4'; // ⚠️ 반드시 실제 스프레드시트 ID로 교체하세요!
const TEST_SHEET_NAME = '테스트결과';
const COUPON_SHEET_NAME = '쿠폰발급';

/**
 * GET 요청 처리 - 연결 테스트용
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'ping') {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'success',
          message: 'MBTI 캠핑 스타일 테스트 API 연결 성공',
          timestamp: new Date().toISOString(),
          version: '2.0'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'get_stats') {
      const stats = getTestStatistics();
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'success',
          data: stats,
          message: 'MBTI 테스트 통계 조회 성공',
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'MBTI 캠핑 스타일 테스트 API가 정상 작동중입니다.',
        timestamp: new Date().toISOString(),
        endpoints: ['save_test_result', 'issue_coupon', 'get_stats', 'ping']
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * OPTIONS 요청 처리 - CORS preflight 요청 대응
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
}

/**
 * POST 요청 처리 - 테스트 결과 저장 및 쿠폰 발급
 */
function doPost(e) {
  try {
    const response = {
      success: false,
      error: '',
      data: null,
      message: ''
    };

    // 요청 데이터 파싱
    let postData;
    try {
      postData = JSON.parse(e.postData.contents);
    } catch (parseError) {
      response.error = '잘못된 JSON 형식입니다.';
      return createJsonResponse(response);
    }

    // 액션에 따른 처리
    switch (postData.action) {
      case 'save_test_result':
        const testResult = saveTestResult(postData);
        response.success = true;
        response.data = testResult;
        response.message = 'MBTI 캠핑 스타일 테스트 결과가 성공적으로 저장되었습니다.';
        break;
        
      case 'issue_coupon':
        const couponResult = issueCoupon(postData);
        response.success = true;
        response.data = couponResult;
        response.message = '쿠폰이 성공적으로 발급되었습니다.';
        break;
        
      default:
        response.error = `지원하지 않는 액션입니다: ${postData.action}`;
        return createJsonResponse(response);
    }

    return createJsonResponse(response);

  } catch (error) {
    console.error('doPost 오류:', error);
    
    return createJsonResponse({
      success: false,
      error: `서버 오류: ${error.toString()}`,
      data: null,
      message: ''
    });
  }
}

/**
 * MBTI 테스트 결과를 스프레드시트에 저장
 */
function saveTestResult(data) {
  try {
    // 스프레드시트 ID 확인
    if (!SPREADSHEET_ID || SPREADSHEET_ID === '1H0GELHx8VWmXwBzlb-G-24_J4HpROIqDI1vDo_rRo-4') {
      throw new Error('스프레드시트 ID가 설정되지 않았습니다. Google Apps Script에서 SPREADSHEET_ID를 실제 값으로 교체하세요.');
    }
    
    // 스프레드시트 열기
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(TEST_SHEET_NAME);
    
    // 시트가 없으면 생성
    if (!sheet) {
      sheet = createTestResultSheet(spreadsheet);
    }

    // 현재 시간 (한국시간)
    const now = new Date();
    const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    
    // 추가 데이터 추출
    const additionalData = extractAdditionalData(data.responses || []);
    
    // 기본 정보 행 추가
    const mainRow = [
      kstTime, // A: 완료일시
      data.result_type || '', // B: MBTI타입 (예: ENFP)
      data.result_title || '', // C: 결과제목
      additionalData.frequency || '미응답', // D: 캠핑빈도
      additionalData.companion || '미응답', // E: 주요동반자
      getClientIP(), // F: IP주소
      data.user_agent || '', // G: 사용자에이전트
      data.referrer || '', // H: 리퍼러
      JSON.stringify(data.responses || []) // I: 전체응답(JSON)
    ];
    
    sheet.appendRow(mainRow);
    
    // 저장된 행 번호
    const lastRow = sheet.getLastRow();
    
    console.log(`MBTI 캠핑 테스트 결과 저장 완료 - 행: ${lastRow}, 타입: ${data.result_type}, 제목: ${data.result_title}`);
    
    return {
      row: lastRow,
      timestamp: kstTime.toISOString(),
      result_type: data.result_type,
      result_title: data.result_title,
      frequency: additionalData.frequency,
      companion: additionalData.companion
    };
    
  } catch (error) {
    console.error('saveTestResult 오류:', error);
    throw new Error(`테스트 결과 저장 실패: ${error.toString()}`);
  }
}

/**
 * 쿠폰 발급 처리
 */
function issueCoupon(data) {
  try {
    // 스프레드시트 ID 확인
    if (!SPREADSHEET_ID || SPREADSHEET_ID === '1H0GELHx8VWmXwBzlb-G-24_J4HpROIqDI1vDo_rRo-4') {
      throw new Error('스프레드시트 ID가 설정되지 않았습니다. Google Apps Script에서 SPREADSHEET_ID를 실제 값으로 교체하세요.');
    }
    
    // 스프레드시트 열기
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(COUPON_SHEET_NAME);
    
    // 시트가 없으면 생성
    if (!sheet) {
      sheet = createCouponSheet(spreadsheet);
    }

    // 쿠폰 코드 생성
    const couponCode = generateCouponCode(data.result_type);
    
    // 현재 시간 (한국시간)
    const now = new Date();
    const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    
    // 쿠폰 정보 행 추가
    const couponRow = [
      kstTime, // A: 발급일시
      couponCode, // B: 쿠폰코드
      data.result_type || '', // C: MBTI타입
      '34000', // D: 할인금액
      '미사용', // E: 사용상태
      getClientIP(), // F: IP주소
      data.user_agent || '' // G: 사용자에이전트
    ];
    
    sheet.appendRow(couponRow);
    
    // 저장된 행 번호
    const lastRow = sheet.getLastRow();
    
    console.log(`쿠폰 발급 완료 - 행: ${lastRow}, 코드: ${couponCode}, 타입: ${data.result_type}`);
    
    return {
      row: lastRow,
      coupon_code: couponCode,
      discount_amount: 34000,
      timestamp: kstTime.toISOString(),
      result_type: data.result_type
    };
    
  } catch (error) {
    console.error('issueCoupon 오류:', error);
    throw new Error(`쿠폰 발급 실패: ${error.toString()}`);
  }
}

/**
 * MBTI 테스트 결과 저장용 시트 생성
 */
function createTestResultSheet(spreadsheet) {
  try {
    const sheet = spreadsheet.insertSheet(TEST_SHEET_NAME);
    
    // 헤더 설정
    const headers = [
      '완료일시',
      'MBTI타입',
      '결과제목',
      '캠핑빈도',
      '주요동반자',
      'IP주소',
      '사용자에이전트',
      '리퍼러',
      '전체응답JSON'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // 헤더 스타일링
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#4CAF50');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
    
    // 열 너비 조정
    sheet.setColumnWidth(1, 180); // 완료일시
    sheet.setColumnWidth(2, 100); // MBTI타입
    sheet.setColumnWidth(3, 200); // 결과제목
    sheet.setColumnWidth(4, 100); // 캠핑빈도
    sheet.setColumnWidth(5, 100); // 주요동반자
    sheet.setColumnWidth(6, 120); // IP주소
    sheet.setColumnWidth(7, 200); // 사용자에이전트
    sheet.setColumnWidth(8, 150); // 리퍼러
    sheet.setColumnWidth(9, 300); // 전체응답JSON
    
    // 시트 보호 (헤더만)
    const protection = headerRange.protect().setDescription('헤더 보호');
    protection.setWarningOnly(true);
    
    console.log('MBTI 테스트 결과 시트 생성 완료');
    return sheet;
    
  } catch (error) {
    console.error('createTestResultSheet 오류:', error);
    throw new Error(`테스트 결과 시트 생성 실패: ${error.toString()}`);
  }
}

/**
 * 쿠폰 발급용 시트 생성
 */
function createCouponSheet(spreadsheet) {
  try {
    const sheet = spreadsheet.insertSheet(COUPON_SHEET_NAME);
    
    // 헤더 설정
    const headers = [
      '발급일시',
      '쿠폰코드',
      'MBTI타입',
      '할인금액',
      '사용상태',
      'IP주소',
      '사용자에이전트'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // 헤더 스타일링
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#1565C0');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
    
    // 열 너비 조정
    sheet.setColumnWidth(1, 180); // 발급일시
    sheet.setColumnWidth(2, 150); // 쿠폰코드
    sheet.setColumnWidth(3, 100); // MBTI타입
    sheet.setColumnWidth(4, 100); // 할인금액
    sheet.setColumnWidth(5, 100); // 사용상태
    sheet.setColumnWidth(6, 120); // IP주소
    sheet.setColumnWidth(7, 200); // 사용자에이전트
    
    // 시트 보호 (헤더만)
    const protection = headerRange.protect().setDescription('헤더 보호');
    protection.setWarningOnly(true);
    
    console.log('쿠폰 발급 시트 생성 완료');
    return sheet;
    
  } catch (error) {
    console.error('createCouponSheet 오류:', error);
    throw new Error(`쿠폰 시트 생성 실패: ${error.toString()}`);
  }
}

/**
 * 응답에서 추가 데이터 추출 (캠핑빈도, 주요동반자)
 */
function extractAdditionalData(responses) {
  const additionalData = {
    frequency: '',
    companion: ''
  };
  
  try {
    responses.forEach(response => {
      if (response.type === 'FREQUENCY' && response.value) {
        additionalData.frequency = response.value;
      }
      if (response.type === 'COMPANION' && response.value) {
        additionalData.companion = response.value;
      }
    });
  } catch (error) {
    console.error('extractAdditionalData 오류:', error);
  }
  
  return additionalData;
}

/**
 * MBTI 타입 기반 쿠폰 코드 생성
 */
function generateCouponCode(mbtiType) {
  try {
    const prefix = 'CAMP';
    const typeCode = mbtiType || 'UNKN';
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    
    return `${prefix}${typeCode}${timestamp}${random}`;
  } catch (error) {
    console.error('generateCouponCode 오류:', error);
    // 에러 시 기본 쿠폰 코드 생성
    return `CAMP${Math.random().toString(36).substr(2, 12).toUpperCase()}`;
  }
}

/**
 * 클라이언트 IP 주소 가져오기 (근사치)
 */
function getClientIP() {
  try {
    // Google Apps Script에서는 정확한 클라이언트 IP를 얻기 어려움
    // 대신 타임스탬프 기반 식별자 사용
    return `USER-${new Date().getTime()}`;
  } catch (error) {
    return 'unknown';
  }
}

/**
 * JSON 응답 생성 (CORS 헤더 포함)
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
}

/**
 * MBTI 테스트 저장 테스트 함수
 */
function testMBTISaveFunction() {
  const testData = {
    action: 'save_test_result',
    timestamp: new Date().toISOString(),
    result_type: 'ENFP',
    result_title: '열정적 탐험가',
    responses: [
      {
        questionNumber: 1,
        question: "캠핑을 계획할 때 나는...",
        answer: "대략적인 계획만 세우고 즉흥적으로 즐긴다",
        type: "P",
        value: null,
        timestamp: new Date().toISOString()
      },
      {
        questionNumber: 2,
        question: "캠핑에서 텐트가 찢어지거나 장비가 고장났을 때 나는...",
        answer: "함께 온 사람들을 배려하며 차분하게 대안을 모색한다",
        type: "F",
        value: null,
        timestamp: new Date().toISOString()
      },
      {
        questionNumber: 3,
        question: "캠핑 중 갑작스런 비가 와서 계획이 틀어졌을 때 나는...",
        answer: "동행한 사람들이 실망하지 않도록 분위기를 챙긴다",
        type: "F",
        value: null,
        timestamp: new Date().toISOString()
      },
      {
        questionNumber: 4,
        question: "1년에 몇 번 정도 캠핑을 하시나요?",
        answer: "3~5회 정도",
        type: "FREQUENCY",
        value: "3-5회",
        timestamp: new Date().toISOString()
      },
      {
        questionNumber: 7,
        question: "주로 누구와 캠핑을 가시나요?",
        answer: "친구들과 즐겁게",
        type: "COMPANION",
        value: "친구",
        timestamp: new Date().toISOString()
      }
    ],
    ip_address: '',
    user_agent: 'Test User Agent - MBTI Version',
    referrer: ''
  };
  
  try {
    const result = saveTestResult(testData);
    console.log('MBTI 테스트 저장 성공:', result);
    return result;
  } catch (error) {
    console.error('MBTI 테스트 저장 실패:', error);
    throw error;
  }
}

/**
 * 쿠폰 발급 테스트 함수
 */
function testCouponFunction() {
  const testData = {
    action: 'issue_coupon',
    result_type: 'ENFP',
    ip_address: '',
    user_agent: 'Test User Agent - Coupon Test'
  };
  
  try {
    const result = issueCoupon(testData);
    console.log('쿠폰 발급 성공:', result);
    return result;
  } catch (error) {
    console.error('쿠폰 발급 실패:', error);
    throw error;
  }
}

/**
 * MBTI 테스트 통계 조회
 */
function getTestStatistics() {
  try {
    // 스프레드시트 ID 확인
    if (!SPREADSHEET_ID || SPREADSHEET_ID === '1H0GELHx8VWmXwBzlb-G-24_J4HpROIqDI1vDo_rRo-4') {
      throw new Error('스프레드시트 ID가 설정되지 않았습니다. Google Apps Script에서 SPREADSHEET_ID를 실제 값으로 교체하세요.');
    }
    
    // 스프레드시트 열기
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(TEST_SHEET_NAME);
    
    if (!sheet) {
      return {
        total_responses: 0,
        mbti_stats: {},
        message: '테스트 결과 시트가 없습니다.'
      };
    }
    
    // 모든 데이터 가져오기 (헤더 제외)
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return {
        total_responses: 0,
        mbti_stats: {},
        message: '아직 테스트 결과가 없습니다.'
      };
    }
    
    // B열(MBTI타입) 데이터 가져오기
    const mbtiTypes = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
    
    // MBTI 타입별 카운트
    const typeCounts = {};
    const totalResponses = mbtiTypes.length;
    
    // 모든 MBTI 타입 초기화
    const allTypes = ['ENFP', 'ENFJ', 'ENTP', 'ENTJ', 'ESFP', 'ESFJ', 'ESTP', 'ESTJ', 
                     'INFP', 'INFJ', 'INTP', 'INTJ', 'ISFP', 'ISFJ', 'ISTP', 'ISTJ'];
    
    allTypes.forEach(type => {
      typeCounts[type] = 0;
    });
    
    // 실제 응답 카운트
    mbtiTypes.forEach(type => {
      if (type && allTypes.includes(type)) {
        typeCounts[type]++;
      }
    });
    
    // 퍼센티지 계산
    const mbtiStats = {};
    allTypes.forEach(type => {
      const count = typeCounts[type];
      const percentage = totalResponses > 0 ? ((count / totalResponses) * 100).toFixed(2) : 0;
      mbtiStats[type] = {
        count: count,
        percentage: parseFloat(percentage)
      };
    });
    
    console.log(`MBTI 통계 조회 완료 - 총 응답: ${totalResponses}건`);
    
    return {
      total_responses: totalResponses,
      mbti_stats: mbtiStats,
      last_updated: new Date().toISOString(),
      message: '통계 조회 성공'
    };
    
  } catch (error) {
    console.error('getTestStatistics 오류:', error);
    throw new Error(`통계 조회 실패: ${error.toString()}`);
  }
}

/**
 * 통계 조회 테스트 함수
 */
function testStatisticsFunction() {
  try {
    const stats = getTestStatistics();
    console.log('통계 조회 성공:', stats);
    return stats;
  } catch (error) {
    console.error('통계 조회 실패:', error);
    throw error;
  }
}

/**
 * 전체 시스템 테스트 함수
 */
function testFullSystem() {
  console.log('=== MBTI 캠핑 스타일 테스트 시스템 전체 테스트 시작 ===');
  
  try {
    // 1. 테스트 결과 저장 테스트
    console.log('1. 테스트 결과 저장 테스트...');
    const testResult = testMBTISaveFunction();
    console.log('✓ 테스트 결과 저장 성공');
    
    // 2. 쿠폰 발급 테스트
    console.log('2. 쿠폰 발급 테스트...');
    const couponResult = testCouponFunction();
    console.log('✓ 쿠폰 발급 성공');
    
    // 3. 통계 조회 테스트
    console.log('3. 통계 조회 테스트...');
    const statsResult = testStatisticsFunction();
    console.log('✓ 통계 조회 성공');
    
    console.log('=== 전체 테스트 완료 ===');
    return {
      testResult: testResult,
      couponResult: couponResult,
      statsResult: statsResult,
      status: 'success'
    };
    
  } catch (error) {
    console.error('=== 전체 테스트 실패 ===', error);
    return {
      status: 'error',
      error: error.toString()
    };
  }
}
