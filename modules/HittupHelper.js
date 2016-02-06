var express = require('express'),
    router = express.Router(),
    mongodb = require('../modules/db'),
    geolocation = require('../modules/geolocation'),
    mongoose = require('mongoose'),
    Logger = require('../modules/Logger'),
    ObjectID = require('mongodb').ObjectID,
    easyimg = require('easyimage'),
    fs = require('fs'),
    FriendHittupsSchema = require('../models/FriendHittups'),
    EventHittupsSchema = require('../models/EventHittups'),
    UsersSchema = require('../models/Users'),
    apn = require('../modules/apn'),
    Helpers = require('../modules/Helpers');

var IMG_DIR_PATH = "./images";

function pushNotifyInvitations(HittupSchema, hittupTitle, friendsuidsReferences, inviterName){
    UsersSchema.find({_id: {$in: friendsuidsReferences}}, function (err, usersFound) {
        if (err) {
            Logger.log(err.message, "", "", "function: pushNotifyInvitations");
            return console.log(err);
        }
        deviceTokens = [];
        for (var i = usersFound.length - 1; i >= 0; i--) {
            for (var j = usersFound[i].deviceTokens.length - 1; j >= 0; j--) {
                deviceTokens.push(usersFound[i].deviceTokens[j]);
            }
        }
        apn.pushNotify(inviterName + " has invited you to \""+hittupTitle+"\"", deviceTokens);
    });
}

function getAvailableHittups(uid,hittups) {
    if(!mongodb.db) {return callback({"success": "false", "error": "DB not connected"});}

    var availableHittups = [];
    for (var i = hittups.length - 1; i >= 0; i--) {//TODO: include that in the query
        if(hittups[i].isPrivate === true && hittups[i].owner._id.toString() != uid) {
            for (var j = hittups[i].usersInvited.length - 1; j >= 0; j--) {
                if(uid == hittups[i].usersInvited[j]._id.toString()) {
                    availableHittups.push(hittups[i]);
                }
            }
        }
        else {
            availableHittups.push(hittups[i]);
        }
    }
    return availableHittups;
}

function unjoin(HittupSchema, req, callback) {
    if(!Helpers.check(["useruid","userName","hittupuid"], req))
        return;

    if(!mongodb.db) {return callback({"success": "false", "error": "DB not connected"});}

    var body = req.body,
        useruid = body.useruid,
        userName = body.userName,
        hittupuid = body.hittupuid;

    HittupSchema.findByIdAndUpdate(ObjectID(hittupuid), 
        {
            $pull: {
                "usersJoined": ObjectID(useruid)
            }
        }, function (err, updatedHittup) {
                if(err){
                    Logger.log(err.message,req.connection.remoteAddress, useruid, "function: unjoin");
                    return callback({"success": false, "error": err.message});
                }
                if (!updatedHittup) {
                    return callback({"success": false, "error": "404" });
                }

                HittupSchema.populate(updatedHittup, {path:"owner", select: 'deviceTokens'}, function(err, populatedHittup) { 
                    apn.pushNotify(userName + " has declined your hittup", populatedHittup.owner.deviceTokens);
                });

                callback({"success": "true"});
            }
        ); //user $pullAll if there is more than one
}

function remove(HittupSchema, req, callback) {
    if(!Helpers.check(["owneruid","ownerName","hittupuid"], req))
        return;

    if(!mongodb.db) {return callback({"success": "false", "error": "DB not connected"});}

    var body = req.body,
        owneruid = body.owneruid,
        ownerName = body.ownerName,
        hittupuid = body.hittupuid;

    var query = HittupSchema.findById(ObjectID(hittupuid));
    query.populate({
        path: 'usersJoined',
        select: 'deviceTokens'
    });
    query.exec(function (err, hittup) {
        if(err){
            Logger.log(err.message,req.connection.remoteAddress, owneruid, "function: remove");
            return callback({"success": false, "error": err.message});
        }

        hittup.remove();
        var deviceTokens = [];
        for (var i = hittup.usersJoined.length - 1; i >= 0; i--) {
            for (var j = hittup.usersJoined[i].deviceTokens.length - 1; j >= 0; j--) {
                deviceTokens.push(hittup.usersJoined[i].deviceTokens[j]);
            }
        }
        apn.pushNotify(ownerName + "'s \"" + hittup.title + "\" was canceled",deviceTokens);

        callback({"success": "true"});
    });
}

function invite(HittupSchema, req, callback) {
    if(!Helpers.check(["inviteruid","hittupuid","hittupTitle","friendsuids","inviterName"], req))
        return;

    if(!mongodb.db) {return callback({"success": "false", "error": "DB not connected"});}

    var body = req.body,
        inviteruid = body.inviteruid,
        hittupuid = body.hittupuid,
        hittupTitle = body.hittupTitle,
        friendsuids = body.friendsuids,
        inviterName = body.inviterName,
        friendsuidsReferences = [];

    for (var i = friendsuids.length - 1; i >= 0; i--) {
        friendsuidsReferences.push(new ObjectID(friendsuids[i]));
    }

    pushNotifyInvitations(HittupSchema, hittupTitle, friendsuidsReferences, inviterName);

    HittupSchema.findByIdAndUpdate(ObjectID(hittupuid), {
        $addToSet: { // prevent having duplicates
            "usersInvited": {
                $each: friendsuidsReferences
            }
        }},
        function(err, updatedHittup){
            if(err){
                Logger.log(err.message,req.connection.remoteAddress, inviteruid, "function: invite");
                return callback({"success": false, "error": err.message});
            }
            if (!updatedHittup) {
                return callback({"success": false, "error": "404" });
            }

            callback({"success": true});
        }
    );
}

function join(HittupSchema, req, callback) {
    if(!Helpers.check(["useruid","userName","hittupuid"], req))
        return;

    if(!mongodb.db) {return callback({"success": "false", "error": "DB not connected"});}

    var body = req.body,
        useruid = body.useruid,
        userName = body.userName,
        hittupuid = body.hittupuid;

    HittupSchema.findByIdAndUpdate(
        ObjectID(hittupuid),
        {
            $addToSet: { //try without quotes
                "usersJoined": {
                    "_id": ObjectID(useruid)
                }
            }
        },
        function (err, updatedHittup) {
            if (err) {
                callback({"success": false, "error": err.message});
                return Logger.log(err.message,req.connection.remoteAddress, null, "function: PostHittup");
            }

            if (!updatedHittup) {
                return callback({"success": false, "error": "404" });
            }

            if(HittupSchema !== EventHittupsSchema) //only do that for friends
                HittupSchema.populate(updatedHittup, {path:"owner", select: 'deviceTokens'}, function(err, populatedHittup) { 
                    apn.pushNotify(userName + " has joined your hittup", populatedHittup.owner.deviceTokens);
                });
            callback({"success": true});
        }
    );//end .update
}

function update(HittupSchema, req, callback) {
    if(!Helpers.check(["uid","title","duration","isPrivate","coordinates"], req))
        return;

    if(!mongodb.db) {return callback({"success": false, "error": "DB not connected"});}

    var body = req.body;
    var uid = body.uid;
    var updateFields = ["title", "duration", "isPrivate"];
    var hittupToUpdate = {};
    for(var prop in body) {
        if(updateFields.indexOf(prop) != -1) { //if we should update it
            hittupToUpdate[prop] = body[prop];
        }
    }

    if(body.hasOwnProperty("coordinates")){ //TODO: refactor that
        hittupToUpdate.loc = {
            type: "Point",
            coordinates: body.coordinates
        };
        geolocation.geoReverseLocation(hittupToUpdate.loc.coordinates, function (err, location) {
            hittupToUpdate.loc.city = location.city;
            hittupToUpdate.loc.state = location.state;
            HittupSchema.findByIdAndUpdate(ObjectID(uid), hittupToUpdate, function (err, updatedHittup) {
                if(err) {
                    callback({"success": false, "error": err.message});
                    return Logger.log(err.message,req.connection.remoteAddress, null, "function: PostHittup");
                }
                callback({"success": true});
            });//end .update
        });

    }
    else {
        HittupSchema.findByIdAndUpdate(ObjectID(uid), hittupToUpdate, function (err, updatedHittup) {
            if(err) {
                callback({"success": false, "error": err.message});
                return Logger.log(err.message,req.connection.remoteAddress, null, "function: PostHittup");
            }
            callback({"success": true});
        });//end .update
    }
}

function getFriendHittup(req, callback) {
    if(!Helpers.check(["uid"], req))
        return;

    if(!mongodb.db) {return callback({"success": false, "error": "DB not connected"});}

    var body = req.body;
    var uid = body.uid;
    var query = FriendHittupsSchema.findById(ObjectID(uid));
    query.$where(Date.now()/1000 + ' <= this.dateStarts + this.duration');
    query.populate({
        path: 'owner usersInvited usersJoined',
        select: 'firstName lastName fbid'
    });
    query.exec(function (err, foundHittup) {
        if (err) {
            callback({"success": false, "error":err.message});
            return Logger.log(err.message,req.connection.remoteAddress, null, "function: get");
        }
        if (!foundHittup) {
            return callback({"success": false, "error": "404" });
        }

        callback(foundHittup);
    });
}

function getEventHittup(req, callback) {
    if(!Helpers.check(["uid"], req))
        return;

    if(!mongodb.db) {return callback({"success": false, "error": "DB not connected"});}

    var body = req.body;
    var uid = body.uid;
    var query = EventHittupsSchema.findById(ObjectID(uid));
    query.$where(Date.now()/1000 + ' <= this.dateStarts + this.duration');
    query.populate({
        path: 'usersInvited usersJoined',
        select: 'firstName lastName fbid'
    });
    query.populate({
        path: 'owner',
        select: 'name imageurl'
    });
    query.exec(function (err, foundHittup) {
        if (err) {
            callback({"success": false, "error": err.message});
            return Logger.log(err.message,req.connection.remoteAddress, null, "function: get");
        }
        if (!foundHittup) {
            return callback({"success": false, "error": "404" });
        }

        callback(foundHittup);
    });
}

function getAllHittups(HittupSchema,req, callback) {
    if(!Helpers.check(["timeInterval", "coordinates", "maxDistance"], req))
        return;

    if(!mongodb.db) {return callback({"success": false, "error": "DB not connected"});}

    var body = req.body,
        startsIn = body.timeInterval[0],
        endsFrom = body.timeInterval[1],

        longitude = body.coordinates[0],
        latitude = body.coordinates[1],

        maxDistance = body.maxDistance;
        
    var query = HittupSchema.find({loc: {
            $nearSphere: {
               $geometry: {
                  type : "Point",
                  coordinates : [ longitude,latitude ]
               },
               $maxDistance: maxDistance //in meters
            }
         }
       });


    query.where('dateStarts').lte(Date.now()/1000 + startsIn);//only show event hittups that are starting in less than <timeInterval> seconds
    query.$where(Date.now()/1000 - endsFrom + ' <= this.dateStarts + this.duration'); // hittups that are still active or ended 30 min ago

    query.populate({
        path: 'usersInvited usersJoined',
        select: 'firstName lastName fbid'
    });

    if(HittupSchema === FriendHittupsSchema){
        query.populate({
            path: 'owner',
            select: 'firstName lastName fbid'
        });
    }
    else {
        query.populate({
            path: 'owner',
            select: 'name imageurl'
        });
    }
    query.lean();
    query.exec(function (err,results) {
       if(err) {
            callback({"success": false, "error": err.message});
            return Logger.log(err.message,req.connection.remoteAddress, null, "function: getAllHittups");
       }
       callback(results);
    });
}


function base64_decode(base64str) {
    var bitmap = new Buffer(base64str, 'base64');
    return bitmap;
}

function getUniqueFileName(time) {
    time = typeof time !== 'undefined' ? time : Date.now();
    return time + '-' + Math.random();
}


function getImageurls(imageData, callback){
    var filedata = base64_decode(imageData);
    var uniqueFileName = getUniqueFileName();
    var HQFileName = uniqueFileName + '.jpg';
    var LQFileName = uniqueFileName + 'LQ.jpg';
    var HQImageFilePath = IMG_DIR_PATH + '/' + HQFileName;
    var LQImageFilePath = IMG_DIR_PATH + '/' + LQFileName;

    var HQImageurl = "http://ec2-52-53-231-44.us-west-1.compute.amazonaws.com/images/" + HQFileName;
    var LQImageurl = "http://ec2-52-53-231-44.us-west-1.compute.amazonaws.com/images/" + LQFileName;
    fs.writeFileSync(HQImageFilePath, filedata);
    easyimg.info(HQImageFilePath).then(
        function(file) {
            easyimg.thumbnail({
                src:HQImageFilePath, dst:LQImageFilePath,
                width: file.width,
                height: file.height,
                quality: 20
            }).then(function(image) {
                callback(HQImageurl, LQImageurl);
            }, function (err) {
                console.log(err);
            });
        }, function (err) {
            console.log(err);
        });
}

function postFriendHittup(req, callback) {
    if(!Helpers.check(["ownerName","uid","title","isPrivate","duration","coordinates","image"], req))
        return;

    if(!mongodb.db) {return callback({"success": "false", "error": "DB not connected"});}

    var body = req.body,
        ownerName = body.ownerName;
    
    getImageurls(body.image, function (HQImageurl, LQImageurl) {
        var hittup = new FriendHittupsSchema({
            owner: ObjectID(body.uid),
            title: body.title,
            isPrivate: body.isPrivate,
            duration: body.duration,
            images : [{
                lowQualityImageurl: LQImageurl,
                highQualityImageurl: HQImageurl
            }],
            dateCreated: Math.floor(Date.now()/1000),
            dateStarts: Math.floor(Date.now()/1000),
            loc: {
                type: "Point",
                coordinates: body.coordinates
            }
        });

        if(body.hasOwnProperty("usersInviteduids")) {
            var usersInvitedReferences = [];
            for (var i = body.usersInviteduids.length - 1; i >= 0; i--) {
                usersInvitedReferences.push(ObjectID(body.usersInviteduids[i]));
            }
            hittup.usersInvited = usersInvitedReferences;
            pushNotifyInvitations(FriendHittupsSchema, body.title, usersInvitedReferences, ownerName);
        }

        geolocation.geoReverseLocation(hittup.loc.coordinates, function (err, location) {
            hittup.loc.city = location.city;
            hittup.loc.state = location.state;
            hittup.save(function (err, insertedHittup) {
                if (err) {
                    callback({"success": false, "error": err.message});
                    return Logger.log(err.message,req.connection.remoteAddress, null, "function: post");
                } 
                callback({"success": true, "uid": insertedHittup.id});
            }); //end hittup.save
        }); //end geoLocation
    }); //end getImageurls
}


function postEventHittup(req, callback) {
    if(!Helpers.check(["uid","title","duration","coordinates","image"], req))
        return;

    if(!mongodb.db) {return callback({"success": "false", "error": "DB not connected"});}
    var body = req.body;
    getImageurls(body.image, function (HQImageurl, LQImageurl) {
        var hittup = new EventHittupsSchema({
            owner: ObjectID(body.uid),
            title: body.title,
            duration: body.duration,
            dateStarts: body.dateStarts,
            description: body.description,
            emoji: body.emoji,
            images : [{
                lowQualityImageurl: LQImageurl,
                highQualityImageurl: HQImageurl
            }],
            dateCreated: Math.floor(Date.now()/1000),
            loc: {
                type: "Point",
                coordinates: body.coordinates
            }
        });

        geolocation.geoReverseLocation(hittup.loc.coordinates, function (err, location) {
            hittup.loc.city = location.city;
            hittup.loc.state = location.state;
            hittup.save(function (err, insertedHittup) {
                if (err) {
                    callback({"success": false, "error": err.message});
                    return Logger.log(err.message,req.connection.remoteAddress, null, "function: post");
                } 
                callback({"success": true, "uid": insertedHittup.id});
            }); //end hittup.save
        }); //end geoLocation
    }); //end getImageurls
}

module.exports = {
    getAllHittups: getAllHittups,
    getFriendHittup: getFriendHittup,
    getEventHittup: getEventHittup,
    postFriendHittup: postFriendHittup,
    postEventHittup: postEventHittup,
    invite: invite,
	update: update,
    remove: remove,
    unjoin: unjoin,
    join: join
};