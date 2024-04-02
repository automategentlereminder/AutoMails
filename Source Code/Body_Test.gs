function testingBody(sendsMailOption, contentHTMLBody, contentHTMLSubject, contentHTMLCondition, unsubscribeChoice, unsubscribeLink) {

    var resultSubject = decodeSubject(contentHTMLSubject);
    var subjectBracketed = resultSubject.subjectBracketed;

    var resultBody = decodeBody(contentHTMLBody, unsubscribeChoice, unsubscribeLink);
    var bodyBracketed = resultBody.bodyBracketed;

    var {
        variables,
        variableNamesBracketed,
        variableNamesNonBracketed,
        variableColumns
    } = defineVariablesFromTagLocations();
    var sheet = getSheetByKey('dynamicSheetID');
    var data = sheet.getDataRange().getValues();

    var startTime = new Date();

    var safeEval = () => true; // safeEval is a function that always returns true

    if (sendsMailOption === "Condition") {
        var resultCondition = decodeCondition(contentHTMLCondition);
        var conditionNonBracketed = resultCondition.conditionNonBracketed;
        var safeExpression = isSafeExpression(conditionNonBracketed);
        safeEval = new Function(...variableNamesNonBracketed, "return " + safeExpression);
    }

    var passRows = []; // include header row
    var passCount = 0;

    for (var i = 1; i < data.length - 2; i++) {
        var variableValues = Object.values(variables);
        var result = safeEval.apply(null, variableValues);

        var currentTime = new Date();
        if (currentTime - startTime >= 20000 && passCount > 0) break;

        if (result) {
            if (passCount < 5) {
                var customSubject = subjectBracketed;
                var customBody = bodyBracketed; // Start with the bracketed version of the body

                variableNamesBracketed.forEach((variableName, index) => {
                    customSubject = replacePlaceholder(customSubject, variableName, variableValues[index]);
                    customBody = replacePlaceholder(customBody, variableName, variableValues[index]);
                });

                passRows.push([customSubject, customBody]); // Include custom body along with the subject
                passCount++;
            }
        }

        increaseCounter(i, variableColumns);

        // Only update the dynamic variables, leave the semi-dynamic variables untouched
        var dynamicVariables = Object.keys(dynamicValues).filter(varName => varName.startsWith('d_'));
        dynamicVariables.forEach((variableName, index) => {
            variables[variableName] = dynamicValues[variableName];
        });

        if (passCount >= 5) break;
    }

    var htmlOutput = createHtmlTableBody(passRows);
    Logger.log(htmlOutput);
    return htmlOutput;
}

function createHtmlTableBody(passRows) {
    var html = "<html><body>";
    html += '<hr style="border-top: 0.5px solid #188038;">';
    html += "Your data may have additional rows with corresponding content. Consider this as a preview.";

    for (var i = 0; i < passRows.length; i++) {
        var mailNum = i + 1;
        html += createCollapsibleSection("Mail " + mailNum, passRows[i][0], passRows[i][1]);
    }

    html += "</body></html>";

    return html;
}

function createCollapsibleSection(title, subject, body) {
    var html = `
    <details style="margin: 20px; border: 1px solid #ddd; padding: 15px; box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);">
      <summary style="font-weight: bold; cursor: pointer; color: #333;">${subject}</summary>
      <div style="margin-top: 10px;">
        ${body}
      </div>
    </details>`;

    return html;
}
