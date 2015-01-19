'use strict'

var Class			= require('class')
  , coroutine		= require('coroutine')
  , fs				= require('fs')

var HTML = module.exports = require('./Base.js').inherit({

    type: 'json',

	gen_modify: coroutine(function*(resource, g) {
		var path = resource.getSourcePath()
		// console.log('readFile ' + path)
		var c = '' + (yield fs.readFile(path, g.resume))
		resource.json = JSON.parse(c)
	}),

	gen_destroy: coroutine(function*(resource, builds, g) {

	})

})