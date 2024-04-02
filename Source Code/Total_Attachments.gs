function totalAttachments() {
    var sheetDynamic = getSheetByKey('dynamicSheetID');
    var firstRow = sheetDynamic.getRange(1, 1, 1, sheetDynamic.getLastColumn()).getValues()[0];
    var dynamicAttach = 0;
    for (var i = 0; i < firstRow.length; i++) {
        if (String(firstRow[i]).includes("Attachments")) {
            dynamicAttach++;
        }
    }

try{
    var sheetDefault = getSheetByKey('defaultSheetID');
    var firstColumn = sheetDefault.getRange(1, 1, sheetDefault.getLastRow(), 1).getValues();
    var defaultAttach = 0;
    for (var i = 0; i < firstColumn.length; i++) {
        if (String(firstColumn[i][0]).includes("Attachments")) {
            defaultAttach++;
        }
      }
    } catch(error){}
    return {
        dynamicAttach: dynamicAttach,
        defaultAttach: defaultAttach
    };
}
