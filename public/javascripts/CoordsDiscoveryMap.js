CoordsDiscoveryMap = {

    initialize: function initialize()
    {
        try
        {
            Log.v("CoordsDiscoveryMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            if (CoordsUtil.isDefined(CoordsDiscoveryMap.map))
            {
                CoordsDiscoveryMap.gpsControl.deactivate();
                CoordsDiscoveryMap.map.remove();
            }

            CoordsDiscoveryMap.rooms = {};
            CoordsDiscoveryMap.roomMarkers = [];

            CoordsDiscoveryMap.map = L.map('discoveryMap', {
                zoomControl: false
            });

            CoordsDiscoveryMap.map._handleGeolocationResponse = function (pos) {
                var lat = pos.coords.latitude,
                    lng = pos.coords.longitude,
                    latlng = new L.LatLng(lat, lng),

                    latAccuracy = 180 * pos.coords.accuracy / 40075017,
                    lngAccuracy = latAccuracy / Math.cos(L.LatLng.DEG_TO_RAD * lat),

                    bounds = L.latLngBounds(
                        [lat - latAccuracy, lng - lngAccuracy],
                        [lat + latAccuracy, lng + lngAccuracy]),

                    options = this._locateOptions;

                if (options.setView) {
                    var zoom = Math.min(this.getBoundsZoom(bounds), options.maxZoom);
                    this.setView(latlng, zoom);
                }

                var data = {
                    latlng: latlng,
                    altitude: pos.coords.altitude,
                    bounds: bounds,
                    timestamp: pos.timestamp
                };

                for (var i in pos.coords) {
                    if (typeof pos.coords[i] === 'number') {
                        data[i] = pos.coords[i];
                    }
                }

                this.fire('locationfound', data);
            };
            
            L.tileLayer('https://{s}.tiles.mapbox.com/v4/leifgehrmann.7eb9fffd/{z}/{x}/{y}' + (L.Browser.retina ? '@2x' : '') + '.png?access_token=pk.eyJ1IjoibGVpZmdlaHJtYW5uIiwiYSI6IjBtOXlPQk0ifQ.I_I40vLyM3KMJWAMUjKiFw', {
                attribution: '<a href="http://www.openstreetmap.org/">OpenStreetMap</a> | <a href="https://www.mapbox.com/">MapBox</a>'
            }).addTo(CoordsDiscoveryMap.map);

            CoordsDiscoveryMap.roomMarkers = new L.MarkerClusterGroup({
                iconCreateFunction: function coordsDiscoveryMapIconCreateFunction(cluster)
                {
                    Log.v("CoordsDiscoveryMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));

                    var childCount = cluster.getChildCount();

                    var c = ' marker-cluster-';
                    if (childCount < 10)
                    {
                        c += 'small';
                    }
                    else if (childCount < 100)
                    {
                        c += 'medium';
                    }
                    else
                    {
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

            var gpsLocationMarker = new L.Marker(new L.latLng(0, 0), {
                icon: new L.DivIcon({
                    className: 'gps-location-svg-marker',
                    html: '<svg class="gps_fixed square25px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
                    '<use xlink:href="/images/material.svg#gps_fixed"></use>' +
                    '</svg>',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            }).setZIndexOffset(-100);

            CoordsDiscoveryMap.gpsControl = new L.Control.Gps({
                autoActive: true,
                position: 'bottomleft',
                marker: gpsLocationMarker
            });
            CoordsDiscoveryMap.map.addControl(CoordsDiscoveryMap.gpsControl);

            CoordsDiscoveryMap.map.addLayer(CoordsDiscoveryMap.roomMarkers);

            CoordsDiscoveryMap.map.on('moveend', function coordsDiscoveryMapMoveEndEvent(e)
            {
                Log.v("CoordsDiscoveryMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));

                var center = CoordsDiscoveryMap.map.getCenter();
                var zoom = CoordsDiscoveryMap.map.getZoom();
                CoordsDiscoveryMap.getMarkers();
                CoordsDB.setObject("CoordsDiscoveryMapPosition", [center.lat, center.lng]);
                CoordsDB.setObject("CoordsDiscoveryMapZoom", zoom);
            });

            // Repaints the map so that things fix themselves
            CoordsDiscoveryMap.map.invalidateSize();

            $(window).resize(function coordsDiscoveryMapWindowResizeEvent()
            {
                Log.v("CoordsDiscoveryMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));
                CoordsDiscoveryMap.map.invalidateSize();
            });

            // Reload the map state from the last time
            var previousPosition = CoordsDB.getObject("CoordsDiscoveryMapPosition");
            var previousZoom = CoordsDB.getObject("CoordsDiscoveryMapZoom");

            if (!CoordsUtil.iterableLength(previousPosition))
            {
                previousPosition = [55.9105, -3.3235];
                previousZoom = 16;
            }

            CoordsDiscoveryMap.map.setView(previousPosition, previousZoom);

            CoordsDiscoveryMap.getMarkers();

            CoordsUI.discoveryMapGpsButton.off();

            CoordsUI.discoveryMapGpsButton.on('click', function discoveryMapGpsButtonClick()
            {
                Log.v("CoordsDiscoveryMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));
                
                if(CoordsUI.discoveryMapGpsButton.hasClass('gps_fixed'))
                {
                    CoordsUI.discoveryMapGpsButton.removeClass('gps_fixed').addClass('gps_not_fixed');
                    CoordsDiscoveryMap.gpsControl.deactivate();
                }
                else
                {
                    CoordsUI.discoveryMapGpsButton.removeClass('gps_not_fixed').addClass('gps_fixed');
                    CoordsDiscoveryMap.gpsControl.activate();
                }
                
            });
            
            CoordsDiscoveryMap.gpsControl.on('gpsdisabled', function discoveryMapGpsControlDisabled()
            {
                Log.v("CoordsDiscoveryMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));
                CoordsUI.discoveryMapGpsButton.removeClass('gps_fixed').addClass('gps_not_fixed');
            });
            
            CoordsDiscoveryMap.gpsControl.on('gpslocated', function discoveryMapGpsControlLocated()
            {
                Log.v("CoordsDiscoveryMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));
                CoordsUI.discoveryMapGpsButton.removeClass('gps_not_fixed').addClass('gps_fixed');
            });

            CoordsDiscoveryMap.map.on('locationfound', function discoveryMapLocationFound(e)
            {
                CoordsUser.currentLocation = e.latlng;
                CoordsUser.currentLocationTimestamp = e.timestamp;
                CoordsUser.currentLocationAccuracy = e.accuracy;
                CoordsUser.currentLocationAltitude = e.accuracy;
            });

            CoordsDiscoveryMap.map.on('locationerror', function discoveryMapLocationError(e)
            {
                CoordsUser.currentLocation = false;
                CoordsUser.currentLocationTimestamp = false;
                CoordsUser.currentLocationAccuracy = false;
                CoordsUser.currentLocationAltitude = false;
            });
        }

        catch (e)
        {
            Log.exception(e);
        }
    },

    getMarkers: function getMarkers()
    {
        Log.v("CoordsDiscoveryMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));
        var center = CoordsDiscoveryMap.map.getCenter();
        $.ajax({
            type: "GET",
            url: "rooms/nearby/" + center.lat + "/" + center.lng + "/10000/100/0",
            contentType: "application/json",
            dataType: "json",
            success: function coordsDiscoveryMapGetNearbyRoomsSuccess(rooms)
            {
                CoordsDiscoveryMap.addRooms(rooms);
                CoordsRooms.displayNearbyRooms(rooms);
            }
        });
    },

    addRooms: function addRooms(rooms)
    {
        try
        {
            Log.v("CoordsDiscoveryMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));
            $.each(rooms, function (index, room)
            {
                CoordsDiscoveryMap.addRoom(room);
            });
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    addRoom: function addRoom(room)
    {
        try
        {
            Log.v("CoordsDiscoveryMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));
            if (!(room._id in CoordsDiscoveryMap.rooms))
            {
                var latlng = L.latLng(room.loc.lat, room.loc.lon);
                var marker = new L.Marker(latlng, {icon: CoordsDiscoveryMap.roomIcon}).bindPopup('' +
                '<div class="marker-room-head">' +
                room.name +
                '</div>' +
                '<div class="marker-room-body">' +
                '<div class="marker-room-distance"></div>' +
                '<div class="marker-room-users"></div>' +
                '<button class="btn btn-primary marker-room-enter-button">Enter Room</button>' +
                '</div>');
                console.log(marker);
                marker.on('click', function ()
                {
                    var user_count = 1;
                    if (CoordsUtil.iterableLength(room.usersJoined))
                    {
                        if (room.usersJoined.length > 3)
                        {
                            $(".marker-room-users").width((30 + 10) * 3);
                        }
                        $.each(room.usersJoined, function coordsDiscoveryMapAddRoomUsersJoinedIterator(index, userId)
                        {
                            if (user_count > 5 && room.usersJoined.length > 6)
                            {
                                $(".marker-room-users").append('' +
                                '<div class="marker-room-user marker-room-user-more">' +
                                '+' + (room.usersJoined.length - user_count) +
                                '</div>');
                                return true;
                            }
                            $(".marker-room-users").append('' +
                            '<div class="marker-room-user marker-room-user-' + userId + '">' +
                            '<img src="images/coords_logo.svg" class="marker-room-user-avatar"/>' +
                            '</div>');
                            CoordsUsers.getUser(userId, function (user)
                            {
                                if (user != undefined)
                                {
                                    var marker_room_user = $(".marker-room-user-" + userId);
                                    marker_room_user.find(".marker-room-user-avatar").attr("src", user.avatar);
                                }
                            });
                            user_count++;
                        });
                    }
                    else
                    {
                        $(".marker-room-users").html("No Users found");
                    }

                    $(".marker-room-enter-button").click(function ()
                    {
                        CoordsRooms.enterRoom(room);
                    });

                    CoordsDiscoveryMap.fixPopUpWidth();
                });

                CoordsDiscoveryMap.roomMarkers.addLayer(marker);
                CoordsDiscoveryMap.rooms[room._id] = room;
            }
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    fixPopUpWidth: function fixPopUpWidth()
    {
        Log.v("CoordsDiscoveryMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));

        var popup = $("#discoveryMap").find('div.leaflet-popup');
        popup.find("div.leaflet-popup-content").css({width: ''});
        var width = popup.width();
        popup.css({left: "-" + (width / 2) + "px"});
    },

    zoomOut: function zoomOut()
    {
        try
        {
            Log.v("CoordsDiscoveryMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    zoomIn: function zoomIn()
    {
        try
        {
            Log.v("CoordsDiscoveryMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));
        }
        catch (e)
        {
            Log.exception(e);
        }
    }

};