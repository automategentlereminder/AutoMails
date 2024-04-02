function createSingleTrigger(form) {
    var rowCount = (form.rowCount) + 2;
    // var templateName = form.templateName;
    var selectedDateTime = form.selectedDateTime;

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AM-Templates');

    // Check if there are values in the range
    var range = sheet.getRange(rowCount, 17, 1, 2);
    range.setNumberFormat('@');
    var existingValues = range.getValues();
    if (existingValues[0][0] || existingValues[0][1]) {
        throw new Error("Schedule already exists. Please remove the existing schedule first.");
    }

    var triggerDate = new Date(selectedDateTime);

    // Create a time-based trigger
    var triggerID = ScriptApp.newTrigger("useSingleTrigger")
        .timeBased()
        .at(triggerDate)
        .create()
        .getUniqueId()
        .toString();

    var values = [
        selectedDateTime,
        triggerID,
    ];

    range.setValues([values]);
}

function createRepeatTrigger(form) {
    var rowCount = (form.rowCount) + 2;
    // var templateName = form.templateName;
    var selectedTime = form.selectedTime;

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AM-Templates');

    // Check if there are values in the range
    var range = sheet.getRange(rowCount, 19, 1, 2);
    range.setNumberFormat('@');
    var existingValues = range.getValues();
    if (existingValues[0][0] || existingValues[0][1]) {
        throw new Error("Schedule already exists. Please remove the existing schedule first.");
    }

    // Extract hour and minute from the selectedTime variable

    // Create a daily time-based trigger
    var triggerID = ScriptApp.newTrigger("useRepeatTrigger")
        .timeBased()
        .atHour(selectedTime) // Set the desired hour
        .everyDays(1)
        .create()
        .getUniqueId()
        .toString();

    var values = [
        selectedTime,
        triggerID,
    ];

    range.setValues([values]);

}
