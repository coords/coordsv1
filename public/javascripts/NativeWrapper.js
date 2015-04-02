// Check if this javascript is running inside a native application with a JavaScript Interface implementation
// named NativeWrapper. If it is use this wrapper for data storage and communication.
// Otherwise, we are running from a normal browser so we define NativeWrapper here to handle 
// functionality (data storage using HTML5 local storage, comms via php/CURL) which is normally provided by the native app. 
// This way we can use the same HTML5/JS/CSS for both the mobile apps and the online web receipt

if (typeof NativeWrapper === 'undefined')
{
    NativeWrapper = {
        
        log: function log(logLevel, logMessage)
        {
            var objectToLog = false;
            if($.type(logMessage) != "string")
            {
                objectToLog = logMessage;
                logMessage = "Object dump below:";
            }

            if(logLevel == "v")
            {
                console.log("%c" + logMessage, "color: #999999");
            }
            else if(logLevel == "d")
            {
                console.log(logMessage);
            }
            else if(logLevel == "i")
            {
                console.log("%c" + logMessage, "color: #008800");
            }
            else if(logLevel == "w")
            {
                console.warn(logMessage);
            }
            else if(logLevel == "e")
            {
                console.error(logMessage);
            }
            else
            {
                console.log(logMessage);
            }

            if(objectToLog !== false)
            {
                console.log(objectToLog);
            }
        },

        caughtError: function caughtError(errorString)
        {
            Log.v("NativeWrapper." + Log.getInlineFunctionTrace(arguments, arguments.callee));
            Log.e(errorString);
        },
        
        getStorageString: function getStorageString(key)
        {
            var stringValue = localStorage.getItem(key);

            if($.type(stringValue) == "string")
            {
                return stringValue;
            }
            else
            {
                return "";
            }
        },

        setStorageString: function setStorageString(key, value)
        {
            return localStorage.setItem(key, value);
        },

        removeStorageString: function removeStorageString(key)
        {
            return localStorage.removeItem(key);
        },

        clear: function clear()
        {
            localStorage.clear();
        },

        showProgressBar: function showProgressBar()
        {
            $('.loadingBar').removeClass('hidden');
            $('body').addClass('pushedDownByLoadingBar');
        },

        hideProgressBar: function hideProgressBar()
        {
            $('.loadingBar').addClass('hidden');
            $('.pushedDownByLoadingBar').removeClass('pushedDownByLoadingBar');
        }
        
    };

    // Populate Native Wrapper basic device and installation data in localStorage
    // This data should always be available in localStorage, as it is placed there by the extended application class

    var path = document.location.pathname;
    var webPackageVersion = path.substring(path.indexOf('/', 1)+1, path.lastIndexOf('/'));

    navigator.sayswho = (function(){
        var ua= navigator.userAgent, tem,
            M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if(/trident/i.test(M[1])){
            tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE '+(tem[1] || '');
        }
        if(M[1]=== 'Chrome'){
            tem= ua.match(/\bOPR\/(\d+)/);
            if(tem!= null) return 'Opera '+tem[1];
        }
        M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
        if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
        return M.join(' ');
    })();

}
