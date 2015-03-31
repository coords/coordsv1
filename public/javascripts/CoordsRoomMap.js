CoordsRoomMap = {

    initialize: function initialize()
    {
        try {
            CoordsLog.v("CoordsRoomMap." + CoordsLog.getInlineFunctionTrace(arguments));

            if(!CoordsUtil.isDefined(CoordsRoomMap.map))
            {

                CoordsRoomMap.members = {};
                CoordsRoomMap.memberMarkers = [];

                CoordsRoomMap.map = L.map('roomMap', {
                    zoomControl: false
                });

                L.tileLayer('https://{s}.tiles.mapbox.com/v4/leifgehrmann.7eb9fffd/{z}/{x}/{y}' + (L.Browser.retina ? '@2x' : '') + '.png?access_token=pk.eyJ1IjoibGVpZmdlaHJtYW5uIiwiYSI6IjBtOXlPQk0ifQ.I_I40vLyM3KMJWAMUjKiFw', {
                    attribution: '<a href="http://www.openstreetmap.org/">OpenStreetMap</a> | <a href="https://www.mapbox.com/">MapBox</a>'
                }).addTo(CoordsRoomMap.map);

                CoordsRoomMap.memberMarkers = new L.MarkerClusterGroup({
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

                CoordsRoomMap.roomIcon = L.icon({
                    iconUrl: (L.Browser.retina ? roomIcon : roomIcon2x),
                    iconSize: [42, 42], // size of the icon
                    iconAnchor: [21, 21] // point of the icon which will correspond to marker's location
                });

                CoordsRoomMap.zoomControl = new L.Control.Zoom({position: 'bottomleft'});
                CoordsRoomMap.map.addControl(CoordsRoomMap.zoomControl);
                
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
                
                CoordsRoomMap.gpsControl = new L.Control.Gps({
                    position: 'bottomleft',
                    marker: gpsLocationMarker
                });
                CoordsRoomMap.map.addControl(CoordsRoomMap.gpsControl);
                
                CoordsRoomMap.map.addLayer(CoordsRoomMap.memberMarkers);

                CoordsRoomMap.map.on('moveend', function (e) {
                    var center = CoordsRoomMap.map.getCenter();
                    var zoom = CoordsRoomMap.map.getZoom();
                    CoordsRoomMap.getMarkers();
                    CoordsDB.setObject("CoordsRoomMapPosition", [center.lat, center.lng]);
                    CoordsDB.setObject("CoordsRoomMapZoom", zoom);
                });

                // Repaints the map so that things fix themselves
                CoordsRoomMap.map.invalidateSize();
                $(window).resize(function () {
                    CoordsRoomMap.map.invalidateSize();
                });

                // Reload the map state from the last time
                var previousPosition = CoordsDB.getObject("CoordsRoomMapPosition");
                var previousZoom = CoordsDB.getObject("CoordsRoomMapZoom");

                if (!CoordsUtil.iterableLength(previousPosition)) {
                    previousPosition = [55.9105, -3.3235];
                    previousZoom = 16;
                }

                CoordsRoomMap.map.setView(previousPosition, previousZoom);

                CoordsRoomMap.getMarkers();
                
                CoordsRoomMap.gpsButton = $('button.geolocateRoomMap');

                CoordsRoomMap.gpsButton.off('click').on('click', function(){
                    CoordsRoomMap.gpsControl._switchGps();
                    CoordsRoomMap.gpsButton.removeClass('gps_fixed').addClass('gps_not_fixed');
                });
                CoordsRoomMap.gpsControl.on('gpsdisabled', function(){
                    CoordsRoomMap.gpsButton.removeClass('gps_fixed').addClass('gps_not_fixed');
                });
                CoordsRoomMap.gpsControl.on('gpslocated', function(){
                    CoordsRoomMap.gpsButton.removeClass('gps_not_fixed').addClass('gps_fixed');
                });
            }
        }

        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    getMarkers: function getMarkers() {
        var center = CoordsRoomMap.map.getCenter();
        
        /*$.ajax({
            type: "GET",
            url: "members/nearby/" + center.lat + "/" + center.lng + "/10000/100/0",
            contentType: "application/json",
            dataType: "json",
            success: function (members) {
                CoordsRoomMap.addMembers(members);
            }
        });*/
    },

    addMembers: function addmembers(members)
    {
        try
        {
            CoordsLog.v("CoordsRoomMap." + CoordsLog.getInlineFunctionTrace(arguments));
            $.each(members,function(index,room){
                CoordsRoomMap.addMember(room);
            });
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    },

    addMember: function addMember(room)
    {
        try
        {
            CoordsLog.v("CoordsRoomMap." + CoordsLog.getInlineFunctionTrace(arguments));
            if(!(room._id in CoordsRoomMap.members)){
                var latlng = L.latLng(room.loc.lat,room.loc.lon);
                var marker = new L.Marker(latlng, {icon:CoordsRoomMap.roomIcon});
                
                marker.on('click', function() {
                    // Load and display details about clicked user?
                });
                
                CoordsRoomMap.memberMarkers.addLayer(marker);
                CoordsRoomMap.members[room._id] = room;
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
            CoordsLog.v("CoordsRoomMap." + CoordsLog.getInlineFunctionTrace(arguments));
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
            CoordsLog.v("CoordsRoomMap." + CoordsLog.getInlineFunctionTrace(arguments));
        }
        catch (e)
        {
            CoordsLog.exception(e);
        }
    }

};