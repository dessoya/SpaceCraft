'use strict'

var Phoenix			= require('phoenix')
  , coroutine		= require('coroutine')
  , cql				= require('ncc')
  , url				= require('url')
  , APIRequest		= require('./../APIRequest.js')

var Logout = APIRequest.inherit({
	request_gen: function*(params,sv) {
		var session_uuid = params.self.req._cookie[config.sessionCookie]
		var result = yield ncc.execute('update auth_sessions set last_access = now(), user_uuid = null where session_uuid = ?', [ session_uuid ], sv.resume)
	}
})

var Info = APIRequest.inherit({
	request_gen: function*(params,sv) {
		var session_uuid = params.self.req._cookie[config.sessionCookie]

		var result = yield ncc.execute('select * from auth_sessions where session_uuid = ?', [ session_uuid ], sv.resume)
		if(result.rows.length === 0) {
			return { exists: false }
		}

		var a = { exists: true }, row = result.rows[0]
		result = yield ncc.execute('update auth_sessions set last_access = now() where session_uuid = ?', [ session_uuid ], sv.resume)
		if(row.user_uuid) {
				
			result = yield ncc.execute('select * from users where user_uuid = ?', [ row.user_uuid ], sv.resume)
			if(result.rows.length) {
				a.user_uuid = row.user_uuid
				var user = result.rows[0]
				a.username = user.username
				a.tag = user.tag

				a.google_uuid = user.google_uuid
				a.facebook_uuid = user.facebook_uuid
				a.vk_uuid = user.vk_uuid
			}						
		}
			
		return a
	}
})

var Success = APIRequest.inherit({
	request_gen: function*(params,sv) {
		var q = params.self.info.query, sessionId = q.sessionId, from = q.from, uuid = q.uuid
		params.self.res.setHeader('Set-Cookie', config.sessionCookie+'='+sessionId+'; expires=' + (new Date(Date.now()+60*1000*60*24*60)).toUTCString()+'; path=/')
				
		var result = yield ncc.execute('select * from auth_sessions where session_uuid = ?', [sessionId], sv.resume)
		if(result.rows.length === 0) return false

		var row = result.rows[0]
		if(!row.is_auth) return false

		var provider = row.provider, provider_uuid = row.provider_uuid, username = row.provider_username
		if(from === 'google' || from === 'vk' || from === 'facebook') {
			// console.log('exists provider '+params.from)

			result = yield ncc.execute('select * from users where '+from+'_uuid = ?', [uuid], sv.resume)
			if(result.rows.length === 0) return false

			var user_uuid = result.rows[0].user_uuid

			// check exists user with current provider
			result = yield ncc.execute('select * from users where '+provider+'_uuid = ?', [provider_uuid], sv.resume)
			if(result.rows.length) {
				user_uuid = result.rows[0].user_uuid
			}
			else {
				result = yield ncc.execute('update users set '+provider+'_uuid = ? where user_uuid = ?', [provider_uuid, user_uuid], sv.resume)
			}

			result = yield ncc.execute('update auth_sessions set last_access = now(), user_uuid = ? where session_uuid = ?', [user_uuid, sessionId], sv.resume)

			return true
		}

		result = yield ncc.execute('select * from users where '+provider+'_uuid = ?', [provider_uuid], sv.resume)

		var user_uuid
		if(result.rows.length) {
			// exists user
			user_uuid = result.rows[0].user_uuid
		}
		else {
			// need to create
			user_uuid = cql.types.uuid()
			var tag = parseInt([ 1 + Math.floor(Math.random()*9), Math.floor(Math.random()*10), Math.floor(Math.random()*10), Math.floor(Math.random()*10)].join(''))
			result = yield ncc.execute('insert into users (user_uuid, username, tag, '+provider+'_uuid) values (?,?,?,?)', [user_uuid, username, tag, provider_uuid], sv.resume)
			// create user

			result = yield ncc.execute('select * from planets limit 10', [], sv.resume)
			var planet = result.rows[0]

			var building_uuid = cql.types.uuid()
			result = yield ncc.execute('insert into buildings (building_uuid, planet_uuid, type, x, y) values (?,?,?,?,?)', [building_uuid, planet.planet_uuid, 1, 0, 0], sv.resume)

			// console.dir(['update planets set buildings_list = buildings_list + [ '++' ], owner_user_uuid = ? where planet_uuid = ?',building_uuid, user_uuid, planet.planet_uuid])
			result = yield ncc.execute('update planets set buildings_list = buildings_list + [ '+building_uuid+' ], owner_user_uuid = ? where planet_uuid = ?', [ user_uuid, planet.planet_uuid], sv.resume)
			
			result = yield ncc.execute('update users set capital_planet_uuid = ? where user_uuid = ?', [planet.planet_uuid, user_uuid], sv.resume)

			
		}

		result = yield ncc.execute('update auth_sessions set last_access = now(), user_uuid = ? where session_uuid = ?', [user_uuid, sessionId], sv.resume)

		return true
	},

	answerReceiver: function(answer) {
		if(answer.status === 'ok') {
			this.writeHead(302, {'Location': '/' });
		}
		else {
			this.writeHead(302, {'Location': '/authFailure' });
		}
		this.end()
	}
})

module.exports = {
	'/api/session/logout': Logout,
	'/api/session/info': Info,
	'/api/auth/success': Success,
}