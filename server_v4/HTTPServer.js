'use strict'

var Class			= require('class')
  , Phoenix			= require('phoenix')
  , WebSocketServer = require('websocket').server
  , WSConnection	= require('./WSConnection.js')
  , coroutine		= require('coroutine')

var HTTPServer = module.exports = Class.inherit({

	errorReporter: function(err, result) {
		if(err) {
			console.showError(err)
		}
	},

	onCreate: function(config) {

	    this.cleanSessionInWork = false

	    this.config = config
	    this.connections = [ ]

		this.server = Phoenix.create({ port: config.port }
		, require('./api/auth/success.js')
		, require('./api/connections.js')
		)

		this.wss = new WebSocketServer({
		    httpServer:				this.server.server,
    		autoAcceptConnections:	false
		})

		this.wss.on('request', function(request) {

		    // console.log(request.httpRequest.headers)
	    	var host = request.socket.remoteAddress.toString() + ':' + request.socket.remotePort.toString()
			console.log('accept connection ' + host)

	   		var wsconnection = request.accept('snapshot-full-refresh', request.origin)

   			var connection = WSConnection.create(this, wsconnection)
   			this.connections.push(connection)


		}.bind(this))

		this.interval = setInterval(this.onInterval.bind(this), 5000)
	},

	onInterval: function() {

		for(var i = 0, c = this.connections, l = c.length; i < l; i++) {
			var conn = c[i]
			if(conn.session_uuid && conn.last_access) {
				cc.query('update auth_sessions set last_access = ' + conn.last_access + ' where session_uuid = ' + conn.session_uuid, this.errorReporter)
			}
		}

		if(!this.cleanSessionInWork) {
			this.cleanSessions(this.errorReporter)
		}
	},

	cleanSessions: coroutine.method(function*(server, g) {

		server.cleanSessionInWork = true

		var from = null, limit = 30
		while(true) {

			var result

			if(null === from) {
				result = yield cc.query('select lock, is_auth, session_uuid, unixTimestampOf(last_access) as la from auth_sessions limit ' + limit, g.resume)
			}
			else {
				result = yield cc.query('select lock, is_auth, session_uuid, unixTimestampOf(last_access) as la from auth_sessions where token(session_uuid) > token( ' + from + ') limit ' + limit, g.resume)
			}

			if(result.rows.length < 1) {
				break
			}

			var ts = Date.now(), uuids = []
			for(var i = 0, c = result.rows, l = c.length; i < l; i++) {
				var row = c[i]
				from = row.session_uuid
				if(row.is_auth === true || row.lock === true) {
					if(ts - row.la > 20 * 1000) {
						uuids.push(row.session_uuid)
					}
			    }
			    else {
			    	if(row.la === null || ts - row.la > 30 * 24 * 60 * 60 * 1000) {
						uuids.push(row.session_uuid)
			    	}
			    }
			}

			if(uuids.length > 0) {
				for(var i = 0, l = uuids.length; i < l; i++) {
					yield server.dropSession(uuids[i], g.resume)
				}
				yield cc.query('delete from auth_sessions where session_uuid in (' + uuids.join(',') + ')', g.resume)
			}
		}
		
		server.cleanSessionInWork = false
	}),

	dropSession: coroutine.method(function*(server, session_uuid, g) {
		for(var i = 0, c = server.connections, l = c.length; i < l; i ++) {
			var conn = c[i]
			if(conn.session_uuid && conn.session_uuid == session_uuid) {
				conn.close(400, 'expired')
				break
			}
		}
	}),

	deleteWSConnection: function(connection) {
		this.connections.splice(this.connections.indexOf(connection), 1)
	}

})