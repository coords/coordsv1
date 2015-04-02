CoordsPages = {

    setupPagesOnDocumentReady: function setupPagesOnDocumentReady()
    {
        try
        {
            Log.v("CoordsPages." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            CoordsUI.cacheElementSelectors();
            
            CoordsUI.setupEventHandlers();
            
            CoordsAuth.initialize();
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    getCurrentPageId: function getCurrentPageId()
    {
        try
        {
            Log.v("CoordsPages." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            var activePageId = $('.activePage').attr('id');

            if ( CoordsUtil.stringIsEmpty(activePageId) )
            {
                var currentPageId = CoordsDB.getString("currentPageId");
                if ( CoordsUtil.stringIsEmpty(currentPageId) )
                {
                    currentPageId = "loginPage";
                    CoordsDB.setString("currentPageId", currentPageId);
                }

                activePageId = currentPageId;
            }

            return activePageId;
        }
        catch (e)
        {
            Log.exception(e);
        }
    },
    
    changeToCorrectPageOnDocumentReady: function changeToCorrectPageOnDocumentReady()
    {
        try
        {
            Log.v("CoordsPages." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            var currentPageId = CoordsPages.getCurrentPageId();
            Log.d("Current page ID according to DB: " + currentPageId);

            var activePage = $('.activePage');

            // If there is no active page, or the currently active page is not the one the database thinks it should be, change to it
            if (activePage.length == 0 || activePage[0].id != currentPageId)
            {
                CoordsUser.checkLogin(function loginSuccess()
                {
                    CoordsUI.roomDetailsPanel.find('.welcomeMessage').removeClass('hidden');
                    CoordsUI.roomDetailsPanel.find('.roomName').addClass('hidden');
                    
                    CoordsPages.changePage(currentPageId);
                });
            }
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    changePage: function changePage(newPageId)
    {
        try
        {
            Log.v("CoordsPages." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            var currentPageId = CoordsDB.getString("currentPageId");
            Log.i("Attempting to change to page ID: " + newPageId + " from previous page ID: " + currentPageId);

            if(CoordsUtil.stringIsNotBlank(currentPageId) && ! (newPageId == "loginPage" && currentPageId == "loginPage") )
            {
                Log.i("Showing loading bar as currentPageId is not blank and we're not reloading the login page");
                CoordsUI.showLoadingBar();
            }

            CoordsDB.setString("previousPageId", currentPageId);
            CoordsDB.setString("currentPageId", newPageId);

            CoordsPages.setupPageBeforeAnimation(newPageId, currentPageId);

            var pages = $('.unscrollablePageContainer');
            pages.addClass('duringTransition');

            var pageTransitionAnimationForwards = "simpleFlipInY";
            var pageTransitionAnimationReverse = "simpleFlipInYReverse";

            var pageTransitionAnimation = "animated " + pageTransitionAnimationForwards;

            if (newPageId == "loginPage")
            {
                pageTransitionAnimation = "animated " + pageTransitionAnimationReverse;
            }
            
            if (newPageId == "loginPage" && (CoordsUtil.stringIsBlank(currentPageId) || currentPageId == "loginPage") )
            {
                pageTransitionAnimation = "";
            }

            $(' .unscrollablePageContainer').addClass("inactivePage").removeClass("activePage " + pageTransitionAnimationForwards + " " + pageTransitionAnimationReverse);

            CoordsUI[newPageId].removeClass("inactivePage").addClass("activePage " + pageTransitionAnimation);

            $('body').removeClass().addClass(newPageId);
            
            CoordsPages.pageActionsAfterAnimation(newPageId, currentPageId);

            pages.removeClass('duringTransition');
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    previousPageExists: function previousPageExists()
    {
        try
        {
            Log.v("CoordsPages." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            var currentPageId = CoordsDB.getString("currentPageId");
            var previousPageId = CoordsDB.getString("previousPageId");

            return !!(previousPageId.length && previousPageId != currentPageId && previousPageId != "loginPage");
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    changeToPreviousPage: function changeToPreviousPage()
    {
        try
        {
            Log.v("CoordsPages." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            var previousPageId = CoordsDB.getString("previousPageId");

            Log.d("Changing page to previous page ID: " + previousPageId);

            CoordsPages.changePage(previousPageId);
            CoordsDB.removeString("previousPageId");
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    setupPageBeforeAnimation: function setupPageBeforeAnimation(newPageId, previousPageId)
    {
        Log.v("CoordsPages." + Log.getInlineFunctionTrace(arguments, arguments.callee));

        try
        {
            CoordsUI.closeAllPanels();
            
            if (newPageId == "loginPage")
            {
                
            }
            else if (newPageId == "mainPage")
            {

            }
            else if (newPageId == "roomPage")
            {
                CoordsRooms.initializeRoomPage();
            }
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    pageActionsAfterAnimation: function pageActionsAfterAnimation(newPageId, previousPageId)
    {
        Log.v("CoordsPages." + Log.getInlineFunctionTrace(arguments, arguments.callee));

        try
        {
            if (newPageId == "loginPage")
            {
                CoordsUI.hideLoadingBar();
                
                $('img.coordsLogo').addClass('animated bounceInDown');
                
                $('a.btn-social').addClass('animated fadeInLeft');
            }
            else if (newPageId == "mainPage")
            {
                CoordsDiscoveryMap.initialize();

                CoordsUI.hideLoadingBar();
            }
            else if (newPageId == "roomPage")
            {
                CoordsUI.hideLoadingBar();
            }

        }
        catch (e)
        {
            Log.exception(e);
        }
    }

};