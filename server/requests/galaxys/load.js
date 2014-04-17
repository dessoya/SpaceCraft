'use strict'

var Phoenix			= require('phoenix')
  , coroutine		= require('coroutine')
  , cql				= require('ncc')
  , url				= require('url')
  , util			= require('util')
  , APIRequest		= require('./../../APIRequest.js')

var Load = APIRequest.inherit({
	request_gen: function*(params,sv) {

		var session_uuid = params.self.req._cookie[config.sessionCookie]
		var result = yield ncc.execute('select user_uuid from auth_sessions where session_uuid = ?', [ session_uuid ], sv.resume)
		if(result.rows.length === 0) return false
		
		var user_uuid = result.rows[0].user_uuid

		var result = yield ncc.execute('select star_system_list from users where user_uuid = ?', [ user_uuid ], sv.resume)
		if(result.rows.length === 0) return false			
		var ss_map = {}, ss = result.rows[0].star_system_list, c = ss.length; while(c--) {
			var ss_uuid = ss[c]
			ss_map[ss_uuid] = 1
		}

		var request = params.request, galaxy_uuid = request.galaxy_uuid, result
		var result = yield ncc.execute('select * from galaxys where galaxy_uuid = ?', [ galaxy_uuid ], sv.resume)
		var galaxy_name = result.rows[0].name;
		var list = {}, last_uuid, cnt = 0, user_star_systems = {}
		do {
			if(last_uuid) result = yield ncc.execute('select galaxy_uuid, star_system_uuid, star_class, star_class_num, x, y, z from star_systems where token(star_system_uuid) > token(?) limit 100', [ last_uuid ], sv.resume)
			else result = yield ncc.execute('select galaxy_uuid, star_system_uuid, star_class, star_class_num, x, y, z from star_systems limit 100', [ ], sv.resume)

			var rows = result.rows, c = rows.length, l = c; last_uuid = c ? rows[c-1].star_system_uuid : null; cnt += l; while(c--) {
				var item = rows[c], uuid = item.star_system_uuid
				if(galaxy_uuid !== item.galaxy_uuid) continue
				if(uuid in ss_map) user_star_systems[uuid] = 1
				list[uuid] = {
					sc: item.star_class,
					scn: item.star_class_num,
					x: Math.floor(item.x),
					y: Math.floor(item.y),
					z: Math.floor(item.z),
				}
			}
		} while(l)

		return { star_systems: list, user_star_systems: user_star_systems, name: galaxy_name }
	}
})

module.exports = Load