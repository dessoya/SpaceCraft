'use strict'

var util			= require('util')
  , coroutine		= require('coroutine')
  , cql				= require('ncc')
  , url				= require('url')
  , APIRequest		= require('./../../../APIRequest.js')

var LevelUp = APIRequest.inherit({
	request_gen: function*(params,sv) {

		var session_uuid = params.self.req._cookie[config.sessionCookie]
		var result = yield ncc.execute('select user_uuid from auth_sessions where session_uuid = ?', [ session_uuid ], sv.resume)
		if(result.rows.length === 0) return { result: false, reason: 1 }
		
		console.dir(params.request)
		var planet_uuid = params.request.planet_uuid, building_uuid = params.request.building_uuid
		result = yield ncc.execute('select * from planets where planet_uuid = ?', [ planet_uuid ], sv.resume)
		if(result.rows.length === 0) return { result: false, reason: 1 }

		do {
			var block_state = yield schema.lockLive_planet(planet_uuid, 200, sv.resume3end)
		} while (!block_state)

		sv.throwErrors = true
		try {

			result = yield ncc.execute('select * from planets where planet_uuid = ?', [ planet_uuid ], sv.resume)
			var planet = result.rows[0]

			result = yield ncc.execute('select * from buildings where building_uuid = ?', [ building_uuid ], sv.resume)
			if(result.rows.length === 0) {
				yield schema.unlockLive_planet(planet_uuid, sv.resume)
				return { result: false, reason: 1 }
			}
			var building = result.rows[0]

			result = yield ncc.execute('update buildings set turn_on = 0 where building_uuid = ?', [ building_uuid ], sv.resume)

			yield objects.planet.process(planet_uuid, 0, sv.resume3end)
		}

		catch(e) {
			console.showError(e)
			yield schema.unlockLive_planet(planet_uuid, sv.resume)
			return { result: false, reason: 3 }
		}

		// check for needed population
		yield schema.unlockLive_planet(planet_uuid, sv.resume)

		return { result: true }
	}
})

module.exports = LevelUp