'use strict'

var Phoenix			= require('phoenix')
  , coroutine		= require('coroutine')
  , cql				= require('ncc')
  , url				= require('url')
  , util			= require('util')
  , APIRequest		= require('./../../APIRequest.js')

var Load = APIRequest.inherit({
	request_gen: function*(params,sv) {

		var request = params.request, name = request.name;
		var result = yield ncc.execute('select * from galaxys where name = ?', [ name ], sv.resume)
		var galaxy_uuid = result.rows[0].galaxy_uuid;
		var list = {}, last_uuid, cnt = 0
		do {
			if(last_uuid) result = yield ncc.execute('select star_system_uuid, star_class, star_class_num, x, y, z from star_systems where token(star_system_uuid) > token(?) limit 100', [ last_uuid ], sv.resume)
			else result = yield ncc.execute('select star_system_uuid, star_class, star_class_num, x, y, z from star_systems limit 100', [ ], sv.resume)

			var rows = result.rows, c = rows.length, l = c; last_uuid = c ? rows[c-1].star_system_uuid : null; cnt += l; while(c--) {
				var item = rows[c], uuid = item.star_system_uuid
				list[uuid] = {
					sc: item.star_class,
					scn: item.star_class_num,
					x: Math.floor(item.x),
					y: Math.floor(item.y),
					z: Math.floor(item.z),
				}
			}
		} while(l)

		return list
	}
})

module.exports = Load