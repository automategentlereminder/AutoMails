function editTemplate() {
    var optionsArray = generateTemplateDropdowndata(); // This function generates an array of options
    var template = HtmlService.createTemplateFromFile('Edit_Template_Select');
    template.myOptions = optionsArray; // Inject the array
    var sidebar = template.evaluate();
    sidebar.setTitle('Edit Template');
    SpreadsheetApp.getUi().showSidebar(sidebar);
}

function deleteTemplate() {
    var optionsArray = generateTemplateDropdowndata(); // This function generates an array of options
    var template = HtmlService.createTemplateFromFile('Delete_Template_Select');
    template.myOptions = optionsArray; // Inject the array
    var sidebar = template.evaluate();
    sidebar.setTitle('Delete Template');
    SpreadsheetApp.getUi().showSidebar(sidebar);
}

// Function to generate dropdown options as an array
function generateTemplateDropdowndata() {
    var sheetDynamic = getSheetByKey('dynamicSheetID');
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AM-Templates');
    processTemplatesBasedOnStatus(sheet, sheetDynamic);
    var data = sheet.getRange("A2:B").getValues();
    var optionsArray = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i][0] === "Saved") {
            optionsArray.push(data[i][1]);
        }
    }
    Logger.log(optionsArray);
    return optionsArray;
}

// function that decides what happens when ok clicked, 
function submitEditTemplateName(form) {

    var rowCount = (form.rowCount) + 2; // +2 to adjust array index with actual row count
    var value = form.templateName;
    var template = HtmlService.createTemplateFromFile('Loading_Animation');
    template.message = 'Opening template editor';
    var html = template.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setWidth(280).setHeight(40);
    SpreadsheetApp.getUi().showModalDialog(html, ' ');

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AM-Templates');
    if (!sheet) {
        var message = "Create a template first";
        var link = "https://gentlereminder.in/";
        var width = 300;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return;
    }

    if (!value || value.trim() === "") { // does not allow blank inut
        var message = "Template name cannot be blank";
        var link = "https://gentlereminder.in/";
        var width = 300;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return;
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(value)) { //does not allow special characters
        var message = "Template name can only contain letters, numbers and spaces";
        var link = "https://gentlereminder.in/";
        var width = 510;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return;
    }
    if (value.length > 50) {
        var message = "Template name cannot be longer than 50 characters";
        var link = "https://gentlereminder.in/";
        var width = 450;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return;
    }

    var sheetDynamic = getSheetByKey('dynamicSheetID');
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

    var {
        dynamicAttach,
        defaultAttach
    } = totalAttachments();
    var {
        toDropdownData,
        ccDropdownData,
        bccDropdownData
    } = generateEmailDropdowndata(); // Calling to get the dropdown
    var values = sheet.getRange(rowCount, 3, 1, 14).getValues()[0]; // Retrieves a 2D array and gets the first row
    var [toSelected, ccSelected, bccSelected, quotaActionValue, expirationIntervalValue, sendsMailOptionValue, contentHTMLConditionValue, subjectContentValue, bodyContentValue, unsubscribeChoiceValue, unsubscribeLinkValue, attachmentActionValue, attachmentCount, selectedAttachments] = values; // assgning array values to variables

    var template = HtmlService.createTemplateFromFile('Edit_Template');
    template.rowCount = rowCount; // Pass the 'rowCount' variable to the HTML file
    template.dynamicAttach = dynamicAttach;
    template.defaultAttach = defaultAttach;
    template.toDropdownData = toDropdownData;
    template.ccDropdownData = ccDropdownData;
    template.bccDropdownData = bccDropdownData;
    template.toSelected = toSelected;
    template.ccSelected = ccSelected;
    template.bccSelected = bccSelected;
    template.quotaActionValue = quotaActionValue;
    template.expirationIntervalValue = expirationIntervalValue;
    template.sendsMailOptionValue = sendsMailOptionValue;
    template.contentHTMLConditionValue = contentHTMLConditionValue;
    template.subjectContentValue = subjectContentValue;
    template.bodyContentValue = bodyContentValue;
    template.unsubscribeChoiceValue = unsubscribeChoiceValue;
    template.unsubscribeLinkValue = unsubscribeLinkValue;
    template.attachmentActionValue = attachmentActionValue;
    template.attachmentCount = attachmentCount;
    template.selectedAttachments = selectedAttachments;


    var html = template.evaluate()
        .setSandboxMode(HtmlService.SandboxMode.IFRAME).setWidth(1300).setHeight(700);
    SpreadsheetApp.getUi().showModalDialog(html, '#' + (rowCount - 1) + ' ' + value);

}

function submitDeleteTemplateName(form) {
    var ui = SpreadsheetApp.getUi();
    var result = ui.alert(
        'Please confirm',
        'Do you really want to delete the "' + form.templateName + '" template?',
        ui.ButtonSet.YES_NO);

    // Process the user's response.
    if (result == ui.Button.YES) {
        // User clicked "Yes"
        var rowCount = (form.rowCount) + 2;
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AM-Templates');
        sheet.deleteRow(rowCount);
        // Refresh the sidebar by calling deleteTemplate
        deleteTemplate();
    } else {
        // User clicked "No"
        // Do nothing, end the function
    }
}
