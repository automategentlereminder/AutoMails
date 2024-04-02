function checkTimeStamp(timestampValue, expirationIntervalValue) {
    if (!/^Mail Sent on |^Created Draft on /.test(timestampValue)) {
        Logger.log(`we did not find any stamp`);
        return true;
    }
    Logger.log(`stamp says ${timestampValue}`);
    let dateString = timestampValue.replace(/^Mail Sent on |^Created Draft on /, "");
    let dateObject = new Date(dateString);
    let currentDate = new Date();

    if (isNaN(dateObject.getTime())) {
        return true;
    }

    if (expirationIntervalValue === "Never") {
        return false;
    } else if (expirationIntervalValue === "Week") {
        return (currentDate - dateObject) > (158 * 3600 * 1000); // More than a week
    } else if (expirationIntervalValue === "Month") {
        // Check for same day of the month, at least a month apart
        let monthApart = new Date(dateObject);
        monthApart.setMonth(monthApart.getMonth() + 1);
        monthApart.setHours(monthApart.getHours() - 10); // Adjust for the 10-hour margin
        return currentDate >= monthApart;
    } else if (expirationIntervalValue === "Year") {
        // Check for same day and month, at least a year apart
        let yearApart = new Date(dateObject);
        yearApart.setFullYear(yearApart.getFullYear() + 1);
        yearApart.setHours(yearApart.getHours() - 10); // Adjust for the 10-hour margin
        return currentDate >= yearApart;
    }

}

function setMailstampAndReminder(timestampColumn, reminderColumn, i, sheetDynamic, reminderSelected) {
    var currentRow = i + 2;
    if (timestampColumn != 0) {

        var currentTime = new Date();

        let day = currentTime.toLocaleDateString('en-US', {
            weekday: 'short'
        }).slice(0, 3); // Abbreviated weekday (Fri)
        let month = currentTime.toLocaleDateString('en-US', {
            month: 'short'
        }).slice(0, 3); // Abbreviated month (Mar)
        let date = currentTime.getDate().toString().padStart(2, '0'); // Day with leading zero (08)
        let year = currentTime.getFullYear();
        let hours = currentTime.getHours().toString().padStart(2, '0'); // Hours with leading zero (18)
        let minutes = currentTime.getMinutes().toString().padStart(2, '0'); // Minutes with leading zero (26)
        let seconds = currentTime.getSeconds().toString().padStart(2, '0'); // Seconds with leading zero (29)

        var timestampString = `Mail Sent on ${day} ${month} ${date} ${year} ${hours}:${minutes}:${seconds}`;
        sheetDynamic.getRange(currentRow, timestampColumn).setValue(timestampString);
    }
    if (reminderColumn != 0) {
        sheetDynamic.getRange(currentRow, reminderColumn).setValue(reminderSelected);
    }
}

function setDraftstampAndReminder(timestampColumn, reminderColumn, i, sheetDynamic, reminderSelected) {
    var currentRow = i + 2;
    if (timestampColumn != 0) {
        var currentTime = new Date();
        let day = currentTime.toLocaleDateString('en-US', {
            weekday: 'short'
        }).slice(0, 3); // Abbreviated weekday (Fri)
        let month = currentTime.toLocaleDateString('en-US', {
            month: 'short'
        }).slice(0, 3); // Abbreviated month (Mar)
        let date = currentTime.getDate().toString().padStart(2, '0'); // Day with leading zero (08)
        let year = currentTime.getFullYear();
        let hours = currentTime.getHours().toString().padStart(2, '0'); // Hours with leading zero (18)
        let minutes = currentTime.getMinutes().toString().padStart(2, '0'); // Minutes with leading zero (26)
        let seconds = currentTime.getSeconds().toString().padStart(2, '0'); // Seconds with leading zero (29)

        var timestampString = `Created Draft on ${day} ${month} ${date} ${year} ${hours}:${minutes}:${seconds}`;
        sheetDynamic.getRange(currentRow, timestampColumn).setValue(timestampString);
    }
    if (reminderColumn != 0) {
        sheetDynamic.getRange(currentRow, reminderColumn).setValue(reminderSelected);
    }
}
