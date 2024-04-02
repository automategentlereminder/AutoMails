// Function to fetch data, filter labels, and populate dropdowns
function generateEmailDropdowndata() {

    // Fetch the data from the "Dynamic Label" and "default label" sheets

    var sheetDynamic = getSheetByKey('dynamicSheetID');
    // Fetch the labels for "Email ID" type from the "Dynamic Label" sheet
    var dynamicData = sheetDynamic.getDataRange().getValues();
    var dynamicTypeRow = dynamicData[0];
    var dynamicLabelRow = dynamicData[1];

    var dynamicLabels = dynamicLabelRow
        .filter(function(label, index) {
            return dynamicTypeRow[index] === "Email ID";
        })
        .map(function(label) {
            return "@ " + label;
        });

    var sheetDefault = getSheetByKey('defaultSheetID');
    // Fetch the labels for "Email ID" type from the "default label" sheet
    var defaultData = sheetDefault.getDataRange().getValues();
    var defaultTypeColumn = defaultData.map(function(row) {
        return row[0];
    });
    var defaultLabelColumn = defaultData.map(function(row) {
        return row[1];
    });

    var defaultLabels = defaultLabelColumn
        .filter(function(label, index) {
            return defaultTypeColumn[index] === "Email ID";
        })
        .map(function(label) {
            return "# " + label;
        });

    // Combine the dynamic and default labels into a single array
    var allLabels = dynamicLabels.concat(defaultLabels);

    // Create data objects for dropdowns
    var toDropdownData = dynamicLabels.map(function(label) {
        return {
            value: label,
            label: label
        };
    });

    var ccDropdownData = allLabels.map(function(label) {
        return {
            value: label,
            label: label
        };
    });

    var bccDropdownData = allLabels.map(function(label) {
        return {
            value: label,
            label: label
        };
    });

    // Add a blank option at the beginning of the ccDropdownData and bccDropdownData arrays
    ccDropdownData.unshift({
        value: "None",
        label: ""
    });
    bccDropdownData.unshift({
        value: "None",
        label: ""
    });

    return {
        toDropdownData: toDropdownData,
        ccDropdownData: ccDropdownData,
        bccDropdownData: bccDropdownData
    };
}
