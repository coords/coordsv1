CoordsComms = {

    socket: null,
    isInit: false,
    eventHandlers: {
        "message" : {}
    },

    init: function init(){
        try
        {
            CoordsLog.v("CoordsComms." + CoordsLog.getInlineFunctionTrace(arguments));

            CoordsComms.socket = io(':8000');
            CoordsComms.isInit =  true;

            // Tests if we have contact with the server in the first place.
            CoordsComms.socket.on('news', function (data)
            {
                CoordsLog.i(data);
                CoordsComms.socket.emit('my other event', {my: 'data'});
            });
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    connectRoom: function connectRoom(room)
    {

    },

    sendMessage: function sendMessage(room,message)
    {
        CoordsComms.socket.emit(room,{'message':message});
    },

    on: function on(event,callback)
    {

    },

    joinRoom: function joinRoom(room,passphrase){

    },

    createRoom: function joinRoom(room,passphrase){

    }

};