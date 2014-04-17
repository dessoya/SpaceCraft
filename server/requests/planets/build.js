'use strict'

var util			= require('util')
  , coroutine		= require('coroutine')
  , cql				= require('ncc')
  , APIRequest		= require('./../../APIRequest.js')

var BuildList = APIRequest.inherit({
	request_gen: function*(params,sv) {

		var session_uuid = params.self.req._cookie[config.sessionCookie]
		var result = yield ncc.execute('select user_uuid from auth_sessions where session_uuid = ?', [ session_uuid ], sv.resume)
		if(result.rows.length === 0) return { result: false }
		
		var planet_uuid = params.request.planet_uuid
		result = yield ncc.execute('select * from planets where planet_uuid = ?', [ planet_uuid ], sv.resume)
		if(result.rows.length === 0) return { result: false }

		var planet = result.rows[0]

		result = yield objects.planet.loadBuildings(planet_uuid, sv.resume)
		var	b = result.buildings, buildings_map = result.buildings_map_arrays, planet = result.planet

		var btype = params.request.type
		var bx = params.request.x
		var by = params.request.y

		if(BT_MMINE === btype) {

			var mmine_count = buildings_map[BT_MMINE] ? buildings_map[BT_MMINE].length : 0;
			var mmine_avail = 1;

			if(buildings_map[BT_CAPITAL]) {
				switch(buildings_map[BT_CAPITAL][0].level) {
				case 1:
					mmine_avail = 2;
					break;
				case 2:
					mmine_avail = 3;
					break;
				default:
					mmine_avail = 4;
				}
			}
	
			mmine_avail = mmine_avail - mmine_count
			if(mmine_avail < 1) return { result: false }			
		}
		else if(BT_CMINE === btype) {

			var cmine_count = buildings_map[BT_CMINE] ? buildings_map[BT_CMINE].length : 0;
			var cmine_avail = 1;

			if(buildings_map[BT_CAPITAL]) {
				switch(buildings_map[BT_CAPITAL][0].level) {
				case 1:
					cmine_avail = 2;
					break;
				case 2:
					cmine_avail = 3;
					break;
				default:
					cmine_avail = 4;
				}
			}

			cmine_avail = cmine_avail - cmine_count
			if(cmine_avail < 1) return { result: false }			

		}
			
		// check position is free

		var b_uuid;
		do {
			b_uuid = cql.types.uuid()
			result = yield ncc.execute('insert into buildings (building_uuid, type, x, y, level, turn_on, upgrading) values (?,?,?,?,0,1,1) if not exists', [b_uuid, btype, bx, by], 1, sv.resume)
		} while (!result.rows[0]['[applied]'])

		do {
			var block_state = yield schema.lockLive_planet(planet_uuid, 200, sv.resume3end)
		} while (!block_state)

		result = yield ncc.execute('update planets set buildings_list = buildings_list + [ '+b_uuid+' ] where planet_uuid = ?', [planet_uuid], 1, sv.resume)

		yield schema.unlockLive_planet(planet_uuid, sv.resume)

		return { result: true }
	}
})

module.exports = BuildList