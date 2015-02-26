module.exports = function (env)
{
    env.app.use(env.bodyParser.json());
    env.app.use(env.bodyParser.urlencoded({
        extended: true
    }));

    env.Rooms = {};
    env.Rooms.createRoom = function(name,latitude,longitude,isPrivate,passphrase,success,fail,badRequest){
        if( env.Util.isString(name) &&
            env.Util.isLatitude(latitude) &&
            env.Util.isLongitude(longitude) &&
            env.Util.isBoolean(isPrivate) &&
            (
                env.Util.isString(passphrase) ||
                env.Util.isUndefined(passphrase) ||
                env.Util.isNull(passphrase)
            )
        ) {
            // Create a room object
            var room = {};
            room.name = name;
            room.loc = {lon: longitude, lat: latitude};
            room.private = isPrivate;
            room.passphrase = passphrase;

            // Get the collections of rooms for mongo
            var rooms = env.mongo.collection('rooms');
            rooms.insert([
                room
            ], function (err, result) {
                if (err == null
                ) {
                    success(result);
                    return result;
                } else {
                    fail(err);
                }
            });
        } else {
            badRequest();
        }
    };

    env.Rooms.updateRoom = function(roomId,room,success,fail,badrequest){
        if (env.Util.isHex(roomId)){
            var ObjectId = require('mongodb').ObjectID;
            var roomOId = new ObjectId(roomId);
            var rooms = env.mongo.collection('rooms');
            rooms.update(
                { _id: roomOId },
                room,
                {},
                function(err, result) {
                    if( err == null) {
                        success();
                    } else {
                        fail(err);
                    }
                });
        } else {
            badrequest();
        }
    };

    // Returns the room based on object id
    env.Rooms.getRoomById = function(roomId,success,fail,badRequest){
        if(env.Util.isHex(roomId)) {
            var ObjectId = require('mongodb').ObjectID;
            var roomOId = new ObjectId(roomId);
            var rooms = env.mongo.collection('rooms');
            rooms.findOne({_id: roomOId}, function (err, doc) {
                if (err == null) {
                    success(doc);
                    return doc;
                } else {
                    fail(err);
                }
            });
        } else {
            badRequest();
        }
    };

    // checks if the user has correctly given the passphrase
    env.Rooms.verifyRoomPassphrase = function(roomId,passphrase,success,fail,badRequest){
        if( env.Util.isString(passphrase) ||
            env.Util.isNull(passphrase)
        ) {
            env.Rooms.getRoomById(roomId,function(room) {
                if ("passphrase" in room && !env.Util.isNull(room.passphrase)) {
                    if (passphrase === room.passphrase) {
                        success();
                        return true;
                    } else {
                        fail();
                    }
                } else {
                    success();
                }
            },fail,badRequest);
        } else {
            badRequest();
        }
        return false;
    };

    env.Rooms.userInRoom = function(userId,roomId,success,fail,badRequest){
        var ObjectId = require('mongodb').ObjectID;
        var roomOId = new ObjectId(roomId);
        env.Users.getUserById(userId,function(user){
            if(user.roomsJoined){
                if(user.roomsJoined.indexOf(roomOId)==-1){
                    success(false);
                } else {
                    success(true);
                }
            } else { success(false); }
        },fail,badRequest);
    };

    env.Rooms.addUserToRoom = function(userId,roomId,success,fail,badRequest){
        if(env.Util.isHex(userId)&&env.Util.isHex(roomId)) {
            var ObjectId = require('mongodb').ObjectID;
            var userOId = new ObjectId(userId);
            var roomOId = new ObjectId(roomId);
            env.Rooms.getRoomById(roomId,function(room){
                env.Users.getUserById(userId,function(user){

                    if(env.Util.isArray(user.roomsJoined)){
                        if(env.Util.OIdInArray(roomOId,user.roomsJoined)==-1){
                            user.roomsJoined.push(roomOId);
                        }
                    } else { user.roomsJoined = [roomOId]; }

                    if(env.Util.isArray(room.usersJoined)){
                        if(env.Util.OIdInArray(userOId,room.usersJoined)==-1){
                            room.usersJoined.push(userOId);
                        }
                    } else { room.usersJoined = [userOId]; }

                    env.Users.updateUser(userId,user,function(){
                        console.log(" @room, Updated User "+userId);
                        env.Rooms.updateRoom(roomId,room,function(){
                            console.log(" @room, Updated Room "+roomId);
                            success();
                        },fail,badRequest);
                    },fail,badRequest);
                },fail,badRequest);
            },fail,badRequest);
        } else {
            badRequest();
        }
    };

    env.Rooms.removeUserFromRoom = function(userId,roomId,success,fail,badRequest){
        if(env.Util.isHex(userId)&&env.Util.isHex(roomId)) {
            var ObjectId = require('mongodb').ObjectID;
            var userOId = new ObjectId(userId);
            var roomOId = new ObjectId(roomId);
            env.Rooms.getRoomById(roomId,function(room){
                env.Users.getUserById(userId,function(user){

                    if(user.roomsJoined){
                        var i = env.Util.OIdInArray(roomOId,user.roomsJoined);
                        if(i!==-1)
                            user.roomsJoined.splice(i,1);
                    }

                    if(room.usersJoined){
                        var i = env.Util.OIdInArray(userOId,room.usersJoined);
                        if(i!==-1)
                            room.usersJoined.splice(i,1);
                    }

                    env.Users.updateUser(userId,user,function(){
                        env.Rooms.updateRoom(roomId,room,function(){
                            success();
                        },fail,badRequest);
                    },fail,badRequest);

                },fail,badRequest);
            },fail,badRequest);
        } else {
            badRequest();
        }
    };

    /* Endpoints */

    /**
     * Creates a new room, with a variety of properties
     * @param name string
     * @param private boolean
     * @param passphrase string (optional)
     * @param latitude number , between 90 and -90
     * @param longitude number , between 180 and -180
     * @return a json of either the unique mongo-db id of the room or a false success
     */
    env.app.post('/rooms/create', function(req, res) {
        env.Rooms.createRoom(
            req.body.name,
            req.body.latitude,
            req.body.longitude,
            req.body.private,
            req.body.passphrase,
            function(result){
                res.status(200).json({
                    'response': true,
                    'message': 'room '+room.name+' was created'
                });
                console.log(result);
                console.log("Rooms.js : Inserted 1 room into the rooms collection");
            }, function(err){
                res.status(500);
                console.log(err);
            }, function(){
                res.status(400);
                console.log("Bad request by user");
            }
        );
    });

    /**
     * Returns the properties of the mongo-db connection. This won't
     * be used for anything I think, since all the publically available
     * information will be already available from /rooms/nearby
     * @requires mongodb-id
     * @return a json object of all the properties of the room
     */
    /*env.app.get('/rooms/read', function (req, res)
    {
        *//*var id = req.body.id,
            passphrase = req.body.passphrase;*//*
        // ...
        res.status(200).json({
        });
    });*/

    /**
     * Updates the properties of an existing room.
     * @requires mongodb-id
     * @return a json object, with success defined as true or false
     */
    /*env.app.post('/rooms/update', function(req, res) {
        *//*var name = req.body.name,
            color = req.body.color;*//*
        // ...
        res.status(200).json({

        });
    });*/

    /**
     * Deletes the room from the map and the database, including associated message. This is permanent
     * @requires mongodb-id
     * @return a json object, with success defined as true or false
     */
    /*env.app.post('/rooms/delete', function(req, res) {
       *//* var name = req.body.name,
            color = req.body.color;*//*
        // ...
        res.status(200).json({

        });
    });*/

    /**
     * Looks up nearby rooms
     * @requires latitude, longitude
     * @optional radius
     * @param
     * @return a json list of rooms, with latitude, longitude, private, and name
     */
    env.app.get('/rooms/nearby/:latitude/:longitude/:maxDistance/:limit/:skip', function (req, res)
    {
        var latitude = parseFloat(req.params.latitude);
        var longitude = parseFloat(req.params.longitude);
        var maxDistance = parseFloat(req.params.maxDistance);
        var limit = parseFloat(req.params.limit);
        var skip = parseFloat(req.params.skip);

        if(
            env.Util.isLatitude(latitude) &&
            env.Util.isLongitude(longitude) &&
            env.Util.isNumber(maxDistance) &&
            env.Util.isNumber(limit) &&
            env.Util.isNumber(skip)
        ){
            var query =
                [
                    {
                        $geoNear: {
                            near: {type: "Point", coordinates: [longitude, latitude]},
                            distanceField: "dist.calculated",
                            maxDistance: maxDistance,
                            num: 5,
                            spherical: true
                        }
                    },
                    {$sort: {"dist.calculated": 1}},
                    {$skip: skip},
                    {$limit: limit},
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            dist: 1,
                            private: 1
                        }
                    }
                ];

            var results = [];
            var rooms = env.mongo.collection('rooms');
            rooms.aggregate(query).each(function (err, doc) {
                if (doc === null) {
                    res.status(200).json(results);
                } else {
                    results.push(doc);
                }
            });
        } else {
            res.status(400);
        }
    });

    /**
     * Enters the user into the room. This way, the user won't need to reconnect again any time soon.
     * @requires roomId
     * @optional passphrase
     * @return a json object, with a success response of either true or false
     */
    env.app.post('/rooms/join', function (req, res)
    {
        if( env.Util.isHex(req.body.roomId) &&
            ( env.Util.isString(req.body.passphrase) ||
            env.Util.isUndefined(req.body.passphrase) ||
            env.Util.isNull(req.body.passphrase)
            )
        ) {
            var passphrase = req.body.passphrase;
            var roomId = req.body.roomId;
            var userId = env.Users.getUserIdBySession(req.session);

            env.Rooms.verifyRoomPassphrase(roomId, passphrase, function(){
                console.log(" @room, verified passphrase");
                env.Rooms.addUserToRoom(userId,roomId,function(results){
                    console.log(" @room, Added User "+userId+" to Room "+roomId);
                    res.status(200).json(results);
                },function(err){
                    console.log("error");
                    console.log(err);
                    res.status(500);
                },function(){
                    console.log("bad request");
                    res.status(400);
                });
            }, function(){
                console.log("Wrong passphrase");
                res.status(403);
            });
        } else {
            res.status(400);
        }
    });

    /**
     * Disassociates the user from the room
     * @requires roomId
     * @return a json object, with a success response of either true or false
     */
    env.app.post('/rooms/leave', function (req, res)
    {
        if( env.Util.isHex(req.body.roomId)) {
            var roomId = req.body.roomId;
            var userId = env.Users.getUserIdBySession(req.session);

            env.Rooms.removeUserFromRoom(userId,roomId,function(results){
                console.log(" @room, Removed User "+userId+" from Room "+roomId);
                res.status(200).json(results);
            },function(err){
                console.log("error");
                console.log(err);
                res.status(500);
            },function(){
                console.log("bad request");
                res.status(400);
            });
        } else {
            res.status(400);
        }
    });

};
