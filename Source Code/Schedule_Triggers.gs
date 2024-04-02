function scheduleSingleMail() {
    var optionsArray = generateTemplateDropdowndata();

    // Check if the optionsArray is empty
    if (optionsArray.length === 0) {
        var message = "Please create a template before scheduling it.";
        var link = "https://gentlereminder.in/";
        var width = 400;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return; // Exit the function if no templates are available
    }

    var template = HtmlService.createTemplateFromFile('Schedule_Template_Single');
    template.myOptions = optionsArray;

    var sidebar = template.evaluate();
    sidebar.setTitle('Schedule Template');
    SpreadsheetApp.getUi().showSidebar(sidebar);
}

function scheduleRepeatMail() {
    var optionsArray = generateTemplateDropdowndata();

    // Check if the optionsArray is empty
    if (optionsArray.length === 0) {
        var message = "Please create a template before scheduling it.";
        var link = "https://gentlereminder.in/";
        var width = 400;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return; // Exit the function if no templates are available
    }

    var template = HtmlService.createTemplateFromFile('Schedule_Template_Repeat');
    template.myOptions = optionsArray;

    var sidebar = template.evaluate();
    sidebar.setTitle('Schedule Template');
    SpreadsheetApp.getUi().showSidebar(sidebar);
}
