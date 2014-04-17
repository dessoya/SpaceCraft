'use strict'

var Phoenix			= require('phoenix')
  , coroutine		= require('coroutine')
  , cql				= require('ncc')
  , url				= require('url')
  , APIRequest		= require('./../APIRequest.js')

var Logout = APIRequest.inherit({
	request_gen: function*(params,sv) {
		var session_uuid = params.self.req._cookie[config.sessionCookie]
		var result = yield ncc.execute('update auth_sessions set last_access = now(), user_uuid = null where session_uuid = ?', [ session_uuid ], sv.resume)
	}
})

var Info = APIRequest.inherit({
	request_gen: function*(params,sv) {
		var session_uuid = params.self.req._cookie[config.sessionCookie]

		var result = yield ncc.execute('select * from auth_sessions where session_uuid = ?', [ session_uuid ], sv.resume)
		if(result.rows.length === 0) {
			return { exists: false }
		}

		var a = { exists: true }, row = result.rows[0]
		result = yield ncc.execute('update auth_sessions set last_access = now() where session_uuid = ?', [ session_uuid ], sv.resume)
		if(row.user_uuid) {
				
			result = yield ncc.execute('select * from users where user_uuid = ?', [ row.user_uuid ], sv.resume)
			if(result.rows.length) {
				a.user_uuid = row.user_uuid
				var user = result.rows[0]
				// console.dir(user)
				a.username = user.username
				a.tag = user.tag

				a.google_uuid = user.google_uuid
				a.facebook_uuid = user.facebook_uuid
				a.vk_uuid = user.vk_uuid

				a.population = user.population
				a.population_sinc = user.population_sinc
			}						
		}
			
		return a
	}
})

var Success = APIRequest.inherit({
	request_gen: function*(params,sv) {
		var q = params.self.info.query, sessionId = q.sessionId, from = q.from, uuid = q.uuid
		params.self.res.setHeader('Set-Cookie', config.sessionCookie+'='+sessionId+'; expires=' + (new Date(Date.now()+60*1000*60*24*60)).toUTCString()+'; path=/')
				
		var result = yield ncc.execute('select * from auth_sessions where session_uuid = ?', [sessionId], sv.resume)
		if(result.rows.length === 0) return false

		var row = result.rows[0]
		if(!row.is_auth) return false

		var provider = row.provider, provider_uuid = row.provider_uuid, username = row.provider_username
		if(from === 'google' || from === 'vk' || from === 'facebook') {
			// console.log('exists provider '+params.from)

			result = yield ncc.execute('select * from users where '+from+'_uuid = ?', [uuid], sv.resume)
			if(result.rows.length === 0) return false

			var user_uuid = result.rows[0].user_uuid

			// check exists user with current provider
			result = yield ncc.execute('select * from users where '+provider+'_uuid = ?', [provider_uuid], sv.resume)
			if(result.rows.length) {
				user_uuid = result.rows[0].user_uuid
			}
			else {
				result = yield ncc.execute('update users set '+provider+'_uuid = ? where user_uuid = ?', [provider_uuid, user_uuid], sv.resume)
			}

			result = yield ncc.execute('update auth_sessions set last_access = now(), user_uuid = ? where session_uuid = ?', [user_uuid, sessionId], sv.resume)

			return true
		}

		result = yield ncc.execute('select * from users where '+provider+'_uuid = ?', [provider_uuid], sv.resume)

		var user_uuid
		if(result.rows.length) {
			// exists user
			user_uuid = result.rows[0].user_uuid
		}
		else {
			// need to create
			var tag = parseInt([ 1 + Math.floor(Math.random()*9), Math.floor(Math.random()*10), Math.floor(Math.random()*10), Math.floor(Math.random()*10)].join(''))
			do {
				user_uuid = cql.types.uuid()
				result = yield ncc.execute('insert into users (star_system_list, planet_list, user_uuid, username, tag, '+provider+'_uuid) values ([],[],?,?,?,?) if not exists', [user_uuid, username, tag, provider_uuid], 1, sv.resume)
			} while (!result.rows[0]['[applied]'])
			// create user

			// search for free planet
			var planet
			// console.log('alloc free planet')
			do {
				var result = yield ncc.execute('select value from config where name = ?', ['planet_iterator_for_create_user'], sv.resume)
				if(result.rows.length === 0) {
					result = yield ncc.execute('select * from planets limit ' + (10 + Math.floor(Math.random() * 10) ), [], sv.resume)
				}
				else {
					result = yield ncc.execute('select * from planets where token(planet_uuid) > token(?) limit ' + (10 + Math.floor(Math.random() * 10) ), [result.rows[0].value], sv.resume)
				}

				var record = result.rows[ Math.floor(Math.random() * result.rows.length) ]
				if(!record.owner_user_uuid) {
					
					// console.log('begin lock')
					var block_state = yield schema.lockPlanet(record.planet_uuid, 200, sv.resume3end)
					// console.log('end lock')
					if(block_state) {
						planet = record
						// todo: read and check owner_user_uuid
					}
				}

				result = yield ncc.execute("update config set value = '"+result.rows[result.rows.length - 1].planet_uuid+"' where name = 'planet_iterator_for_create_user'", [], 1, sv.resume)

			} while (!planet)
			// console.log('planet alloced')

			result = yield ncc.execute("insert into live_planets (planet_uuid,treat_ms) values (?,"+(Date.now())+")", [ planet.planet_uuid ], 1, sv.resume)


			var building_uuid;
			do {
				building_uuid = cql.types.uuid()
				result = yield ncc.execute('insert into buildings (building_uuid, type, x, y, level, turn_on) values (?,?,?,?,1,1) if not exists', [building_uuid, 1, 0, 0], 1, sv.resume)
			} while (!result.rows[0]['[applied]'])

			var wh_uuid;
			do {
				wh_uuid = cql.types.uuid()
				result = yield ncc.execute('insert into buildings (building_uuid, type, x, y, level, turn_on) values (?,?,?,?,1,1) if not exists', [wh_uuid, 2, 2, 0], 1, sv.resume)
			} while (!result.rows[0]['[applied]'])

			var es_uuid;
			do {
				es_uuid = cql.types.uuid()
				result = yield ncc.execute('insert into buildings (building_uuid, type, x, y, level, turn_on) values (?,?,?,?,1,1) if not exists', [es_uuid, 3, 0, 2], 1, sv.resume)
			} while (!result.rows[0]['[applied]'])

			var mm_uuid;
			do {
				mm_uuid = cql.types.uuid()
				result = yield ncc.execute('insert into buildings (building_uuid, type, x, y, level, turn_on) values (?,?,?,?,1,1) if not exists', [mm_uuid, 4, 4, 0], 1, sv.resume)
			} while (!result.rows[0]['[applied]'])

			var cm_uuid;
			do {
				cm_uuid = cql.types.uuid()
				result = yield ncc.execute('insert into buildings (building_uuid, type, x, y, level, turn_on) values (?,?,?,?,1,1) if not exists', [cm_uuid, 5, 5, 0], 1, sv.resume)
			} while (!result.rows[0]['[applied]'])

			// var popInSec = objects.building.capital.levelParams['1'].popInSec

			// console.dir(['update planets set buildings_list = buildings_list + [ '++' ], owner_user_uuid = ? where planet_uuid = ?',building_uuid, user_uuid, planet.planet_uuid])
			result = yield ncc.execute('update planets set population = 600, population_sinc = 0, crystals = 3000, crystals_sinc = 0, minerals = 5000, minerals_sinc = 0, fuel = 0, fuel_sinc = 0, buildings_list = buildings_list + [ '+building_uuid+','+wh_uuid+','+es_uuid+','+mm_uuid+','+cm_uuid+' ], owner_user_uuid = ? where planet_uuid = ?', [ user_uuid, planet.planet_uuid], 1, sv.resume)
			
			result = yield ncc.execute('update users set star_system_list = star_system_list + ['+planet.star_system_uuid+'], planet_list = planet_list + ['+planet.planet_uuid+'], capital_planet_uuid = ? where user_uuid = ?', [planet.planet_uuid, user_uuid], 1, sv.resume)


			do {
				var block_state = yield schema.lockLive_planet(planet.planet_uuid, 200, sv.resume3end)
			} while (!block_state)
			yield objects.planet.process(planet.planet_uuid, 0, sv.resume3end)
			yield schema.unlockLive_planet(planet.planet_uuid, sv.resume)


			yield schema.unlockPlanet(planet.planet_uuid, sv.resume)
		}

		result = yield ncc.execute('update auth_sessions set last_access = now(), user_uuid = ? where session_uuid = ?', [user_uuid, sessionId], sv.resume)

		return true
	},

	answerReceiver: function(answer) {
		if(answer.status === 'ok') {
			this.writeHead(302, {'Location': '/' });
		}
		else {
			this.writeHead(302, {'Location': '/authFailure' });
		}
		this.end()
	}
})

module.exports = {
	'/api/session/logout': Logout,
	'/api/session/info': Info,
	'/api/auth/success': Success,
}