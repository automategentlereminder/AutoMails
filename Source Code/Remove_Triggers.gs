function removeTriggers() {
    var optionsArray = generateTemplateDropdowndata();

    // Check if the optionsArray is empty
    if (optionsArray.length === 0) {
        var message = "There are no templates yet.";
        var link = "https://gentlereminder.in/";
        var width = 400;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return; // Exit the function if no templates are available
    }

    var template = HtmlService.createTemplateFromFile('Remove_Schedules');
    template.myOptions = optionsArray;

    var sidebar = template.evaluate();
    sidebar.setTitle('Schedule Template');
    SpreadsheetApp.getUi().showSidebar(sidebar);

}

function deleteScheduledTriggers(form) {
    var rowCount = (form.rowCount) + 2; // +2 to adjust array index with actual row count

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AM-Templates');
    var data = sheet.getRange(rowCount, 17, 1, 4).getValues()[0];
    var singleTime = data[0]; // Column Q
    var singleTriggerId = data[1]; // Column R (assuming singleTrigger contains trigger ID)
    var repeatedTime = data[2]; // Column S
    var repeatedTriggerId = data[3]; // Column T (assuming repeatedTrigger contains trigger ID)
    var singleTimeFormatted = formatDateTime(singleTime);
    var repeatedTimeFormatted = formatHourToTime(repeatedTime);

    var ui = SpreadsheetApp.getUi();
    if (form.deleteTrigger === "deleteSingle") {
        if (singleTime != "" && singleTriggerId != "") {
            var result = ui.alert(
                'Please confirm',
                'Do you really want to cancel one time schedule of ' + singleTimeFormatted + ' set for "' + form.templateName + '" template?',
                ui.ButtonSet.YES_NO);

            if (result == ui.Button.YES) {
                sheet.getRange(rowCount, 17, 1, 2).clear();

                // Find and delete trigger by ID
                var allTriggers = ScriptApp.getProjectTriggers();
                allTriggers.forEach(function(trigger) {
                    if (trigger.getUniqueId().toString() === singleTriggerId.toString()) {
                        ScriptApp.deleteTrigger(trigger);
                    }
                });
            } else {
                // User clicked No
                throw Error("user clicked NO");
            }
        } else {
            var message = "There are no schedules for single time category.";
            var link = "https://gentlereminder.in/";
            var width = 300;
            var height = 145;
            var title = "Error!";
            showErrorPopup(message, link, width, height, title);
            return;
        }
    } else if (form.deleteTrigger === "deleteRepeated") {
        if (repeatedTriggerId != "") {
            var result = ui.alert(
                'Please confirm',
                'Do you really want to cancel repeat scan scheduled for ' + repeatedTimeFormatted + ' for "' + form.templateName + '" template?',
                ui.ButtonSet.YES_NO);

            if (result == ui.Button.YES) {
                sheet.getRange(rowCount, 19, 1, 2).clear();

                // Find and delete trigger by ID
                var allTriggers = ScriptApp.getProjectTriggers();
                allTriggers.forEach(function(trigger) {
                    if (trigger.getUniqueId().toString() === repeatedTriggerId.toString()) {
                        ScriptApp.deleteTrigger(trigger);
                    }
                });
            } else {
                // User clicked No
                throw Error("user clicked NO");
            }
        } else {
            var message = "There are no schedules for repeat category.";
            var link = "https://gentlereminder.in/";
            var width = 300;
            var height = 145;
            var title = "Error!";
            showErrorPopup(message, link, width, height, title);
            return;
        }
    } else if (form.deleteTrigger === "both") {
        var result = ui.alert(
            'Please confirm',
            'Do you really want to remove all schedules for "' + form.templateName + '" template?',
            ui.ButtonSet.YES_NO);

        if (result == ui.Button.YES) {
            sheet.getRange(rowCount, 17, 1, 4).clear();

            // Find and delete trigger by ID
            var allTriggers = ScriptApp.getProjectTriggers();
            allTriggers.forEach(function(trigger) {
                if (trigger.getUniqueId().toString() === singleTriggerId.toString() || trigger.getUniqueId().toString() === repeatedTriggerId.toString()) {
                    ScriptApp.deleteTrigger(trigger);
                }
            });
        } else {
            // User clicked No
            throw Error("user clicked NO");
        }
    }
}

function deleteAllTriggers() {
    var ui = SpreadsheetApp.getUi();
    var result = ui.alert(
        'Attention!',
        'This will remove all (and any) existing schedules linked with the sheet. Templates will stay as it is.',
        ui.ButtonSet.YES_NO);

    if (result == ui.Button.YES) {

        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AM-Templates');
        sheet.getRange(2, 17, sheet.getLastRow() - 1, 4).clear();

        var allTriggers = ScriptApp.getProjectTriggers();

        // Loop through all triggers and delete each one
        allTriggers.forEach(function(trigger) {
            ScriptApp.deleteTrigger(trigger);
        });
    }
}
