module.exports = function (env)
{

    var oauth = require('oauthio');

    // env.app.use(env.bodyParser());
    env.app.use(env.cookieParser());
    env.app.use(env.session({secret: 'crazysecretcat', key: 'sid', resave: true, saveUninitialized: true}));

    var config = {
        key: 'xii9p-_4ZfUXQZhCmOnMFyqLgjM',
        secret: 'QqbTG8NDh9NYm2qDrbh_SaRFfRM'
    };

    env.Users = {};
    env.Users.getUserBySession = function(provider,session){
        var users = env.mongo.collection('users');
        oauth.auth(provider, session);
        // How on earth do we get the OId?....
    };
    env.Users.getUserById = function(userId,success,fail,badRequest){
        if(env.Util.isHex(userId)) {
            var ObjectId = require('mongodb').ObjectID;
            var userOId = new ObjectId(userId);
            var users = env.mongo.collection('users');
            users.find({_id: userOId}, function (err, doc) {
                if (err == null) {
                    success(doc);
                    return doc;
                } else {
                    fail(err);
                }
            });
        } else {
            badRequest();
        }
    };

    oauth.initialize(config.key, config.secret);

    /* Endpoints */

    env.app.get('/oauth/token', function (req, res)
    {
        var token = oauth.generateStateToken(req.session);

        res.json({
            token: token
        });
    });

    env.app.get('/oauth/signin/:provider/:code', function (req, res)
    {
        oauth.auth(req.params.provider, req.session, {
            code: req.params.code
        })
            .then(function (request_object)
            {
                return request_object.me();
            })
            .then(function (user_data)
            {
                console.log("/oauth/signin session: ");
                console.log(req.session.oauth);

                console.log("/oauth/signin user_data: ");
                console.log(user_data);

                var users = env.mongo.collection('users');
                
                // Check if user has already been entered into the database
                // If the user has not been entered into the collection, we add:
                //  * id
                //  * provider
                //  * access_token
                var user = {};
                user.provider = req.params.provider;
                user.providerId = user_data.id;
                user.access_token = req.session.oauth[user.provider].access_token;
                
                console.log("Successfully signed in as new user, upserting: ");
                console.log(user);

                users.update(
                    {
                        provider: user.provider,
                        providerId: user.providerId
                    },
                    user,
                    { 
                        upsert: true 
                    },
                    function(err, result) {
                        if( err == null
                        ) {
                            console.log(result);
                            console.log("oauth.js : Inserted 1 user");
                        } else {
                            console.log(err);
                        }
                    }
                );

            })
            .then(function ()
            {
                console.log("/oauth/signin successfully authed user");

                // Here the user is authenticated, and the access token 
                // for the requested provider is stored in the session.
                res.status(200).send('The user is authenticated');
            })
            .fail(function (e)
            {
                console.log(e);
                res.status(400).send('Code is incorrect');
            });
    });

    env.app.get('/me/:provider', function (req, res)
    {
        // Here we first build a request object from the session with the auth method.
        // Then we perform a request using the .me() method.
        // This retrieves a unified object representing the authenticated user.
        // You could also use .get('/me') and map the results to fields usable from
        // the front-end (which waits for the fields 'name', 'email' and 'avatar').

        oauth.auth(req.params.provider, req.session)
            .then(function (request_object)
            {
                return request_object.me();
            })
            .then(function (user_data)
            {
                res.json(user_data);
            })
            .fail(function (e)
            {
                console.log(e);
                res.status(400).send('An error occured');
            });

    });
};