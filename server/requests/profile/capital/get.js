'use strict'

var Phoenix			= require('phoenix')
  , coroutine		= require('coroutine')
  , cql				= require('ncc')
  , url				= require('url')
  , APIRequest		= require('./../../../APIRequest.js')

var Get = APIRequest.inherit({
	request_gen: function*(params,sv) {

		var session_uuid = params.self.req._cookie[config.sessionCookie]
		var result = yield ncc.execute('select user_uuid from auth_sessions where session_uuid = ?', [ session_uuid ], sv.resume)
		if(result.rows.length === 0) return false
		
		var user_uuid = result.rows[0].user_uuid

		var result = yield ncc.execute('select capital_planet_uuid from users where user_uuid = ?', [ user_uuid ], sv.resume)
		if(result.rows.length === 0) return false			

		return { planet_uuid: result.rows[0].capital_planet_uuid }
	}
})

module.exports = Get