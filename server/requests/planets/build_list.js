'use strict'

var util			= require('util')
  , coroutine		= require('coroutine')
  , cql				= require('ncc')
  , APIRequest		= require('./../../APIRequest.js')

var BuildList = APIRequest.inherit({
	request_gen: function*(params,sv) {

		var session_uuid = params.self.req._cookie[config.sessionCookie]
		var result = yield ncc.execute('select user_uuid from auth_sessions where session_uuid = ?', [ session_uuid ], sv.resume)
		if(result.rows.length === 0) return false
		
		var planet_uuid = params.request.planet_uuid
		result = yield ncc.execute('select * from planets where planet_uuid = ?', [ planet_uuid ], sv.resume)
		if(result.rows.length === 0) return false

		var planet = result.rows[0]

		result = yield objects.planet.loadBuildings(planet_uuid, sv.resume)
		var	b = result.buildings, buildings_map = result.buildings_map_arrays, planet = result.planet

		var buildings = []

		// calc available count of mmine
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

		if(mmine_avail > 0) buildings.push({ type: BT_MMINE, count: mmine_avail})
		


		// calc available count of mmine
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

		if(cmine_avail > 0) buildings.push({ type: BT_CMINE, count: cmine_avail})

		return { buildings: buildings }
	}
})

module.exports = BuildList