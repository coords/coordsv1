CoordsUI = {
    
    showLoadingBar: function showLoadingBar()
    {
        try
        {
            CoordsLog.v("CoordsUI." + CoordsLog.getInlineFunctionTrace(arguments));

            NativeWrapper.showProgressBar();
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    hideLoadingBar: function hideLoadingBar()
    {
        try
        {
            CoordsLog.v("CoordsUI." + CoordsLog.getInlineFunctionTrace(arguments));

            NativeWrapper.hideProgressBar();
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    },
    
    openPanel: function openPanel(panelId)
    {
        CoordsLog.v("CoordsUI." + CoordsLog.getInlineFunctionTrace(arguments));

        $('#' + panelId).removeClass("inactivePanel").addClass("activePanel");
        $('#panelContentOverlay').removeClass("hidden");

        CoordsUI.hideLoadingBar();
    },

    closePanel: function closePanel(panelId)
    {
        CoordsLog.v("CoordsUI." + CoordsLog.getInlineFunctionTrace(arguments));

        var panelToClose = $('#' + panelId);
        if( panelToClose.hasClass("activePanel") )
        {
            panelToClose.removeClass("activePanel").addClass("inactivePanel");
            $('#panelContentOverlay').addClass("hidden");
        }
    },

    closeAllPanels: function closeAllPanels()
    {
        CoordsLog.v("CoordsUI." + CoordsLog.getInlineFunctionTrace(arguments));

        $('.activePanel').each(function activePanelIterator()
        {
            CoordsUI.closePanel(this.id);
        });
    }
    
};