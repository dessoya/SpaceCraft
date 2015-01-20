'use strict'

var cql				= require('ncc')
  , APIRequest		= require('./../APIRequest.js')
  , util			= require('util')
  , ch				= require('commhelpers')

  , Session			= require('./../Session.js')
  , User			= require('./../User.js')

var Success = APIRequest.inherit({
	request_gen: function*(params,sv) {

		var q = params.self.info.query, session_uuid = q.session_uuid, method = q.method, username = q.username, unique = q.unique
		// console.log(util.inspect(q,{depth:null}))

		// stage 1. check for valid request

		var session = yield Session.get(session_uuid, sv.resume3end)
		if(session === null) return false
		// console.log('auth success: session is valid')

		// check auth token
		var result = yield ch.request(config.auth_service.host, config.auth_service.port, '/api/check_token?token=' + q.token, null, sv.resume)
		// console.log(util.inspect(result,{depth:null}))
		if(result !== true) return false

		// params.self.res.setHeader('Set-Cookie', config.sessionCookie + '=' + session_uuid + '; expires=' + (new Date(Date.now() + 60*1000*60*24*60)).toUTCString()+'; onlyHttp=true; path=/')

/*
{	method:			'google',
	session_uuid:	'dc9c85a5-633a-45a0-a90e-f958c7555245',
	username:		'dessoya@gmail.com',
	unique:			'dessoya@gmail.com',
	token:			'64bb9923-1ac9-9b64-6958-d20e559c72b7' }
*/

		var method_uuid = Session.method_uuid(unique)
		// console.log('session.is_auth '+session.is_auth+', method '+method+', method_uuid '+method_uuid)

		var session_fields

		if(session.is_auth) {
			// add another method
			var user_uuid = session.user_uuid, finded_uuid = null

			result = yield ncc.execute('select * from users where ' + method + '_uuid = ?', [method_uuid], sv.resume)
			if(result.rows.length > 0) {
				finded_uuid = result.rows[0].user_uuid
			}

			if(finded_uuid !== null && finded_uuid !== user_uuid) {
				// relog

				session_fields = { user_uuid: finded_uuid, auth_method: method }
			}
			else {
				var fields = {}
				fields[method + '_uuid'] = method_uuid
				yield User.update(user_uuid, fields, sv.resume)

				session_fields = { auth_method: method }
			}

		}

		else {
			// logining

			// search user
			result = yield ncc.execute('select * from users where ' + method + '_uuid = ?', [method_uuid], sv.resume)
			var user_uuid
			if(result.rows.length === 0) {
				// create user
				var fields = {}
				user_uuid = yield User.create(username, sv.resume3end)
				fields[method + '_uuid'] = method_uuid
				yield User.update(user_uuid, fields, sv.resume)
			}
			else {
				user_uuid = result.rows[0].user_uuid
			}

			session_fields = { is_auth: true, user_uuid: user_uuid, auth_method: method }
		}

		yield Session.update(session_uuid, session_fields, sv.resume)
		yield Session.updateLastAccess(session_uuid, sv.resume3end)

		return true
	},

	answerReceiver: function(answer) {
		if(answer.status === 'ok') {
			this.writeHead(302, {'Location': '/' });
		}
		else {
			this.writeHead(302, {'Location': '/' });
		}
		this.end()
	}
})



module.exports = {
	'/api/auth/success': Success
}