var http = require('http'),
    express = require('express'),
    router = express.Router(),
    mongodb = require('../modules/db'),
    ObjectID = require('mongodb').ObjectID,
    geolocation = require('../modules/geolocation'),
    User = require('../models/Users'),
    Logger = require('../modules/Logger'),
    Facebook = require('../modules/facebook'),
    Helpers = require('../modules/Helpers');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('Hello /Users!!');
});

function getFBFriends(uid, callback) {
    //returns [] if user not found

    if(!mongodb.db) {return callback({"success": false, "error": "DB not connected"});}

    var query = User.findOne({_id: ObjectID(uid)});
    query.populate({
        path: 'fbFriends',
        select: 'firstName lastName fbid loc'
    });

    query.exec(function (err, userFound){
        if(err){
            return callback(err);
        }
        if(userFound){
            callback(null, userFound.fbFriends);
        }
        else {
            callback(null, []);
        }
    });
}

router.post('/GetFriendsList', function (req, res) {
    if(!Helpers.check(["uid"], req))
        return;

    getFBFriends(req.body.uid, function (err, fbFriends) {
        if(err) {
            res.send({"success": false, "error": err.message});
            return Logger.log(err.message,req.connection.remoteAddress, null, "/GetFriendsList");
        }
        res.send(fbFriends);
    });
});

router.post('/AddUser', function (req, res, next) {
    if(!Helpers.check(["name"], req))
        return;

    var body = req.body;

    var user = new User({
        name: body.name,
        loc: {
            type: "Point",
            coordinates: [-10, -10], //mongoose doesnt like empty coordinates cuz it's being indexed
            lastUpdatedTime: Math.floor(Date.now()/1000)//so i just added a point in the middle of the sea
        }                                               //TODO: fix that
    });
    if(req.body.hasOwnProperty("deviceToken")) {
        user.deviceTokens = [req.body.deviceToken];
    }


    user.save(function (err,insertedUser) {
        if(err) {
            res.send({
                "userStatus": "returning",
                "success": false,
                "error": err.message
            });
            return Logger.log(err.message,req.connection.remoteAddress, null, "/AddUser");
        }
        res.send({
            "uid": insertedUser._id,
            "success": "true"
        });
    });//end save user
});

router.post('/UpdateUserLocation', function (req, res, next) {
    if(!Helpers.check(["uid", "coordinates"], req))
        return;

    var body = req.body,
        uid = body.uid,
        loc = {
            type: "Point",
            coordinates: body.coordinates,
            lastUpdatedTime: Math.floor(Date.now()) 
        };

    geolocation.geoReverseLocation(loc.coordinates, function (err, location) {
        loc.city = location.city;
        loc.state = location.state;
        User.findByIdAndUpdate(ObjectID(uid), {loc: loc}, function (err, updatedUser){
            if(err) {
                res.send({"success": false, "error": err.message});
                return Logger.log(err.message,req.connection.remoteAddress, null, "/UpdateUserLocation");
            }
            res.send({"city":location.city,"success": true});
        });
    });
});

module.exports = router;
