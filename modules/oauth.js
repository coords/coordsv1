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