function init_oauthio() {
	OAuth.initialize(credentials.key);
}

function retrieve_token(callback) {
	$.ajax({
		url: '/oauth/token',
		success: function(data, status) {
			callback(null, data.token);
		},
		error: function(data) {
			callback(data);
		}
	});
}

function authenticate(provider, token, callback) {
	OAuth.popup(provider, {
		state: token,
		// Google requires the following field 
		// to get a refresh token
		authorize: {
		    approval_prompt: 'force'
		}
	})
		.done(function(r) {
			$.ajax({
				url: '/oauth/signin',
				method: 'POST',
				data: {
					code: r.code
				},
				success: function(data, status) {
					callback(null, data);
				},
				error: function(data) {
					callback(data);
				}
			});
		})
		.fail(function(e) {
			console.log(e);
		});
}

function retrieve_user_info(callback) {
	var provider =  $.cookie("provider");

	$.ajax({
		url: '/me/' + provider,
		success: function (data, status) {
			callback(data);
		},
		error: function (data) {

		}
	});
}

function authenticateWithProvider(provider) {
	$.cookie("provider", provider);

	init_oauthio();
	retrieve_token(function(err, token) {
		authenticate(provider, token, function(err) {
			if (!err) {
				retrieve_user_info(function(user_data) {
					$('#name_box').html(user_data.name)
					$('#email_box').html(user_data.email);
					$('#img_box').attr('src', user_data.avatar);
				});
			}
		});
	});
}

$('#facebook_button').click(function() {
	authenticateWithProvider('facebook');
});

$('#github_button').click(function() {
        authenticateWithProvider('github');
});

