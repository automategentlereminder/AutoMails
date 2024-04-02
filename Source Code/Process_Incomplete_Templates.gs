function processTemplatesBasedOnStatus(sheet, sheetDynamic) {
    var data = sheet.getDataRange().getValues(); // Get all data from the sheet tracking templates
    var headerRow = 2; // Assuming the headers are in the second row

    var templateStatuses = {}; // Object to store template names and their statuses
    for (var i = 1; i < data.length; i++) {
        // Populate the object with template names as keys and statuses as values
        templateStatuses[data[i][1]] = data[i][0]; // Assuming template names are in column B and statuses in column A
    }

    var currentLastColumn = sheetDynamic.getLastColumn();
    for (var column = currentLastColumn; column >= 1; column--) { // Iterate backwards to avoid indexing issues
        var columnHeader = sheetDynamic.getRange(headerRow, column).getValue();

        if (columnHeader.startsWith("Timestamp_") || columnHeader.startsWith("Reminder_")) {
            var associatedTemplateName = columnHeader.split("_")[1] || ""; // Safely extract template name from header
            if (templateStatuses[associatedTemplateName] !== "Saved") {
                // If the template associated with this column is not marked as "Saved", delete the column
                sheetDynamic.deleteColumn(column);
                currentLastColumn--; // Adjust the count of the last column
            }
        }
    }

    // Separate loop to delete rows for templates with "Incomplete" status
    // This needs to be a backward iteration to handle dynamic deletion correctly
    for (var i = data.length - 1; i >= 1; i--) {
        if (data[i][0] != "Saved") { // Assuming the statuses are in the first column (A)
            sheet.deleteRow(i + 1); // +1 to adjust for zero-based indexing vs. Sheet's 1-based indexing
        }
    }
}
