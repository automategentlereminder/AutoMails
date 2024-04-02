//Checks condition and if it is possible, returns passing and failing rows in Table format
function testingCondition(contentHTMLCondition) {

    var resultCondition = decodeCondition(contentHTMLCondition);
    var conditionNonBracketed = resultCondition.conditionNonBracketed;
    var startTime = new Date();


    var safeExpression = isSafeExpression(conditionNonBracketed);

    var {
        variables,
        variableNamesBracketed,
        variableNamesNonBracketed,
        variableColumns
    } = defineVariablesFromTagLocations();
    //logAction(variables, "Variables");
    //logAction(variableNamesBracketed, "variableNamesBracketed");
    //logAction(variableNamesNonBracketed, "variableNamesNonBracketed");
    //logAction(variableColumns, "variableColumns");    


    var sheet = getSheetByKey('dynamicSheetID');
    var data = sheet.getDataRange().getValues();

    try {
        var safeEval = new Function(...variableNamesNonBracketed, "return " + safeExpression);

    } catch (e) {
        throw e.toString();
    }

    var passRows = [data[1]]; // include header row
    var failRows = [data[1]]; // include header row
    var passCount = 0;
    var failCount = 0;

    for (var i = 1; i < data.length - 2; i++) {

        var currentTime = new Date();
        if (currentTime - startTime >= 20000 && passCount > 0) break;

        var variableValues = Object.values(variables);
        var result = safeEval.apply(null, variableValues);

        // Format each row data before pushing
        var rowData = data[i + 1].map(cell => {
            // If the cell is a date, format it
            if (cell instanceof Date) {
                return cell.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
            // Otherwise, return the cell as is
            return cell;
        });

        if (result) {
            if (passCount < 5) {
                passRows.push(rowData);
                passCount++;
            }
        } else {
            if (failCount < 5) {
                failRows.push(rowData);
                failCount++;
            }
        }

        increaseCounter(i, variableColumns);

        // Only update the dynamic variables, leave the semi-dynamic variables untouched
        var dynamicVariables = Object.keys(dynamicValues).filter(varName => varName.startsWith('d_'));
        dynamicVariables.forEach((variableName, index) => {
            variables[variableName] = dynamicValues[variableName];
        });

        if (passCount >= 5 && failCount >= 5) break;
    }

    var htmlOutput = createHtmlTable(passRows, failRows);
    return htmlOutput;
}

function createHtmlTable(passRows, failRows) {
    var html = "<html><body>";

    html += "While your condition is syntactically correct, it doesn't necessarily guarantee that it will filter the rows exactly as you anticipate. To provide a clearer illustration, here are few sample rows that will pass your condition, and another few that will fail:"
    html += "<h4>Rows that will pass:</h4>";
    html += arrayToTableHtml(passRows);

    html += "<h4>Rows that will fail:</h4>";
    html += arrayToTableHtml(failRows);

    html += "<br>There could be additional rows in your data that may either pass or fail this condition. Consider this as a preview."
    html += "</body></html>";

    return html;
}

function arrayToTableHtml(array) {
    var html = "<table style='border-collapse: collapse; border: 1px solid black;'>";

    array.forEach(row => {
        html += "<tr>";
        row.forEach(cell => {
            html += "<td style='border: 1px solid black; padding: 5px;'>" + cell + "</td>";
        });
        html += "</tr>";
    });

    html += "</table>";

    return html;
}
