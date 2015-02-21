CoordsMap = {

    initialize: function initialize()
    {
        try
        {
            CoordsLog.v("CoordsMap." + CoordsLog.getInlineFunctionTrace(arguments));

            CoordsMap.map = L.map('map').setView([55.909403, -3.320699], 16);
            
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(CoordsMap.map);
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    addChatroom: function addChatroom(chatroom)
    {
        try
        {
            CoordsLog.v("CoordsMap." + CoordsLog.getInlineFunctionTrace(arguments));
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    zoomOut: function zoomOut()
    {
        try
        {
            CoordsLog.v("CoordsMap." + CoordsLog.getInlineFunctionTrace(arguments));
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    zoomIn: function zoomIn()
    {
        try
        {
            CoordsLog.v("CoordsMap." + CoordsLog.getInlineFunctionTrace(arguments));
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    }

};