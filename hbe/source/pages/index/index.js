
currentLang = 'ru';

applyLabels({

	'sections/main': {
		ru: 'Добро пожаловать в игру Space Craft'
	}

});

Sections.Main = Class.inherit({

	pattern: 'main',

	onCreate: function() {
	},

	start: function() {
	},

	activate: function() {
	    view_cont.innerHTML = _l('sections/main');
	},

	deactivate: function() {
	}
});

Sections.Logout = Class.inherit({

	pattern: 'logout',

	onCreate: function() {
	},

	start: function() {
	},

	activate: function() {
		ws.send({ command: 'logout' })
		this.sections.setSection('main')
	},

	deactivate: function() {
	}
});


function onLoad() {

	ws = WSConnection.create('ws://' + document.domain + (location.port ? ':' + location.port : '') + '/ws', 'snapshot-full-refresh');

	sections = Sections.create();
	sections.addSection(Sections.Main.create());
	sections.addSection(Sections.Logout.create());
	sections.addSection(Sections.Start.create());
	sections.addSection(Sections.About.create());

	authMenu = AuthMenu.create();
	authMenu.bind('#usermenu');

	authMenu.setParams({ connecting: true })
	authMenu.rePlace();

	// ws = WSConnection.create('%wsserver%', 'snapshot-full-refresh');

	menu = Menu.create(ws, '#menu_cont');

	var connectCount = 0
	ws.on('#anyCommands', function(message) {
		if(message.command !== 'pong') {
			console.log(message)
	    }
	})

	ws.on('#close', function() {

		authMenu.setParams({ connecting: true })
		authMenu.rePlace();

		connectCount ++
		console.log('ws close')
		setTimeout(function() {
			ws.connect();
		}, connectCount < 10 ? 350 : 5000)
	})
	
	ws.on('#error', function(error) {
		console.log('ws error')
		console.log(error)
	})

	ws.on('#connect', function() {
		connectCount = 0
		ws.send({ command: 'auth', session_uuid: cookie('%session_uuid_cookie%') }) 
	})

	ws.on('auth', function(message) {

		if(message.session_uuid != cookie('%session_uuid_cookie%')) {
			cookie('%session_uuid_cookie%', message.session_uuid, { expires: 7 } )
		}

		var params = {
			session_uuid: message.session_uuid,
			methods: message.auth_methods,
			authservice: message.authservice,
			auth: message.auth,
			username: message.username,
			auth_from: message.auth_from
		};

		authMenu.setParams(params)
		authMenu.rePlace();

		sections.start();
	})

	ws.on('logout', function(message) {
		
		var params = {
			session_uuid: message.session_uuid,
			methods: message.auth_methods,
			authservice: message.authservice,
			auth: false
		};

		authMenu.setParams(params)
		authMenu.rePlace();

	})

	ws.on('pong', function(message) {
		ws.pong_time = Date.now()		
	})

	ws.connect();
	setInterval(function() {
		if(ws.connected) {
			ws.send({ command: 'ping' })
		}
	}, 5000)


    // console.log( cookie('key1', 'test') )
}