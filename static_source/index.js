function onLoad() {

	document.title = "\u2606 " + document.title;

	favicon = new Favicon();
	app = apps[document.domain];

	topUserMenu = TopUserMenu.create();

	ws = new wsconnection('ws://'+document.domain+':'+location.port+'/ws');

	ws.on('#connect', function() {
		/* debug */ console.log('connect');
	});

	ws.on('#close', function() {
		/* debug */ console.log('close');
		setTimeout(ws.connect.bind(ws), 700);
	});

	ws.on('#error', function(error) {
		/* debug */  console.log(error);
		setTimeout(ws.connect.bind(ws), 700);
	});

	ws.on('#anyCommands', function(message) {
		/* debug */ console.log(message);
	});

	appState = AppState.create();

	ws.connect();
	sections.start();
}