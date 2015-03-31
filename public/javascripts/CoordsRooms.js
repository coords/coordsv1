CoordsRooms = {

    displayNearbyRooms: function displayNearbyRooms(rooms)
    {
        try
        {
            CoordsLog.v("CoordsRooms." + CoordsLog.getInlineFunctionTrace(arguments));

            $("#nearbyRoomsList").html("");
            if (rooms.length == 0)
            {
                $("#nearbyRoomsList").html("<p>No rooms nearby</p>");
            }
            $.each(rooms, function (index, room)
            {
                var template = '<div class="rooms-room load-room-' + room._id + '">' +
                    '<div class="rooms-room-name">' + room.name + '</div>' +
                    '<div class="rooms-room-distance">' + (room.dist.calculated / 1000).toFixed(1) + ' km</div>' +
                    '</div>';
                $("#nearbyRoomsList").append(template);
                $('.load-room-' + room._id).off('click').click(function ()
                {
                    CoordsRooms.loadRoom(room);
                });

            });
        }

        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    closeRoom: function closeRoom()
    {
        
    },

    leaveRoom: function leaveRoom()
    {
        CoordsDB.removeString("currentRoomId");
    },
    
    createRoom: function createRoom(roomName, roomPassphrase, roomLatitude, roomLongitude)
    {
        CoordsLog.i("Creating room with name: " + roomName);

        CoordsUI.showLoadingBar();

        var room = {
            name: roomName,
            latitude: roomLatitude,
            longitude: roomLongitude
        };
        
        if( CoordsUtil.stringIsNotBlank(roomPassphrase) )
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
            success: function (msg) {
                CoordsDiscoveryMap.getMarkers();
                $('[href=#nearbyRooms]').tab('show');
                CoordsUI.hideLoadingBar();
            },
            error:function(x,e){
                CoordsLog.e("Failed to create room");
            }
        });
    },
    
    loadRoom: function loadRoom(room)
    {
        CoordsLog.i("Loading room with ID: " + room['_id']);

        CoordsUI.showLoadingBar();

        $.ajax({
            type: "POST",
            url: "rooms/get",
            data: JSON.stringify({
                'roomId': room['_id']
            }),
            contentType: "application/json",
            dataType: "json",
            success: function (room)
            {
                CoordsLog.i("Loaded fresh room details: ");
                CoordsLog.i(room);
                
                var roomDetailsPanel = $('#roomDetailsPanel');

                roomDetailsPanel.find('.roomName').text(room.name).removeClass('hidden');
                roomDetailsPanel.find('.welcomeMessage').addClass('hidden');
                
                var exampleMessagesHTML = '<div class="messenger-message messenger-message-user-other">' +
                    '    <div class="messenger-message-timestamp">' +
                    '        15 Feb At 13:08' +
                    '    </div>' +
                    '    <div class="messenger-message-user">' +
                    '        <img src="https://avatars0.githubusercontent.com/u/757713?v=3&amp;s=40"/>' +
                    '    </div>' +
                    '    <div class="messenger-message-content">' +
                    '        Hello World' +
                    '    </div>' +
                    '</div>' +
                    '<div class="messenger-message messenger-message-user-me">' +
                    '    <div class="messenger-message-timestamp">' +
                    '        15 Feb At 13:08' +
                    '    </div>' +
                    '    <div class="messenger-message-content">' +
                    '        This is just a test.' +
                    '    </div>' +
                    '</div>' +
                    '<div class="messenger-message messenger-message-user-me">' +
                    '    <div class="messenger-message-timestamp">' +
                    '        15 Feb At 13:08' +
                    '    </div>' +
                    '    <div class="messenger-message-content">' +
                    '        Ignore me' +
                    '    </div>' +
                    '</div>' +
                    '<div class="messenger-message messenger-message-user-other">' +
                    '    <div class="messenger-message-timestamp">' +
                    '        15 Feb At 13:08' +
                    '    </div>' +
                    '    <div class="messenger-message-user">' +
                    '        <img src="https://avatars0.githubusercontent.com/u/757713?v=3&amp;s=40"/>' +
                    '    </div>' +
                    '    <div class="messenger-message-content">' +
                    '        okay' +
                    '    </div>' +
                    '</div>' +
                    '<div class="messenger-message messenger-message-user-me">' +
                    '    <div class="messenger-message-timestamp">' +
                    '        15 Feb At 13:08' +
                    '    </div>' +
                    '    <div class="messenger-message-content">' +
                    '        Hey, question...' +
                    '    </div>' +
                    '</div>' +
                    '<div class="messenger-message messenger-message-user-other">' +
                    '    <div class="messenger-message-timestamp">' +
                    '        15 Feb At 13:08' +
                    '    </div>' +
                    '    <div class="messenger-message-user">' +
                    '        <img src="https://avatars0.githubusercontent.com/u/757713?v=3&amp;s=40"/>' +
                    '    </div>' +
                    '    <div class="messenger-message-content">' +
                    '        I\'m Ignoring you!' +
                    '    </div>' +
                    '</div>' +
                    '<div class="messenger-message messenger-message-user-other">' +
                    '    <div class="messenger-message-timestamp">' +
                    '        15 Feb At 13:08' +
                    '    </div>' +
                    '    <div class="messenger-message-user">' +
                    '        <img src="https://avatars0.githubusercontent.com/u/757713?v=3&amp;s=40"/>' +
                    '    </div>' +
                    '    <div class="messenger-message-content">' +
                    '        I\'m Ignoring you!' +
                    '    </div>' +
                    '</div>' +
                    '<div class="messenger-message messenger-message-user-me">' +
                    '    <div class="messenger-message-timestamp">' +
                    '        15 Feb At 13:08' +
                    '    </div>' +
                    '    <div class="messenger-message-content">' +
                    '        hello world' +
                    '    </div>' +
                    '</div>' +
                    '<div class="messenger-message messenger-message-user-me">' +
                    '    <div class="messenger-message-timestamp">' +
                    '        15 Feb At 13:08' +
                    '    </div>' +
                    '    <div class="messenger-message-content">' +
                    '        Lorem ipsum dolor sit amet' +
                    '    </div>' +
                    '</div>' +
                    '<div class="messenger-message messenger-message-user-me">' +
                    '    <div class="messenger-message-timestamp">' +
                    '        15 Feb At 13:08' +
                    '    </div>' +
                    '    <div class="messenger-message-content">' +
                    '        Cheese' +
                    '    </div>' +
                    '</div>';

                var messagesContainer = roomDetailsPanel.find('.roomMessages');
                messagesContainer.html(exampleMessagesHTML);

                var roomUsersContainer = roomDetailsPanel.find('.roomUsers');

                roomUsersContainer.html("This room has no users... Be the first to join!");
                
                var usersShown = 0;
                if (CoordsUtil.iterableLength(room.usersJoined))
                {
                    $.each(room.usersJoined, function (index, userId)
                    {
                        if(usersShown >= 5)
                        {
                            return false;
                        }
                        
                        CoordsLog.i("Querying DB for data about user with ID: " + userId);

                        $.ajax({
                            type: "POST",
                            url: "users/get",
                            data: JSON.stringify({
                                'userId': userId
                            }),
                            contentType: "application/json",
                            dataType: "json",
                            success: function (user)
                            {
                                if(usersShown >= 5)
                                {
                                    return false;
                                }
                                
                                if (CoordsUtil.iterableLength(user))
                                {
                                    CoordsLog.i("Successfully retrieved user from DB: ");
                                    CoordsLog.i(user);

                                    if(usersShown == 0)
                                    {
                                        roomUsersContainer.empty();
                                    }
                                    
                                    var encoded_avatar = user.avatar.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

                                    var roomUserProfileHTML =   '<div class="roomUserProfileContainer">' +
                                                                '    <div class="userProfilePhotoColumn">' +
                                                                '        <img alt="User Photo" src="' + encoded_avatar + '" class="img-responsive img-circle userProfilePhoto"/>' +
                                                                '    </div>' +
                                                                '    <div class="userProfileNameColumn">' +
                                                                '        <h4 class="userProfileName">' + user.name + '</h4>' +
                                                                '    </div>' +
                                                                '</div>';
                                    
                                    roomUsersContainer.append(roomUserProfileHTML);

                                    usersShown++;
                                }
                                else
                                {
                                    CoordsLog.i("No user data was returned by DB");
                                }
                            },
                            error: function (x, e)
                            {
                                CoordsLog.e("Failed to load room details");
                            }
                        });
                        
                    });
                }
                else
                {
                    roomUsersContainer.html("This room has no users... Be the first to join!");
                }

                roomDetailsPanel.find('.roomPrivate').text(room.private ? "Yes" : "No");

                if (CoordsUtil.isDefined(room.dist))
                {
                    roomDetailsPanel.find('.roomDistance').text(Math.round(room.dist.calculated)).closest('tr').removeClass('hidden');
                }
                else
                {
                    roomDetailsPanel.find('.roomDistance').closest('tr').addClass('hidden');
                }

                $('.joinRoomButton').off('click').click(function ()
                {
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
                        success: function (msg)
                        {
                            CoordsDB.setString("currentRoomId", room['_id']);
                            CoordsPages.changePage("roomPage");
                        },
                        error: function (x, e)
                        {
                            CoordsLog.e("Failed to join room");
                        }
                    });
                });


                var latlng = L.latLng(room.loc.lat, room.loc.lon);
                CoordsDiscoveryMap.map.panTo(latlng);

                CoordsUI.openPanel("roomDetailsPanel");
                CoordsUI.hideLoadingBar();
            },
            error: function (x, e)
            {
                CoordsLog.e("Failed to load room details");
            }
        });
    }

};