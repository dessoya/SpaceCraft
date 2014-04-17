'use strict'

var Phoenix			= require('phoenix')
  , coroutine		= require('coroutine')
  , cql				= require('ncc')
  , url				= require('url')
  , APIRequest		= require('./../../APIRequest.js')

var List = APIRequest.inherit({
	request_gen: function*(params,sv) {

		var session_uuid = params.self.req._cookie[config.sessionCookie]
		var result = yield ncc.execute('select user_uuid from auth_sessions where session_uuid = ?', [ session_uuid ], sv.resume)
		if(result.rows.length === 0) return false
		
		var user_uuid = result.rows[0].user_uuid

		var result = yield ncc.execute('select star_system_list from users where user_uuid = ?', [ user_uuid ], sv.resume)
		if(result.rows.length === 0) return false			
		var ss = result.rows[0].star_system_list

		result = yield ncc.execute('select star_system_uuid, galaxy_uuid from star_systems where star_system_uuid in ('+ss.join(',')+')', [], sv.resume)
		var gmap = {}, rows = result.rows, c = rows.length; while(c--) {
			var row = rows[c], gid = row.galaxy_uuid
			if(!(gid in gmap)) gmap[gid]=[]
			gmap[gid].push(row.star_system_uuid)
		}

		var result = yield ncc.execute('select galaxy_uuid, name from galaxys', [ ], sv.resume)
		var rows = result.rows, c = rows.length, a = []; while(c--) {
			var row = rows[c]
			a.push({name:row.name, galaxy_uuid:row.galaxy_uuid, user_star_systems: row.galaxy_uuid in gmap ? gmap[row.galaxy_uuid] : [] })
		}

		return a
	}
})

module.exports = List