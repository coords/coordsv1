CoordsUsers = {

    getUser: function getUser(userId,success,error)
    {
        $.ajax({
            type: "POST",
            url: "users/get",
            data: JSON.stringify({
                'userId': userId
            }),
            contentType: "application/json",
            dataType: "json",
            success: function(user){
                success(user);
            },
            error: function(x, e){
                error(x, e);
            }
        });
        return CoordsDB.getObject("user");
    }

};