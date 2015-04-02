CoordsEvents = {

    isInit: false,

    init: function init()
    {
        try
        {
            Log.v("CoordsEvents." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            CoordsEvents.io = io(':443');
            CoordsEvents.isInit =  true;

            CoordsEvents.io.on("event", function(eventObject) {
                CoordsEvents.handleEvent(eventObject);
            });
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    emitEvent: function emitEvent(type, broadcast, eventObject)
    {
        eventObject['type'] = type;
        eventObject['broadcast'] = broadcast;
        
        CoordsEvents.io.emit("event", eventObject);
    },
    
    handleEvent: function handleEvent(eventObject)
    {
        try
        {
            Log.v("CoordsEvents." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            if( eventObject['type'] == "chatMessage" )
            {
                CoordsRooms.handleChatMessageReceived(eventObject);
            } else if( eventObject['type'] == "userLocation" ) {
                if(CoordsRoomMap.members!=undefined) {
                    if (CoordsRoomMap.members[eventObject.userId] != undefined) {
                        CoordsRoomMap.members[eventObject.userId]["markerInstance"].setLatLng(
                            [eventObject.location.latitude, eventObject.location.longitude]
                        );
                    }
                }
            }

            
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    sendChatMessage: function sendChatMessage(senderObject, recipientObject, messageObject)
    {
        CoordsEvents.emitEvent('chatMessage', true, 
            {
                'sender': senderObject,
                'recipient': recipientObject,
                'message': messageObject
            }
        );
    },

    joinRoom: function joinRoom(room,passphrase){

    },

    createRoom: function joinRoom(room,passphrase){

    }

};