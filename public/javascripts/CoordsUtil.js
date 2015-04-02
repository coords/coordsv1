CoordsUtil = {

    waitForFinalEvent: function waitForFinalEvent()
    {
        var timers = {};
        return function waitForFinalEventCallback(callback, ms, uniqueId)
        {
            if (!uniqueId)
            {
                uniqueId = "Don't call this twice without a uniqueId";
            }
            if (timers[uniqueId])
            {
                clearTimeout(timers[uniqueId]);
            }
            timers[uniqueId] = setTimeout(callback, ms);
        };
    }(),

    // This will return true for a non-empty string, number or boolean value
    // It will return false for undefined itself
    isDefined: function isDefined(value)
    {
        try
        { // Check value has been passed in
            if (typeof value !== 'undefined')
            {
                // If value is "truthy" (not null, undefined, NaN, "", 0, false)
                if (value)
                {
                    // Check that value is not the string "undefined"
                    return value !== "undefined";
                }
                // If value is not "truthy", we may still consider it defined if it is boolean false or number 0
                else
                {
                    return !!(value === false || value === 0);
                }
            }

            return false;
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    stringCompare: function stringCompare(string1, string2)
    {
        if( CoordsUtil.isString(string1) && CoordsUtil.isString(string2) )
        {
            return string1 === string2;
        }
        
        return false;
    },

    stringiCompare: function stringiCompare(string1, string2)
    {
        if( CoordsUtil.isString(string1) && CoordsUtil.isString(string2) )
        {
            return string1.toUpperCase() === string2.toUpperCase();
        }

        return false;
    },
    
    stringIsEmpty: function stringIsEmpty(value)
    {
        try
        {
            return !(CoordsUtil.isDefined(value) && ( CoordsUtil.isNumber(value) || (CoordsUtil.isString(value) && value.length > 0 && value != "null") ));
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    stringIsNotEmpty: function stringIsNotEmpty(value)
    {
        return !CoordsUtil.stringIsEmpty(value);
    },

    stringIsBlank: function stringIsBlank(value)
    {
        if (CoordsUtil.stringIsEmpty(value))
        {
            return true;
        }

        if (CoordsUtil.isString(value))
        {
            value = value.replace(/\s+/g, '');

            if (CoordsUtil.stringIsEmpty(value))
            {
                return true;
            }
        }

        return false;
    },

    stringIsNotBlank: function stringIsNotBlank(value)
    {
        return !CoordsUtil.stringIsBlank(value);
    },

    isNumber: function isNumber(n)
    {
        try
        {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    isInt: function isInt(n)
    {
        try
        {
            if (!CoordsUtil.isNumber(n))
            {
                return false;
            }
            return n % 1 === 0;
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    isString: function isString(value)
    {
        try
        {
            return $.type(value) == "string";
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    isFloat: function isFloat(n)
    {
        try
        {
            if (!CoordsUtil.isNumber(n))
            {
                return false;
            }
            return n === +n && n !== (n | 0);
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    isIterable: function isIterable(obj)
    {
        try
        {
            if (!CoordsUtil.isDefined(obj))
            {
                return false;
            }

            return ( $.type(obj) == "array" || $.type(obj) == "object" );
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    countDecimalPlaces: function countDecimalPlaces(n)
    {
        try
        {
            Log.v("CoordsUtil." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            return (n.split('.')[1] || []).length;
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    iterableLength: function iterableLength(iterable)
    {
        try
        {
            Log.v("CoordsUtil." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            if (!CoordsUtil.isDefined(iterable))
            {
                return 0;
            }

            if ($.type(iterable) == "array")
            {
                return iterable.length;
            }
            else if ($.type(iterable) == "object")
            {
                return Object.keys(iterable).length;
            }
            else
            {
                return 0;
            }
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    getUnixtime: function getUnixtime()
    {
        try
        {
            Log.v("CoordsUtil." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            var ts = new Date().getTime() / 1000;
            return Math.floor(ts);
        }
        catch (e)
        {
            Log.exception(e);
        }
    },

    getObjectValues: function getObjectValues(object)
    {
        if (CoordsUtil.isIterable(object))
        {
            return $.map(object, function getObjectValuesMapCallback(v)
            {
                return v;
            });
        }
        else
        {
            return [];
        }
    },

    sortArrayByNumericObjectProperty: function sortArrayByNumericObjectProperty(inputArray, sortKey, descendingOrder)
    {
        if (CoordsUtil.iterableLength(inputArray))
        {
            inputArray.sort(function sortArrayByNumericObjectPropertySortFunction(a, b)
            {
                var aSort = parseFloat(a[sortKey]);
                var bSort = parseFloat(b[sortKey]);
                return (aSort == bSort) ? 0 : (aSort > bSort) ? 1 : -1;
            });

            if (descendingOrder != undefined && descendingOrder == true)
            {
                inputArray.reverse();
            }
        }

        return inputArray;
    },

    sortArrayByStringObjectProperty: function sortArrayByStringObjectProperty(inputArray, sortKey, descendingOrder)
    {
        inputArray.sort(function sortArrayByStringObjectPropertySortFunction(a, b)
        {
            return a[sortKey].localeCompare(b[sortKey]);
        });

        if (descendingOrder != undefined && descendingOrder == true)
        {
            inputArray.reverse();
        }

        return inputArray;
    },

    findIterableChildObjectByKeyValue: function findIterableChildObjectByKeyValue(inputIterable, childKey, childValue)
    {
        var foundChild = false;

        if (CoordsUtil.isIterable(inputIterable))
        {
            $.each(inputIterable, function inputIterableIterator(index, childObject)
            {
                if (childObject[childKey] == childObject[childValue])
                {
                    foundChild = childObject;
                    return false;
                }
            });
        }

        return foundChild;
    },

    findIterableChildObjectByCallback: function findIterableChildObjectByCallback(inputIterable, childCallback)
    {
        var foundChild = false;

        if (CoordsUtil.isIterable(inputIterable))
        {
            $.each(inputIterable, function inputIterableIterator(index, childObject)
            {
                if (childCallback(childObject))
                {
                    foundChild = childObject;
                    return false;
                }
            });
        }

        return foundChild;
    },

    getJustText: function getJustText(element)
    {
        try
        {
            Log.v("CoordsUtil." + Log.getInlineFunctionTrace(arguments, arguments.callee));

            return element.clone()
                .children()
                .remove()
                .end()
                .text();
        }
        catch (e)
        {
            Log.exception(e);
        }
    }
    
};