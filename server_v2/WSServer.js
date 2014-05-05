'use strict'

var Class			= require('class')
  , http			= require('http')
  , util			= require('util')
  , crypto			= require('crypto')
  , coroutine		= require('coroutine')
  , ws				= require('websocket').server

  , WSConnection	= require('./WSConnection.js')

var WSServer = Class.inherit({
	onCreate: function(config_) {

		this.http_server = http.createServer()
		this.http_server.listen(config_.port, function() { console.log('ws listen ' + config_.port) })
		this.wsServer = new ws({ httpServer: this.http_server })
		this.connections = {};
		this.wsServer.on('request', this.onRequest.bind(this))
	},

	onRequest: function(request) {
		var connection = WSConnection.create(this, request)
		this.connections[connection.id] = connection
		console.log('onConnect '+connection.id);
	}
})

module.exports = WSServer