function createTemplate() {
    //  switchToSheet('AM-Templates'); keeping it hidden
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AM-Templates');
    if (!sheet) {
        sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet();
        sheet.setName('AM-Templates');
        sheet.hideSheet();
    }
    var sidebar = HtmlService.createTemplateFromFile('New_Template').evaluate();
    sidebar.setTitle('New template creator');
    SpreadsheetApp.getUi().showSidebar(sidebar);
}

// function that decides what happens when ok clicked, 
function submitTemplateName(form) {

    var template = HtmlService.createTemplateFromFile('Loading_Animation');
    template.message = 'Opening template editor';
    var html = template.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setWidth(280).setHeight(40);
    SpreadsheetApp.getUi().showModalDialog(html, ' ');

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AM-Templates');
    // Check if the sheet is empty, insert a dummy column -------------------------------------------
    try {
        if (sheet.getDataRange().getNumRows() == 1 && sheet.getDataRange().getNumColumns() == 1) {
            sheet.insertColumnBefore(1);

            sheet.getRange(1, 1, 1, 50).setFontWeight("bold");
            sheet.setColumnWidths(1, 50, 120);
            sheet.getRange(1, 1, 100, 50).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
            var banding = sheet.getRange(1, 1, 100, 50).getBandings()[0];
            banding.setHeaderRowColor("#afd2e5")
                .setFirstRowColor("#ffffff")
                .setSecondRowColor("#ebeff1");

            var values = [
                ["status", "Template name", "To", "CC", "BCC", "Quota over", "Resend Mail", "Sending option", "Condition", "Subject", "Body", "Unsubscribe", "Link", "Attachment size exceed", "Total Attachments", "Attachment Files", "Single Trigger Time", "Single Trigger ID", "Repeat Trigger Time", "Repeat Trigger ID"]
            ];
            sheet.getRange(1, 1, 1, values[0].length).setValues(values);

        }
    } catch (e) {
        Logger.log(e);
    }
    if (!form.input || form.input.trim() === "") { // does not allow blank inut
        var message = "Template name cannot be blank";
        var link = "https://gentlereminder.in/";
        var width = 300;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return;
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(form.input)) { //does not allow special characters
        var message = "Template name can only contain letters, numbers and spaces";
        var link = "https://gentlereminder.in/";
        var width = 510;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return;
    }
    if (form.input.length > 50) {
        var message = "Template name cannot be longer than 50 characters";
        var link = "https://gentlereminder.in/";
        var width = 450;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return;
    }

    var docProperties = PropertiesService.getDocumentProperties();
    var sheetIdKey = 'dynamicSheetID';
    var storedSheetId = docProperties.getProperty(sheetIdKey);
    var sheetDynamic;

    // Try to get the sheet by ID if it exists
    if (storedSheetId) {
        try {
            sheetDynamic = getSheetById(parseInt(storedSheetId));
        } catch (e) {}
    }

    // If sheet is not found by ID or ID does not exist, create a new sheet
    if (!sheetDynamic) {
        var message = "Please, first create dynamic labels for sending mails";
        var link = "https://gentlereminder.in/";
        var width = 450;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return;
    }

    var emailLabelsCount = 0;
    for (var i = 1; i <= sheetDynamic.getLastColumn(); i++) {
        if (sheetDynamic.getRange(1, i).getValue() == "Email ID" && sheetDynamic.getRange(2, i).getValue() != "") {
            emailLabelsCount++;
        }
    }
    if (emailLabelsCount == 0) {
        var message = "Please create Email type dynamic label for mail id";
        var link = "https://gentlereminder.in/";
        var width = 450;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return; // Stop the execution of the function if there are already 3 columns of Email_ID type	
    }

    processTemplatesBasedOnStatus(sheet, sheetDynamic); // removes entry of templates that were left incomplete

    var value = form.input;
    // Check if the Template name already exists in the second column
    var existingTemplateNames = sheet.getRange(1, 2, sheet.getLastRow(), 1).getValues().flat();
    if (existingTemplateNames.indexOf(value) !== -1) {
        var message = "Template with the same name already exists!";
        var link = "https://gentlereminder.in/";
        var width = 400;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return;

    }
    // Add the new template row to the sheet
    var rowCount = sheet.getLastRow() + 1;
    var rowTypeRange = sheet.getRange(rowCount, 1);
    rowTypeRange.setValue("Incomplete");

    var rowHeaderRange = sheet.getRange(rowCount, 2);
    rowHeaderRange.setValue(value);

    // add the new mail sent and reminder number column to the sheetDynamic -------------------------------------------------------------  
    var columnCount = sheetDynamic.getLastColumn() + 1;
    var columnTypeRange = sheetDynamic.getRange(1, columnCount);
    columnTypeRange.setValue("Report");
    var columnHeaderRange = sheetDynamic.getRange(2, columnCount);
    columnHeaderRange.setValue("Timestamp_" + value);

    var columnTypeReminderRange = sheetDynamic.getRange(1, columnCount + 1);
    columnTypeReminderRange.setValue("Reminder");

    var columnHeaderReminderRange = sheetDynamic.getRange(2, columnCount + 1);
    columnHeaderReminderRange.setValue("Reminder_" + value);

    // Add the new template row to the sheet
    var {
        dynamicAttach,
        defaultAttach
    } = totalAttachments();
    var {
        toDropdownData,
        ccDropdownData,
        bccDropdownData
    } = generateEmailDropdowndata(); // Call this function to get the dropdown

    var template = HtmlService.createTemplateFromFile('Setup_Template');
    template.rowCount = rowCount; // Pass the 'rowCount' variable to the HTML file
    template.dynamicAttach = dynamicAttach;
    template.defaultAttach = defaultAttach;
    template.toDropdownData = toDropdownData;
    template.ccDropdownData = ccDropdownData;
    template.bccDropdownData = bccDropdownData;

    var html = template.evaluate()
        .setSandboxMode(HtmlService.SandboxMode.IFRAME).setWidth(1300).setHeight(700);
    SpreadsheetApp.getUi().showModalDialog(html, '#' + (rowCount - 1) + ' ' + value);

}
