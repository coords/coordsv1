CoordsMessenger = {

    init: function init(message){
        try
        {
            CoordsLog.v("CoordsMessenger." + CoordsLog.getInlineFunctionTrace(arguments));
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    addMessage: function addMessage(message)
    {
        try
        {
            CoordsLog.v("CoordsComms." + CoordsLog.getInlineFunctionTrace(arguments));
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    }

};