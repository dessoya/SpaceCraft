'use strict'

var Class		= require('class')
  , coroutine	= require('coroutine')
  , uuid		= require('uuid')


echoObject.on('user logged', function(message) {
    for(var i = 0, c = httpserver.connections, l = c.length; i < l; i++) {
    	c[i].checkForDisconnect(message.user_uuid, message.connection_id)
    }	
})

var methods = [
	{ name: 'vk' },
	{ name: 'facebook' }
]

var Command = module.exports = Class.inherit({

    checkForDisconnect: function(user_uuid, connection_id) {
        // console.log('user_uuid ' + this.user_uuid + ' session_uuid ' + this.session_uuid + ' from user_uuid ' + user_uuid + ' session_uuid ' + session_uuid)
		if(this.user_uuid && this.user_uuid !== null && this.user_uuid === user_uuid) {
			if(this.id !== connection_id) {
				this.logout(this.errorReporter)
			}
		}
    },

    logout: coroutine.method(function*(connection, g) {

	    console.log('logout')
	    var session = yield models.Session.create(connection.session_uuid, true, g.resume)
	    yield session.update({ user_uuid: null, is_auth: null, auth_method: null }, g.resume)
        connection.user_uuid = null
        connection.auth = false

	    var command = {
	    	command:		'logout',
	    	authservice:	'http://ilion-clan.org:11500',
	    	session_uuid:	session.uuid,
	    	auth_methods:	methods
	    }

    	yield connection.send(command, g.resume)
		yield connection.sendMainMenu(g.resume)
    }),

	command_auth: coroutine.method(function*(connection, packet, g) {
	   
	    var session = yield models.Session.create(packet.session_uuid, true, g.resume)
	    if(!session.valid) {
	    	yield session.new(g.resume)
	    }

	    while(true) {
	    	var lock = yield session.lock(g.resume)
	    	console.log('session_uuid ' + session.uuid + ' lock ' + lock)
	    	if(lock) break
    		yield session.new(g.resume)
	    }

	    connection.auth = session.is_auth ? true : false

	    var command = {
	    	command:		'auth',
	    	authservice:	'http://ilion-clan.org:11500',
	    	auth:			connection.auth,
	    	session_uuid:	session.uuid
	    }

	    if(connection.auth) {

	    	var user = yield models.User.create('uuid', session.user_uuid, g.resume)
	    	command.username = user.name
	    	command.auth_methods = [ ]

	    	for(var i = 0, l = methods.length; i < l; i++) {
	    		var method = methods[i]
	    		var key = method.name + '_uuid'
	    		if(user[key] === null) {
	    			command.auth_methods.push( method )
	    		}
	    	}

	    	connection.user_uuid = user.uuid
	    }
	    else {
	    	command.auth_methods = methods
	    }

	    connection.session_uuid = session.uuid

	    yield connection.send(command, g.resume)
	    if(connection.auth) {
			echo('user logged', { user_uuid: connection.user_uuid, connection_id: connection.id })
		}

		yield connection.sendMainMenu(g.resume)
	}),

	sendMainMenu: coroutine.method(function*(connection, g) {

		console.log('sendMainMenu')

		if(connection.auth) {
		    yield connection.send({ command: 'mainmenu_composition', items: [
		    	  { titleLabel: 'main', hash: 'main' }
		    	, { titleLabel: 'start', hash: 'start' }
		    	, { titleLabel: 'about', hash: 'about' }
		    ] }, g.resume)
		}
		else {
		    yield connection.send({ command: 'mainmenu_composition', items: [
		    	  { titleLabel: 'main', hash: 'main' }
		    	, { titleLabel: 'about', hash: 'about' }
		    ] }, g.resume)
		}		
	}),

	command_ping: coroutine.method(function*(connection, packet, g) {
		connection.last_access = uuid.v1()
		yield connection.send({ command: 'pong' }, g.resume)
	}),

	command_logout: coroutine.method(function*(connection, packet, g) {
	    console.log('command_logout')
		yield connection.logout(g.resume)
	})

})