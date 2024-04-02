function saveTemplateInformation(data) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AM-Templates');

    // Get the row number from data
    var row = data.rowCount;

    // Define the range that will hold the data
    var range = sheet.getRange(row, 3, 1, 14); // 1 row, 13 columns starting from column 3

    // Set wrap strategy for all cells to 'CLIP'
    range.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

    // Prepare the data as an array of values in the order they appear in the sheet
    var values = [
        data.to,
        data.cc,
        data.bcc,
        data.quotaAction,
        data.expirationInterval,
        data.sendsMailOption,
        data.contentHTMLCondition,
        data.subjectContent,
        data.bodyContent,
        data.unsubscribeChoice,
        data.unsubscribeLink,
        data.attachmentAction,
        data.attachmentCount,
        JSON.stringify(data.selectedAttachments) // Use JSON.stringify here
    ];

    // Set the entire row of values at once
    sheet.getRange(row, 3, 1, values.length).setValues([values]); // Note the double brackets [[]] for a 2D array

    // Optionally set a flag or note in the first column to indicate "Saved"
    sheet.getRange(row, 1).setValue("Saved");
}
