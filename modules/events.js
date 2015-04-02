module.exports = function (env)
{
    var http = env.http.Server(env.app);
    var io = env.io(http);

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

    http.listen(12345, function ()
    {
        console.log('events http server listening on *:12345');
    });

};