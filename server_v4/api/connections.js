'use strict'

var Phoenix			= require('phoenix')
  , coroutine		= require('coroutine')
  , util			= require('util')

module.exports = Phoenix.Request.inherit({

    route: '/api/connections',

	onRequest: function() {		
		this.process(function(err,result) {
			if(err) {
				console.showError(err)
			}
			var message = JSON.stringify(result)
			this.writeHead(200, {'Content-Type': 'application/json; charset=utf-8','Content-Length': Buffer.byteLength(message, 'utf8')})
			this.end(message)
		}.bind(this))
	},

	process: coroutine.method(function*(request, g) {

	    var result = [ ]

    	for(var i = 0, c = httpserver.connections, l = c.length; i < l; i++) {
    		var conn = c[i]
    		var info = { id: conn.id, auth: conn.auth, user_uuid: conn.user_uuid, session_uuid: conn.session_uuid }
    		result.push(info)
    	}	

		return result

	})

})