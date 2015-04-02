module.exports = function (env)
{
    env.Util = {};
    env.Util.isString = function(obj){ return typeof(obj)==="string"; };
    env.Util.isBoolean = function(obj){ return typeof(obj)==="boolean"; };
    env.Util.isNumber = function(obj){ return typeof(obj)==="number"; };
    env.Util.isUndefined = function(obj){ return typeof(obj)==="undefined"; };
    env.Util.isNull = function(obj){ return obj === null; };
    env.Util.isArray = function(obj){ return obj instanceof Array; };
    env.Util.isObjectId = function(obj){
        var ObjectId = require('mongodb').ObjectID;
        return obj instanceof ObjectId;
    };
    env.Util.isLatitude = function(obj){
        if( env.Util.isNumber(obj) )
            if( obj<90 && obj>-90 )
                return true;
        return false;
    };
    env.Util.isLongitude = function(obj){
        if( env.Util.isNumber(obj) )
            if( obj<180 && obj>-180 )
                return true;
        return false;
    };
    env.Util.isHex = function(obj){
        if( env.Util.isString(obj) ) {
            if (/^[0-9A-F]+$/i.test(obj)) {
                return true;
            }
        }
        return false;
    };
    env.Util.OIdInArray = function(oid,arr){
        if(env.Util.isArray(arr)){
            for(var i=0;i<arr.length;i++){
                if(oid.equals(arr[i])){
                    return i;
                }
            }
        }
        return -1;
    };

    /* Converts objects of any particular format into some kind of object that has ObjectIds*/
    env.Util.idToOId = function(object){
        if(env.Util.isArray(object)){
            // Is the object an array?
            var newArray = [];
            for(var i=0;i<object.length;i++){
                // iterate through each object in the array.
                var o = env.Util.idToOId(object[i]);
                if(env.Util.isObjectId(o)){
                    newArray.push(o);
                }
            }
            return newArray;
        } else if(env.Util.isString(object)) {
            // Is the object a string?
            if(env.Util.isHex(object)){
                var ObjectId = require('mongodb').ObjectID;
                return new ObjectId(object);
            } else {
                return false;
            }
        } else if(env.Util.isObjectId(object)) {
            // Is it already an object? then continue
            return object;
        } else {
            // If not, we have no idea what this is.
            return false;
        }
    };
};
