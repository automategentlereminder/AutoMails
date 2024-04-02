function useSingleTrigger(e) {

    var sheetDynamic = getSheetByKey('dynamicSheetID');
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AM-Templates');
    processTemplatesBasedOnStatus(sheet, sheetDynamic);
    var triggerUid = e.triggerUid.toString();

    var rowCount = -1; // Initialize rowCount to -1, indicating that the triggerUid was not found

    // Get the data range of the sheet
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();

    // Iterate over the rows of the sheet
    for (var i = 0; i < values.length; i++) {
        var row = values[i];
        var storedTriggerUid = row[17]; //18th column (index 17)
        var storedTemplateName = row[1];

        // Check if the stored triggerUid matches the provided triggerUid
        if (storedTriggerUid.toString() === triggerUid.toString()) {
            rowCount = i + 1; // Set rowCount to the index of the matching row (+1 to adjust for 0-based index)
            break; // Exit the loop since we found the matching row
        }
    }

    var form = {
        rowCount: rowCount - 2, // Call a function to retrieve rowCount
        templateName: storedTemplateName // Call a function to retrieve templateName
    };

    // Call sendEmails function with the form object
    sendEmails(form);

    sheet.getRange(rowCount, 17, 1, 2).clear();
    // Find and delete trigger by ID
    var allTriggers = ScriptApp.getProjectTriggers();
    allTriggers.forEach(function(trigger) {
        if (trigger.getUniqueId().toString() === triggerUid.toString()) {
            ScriptApp.deleteTrigger(trigger);
        }
    });
}


function useRepeatTrigger(e) {

    var sheetDynamic = getSheetByKey('dynamicSheetID');
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AM-Templates');
    processTemplatesBasedOnStatus(sheet, sheetDynamic);
    var triggerUid = e.triggerUid.toString();

    var rowCount = -1; // Initialize rowCount to -1, indicating that the triggerUid was not found

    // Get the data range of the sheet
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();

    // Iterate over the rows of the sheet
    for (var i = 0; i < values.length; i++) {
        var row = values[i];
        var storedTriggerUid = row[19]; //20th column (index 17)
        var storedTemplateName = row[1];

        // Check if the stored triggerUid matches the provided triggerUid
        if (storedTriggerUid.toString() === triggerUid.toString()) {
            rowCount = i + 1; // Set rowCount to the index of the matching row (+1 to adjust for 0-based index)
            break; // Exit the loop since we found the matching row
        }
    }

    var form = {
        rowCount: rowCount - 2, // Call a function to retrieve rowCount
        templateName: storedTemplateName // Call a function to retrieve templateName
    };

    // Call sendEmails function with the form object
    sendEmails(form);

}
