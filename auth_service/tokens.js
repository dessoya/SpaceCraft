'use strict'

var crypto			= require('crypto')

var tokens = { }

function generate() {

	var md5 = crypto.createHash('md5')
	md5.update('' + Math.random())
	md5 = md5.digest('hex')

	// e1bd021e-6068-455d-bc4d-759d55ac7f1c
	var token = md5.substr(0,8) + '-' + md5.substr(8,4) + '-' + md5.substr(12,4) + '-' + md5.substr(16,4) + '-' + md5.substr(20)

	tokens[token] = { state: 'new' }

	return token
}


module.exports = {
	init: function(app) {

		app.get('/api/check_token', function(req, res) {
			var answer = { status: 'ok' }
			var token = req.query.token || ''
			if(token in tokens) {
				answer.result = true
				delete tokens[token]
			}
			else {
				answer.result = false
			}

			res.send(JSON.stringify(answer))
			res.end()
		})
	},

	generate: generate,
	all: function() { return tokens },
}