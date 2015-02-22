module.exports = function (env)
{

    // env.app.use(env.bodyParser());
    env.app.use(env.express.json());
    env.app.use(env.express.urlencoded());

    /* Endpoints */

    /**
     * Creates a new room, with a variety of properties
     * @requires name, latitude, longitude
     * @optional private, passphrase
     * @return a json of either the unique mongo-db id of the room or a false success
     */
    env.app.post('/rooms/create', function(req, res) {
        /*var name = req.body.name,
            private = req.body.private,
            passphrase = req.body.passphrase,
            latitude = req.body.latitude,
            longitude = req.body.longitude;*/
        // ...
        res.status(200).json({

        });
    });

    /**
     * Returns the properties of the mongo-db connection. This won't
     * be used for anything I think, since all the publically available
     * information will be already available from /rooms/nearby
     * @requires mongodb-id
     * @return a json object of all the properties of the room
     */
    env.app.get('/rooms/read', function (req, res)
    {
        /*var id = req.body.id,
            passphrase = req.body.passphrase;*/
        // ...
        res.status(200).json({
        });
    });

    /**
     * Updates the properties of an existing room.
     * @requires mongodb-id
     * @return a json object, with success defined as true or false
     */
    env.app.post('/rooms/update', function(req, res) {
        /*var name = req.body.name,
            color = req.body.color;*/
        // ...
        res.status(200).json({

        });
    });

    /**
     * Deletes the room from the map and the database, including associated message. This is permanent
     * @requires mongodb-id
     * @return a json object, with success defined as true or false
     */
    env.app.post('/rooms/delete', function(req, res) {
       /* var name = req.body.name,
            color = req.body.color;*/
        // ...
        res.status(200).json({

        });
    });

    /**
     * Looks up nearby rooms
     * @requires latitude, longitude
     * @optional radius
     * @return a json list of rooms, with latitude, longitude, private, and name
     */
    env.app.get('/rooms/nearby', function (req, res)
    {
        /*var latitude = req.body.latitude,
         longitude = req.body.longitude;*/
        // ...
        res.status(200).json({

        });
    });

    /**
     * Enters the user into the room. This way, the user won't need to reconnect again any time soon.
     * @requires mongodb id
     * @optional passphrase
     * @return a json object, with a success response of either true or false
     */
    env.app.get('/rooms/enter', function (req, res)
    {
        /*var latitude = req.body.latitude,
         longitude = req.body.longitude;*/
        // ...
        res.status(200).json({

        });
    });

    /**
     * Disassociates the user from the room
     * @requires mongodb id
     * @return a json object, with a success response of either true or false
     */
    env.app.get('/rooms/leave', function (req, res)
    {
        /*var latitude = req.body.latitude,
         longitude = req.body.longitude;*/
        // ...
        res.status(200).json({

        });
    });

};