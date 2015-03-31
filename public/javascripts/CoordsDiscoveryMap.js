CoordsDiscoveryMap = {

    initialize: function initialize()
    {
        try {
            CoordsLog.v("CoordsDiscoveryMap." + CoordsLog.getInlineFunctionTrace(arguments));

            if(!CoordsUtil.isDefined(CoordsDiscoveryMap.map))
            {

                CoordsDiscoveryMap.rooms = {};
                CoordsDiscoveryMap.roomMarkers = [];

                CoordsDiscoveryMap.map = L.map('discoveryMap', {
                    zoomControl: false
                });

                L.tileLayer('https://{s}.tiles.mapbox.com/v4/leifgehrmann.7eb9fffd/{z}/{x}/{y}' + (L.Browser.retina ? '@2x' : '') + '.png?access_token=pk.eyJ1IjoibGVpZmdlaHJtYW5uIiwiYSI6IjBtOXlPQk0ifQ.I_I40vLyM3KMJWAMUjKiFw', {
                    attribution: '<a href="http://www.openstreetmap.org/">OpenStreetMap</a> | <a href="https://www.mapbox.com/">MapBox</a>'
                }).addTo(CoordsDiscoveryMap.map);

                CoordsDiscoveryMap.roomMarkers = new L.MarkerClusterGroup({
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

                CoordsDiscoveryMap.roomIcon = L.icon({
                    iconUrl: (L.Browser.retina ? roomIcon : roomIcon2x),
                    iconSize: [42, 42], // size of the icon
                    iconAnchor: [21, 21] // point of the icon which will correspond to marker's location
                });

                CoordsDiscoveryMap.zoomControl = new L.Control.Zoom({position: 'bottomleft'});
                CoordsDiscoveryMap.map.addControl(CoordsDiscoveryMap.zoomControl);
                
                var gpsLocationMarker = new L.Marker(new L.latLng(0,0), {
                    icon: new L.DivIcon({
                        className: 'gps-location-svg-marker',
                        html:   '<svg class="gps_fixed square25px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
                        '<use xlink:href="/images/material.svg#gps_fixed"></use>' +
                        '</svg>',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })
                });
                
                CoordsDiscoveryMap.gpsControl = new L.Control.Gps({
                    position: 'bottomleft',
                    marker: gpsLocationMarker
                });
                CoordsDiscoveryMap.map.addControl(CoordsDiscoveryMap.gpsControl);
                
                CoordsDiscoveryMap.map.addLayer(CoordsDiscoveryMap.roomMarkers);

                CoordsDiscoveryMap.map.on('moveend', function (e) {
                    var center = CoordsDiscoveryMap.map.getCenter();
                    var zoom = CoordsDiscoveryMap.map.getZoom();
                    CoordsDiscoveryMap.getMarkers();
                    CoordsDB.setObject("CoordsDiscoveryMapPosition", [center.lat, center.lng]);
                    CoordsDB.setObject("CoordsDiscoveryMapZoom", zoom);
                });

                // Repaints the map so that things fix themselves
                CoordsDiscoveryMap.map.invalidateSize();
                $(window).resize(function () {
                    CoordsDiscoveryMap.map.invalidateSize();
                });

                // Reload the map state from the last time
                var previousPosition = CoordsDB.getObject("CoordsDiscoveryMapPosition");
                var previousZoom = CoordsDB.getObject("CoordsDiscoveryMapZoom");

                if (!CoordsUtil.iterableLength(previousPosition)) {
                    previousPosition = [55.9105, -3.3235];
                    previousZoom = 16;
                }

                CoordsDiscoveryMap.map.setView(previousPosition, previousZoom);

                CoordsDiscoveryMap.getMarkers();
                
                CoordsDiscoveryMap.gpsButton = $('button.geolocateDiscoveryMap');

                CoordsDiscoveryMap.gpsButton.off('click').on('click', function(){
                    CoordsDiscoveryMap.gpsControl._switchGps();
                    CoordsDiscoveryMap.gpsButton.removeClass('gps_fixed').addClass('gps_not_fixed');
                });
                CoordsDiscoveryMap.gpsControl.on('gpsdisabled', function(){
                    CoordsDiscoveryMap.gpsButton.removeClass('gps_fixed').addClass('gps_not_fixed');
                });
                CoordsDiscoveryMap.gpsControl.on('gpslocated', function(){
                    CoordsDiscoveryMap.gpsButton.removeClass('gps_not_fixed').addClass('gps_fixed');
                });
            }
        }

        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    getMarkers: function getMarkers() {
        var center = CoordsDiscoveryMap.map.getCenter();
        $.ajax({
            type: "GET",
            url: "rooms/nearby/" + center.lat + "/" + center.lng + "/10000/100/0",
            contentType: "application/json",
            dataType: "json",
            success: function (rooms) {
                CoordsDiscoveryMap.addRooms(rooms);
                CoordsRooms.displayNearbyRooms(rooms);
            }
        });
    },
    
    addRooms: function addRooms(rooms)
    {
        try
        {
            CoordsLog.v("CoordsDiscoveryMap." + CoordsLog.getInlineFunctionTrace(arguments));
            $.each(rooms,function(index,room){
                CoordsDiscoveryMap.addRoom(room);
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
            CoordsLog.v("CoordsDiscoveryMap." + CoordsLog.getInlineFunctionTrace(arguments));
            if(!(room._id in CoordsDiscoveryMap.rooms)){
                var latlng = L.latLng(room.loc.lat,room.loc.lon);
                var marker = new L.Marker(latlng, {icon:CoordsDiscoveryMap.roomIcon});
                
                marker.on('click', function() {
                    CoordsRooms.loadRoom(room);
                });
                
                CoordsDiscoveryMap.roomMarkers.addLayer(marker);
                CoordsDiscoveryMap.rooms[room._id] = room;
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
            CoordsLog.v("CoordsDiscoveryMap." + CoordsLog.getInlineFunctionTrace(arguments));
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
            CoordsLog.v("CoordsDiscoveryMap." + CoordsLog.getInlineFunctionTrace(arguments));
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    }

};