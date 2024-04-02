function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('✉️ AutoMails')
        .addSubMenu(
            SpreadsheetApp.getUi().createMenu('Data Labels')
            .addItem('Dynamic', 'showColumnCreatorPopup')
            .addItem('Semi-dynamic', 'showRowCreatorPopup')
            .addItem('Add Attachments', 'pickFiles')
        )
        .addSubMenu(
            SpreadsheetApp.getUi().createMenu('Template Management')
            .addItem('Create Template', 'createTemplate')
            .addItem('Edit Template', 'editTemplate')
            .addItem('Delete Template', 'deleteTemplate')
        )
        .addSubMenu(
            SpreadsheetApp.getUi().createMenu('Send Mail')
            .addItem('Send Test Mail', 'testMail')
            .addItem('Send Mails', 'sendMail')
        )
        .addSubMenu(
            SpreadsheetApp.getUi().createMenu('Schedule Mails')
            .addItem('Schedule Once', 'scheduleSingleMail')
            .addItem('Schedule Repeat', 'scheduleRepeatMail')
            .addItem('Remove Schedule', 'removeTriggers')
            .addItem('Remove all schedules', 'deleteAllTriggers')
        )
        .addItem('Help', 'helpBox')
        .addToUi();
}

function helpBox() {
    try {
        SpreadsheetApp.getUi().alert(
            'Hi!',
            'Contact us at https://gentlereminder.in/ or just DM us on any social media with a screenshot and the issue you are facing, and we will get back to you soon!',
            SpreadsheetApp.getUi().ButtonSet.OK
        );
    } catch (error) {}
}
