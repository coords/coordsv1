CoordsAuth = {

    credentials: {
        key: 'xii9p-_4ZfUXQZhCmOnMFyqLgjM'
    },

    logout: function logout()
    {
        CoordsDB.removeObject("user");
        CoordsPages.changePage("loginPage");
    },

    checkUserLogin: function checkUserLogin(loggedInCallback)
    {
        try
        {
            CoordsLog.v("CoordsAuth." + CoordsLog.getInlineFunctionTrace(arguments));

            var user = CoordsDB.getObject("user");

            if (CoordsUtil.stringIsNotBlank(user['authProvider']))
            {
                $.ajax({
                    url: '/me/' + user['authProvider'],
                    success: function (data, status)
                    {
                        data['authProvider'] = user['authProvider'];
                        CoordsDB.setObject("user", data);

                        CoordsLog.i(data);
                        
                        $('.userProfileName').text(data['name']);
                        $('.userProfilePhoto').attr('src', data['avatar']);

                        if(CoordsUtil.isDefined(data['gender']))
                        {
                            $('.userProfileGender')
                                .text(data['gender'] ? 'Female' : 'Male')
                                .closest('tr')
                                .removeClass('hidden');
                        }
                        else
                        {
                            $('.userProfileGender').closest('tr').addClass('hidden');
                        }
                        
                        if(CoordsUtil.isDefined(data['location']))
                        {
                            $('.userProfileLocation')
                                .text(data['location'])
                                .closest('tr')
                                .removeClass('hidden');
                        }
                        else
                        {
                            $('.userProfileLocation').closest('tr').addClass('hidden');
                        }

                        if(CoordsUtil.isDefined(data['email']))
                        {
                            $('.userProfileEmail')
                                .text(data['email'])
                                .attr('href', 'mailto:' + data['email'])
                                .closest('tr')
                                .removeClass('hidden');
                        }
                        else
                        {
                            $('.userProfileEmail').closest('tr').addClass('hidden');
                        }

                        if(CoordsUtil.isDefined(data['birthdate']))
                        {
                            $('.userProfileDOB')
                                .text(data['birthdate']['day'] + '/' + data['birthdate']['month'] + '/' + data['birthdate']['year'])
                                .closest('tr')
                                .removeClass('hidden');
                        }
                        else
                        {
                            $('.userProfileDOB').closest('tr').addClass('hidden');
                        }
                        
                        if (CoordsUtil.isDefined(loggedInCallback))
                        {
                            loggedInCallback();
                        }
                    },
                    error: function (data)
                    {
                        CoordsAuth.logout();
                    }
                });
            }
            else
            {
                CoordsAuth.logout();
            }
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
                
                // Google requires the following field to get a refresh token
                authorize: {
                    approval_prompt: 'force'
                }
            })
            .done(function (r)
            {
                $.ajax({
                    url: '/oauth/signin/' + provider + '/' + r.code,
                    success: function (data, status)
                    {
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
            
            OAuth.initialize(CoordsAuth.credentials.key);

            $.ajax({
                url: '/oauth/token',
                success: function (data, status)
                {
                    CoordsAuth.authenticate(provider, data.token, function ()
                    {
                        CoordsDB.setObject("user", {
                            authProvider: provider
                        });
                        
                        CoordsAuth.checkUserLogin(function loginSuccess()
                        {
                            CoordsPages.changePage("mapPage");
                        });
                    });
                },
                error: function (data)
                {
                    CoordsAuth.logout();
                }
            });
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    }

};