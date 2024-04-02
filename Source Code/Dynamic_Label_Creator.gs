//This function helps creating data labels in column
function columnCreator(value, type) {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var docProperties = PropertiesService.getDocumentProperties();
    var sheetIdKey = 'dynamicSheetID';
    var storedSheetId = docProperties.getProperty(sheetIdKey);
    var sheet;

    // Try to get the sheet by ID if it exists
    if (storedSheetId) {
        try {
            sheet = getSheetById(parseInt(storedSheetId));
        } catch (e) {}
    }

    // If sheet is not found by ID or ID does not exist, create a new sheet
    if (!sheet) {
        sheet = spreadsheet.insertSheet();
        try {
            sheet.setName('Dynamic Label');
        } catch (e) {}
        var newSheetId = sheet.getSheetId();

        // Update the document property with new sheet ID
        docProperties.setProperty(sheetIdKey, newSheetId.toString());
    }

    // Check if the sheet is empty, insert a dummy column -------------------------------------------
    if (sheet.getDataRange().getNumRows() == 1 && sheet.getDataRange().getNumColumns() == 1) {
        try {
            sheet.hideRows(1);
            sheet.getRange(1, 1).setValue("Types");
            sheet.getRange(1, 1, 1, 26).setBackground("#8aa6b4").setFontWeight("bold");
            sheet.getRange(2, 1, 1, 26).setFontWeight("bold");
            sheet.setColumnWidths(1, 26, 120);
            sheet.getRange(2, 1, 250, 26).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
            var banding = sheet.getRange(2, 1, 250, 50).getBandings()[0];
            banding.setHeaderRowColor("#afd2e5")
                .setFirstRowColor("#ffffff")
                .setSecondRowColor("#ebeff1");
            sheet.getRange(1, 1).clearContent();
        } catch (e) {
            sheet.getRange(1, 1).clearContent();
            // no need to log exception, as it occurs due to re applying banding
        }
    } else {
        // Check if the column name already exists in the second row-----------------------------------------------------
        var existingColumnNames = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
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

    // add the new column to the sheet  
    var columnCount = sheet.getLastColumn() || 1;

    // If the sheet is not empty, increment the columnCount to add the label in a new column.
    if (sheet.getLastColumn() !== 0) {
        columnCount += 1;
    }

    // Add the new column type and name to the sheet.
    var columnTypeRange = sheet.getRange(1, columnCount);
    columnTypeRange.setValue(type);
    var columnHeaderRange = sheet.getRange(2, columnCount);
    columnHeaderRange.setValue(value);

    var range = sheet.getRange(3, columnCount, 250, 1);
    range.clearDataValidations();

    //handling type-specific logic
    if (type === "Text") {
        range.setNumberFormat('General');
    } else if (type === "Number") {
        // set the data validation-------------------------------------------------------------  
        range.setNumberFormat("0.######");
        range.setDataValidation(SpreadsheetApp.newDataValidation()
            .setAllowInvalid(false)
            .setHelpText('Please enter a number between -1 billion and 1 billion.(Hint: If you need to extend these limits, please navigate to Data > Data validation tab in the menu.)')
            .requireNumberBetween(-1000000000, 1000000000)
            .build())
    } else if (type === "Date") {

        sheet.setColumnWidths(columnCount + 1, 4, 60);

        sheet.getRange(3, columnCount, 250, 5).clearDataValidations(); // Clear data validations from the supporting
        range.setNumberFormat('dd/MM/yyyy'); //reapply formatting for date format
        sheet.getRange(3, columnCount + 1, 250, 4).setNumberFormat("0"); //and it's supporting columns

        // Set the values in the second row of the next 4 columns as "days left/passed_value", "dD_(value)", "mD_(value)", and "yD_(value)" also sets the title as supporting column for the value-----------------------------------------------------------

        var supportColumns = sheet.getRange(1, columnCount + 1, 2, 4);
        supportColumns.getCell(1, 1).setValue("Supporting columns for " + value);
        supportColumns.getCell(2, 1).setValue("dLP_" + value);
        supportColumns.getCell(2, 2).setValue("dD_" + value);
        supportColumns.getCell(2, 3).setValue("mD_" + value);
        supportColumns.getCell(2, 4).setValue("yD_" + value);

        // setting formula for the first column to find days left/passed---------------------------------------------------------

        // Define the absolute range reference
        var rangeRef = '$' + range.getA1Notation().split(':')[0].replace(/\d+$/, '') + '3:$' + range.getA1Notation().split(':')[0].replace(/\d+$/, '') + '252';

        // Formula to find days left
        var formulaDaysLeft = '=IF(' + rangeRef + '="", "", ' + rangeRef + ' - TODAY())';
        var supportColumnsDaysLeft = sheet.getRange(3, columnCount + 1, 250, 1);
        supportColumnsDaysLeft.setFormula(formulaDaysLeft);

        // Formula to find days difference since the specified date
        var formuladD = '=IF(' + rangeRef + '="", "", DAY(' + rangeRef + ') - DAY(TODAY()))';
        var supportColumnsdD = sheet.getRange(3, columnCount + 2, 250, 1);
        supportColumnsdD.setFormula(formuladD);

        // Formula to find months difference since the specified date
        var formulamD = '=IF(' + rangeRef + '="", "", MONTH(' + rangeRef + ') - MONTH(TODAY()))';
        var supportColumnsmD = sheet.getRange(3, columnCount + 3, 250, 1);
        supportColumnsmD.setFormula(formulamD);

        // Formula to find years difference since the specified date
        var formulayD = '=IF(' + rangeRef + '="", "", YEAR(' + rangeRef + ') - YEAR(TODAY()))';
        var supportColumnsyD = sheet.getRange(3, columnCount + 4, 250, 1);
        supportColumnsyD.setFormula(formulayD);



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

    sheet.setActiveRange(sheet.getRange(2, columnCount));

    closeLoadingDialog();
    return;
}
