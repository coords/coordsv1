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
                $('.load-room-' + room._id).click(function ()
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

                var roomPanel = $('#roomPanel');

                roomPanel.find('.roomName').text(room.name);

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

                var messagesContainer = roomPanel.find('.roomMessages');
                messagesContainer.html(exampleMessagesHTML);

                var roomUsersContainer = roomPanel.find('.roomUsers');

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

                                    var roomUserProfileHTML =   '<div class="row roomUserProfileContainer margin-top-10">' +
                                                                '    <div class="col-xs-2 userProfilePhotoColumn">' +
                                                                '        <img alt="User Photo" src="' + encoded_avatar + '" class="img-responsive img-circle userProfilePhoto"/>' +
                                                                '    </div>' +
                                                                '    <div class="col-xs-10 userProfileNameColumn">' +
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

                roomPanel.find('.roomPrivate').text(room.private ? "Yes" : "No");

                if (CoordsUtil.isDefined(room.dist))
                {
                    roomPanel.find('.roomDistance').text(Math.round(room.dist.calculated)).closest('tr').removeClass('hidden');
                }
                else
                {
                    roomPanel.find('.roomDistance').closest('tr').addClass('hidden');
                }

                $('.joinRoomButton').click(function ()
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
                            roomPanel.find('.hiddenWhenRoomMember').addClass('hidden');
                            roomPanel.find('.hiddenWhenNotRoomMember').removeClass('hidden');

                            CoordsUI.hideLoadingBar();
                        },
                        error: function (x, e)
                        {
                            CoordsLog.e("Failed to join room");
                        }
                    });
                });

                $('.leaveRoomButton').click(function ()
                {
                    CoordsUI.showLoadingBar();
                    
                    $.ajax({
                        type: "POST",
                        url: "rooms/leave",
                        data: JSON.stringify({
                            'roomId': room['_id']
                        }),
                        contentType: "application/json",
                        dataType: "json",
                        success: function (msg)
                        {
                            CoordsRooms.loadRoom(room);
                        },
                        error: function (x, e)
                        {
                            CoordsLog.e("Failed to leave room");
                        }
                    });
                });

                roomPanel.find('.hiddenWhenRoomMember').removeClass('hidden');
                roomPanel.find('.hiddenWhenNotRoomMember').addClass('hidden');
                
                var latlng = L.latLng(room.loc.lat, room.loc.lon);
                CoordsMap.map.panTo(latlng);

                CoordsUI.openPanel("roomPanel");
                CoordsUI.hideLoadingBar();
            },
            error: function (x, e)
            {
                CoordsLog.e("Failed to load room details");
            }
        });
    }

};