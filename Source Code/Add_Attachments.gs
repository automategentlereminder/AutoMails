//opens drive picker
function pickFiles() {
    var picker = HtmlService.createTemplateFromFile('Picker');
    var html = picker.evaluate()
        .setSandboxMode(HtmlService.SandboxMode.IFRAME).setWidth(800).setHeight(650);
    SpreadsheetApp.getUi().showModalDialog(html, ' Select files or Folders');
}

function getOAuthToken() {
    return ScriptApp.getOAuthToken();
}

function setPickedFiles(pickedFiles) {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getActiveSheet();
    var sheetName = sheet.getName();
    var currentCell = sheet.getActiveCell();
    var currentColumn = currentCell.getColumn();
    var currentRow = currentCell.getRow();

    // If the current cell is A1, alert the user to select a different cell
    if (currentCell.getA1Notation() === 'A1') {
        var message = 'Make sure you are filling data\n for the Attachment label.';
        var link = "https://gentlereminder.in/";
        var width = 300;
        var height = 145;
        var title = "Attention!";
        showErrorPopup(message, link, width, height, title);
        return; // Exit the function
    }

    // Get the header value and check for an exact match
    var headerValue = sheet.getRange(1, currentColumn).getValue();

    // Check if the selected column's header is exactly "Attachments"
    if (headerValue === "Attachments") {
        var range = sheet.getRange(3, currentColumn, 3000);
        range.clearDataValidations();

        pickedFiles.forEach(function(file, index) {
            const row = currentRow + index;
            const cell = sheet.getRange(row, currentColumn);
            cell.setFormula(`=HYPERLINK("${file.url}", "${file.name}")`);
        });

        // Assuming you've set the picked files here and now setting the validation
        var columnLetter = range.getA1Notation().match(/^[A-Z]+/)[0]; // Extract column letter from A1 notation
        var customFormula = `=REGEXMATCH(FORMULATEXT(${columnLetter}3:${columnLetter}3002), "^=HYPERLINK\\(")`;
        var validation = SpreadsheetApp.newDataValidation()
            .requireFormulaSatisfied(customFormula)
            .setAllowInvalid(false)
            .setHelpText('Please pick your attachment file from the attachment menu')
            .build();

        range.setDataValidation(validation);

    } else if (sheet.getRange(currentRow, 1).getValue() === "Attachments") {
        var range = sheet.getRange(currentRow, 3);
        range.clearDataValidations();

        if (pickedFiles.length > 0) {
            var file = pickedFiles[0]; // Get the first file from the picked files
            range.setFormula(`=HYPERLINK("${file.url}", "${file.name}")`);
        }

        // Assuming you've set the picked file here and now setting the validation
        var customFormula = `=REGEXMATCH(FORMULATEXT(${range.getA1Notation()}), "^=HYPERLINK\\(")`;
        var validation = SpreadsheetApp.newDataValidation()
            .requireFormulaSatisfied(customFormula)
            .setAllowInvalid(false)
            .setHelpText('Please pick your attachment file from the attachment menu')
            .build();

        range.setDataValidation(validation);
    } else {
        var message = 'Make sure you are filling data\n for the Attachment label.';
        var link = "https://gentlereminder.in/";
        var width = 300;
        var height = 145;
        var title = "Attention!";
        showErrorPopup(message, link, width, height, title);
    }
}
