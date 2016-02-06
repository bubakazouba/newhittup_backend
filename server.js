var fs = require('fs');
var express = require('express')
var app = express();
var path = require('path');
var bodyParser = require('body-parser');

var Users = require('./routes/Users');
var FriendHittups = require('./routes/FriendHittups');
var EventHittups = require('./routes/EventHittups');
var FriendAndEventHittups = require('./routes/FriendAndEventHittups');
var server = require('./routes/server');

// Connect to MongoDB
var mongodb = require('./modules/db');
mongodb.connect('mongodb://Hittup:katyCherry1738@ds043981.mongolab.com:43981/hittup', function () {
    console.log('Connected to MongoDB.');
});

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false }));

IMG_DIR_PATH = './images'

if (!fs.existsSync(IMG_DIR_PATH)) {//make sure './images' exists
    fs.mkdirSync(IMG_DIR_PATH);
}

app.use('/images', express.static('images'));
app.use('/Users', Users);
app.use('/FriendHittups', FriendHittups);
app.use('/EventHittups', EventHittups);
app.use('/FriendAndEventHittups', FriendAndEventHittups);
app.use('/server', server);

PORT = 8080;
var server = app.listen(PORT, function () {
  var port = server.address().port;

  console.log('Magic happens at ' + port);
});
