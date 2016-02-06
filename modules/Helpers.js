var Logger = require('../modules/Logger');

function check(expectedFields, req) {

    for (var i = expectedFields.length - 1; i >= 0; i--) {
        if(!req.body.hasOwnProperty(expectedFields[i])){
            Logger.log("Required field wasn't present."+expectedFields[i],req.connection.remoteAddress, null,"req.body expectedFields empty");
            return false;
        }
    }

    return true;
}
module.exports = {
    check : check
};