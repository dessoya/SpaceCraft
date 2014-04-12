'use strict'

var cql			= require('ncc')
  , coroutine	= require('coroutine')
  , util		= require('util')

var client = new cql.Client({
	getAConnectionTimeout:	1000,
	hosts:					['192.168.88.253'],
	keyspace:				'sc',
	poolSize:				40
})

function*gen_fill(params, sv) {

	var stars = 1000, id = 1, r
	r = yield client.execute('truncate galaxy_xmap', [], 1, sv.resume)
	r = yield client.execute('truncate galaxy_ymap', [], 1, sv.resume)
	r = yield client.execute('truncate galaxy_zmap', [], 1, sv.resume)
	r = yield client.execute('truncate galaxys', [], 1, sv.resume)
	r = yield client.execute('truncate star_systems', [], 1, sv.resume)
	r = yield client.execute('truncate planets', [], 1, sv.resume)

	var gid = cql.types.uuid() 
	r = yield client.execute('insert into galaxys (galaxy_uuid,name,x,y,z) values ('+gid+',\'main\',1,1,1)', [], 1, sv.resume)

	var step = 0.00001
	do {

		console.log(1)
		var queries = [], batch = 100, cnt = 0
		while(batch-- && stars) {

			var r1 = Math.random() * 20
			var r2 = Math.random() * 150 + 100

			var f1 = Math.sin(r1) * r2
//			f1 += f1 < 0 ? -50 : 50

			var f2 = Math.cos(r1) * r2
//			f2 += f2 < 0 ? -50 : 50

			var x = Math.floor(f1) + step, y = Math.floor(Math.random() * 50 - 25) + step, z = Math.floor(f2) + step
			var ssid = cql.types.uuid() 
			queries.push({query:'insert into galaxy_xmap (galaxy_uuid,x,star_system_uuid) values ('+gid+','+x+','+ssid+')', params: []})
			queries.push({query:'insert into galaxy_ymap (galaxy_uuid,y,star_system_uuid) values ('+gid+','+y+','+ssid+')', params: []})
			queries.push({query:'insert into galaxy_zmap (galaxy_uuid,z,star_system_uuid) values ('+gid+','+z+','+ssid+')', params: []})

			var pcount = 5 + Math.floor(Math.random() * 7)
			var orbits = {}, names = [], values = []
			// console.log('pcount '+pcount)
			while(pcount --) {
				var planet_uuid = cql.types.uuid() 
				var orbit
				do {
					orbit = Math.floor(Math.random() * 20)
				} while( orbit in orbits )

				// console.dir(orbits)
				orbits[orbit] = 1

				names.push('orbit_'+orbit+'_type')
				values.push(1)
				names.push('orbit_'+orbit+'_uuid')
				values.push(planet_uuid)

				queries.push({query:'insert into planets (buildings_list,planet_uuid,star_system_uuid,orbit) values ([],'+planet_uuid+','+ssid+','+orbit+')', params: []})
			}

			queries.push({query:'insert into star_systems (star_system_uuid,galaxy_uuid,x,y,z,star_weight,star_class,star_class_num,'+names.join(',')+') values ('+ssid+','+gid+','+x+','+y+','+z+','+(Math.random() * 40)+','+Math.floor(Math.random()*7)+','+Math.floor(Math.random()*10)+','+values.join(',')+')', params: []})

			// console.log(util.inspect(queries,{depth:null}))
			// process.exit(0)
			id ++
			stars --
			step += 0.000004
			cnt ++
		}

		r = yield client.executeBatch(queries, 1, sv.resume)

	} while (stars)

}

coroutine(gen_fill, {}, function(event, data) {
	if(event === GE_ERROR) {
		console.log(util.inspect(data,{depth:null}))
	}
	client.shutdown()
})