CoordsPages = {

    setupPagesOnDocumentReady: function setupPagesOnDocumentReady()
    {
        try
        {
            CoordsLog.v("CoordsPages." + CoordsLog.getInlineFunctionTrace(arguments));

            /* Login page */

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

            $('.mapPageButton').click(function() {
                CoordsPages.changePage("mapPage");
            });
            
            $('.profilePageButton').click(function() {
                CoordsPages.changePage("profilePage");
            });

            $('.logoutButton').click(function() {
                CoordsPages.changePage("loginPage");
            });

            $('.openMenuPanelButton').click(function() {
                CoordsUI.openPanel("menuPanel");
            });
            
            $('.closeMenuPanelButton').click(function() {
                CoordsUI.closePanel("menuPanel");
            });
            

            CoordsMap.initialize();
            CoordsComms.testComms();
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    getCurrentPageId: function getCurrentPageId()
    {
        try
        {
            CoordsLog.v("CoordsPages." + CoordsLog.getInlineFunctionTrace(arguments));

            var activePageId = $('.activePage').attr('id');

            if ( CoordsUtil.stringIsEmpty(activePageId) )
            {
                var currentPageId = CoordsDB.getString("currentPageId");
                if ( CoordsUtil.stringIsEmpty(currentPageId) )
                {
                    currentPageId = "mapPage";
                    CoordsDB.setString("currentPageId", currentPageId);
                }

                activePageId = currentPageId;
            }

            return activePageId;
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    },
    
    changeToCorrectPageOnDocumentReady: function changeToCorrectPageOnDocumentReady()
    {
        try
        {
            CoordsLog.v("CoordsPages." + CoordsLog.getInlineFunctionTrace(arguments));

            var currentPageId = CoordsPages.getCurrentPageId();
            CoordsLog.d("Current page ID according to DB: " + currentPageId);

            var activePage = $('.activePage');

            // If there is no active page, or the currently active page is not the one the database thinks it should be, change to it
            if (activePage.length == 0 || activePage[0].id != currentPageId)
            {
                CoordsAuth.checkUserLogin(function loginSuccess()
                {
                    CoordsPages.changePage(currentPageId);
                });
            }
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    changePage: function changePage(newPageId)
    {
        try
        {
            CoordsLog.v("CoordsPages." + CoordsLog.getInlineFunctionTrace(arguments));

            var currentPageId = CoordsDB.getString("currentPageId");
            CoordsLog.i("Attempting to change to page ID: " + newPageId + " from previous page ID: " + currentPageId);

            if(CoordsUtil.stringIsNotBlank(currentPageId) && ! (newPageId == "loginPage" && currentPageId == "loginPage") )
            {
                CoordsLog.i("Showing loading bar as currentPageId is not blank and we're not reloading the login page");
                CoordsUI.showLoadingBar();
            }

            CoordsDB.setString("previousPageId", currentPageId);
            CoordsDB.setString("currentPageId", newPageId);

            CoordsPages.setupPageBeforeAnimation(newPageId, currentPageId);

            var pages = $('.unscrollablePageContainer');
            pages.addClass('duringTransition');

            var pageTransitionAnimationForwards = "simpleFlipInY";
            var pageTransitionAnimationReverse = "simpleFlipInYReverse";

            var pageTransitionAnimation = pageTransitionAnimationForwards;

            if (newPageId == "loginPage")
            {
                pageTransitionAnimation = pageTransitionAnimationReverse;
            }

            $(' .unscrollablePageContainer').addClass("inactivePage").removeClass("activePage animated " + pageTransitionAnimationForwards + " " + pageTransitionAnimationReverse);
            $('#' + newPageId).removeClass("inactivePage").addClass("activePage animated " + pageTransitionAnimation);

            $('body').removeClass("loginPage aboutPage profilePage mapPage").addClass(newPageId);
            
            CoordsPages.pageActionsAfterAnimation(newPageId, currentPageId);

            pages.removeClass('duringTransition');
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    previousPageExists: function previousPageExists()
    {
        try
        {
            CoordsLog.v("CoordsPages." + CoordsLog.getInlineFunctionTrace(arguments));

            var currentPageId = CoordsDB.getString("currentPageId");
            var previousPageId = CoordsDB.getString("previousPageId");

            return !!(previousPageId.length && previousPageId != currentPageId && previousPageId != "loginPage");
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    changeToPreviousPage: function changeToPreviousPage()
    {
        try
        {
            CoordsLog.v("CoordsPages." + CoordsLog.getInlineFunctionTrace(arguments));

            var previousPageId = CoordsDB.getString("previousPageId");

            CoordsLog.d("Changing page to previous page ID: " + previousPageId);

            CoordsPages.changePage(previousPageId);
            CoordsDB.removeString("previousPageId");
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    setupPageBeforeAnimation: function setupPageBeforeAnimation(newPageId, previousPageId)
    {
        CoordsLog.v("CoordsPages." + CoordsLog.getInlineFunctionTrace(arguments));

        try
        {
            CoordsUI.closeAllPanels();
            
            if (newPageId == "loginPage")
            {
                
            }
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    pageActionsAfterAnimation: function pageActionsAfterAnimation(newPageId, previousPageId)
    {
        CoordsLog.v("CoordsPages." + CoordsLog.getInlineFunctionTrace(arguments));

        try
        {
            if (newPageId == "loginPage")
            {
                CoordsUI.hideLoadingBar();
            }
            else if (newPageId == "mapPage")
            {
                CoordsUI.hideLoadingBar();
            }
            else if (newPageId == "profilePage")
            {
                CoordsUI.hideLoadingBar();
            }


        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    }

};