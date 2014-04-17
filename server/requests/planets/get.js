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
		var p = { population: planet.population, population_sinc: planet.population_sinc, population_usage: planet.population_usage,
			minerals: planet.minerals, minerals_sinc: planet.minerals_sinc, energy: planet.energy, energy_usage: planet.energy_usage, bld_energy_usage: planet.bld_energy_usage,
			crystals: planet.crystals, crystals_sinc: planet.crystals_sinc, wh_minerals: 0, wh_crystals: 0,
		}
		result = yield ncc.execute('select * from buildings where building_uuid in ('+planet.buildings_list.join(',')+')', [], sv.resume)
		var buildings = [], rows = result.rows, c = rows.length; while(c--) {
			var row = rows[c]
			var building = { upgrading: row.upgrading, building_uuid: row.building_uuid , type: row.type, level: row.level, x: row.x, y: row.y, turn_on: row.turn_on }		
			objects.building.getInfo(building, row)
			buildings.push(building)

			if(BT_WAREHOUSE === row.type) {
				p.wh_minerals += objects.building.typeMap[BT_WAREHOUSE].levelParams[row.level].wh_minerals
				p.wh_crystals += objects.building.typeMap[BT_WAREHOUSE].levelParams[row.level].wh_crystals
			}
		}
		
		// console.log(util.inspect(result.rows[0],{depth:null}))

		return { planet: p, buildings: buildings }
	}
})

module.exports = Get