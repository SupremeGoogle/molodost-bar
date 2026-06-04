var SHEET_NAME = 'Заявки';

function doPost(e) {
  try {
    var sheet = getOrCreateSheet();
    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      new Date(),
      data.name    || '',
      data.phone   || '',
      data.type    || 'Вопрос',
      data.guests  || '',
      data.date    || '',
      data.message || '',
      data.source  || 'Сайт',
    ]);
    return jsonResponse({ ok: true });
  } catch(err) {
    return jsonResponse({ ok: false, error: err.toString() });
  }
}

function doGet() {
  return jsonResponse({ ok: true, status: 'Молодость CRM активен' });
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    var headers = ['Дата','Имя','Телефон','Тип заявки','Гостей','Дата визита','Сообщение','Источник'];
    sheet.appendRow(headers);
    var hr = sheet.getRange(1, 1, 1, headers.length);
    hr.setBackground('#C00020');
    hr.setFontColor('#FFFFFF');
    hr.setFontWeight('bold');
    sheet.setFrozenRows(1);
    [160,150,150,160,110,130,320,110].forEach(function(w, i) { sheet.setColumnWidth(i+1, w); });
  }
  return sheet;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
