CoordsRoomMap = {

    initialize: function initialize()
    {
        try
        {
            Log.v("CoordsRoomMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            if (CoordsUtil.isDefined(CoordsRoomMap.map))
            {
                CoordsRoomMap.gpsControl.deactivate();
                CoordsRoomMap.map.remove();
            }

            CoordsRoomMap.members = {};
            CoordsRoomMap.memberMarkers = [];

            CoordsRoomMap.map = L.map('roomMap', {
                zoomControl: false
            });
            
            CoordsRoomMap.map._handleGeolocationResponse = function (pos) {
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
            }).addTo(CoordsRoomMap.map);

            CoordsRoomMap.memberMarkers = new L.MarkerClusterGroup({
                iconCreateFunction: function coordsRoomMapIconCreate(cluster)
                {
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

            CoordsRoomMap.roomIcon = L.icon({
                iconUrl: (L.Browser.retina ? roomIcon : roomIcon2x),
                iconSize: [42, 42], // size of the icon
                iconAnchor: [21, 21] // point of the icon which will correspond to marker's location
            });

            CoordsRoomMap.zoomControl = new L.Control.Zoom({position: 'bottomleft'});
            CoordsRoomMap.map.addControl(CoordsRoomMap.zoomControl);

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

            CoordsRoomMap.gpsControl = new L.Control.Gps({
                autoActive: true,
                position: 'bottomleft',
                marker: gpsLocationMarker
            });
            CoordsRoomMap.map.addControl(CoordsRoomMap.gpsControl);

            CoordsRoomMap.map.addLayer(CoordsRoomMap.memberMarkers);

            CoordsRoomMap.map.on('moveend', function coordsRoomMapMoveEnd(e)
            {
                Log.v("CoordsRoomMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));

                var center = CoordsRoomMap.map.getCenter();
                var zoom = CoordsRoomMap.map.getZoom();
                CoordsRoomMap.getNearbyMembers();
                CoordsDB.setObject("CoordsRoomMapPosition", [center.lat, center.lng]);
                CoordsDB.setObject("CoordsRoomMapZoom", zoom);
            });

            // Repaints the map so that things fix themselves
            CoordsRoomMap.map.invalidateSize();
            $(window).resize(function coordsRoomMapWindowResizeEvent()
            {
                CoordsRoomMap.map.invalidateSize();
            });

            // Reload the map state from the last time
            var previousPosition = CoordsDB.getObject("CoordsRoomMapPosition");
            var previousZoom = CoordsDB.getObject("CoordsRoomMapZoom");

            if (!CoordsUtil.iterableLength(previousPosition))
            {
                previousPosition = [55.9105, -3.3235];
                previousZoom = 16;
            }

            CoordsRoomMap.map.setView(previousPosition, previousZoom);

            CoordsRoomMap.getNearbyMembers();


            CoordsUI.roomMapGpsButton.off();

            CoordsUI.roomMapGpsButton.on('click', function roomMapGpsButtonClick()
            {
                Log.v("CoordsRoomMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));

                if(CoordsUI.roomMapGpsButton.hasClass('gps_fixed'))
                {
                    CoordsUI.roomMapGpsButton.removeClass('gps_fixed').addClass('gps_not_fixed');
                    CoordsRoomMap.gpsControl.deactivate();
                }
                else
                {
                    CoordsUI.roomMapGpsButton.removeClass('gps_not_fixed').addClass('gps_fixed');
                    CoordsRoomMap.gpsControl.activate();
                }

            });

            CoordsRoomMap.gpsControl.on('gpsdisabled', function roomMapGpsControlDisabled()
            {
                Log.v("CoordsRoomMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));
                CoordsUI.roomMapGpsButton.removeClass('gps_fixed').addClass('gps_not_fixed');
            });

            CoordsRoomMap.gpsControl.on('gpslocated', function roomMapGpsControlLocated()
            {
                Log.v("CoordsRoomMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));
                CoordsUI.roomMapGpsButton.removeClass('gps_not_fixed').addClass('gps_fixed');
            });


            CoordsRoomMap.map.on('locationfound', function (e)
            {
                Log.v("CoordsRoomMap - Location found");
                CoordsUser.currentLocation = e.latlng;
                CoordsUser.currentLocationTimestamp = e.timestamp;
                CoordsUser.currentLocationAccuracy = e.accuracy;
                CoordsUser.currentLocationAltitude = e.altitude;

                CoordsEvents.emitEvent("userLocation", true, {
                    userId: CoordsUser.currentUser.dbid,
                    location: {
                        latitude: CoordsUser.currentLocation.lat,
                        longitude: CoordsUser.currentLocation.lng,
                        altitude: CoordsUser.currentLocationAltitude,
                        accuracy: CoordsUser.currentLocationAccuracy,
                        timestamp: CoordsUser.currentLocationTimestamp
                    }
                });
            });

            CoordsRoomMap.map.on('locationerror', function (e)
            {
                Log.v("CoordsRoomMap - Location Error");
                CoordsUser.currentLocation = false;
                CoordsUser.currentLocationAltitude = false;
                CoordsUser.currentLocationTimestamp = false;
                CoordsUser.currentLocationAccuracy = false;
            });

            CoordsRoomMap.setHomeMarker();
        }

        catch (e)
        {
            Log.exception(e);
        }
    },

    getNearbyMembers: function getNearbyMembers()
    {
        Log.v("CoordsRoomMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));
        var center = CoordsRoomMap.map.getCenter();

        $.ajax({
            type: "POST",
            url: "rooms/getNearbyMembers",
            data: JSON.stringify({
                'roomId': CoordsRooms.currentRoom._id,
                'lat': center.lat,
                'lng': center.lng
            }),
            contentType: "application/json",
            dataType: "json",
            success: function getNearbyMembersSuccess(members)
            {
                Log.v("CoordsRoomMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));

                Log.i(members);
                CoordsRoomMap.addMembers(members);
            },
            error: function getNearbyMembersError(x, e)
            {
                Log.v("CoordsRoomMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));
                Log.e(x);
            }
        });
    },

    setHomeMarker: function setHomeMarker(latitude, longitude)
    {
        try
        {
            Log.v("CoordsRoomMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            if (CoordsUtil.isDefined(CoordsRooms.currentRoom.loc))
            {
                var latlng = L.latLng(CoordsRooms.currentRoom.loc.lat, CoordsRooms.currentRoom.loc.lon);

                CoordsRoomMap.map.addLayer(new L.Marker(latlng, {icon: CoordsRoomMap.roomIcon}));
            }
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    addMembers: function addMembers(memberIds)
    {
        try
        {
            Log.v("CoordsRoomMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            if (CoordsUtil.iterableLength(memberIds))
            {
                $.each(memberIds, function coordsRoomMapMemberIdsIterator(index, memberId)
                {
                    if (!(memberId in CoordsRoomMap.members))
                    {
                        CoordsUsers.getUser(memberId, function addMembersGetUserSuccess(member)
                        {
                            if (CoordsUtil.isDefined(member) && CoordsUtil.isDefined(member.location) && member.location != false)
                            {
                                var memberlatlng = L.latLng(member.location.latitude, member.location.longitude);

                                var memberLocationMarker = new L.Marker(memberlatlng, {
                                    icon: new L.DivIcon({
                                        className: 'member-location-svg-marker',
                                        html: '<button class="fab userProfilePhotoContainer roomMemberMapMarker">' +
                                        '   <img alt="User Photo" src="' + member.avatar + '" class="img-responsive img-circle userProfilePhoto"/>' +
                                        '</button>',
                                        iconSize: [56, 56],
                                        iconAnchor: [28, 28]
                                    })
                                });
                                if (!(memberId in CoordsRoomMap.members))
                                {
                                    CoordsRoomMap.memberMarkers.addLayer(memberLocationMarker);
                                    member["markerInstance"] = memberLocationMarker;
                                    CoordsRoomMap.members[memberId] = member;
                                }
                            }
                        }, function coordsRoomMapGetUserErrorCallback(x, e)
                        {
                            Log.e(x);
                        })
                    }

                });
            }
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    zoomOut: function zoomOut()
    {
        try
        {
            Log.v("CoordsRoomMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));
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
            Log.v("CoordsRoomMap." + Log.getInlineFunctionTrace(arguments, arguments.callee));
        }
        catch (e)
        {
            Log.exception(e);
        }
    }

};