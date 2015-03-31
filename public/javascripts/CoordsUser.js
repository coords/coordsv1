CoordsUser = {

    getCurrentUser: function getCurrentUser()
    {
        return CoordsDB.getObject("user");
    },
    
    checkLogin: function checkLogin(loggedInCallback)
    {
        try
        {
            CoordsLog.v("CoordsUser." + CoordsLog.getInlineFunctionTrace(arguments));

            var userData = CoordsUser.getCurrentUser();
            
            if (CoordsUtil.iterableLength(userData))
            {
                CoordsUser.populateUserProfile();
                
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
    
    populateUserProfile: function populateUserProfile()
    {
        var userData = CoordsUser.getCurrentUser();

        $('.userProfileName').text(userData['name']);
        $('.userProfilePhoto').attr('src', userData['avatar']);
        $('.userProfileButton').removeClass('hidden');

        if (CoordsUtil.isDefined(userData['email']))
        {
            $('.userProfileEmail')
                .text(userData['email'])
                .attr('href', 'mailto:' + userData['email'])
                .removeClass('hidden');
        }
        else
        {
            $('.userProfileEmail').addClass('hidden');
        }
        
        if (CoordsUtil.isDefined(userData['gender']))
        {
            var gender = userData['gender'];

            if( CoordsUtil.stringiCompare(gender, "male") )
            {
                gender = 'Male';
            }
            else if( CoordsUtil.stringiCompare(gender, "female") )
            {
                gender = 'Female';
            }
            else if( CoordsUtil.isNumber(gender) )
            {
                gender = gender == 0 ? 'Male' : 'Female';
            }

            $('.userProfileGender')
                .text(gender)
                .removeClass('hidden');
        }
        else
        {
            $('.userProfileGender').closest('.row').addClass('hidden');
        }

        if (CoordsUtil.isDefined(userData['location']))
        {
            $('.userProfileLocation')
                .text(userData['location'])
                .removeClass('hidden');
        }
        else
        {
            $('.userProfileLocation').closest('.row').addClass('hidden');
        }

        if (CoordsUtil.isDefined(userData['birthdate']))
        {
            $('.userProfileDOB')
                .text(userData['birthdate']['day'] + '/' + userData['birthdate']['month'] + '/' + userData['birthdate']['year'])
                .removeClass('hidden');
        }
        else
        {
            $('.userProfileDOB').closest('.row').addClass('hidden');
        }
    },

    expandUserProfile: function expandUserProfile()
    {
        $('.expandedUserProfileContainer').removeClass('slideDownCollapsed');
        $('.expandUserProfileButton').addClass('userProfileExpanded').off('click').click(function() {
            CoordsUser.collapseUserProfile();
        });
    },
    
    collapseUserProfile: function collapseUserProfile()
    {
        $('.expandedUserProfileContainer').addClass('slideDownCollapsed');
        $('.expandUserProfileButton').removeClass('userProfileExpanded').off('click').click(function() {
            CoordsUser.expandUserProfile();
        });
    }
    
};