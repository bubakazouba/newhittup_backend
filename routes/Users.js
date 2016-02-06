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
    if(!Helpers.check(["fbid", "fbToken"], req))
        return;

    var query = User.findOne({ fbid: req.body.fbid });
    query.populate({
        path: 'fbFriends',
        select: 'firstName lastName fbid loc'
    });
    query.exec(function (err, foundUser) {
        if(err) {
            Logger.log(err.message,req.connection.remoteAddress, null, "/GetFriendsList");
            return res.send({"success": false, "error": err.message});
        }
        if(foundUser === null) { //if he was a new user
            Facebook.getFbData(req.body.fbToken, function (err, firstName, lastName, friends) {
                if(err){
                    Logger.log(err.message,req.connection.remoteAddress, null, "/GetFriendsList");
                    return res.send({"success": false, "error": err.message});
                }

                var fbids = [];
                for (var i = friends.length - 1; i >= 0; i--) {
                    fbids.push(friends[i].id);
                }

                //TODO: cleaner way of doing that (loop through an array of properties)
                var user = new User({
                    firstName: firstName,
                    lastName: lastName,
                    fbToken: req.body.fbToken,
                    fbid: req.body.fbid,
                    loc: {
                        type: "Point",
                        coordinates: [-10, -10], //mongoose doesnt like empty coordinates cuz it's being indexed
                        lastUpdatedTime: Math.floor(Date.now()/1000)//so i just added a point in the middle of the sea
                    }                                               //TODO: fix that
                });
                if(req.body.hasOwnProperty("deviceToken")) {
                    user.deviceTokens = [req.body.deviceToken];
                }
                var query = User.find({fbid: { $in: fbids }});

                query.exec(function (err,userFriends) {
                    if(err) {
                        res.send({"success": "false", "error": err.message});
                        return;
                    }
                    user.fbFriends = [];
                    for (var i = userFriends.length - 1; i >= 0; i--) {
                        user.fbFriends.push(userFriends[i]._id);
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
                            "uid": user.id,
                            "userStatus": "new",
                            "fbFriends": user.fbFriends,
                            "success": "true"
                        });
                    });//save user
                });
                
            });//end Facebook.getFbdata
    }//end if user == null
    else {
        var userToUpdate = {
            fbToken: req.body.fbToken
        };

        if(req.body.hasOwnProperty("deviceToken")) {
            userToUpdate.$addToSet = {deviceTokens: req.body.deviceToken};
        }

        User.findByIdAndUpdate(foundUser.id, userToUpdate, function (err, updatedUser) {
            if(err) {
                res.send({"success": false, "error": err.message});
                return Logger.log(err.message,req.connection.remoteAddress, null, "/UpdateUserLocation");
            }
            res.send({
                "success": true,
                "uid": foundUser.id,
                "userStatus": "returning",
                "fb_friends": foundUser.fbFriends
            });
        });
    } // end if user != null (user is not new)
  });
}); // end /AddUser

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
