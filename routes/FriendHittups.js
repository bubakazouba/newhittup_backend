var express = require('express');
var router = express.Router();

var FriendHittupsSchema = require('../models/FriendHittups');
var HittupHelper = require('../modules/HittupHelper');
var EventOrganizers = require('../models/EventOrganizers');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('Hello /Hittups!');
});

router.post('/UnjoinHittup', function (req, res) {
    HittupHelper.unjoin(FriendHittupsSchema,req, function (result) {
        res.send(result);
    });
});

router.post('/RemoveHittup', function (req, res) {
    HittupHelper.remove(FriendHittupsSchema,req, function (result) {
        res.send(result);
    });
});
router.post('/GetHittup', function (req, res) {
    HittupHelper.getFriendHittup(req, function (result) {
        res.send(result);
    });
});

router.post('/GetAllHittups', function (req, res) {
    HittupHelper.gGetAllHittups(FriendHittupsSchema, req, function (result) {
        res.send(result);
    });
});

router.post('/UpdateHittup', function (req, res) {
    HittupHelper.update(FriendHittupsSchema, req, function (result) {
        res.send(result);
    });
});

router.post('/JoinHittup', function (req, res) {
    HittupHelper.join(FriendHittupsSchema, req, function (result) {
        res.send(result);
    });
});

router.post('/PostHittup', function (req, res, next) {
    HittupHelper.postFriendHittup(req, function (result) {
        res.send(result);
    });
}); 

module.exports = router;