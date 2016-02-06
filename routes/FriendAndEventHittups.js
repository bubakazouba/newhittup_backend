var express = require('express'),
    router = express.Router(),
    User = require('../models/Users'),
    HittupHelper = require('../modules/HittupHelper'),
    FriendHittupsSchema = require('../models/FriendHittups'),
    EventHittupsSchema = require('../models/EventHittups');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('Hello /FriendAndEventHittups!');
});

router.post('/GetAllHittups', function (req, res) {
    HittupHelper.getAllHittups(FriendHittupsSchema, req, function (friendHittups) {
        HittupHelper.getAllHittups(EventHittupsSchema, req, function (eventHittups) {
            if (friendHittups.hasOwnProperty("success") && friendHittups.success == "false") {
                 return res.send(friendHittups);
            }

            if (eventHittups.hasOwnProperty("success") && eventHittups.success == "false") {
                 return res.send(eventHittups);
            }

            for (var i = friendHittups.length - 1; i >= 0; i--) {
                friendHittups[i].hittupType = "friend";
            }

            for (i = eventHittups.length - 1; i >= 0; i--) {
                eventHittups[i].hittupType = "event";
            }

            res.send({"success": "true", "hittups": eventHittups.concat(friendHittups)});
        });
    });
});


module.exports = router;