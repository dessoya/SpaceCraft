
AppState.init = Class.inherit({
	onCreate: function() {
		ws.on('welcome', function(message) {
			/* debug */ console.log('command welcome');
			if(message.is_auth) {
				appState.setState('authed', message);
			}
			else {
				appState.setState('unauthed', message);
			}
		});
	}
})
