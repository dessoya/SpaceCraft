'use strict'

var Class			= require('class')
  , coroutine		= require('coroutine')
  , uuid			= require('uuid')
  , util			= require('util')
  , fs				= require('fs')

var idIterator = 0

var items = [{

	errorReporter: function(err, result) {
		if(err) {
			console.showError(err)
		}
	},

	send: function(message, callback) {
	    console.log('send command')
	    console.log(message)
		this.connection.send(JSON.stringify(message), callback)
	},

	onCreate: function(httpserver, connection) {

	    this.id = idIterator ++
	    console.log('connection ' + this.id + ' created')
		this.httpserver = httpserver

		// this.binded_onMethodCompleted = this.onMethodCompleted.bind(this)

		// соединение по веб-сокету
		this.connection = connection
	
		// хост соедиения
		this.host = connection.socket.remoteAddress.toString() + ':' + connection.socket.remotePort.toString()

		this.auth = false

		connection.on('message', this.onMessage.bind(this))
		connection.on('close', this.onClose.bind(this))
		connection.on('error', this.onError.bind(this))

	},

	close: function(code, text) {

	    models.Session.unlock(this.session_uuid)

		if (this.connection) {
		    console.log('connection ' + this.id + ' closed')
			this.connection.close(code, text)
			delete this.connection
			this.httpserver.deleteWSConnection(this)
		}
	},

	onClose: function(code, desc) {
	    console.log('onClose ' + this.id)
		this.close(400, "bye bitch")
	},

	onError: function(err) {
	    console.log('onError' + this.id)
		this.close(400, "bye bitch")
	},

	onMessage: function(message) {

	    var packet = null
		if (message.type === 'utf8') {
	    	try {
	   			packet = JSON.parse(message.utf8Data)
			}
			catch (err) {
				packet = null
			}
		}

		if(packet) {
			if(!packet.command || (packet.command !== 'ping')) {
		    	console.log('onMessage ' + util.inspect(packet,{depth:null}))
		    }
			if(packet.command) {
				var method = 'command_' + packet.command
				if(method in this) {
					this[method](packet, this.errorReporter)
				}
				else {
					console.log('command ' + packet.command + ' absent')
				}
			}
			else {
				console.log('no command in packet')
			}
		}
		else {
			console.log('empty packet')
		}

		// this.close(400, "die bitch")
	},

}]

var files = fs.readdirSync('./wscommands')
for(var i = 0, l = files.length; i < l; i++) {
    var file = files[i]
    if(file[0] == '.') continue
	var stat = fs.statSync('./wscommands/' + file)
	if(stat.isFile() && '.js' === file.substr(-3)) {
		items.push(require('./wscommands/' + file))
	}
}


var WSConnection = module.exports = Class.inherit.apply(Class, items)
