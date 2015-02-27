CoordsLog = {

    v: function v(logMessage)
    {
        if($.type(logMessage) == "string" && arguments.callee.caller && arguments.callee.caller.name)
        {
            logMessage = arguments.callee.caller.name + ": " + logMessage;
        }

        NativeWrapper.log("v", logMessage);
    },

    d: function d(logMessage)
    {
        if($.type(logMessage) == "string" && arguments.callee.caller && arguments.callee.caller.name)
        {
            logMessage = arguments.callee.caller.name + ": " + logMessage;
        }

        NativeWrapper.log("d", logMessage);
    },

    i: function i(logMessage)
    {
        if($.type(logMessage) == "string" && arguments.callee.caller && arguments.callee.caller.name)
        {
            logMessage = arguments.callee.caller.name + ": " + logMessage;
        }

        NativeWrapper.log("i", logMessage);
    },

    w: function w(logMessage)
    {
        if($.type(logMessage) == "string" && arguments.callee.caller && arguments.callee.caller.name)
        {
            logMessage = arguments.callee.caller.name + ": " + logMessage;
        }

        NativeWrapper.log("w", logMessage);
    },

    e: function e(logMessage)
    {
        if($.type(logMessage) == "string" && arguments.callee.caller && arguments.callee.caller.name)
        {
            logMessage = arguments.callee.caller.name + ": " + logMessage;
        }

        NativeWrapper.log("e", logMessage);
    },

    exception: function exception(e)
    {
        var errorString = e.stack.toString();
        NativeWrapper.caughtError(errorString);
    },

    getInlineFunctionTrace: function getInlineFunctionTrace(inputArguments)
    {
        var inlineTraceString = '';

        if( inputArguments.callee )
        {
            inlineTraceString += inputArguments.callee.name;
        }

        if(inputArguments.callee.caller && inputArguments.callee.caller.name)
        {
            inlineTraceString += " called by " + inputArguments.callee.caller.name;
        }

        if(inputArguments.length)
        {
            inlineTraceString += " with arguments: " + [].slice.apply(inputArguments).toString();
        }

        return inlineTraceString;
    }

};