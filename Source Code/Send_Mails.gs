function sendMail() {
    var optionsArray = generateTemplateDropdowndata(); // This function generates an array of options
    var template = HtmlService.createTemplateFromFile('Send_Mail_Select');
    template.myOptions = optionsArray; // Inject the array
    var sidebar = template.evaluate();
    sidebar.setTitle('Send Mails');
    SpreadsheetApp.getUi().showSidebar(sidebar);
}

var dailyLimitReached = false; // global object to not send mail once error is thrown
function sendEmails(form) {
    var rowCount = (form.rowCount) + 2; // +2 to adjust array index with actual row count

    var value = form.templateName;
    try {
        var template = HtmlService.createTemplateFromFile('Loading_Animation');
        template.message = 'Sending Mails';
        var html = template.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setWidth(280).setHeight(40);
        SpreadsheetApp.getUi().showModalDialog(html, ' ');
    } catch (error) {}

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AM-Templates');
    var sheetDynamic = getSheetByKey('dynamicSheetID');

    checkDynamicandTemplateSheet(sheet, sheetDynamic, value);

    var values = sheet.getRange(rowCount, 3, 1, 14).getValues()[0]; // Retrieves a 2D array and gets the first row

    // Destructuring the array to assign values to variables
    var [toSelected, ccSelected, bccSelected, quotaActionValue, expirationIntervalValue, sendsMailOptionValue, contentHTMLConditionValue, subjectContentValue, bodyContentValue, unsubscribeChoiceValue, unsubscribeLinkValue, attachmentActionValue, attachmentCount, selectedAttachments] = values;

        if (sendsMailOptionValue === "Never") {
        return;
    }

    toSelected = transformTag(toSelected);
    ccSelected = transformTag(ccSelected);
    bccSelected = transformTag(bccSelected);
    reminderSelected = transformTag("@ Reminder_" + value);
    timestampSelected = transformTag("@ Timestamp_" + value);

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

    var reminderColumn = variableColumns[reminderSelected] || 0; // Defaults to 0 if undefined
    var timestampColumn = variableColumns[timestampSelected] || 0; // Defaults to 0 if undefined
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

    var safeEval = () => true;

    if (sendsMailOptionValue === "Condition") {
        var resultCondition = decodeCondition(contentHTMLConditionValue);
        var conditionNonBracketed = resultCondition.conditionNonBracketed;
        var safeExpression = isSafeExpression(conditionNonBracketed);
        safeEval = new Function(...Object.keys(variables), "return " + safeExpression);
    }

    Logger.log(dataLength - 2);
    // Less or equal to cause last row was not processing :-(
    for (var i = 1; i <= (dataLength - 2); i++) {

        Logger.log(`started loop with i ${i}`);

        var variableValues = Object.values(variables);
        var result = safeEval(...variableValues);

        if (result) {
            Logger.log(`result passed with i ${i}`);

            var toValue = variables[toSelected]?.trim(); // Safe null check and trim

            if (toValue) {
                Logger.log(`To available with i ${i}`);

                var timestampValue = variables[timestampSelected] || "";
                if (checkTimeStamp(timestampValue, expirationIntervalValue)) {

                    // Fetch and replace values for TO, CC, and BCC based on dynamic variable names
                    var toValue = variables[toSelected] || "";
                    var ccValue = variables[ccSelected] || "";
                    var bccValue = variables[bccSelected] || "";
                    var reminderSelected = variables[reminderSelected] || 0;
                    reminderSelected = parseInt(reminderSelected, 10) + 1;

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

                    // Email options with mandatory fields
                    var mailOptions = {
                        htmlBody: customBody,
                        // Optionally add other fields here
                    };
                    // Conditionally add attachments if the array is not empty
                    if (attachmentObjects.length > 0) {
                        // Extract just the blobs from attachmentObjects to use as attachments
                        mailOptions.attachments = attachmentObjects.map(attachment => attachment.blob);
                    }
                    // Add subject, CC, and BCC if present
                    if (customSubject) mailOptions.subject = customSubject;
                    if (ccValue) mailOptions.cc = ccValue;
                    if (bccValue) mailOptions.bcc = bccValue;

                    try {
                        // Send the email
                        if (dailyLimitReached == false) {
                            Logger.log(`Mailing for i ${i}`);
                            MailApp.sendEmail(toValue, customSubject || '', '', mailOptions);
                            setMailstampAndReminder(timestampColumn, reminderColumn, i, sheetDynamic, reminderSelected);
                        } else {
                            if (quotaActionValue == "CreateDrafts") {
                                GmailApp.createDraft(toValue, customSubject || '', '', mailOptions);
                                setDraftstampAndReminder(timestampColumn, reminderColumn, i, sheetDynamic, reminderSelected);
                            } else {
                                break;
                            }
                        }
                    } catch (error) {
                        Logger.log(`error with i ${i}`);
                        // Check for specific error messages and handle them
                        if (error.message.includes("Limit Exceeded: Email Total Attachments Size.") || error.message.includes("the maximum file size.")) {
                            // Handle the attachment size limit exceeded error
                            delete mailOptions.attachments;
                            customBody = handleAttachmentSizeExceeded(attachmentActionValue, customBody, attachmentObjects);
                            mailOptions.htmlBody = customBody;
                            if (dailyLimitReached == false) {
                                MailApp.sendEmail(toValue, customSubject || '', '', mailOptions);
                                setMailstampAndReminder(timestampColumn, reminderColumn, i, sheetDynamic, reminderSelected);
                            } else {
                                if (quotaActionValue == "CreateDrafts") {
                                    GmailApp.createDraft(toValue, customSubject || '', '', mailOptions);
                                    setDraftstampAndReminder(timestampColumn, reminderColumn, i, sheetDynamic, reminderSelected);
                                } else {
                                    break;
                                }
                            }
                        } else if (error.message.includes("Service invoked too many times for one day: email.")) {
                            if (dailyLimitReached == false) {
                                dailyLimitReached = true; // Update the global variable
                            } else {
                                break;
                            }
                        } else {
                            // Log any other errors
                            console.error('Failed to send email: ' + error.toString());
                        }
                    }
                }
            }
        }

        increaseCounter(i, variableColumns);
        Logger.log(`updated variable for i ${i}`);

        // Only update the dynamic variables, leave the semi-dynamic variables untouched
        var dynamicVariables = Object.keys(dynamicValues).filter(varName => varName.startsWith('d_'));
        dynamicVariables.forEach((variableName, index) => {
            variables[variableName] = dynamicValues[variableName];
        });
    
      Utilities.sleep(500);    
    }
    processTemplatesBasedOnStatus(sheet, sheetDynamic); // removes entry of templates that were left incomplete
    closeLoadingDialog();
}
