module.exports = function (env)
{

    var oauth = require('oauthio');

    var config = {
        key: 'xii9p-_4ZfUXQZhCmOnMFyqLgjM',
        secret: 'QqbTG8NDh9NYm2qDrbh_SaRFfRM'
    };

    env.Users = {};

    env.Users.updateUser = function(userId,user,success,fail,badrequest){
        if (env.Util.isHex(userId)){
            var ObjectId = require('mongodb').ObjectID;
            var userOId = new ObjectId(userId);
            var users = env.mongo.collection('users');
            users.update(
                { _id: userOId },
                user,
                {},
                function(err, result) {
                    if( err == null) {
                        success();
                    } else {
                        fail(err);
                    }
                });
        } else {
            badrequest();
        }
    };

    env.Users.getUserById = function (userId, success, fail, badRequest)
    {
        if (env.Util.isHex(userId))
        {
            var ObjectId = require('mongodb').ObjectID;
            var userOId = new ObjectId(userId);
            var users = env.mongo.collection('users');
            users.findOne({_id: userOId}, function (err, doc)
            {
                if (err == null)
                {
                    success(doc);
                }
                else
                {
                    fail(err);
                }
            });
        }
        else
        {
            badRequest();
        }
    };

    env.Users.getUserIdBySession = function (session)
    {
        return session.user.id;
    }

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
            .then(function (providerUserData)
            {
                var users = env.mongo.collection('users');

                var user = {
                    provider: req.params.provider,
                    providerId: providerUserData.id,
                    accessToken: req.session.oauth[req.params.provider].access_token
                };

                users.update(
                    {
                        provider: user.provider,
                        providerId: user.providerId
                    },
                    user,
                    {
                        upsert: true
                    },
                    function (err, result)
                    {
                        if (err == null)
                        {
                            console.log("oauth.js : Updated / Inserted 1 user");
                        }
                        else
                        {
                            console.log(err);
                        }
                    }
                );

                // Now we've inserted the basics about this user into the database, add the rest of the data to the session and JSON array we return to the client

                // Fetch the ID of the row we just insert/updated and stick it in the user object
                users.find({
                    provider: user.provider,
                    providerId: user.providerId
                }).toArray(function(err, docs) {
                    
                    user.id = docs[0]._id;
                    
                    user.providerUserData = providerUserData;

                    req.session.user = user;

                    res.json(user);
                });
            })
            .fail(function (e)
            {
                console.log(e);
                res.status(400).send('Code is incorrect');
            });
    });

    env.app.get('/user/session', function (req, res)
    {
        res.json(req.session);
    });

};