module.exports = function (env)
{
    env.Messages = {};
    env.Messages.handleChatMessageReceived = function (eventObject, success, fail)
    {
        // Create a room object
        var messageObject = {
            'timestamp': eventObject['timestamp'],
            'sender': eventObject['sender'],
            'recipient': eventObject['recipient'],
            'message': eventObject['message']
        };

        // If the message has location data for a user, update the users table
        if(messageObject['sender']['type'] == "user" && messageObject['message']['location'] != false)
        {
            var userId = messageObject['sender']['id'];
            
            env.Users.getUserById(userId, function(user) {
                console.log(" @handleChatMessageReceived, retrieved details of User "+userId);

                user['location'] = messageObject['message']['location'];
                
                env.Users.updateUser(userId, user, function(user) {
                    console.log(" @handleChatMessageReceived, successfully updated location for User "+userId);

                },function(err){
                    console.log("error");
                    console.log(err);
                    res.status(500);
                },function(){
                    console.log("bad request");
                    res.status(400);
                });
                
            },function(err){
                console.log("error");
                console.log(err);
                res.status(500);
            },function(){
                console.log("bad request");
                res.status(400);
            });
        }
        
        // Get the collections of rooms for mongo
        var messages = env.mongo.collection('messages');
        messages.insert([
                messageObject
            ],
            function insertCallback(err, result)
            {
                if (err == null)
                {
                    success(result);
                    return result;
                }
                else
                {
                    fail(err);
                }
            });
    };

    // Returns the room based on object id
    env.Messages.getMessagesForRoom = function (roomId, limit, beforeTimestamp, success, fail, badRequest)
    {
        if (env.Util.isHex(roomId))
        {
            var messages = env.mongo.collection('messages');
            var query = {
                "recipient.type": "room",
                "recipient.id": roomId
            };
            
            if(beforeTimestamp)
            {
                query["timestamp"] = {
                    $lt: beforeTimestamp
                };
            }
            
            messages.find(query,
                {
                    sort: {timestamp: -1}, 
                    limit: limit
                }
            ).toArray(function (err, roomMessages)
            {
                if (err == null)
                {
                    success(roomMessages);
                    return roomMessages;
                }
                else
                {
                    fail(err);
                }
            });
        }
        else
        {
            badRequest();
        }
    };

    /**
     * Gets messages for room by ID
     * @requires roomId
     * @requires limit
     * @requires skip
     * @return a json object, with a success response of either true or false
     */
    env.app.post('/messages/get', function (req, res)
    {
        if (env.Util.isHex(req.body.roomId))
        {
            var roomId = req.body.roomId;
            var limit = req.body.limit;
            var beforeTimestamp = req.body.beforeTimestamp;

            env.Messages.getMessagesForRoom(roomId, limit, beforeTimestamp, function (roomMessages)
            {
                console.log(" @messages/get with limit: " + limit + " and beforeTimestamp: " + beforeTimestamp + " retrieved " + roomMessages.length + " messages for Room " + roomId);
                res.status(200).json(roomMessages);
            }, function (err)
            {
                console.log("error");
                console.log(err);
                res.status(500).json(err);
            }, function ()
            {
                console.log("bad request");
                res.status(400);
            });
        }
        else
        {
            res.status(400);
        }
    });

};