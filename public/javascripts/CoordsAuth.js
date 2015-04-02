CoordsAuth = {

    credentials: {
        key: 'xii9p-_4ZfUXQZhCmOnMFyqLgjM'
    },

    initialize: function initialize()
    {
        OAuth.initialize(CoordsAuth.credentials.key);
        
        $.ajax({
            url: '/oauth/token',
            success: function oauthInitializeSuccess(data, status)
            {
                CoordsDB.setString("oauthtoken", data.token);
            },
            error: function oauthInitializeError(data)
            {
                CoordsAuth.logout();
            }
        });
    },
    
    logout: function logout()
    {
        CoordsDB.removeObject("currentRoomId");
        CoordsDB.removeObject("user");
        
        CoordsPages.changePage("loginPage");
    },
    
    authenticate: function authenticate(provider, token, callback)
    {
        try
        {
            Log.v("CoordsAuth." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            OAuth.popup(provider, {
                state: token
            })
                .done(function oauthPopupDone(r)
                {
                    $.ajax({
                        url: '/oauth/signin/' + provider + '/' + r.code,
                        success: function oauthSigninSuccess(data, status)
                        {
                            Log.i("Successfully authenticated with signin endpoint, data: ");
                            Log.i(data);
                            
                            callback(data);
                        },
                        error: function oauthSigninError(data)
                        {
                            CoordsAuth.logout();
                        }
                    });
                })
                .fail(function oauthPopupFail(e)
                {
                    Log.e("Failed to authenticate, error: ");
                    Log.e(e);
                    CoordsAuth.logout();
                });
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    authenticateWithProvider: function authenticateWithProvider(provider)
    {
        try
        {
            Log.v("CoordsAuth." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            CoordsUI.showLoadingBar();

            CoordsAuth.authenticate(provider, CoordsDB.getString("oauthtoken"), function coordsAuthAuthenticateCallback(userObject)
            {
                Log.i("Successfully authenticated, stored user object in local storage");

                var userData = userObject["providerUserData"];
                jQuery.extend(userObject, userData);

                delete(userObject["providerUserData"]);

                CoordsDB.setObject("user", userObject);
                CoordsUser.currentUser = userObject;
                
                CoordsUser.checkLogin(function loginSuccess()
                {
                    CoordsUI.roomDetailsPanel.find('.welcomeMessage').removeClass('hidden');
                    CoordsUI.roomDetailsPanel.find('.roomName').addClass('hidden');
                    
                    CoordsPages.changePage("mainPage");
                });
            });
        }
        catch (e)
        {
            Log.exception(e);
        }
    }

};