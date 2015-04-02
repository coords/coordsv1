CoordsUI = {
    
    cacheElementSelectors: function cacheElementSelectors()
    {
        
        // Top level elements
        CoordsUI.loginPage = $('#loginPage');
        CoordsUI.mainPage = $('#mainPage');
        CoordsUI.roomPage = $('#roomPage');
        
        CoordsUI.menuPanel = $('#menuPanel');
        CoordsUI.roomDetailsPanel = $('#roomDetailsPanel');
        CoordsUI.roomChatPanel = $('#roomChatPanel');
        
        CoordsUI.menuPanelContentOverlay = $('#menuPanelContentOverlay');
        CoordsUI.roomDetailsPanelContentOverlay = $('#roomDetailsPanelContentOverlay');
        CoordsUI.roomChatPanelContentOverlay = $('#roomChatPanelContentOverlay');
        
        // Discovery page
        CoordsUI.discoveryMapGpsButton = $('#discoveryMapGpsButton');
        CoordsUI.roomNameInput = $('#roomNameInput');
        CoordsUI.createRoomButton = $('#createRoomButton');
        CoordsUI.nearbyRoomsList = $('#nearbyRoomsList');
        CoordsUI.joinedRoomsList = $('#joinedRoomsList');
        
        // Room page
        CoordsUI.roomPageTitle = $('#roomPageTitle');
        CoordsUI.roomMap = $('#roomMap');
        CoordsUI.roomMapView = $('#roomMapView');
        CoordsUI.roomMapGpsButton = $('#roomMapGpsButton');
        CoordsUI.roomChatView = $('#roomChatView');
        CoordsUI.roomChatMessages = $('#roomChatMessages');
        CoordsUI.roomChatComposeContainer = $('#roomChatComposeContainer');
        CoordsUI.roomChatComposeMessageInput = $('#roomChatComposeMessageInput');
        CoordsUI.roomChatSendMessageButton = $('#roomChatSendMessageButton');
        CoordsUI.roomJoinContainer = $('#roomJoinContainer');
        CoordsUI.roomJoinButton = $('#roomJoinButton');
        CoordsUI.roomLeaveButton = $('#roomLeaveButton');
        CoordsUI.roomShowMapButton = $('#roomShowMapButton');
        
    },

    setupEventHandlers: function setupEventHandlers() 
    {

        $('.btn-facebook').click(function() {
            CoordsAuth.authenticateWithProvider('facebook');
        });

        $('.btn-twitter').click(function() {
            CoordsAuth.authenticateWithProvider('twitter');
        });

        $('.btn-google-plus').click(function() {
            CoordsAuth.authenticateWithProvider('google');
        });

        $('.btn-github').click(function() {
            CoordsAuth.authenticateWithProvider('github');
        });

        $('.logoutButton').click(function() {
            CoordsAuth.logout();
        });

        $('.openNearbyPanel').click(function() {
            CoordsUI.openPanel("menuPanel");
        });

        $('.expandUserProfileButton').off('click').click(function() {
            CoordsUser.expandUserProfile();
        });

        $('.closePanelButton').click(function() {
            var panelId = $(this).closest('div.unscrollablePanelContainer').attr('id');
            CoordsUI.closePanel(panelId);
        });

        $('.backButton').on('click', function backButtonClicked() {
            CoordsUI.backButtonPressed();
        });
        
        CoordsUI.roomJoinButton.click(function roomJoinButtonClick()
        {
            CoordsRooms.joinRoom(CoordsRooms.currentRoom,function(){
                if(CoordsRooms.currentRoom.usersJoined==null||CoordsRooms.currentRoom.usersJoined==undefined){
                    CoordsRooms.currentRoom.usersJoined = [];
                }
                CoordsRooms.currentRoom.usersJoined.push(CoordsUser.getCurrentUser()['dbid']);
                CoordsUI.roomJoinContainer.hide();
                CoordsUI.roomChatComposeContainer.show();
                CoordsUI.roomLeaveButton.show();
            },function(){});
        });
        
        CoordsUI.roomLeaveButton.click(function roomLeaveButtonClick()
        {
            CoordsRooms.leaveRoom(CoordsRooms.currentRoom,function(){
                CoordsRooms.currentRoom.usersJoined.splice(CoordsRooms.currentRoom.usersJoined.indexOf(CoordsUser.getCurrentUser()['dbid']),1);
                CoordsUI.roomJoinContainer.hide();
                CoordsUI.roomChatComposeContainer.show();
                CoordsUI.roomLeaveButton.hide();
            },function(){});
        });

        CoordsUI.roomShowMapButton.click(function(){
            CoordsUI.roomMapView.toggle();
            CoordsUI.roomChatView.toggle();
            CoordsRoomMap.map.invalidateSize();
        });

        CoordsUI.roomChatSendMessageButton.on('click', function roomChatSendMessageButtonClick() {
            CoordsRooms.triggerChatMessageSend()
        });
        
        CoordsUI.roomChatComposeMessageInput.on('keydown', function roomChatComposeMessageInputKeydown(e) {
            if(e.which == 13) {
                CoordsRooms.triggerChatMessageSend();
                return false;
            }
        });

        CoordsUI.createRoomButton.click(function() {

            if( CoordsUser.currentLocation != false )
            {
                CoordsRooms.createRoom( CoordsUI.roomNameInput.val(), '', CoordsUser.currentLocation.lat, CoordsUser.currentLocation.lng );
                CoordsUI.roomNameInput.val('');
            }
            else
            {
                alert("Please enable your GPS to create a room at your location!");
            }

        });
        
    },
    
    showLoadingBar: function showLoadingBar()
    {
        try
        {
            Log.v("CoordsUI." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            NativeWrapper.showProgressBar();
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    hideLoadingBar: function hideLoadingBar()
    {
        try
        {
            Log.v("CoordsUI." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            NativeWrapper.hideProgressBar();
        }
        catch (e)
        {
            Log.exception(e);
        }
    },
    
    openPanel: function openPanel(panelId)
    {
        Log.v("CoordsUI." + Log.getInlineFunctionTrace(arguments, arguments.callee));

        CoordsUI[panelId].removeClass("inactivePanel").addClass("activePanel");

        CoordsUI[panelId + 'ContentOverlay'].removeClass("hidden");

        CoordsUI.hideLoadingBar();
    },

    closePanel: function closePanel(panelId)
    {
        Log.v("CoordsUI." + Log.getInlineFunctionTrace(arguments, arguments.callee));

        if( CoordsUI[panelId].hasClass("activePanel") )
        {
            CoordsUI[panelId].removeClass("activePanel").addClass("inactivePanel");
            CoordsUI[panelId + 'ContentOverlay'].addClass("hidden");
        }
    },

    closeAllPanels: function closeAllPanels()
    {
        Log.v("CoordsUI." + Log.getInlineFunctionTrace(arguments, arguments.callee));

        $('.activePanel').each(function activePanelIterator()
        {
            CoordsUI.closePanel(this.id);
        });
    },

    backButtonPressed: function backButtonPressed()
    {
        Log.v("CoordsUI." + Log.getInlineFunctionTrace(arguments, arguments.callee));

        if( CoordsDB.getString("currentPageId") == "roomPage" )
        {
            CoordsPages.changePage("mainPage");
            CoordsUI.roomChatMessages.empty();
            CoordsUI.roomPageTitle.empty();
        }
        else
        {
            Log.w("Back button pressed with no action handler found, doing nothing!");
        }
    }
    
};