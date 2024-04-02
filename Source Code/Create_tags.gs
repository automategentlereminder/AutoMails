function getTags() {
    var sheetDynamic = getSheetByKey('dynamicSheetID');
    var tagTypes1 = sheetDynamic.getRange(1, 1, 1, sheetDynamic.getLastColumn()).getValues()[0]; // types in the first row
    var tagList1 = sheetDynamic.getRange(2, 1, 1, sheetDynamic.getLastColumn()).getValues()[0]; // tags in the second row

    // Filter out tags whose type is "Email ID" or "Attachments" and then map the tags array to an array of objects with id and value properties
    var tags1 = tagList1.map(function(tag, index) {
        return {
            id: Math.floor(index) + 1,
            value: tag,
            type: tagTypes1[index]
        };
    }).filter(function(tag) {
        return tag.type !== "Email ID" && tag.type !== "Attachments";
    });

    // Map the tags1 array to a new array of strings with '@' prepended to the tag value
    var tags1Mapped = tags1.map(function(tag) {
        return '@' + tag.value.toString();
    });

    var sheetDefault = getSheetByKey('defaultSheetID');
    var tagTypes2 = sheetDefault.getRange(1, 1, sheetDefault.getLastRow(), 1).getValues().flat(); // types in the first column
    var tagList2 = sheetDefault.getRange(1, 2, sheetDefault.getLastRow(), 1).getValues().flat(); // tags in the second column

    // Filter out tags whose type is "Email ID" or "Attachments" and then map the tags array to an array of objects with id and value properties
    var tags2 = tagList2.map(function(tag, index) {
        return {
            id: Math.floor(index) + 1,
            value: tag,
            type: tagTypes2[index]
        };
    }).filter(function(tag) {
        return tag.type !== "Email ID" && tag.type !== "Attachments";
    });

    // Map the tags2 array to a new array of strings with '#' prepended to the tag value
    var tags2Mapped = tags2.map(function(tag) {
        return '#' + tag.value.toString();
    });

    return {
        tags1,
        tags2,
        tags1Mapped,
        tags2Mapped
    };
}
