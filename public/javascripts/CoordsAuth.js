CoordsAuth = {

    credentials: {
        key: 'xii9p-_4ZfUXQZhCmOnMFyqLgjM'
    },

    initialize: function initialize()
    {
        OAuth.initialize(CoordsAuth.credentials.key);
        
        $.ajax({
            url: '/oauth/token',
            success: function (data, status)
            {
                CoordsDB.setString("oauthtoken", data.token);
            },
            error: function (data)
            {
                CoordsAuth.logout();
            }
        });
    },
    
    logout: function logout()
    {
        CoordsRooms.closeRoom();
        CoordsDB.removeObject("user");
        CoordsPages.changePage("loginPage");
    },
    
    authenticate: function authenticate(provider, token, callback)
    {
        try
        {
            CoordsLog.v("CoordsAuth." + CoordsLog.getInlineFunctionTrace(arguments));

            OAuth.popup(provider, {
                state: token
            })
                .done(function (r)
                {
                    $.ajax({
                        url: '/oauth/signin/' + provider + '/' + r.code,
                        success: function (data, status)
                        {
                            CoordsLog.i("Successfully authenticated with signin endpoint, data: ");
                            CoordsLog.i(data);
                            
                            callback(data);
                        },
                        error: function (data)
                        {
                            CoordsAuth.logout();
                        }
                    });
                })
                .fail(function (e)
                {
                    CoordsLog.e("Failed to authenticate, error: ");
                    CoordsLog.e(e);
                    CoordsAuth.logout();
                });
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    authenticateWithProvider: function authenticateWithProvider(provider)
    {
        try
        {
            CoordsLog.v("CoordsAuth." + CoordsLog.getInlineFunctionTrace(arguments));

            CoordsUI.showLoadingBar();

            CoordsAuth.authenticate(provider, CoordsDB.getString("oauthtoken"), function (userObject)
            {
                CoordsLog.i("Successfully authenticated, stored user object in local storage");

                var userData = userObject["providerUserData"];
                jQuery.extend(userObject, userData);

                delete(userObject["providerUserData"]);

                CoordsDB.setObject("user", userObject);

                CoordsUser.checkLogin(function loginSuccess()
                {
                    var roomPanel = $('#roomPanel');
                    
                    $('#roomManagementTabPanel').appendTo('#roomPanel');
                    roomPanel.find('.welcomeMessage').removeClass('hidden');
                    roomPanel.find('.roomName').addClass('hidden');
                    
                    CoordsPages.changePage("mainPage");
                });
            });
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    }

};