function decodeBody(contentHTMLBody, unsubscribeChoice, unsubscribeLink) {
    // Replace &nbsp; with spaces
    //contentHTMLBody = contentHTMLBody.replace(/&nbsp;/g, ' ');

    // Regular expression to match the mention format
    var mentionRegex = /<span class="mention" data-mention="([@|#][^"]+)">([^<]+)<\/span>/g;

    // Function to replace the mentions with the bracketed version
    function replaceMention(match, mention, innerText) {
        var dataValue = mention.substr(1); // Removing the leading "@" or "#"

        // Modifying dataValue based on the first character
        if (mention.charAt(0) === '#') {
            dataValue = "sD_" + dataValue.replace(/\s/g, "$");
        } else if (mention.charAt(0) === '@') {
            dataValue = "d_" + dataValue.replace(/\s/g, "$");
        }

        return "${" + dataValue + "}"; // Adding brackets for the bracketed version
    }

    // Replacing the mentions using the regular expression and replace function
    var bodyBracketed = contentHTMLBody.replace(mentionRegex, replaceMention);

    // HTML to append based on the unsubscribeChoice
    var appendHTML = "";
    if (unsubscribeChoice === "Yes") {
        appendHTML = `<p style="font-size:12px; color:gray;">
      <span>Don't want to receive these emails? <a href="${unsubscribeLink}" target="_blank" style="color:gray; text-decoration:underline;">Unsubscribe here</a></span>
      <span style="font-size:16px">&nbsp; | &nbsp;</span>
      <span>Sent using <a href="http://www.gentlereminder.in" target="_blank" style="color:gray; text-decoration:underline;">⚡ AutoMails</a></span>
    </p>`;
    } else {
        appendHTML = `<p style="font-size:12px; color:gray;">
      <span>Sent using <a href="http://www.gentlereminder.in" target="_blank" style="color:gray; text-decoration:underline;">⚡ AutoMails</a></span>
    </p>`;
    }

    // Append the HTML code to the body
    bodyBracketed += appendHTML;

    return {
        bodyBracketed
    };
}
