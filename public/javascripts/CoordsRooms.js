CoordsRooms = {

    currentRoom: false,

    displayNearbyRooms: function displayNearbyRooms(rooms)
    {
        try
        {
            Log.v("CoordsRooms." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            CoordsUI.nearbyRoomsList.html("");
            if (rooms.length == 0)
            {
                CoordsUI.nearbyRoomsList.html("<p>No rooms nearby</p>");
            }
            $.each(rooms, function coordsRoomsDisplayNearbyRoomsIterator(index, room)
            {
                var template = '<div class="rooms-room load-room-' + room['_id'] + '">' +
                    '<div class="rooms-room-name">' + room.name + '</div>' +
                    '<div class="rooms-room-distance">' + (room.dist.calculated / 1000).toFixed(1) + ' km</div>' +
                    '</div>';
                CoordsUI.nearbyRoomsList.append(template);
                $('.load-room-' + room['_id']).off('click').click(function coordsRoomsLoadRoomClick()
                {
                    CoordsRooms.enterRoom(room);
                });

            });
        }

        catch (e)
        {
            Log.exception(e);
        }
    },

    displayJoinedRooms: function displayJoinedRooms(rooms)
    {
        try
        {
            Log.v("CoordsRooms." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            CoordsUI.joinedRoomsList.html("");
            if (rooms.length == 0)
            {
                CoordsUI.joinedRoomsList.html("<p>No rooms joined</p>");
            }
            $.each(rooms, function coordsRoomsDisplayJoinedRoomsIterator(index, room)
            {
                var template = '<div class="rooms-room load-room-' + room._id + '">' +
                    '<div class="rooms-room-name">' + room.name + '</div>' +
                    '</div>';
                CoordsUI.joinedRoomsList.append(template);
                $('.load-room-' + room._id).off('click').click(function coordsRoomsDisplayJoinedRoomsLoadRoomClick()
                {
                    CoordsRooms.enterRoom(room);
                });

            });
        }

        catch (e)
        {
            Log.exception(e);
        }
    },

    enterRoom: function enterRoom(room)
    {
        Log.v("CoordsRooms." + Log.getInlineFunctionTrace(arguments, arguments.callee));

        CoordsUI.showLoadingBar();

        CoordsDB.setString("currentRoomId", room['_id']);
        CoordsPages.changePage("roomPage");
    },

    loadChatMessages: function loadChatMessages(messagesCallback, limit, beforeTimestamp)
    {
        $.ajax({
            type: "POST",
            url: "messages/get",
            data: JSON.stringify({
                'roomId': CoordsRooms.currentRoom['_id'],
                'limit': limit,
                'beforeTimestamp': beforeTimestamp
            }),
            contentType: "application/json",
            dataType: "json",
            success: function coordsRoomsLoadChatMessagesSuccess(messagesObject)
            {
                messagesCallback(messagesObject);
            },
            error: function coordsRoomsLoadChatMessagesError(x, e)
            {
                Log.e(x);
                Log.e(e);
            }
        });
    },

    initializeRoomPage: function initializeRoomPage()
    {
        Log.v("CoordsRooms." + Log.getInlineFunctionTrace(arguments, arguments.callee));

        var currentRoomId = CoordsDB.getString("currentRoomId");

        CoordsRooms.getRoom(currentRoomId, function getRoomSuccessCallback(room)
        {
            CoordsRooms.currentRoom = room;

            CoordsUI.roomPageTitle.text(CoordsRooms.currentRoom['name']);

            CoordsRoomMap.initialize();
            
            CoordsUI.roomChatMessages.empty();

            var limit = 20;
            var beforeTimestamp = 0;

            if (room.usersJoined)
            {
                if ($.inArray(CoordsUser.getCurrentUser()['dbid'], room.usersJoined)!=-1)
                {
                    CoordsUI.roomJoinContainer.hide();
                    CoordsUI.roomChatComposeContainer.show();
                    CoordsUI.roomLeaveButton.show();
                } else {
                    CoordsUI.roomJoinContainer.show();
                    CoordsUI.roomChatComposeContainer.hide();
                    CoordsUI.roomLeaveButton.hide();
                }
            } else {
                CoordsUI.roomJoinContainer.show();
                CoordsUI.roomChatComposeContainer.hide();
                CoordsUI.roomLeaveButton.hide();
            }
            
            CoordsRooms.loadChatMessages(function loadChatMessagesCallback(messagesObject)
            {
                CoordsRooms.displayChatMessages(messagesObject, true);

                CoordsUI.roomChatMessages.off().on('scroll', function coordsRoomsRoomChatMessagesScrollevent(e)
                {
                    if (e.target.scrollTop == 0)
                    {
                        CoordsRooms.loadChatMessages(function loadChatMessagesCallback(messagesObject)
                        {
                            CoordsRooms.displayChatMessages(messagesObject, true);
                        }, limit, CoordsUI.roomChatMessages.children().first().data('timestamp'));
                    }
                })
            }, limit, beforeTimestamp);
        });

    },

    displayChatMessages: function displayChatMessages(messagesArray, scrollToNewestAfterDisplay)
    {
        Log.v("CoordsRooms." + Log.getInlineFunctionTrace(arguments, arguments.callee));

        if (CoordsUtil.iterableLength(messagesArray))
        {
            var chatMessagesAdded = [];
            
            $.each(messagesArray, function coordsRoomsDisplayChatMessages(index, messageObject)
            {
                chatMessagesAdded.push( CoordsRooms.displayIndividualChatMessage(messageObject) );
            });
            
            // Only scroll the messages view to bottom if the user hasn't deliberately scrolled up to read old messages!
            if (scrollToNewestAfterDisplay)
            {
                chatMessagesAdded.sort(function chatMessagesAddedSort(a, b)
                {
                    var aSort = a.data('timestamp');
                    var bSort = b.data('timestamp');
                    return (aSort == bSort) ? 0 : (aSort > bSort) ? 1 : -1;
                });

                setTimeout(function()
                {
                    chatMessagesAdded.slice(-1)[0].get(0).scrollIntoView();
                }, 1000);
            }
        }
    },

    triggerChatMessageSend: function triggerChatMessageSend()
    {
        Log.v("CoordsRooms." + Log.getInlineFunctionTrace(arguments, arguments.callee));

        var currentUser = CoordsUser.getCurrentUser();

        var senderObject = {
            type: 'user',
            id: currentUser['dbid'],
            name: currentUser['name'],
            avatar: currentUser['avatar']
        };

        var recipientObject = {
            type: 'room',
            id: CoordsRooms.currentRoom['_id'],
            name: CoordsRooms.currentRoom['name']
        };

        var userLocation = false;
        if(CoordsUser.currentLocation != false)
        {
            userLocation = {
                latitude: CoordsUser.currentLocation.lat,
                longitude: CoordsUser.currentLocation.lng,
                accuracy: CoordsUser.currentLocationAccuracy,
                altitude: CoordsUser.currentLocationAltitude,
                timestamp: CoordsUser.currentLocationTimestamp
            };
        }
        
        var messageObject = {
            body: CoordsUI.roomChatComposeMessageInput.val(),
            location: userLocation
        };

        CoordsEvents.sendChatMessage(senderObject, recipientObject, messageObject);

        // Clear text input after sending
        CoordsUI.roomChatComposeMessageInput.val('');
    },

    displayIndividualChatMessage: function displayIndividualChatMessage(eventObject)
    {

        var currentUser = CoordsUser.getCurrentUser();
        var newChatMessageHTML = '';
        var eventUnixtimestamp = Math.floor(eventObject['timestamp'] / 1000);

        if (eventObject['sender']['type'] == 'user' && eventObject['sender']['id'] == currentUser['dbid'])
        {
            newChatMessageHTML = '<div class="chat-message chat-message-user-me">' +
            '    <div class="chat-message-timestamp" data-livestamp="' + eventUnixtimestamp + '">' +
            moment.unix(eventUnixtimestamp).calendar() +
            '    </div>' +
            '    <div class="chat-message-content">' +
            eventObject['message']['body'] +
            '    </div>' +
            '</div>';
        }
        else
        {
            newChatMessageHTML = '<div class="chat-message chat-message-user-other">' +
            '    <div ' +
            '       class="chat-message-timestamp" ' +
            '       data-livestamp="' + eventUnixtimestamp + '" >' +
                /*moment.unix( eventUnixtimestamp).calendar() +*/
            '    </div>' +
            '    <div class="chat-message-user-name">' +
            eventObject['sender']['name'] +
            '    </div>' +
            '    <div class="chat-message-user">' +
            '        <img src="' + eventObject['sender']['avatar'] + '" alt="' + eventObject['sender']['name'] + '" />' +
            '    </div>' +
            '    <div class="chat-message-content">' +
            eventObject['message']['body'] +
            '    </div>' +
            '</div>';
        }

        var newChatMessage = $(newChatMessageHTML);
        var olderChatMessage = CoordsUI.roomChatMessages.children().filter(function displayIndividualChatMessageOldestFilter()
        {
            return $(this).data("timestamp") < eventObject["timestamp"];
        }).last();

        if (olderChatMessage.length)
        {
            olderChatMessage.after(newChatMessage);
        }
        else
        {
            CoordsUI.roomChatMessages.prepend(newChatMessage);
        }

        var newChatTimestamp = newChatMessage.find(".chat-message-timestamp");

        // Add data to chat message
        newChatMessage.data("message", eventObject['message']);
        newChatMessage.data("timestamp", eventObject['timestamp']);
        newChatMessage.data("sender", eventObject['sender']);

        // Add click event handler that displays time when clicks
        newChatMessage.click(function individualChatMessageClick()
        {
            if (!newChatTimestamp.hasClass("chat-message-timestamp-permanent"))
            {
                if (newChatTimestamp.is(":visible"))
                {
                    $(this).parent().find(".chat-message-timestamp:not(.chat-message-timestamp-permanent)").slideUp();
                    $(this).find(".chat-message-timestamp").slideUp();
                }
                else
                {
                    $(this).parent().find(".chat-message-timestamp:not(.chat-message-timestamp-permanent)").slideUp();
                    $(this).find(".chat-message-timestamp").slideDown();
                }
            }
        });

        // If the message is more than a minute away from the last message, cause a split in time.
        var prevChatMessage = newChatMessage.prev();
        if (prevChatMessage.length != 0)
        {
            var prevTimestamp = prevChatMessage.data("message")['timestamp'];
            var newTimestamp = newChatMessage.data("message")['timestamp'];
            if (newTimestamp - prevTimestamp > 60000)
            {
                newChatTimestamp.addClass("chat-message-timestamp-permanent");
            }
        }
        else
        {
            newChatTimestamp.addClass("chat-message-timestamp-permanent");
        }

        return newChatMessage;
    },

    handleChatMessageReceived: function handleChatMessageReceived(eventObject)
    {
        Log.v("CoordsRooms." + Log.getInlineFunctionTrace(arguments, arguments.callee));

        if (eventObject['recipient']['type'] == 'room' && eventObject['recipient']['id'] == CoordsRooms.currentRoom['_id'])
        {
            // Check the position of the chat messages scrollbar before appending the new message
            var scrollToLastAfterDisplay = (CoordsUI.roomChatMessages[0].scrollHeight - CoordsUI.roomChatMessages.scrollTop() - CoordsUI.roomChatMessages.height()) < 50;
            
            CoordsRooms.displayChatMessages([eventObject], scrollToLastAfterDisplay);
        }
    },

    joinRoom: function joinRoom(room, success, error){
        CoordsUI.showLoadingBar();
        $.ajax({
            type: "POST",
            url: "rooms/join",
            data: JSON.stringify({
                'roomId': room['_id'],
                'passphrase': ""
            }),
            contentType: "application/json",
            dataType: "json",
            success: function coordsRoomsJoinRoomSuccess(msg)
            {
                CoordsUI.hideLoadingBar();
                success(msg);
            },
            error: function coordsRoomsJoinRoomError(x, e)
            {
                CoordsUI.hideLoadingBar();
                error(x,e);
            }
        });
    },

    leaveRoom: function leaveRoom(room, success, error)
    {
        Log.v("CoordsRooms." + Log.getInlineFunctionTrace(arguments, arguments.callee));

        CoordsUI.showLoadingBar();

        $.ajax({
            type: "POST",
            url: "rooms/leave",
            data: JSON.stringify({
                'roomId': room['_id']
            }),
            contentType: "application/json",
            dataType: "json",
            success: function coordsRoomsLeaveRoomSuccess(msg)
            {
                CoordsUI.hideLoadingBar();
                success(msg);
                CoordsPages.changePage("mainPage");
            },
            error: function coordsRoomsLeaveRoomError(x, e)
            {
                error(x, e);
                Log.e("Failed to leave room");
            }
        });

        CoordsDB.removeString("currentRoomId");
        CoordsPages.changePage("mainPage");

        CoordsUI.roomChatMessages.empty();
    },

    createRoom: function createRoom(roomName, roomPassphrase, roomLatitude, roomLongitude)
    {
        Log.v("CoordsRooms." + Log.getInlineFunctionTrace(arguments, arguments.callee));

        CoordsUI.showLoadingBar();

        var room = {
            name: roomName,
            latitude: roomLatitude,
            longitude: roomLongitude
        };

        if (CoordsUtil.stringIsNotBlank(roomPassphrase))
        {
            room.private = true;
            room.passphrase = roomPassphrase;
        }
        else
        {
            room.private = false;
            room.passphrase = null;
        }

        $.ajax({
            type: "POST",
            url: "rooms/create",
            data: JSON.stringify(room),
            contentType: "application/json",
            dataType: "json",
            success: function coordsRoomsCreateRoomSuccess()
            {
                CoordsDiscoveryMap.getMarkers();
                $('[href=#nearbyRooms]').tab('show');
                CoordsUI.hideLoadingBar();
            },
            error: function coordsRoomsCreateRoomError(x, e)
            {
                Log.e("Failed to create room");
            }
        });
    },

    getRoom: function getRoom(roomId, success, error)
    {
        Log.v("CoordsRooms." + Log.getInlineFunctionTrace(arguments, arguments.callee));

        $.ajax({
            type: "POST",
            url: "rooms/get",
            data: JSON.stringify({
                'roomId': roomId
            }),
            contentType: "application/json",
            dataType: "json",
            success: function coordsRoomsGetRoomSuccess(room)
            {
                success(room);
            },
            error: function coordsRoomsGetRoomError(x, e)
            {
                error(x, e);
            }
        });
    }
    
};