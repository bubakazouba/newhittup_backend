var http = require('http');
var exports = module.exports = {};

exports.geoReverseLocation = function (loc,callback) {
    /*
     * args:
     * loc:  [longitude, latitude],
     * callback: function that accepts a location object {city,state,coordinates:[long,lat]}
     */
    var reverseGeoPath = '/geocoding/v1/reverse?key=uZ3qgc5oMFTTLZo6MILAjgRJpKQArDtO&callback=renderReverse&location=';
    options = {
        hostname: 'www.mapquestapi.com',
        path: reverseGeoPath+loc[1]+","+loc[0],
        method: 'GET'
    }

    var request = http.request(options,function (reverseGeoResponse) {
        var data='';
        reverseGeoResponse.on('data',function (chunk) {
            data+=chunk
        });//end .on(data)

        reverseGeoResponse.on('error', function (error) {
            callback(error);
        });
        reverseGeoResponse.on('end',function () {
            data=data.substr(data.indexOf('(')+1,data.length-data.indexOf('(')-2); //removing the "renderReverse(...)" around JSON string
            data=JSON.parse(data);
            var responseLocation=data.results[0].locations[0];
            var location={"City":-1,"State":-1};
            //parsing JSON returned, example: http://tinyurl.com/q2mmnsa
            for(var prop in responseLocation) {
                if(Object.keys(location).indexOf(responseLocation[prop])!=-1) {
                    location[responseLocation[prop]]=responseLocation[prop.substr(0,prop.length-4)];
                }
            }
            //confirming with DB scheme
            location.city=location.City;
            location.state=location.State;
            delete location.City;
            delete location.State;
            location.coordinates=[loc[0],loc[1]];
            callback(null, location);
        })
    }); //end http.request
    request.end();
}

module.exports = exports