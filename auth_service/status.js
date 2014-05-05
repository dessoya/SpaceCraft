'use strict'

var sessions		= require('./sessions.js')
  , tokens			= require('./tokens.js')

module.exports = {

	init: function(app) {

		app.get('/api/status', function(req, res) {
		
			var answer = JSON.stringify({ tokens: tokens.all(), sessions: sessions.all() })

			res.set({
				'Content-Type': 'application/json; charset=utf-8',
				'Content-Length': Buffer.byteLength(answer, 'utf8')
			})

			res.send(answer)
			res.end()
		})
	}

}