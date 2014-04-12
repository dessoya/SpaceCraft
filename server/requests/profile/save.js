'use strict'

var Phoenix			= require('phoenix')
  , coroutine		= require('coroutine')
  , cql				= require('ncc')
  , url				= require('url')
  , APIRequest		= require('./../../APIRequest.js')

var Save = APIRequest.inherit({
	request_gen: function*(params,sv) {

		var session_uuid = params.self.req._cookie[config.sessionCookie]
		var result = yield ncc.execute('select user_uuid from auth_sessions where session_uuid = ?', [ session_uuid ], sv.resume)
		if(result.rows.length === 0) return false
		
		var request = params.request, user_uuid = result.rows[0].user_uuid
		result = yield ncc.execute('update users set username = ? where user_uuid = ?', [ request.username, user_uuid ], sv.resume)

		return true
	}
})

module.exports = Save