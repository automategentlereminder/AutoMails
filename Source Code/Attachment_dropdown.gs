function generateAttachmentTags() {

    var sheetDynamic = getSheetByKey('dynamicSheetID');
    var sheetDefault = getSheetByKey('defaultSheetID');

    // Similar logic but look for "Attachments" instead of "Email ID"
    var dynamicData = sheetDynamic.getDataRange().getValues();
    var dynamicTypeRow = dynamicData[0];
    var dynamicLabelRow = dynamicData[1];

    var dynamicAttachmentTags = dynamicLabelRow
        .filter(function(label, index) {
            return dynamicTypeRow[index] === "Attachments";
        })
        .map(function(label) {
            return "@ " + label;
        });

    var semiDynamicData = sheetDefault.getDataRange().getValues();
    var semiDynamicTypeColumn = semiDynamicData.map(function(row) {
        return row[0];
    });
    var semiDynamicLabelColumn = semiDynamicData.map(function(row) {
        return row[1];
    });

    var semiDynamicAttachmentTags = semiDynamicLabelColumn
        .filter(function(label, index) {
            return semiDynamicTypeColumn[index] === "Attachments";
        })
        .map(function(label) {
            return "# " + label;
        });

    // Combine both
    var allAttachmentTags = dynamicAttachmentTags.concat(semiDynamicAttachmentTags);

    var attachmentTagsHTML = ["<option selected></option>"].concat(
        allAttachmentTags.map(function(tag) {
            return `<option value="${tag}">${tag}</option>`;
        })
    ).join('');

    return attachmentTagsHTML;;
}
