function checkDynamicandTemplateSheet(sheet, sheetDynamic, templateName) {

    if (!sheet) {
        var message = "Create a template first";
        var link = "https://gentlereminder.in/";
        var width = 300;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return;
    }

    if (!templateName || templateName.trim() === "") { // does not allow blank inut
        var message = "Template name cannot be blank";
        var link = "https://gentlereminder.in/";
        var width = 300;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return;
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(templateName)) { //does not allow special characters
        var message = "Template name can only contain letters, numbers and spaces";
        var link = "https://gentlereminder.in/";
        var width = 510;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return;
    }
    if (templateName.length > 50) {
        var message = "Template name cannot be longer than 50 characters";
        var link = "https://gentlereminder.in/";
        var width = 450;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return;
    }
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
        return; // Stop the execution of the function if there are no email ID Label	
    }

}
