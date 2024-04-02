function handleAttachmentSizeExceeded(attachmentActionValue, customBody, attachmentObjects) {
    let linksHtml = "<p>The files were too big for the email. Please find the links instead:</p><ul>";

    // Helper function to generate file link
    const generateFileLink = (id) => {
        try {
            const file = DriveApp.getFileById(id);
            let url = file.getUrl();
            let fileName = file.getName();
            return `<li><a href="${url}">${fileName}</a></li>`;
        } catch (e) {
            console.error(`Error processing file with ID ${id}: ${e.toString()}`);
            return ''; // Return empty string in case of error
        }
    };

    // Generate HTML links for each attachment ID
    attachmentObjects.forEach(obj => {
        const {
            id
        } = obj;
        linksHtml += generateFileLink(id);
    });

    linksHtml += "</ul>";

    if (attachmentActionValue === "LinkApproval") {
        // Append linksHtml directly
        customBody += linksHtml;
    } else if (attachmentActionValue === "LinkPublic") {
        // Set all the files to public viewing, and generate links
        attachmentObjects.forEach(obj => {
            const {
                id
            } = obj;
            try {
                const file = DriveApp.getFileById(id);
                // Pseudocode: Actual method to make file public may vary
                file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
            } catch (e) {
                console.error(`Error making file public with ID ${id}: ${e.toString()}`);
            }
        });
        customBody += linksHtml;
    }

    console.log('Attachment size limit exceeded. We sent the links instead. Consider sending fewer attachments.');
    return customBody;
}


// Placeholder for handling the daily email quota exceeded error , not used right now
function handleDailyQuotaExceeded() {
    console.log('Daily email quota exceeded. Try again tomorrow.');
    // Implement your logic here, e.g., log this event or something.
}
