//This function helps creating data labels in row
function rowCreator(value, type) {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var docProperties = PropertiesService.getDocumentProperties();
    var sheetIdKey = 'defaultSheetID';
    var storedSheetId = docProperties.getProperty(sheetIdKey);
    var sheet;

    // Try to get the sheet by ID if it exists
    if (storedSheetId) {
        sheet = getSheetById(parseInt(storedSheetId));
    }

    // If sheet is not found by ID or ID does not exist, create a new sheet
    if (!sheet) {
        sheet = spreadsheet.insertSheet();
        try {
            sheet.setName('Default Label');
        } catch (e) {}
        var newSheetId = sheet.getSheetId();

        // Update the document property with new sheet ID
        docProperties.setProperty(sheetIdKey, newSheetId.toString());
    }

    // Check if the sheet is empty, insert a dummy column -------------------------------------------
    if (sheet.getDataRange().getNumRows() == 1 && sheet.getDataRange().getNumColumns() == 1) {
        try {
            sheet.hideColumns(1);
            sheet.getRange(1, 1).setValue("Types");
            sheet.getRange(1, 1, 15, 1).setBackground("#8aa6b4").setFontWeight("bold");
            sheet.getRange(1, 2, 15, 1).setFontWeight("bold");
            sheet.setColumnWidths(1, 2, 160);
            sheet.setColumnWidth(3, 360);
            sheet.hideColumns(4, 23);
            sheet.getRange(1, 2, 15, 2).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
            var banding = sheet.getRange(1, 2, 15, 2).getBandings()[0];
            banding.setHeaderRowColor("#ebeff1")
                .setFirstRowColor("#ffffff")
                .setSecondRowColor("#ebeff1");
            sheet.getRange(1, 1).clearContent();
        } catch (e) {
            sheet.getRange(1, 1).clearContent();
        }
    } else {
        // Check if the row name already exists in the second column
        var existingRowNames = sheet.getRange(1, 2, sheet.getLastRow(), 1).getValues().flat();
        if (existingRowNames.indexOf(value) !== -1) {
            if (existingColumnNames.indexOf(value) !== -1) {
                var message = "Label with the same name already exists!";
                var link = "https://gentlereminder.in/";
                var width = 380;
                var height = 145;
                var title = "Error!";
                showErrorPopup(message, link, width, height, title);
                return false;
            }
        }
    }

    // Determine the row number to add the new label. If the sheet is empty (getLastRow() is 0),
    // set the row number to 1. Otherwise, set it to the next available row (getLastRow() + 1).
    var rowCount = sheet.getLastRow() || 1;

    // If the sheet is not empty, increment the rowCount to add the label in a new row.
    if (sheet.getLastRow() !== 0) {
        rowCount += 1;
    }

    // Add the new row type and name to the sheet.
    var rowTypeRange = sheet.getRange(rowCount, 1);
    rowTypeRange.setValue(type);

    var rowHeaderRange = sheet.getRange(rowCount, 2);
    rowHeaderRange.setValue(value);

    var range = sheet.getRange(rowCount, 3);
    range.clearDataValidations();

    //handling type-specific logic
    if (type === "Text") {
        range.setNumberFormat('General');
    } else if (type === "Number") {
        // set the data validation------------------------------------------------------------- 
        range.setNumberFormat("0.######");
        range.setDataValidation(SpreadsheetApp.newDataValidation()
            .setAllowInvalid(false)
            .setHelpText('Please enter number between -1 Billion to 1 Billion. (Hint: If you need to extend this limits, please checkout Data > Data validation tab in menu.)')
            .requireNumberBetween(-1000000000, 1000000000)
            .build())

    } else if (type === "Date") {
        // Set the values in the second row of the next 4 columns as "days left/passed_value", "dD_(value)", "mD_(value)", and "yD_(value)" also sets the title as supporting column for the value-----------------------------------------------------------
        sheet.getRange(rowCount, 3, 4, 1).clearDataValidations(); // Clear data validations from the supporting
        range.setNumberFormat('dd/MM/yyyy'); //reapply formatting for date format
        sheet.getRange(rowCount + 1, 3, 4, 1).setNumberFormat("0"); //and it's supporting rows

        var supportRows = sheet.getRange(rowCount + 1, 1, 4, 2);
        supportRows.getCell(1, 1).setValue("( Supporting");
        supportRows.getCell(2, 1).setValue("  rows");
        supportRows.getCell(3, 1).setValue("  for");
        supportRows.getCell(4, 1).setValue("  " + value);
        supportRows.getCell(1, 2).setValue("dLP_" + value);
        supportRows.getCell(2, 2).setValue("dD_" + value);
        supportRows.getCell(3, 2).setValue("mD_" + value);
        supportRows.getCell(4, 2).setValue("yD_" + value);

        // setting formula for find days left/passed---------------------------------------------------------

        // Use absolute references in the formula
        var cellRef = '$' + range.getA1Notation().replace(/\d+$/, '') + '$' + rowCount;

        // Formula to find days difference
        var formulaDaysLeft = '=IF(' + cellRef + '="", "", ' + cellRef + ' - TODAY())';
        sheet.getRange(rowCount + 1, 3).setFormula(formulaDaysLeft);

        // Formula to find days difference since the specified date
        var formuladD = '=IF(' + cellRef + '="", "", DAY(' + cellRef + ') - DAY(TODAY()))';
        sheet.getRange(rowCount + 2, 3).setFormula(formuladD);

        // Formula to find months difference since the specified date
        var formulamD = '=IF(' + cellRef + '="", "", MONTH(' + cellRef + ') - MONTH(TODAY()))';
        sheet.getRange(rowCount + 3, 3).setFormula(formulamD);

        // Formula to find years difference since the specified date
        var formulayD = '=IF(' + cellRef + '="", "", YEAR(' + cellRef + ') - YEAR(TODAY()))';
        sheet.getRange(rowCount + 4, 3).setFormula(formulayD);


        // Setting Validation to make sure User has entered Date

        range.setDataValidation(SpreadsheetApp.newDataValidation()
            .setAllowInvalid(false)
            .setHelpText('Please enter a valid Date')
            .requireDate()
            .build())
    } else if (type === "Email ID") {
        range.setNumberFormat('General');
        var rangeNotation = range.getA1Notation();
        var customFormula = '=AND(REGEXMATCH(' + rangeNotation + ', "^[a-zA-Z0-9._+\\-@,\\s]+$"), ' +
            'NOT(REGEXMATCH(' + rangeNotation + ', "@{2,}")), ' + // No consecutive @
            'NOT(REGEXMATCH(' + rangeNotation + ', "\\.{2,}")), ' + // No consecutive .
            'NOT(REGEXMATCH(' + rangeNotation + ', ",{2,}")))'; // No consecutive ,

        var validation = SpreadsheetApp.newDataValidation()
            .requireFormulaSatisfied(customFormula)
            .setAllowInvalid(false)
            .setHelpText('Please enter email addresses in the format: user1@example.com , user2@example.com (remeber not to use "; (semicolon)" to separate emails and use ",(comma)")')
            .build();

        // Apply the validation to the range
        range.setDataValidation(validation);
    } else if (type === "Attachments") {
        range.setNumberFormat('General');
        var rangeNotation = range.getA1Notation();
        var customFormula = '=REGEXMATCH(FORMULATEXT(' + rangeNotation + '), "^=HYPERLINK\\(")';
        var validation = SpreadsheetApp.newDataValidation()
            .requireFormulaSatisfied(customFormula)
            .setAllowInvalid(false)
            .setHelpText('Please pick your attachment file from the "Add Attachments" menu')
            .build();

        // Apply the validation to the range
        range.setDataValidation(validation);
    }

    sheet.setActiveRange(sheet.getRange(rowCount, 2));
    closeLoadingDialog();
    return;
}
