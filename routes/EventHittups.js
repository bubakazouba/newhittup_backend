var express = require('express');
var router = express.Router();

var EventHittupsSchema = require('../models/EventHittups');
var HittupHelper = require('../modules/HittupHelper');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('Hello /Hittup Events!');
});

router.post('/UnjoinHittup', function (req, res) {
    HittupHelper.unjoin(EventHittupsSchema,req, function (result) {
        res.send(result);
    });
});


router.post('/RemoveHittup', function (req, res) {
    HittupHelper.remove(EventHittupsSchema,req, function (result) {
        res.send(result);
    });
});


router.post('/GetHittup', function (req, res) {
    HittupHelper.getEventHittup(req, function (result) {
        res.send(result);
    });
});

router.post('/GetAllHittups', function (req, res) {
    HittupHelper.getAllHittups(EventHittupsSchema, req, function (result) {
        res.send(result);
    });
});

router.post('/UpdateHittup', function (req, res) {
    HittupHelper.update(EventHittupsSchema, req, function (result) {
        res.send(result);
    });
});

router.post('/JoinHittup', function (req, res) {
    HittupHelper.join(EventHittupsSchema, req, function (result) {
        res.send(result);
    });
});

router.post('/PostHittup', function (req, res, next) {
    HittupHelper.postEventHittup(req, function (result) {
        res.send(result);
    });
}); 

module.exports = router;