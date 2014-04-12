'use strict'

var cql			= require('ncc')
  , coroutine	= require('coroutine')
  , util		= require('util')
  , Phoenix			= require('phoenix')

var client = new cql.Client({
	getAConnectionTimeout:	1000,
	hosts:					['192.168.88.253'],
	keyspace:				'sc',
	poolSize:				40
})

process.on('SIGINT', function() {
	client.shutdown();
})

var step = 100, gid
var area = {
	x: {min: -250, max: 251},
	y: {min: -50, max: 51},
	z: {min: -250, max: 251},
}

var stars = {}, finishc = 0, avga = 0, avgc = 0

function enumerate(r, last) {

	if(!last) last = area[r].min

	var end = last + step
	if(end > area[r].max) end = area[r].max
	client.execute('select * from galaxy_'+r+'map where galaxy_uuid = ? and '+r+' >= '+last+' and '+r+' < '+end, [ gid ], function(err, result) {
		if(err) {
			console.log(err)
			process.exit(1)
		}

		avgc ++; avga += result.rows.length
		var c = result.rows.length; while(c--) {
			var row = result.rows[c], ssid = row.star_system_uuid
			if(!(ssid in stars)) {
				var o = {}
				stars[ssid] = o
			}
			var o = stars[ssid]
			o[r] = row[r]
		}

		if(end === area[r].max) {
			console.log(r+' end')
			finishc ++
			if(finishc===3) {

	var diff = process.hrtime(time);
	var secs = (diff[0] * 1e9 + diff[1]) / 1e9;
	console.log('search time '+secs.toFixed(5));
		console.log('avg '+(avga / avgc).toFixed(3))

				var sorted = {}, selected = 0, total = 0
				var ids = []
				for(var id in stars) {
					total ++
					var s = stars[id]
					if('x' in s && 'y' in s && 'z' in s) {
						sorted[id] = s
						selected ++
						ids.push(id)
					}
				}
/*
				console.dir(stars)
				console.dir(sorted)
*/
				console.log('total '+total+' selected '+selected)
				// process.exit(1)

				client.execute('select * from star_systems where star_system_uuid in ('+ids.join(',')+')', [ ], function(err, result) {
				if(err) {
					console.log(err)
					process.exit(1)
				}
				var l = result.rows.length, d = {};while(l--) {
					var r = result.rows[l]
					var s = sorted[r.star_system_uuid]
					s.sc = r.star_class
					s.scn = r.star_class_num
					s.x = Math.floor(s.x)
					s.y = Math.floor(s.y)
					s.z = Math.floor(s.z)
					var id = r.star_system_uuid.replace(/-/g, '')
					d[id] = s
				}

				var message = JSON.stringify(d);
				req.writeHead(200, {'Content-Type': 'application/json; charset=utf-8','Content-Length': Buffer.byteLength(message, 'utf8')});
				req.end(message);
				})

			}
		}
		else {
			enumerate(r, end)
		}
	})
}

var time, req
/*
var time = process.hrtime()
enumerate('x')
enumerate('y')
enumerate('z')
*/

var RequestMap = Phoenix.Request.inherit({

	onRequest: function() {

		req = this
		client.execute('select * from galaxys where name = ?', [ this.info.query.name ], function(err, result) {
		if(err) {
			console.log(err)
			process.exit(1)
		}
		gid = result.rows[0].galaxy_uuid
		
		area = {
			x: {min: -250,	max: 251},
			y: {min: -50,	max: 51},
			z: {min: -250,	max: 251},
		}

		stars = {}, finishc = 0, avga = 0, avgc = 0

		time = process.hrtime()
		enumerate('x')
		enumerate('y')
		enumerate('z')

		})

	},

})
var httpserver =  Phoenix.create({port: 8300
	//	,hideRequestMessage:true
}, {
	'/map':			RequestMap,
});
