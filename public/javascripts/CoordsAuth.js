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

            var userObject = CoordsDB.getObject("user");
            var userData = userObject["providerUserData"];
            
            if (CoordsUtil.iterableLength(userData))
            {
                $('.userProfileName').text(userData['name']);
                $('.userProfilePhoto').attr('src', userData['avatar']);

                if (CoordsUtil.isDefined(userData['gender']))
                {
                    $('.userProfileGender')
                        .text(userData['gender'] ? 'Female' : 'Male')
                        .closest('tr')
                        .removeClass('hidden');
                }
                else
                {
                    $('.userProfileGender').closest('tr').addClass('hidden');
                }

                if (CoordsUtil.isDefined(userData['location']))
                {
                    $('.userProfileLocation')
                        .text(userData['location'])
                        .closest('tr')
                        .removeClass('hidden');
                }
                else
                {
                    $('.userProfileLocation').closest('tr').addClass('hidden');
                }

                if (CoordsUtil.isDefined(userData['email']))
                {
                    $('.userProfileEmail')
                        .text(userData['email'])
                        .attr('href', 'mailto:' + userData['email'])
                        .closest('tr')
                        .removeClass('hidden');
                }
                else
                {
                    $('.userProfileEmail').closest('tr').addClass('hidden');
                }

                if (CoordsUtil.isDefined(userData['birthdate']))
                {
                    $('.userProfileDOB')
                        .text(userData['birthdate']['day'] + '/' + userData['birthdate']['month'] + '/' + userData['birthdate']['year'])
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
                    CoordsAuth.authenticate(provider, data.token, function (userObject)
                    {
                        CoordsLog.i("Successfully authenticated, userObject response: ");
                        console.log(userObject);
                        
                        CoordsDB.setObject("user", userObject);

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