module.exports = function(env){
	var server = env.http.createServer(env.app);
	var io = require('socket.io').listen(12345).listen(server);
	io.on('connection', function (socket){
		socket.emit('news',{'hello, this message':'came from this server.'});
		socket.on('my other event', function (data) {
			console.log(data);
		});
	});
}
