// switches to the sheet we want, if sheet is not there, it will create one.
function switchToSheet(sheetName) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
        sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet();
        sheet.setName(sheetName);
    }
    SpreadsheetApp.setActiveSheet(sheet);
    return sheet;
}

function getSheetById(id) {
    var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
    return sheets.filter(function(s) {
        return s.getSheetId() === id;
    })[0];
}

function getSheetByKey(key) {
    var docProperties = PropertiesService.getDocumentProperties();
    var storedSheetId = docProperties.getProperty(key);
    var sheet;

    if (storedSheetId) {
        try {
            // Convert stored ID from string to integer, as getSheetById expects an integer.
            var sheetId = parseInt(storedSheetId, 10);
            sheet = getSheetById(sheetId);
        } catch (e) {
            // Log the error or handle it as needed
            Logger.log('Error fetching sheet by ID: ' + e.toString());
        }
    }

    return sheet;
}

// Function to close the dialog box. as simple as it says
function closeDialog() {
    google.script.host.close();
}

// Function to delete all script properties
function deleteAllScriptProperties() {
    var scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.deleteAllProperties();
}

// function to include css and scripts from different files
function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename)
        .getContent();
}

function logDocumentProperties() {
    // Get the document properties
    var properties = PropertiesService.getDocumentProperties();

    // Fetch all properties stored in the document as an object
    var allProperties = properties.getProperties();

    // Log each property key-value pair
    for (var key in allProperties) {
        if (allProperties.hasOwnProperty(key)) {
            console.log(key + ": " + allProperties[key]);
        }
    }
}



// close loading box
function closeLoadingDialog() {
    try {
        var htmlOutput = HtmlService.createHtmlOutput('<script>google.script.host.close();</script>')
            .setSandboxMode(HtmlService.SandboxMode.IFRAME)
            .setWidth(1)
            .setHeight(1);
        SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Done!');
    } catch (e) {}

}

//Function to call error popup
function showErrorPopup(message, link, width, height, title) {
    try {
        var template = HtmlService.createTemplateFromFile("Generic_HTML_popup");
        template.message = message;
        template.link = link;
        var html = template.evaluate().setWidth(width).setHeight(height);
        SpreadsheetApp.getUi().showModalDialog(html, title);
    } catch (e) {

    }

}

//function to know left mails
function getRemainingDailyQuota() {
    return MailApp.getRemainingDailyQuota();
}

function calculateLastRow(sheet, columnCount) {
    var columnLetter = columnToLetter(columnCount);

    // Construct the formula string
    var formula = `MAX(ARRAYFORMULA(ROW(${columnLetter}3:${columnLetter}) * (${columnLetter}3:${columnLetter}<>"")))`;

    // Create a temporary cell reference using columnLetter and a suitable offset (e.g., "1")
    var tempCell = sheet.getRange(`${columnLetter}1`); // You can adjust the offset if needed

    // Set the formula, evaluate, and restore the original value
    tempCell.setFormula(formula);
    var lastRow = tempCell.getValue();
    tempCell.setValue("Email ID");

    return lastRow;
}

// Function to convert column index to column letter
function columnToLetter(column) {
    let temp, letter = '';
    while (column > 0) {
        temp = (column - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        column = (column - temp - 1) / 26;
    }
    return letter;
}

function extractIdFromFormula(formula) {
    // Implement the logic to extract ID from the formula
    // Example: Assuming formula is a HYPERLINK function
    var match = formula.match(/=HYPERLINK\("([^"]+)"/);
    if (match) {
        var url = match[1];
        var idMatch = url.match(/\/d\/(.+?)\//);
        return idMatch ? idMatch[1] : null;
    }
    return null; // Return null if no ID could be extracted
}

function transformTag(tag) {
    if (tag.startsWith('@ ')) {
        return 'd_' + tag.substring(2).replace(/\s/g, '$');
    } else if (tag.startsWith('# ')) {
        return 'sD_' + tag.substring(2).replace(/\s/g, '$');
    }
    return tag;
}

function replacePlaceholder(content, placeholder, value) {
    // Check if the value is a Date and format it if so
    if (value instanceof Date) {
        value = value.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } else if (value !== null) { // Ensure value is not undefined before calling toString
        value = value.toString();
    } else {
        value = ""; // Fallback for undefined values to ensure the replacement is clean
    }

    // Perform the replacement
    return content.replace(placeholder, value);
}


function logAction(actionDescription, description) {
    // Access the active spreadsheet and the sheet named "Log"
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var logSheet = spreadsheet.getSheetByName("Log");

    // If the "Log" sheet doesn't exist, create it
    if (!logSheet) {
        logSheet = spreadsheet.insertSheet("Log");
        // Optionally, set headers for the Log sheet
        logSheet.appendRow(["Timestamp", "description", "Action"]);
    }

    // Get the current timestamp
    var timestamp = new Date();

    // Append the log entry
    logSheet.appendRow([timestamp, description, actionDescription]);
}

function formatDateTime(dateTime) {
    dateTime = new Date(dateTime);
    let day = dateTime.toLocaleDateString('en-US', {
        weekday: 'short'
    }).slice(0, 3);
    let month = dateTime.toLocaleDateString('en-US', {
        month: 'short'
    }).slice(0, 3);
    let date = dateTime.getDate().toString().padStart(2, '0');
    let year = dateTime.getFullYear();
    let hours = dateTime.getHours().toString().padStart(2, '0');
    let minutes = dateTime.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${date} ${year} ${hours}:${minutes}`;
}

function formatHourToTime(hour) {
    // Convert hour to integer
    hour = parseInt(hour);

    // Define time ranges
    var timeRanges = [
        "Midnight to 1am", "1am to 2am", "2am to 3am", "3am to 4am", "4am to 5am",
        "5am to 6am", "6am to 7am", "7am to 8am", "8am to 9am", "9am to 10am",
        "10am to 11am", "11am to 12pm", "12pm to 1pm", "1pm to 2pm", "2pm to 3pm",
        "3pm to 4pm", "4pm to 5pm", "5pm to 6pm", "6pm to 7pm", "7pm to 8pm",
        "8pm to 9pm", "9pm to 10pm", "10pm to 11pm", "11pm to midnight"
    ];

    // Map hour to time range
    return timeRanges[hour];
}
