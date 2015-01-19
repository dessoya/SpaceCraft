'use strict'

var Class			= require('class')
  , coroutine		= require('coroutine')
  , crypto			= require('crypto')
  , fs				= require('fs')

var KeyChecker = module.exports = Class.inherit({

	onCreate: function(config) {
		this.config = config
	},

	check: coroutine.method(function*(keyChecker, name, key, g) {

	    // console.log('check ' + name + ' ' + key)

		var path = keyChecker.config.cachePath + '/' + crypto.createHash('md5').update(name).digest('hex')
		var exists = (yield fs.exists(path, g.resumeWithError))[0]

		// console.log('check exists ' + path + ' ' + exists)

		if(!exists) return true

		var ekey = '' + (yield fs.readFile(path, g.resume))

		var key = crypto.createHash('md5').update(key).digest('hex')

		return ekey !== key
	}),

	update: coroutine.method(function*(keyChecker, name, key, g) {

		var path = keyChecker.config.cachePath + '/' + crypto.createHash('md5').update(name).digest('hex')
		var key = crypto.createHash('md5').update(key).digest('hex')
		yield fs.writeFile(path, key, g.resume)

	})
	
})