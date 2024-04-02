// function responsible for creating pop up for row creating
function showRowCreatorPopup() {
    //switchToSheet('Default Label');  
    var sidebar = HtmlService.createTemplateFromFile('Default_details_row_creator').evaluate();
    sidebar.setTitle('Default details label creator');
    SpreadsheetApp.getUi().showSidebar(sidebar);
}

// function that decides what happens when ok clicked, 
function submitRow(form) {

    var template = HtmlService.createTemplateFromFile('Loading_Animation');
    template.message = 'creating a Label';
    var html = template.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setWidth(230).setHeight(40);
    SpreadsheetApp.getUi().showModalDialog(html, ' ');

    if (!form.input || form.input.trim() === "") {
        var message = "Default label cannot be blank";
        var link = "https://gentlereminder.in/";
        var width = 310;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return;
    }

    if (!/^[a-zA-Z0-9\s]+$/.test(form.input)) {
        var message = "Default label can only contain letters, numbers and spaces";
        var link = "https://gentlereminder.in/";
        var width = 530;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return;
    }

    if (form.input.length > 100) {
        var message = "Default label cannot be longer than 100 characters";
        var link = "https://gentlereminder.in/";
        var width = 470;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return;
    }

    var value = form.input;
    var type = form.type;
    var typeArray = ["Text", "Number", "Date", "Email ID", "Attachments"];
    if (typeArray.includes(type)) {
        rowCreator(value, type);
    } else {
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
