var mongoose  = require('mongoose');
var Schema  = mongoose.Schema;

var EventOrganizersSchema = new Schema({
    name: String,
    imageurl: String
}, {collection: 'EventOrganizers'});

module.exports = mongoose.model('EventOrganizers', EventOrganizersSchema);