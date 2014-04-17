'use strict'

var Class			= require('class')
  , coroutine		= require('coroutine')
  , util			= require('util')

function processBuildings(types, buildings_map, buildingTretor, skipTurnOff) {

	for(var i = 0, l = types.length; i < l; i++) {
		var type = types[i]
		if(!(type in buildings_map)) continue
		var collections = buildings_map[type]	

		// ctx = initTypeContext(type)
		var ctx = objects.building.typeMap[type]

		for(var building_uuid in collections) {
			var building = collections[building_uuid]
			if(!skipTurnOff && building.turn_on !== 1) continue

			buildingTretor(ctx, building)
		}
	}
}

var Planet = Class.inherit({

	onCreate: function() {

	},

	loadBuildings: function(planet_uuid, callback) {
		ncc.execute('select * from planets where planet_uuid = ' + planet_uuid, function(err, result) {
			if(err) return callback(err)
			var planet = result.rows[0]
			ncc.execute('select * from buildings where building_uuid in ('+planet.buildings_list.join(',')+')', function(err, result) {
				if(err) return callback(err)

				var	buildings_map = {}, buildings = {}, buildings_map_arrays = {}
				var rows = result.rows, c = rows.length; while(c--) {
					var building = rows[c]; delete building.columns;
					var original_building = {}
					for(var k in building) original_building[k] = building[k]
					buildings[building.building_uuid] = original_building
					var type = building.type
					if(!(type in buildings_map)) {
						buildings_map[type] = {}
						buildings_map_arrays[type] = []
					}
					buildings_map[type][building.building_uuid] = building		
					buildings_map_arrays[type].push(building)
				}

				callback(null, {planet:planet,buildings_map_arrays:buildings_map_arrays, buildings_map:buildings_map,buildings:buildings})
			})			
		})
	},

	gen_process: function*(params, sv) {
		var planet_uuid = params.planet_uuid, secs = params.secs * 1, original_secs = params.secs

		var result = yield params.self.loadBuildings(planet_uuid, sv.resume)
		var	buildings = result.buildings, buildings_map = result.buildings_map, planet = result.planet

		var bchanges = []

		// step 2. trun off if not exists population
		var pop = planet.population, usage_pop = pop

		processBuildings(
			[BT_ENERGYSTATION, BT_MMINE], buildings_map,
			function(ctx, building) {
				usage_pop -= ctx.levelParams[building.level].popUsage
				if(usage_pop < 0) {
					building.turn_on = 0
					bchanges.push([building.building_uuid, 'turn_on', 0])
				}
			}
		)

		// step 3. calc energy
		var energy = 0

		processBuildings(
			[BT_CAPITAL, BT_ENERGYSTATION], buildings_map,
			function(ctx, building) {
				energy += ctx.levelParams[building.level].energyProduced
			}
		)

		// step 4. turn off if not exists energy
		var energy_usage = energy, bld_energy_usage = 0

		processBuildings(
			[BT_MMINE, BT_CMINE], buildings_map,
			function(ctx, building) {
				var e = ctx.levelParams[building.level].energyUsage
				energy_usage -= e
				bld_energy_usage += e
				if(energy_usage < 0) {
					building.turn_on = 0
					bchanges.push([building.building_uuid, 'turn_on', 0])
				}
			}
		)

		// resources
		var minerals_inc = 0, crystals_inc = 0

		processBuildings(
			[BT_MMINE, BT_CMINE], buildings_map,
			function(ctx, building) {
				var t = ctx.levelParams[building.level]
				if(t.mineralsInSec) minerals_inc += t.mineralsInSec
				if(t.crystalsInSec) crystals_inc += t.crystalsInSec
			}
		)

		var minerals = planet.minerals + minerals_inc * secs	
		var crystals = planet.crystals + crystals_inc * secs	

		// step 5. calc pop incom + total pop
		var pop_items = Math.floor(pop / 10);
		if(pop_items * 10 < pop) pop_items ++;

		var pop_b_inc = 0;

		processBuildings(
			[BT_CAPITAL], buildings_map,
			function(ctx, building) {
				pop_b_inc += ctx.levelParams[building.level].popInSec
			}
		)

		// check for upgrading
		processBuildings(
			[BT_CAPITAL, BT_WAREHOUSE, BT_ENERGYSTATION, BT_MMINE, BT_CMINE], buildings_map,
			function(ctx, building) {
				if(building.upgrading !== 1) return

				var level_up = ctx.levelParams[building.level].level_up

				if(level_up.pop <= usage_pop) {
					bchanges.push([building.building_uuid, 'upgrade_in_progress', 1])
					usage_pop -= level_up.pop
					console.log('upgrade_elapsed '+ building.upgrade_elapsed+' '+original_secs)
					building.upgrade_elapsed += original_secs
					console.log('upgrade_elapsed '+ building.upgrade_elapsed)
					if(building.upgrade_elapsed >= level_up.time) {
						bchanges.push([building.building_uuid, 'level', building.level + 1])
						bchanges.push([building.building_uuid, 'upgrade_elapsed', building.upgrade_elapsed])
						bchanges.push([building.building_uuid, 'upgrading', 0])
					}
					else {
						bchanges.push([building.building_uuid, 'upgrade_elapsed', building.upgrade_elapsed])
					}
				}
				else {
					bchanges.push([building.building_uuid, 'upgrade_in_progress', 0])
				}
			},
			true
		)


		var pop_inc = 1;
		var pinc = pop_inc / (60 * 60);
		var minc = 0.5 / (60 * 60);
		pop_inc = 0
		while(pop_items --) {
			energy_usage -= 5
			if(energy_usage < 0) {
				pop_inc -= minc
			}
			else {
				pop_inc += pinc
			}
		}

		pop_inc = (pop_b_inc + pop_inc)
		pop += pop_inc * secs	

		if(bchanges.length) {
			// console.log(util.inspect(bchanges,{depth:null}))
			var b = {}
			var c = bchanges.length; while(c--) {
				var item = bchanges[c], bi = item[0], f = item[1], v = item[2]
				if(buildings[bi][f] === v) continue
				if(!(bi in b)) b[bi] = []
				b[bi].push(f+'='+v)
			}
			var queries = []
			for(var i in b) queries.push({query:'update buildings set '+b[i].join(',')+' where building_uuid='+i,params:[]})
			if(queries.length) {
				console.log(util.inspect(queries,{depth:null}))
				yield ncc.executeBatch(queries, 1, sv.resume)
			}
		}

		// final commit
		yield ncc.execute('update planets set bld_energy_usage = '+bld_energy_usage+', minerals = '+minerals+', minerals_sinc = '+minerals_inc+', crystals = '+crystals+', crystals_sinc = '+crystals_inc+', energy = '+energy+', energy_usage = '+energy_usage+', population = '+pop+', population_usage = '+usage_pop+', population_sinc = '+pop_inc+' where planet_uuid = '+planet_uuid, sv.resume)

		// yield process.nextTick(sv.resume)
	},

	process: function(planet_uuid, secs, callback) {
		coroutine(this.gen_process, { self: this, planet_uuid: planet_uuid, secs: secs }, callback)
	}
})

module.exports = Planet