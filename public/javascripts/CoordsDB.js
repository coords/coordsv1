CoordsDB = {

    getString: function getString(key)
    {
        CoordsLog.v("CoordsDB." + CoordsLog.getInlineFunctionTrace(arguments));

        if( $.type( key ) !== "string" )
        {
            key = JSON.stringify(key);
        }

        return NativeWrapper.getStorageString( key );
    },

    setString: function setString(key, value)
    {
        CoordsLog.v("CoordsDB." + CoordsLog.getInlineFunctionTrace(arguments));

        if( $.type( key ) !== "string" )
        {
            key = JSON.stringify(key);
        }

        if( $.type( value ) !== "string" )
        {
            value = JSON.stringify(value);
        }


        NativeWrapper.setStorageString( key, value );
    },

    removeString: function removeString(key)
    {
        CoordsLog.v("CoordsDB." + CoordsLog.getInlineFunctionTrace(arguments));

        if( $.type( key ) !== "string" )
        {
            key = JSON.stringify(key);
        }

        NativeWrapper.removeStorageString(key);
    },

    getObject: function getObject(key)
    {
        CoordsLog.v("CoordsDB." + CoordsLog.getInlineFunctionTrace(arguments));

        if( $.type( key ) !== "string" )
        {
            key = JSON.stringify(key);
        }

        var valueString = NativeWrapper.getStorageString( key );

        if (valueString == "") {
            valueString = "{}";
        }

        var valueObject = {};
        try {
            valueObject = $.parseJSON( valueString )
        } catch (e) {
        }

        return valueObject;
    },

    setObject: function setObject(key, value)
    {
        CoordsLog.v("CoordsDB." + CoordsLog.getInlineFunctionTrace(arguments));

        if( $.type( key ) !== "string" )
        {
            key = JSON.stringify(key);
        }

        if( $.type( value ) !== "string" )
        {
            value = JSON.stringify(value);
        }

        NativeWrapper.setStorageString( key, value );
    },

    removeObject: function removeObject(key)
    {
        CoordsLog.v("CoordsDB." + CoordsLog.getInlineFunctionTrace(arguments));

        if( $.type( key ) !== "string" )
        {
            key = JSON.stringify(key);
        }

        NativeWrapper.removeStorageString(key);
    },

    setPersistentObject: function setPersistentObject(key, value)
    {
        CoordsLog.v("CoordsDB." + CoordsLog.getInlineFunctionTrace(arguments));

        if( $.type( key ) !== "string" )
        {
            key = JSON.stringify(key);
        }

        if( $.type( value ) !== "string" )
        {
            value = JSON.stringify(value);
        }

        var persistentData = CoordsDB.getObject( "persistentData" );
        persistentData[key] = value;
        CoordsDB.setObject( "persistentData", persistentData );
    },

    getPersistentObject: function getPersistentObject(key)
    {
        CoordsLog.v("CoordsDB." + CoordsLog.getInlineFunctionTrace(arguments));

        if( $.type( key ) !== "string" )
        {
            key = JSON.stringify(key);
        }

        var persistentData = CoordsDB.getObject( "persistentData" );
        var valueString = persistentData[key];

        if (valueString == undefined || valueString == "") {
            valueString = "{}";
        }

        var valueObject = {};
        try {
            valueObject = $.parseJSON( valueString )
        } catch (e) {
        }

        return valueObject;
    },

    removePersistentObject: function removePersistentObject(key)
    {
        CoordsLog.v("CoordsDB." + CoordsLog.getInlineFunctionTrace(arguments));

        if( $.type( key ) !== "string" )
        {
            key = JSON.stringify(key);
        }

        var persistentData = CoordsDB.getObject( "persistentData" );
        delete persistentData[key];
        CoordsDB.setObject( "persistentData", persistentData );
    },

    setPersistentString: function setPersistentString(key, value)
    {
        CoordsLog.v("CoordsDB." + CoordsLog.getInlineFunctionTrace(arguments));

        if( $.type( key ) !== "string" )
        {
            key = JSON.stringify(key);
        }

        if( $.type( value ) !== "string" )
        {
            value = JSON.stringify(value);
        }

        var persistentData = CoordsDB.getObject( "persistentData" );
        persistentData[key] = value;
        CoordsDB.setObject( "persistentData", persistentData );
    },

    getPersistentString: function getPersistentString(key)
    {
        CoordsLog.v("CoordsDB." + CoordsLog.getInlineFunctionTrace(arguments));

        if( $.type( key ) !== "string" )
        {
            key = JSON.stringify(key);
        }

        var persistentData = CoordsDB.getObject( "persistentData" );
        var valueString = persistentData[key];

        if (valueString == undefined) {
            valueString = "";
        }

        return valueString;
    },

    removePersistentString: function removePersistentString(key)
    {
        CoordsLog.v("CoordsDB." + CoordsLog.getInlineFunctionTrace(arguments));

        if ($.type(key) !== "string")
        {
            key = JSON.stringify(key);
        }

        var persistentData = CoordsDB.getObject("persistentData");
        delete persistentData[key];
        CoordsDB.setObject("persistentData", persistentData);
    }

};