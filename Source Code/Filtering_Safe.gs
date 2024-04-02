//Checks if condition entered by user is safe or not by allowing very narrow inputs.
function isSafeExpression(input) {

    var allowedChars = /^[A-Za-z0-9\s<>=!&|()_*/+',“”".\$\-%]+$/;

    var disallowedKeywordsRegex = /(while|for|do|switch|case|break|continue|eval|exec|with|default|function|this|self|window|document|alert|prompt|confirm|console|fetch|XMLHttpRequest|setTimeout|setInterval|Function|SharedWorker|MailApp|UrlFetchApp)/g;

    if (!allowedChars.test(input)) {
        var message = "One or more of the characters you used doesn't look safe.\n If you are being assisted by stranger for writing the expression,\n\nDO NOT WRITE.";
        var link = "https://gentlereminder.in/";
        var width = 490;
        var height = 170;
        var title = "Attention!";
        showErrorPopup(message, link, width, height, title);
        return;
    }

    if (disallowedKeywordsRegex.test(input)) {
        var message = "One or more of the word you used doesn't look safe.\n If you are being assisted by stranger for writing the expression,\n\nDO NOT WRITE.";
        var link = "https://gentlereminder.in/";
        var width = 490;
        var height = 170;
        var title = "Error!";
        showErrorPopup(message, link, width, height, title);
        return;
    }

    var safeExpression = input;
    return safeExpression;
}
