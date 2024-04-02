var dynamicValues = {}; // Global object to store dynamic variable values
var variables = {}; // Global object to store variable values for subject substitution

function defineVariablesFromTagLocations() {
    var sheetDynamic = getSheetByKey('dynamicSheetID');
    var tagList1 = sheetDynamic.getRange(2, 1, 1, sheetDynamic.getLastColumn()).getValues()[0];

    var tags1 = tagList1.map(function(tagList1, index) {
        return {
            id: Math.floor(index) + 1,
            value: tagList1
        };
    });

    var sheetDefault = getSheetByKey('defaultSheetID');
    var tagList2 = sheetDefault.getRange(1, 2, sheetDefault.getLastRow(), 1).getValues().flat();

    var tags2 = tagList2.map(function(tagList2, index) {
        return {
            id: Math.floor(index) + 1,
            value: tagList2
        };
    });

    // Define necessary variables
    var variableNamesBracketed = []; // For string replacements
    var variableNamesNonBracketed = []; // For use with new Function()
    var variableColumns = {}; // Object to store column numbers

    // Define semi-dynamic variables with their corresponding values
    tags2.forEach(function(tag) {
        // This part makes up variable names
        var variableName = "sD_" + tag.value.replace(/\s/g, "$");

        // Fetch the type from the first column
        var variableType = sheetDefault.getRange(tag.id, 1).getValue();

        var variableValue;
        if (variableType === "Attachments") {
            // Fetch the formula from the third column if the type is Attachments
            var formula = sheetDefault.getRange(tag.id, 3).getFormula();
            // Extract the ID from the formula
            variableValue = extractIdFromFormula(formula);
            /*
            if we need to use date in future
            else if (variableType === "Date") {
            // Fetch the date value and format it
            var variableValue = sheetDefault.getRange(tag.id, 3).getDisplayValue();
            //variableValue = dateValue.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); */
        } else {
            // For other types, fetch the value directly
            variableValue = sheetDefault.getRange(tag.id, 3).getValue();
        }
        variables[variableName] = variableValue;
        variableNamesNonBracketed.push(variableName);
        variableNamesBracketed.push("${" + variableName + "}");
    });

    tags1.forEach(function(tag) {
        // Below we are setting names of the variable for each tag
        var variableName = "d_" + tag.value.replace(/\s/g, "$");

        // Fetch the type from the first row for the corresponding column
        var variableType = sheetDynamic.getRange(1, tag.id).getValue();

        var variableValue;
        if (variableType === "Attachments") {
            // If it's an Attachments, fetch the formula and extract the ID
            var formula = sheetDynamic.getRange(3, tag.id).getFormula();
            variableValue = extractIdFromFormula(formula);
        } else {
            // For other types, fetch the value directly
            variableValue = sheetDynamic.getRange(3, tag.id).getValue();
        }

        // Store the processed value in dynamicValues
        dynamicValues[variableName] = variableValue;
        variables[variableName] = dynamicValues[variableName];


        variableNamesNonBracketed.push(variableName);
        variableNamesBracketed.push("${" + variableName + "}");
        variableColumns[variableName] = tag.id; // Store column number
    });

    return {
        variables,
        variableNamesBracketed,
        variableNamesNonBracketed,
        variableColumns
    };
}

function increaseCounter(row, variableColumns) {
    // Update the dynamic variable values based on the next row
    var sheetDynamic = getSheetByKey('dynamicSheetID');
    var dynamicVariables = Object.keys(dynamicValues).filter(varName => varName.startsWith('d_')); // Filter only dynamic variables

    dynamicVariables.forEach(function(variable) {
        var column = variableColumns[variable]; // Get column number from variableColumns
        var type = sheetDynamic.getRange(1, column).getValue(); // Fetch the type from the first row

        var cellRange = sheetDynamic.getRange(row + 3, column); // Adjusted to row + 2, assuming row is 1-indexed and header is in the first row
        var value;
        if (type === "Attachments") {
            // If it's an Attachments, fetch the formula and extract the ID
            var formula = cellRange.getFormula();
            value = extractIdFromFormula(formula);
        } else {
            // For other types, fetch the value directly
            value = cellRange.getValue();
        }
        // Update dynamicValues and variables with the processed value
        dynamicValues[variable] = value;
        variables[variable] = value;
    });
}
