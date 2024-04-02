function testingSubject(sendsMailOption, contentHTMLSubject, contentHTMLCondition) {

    var resultSubject = decodeSubject(contentHTMLSubject);
    var subjectBracketed = resultSubject.subjectBracketed;

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

        var currentTime = new Date();
        if (currentTime - startTime >= 20000 && passCount > 0) break;

        var variableValues = Object.values(variables);
        var result = safeEval.apply(null, variableValues);

        if (result) {
            if (passCount < 5) {
                var customSubject = subjectBracketed;

                variableNamesBracketed.forEach((variableName, index) => {
                    customSubject = replacePlaceholder(customSubject, variableName, variableValues[index]);
                });

                passRows.push([customSubject]);
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

    var htmlOutput = createHtmlTableSubject(passRows);
    return htmlOutput;
}



function createHtmlTableSubject(passRows) {
    var html = "<html><body>";

    html += "Your data may have additional rows with corresponding content. Consider this as a preview.";
    html += "<h4>Subject of first few mails:</h4>";
    html += arrayToTableHtmlSubject(passRows);

    html += "</body></html>";

    return html;
}

function arrayToTableHtmlSubject(array) {
    var html = "<table style='border-collapse: collapse; border: 1px solid black;'>";

    array.forEach(row => {
        if (Array.isArray(row)) {
            html += "<tr>";
            row.forEach(cell => {
                html += "<td style='border: 1px solid black; padding: 5px;'>" + cell + "</td>";
            });
            html += "</tr>";
        } else {
            // here we are assuming that row is a single cell
            html += "<tr><td style='border: 1px solid black; padding: 5px;'>" + row + "</td></tr>";
        }
    });

    html += "</table>";

    return html;

}
