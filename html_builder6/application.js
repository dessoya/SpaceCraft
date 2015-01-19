'use strict'

var cerber			= require('cerber')
  , http			= require('http')
  , errors			= require('errors')
  , fs				= require('fs')
  , Phoenix			= require('phoenix')
  , util			= require('util')
  , coroutine		= require('coroutine')


http.globalAgent.maxSockets = 200
errors.activateCatcher()
cerber.initService()


global.jsOptimizer = require('./JSOptimizer.js').create()
jsOptimizer.config({
	closureCompilerPath:		'/home/sc/html_builder/compiler.jar',
	cachePath:					'/tmp/jscache'
})

global.keyChecker = require('./KeyChecker.js').create({
	cachePath:					'/tmp/keycache'
})

coroutine(function*(g) {

	var project = require('./Project.js').create('/home/sc/hbe/source')
	yield project.init(g.resume)

    while(true) {

	    var t = process.hrtime()

		var cnt = yield project.processChanges(g.resume)
		// console.log(util.inspect(project,{depth:null}))

		if(cnt > 0) {
			yield project.updatePages(g.resume)

			var diff = process.hrtime(t)
			console.log('time ' +  ((diff[0] * 1e9 + diff[1])/1e9).toFixed(5))

			console.log(util.inspect(project,{depth:null}))
		}

		yield project.removeDepricated(g.resume)

		yield setTimeout(g.resume, 200)

	}

	console.log(util.inspect(project,{depth:null}))

})(function(err, result) {

	if(err) console.showError(err)

})

