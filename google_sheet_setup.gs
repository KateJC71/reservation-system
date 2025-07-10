/**
 * 雪具預約系統 - Google Sheet 自動建立腳本
 * 執行此腳本會自動建立完整的欄位結構
 */

function createReservationSheet() {
  // 取得目前活躍的試算表
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getActiveSheet();
  
  // 清空現有內容
  sheet.clear();
  
  // 定義所有欄位標題
  const headers = [
    // 基本預約資訊
    '預約編號', '預約日期', '租借日期', '租借地點', '歸還地點', '租借天數', '甲地租乙地還',
    
    // 申請人資料
    '申請人姓名', '申請人電話', '申請人Email', '通訊軟體類型', '通訊軟體ID', '住宿飯店', '接送需求', '接送細項'
  ];
  
  // 為每個租借者添加欄位 (最多10人)
  for (let i = 1; i <= 10; i++) {
    const renterHeaders = [
      `租借者${i}_姓名`, `租借者${i}_年齡`, `租借者${i}_性別`, `租借者${i}_身高`, `租借者${i}_體重`,
      `租借者${i}_腳尺寸`, `租借者${i}_滑雪程度`, `租借者${i}_滑雪種類`, `租借者${i}_雪板類型`,
      `租借者${i}_裝備類型`, `租借者${i}_雪衣選項`, `租借者${i}_安全帽`, `租借者${i}_Fase快穿`,
      `租借者${i}_主裝備價格`, `租借者${i}_雪靴價格`, `租借者${i}_雪衣價格`, `租借者${i}_安全帽價格`,
      `租借者${i}_Fase價格`, `租借者${i}_小計`
    ];
    headers.push(...renterHeaders);
  }
  
  // 費用計算與系統資訊
  headers.push('裝備費用小計', '甲地租乙地還費用', '總金額', '幣值', '狀態', '備註', '最後更新');
  
  // 寫入標題列
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // 設定標題列格式
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  
  // 設定欄寬
  for (let i = 1; i <= headers.length; i++) {
    const column = sheet.getColumn(i);
    if (headers[i-1].includes('姓名') || headers[i-1].includes('Email') || headers[i-1].includes('飯店')) {
      column.setWidth(200);
    } else if (headers[i-1].includes('價格') || headers[i-1].includes('費用') || headers[i-1].includes('小計')) {
      column.setWidth(120);
    } else if (headers[i-1].includes('備註')) {
      column.setWidth(300);
    } else {
      column.setWidth(100);
    }
  }
  
  // 設定資料驗證 (下拉選單)
  setupDataValidation(sheet, headers);
  
  // 凍結標題列
  sheet.setFrozenRows(1);
  
  // 設定自動編號公式
  setupAutoNumbering(sheet);
  
  // 設定自動計算公式
  setupAutoCalculation(sheet, headers);
  
  Logger.log('Google Sheet 結構建立完成！');
}

/**
 * 設定資料驗證 (下拉選單)
 */
function setupDataValidation(sheet, headers) {
  // 租借地點/歸還地點
  const locationColumns = headers.map((header, index) => header.includes('地點') ? index + 1 : null).filter(col => col);
  locationColumns.forEach(col => {
    const range = sheet.getRange(2, col, 1000, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['富良野店', '旭川店'], true)
      .setAllowInvalid(false)
      .build();
    range.setDataValidation(rule);
  });
  
  // 性別欄位
  const genderColumns = headers.map((header, index) => header.includes('性別') ? index + 1 : null).filter(col => col);
  genderColumns.forEach(col => {
    const range = sheet.getRange(2, col, 1000, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['男', '女'], true)
      .setAllowInvalid(false)
      .build();
    range.setDataValidation(rule);
  });
  
  // 滑雪程度
  const skillColumns = headers.map((header, index) => header.includes('滑雪程度') ? index + 1 : null).filter(col => col);
  skillColumns.forEach(col => {
    const range = sheet.getRange(2, col, 1000, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['初學者', '中級', '高級'], true)
      .setAllowInvalid(false)
      .build();
    range.setDataValidation(rule);
  });
  
  // 滑雪種類
  const typeColumns = headers.map((header, index) => header.includes('滑雪種類') ? index + 1 : null).filter(col => col);
  typeColumns.forEach(col => {
    const range = sheet.getRange(2, col, 1000, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['雙板', '單板'], true)
      .setAllowInvalid(false)
      .build();
    range.setDataValidation(rule);
  });
  
  // 裝備類型
  const equipmentColumns = headers.map((header, index) => header.includes('裝備類型') ? index + 1 : null).filter(col => col);
  equipmentColumns.forEach(col => {
    const range = sheet.getRange(2, col, 1000, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['大全配', '板靴組', '單租雪板', '單租雪靴'], true)
      .setAllowInvalid(false)
      .build();
    range.setDataValidation(rule);
  });
  
  // 雪衣選項
  const clothingColumns = headers.map((header, index) => header.includes('雪衣選項') ? index + 1 : null).filter(col => col);
  clothingColumns.forEach(col => {
    const range = sheet.getRange(2, col, 1000, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['單租雪衣', '單租雪褲', '租一整套(雪衣及雪褲)', '否'], true)
      .setAllowInvalid(false)
      .build();
    range.setDataValidation(rule);
  });
  
  // 安全帽/Fase快穿
  const yesNoColumns = headers.map((header, index) => 
    (header.includes('安全帽') || header.includes('Fase快穿')) ? index + 1 : null
  ).filter(col => col);
  yesNoColumns.forEach(col => {
    const range = sheet.getRange(2, col, 1000, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['是', '否'], true)
      .setAllowInvalid(false)
      .build();
    range.setDataValidation(rule);
  });
  
  // 狀態
  const statusCol = headers.indexOf('狀態') + 1;
  if (statusCol > 0) {
    const range = sheet.getRange(2, statusCol, 1000, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['新預約', '已確認', '已完成', '已取消'], true)
      .setAllowInvalid(false)
      .build();
    range.setDataValidation(rule);
  }
}

/**
 * 設定自動編號
 */
function setupAutoNumbering(sheet) {
  // 在 A2 設定自動編號公式
  const formula = '=IF(ROW()=2, "RSV"&TEXT(NOW(), "YYYYMMDD")&"001", IF(ROW()>2, "RSV"&TEXT(NOW(), "YYYYMMDD")&TEXT(ROW()-1, "000"), ""))';
  sheet.getRange(2, 1).setFormula(formula);
}

/**
 * 設定自動計算公式
 */
function setupAutoCalculation(sheet, headers) {
  // 找到各欄位的位置
  const getColumnIndex = (headerName) => headers.indexOf(headerName) + 1;
  
  // 為每個租借者設定小計公式
  for (let i = 1; i <= 10; i++) {
    const subtotalCol = getColumnIndex(`租借者${i}_小計`);
    const mainPriceCol = getColumnIndex(`租借者${i}_主裝備價格`);
    const bootPriceCol = getColumnIndex(`租借者${i}_雪靴價格`);
    const clothingPriceCol = getColumnIndex(`租借者${i}_雪衣價格`);
    const helmetPriceCol = getColumnIndex(`租借者${i}_安全帽價格`);
    const fasePriceCol = getColumnIndex(`租借者${i}_Fase價格`);
    
    if (subtotalCol > 0) {
      const formula = `=IF(ISNUMBER(${String.fromCharCode(64 + mainPriceCol)}2), ${String.fromCharCode(64 + mainPriceCol)}2, 0) + IF(ISNUMBER(${String.fromCharCode(64 + bootPriceCol)}2), ${String.fromCharCode(64 + bootPriceCol)}2, 0) + IF(ISNUMBER(${String.fromCharCode(64 + clothingPriceCol)}2), ${String.fromCharCode(64 + clothingPriceCol)}2, 0) + IF(ISNUMBER(${String.fromCharCode(64 + helmetPriceCol)}2), ${String.fromCharCode(64 + helmetPriceCol)}2, 0) + IF(ISNUMBER(${String.fromCharCode(64 + fasePriceCol)}2), ${String.fromCharCode(64 + fasePriceCol)}2, 0)`;
      sheet.getRange(2, subtotalCol).setFormula(formula);
    }
  }
  
  // 設定裝備費用小計公式
  const equipmentSubtotalCol = getColumnIndex('裝備費用小計');
  if (equipmentSubtotalCol > 0) {
    let formula = '=';
    for (let i = 1; i <= 10; i++) {
      const subtotalCol = getColumnIndex(`租借者${i}_小計`);
      if (subtotalCol > 0) {
        if (i > 1) formula += ' + ';
        formula += `${String.fromCharCode(64 + subtotalCol)}2`;
      }
    }
    sheet.getRange(2, equipmentSubtotalCol).setFormula(formula);
  }
  
  // 設定總金額公式
  const totalCol = getColumnIndex('總金額');
  const equipmentSubtotalCol2 = getColumnIndex('裝備費用小計');
  const locationFeeCol = getColumnIndex('甲地租乙地還費用');
  
  if (totalCol > 0) {
    const formula = `=IF(ISNUMBER(${String.fromCharCode(64 + equipmentSubtotalCol2)}2), ${String.fromCharCode(64 + equipmentSubtotalCol2)}2, 0) + IF(ISNUMBER(${String.fromCharCode(64 + locationFeeCol)}2), ${String.fromCharCode(64 + locationFeeCol)}2, 0)`;
    sheet.getRange(2, totalCol).setFormula(formula);
  }
  
  // 設定幣值預設值
  const currencyCol = getColumnIndex('幣值');
  if (currencyCol > 0) {
    sheet.getRange(2, currencyCol).setValue('日幣(¥)');
  }
  
  // 設定狀態預設值
  const statusCol = getColumnIndex('狀態');
  if (statusCol > 0) {
    sheet.getRange(2, statusCol).setValue('新預約');
  }
}

/**
 * 建立 Web API 接收預約資料
 */
function doPost(e) {
  try {
    // 解析接收到的資料
    const data = JSON.parse(e.postData.contents);
    
    // 取得試算表
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getActiveSheet();
    
    // 準備要寫入的資料
    const rowData = prepareRowData(data);
    
    // 寫入新的一行
    const lastRow = sheet.getLastRow() + 1;
    sheet.getRange(lastRow, 1, 1, rowData.length).setValues([rowData]);
    
    // 回傳成功訊息
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: '預約資料已成功儲存',
        reservationId: rowData[0]
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // 回傳錯誤訊息
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: '儲存失敗: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 準備要寫入試算表的資料
 */
function prepareRowData(data) {
  const headers = getHeaders();
  const rowData = new Array(headers.length).fill('');
  
  // 基本預約資訊
  rowData[headers.indexOf('預約編號')] = generateReservationId();
  rowData[headers.indexOf('預約日期')] = new Date();
  rowData[headers.indexOf('租借日期')] = new Date(data.rentalDate);
  rowData[headers.indexOf('租借地點')] = data.pickupLocation;
  rowData[headers.indexOf('歸還地點')] = data.returnLocation;
  rowData[headers.indexOf('租借天數')] = data.rentalDays;
  rowData[headers.indexOf('甲地租乙地還')] = data.pickupLocation !== data.returnLocation;
  
  // 申請人資料
  rowData[headers.indexOf('申請人姓名')] = data.applicant.name;
  rowData[headers.indexOf('申請人電話')] = data.applicant.phone;
  rowData[headers.indexOf('申請人Email')] = data.applicant.email;
  rowData[headers.indexOf('通訊軟體類型')] = data.applicant.messagingApp.type;
  rowData[headers.indexOf('通訊軟體ID')] = data.applicant.messagingApp.id;
  rowData[headers.indexOf('住宿飯店')] = data.applicant.hotel;
  rowData[headers.indexOf('接送需求')] = data.applicant.transportation.required ? '需要接送' : '不須接送';
  rowData[headers.indexOf('接送細項')] = data.applicant.transportation.required ? data.applicant.transportation.details.join(', ') : '';
  
  // 租借者資料
  data.renters.forEach((renter, index) => {
    if (index < 10) { // 最多10人
      const prefix = `租借者${index + 1}_`;
      rowData[headers.indexOf(prefix + '姓名')] = renter.name;
      rowData[headers.indexOf(prefix + '年齡')] = renter.age;
      rowData[headers.indexOf(prefix + '性別')] = renter.gender;
      rowData[headers.indexOf(prefix + '身高')] = renter.height;
      rowData[headers.indexOf(prefix + '體重')] = renter.weight;
      rowData[headers.indexOf(prefix + '腳尺寸')] = renter.shoeSize;
      rowData[headers.indexOf(prefix + '滑雪程度')] = renter.skillLevel;
      rowData[headers.indexOf(prefix + '滑雪種類')] = renter.skiType;
      rowData[headers.indexOf(prefix + '雪板類型')] = renter.boardType;
      rowData[headers.indexOf(prefix + '裝備類型')] = renter.equipmentType;
      rowData[headers.indexOf(prefix + '雪衣選項')] = renter.clothingOption;
      rowData[headers.indexOf(prefix + '安全帽')] = renter.helmet ? '是' : '否';
      rowData[headers.indexOf(prefix + 'Fase快穿')] = renter.fase ? '是' : '否';
      rowData[headers.indexOf(prefix + '主裝備價格')] = renter.prices.mainEquipment;
      rowData[headers.indexOf(prefix + '雪靴價格')] = renter.prices.boots;
      rowData[headers.indexOf(prefix + '雪衣價格')] = renter.prices.clothing;
      rowData[headers.indexOf(prefix + '安全帽價格')] = renter.prices.helmet;
      rowData[headers.indexOf(prefix + 'Fase價格')] = renter.prices.fase;
      rowData[headers.indexOf(prefix + '小計')] = renter.prices.subtotal;
    }
  });
  
  // 費用計算
  rowData[headers.indexOf('裝備費用小計')] = data.totalEquipmentCost;
  rowData[headers.indexOf('甲地租乙地還費用')] = data.locationChangeFee;
  rowData[headers.indexOf('總金額')] = data.totalAmount;
  rowData[headers.indexOf('幣值')] = '日幣(¥)';
  rowData[headers.indexOf('狀態')] = '新預約';
  rowData[headers.indexOf('最後更新')] = new Date();
  
  return rowData;
}

/**
 * 取得標題列
 */
function getHeaders() {
  const sheet = SpreadsheetApp.getActiveSheet();
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

/**
 * 產生預約編號
 */
function generateReservationId() {
  const now = new Date();
  const dateStr = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyyMMdd');
  const timeStr = Utilities.formatDate(now, 'Asia/Tokyo', 'HHmmss');
  return `RSV${dateStr}${timeStr}`;
}

/**
 * 測試用：建立範例資料
 */
function createSampleData() {
  const sampleData = {
    rentalDate: '2024-12-25',
    pickupLocation: '富良野店',
    returnLocation: '旭川店',
    rentalDays: 3,
    applicant: {
      name: '張小明',
      phone: '+886912345678',
      email: 'test@example.com',
      messagingApp: { type: 'Line', id: 'test123' },
      hotel: '富良野王子大飯店',
      transportation: { required: true, details: ['富良野站接送', '飯店接送'] }
    },
    renters: [
      {
        name: '張小明',
        age: 30,
        gender: '男',
        height: 175,
        weight: 70,
        shoeSize: 26.5,
        skillLevel: '中級',
        skiType: '雙板',
        boardType: '一般',
        equipmentType: '大全配',
        clothingOption: '否',
        helmet: true,
        fase: false,
        prices: {
          mainEquipment: 8000,
          boots: 0,
          clothing: 0,
          helmet: 1000,
          fase: 0,
          subtotal: 9000
        }
      }
    ],
    totalEquipmentCost: 9000,
    locationChangeFee: 2000,
    totalAmount: 11000
  };
  
  // 模擬 POST 請求
  const mockEvent = {
    postData: {
      contents: JSON.stringify(sampleData)
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
} 