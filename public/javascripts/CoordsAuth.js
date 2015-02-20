CoordsAuth = {

    credentials: {
        key: 'xii9p-_4ZfUXQZhCmOnMFyqLgjM'
    },

    init_oauthio: function init_oauthio()
    {
        try
        {
            CoordsLog.v("CoordsAuth." + CoordsLog.getInlineFunctionTrace(arguments));

            OAuth.initialize(CoordsAuth.credentials.key);
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    loggedIn: function isLoggedIn()
    {
        try
        {
            CoordsLog.v("CoordsAuth." + CoordsLog.getInlineFunctionTrace(arguments));

            var authProvider = CoordsDB.getString("authProvider");
            
            if(CoordsUtil.stringIsBlank(authProvider))
            {
                return false;
            }
            
            return true;
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    },
    
    retrieve_token: function retrieve_token(callback)
    {
        try
        {
            CoordsLog.v("CoordsAuth." + CoordsLog.getInlineFunctionTrace(arguments));

            $.ajax({
                url: '/oauth/token',
                success: function (data, status)
                {
                    callback(null, data.token);
                },
                error: function (data)
                {
                    callback(data);
                }
            });
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    authenticate: function authenticate(provider, token, callback)
    {
        try
        {
            CoordsLog.v("CoordsAuth." + CoordsLog.getInlineFunctionTrace(arguments));

            OAuth.popup(provider, {
                state: token,
                // Google requires the following field 
                // to get a refresh token
                authorize: {
                    approval_prompt: 'force'
                }
            })
                .done(function (r)
                {
                    $.ajax({
                        url: '/oauth/signin',
                        method: 'POST',
                        data: {
                            code: r.code
                        },
                        success: function (data, status)
                        {
                            callback(null, data);
                        },
                        error: function (data)
                        {
                            callback(data);
                        }
                    });
                })
                .fail(function (e)
                {
                    console.log(e);
                });
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    updateUserInfoDisplay: function updateUserInfoDisplay(callback)
    {
        try
        {
            CoordsLog.v("CoordsAuth." + CoordsLog.getInlineFunctionTrace(arguments));

            var authProvider = CoordsDB.getString("authProvider");

            if (CoordsUtil.stringIsNotBlank(authProvider))
            {
                $.ajax({
                    url: '/me/' + authProvider,
                    success: function (data, status)
                    {
                        $('#name_box').html(data['name']);
                        $('#email_box').html(data['email']);
                        $('#img_box').attr('src', data['avatar']);

                        if (callback)
                        {
                            callback(data);
                        }
                    },
                    error: function (data)
                    {

                    }
                });
            }
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

            CoordsDB.setString("authProvider", provider);

            CoordsAuth.init_oauthio();
            CoordsAuth.retrieve_token(function (err, token)
            {
                CoordsAuth.authenticate(provider, token, function (err)
                {
                    if (!err)
                    {
                        CoordsAuth.updateUserInfoDisplay();
                    }
                });
            });
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    }

};