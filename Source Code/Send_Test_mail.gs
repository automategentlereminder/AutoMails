function testMail() {
    var optionsArray = generateTemplateDropdowndata(); // This function generates an array of options
    var template = HtmlService.createTemplateFromFile('Test_Mail_Select');
    template.myOptions = optionsArray; // Inject the array
    var sidebar = template.evaluate();
    sidebar.setTitle('Send Test Mail');
    SpreadsheetApp.getUi().showSidebar(sidebar);
}

function submitTestEmailName(form) {


    var rowCount = (form.rowCount) + 2; // +2 to adjust array index with actual row count
    var templateName = form.templateName;
    var testEmail = form.testEmail;
    var template = HtmlService.createTemplateFromFile('Loading_Animation');
    template.message = 'Sending Test Mail';
    var html = template.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setWidth(280).setHeight(40);
    SpreadsheetApp.getUi().showModalDialog(html, ' ');

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AM-Templates');
    var sheetDynamic = getSheetByKey('dynamicSheetID');

    checkDynamicandTemplateSheet(sheet, sheetDynamic, templateName);
    var values = sheet.getRange(rowCount, 3, 1, 14).getValues()[0]; // Retrieves a 2D array and gets the first row

    // Destructuring the array to assign values to variables
    var [toSelected, ccSelected, bccSelected, quotaActionValue, expirationIntervalValue, sendsMailOptionValue, contentHTMLConditionValue, subjectContentValue, bodyContentValue, unsubscribeChoiceValue, unsubscribeLinkValue, attachmentActionValue, attachmentCount, selectedAttachments] = values;

    if (sendsMailOptionValue === "Never") {
        return;
    }

    toSelected = transformTag(toSelected);
    ccSelected = transformTag(ccSelected);
    bccSelected = transformTag(bccSelected);
    reminderSelected = transformTag("@ Reminder_" + templateName);
    timestampSelected = transformTag("@ Timestamp_" + templateName);

    var resultSubject = decodeSubject(subjectContentValue);
    var subjectBracketed = resultSubject.subjectBracketed;
    var resultBody = decodeBody(bodyContentValue, unsubscribeChoiceValue, unsubscribeLinkValue);
    var bodyBracketed = resultBody.bodyBracketed;
    // Attempt to parse the string into an array
    try {
        selectedAttachments = JSON.parse(selectedAttachments);
        if (attachmentCount > 0 && selectedAttachments.length > 0) {
            attachments = selectedAttachments.map(transformTag);
        }
    } catch (e) {
        attachments = []; // Empty
    }

    var {
        variables,
        variableNamesBracketed,
        variableNamesNonBracketed,
        variableColumns
    } = defineVariablesFromTagLocations();
    var toColumn = variableColumns[toSelected] || 0;
    var dataLength = calculateLastRow(sheetDynamic, toColumn); // gets last row of Email ID cell.

    if (dataLength <= 2) {
        var message = "To send test mail, fill some data in sheet.";
        var link = "https://gentlereminder.in/";
        var width = 450;
        var height = 145;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return;
    }

    var mailSent = false;

    var safeEval = () => true;

    if (sendsMailOptionValue === "Condition") {
        var resultCondition = decodeCondition(contentHTMLConditionValue);
        var conditionNonBracketed = resultCondition.conditionNonBracketed;
        var safeExpression = isSafeExpression(conditionNonBracketed);
        safeEval = new Function(...Object.keys(variables), "return " + safeExpression);
    }

    // Less or equal to cause last row was not processing :-(
    for (var i = 1; i <= (dataLength - 2); i++) {

        var variableValues = Object.values(variables);
        var result = safeEval(...variableValues);

        if (result) {

            var toValue = variables[toSelected]?.trim(); // Safe null check and trim

            // Fetch and replace values for TO, CC, and BCC based on dynamic variable names
            var toValue = variables[toSelected] || "";
            var ccValue = variables[ccSelected] || "";
            var bccValue = variables[bccSelected] || "";

            var customSubject = subjectBracketed;
            var customBody = bodyBracketed;
            variableNamesBracketed.forEach((variableName, index) => {
                customSubject = replacePlaceholder(customSubject, variableName, variableValues[index]);
                customBody = replacePlaceholder(customBody, variableName, variableValues[index]);
            });
            var attachmentObjects = [];

            if (attachmentCount > 0 && attachments && attachments.length > 0) {
                attachmentObjects = attachments.map(tag => {
                    const id = variables[tag] || "";
                    if (!id) return null; // Skip trying to fetch a file if the ID is empty
                    try {
                        const blob = DriveApp.getFileById(id).getBlob(); // This keeps the original MIME type
                        return {
                            id,
                            blob
                        }; // Store both ID and blob
                    } catch (e) {
                        return null; // Return null if there's an error retrieving the file
                    }
                }).filter(Boolean); // Filter out any null values resulting from errors
            }

            result = appendDetails(toValue, ccValue, bccValue, customSubject, customBody);

            // Email options with mandatory fields
            var mailOptions = {
                htmlBody: result.customBody,
                // Optionally add other fields here
            };
            // Conditionally add attachments if the array is not empty
            if (attachmentObjects.length > 0) {
                // Extract just the blobs from attachmentObjects to use as attachments
                mailOptions.attachments = attachmentObjects.map(attachment => attachment.blob);
            }

            try {
                MailApp.sendEmail(testEmail, result.customSubject || '', '', mailOptions);
                mailSent = true;

            } catch (error) {
                // Check for specific error messages and handle them
                if (error.message.includes("Limit Exceeded: Email Total Attachments Size.") || error.message.includes("the maximum file size.")) {
                    // Handle the attachment size limit exceeded error
                    delete mailOptions.attachments;
                    customBody = handleAttachmentSizeExceeded(attachmentActionValue, customBody, attachmentObjects);
                    mailOptions.htmlBody = customBody;
                    MailApp.sendEmail(testEmail, result.customSubject || '', '', mailOptions);
                    mailSent = true;
                } else if (error.message.includes("Service invoked too many times for one day: email.")) {
                    var message = "Today's Limit for sending mail is over, try tomorrow.";
                    var link = "https://gentlereminder.in/";
                    var width = 450;
                    var height = 145;
                    var title = "Warning!";
                    showErrorPopup(message, link, width, height, title);
                    return;
                } else {
                    var message = "Something's wrong, try again maybe.";
                    var link = "https://gentlereminder.in/";
                    var width = 450;
                    var height = 145;
                    var title = "Error!";
                    showErrorPopup(message, link, width, height, title);
                    return;
                }
            }


        }
        if (mailSent) {
            var message = "Check the mail box, We have sent the mail!";
            var link = "https://gentlereminder.in/";
            var width = 450;
            var height = 145;
            var title = "Successfull!";
            showErrorPopup(message, link, width, height, title);
            return;
        }


        increaseCounter(i, variableColumns);

        // Only update the dynamic variables, leave the semi-dynamic variables untouched
        var dynamicVariables = Object.keys(dynamicValues).filter(varName => varName.startsWith('d_'));
        dynamicVariables.forEach((variableName, index) => {
            variables[variableName] = dynamicValues[variableName];
        });
    }
    var message = "Condition from template is not true for any row";
    var link = "https://gentlereminder.in/";
    var width = 450;
    var height = 145;
    var title = "Attention!";
    showErrorPopup(message, link, width, height, title);
    return;

}

function appendDetails(toValue, ccValue, bccValue, customSubject, customBody) {
    // Prepare the HTML string for the body
    let bodyHtml = `
          When sent mail with this add on it would go with below settings <br><br>

          TO: ${toValue} <br>
          ${"-".repeat(30)} <br>
          CC: ${ccValue} <br>
          ${"-".repeat(30)} <br>
          BCC: ${bccValue} <br>
          ${"-".repeat(30)} <br>
          Subject: ${customSubject} <br>
          ${"-".repeat(30)} <br>
          Body: <br>
          ${customBody}
          `;

    // Prepare the custom subject
    //let customSubjectResult = decodeSubject(`Test: ${customSubject}`);
    let customSubjectResult = `Test: ${customSubject}`;

    // Return the results
    return {
        customBody: bodyHtml,
        customSubject: customSubjectResult
    };
}
