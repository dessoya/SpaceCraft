'use strict'

var util			= require('util')
  , coroutine		= require('coroutine')
  , cql				= require('ncc')
  , url				= require('url')
  , APIRequest		= require('./../../APIRequest.js')

var Get = APIRequest.inherit({
	request_gen: function*(params,sv) {

		var session_uuid = params.self.req._cookie[config.sessionCookie]
		var result = yield ncc.execute('select user_uuid from auth_sessions where session_uuid = ?', [ session_uuid ], sv.resume)
		if(result.rows.length === 0) return false
		
		var planet_uuid = params.request.planet_uuid
		result = yield ncc.execute('select * from planets where planet_uuid = ?', [ planet_uuid ], sv.resume)
		if(result.rows.length === 0) return false

		var planet = result.rows[0]
		result = yield ncc.execute('select * from buildings where building_uuid in ('+planet.buildings_list.join(',')+')', [], sv.resume)
		var buildings = [], rows = result.rows, c = rows.length; while(c--) {
			var row = rows[c]
			delete row.columns
			buildings.push(row)
		}
		
		console.log(util.inspect(result.rows[0],{depth:null}))

		return { buildings: buildings }
	}
})

module.exports = Get