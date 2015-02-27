CoordsMap = {

    initialize: function initialize()
    {
        try {
            CoordsLog.v("CoordsMap." + CoordsLog.getInlineFunctionTrace(arguments));

            CoordsMap.rooms = {};
            CoordsMap.roomMarkers = [];

            if(!CoordsUtil.isDefined(CoordsMap.map))
            {
                CoordsMap.map = L.map('map', {
                    zoomControl: false
                });

            L.tileLayer('https://{s}.tiles.mapbox.com/v4/leifgehrmann.7eb9fffd/{z}/{x}/{y}' + (L.Browser.retina ? '@2x' : '') + '.png?access_token=pk.eyJ1IjoibGVpZmdlaHJtYW5uIiwiYSI6IjBtOXlPQk0ifQ.I_I40vLyM3KMJWAMUjKiFw', {
                attribution: '<a href="http://www.openstreetmap.org/">OpenStreetMap</a> | <a href="https://www.mapbox.com/">MapBox</a>'
            }).addTo(CoordsMap.map);

                CoordsMap.roomMarkers = new L.MarkerClusterGroup({
                    iconCreateFunction: function (cluster) {
                        var childCount = cluster.getChildCount();

                        var c = ' marker-cluster-';
                        if (childCount < 10) {
                            c += 'small';
                        } else if (childCount < 100) {
                            c += 'medium';
                        } else {
                            c += 'large';
                        }

                        return new L.DivIcon({
                            html: '<div><span><strong>' + childCount + '</strong></span></div>',
                            className: 'marker-cluster' + c,
                            iconSize: new L.Point(40, 40)
                        });
                    }
                });

                var roomIcon = 'images/chat-icon@2x.png';
                var roomIcon2x = 'images/chat-icon.png';

                CoordsMap.roomIcon = L.icon({
                    iconUrl: (L.Browser.retina ? roomIcon : roomIcon2x),
                    iconSize: [42, 42], // size of the icon
                    iconAnchor: [21, 21] // point of the icon which will correspond to marker's location
                });

                CoordsMap.map.addControl(new L.Control.Gps({position: 'topright'}));
                CoordsMap.map.addControl(new L.Control.Zoom({position: 'topright'}));
                CoordsMap.map.addLayer(CoordsMap.roomMarkers);

                var getMarkers = function () {
                    var center = CoordsMap.map.getCenter();
                    $.ajax({
                        type: "GET",
                        url: "rooms/nearby/" + center.lat + "/" + center.lng + "/10000/100/0",
                        contentType: "application/json",
                        dataType: "json",
                        success: function (rooms) {
                            CoordsMap.addRooms(rooms);
                            CoordsRooms.displayNearbyRooms(rooms);

                        }
                    });
                };

                CoordsMap.map.on('moveend', function (e) {
                    var center = CoordsMap.map.getCenter();
                    var zoom = CoordsMap.map.getZoom();
                    getMarkers();
                    CoordsDB.setObject("coordsMapPosition", [center.lat, center.lng]);
                    CoordsDB.setObject("coordsMapZoom", zoom);
                });

                // Repaints the map so that things fix themselves
                CoordsMap.map.invalidateSize();
                $(window).resize(function () {
                    CoordsMap.map.invalidateSize();
                });

                // Reload the map state from the last time
                var previousPosition = CoordsDB.getObject("coordsMapPosition");
                var previousZoom = CoordsDB.getObject("coordsMapZoom");

                if (!CoordsUtil.iterableLength(previousPosition)) {
                    previousPosition = [55.9105, -3.3235];
                    previousZoom = 16;
                }

                CoordsMap.map.setView(previousPosition, previousZoom);

                getMarkers();

            }
        }

        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    addRooms: function addRooms(rooms)
    {
        try
        {
            CoordsLog.v("CoordsMap." + CoordsLog.getInlineFunctionTrace(arguments));
            $.each(rooms,function(index,room){
                CoordsMap.addRoom(room);
            });
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    addRoom: function addRoom(room)
    {
        try
        {
            CoordsLog.v("CoordsMap." + CoordsLog.getInlineFunctionTrace(arguments));
            if(!(room._id in CoordsMap.rooms)){
                var latlng = L.latLng(room.loc.lat,room.loc.lon);
                var marker = new L.Marker(latlng, {icon:CoordsMap.roomIcon});
                
                marker.on('click', function() {
                    CoordsRooms.loadRoom(room);
                });
                
                CoordsMap.roomMarkers.addLayer(marker);
                CoordsMap.rooms[room._id] = room;
            }
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