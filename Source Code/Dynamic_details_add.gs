function showColumnCreatorPopup() {
    //switchToSheet('Dynamic label');  Used Earlier to switch to sheet.
    var sidebar = HtmlService.createTemplateFromFile('Dynamic_details_column_creator').evaluate();
    sidebar.setTitle('Dynamic label creator');
    SpreadsheetApp.getUi().showSidebar(sidebar);
}

// function that decides what happens when ok clicked, 
function submitColumn(form) {

    var template = HtmlService.createTemplateFromFile('Loading_Animation');
    template.message = 'creating a Label';
    var html = template.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setWidth(230).setHeight(40);
    SpreadsheetApp.getUi().showModalDialog(html, ' ');

    if (!form.input || form.input.trim() === "") {
        var message = "Dynamic label cannot be blank";
        var link = "https://gentlereminder.in/";
        var width = 300;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return;
    }

    if (!/^[a-zA-Z0-9\s]+$/.test(form.input)) { //does not allow special characters
        var message = "Dynamic label can only contain letters, numbers and spaces";
        var link = "https://gentlereminder.in/";
        var width = 510;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return;
    }
    if (form.input.length > 100) {
        var message = "Dynamic label cannot be longer than 100 characters";
        var link = "https://gentlereminder.in/";
        var width = 450;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return;
    }
    var value = form.input;
    var type = form.type;
    var typeArray = ["Text", "Number", "Date", "Email ID", "Attachments"];
    if (typeArray.includes(type)) {
        columnCreator(value, type);
    } else {
        // type value is not recognized
        var message = "Invalid type value!" + type;
        var link = "https://gentlereminder.in/";
        var width = 350;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return false;
    }
    return false;
}
