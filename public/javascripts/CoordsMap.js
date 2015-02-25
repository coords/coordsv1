CoordsMap = {

    initialize: function initialize()
    {
        try
        {
            CoordsLog.v("CoordsMap." + CoordsLog.getInlineFunctionTrace(arguments));

            CoordsMap.map = L.map('map').setView([55.909403, -3.320699], 16);
            
            L.tileLayer('https://{s}.tiles.mapbox.com/v4/leifgehrmann.7eb9fffd/{z}/{x}/{y}'+(L.Browser.retina ? '@2x': '')+'.png?access_token=pk.eyJ1IjoibGVpZmdlaHJtYW5uIiwiYSI6IjBtOXlPQk0ifQ.I_I40vLyM3KMJWAMUjKiFw', {
                attribution: "<a href='https://www.mapbox.com/about/maps/' target='_blank'>&copy; Mapbox &copy; OpenStreetMap</a> <a class='mapbox-improve-map' href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a>"
            }).addTo(CoordsMap.map);

            CoordsMap.map.addControl( new L.Control.Gps() );
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