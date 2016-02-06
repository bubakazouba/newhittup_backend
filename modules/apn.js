var apn = require("apn"),
    UsersSchema = require('../models/Users'),
    Logger = require('../modules/Logger');

var apnConnection = new apn.connection({});

 apnConnection.on("connected", function() {
     console.log("APN Connected");
 });

apnConnection.on("transmitted", function(notification, device) {
     // console.log("Notification transmitted to:" + device.token.toString("hex"));
});

apnConnection.on("transmissionError", function(errCode, notification, device) {
    console.error("Notification caused error: " + errCode + " for device ", device, notification);
    if (errCode === 8) {
        console.log("A error code of 8 indicates that the device token is invalid. This could be for a number of reasons - are you using the correct environment? i.e. Production vs. Sandbox");
    }
});

apnConnection.on("timeout", function () {
    console.log("Connection Timeout");
});

apnConnection.on("disconnected", function() {
    console.log("Disconnected from APNS");
});

apnConnection.on("socketError", console.error);

var feedback = new apn.feedback({interval: 10});

feedback.on("feedback", function (feedbackData) {
    feedbackData.forEach(function (feedbackItem) {
        // console.log("Device: " + feedbackItem.device.toString("hex") + " has been unreachable, since: " + feedbackItem.time);
        deviceToken = feedbackItem.device.toString("hex");

        UsersSchema.update({deviceTokens: deviceToken}, {$pull: { 'deviceTokens': deviceToken }}, function (err, updatedUsers) {
            if(err) {
                return Logger.log(err.message,req.connection.remoteAddress, inviteruid, "function: invite");
            }//end function
        });//end update
    });//end forEach
});

feedback.on("feedbackError", console.error);



//function accepts token string or tokens array
var pushNotify = function(text, tokens) {
    if(typeof tokens == 'object' && tokens.length == 0)
        return;

    var note = new apn.notification();
    note.setAlertText(text);
    apnConnection.pushNotification(note, tokens);

    // note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    // note.badge = 1337;
    // note.payload = {"content-available": 1} //to indicate that new content is available for the app to fetch: https://developer.apple.com/library/ios/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Chapters/TheNotificationPayload.html#//apple_ref/doc/uid/TP40008194-CH107-SW1
}

module.exports = {
    pushNotify: pushNotify
}