'use strict'

var cerber			= require('cerber')
  , http			= require('http')
  , Class			= require('class')
  , errors			= require('errors')
  , fs				= require('fs')
  , coroutine		= require('coroutine')
  , util			= require('util')
  , tcc				= require('tcc')

http.globalAgent.maxSockets = 200
errors.activateCatcher()
cerber.initService()

var Echo = Class.inherit({

    onCreate: function() {
    	this.events = { }
    },

    on: function(event, callback) {
    	if(!(event in this.events)) {
    		this.events[event] = []
    	}

    	this.events[event].push(callback)
    },

	echo: function(event, message) {

		if(event in this.events) {
			for(var i = 0, e = this.events[event], l = e.length; i < l; i++) {
				e[i](message)
			}
		}
	}

})

global.echoObject = Echo.create()
global.echo = function(event, message) {
	echoObject.echo(event, message)
}

var HTTPServer		= require('./HTTPServer.js')

var gen_init = coroutine(function*(g) {

	global.config = JSON.parse(yield fs.readFile(cerber.daemonPath + '/spacecraft.config.json', g.resume))
	global.config = global.config[process.env.SPACECRAFT_BRANCH ? process.env.SPACECRAFT_BRANCH : 'trunk']

	global.cc = tcc.create({ poolSize: 5, hosts: [ '192.168.88.101' ], keyspace: 'sc_2' })

	var dbentity = require('./DBEntity.js').create(cc)
	yield dbentity.checkMainStructures(g.resume)
	yield dbentity.loadModels(__dirname + '/models', g.resume)

	var from = null, limit = 30
	while(true) {

		var result

		if(null === from) {
			result = yield cc.query('select lock, session_uuid from auth_sessions limit ' + limit, g.resume)
		}
		else {
			result = yield cc.query('select lock, session_uuid from auth_sessions where token(session_uuid) > token( ' + from + ') limit ' + limit, g.resume)
		}

		if(result.rows.length < 1) {
			break
		}

		var uuids = []
		for(var i = 0, c = result.rows, l = c.length; i < l; i++) {
			var row = c[i]
			from = row.session_uuid
			if(row.lock === true) {
				uuids.push(row.session_uuid)
			}
		}
		if(uuids.length) {
			yield cc.query('update auth_sessions set lock = null where session_uuid in (' + uuids.join(',') + ')', g.resume)
		}
	}


	// console.log(util.inspect(models,{depth:null}))
	global.httpserver = HTTPServer.create(config.httpserver)	
})

gen_init(function(err, result) {
	if(err) {
		console.showError(err)
		process.exit()
	}
})
