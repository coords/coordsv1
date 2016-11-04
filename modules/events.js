module.exports = function (env)
{
    var fs = require('fs');

    var options = {
        key: fs.readFileSync('/etc/letsencrypt/live/v1.coords.uk/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/v1.coords.uk/cert.pem'),
        ca: fs.readFileSync('/etc/letsencrypt/live/v1.coords.uk/chain.pem')
    };

    var https = env.https.Server(options, env.app);
    var io = env.io(https);

    io.on('connection', function (socket)
    {
        socket.on('event', function (eventObject)
        {
            if (eventObject['type'] == "chatMessage")
            {
                eventObject['timestamp'] = Date.now();
                
                env.Messages.handleChatMessageReceived(eventObject,
                    function successCallback(result)
                    {
                        if (eventObject['broadcast'])
                        {
                            io.emit('event', eventObject);
                        }
                    },
                    function errorCallback(error)
                    {
                        if (eventObject['broadcast'])
                        {
                            io.emit('event', {
                                type: "error",
                                message: error
                            });
                        }
                    });
            } else if(eventObject.type == "userLocation"){
                console.log("userlocation found");
                eventObject['timestamp'] = Date.now();
                env.Users.handleUserLocationReceived(eventObject,
                    function successCallback(result)
                    {
                        console.log("userlocation found, success callback");
                        if (eventObject['broadcast'])
                        {
                            io.emit('event', eventObject);
                        }
                    },
                    function errorCallback(error)
                    {
                        if (eventObject['broadcast'])
                        {
                            io.emit('event', {
                                type: "error",
                                message: error
                            });
                        }
                    });
            }
        });
    });

    https.listen(12346, function ()
    {
        console.log('events https server listening on *:12346');
    });

};
