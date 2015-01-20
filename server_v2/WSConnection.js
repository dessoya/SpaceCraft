'use strict'

var Class			= require('class')
  , util			= require('util')
  , coroutine		= require('coroutine')
  , fs				= require('fs')
  , cerber			= require('cerber')

  , Session			= require('./Session.js')
  , User			= require('./User.js')

var re_spliter = /\s*\;\s*/, re_args_spliter = /\s*=\s*/
var connectionIterator = 1

var commands = { }
var path = cerber.daemonPath + '/WSCommands', files = fs.readdirSync(path), c = files.length; while(c--) {
	var file = path + '/' + files[c]
	if(file.substr(-3) === '.js') {
		var command = files[c].substr(0, files[c].length - 3)
		commands[command] = require(file)
	}
}

var WSConnection = Class.inherit({

	onCreate: function(server, request) {

		this.server = server
		this.id = connectionIterator ++
		coroutine(function*(params, sv) {

			var request = params.request, connection = params.connection

			// parse cookies
			var cookie = {}
			if(request.httpRequest.headers.cookie) {
				var pairs = request.httpRequest.headers.cookie.split(re_spliter)
				var i = pairs.length; while(i--) {
					var p = pairs[i].split(re_args_spliter)
					cookie[p[0]] = p[1]
				}
			}

			// try to get session
			var cookies = [], session = null, session_uuid = cookie[config.sessionCookie]
			if(config.sessionCookie in cookie) {
				session = yield Session.get(session_uuid, sv.resume3end)
			}

			// generate new session if no valid session_uuid
			if(session === null) {
				session = yield Session.generate(sv.resume3end)
				cookies.push({ name: config.sessionCookie, value: session.session_uuid, expires: new Date(Date.now()+60*1000*60*24*60), path: '/', httponly: true })
			}
			else {
				yield Session.updateLastAccess(session_uuid, sv.resume3end)
			}
			connection.session = session

			if(session.is_auth) {
				var user = yield User.get(session.user_uuid, sv.resume)
				connection.user = { username: user.username, tag: user.tag, google_uuid: user.google_uuid, facebook_uuid: user.facebook_uuid, vk_uuid: user.vk_uuid }
			}

			// accept connection
			connection.connection = request.accept(null, '*', cookies)

			// misc stuff
			connection.connection.on('close', connection.onClose.bind(connection))
			connection.connection.on('message', connection.onMessage.bind(connection))

			return true

		}, { request: request, connection: this }, function(event, data) {
			if(event === GE_ERROR) {
				console.showError(data)
			}
			else {
				// send welcome message
				var message = { command: 'welcome', is_auth: this.session.is_auth ? true : false }
				message.session_uuid = this.session.session_uuid

				if(message.is_auth) {
					message.user = this.user
				}
				else {
				}

				this.send(message)
			}
		}.bind(this))
	},

	onClose: function() {
		console.log('onClose '+this.id)
		delete this.server.connections[this.id]
	},

	onMessageSended: function() {
		console.log("sended "+this.id);	
	},

	send: function(message) {
		this.connection.send(JSON.stringify(message))
	},

	onMessage: function(message) {
		console.log("message "+this.id+" "+message.utf8Data);

		if (message.type === 'utf8') {	
			var packet;
			try {
				packet = JSON.parse(message.utf8Data);
			}
			catch(e) {
				packet = null;
			}
			if(null === packet) {
				console.log('bad message '+message.utf8Data);
			}
			else {
				console.log(util.inspect(packet,{depth:null}));
				// var method = 'command_' + packet.command
				if(packet.command in commands) {
					commands[packet.command].create(packet, this)
				}
/*
				if(method in this) {
					this[method](packet)
				}
*/
				else {
					console.err('command '+packet.command+' not found')
				}
			}
		}
	}
})

module.exports = WSConnection