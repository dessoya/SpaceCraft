'use strict'

var Phoenix			= require('phoenix')
  , coroutine		= require('coroutine')
  , util			= require('util')
  , ch				= require('commhelpers')

module.exports = Phoenix.Request.inherit({

    route: '/api/auth/success',

	onRequest: function() {		
		this.process(function(err,result) {
			if(err) {
				console.showError(err)
			}
			this.writeHead(302, {'Location': '/' })
			this.end()
		}.bind(this))
	},

	process: coroutine.method(function*(request, g) {

		var q = request.info.query
		// console.log(util.inspect(q,{depth:null}))

		var session = yield models.Session.create(q.session_uuid, true, g.resume)
		if(!session.valid) {
			console.log('session is not valid')
			return false
		}

		var result = yield ch.request(config.auth_service.host, config.auth_service.port, '/api/check_token?token=' + q.token, null, g.resume)
		if(!(result && result.status == 'ok' && result.result)) {
			console.log('token not valid')
			return false
		}

		var method_uuid = session.method_uuid(q.unique)

		var session_fields

		if(session.is_auth) {

			var user = yield models.User.create('method', q.method, method_uuid, g.resume)
			if(user.valid && user.uuid !== session.user_uuid) {
			    // relog
				session_fields = { user_uuid: user.uuid, auth_method: method }
			}
			else {
				// append auth method
				user = yield models.User.create('uuid', session.user_uuid, g.resume)
				var fields = {}
				fields[q.method + '_uuid'] = method_uuid
				yield user.update(fields, g.resume)

				session_fields = { auth_method: q.method }
			}

		}

		else {
			// logining

			var user = yield models.User.create('method', q.method, method_uuid, g.resume)
			if(!user.valid) {
				user = yield models.User.create('new', q.username, g.resume)
				var fields = { }
				fields[q.method + '_uuid'] = method_uuid
				yield user.update(fields, g.resume)
			}

			session_fields = { is_auth: true, user_uuid: user.uuid, auth_method: q.method }
		}

		yield session.update(session_fields, g.resume)
	})

})