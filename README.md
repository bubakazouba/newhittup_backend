# Hittup-Backend

# Production
```
npm install
forever start server.js
```
to stop server: `forever stop server.js`

# Development

default port is 8080

```
npm install
npm start
```

# Routes

#server routes:

## server/GetMinVersion

### POST format:
```
{}
```

### Response format:
```
{
	"minVersionRequired": "x.x"
}
```



#Hittup routes:
an error message of 404 for `/JoinHittup`, `/UnjoinHittup`, `/RemoveHittup` means the hittup doesn't exist.

## FriendAndEventHittups/GetAllHittups
timeInterval's first element is time before hittup starts, second element is time after hittup ends.

### POST format:
```
{ 
    "timeInterval": [<seconds>,<seconds>],
    "maxDistance": <Number> , //in meters
    "coordinates": [<long>, <lat>],
}
```

### Response format:
```
{"success":true, "hittups":[
  {
    "_id": "<uid>",
    "title": "<title>",
    "isPrivate": <boolean>,
    "duration": <seconds>,
    "dateCreated": <seconds>,
    "images": [ {
		"lowQualityImageurl": "<full url>",
		"highQualityImageurl": "<full url>"
    },...],
    "usersJoined": [
       "_id": "<uid>",
       "fbid": "<fbid>",
       "firstName": "<firstName>",
        "lastName": "<lastName>",
        },
        ...
    ],
    "usersInvited": [ {
       "_id": "<uid>",
       "fbid": "<fbid>",
        "firstName": "<firstName>",
        "lastName": "<lastName>",
        },
        ...
    ],
    "loc": {
      "state": "<state>",
      "city": "<city>",
      "type": "Point",
      "coordinates": [<long>, <lat>],
      "lastUpdatedTime": <Int>
    }
  }
  , ...
]
}
```

## (Friend/Event)Hittups/UnjoinHittup
### POST format:
```
{
	"hittupuid": "<uid>",
	"useruid": "<uid>",
	"userName": "<string>"
}
```
### Response format:
```
{"success":true}
```
or

```
{"success":false, "error":"<error message>"}
```

## (Friend/Event)Hittups/RemoveHittup
### POST format:
```
{
	"hittupuid": "<uid>",
	"owneruid": "<uid>",
	"ownerName": "<string>"
}
```
### Response format:
```
{"success":true}
```
or

```
{"success":false, "error":"<error message>"}
```


## FriendHittups/GetHittup
### POST format:
the first image is the image posted by the host

```
{
	"uid": "<uid>"
}
```
### Response format:
```
{"success":true, "hittup": {
    "_id": "<uid>",
    "owner": {
    	"firstName": "<firstname>",
    	"lastName: "<lastName>",
    	"fbid": "<fbid>"
    },
    "title": "<title>",
    "isPrivate": <boolean>,
    "duration": <seconds>,
    "dateCreated": <seconds>,
    "images": [ {
		"lowQualityImageurl": "<full url>",
		"highQualityImageurl": "<full url>"
    },...],
    "usersJoined": [ {
       "_id": "<uid>",
       "fbid": "<fbid>",
       "firstName": "<firstName>",
        "lastName": "<lastName>",
        },
        ...
    ],
    "usersInvited": [ {
       "_id": "<uid>",
       "fbid": "<fbid>",
        "firstName": "<firstName>",
        "lastName": "<lastName>",
        },
        ...
    ],
    "loc": {
      "state": "<state>",
      "city": "<city>",
      "type": "Point",
      "coordinates": [<long>, <lat>],
      "lastUpdatedTime": <Int>
    }
  }
}
```


## EventHittups/GetHittup
the first image is the image posted by the host
### POST format:
```
{

}
```
### Response format:
```
{"success":true, "hittup": {
    "_id": "<uid>",
    "owner": {
    	"name": "<name>",
    	"imageurl": "<url>"
    },
    "title": "<title>",
    "isPrivate": <boolean>,
    "duration": <seconds>,
    "dateStarts": <seconds>,
    "description": "<description >",
    "dateCreated": <seconds>,
    "images": [ {
		"lowQualityImageurl": "<full url>",
		"highQualityImageurl": "<full url>"
    },...],
    "usersJoined": [ {
       "_id": "<uid>",
       "fbid": "<fbid>",
       "firstName": "<firstName>",
        "lastName": "<lastName>",
        },
        ...
    ],
    "usersInvited": [ {
       "_id": "<uid>",
       "fbid": "<fbid>",
        "firstName": "<firstName>",
        "lastName": "<lastName>",
        },
        ...
    ],
    "loc": {
      "state": "<state>",
      "city": "<city>",
      "type": "Point",
      "coordinates": [<long>, <lat>],
      "lastUpdatedTime": <Int>
    }
  }
}
```


## FriendHittups/GetAllHittups
timeInterval's first element is time before hittup starts, second element is time after hittup ends.
### POST format:

```
{ 
    "timeInterval": [<seconds>,<seconds>],
    "maxDistance": <Number> , //in meters
    "coordinates": [<long>, <lat>],
}
```

### Response format:
```
[ FriendHittups ] //just like the one in GetHittup
```

## EventHittups/GetAllHittups
timeInterval's first element is time before hittup starts, second element is time after hittup ends.
### POST format:

```
{ 
    "timeInterval": [<seconds>,<seconds>],
    "maxDistance": <Number> , //in meters
    "coordinates": [<long>, <lat>],
}
```

### Response format:
```
[ EventHittups ] //just like the one in GetHittup
```

## (Friend/Event)Hittups/JoinHittup
### POST format:

```
{
	"hittupuid": "<uid>",
	"useruid": "<uid>",
	"userName": "<string>"
}
```
### Response format:
```
{"success":true}
```
or

```
{"success":false, "error":"<error message>"}
```

## (Friend/Event)Hittups/GetInvitations
POST format:

```
{"success":false, "error":"<error message>"}
```


## Hittups/GetInvitations
### POST format:

```
{
    "uid": "<uid>"
}
```
### Response format:
```
{
    "owner": {
        firstName: "<firstName>",
        lastName: "<lastName>"
    },
    "title": "<title>",
    "isPrivate": <boolean>,
    "duration": "<duration>",
    "dateCreated": "<dateCreated>",
    "usersJoined": [
       {
            "_id": "<uid>",
            "fbid": "<fbid>",
            firstName: "<firstName>",
            lastName: "<lastName>"
        }
        ],
    "usersInvited": [
        {
            "_id": "<uid>",
            "fbid": "<fbid>",
            firstName: "<firstName>",
            lastName: "<lastName>"
        }
    ],
    "loc": {
        "state": "<state>",
        "city": "<city>",
        "type": "<Point>",
        "coordinates":[<long>,<lat>],
        "lastUpdatedTime": <int>
    }
}
```

## FriendHittups/PostHittup
### POST format:

```
{
    "coordinates": [longitude, latitude],
    "duration": <seconds>,
    "title": "<title>",
    "image": "<base64encodedimage>"
    "isPrivate": <boolean>,
    "uid": "<useruid>",
    "ownerName": "<string>",
    "usersInviteduids": ["<uid>","<uid>",...],
    "image": "<base64encodedstring>",
    "emoji": <String>
}
```
format of the image doesn't matter

### Response format:
```
{"success":true, "uid": "<uid>"}
```
or

```
{"success":false, "error":"<error message>"}
```

## EventHittups/PostHittup
### POST format:

```
{
    "coordinates": [<long>, <lat>],
    "duration": <seconds>,
    "title": "<title>",
    "description": "<title>",
    "image": "<base64encodedimage>"
    "isPrivate": <boolean>,
    "uid": "<EventOrganizeruid>",
    "dateStarts": <seconds>,
    "image": "<base64encodedstring>",
    "emoji": <String>
}
```
format of the image doesn't matter

### Response format:
```
{"success":true, "uid": "<uid>"}
```
or

```
{"success":false, "error":"<error message>"}
```


## (Friend/Event)Hittups/UpdateHittup
### POST format:
```
{
    "hittupuid": "<uid>",
    "owneruid": "<uid>",
    "title": "<title>",
    "coordinates": [<long>,<lan>],
    "isPrivate": <boolean>,
    "duration": <seconds>
}
```
### Response format:
```
{"success":true, "uid": "<uid>"}
```
or

```
{"success":false, "error":"<error message>"}
```

## (Friend/Event)Hittups/InviteFriends
### POST format:
```
{
    "inviteruid": "<uid>",
    "hittupuid": "<uid>",
    "inviterName": "<uid>",
    "hittupTitle": "<string>",
    "friendsuids": ["<uid>","<uid>"]
}
```
### Response format:
```
{"success":true}
```
or

```
{"success":false, "error":"<error message>"}
```



## Users/UpdateUserLocation
### POST format:

```
{
    "coordinates": [<long>, <lat>],
    "uid": "<uid>"
}
```

### Response format:

```
{"city":location.city,"success":true}
```

## Users/GetFriendsList
### POST format:

```
{
    "uid": "<uid>"
}
```

### Response format:

```
{"fb_friends":
[ 
    {
        "firstName":"<firstname>",
        "lastName": "<lastname>",
        "_id": "<uid>",
        "fbid": fbid,
        "loc":{
            "type":"Point",
            "state":"<state>",
            "city":"<city>",
            "coordinates":[<long>,<lat>],
            "lastUpdatedTime": <int>
        }
    },
        ...
]
}

```


## Users/AddUser
### POST format:
deviceToken is optional

```
{
    "fbid": "<fbid>",
    "fbToken": "<fbToken>",
    "deviceToken": "<deviceToken"
}
```

### Response format:

if user doesn't exist:

```
{
    "userStatus": "new",
    "uid": "<uid>",
    "fb_friends": [ ... ] (same as below)
}
```

if user already exists:

```
{
    "userStatus": "returning",
    "uid": "<uid>",
    "fb_friends":
    [ 
        {
            "firstName":"<firstname>",
            "lastName": "<lastname>",
            "_id": "<uid>",
            "fbid": fbid,
            "loc":{
                "type":"Point",
                "state":"<state>",
                "city":"<city>",
                "coordinates":[<long>,<lat>],
                "lastUpdatedTime": <int>
            }
        },
     ...
    ]
}
```

# PUSH NOTIFICATIONS

*HOW TO PUSH NOTIFY*

download the certificate from http://developer.apple.com/iphone/manage/overview/index.action

open it using keychain access, export it to apns-cert.p12, then expand it and export the key to apns-key.p12

to convert them to .pem:

`openssl pkcs12 -clcerts -nokeys -out apns-cert.pem -in apns-cert.p12`
`openssl pkcs12 -nocerts -out apns-key.pem -in apns-key.p12` #<<<<<for that one make sure u set a password

now we need to remove the password:
`openssl rsa -in apns-key.pem -out apns-key-noenc.pem`

now `mv apns-key-noenc.pem key.pem`
and `mv apns-dev-cert.pem cert.pem`

and make sure you remove anything before and after `---BEGIN CERTIFICATE---` and `---END CERTIFICATE-----`

run with: `NODE_ENV=production node <scriptName>.js`