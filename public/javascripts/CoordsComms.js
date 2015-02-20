CoordsComms = {

    testComms: function testComms()
    {
        try
        {
            CoordsLog.v("CoordsComms." + CoordsLog.getInlineFunctionTrace(arguments));
            
            var socket = io(':8000');
            socket.on('news', function (data)
            {
                CoordsLog.i(data);
                socket.emit('my other event', {my: 'data'});
            });
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    }

};